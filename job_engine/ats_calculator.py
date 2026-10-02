"""
Job Engine - Real ATS Compatibility Scoring Engine (ats_calculator.py)
Computes realistic, accurate ATS compatibility scores, skill gap matrices,
and experience fit between a candidate's parsed resume and specific job descriptions.
"""

import re
import math
from typing import Dict, List, Tuple, Any, Optional

from models import CandidateProfile
from parser import ALL_KNOWN_SKILLS, DOMAIN_SIGNATURES


def extract_skills_from_text(text: str) -> List[str]:
    """Extracts known tech and soft skills from any text snippet."""
    if not text:
        return []
    text_lower = text.lower()
    found = []
    for skill in ALL_KNOWN_SKILLS:
        pattern = rf"\b{re.escape(skill.lower())}\b"
        if re.search(pattern, text_lower) and skill not in found:
            found.append(skill)
    return found


def parse_experience_requirement(exp_text: str) -> Tuple[float, float]:
    """
    Parses required experience range from text like '3-5 years', '5+ years', 'Fresher', '10 years'.
    Returns (min_years, max_years).
    """
    if not exp_text or not exp_text.strip():
        return (2.0, 5.0)

    text = exp_text.lower().strip()
    if "fresher" in text or "0 year" in text or "entry" in text:
        return (0.0, 1.0)

    range_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:yrs|years|yr)?", text)
    if range_match:
        return (float(range_match.group(1)), float(range_match.group(2)))

    plus_match = re.search(r"(\d+(?:\.\d+)?)\s*\+\s*(?:yrs|years|yr)?", text)
    if plus_match:
        min_val = float(plus_match.group(1))
        return (min_val, min_val + 3.0)

    single_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:yrs|years|yr)?", text)
    if single_match:
        val = float(single_match.group(1))
        return (val, val + 2.0)

    return (2.0, 5.0)


def calculate_ats_score(
    candidate_skills: List[str],
    candidate_experience_years: float,
    candidate_domain: str,
    candidate_target_roles: List[str],
    candidate_resume_text: str,
    job_title: str,
    job_description: str,
    job_experience_required: str = "",
    job_key_skills: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Comprehensive, Multi-Dimensional ATS Compatibility Calculator:
    
    1. Skill Match (45% Weight):
       - Evaluates candidate's skills against JD required skills and JD text.
       - Identifies matched skills and missing skill gaps.
    
    2. Title & Domain Relevance (35% Weight):
       - Evaluates candidate's primary domain and target roles against the Job Title.
    
    3. Experience & Seniority Curve (20% Weight):
       - Compares candidate's parsed years of experience against the Job's required range.
    
    Returns structured dict with:
      - ats_score (int): 0-100%
      - match_level (str): 'Excellent' (85%+), 'Good' (70-84%), 'Fair' (50-69%), 'Low' (<50%)
      - matched_skills (List[str])
      - missing_skills (List[str])
      - experience_fit_text (str)
      - breakdown (Dict)
      - recommendations (List[str])
    """
    jd_full_text = f"{job_title} {job_description}".lower()
    resume_full_text = f"{candidate_resume_text} {' '.join(candidate_skills)}".lower()

    # --- 1. Identify Job Required Skills ---
    required_jd_skills = list(job_key_skills) if job_key_skills else []
    extracted_from_jd = extract_skills_from_text(f"{job_title} {job_description}")
    for s in extracted_from_jd:
        if s not in required_jd_skills:
            required_jd_skills.append(s)

    if not required_jd_skills:
        # Fallback to candidate domain signature keywords
        required_jd_skills = ["Python", "SQL", "Git", "REST APIs", "Cloud"]

    # --- 2. Calculate Skill Match & Gaps ---
    matched_skills = []
    missing_skills = []

    # Check which candidate skills match the JD
    for s in candidate_skills:
        pattern = rf"\b{re.escape(s.lower())}\b"
        if re.search(pattern, jd_full_text):
            if s not in matched_skills:
                matched_skills.append(s)

    # Check which required JD skills are missing in candidate resume
    for s in required_jd_skills:
        pattern = rf"\b{re.escape(s.lower())}\b"
        if re.search(pattern, resume_full_text):
            if s not in matched_skills:
                matched_skills.append(s)
        else:
            if s not in missing_skills:
                missing_skills.append(s)

    # Skill Score (0 to 45 points)
    if required_jd_skills:
        matched_ratio = len(matched_skills) / max(len(required_jd_skills), 1)
        skill_score = min(45, int(matched_ratio * 45))
    else:
        skill_score = 30

    # --- 3. Title & Domain Alignment (0 to 35 points) ---
    title_score = 15
    title_lower = job_title.lower()

    # Check primary domain match
    if candidate_domain:
        domain_tokens = [w for w in re.split(r"\W+", candidate_domain.lower()) if len(w) > 2]
        if any(t in title_lower for t in domain_tokens):
            title_score += 12

    # Check target roles match
    for role in (candidate_target_roles or []):
        role_tokens = [w for w in re.split(r"\W+", role.lower()) if len(w) > 2]
        if any(t in title_lower for t in role_tokens):
            title_score += 8
            break

    title_score = min(35, max(10, title_score))

    # --- 4. Experience Curve Fit (0 to 20 points) ---
    min_exp, max_exp = parse_experience_requirement(job_experience_required)
    cand_exp = candidate_experience_years

    if min_exp <= cand_exp <= max_exp + 1.5:
        exp_score = 20
        exp_text = f"Optimal Alignment: {cand_exp:.1f} yrs experience matches {job_experience_required or f'{min_exp:.0f}-{max_exp:.0f} yrs'}"
    elif cand_exp < min_exp:
        deficit = min_exp - cand_exp
        if deficit <= 1.0:
            exp_score = 16
            exp_text = f"Close Experience Fit: {cand_exp:.1f} yrs (Target: {min_exp:.0f}+ yrs)"
        elif deficit <= 2.5:
            exp_score = 11
            exp_text = f"Growth Potential: {cand_exp:.1f} yrs (Requires {min_exp:.0f}+ yrs)"
        else:
            exp_score = 6
            exp_text = f"Experience Gap: {cand_exp:.1f} yrs vs {min_exp:.0f}+ yrs required"
    else:
        # Candidate has more experience
        surplus = cand_exp - max_exp
        if surplus <= 3.0:
            exp_score = 19
            exp_text = f"Senior Fit: {cand_exp:.1f} yrs matches required {min_exp:.0f}-{max_exp:.0f} yrs"
        else:
            exp_score = 17
            exp_text = f"Highly Experienced: {cand_exp:.1f} yrs (Position: {job_experience_required or f'{min_exp:.0f}-{max_exp:.0f} yrs'})"

    # --- 5. Overall ATS Score ---
    raw_total = skill_score + title_score + exp_score
    # Realistic clamping (never give arbitrary 95%+ unless skills match)
    total_ats = min(98, max(35, raw_total))

    # Determine Match Level
    if total_ats >= 85:
        match_level = "Excellent"
    elif total_ats >= 70:
        match_level = "Good"
    elif total_ats >= 55:
        match_level = "Fair"
    else:
        match_level = "Low"

    # Recommendations
    recommendations = []
    if missing_skills:
        top_missing = missing_skills[:3]
        recommendations.append(f"Add key skills to resume: {', '.join(top_missing)}")
    if total_ats < 80 and candidate_domain and candidate_domain.lower() not in title_lower:
        recommendations.append(f"Highlight '{candidate_domain}' projects in summary to match '{job_title}'")
    if not recommendations:
        recommendations.append("Strong profile alignment. High probability of passing recruiter ATS screen.")

    return {
        "ats_score": total_ats,
        "match_level": match_level,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills[:6],
        "experience_fit_text": exp_text,
        "breakdown": {
            "skill_score": skill_score,
            "skill_max": 45,
            "title_score": title_score,
            "title_max": 35,
            "experience_score": exp_score,
            "experience_max": 20,
        },
        "recommendations": recommendations,
    }
