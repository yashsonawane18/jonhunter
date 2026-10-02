"""
Job Engine - Consulting-Grade Candidate-Job Matching Engine (consulting_matcher.py)
Evaluates candidates across 4 key dimensions tailored for technology consulting,
strategy & operations, product advisory, and engineering consulting roles in India.
"""

import re
from typing import Dict, List, Tuple, Any, Optional

# Consulting & Leadership Competency Signatures
CONSULTING_COMPETENCY_TAXONOMY = {
    "Client Engagement & Advisory": [
        "client facing", "client management", "stakeholder management", "advisory", "consulting",
        "requirement gathering", "client engagement", "executive presentation", "workshop facilitation",
        "customer success", "relationship management"
    ],
    "Solution Architecture & Delivery": [
        "solution architecture", "system design", "technical architecture", "end-to-end delivery",
        "proof of concept", "poc", "mvp", "technology evaluation", "vendor evaluation", "rfp",
        "best practices", "scalability", "high availability"
    ],
    "Agile & Transformation Leadership": [
        "agile", "scrum", "scrum master", "sprint planning", "cross-functional leadership",
        "digital transformation", "change management", "mentoring", "team lead", "engineering management",
        "code review", "ci/cd enablement", "devops transformation"
    ],
    "Business & Analytical Problem Solving": [
        "business analysis", "roi analysis", "kpi tracking", "product roadmap", "user stories",
        "process optimization", "cost optimization", "risk assessment", "root cause analysis",
        "data-driven decision making", "metrics definition"
    ],
    "Communication & Governance": [
        "documentation", "confluence", "jira", "governance", "compliance", "sla management",
        "executive communication", "vendor management", "cross-cultural collaboration"
    ]
}

# Industry Domain Verticals
DOMAIN_VERTICALS = {
    "Banking, Financial Services & Insurance (BFSI)": [
        "fintech", "banking", "payments", "cards", "insurance", "trading", "wealth management",
        "lending", "kyc", "fraud detection", "pci-dss", "upi", "core banking"
    ],
    "E-Commerce, Retail & Quick Commerce": [
        "ecommerce", "e-commerce", "retail", "marketplace", "supply chain", "logistics",
        "inventory management", "cart", "checkout", "warehouse", "catalog", "order management"
    ],
    "Enterprise Cloud & SaaS": [
        "saas", "b2b", "multi-tenant", "cloud native", "microservices", "subscription",
        "enterprise software", "crm", "erp", "hrtech", "workflow automation"
    ],
    "Healthcare & Life Sciences": [
        "healthcare", "healthtech", "telemedicine", "ehr", "emr", "hipaa", "clinical",
        "pharma", "medical devices", "biotech"
    ],
    "AI / GenAI & Deep Tech": [
        "artificial intelligence", "genai", "llm", "rag", "machine learning", "deep learning",
        "computer vision", "nlp", "model serving", "data platform", "vector db"
    ]
}


def extract_consulting_competencies(text: str) -> List[Dict[str, Any]]:
    """
    Scans text for consulting & leadership competency signals across categories.
    """
    if not text:
        return []
    text_lower = text.lower()
    results = []

    for category, keywords in CONSULTING_COMPETENCY_TAXONOMY.items():
        matched_kws = [kw for kw in keywords if kw in text_lower]
        if matched_kws:
            results.append({
                "category": category,
                "matched_signals": matched_kws[:3],
                "strength": min(100, len(matched_kws) * 35)
            })
    return results


def calculate_consulting_ats_score(
    candidate: Any,
    job_title: str,
    job_description: str,
    job_experience_req: str = "",
    job_key_skills: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Convenience wrapper taking CandidateProfile or dict.
    """
    if hasattr(candidate, "top_skills"):
        skills = getattr(candidate, "top_skills", [])
        exp = float(getattr(candidate, "total_experience_years", 3.0) or 3.0)
        domain = getattr(candidate, "primary_domain", "") or ""
        roles = getattr(candidate, "target_roles", []) or []
        resume_text = getattr(candidate, "raw_resume_text", "") or ""
    elif isinstance(candidate, dict):
        skills = candidate.get("top_skills", [])
        exp = float(candidate.get("total_experience_years", 3.0) or 3.0)
        domain = candidate.get("primary_domain", "") or ""
        roles = candidate.get("target_roles", []) or []
        resume_text = candidate.get("raw_resume_text", "") or ""
    else:
        skills, exp, domain, roles, resume_text = [], 3.0, "", [], ""

    return calculate_consulting_match(
        candidate_skills=skills,
        candidate_experience_years=exp,
        candidate_domain=domain,
        candidate_target_roles=roles,
        candidate_resume_text=resume_text,
        job_title=job_title,
        job_description=job_description,
        job_experience_required=job_experience_req,
        job_key_skills=job_key_skills,
    )


def calculate_consulting_match(
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
    Calculates 4-Tier Consulting ATS Compatibility Score:
    1. Technical Stack & Core Skills (35% Weight)
    2. Consulting & Leadership Competencies (25% Weight)
    3. Experience & Seniority Curve (20% Weight)
    4. Industry & Domain Alignment (20% Weight)
    """
    jd_full = f"{job_title} {job_description}".lower()
    resume_full = f"{candidate_resume_text} {' '.join(candidate_skills)} {candidate_domain}".lower()

    # --- 1. Technical Stack Match (0 - 35 points) ---
    req_skills = list(job_key_skills) if job_key_skills else []
    if not req_skills:
        # Heuristic skill extraction
        for kw in ["python", "java", "react", "fastapi", "aws", "docker", "sql", "pyspark", "node", "typescript", "kubernetes"]:
            if kw in jd_full:
                req_skills.append(kw.capitalize())

    matched_tech = []
    missing_tech = []

    for s in (candidate_skills or []):
        s_lower = s.lower()
        if s_lower in jd_full:
            if s not in matched_tech:
                matched_tech.append(s)

    for s in req_skills:
        s_lower = s.lower()
        if s_lower in resume_full:
            if s not in matched_tech:
                matched_tech.append(s)
        else:
            if s not in missing_tech:
                missing_tech.append(s)

    tech_ratio = len(matched_tech) / max(len(req_skills), 1) if req_skills else 0.75
    tech_score = min(35, max(12, int(tech_ratio * 35)))

    # --- 2. Consulting & Leadership Competencies (0 - 25 points) ---
    cand_competencies = extract_consulting_competencies(resume_full)
    jd_competencies = extract_consulting_competencies(jd_full)

    matched_comp_categories = []
    for c in cand_competencies:
        for jc in jd_competencies:
            if c["category"] == jc["category"]:
                matched_comp_categories.append(c["category"])
                break

    if len(matched_comp_categories) >= 3:
        consulting_score = 25
    elif len(matched_comp_categories) >= 2:
        consulting_score = 20
    elif len(matched_comp_categories) >= 1:
        consulting_score = 15
    elif cand_competencies:
        consulting_score = 12
    else:
        consulting_score = 8

    # --- 3. Experience & Seniority Curve (0 - 20 points) ---
    # Parse experience requirement
    min_exp, max_exp = 2.0, 5.0
    range_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:yrs|years|yr)?", job_experience_required.lower())
    if range_match:
        min_exp, max_exp = float(range_match.group(1)), float(range_match.group(2))
    elif "senior" in job_title.lower() or "lead" in job_title.lower() or "architect" in job_title.lower():
        min_exp, max_exp = 4.0, 8.0

    cand_exp = candidate_experience_years or 3.0

    if min_exp <= cand_exp <= max_exp + 2.0:
        exp_score = 20
        exp_fit_text = f"Optimal Consulting Fit ({cand_exp:.1f} yrs matches {min_exp:.0f}-{max_exp:.0f} yrs target)"
    elif cand_exp < min_exp:
        diff = min_exp - cand_exp
        if diff <= 1.5:
            exp_score = 15
            exp_fit_text = f"Growth Consulting Candidate ({cand_exp:.1f} yrs vs {min_exp:.0f}+ yrs required)"
        else:
            exp_score = 9
            exp_fit_text = f"Experience Gap ({cand_exp:.1f} yrs vs {min_exp:.0f}+ yrs required)"
    else:
        exp_score = 18
        exp_fit_text = f"Senior / Principal Advisory Fit ({cand_exp:.1f} yrs exceeds {max_exp:.0f} yrs required)"

    # --- 4. Industry & Domain Alignment (0 - 20 points) ---
    domain_score = 10
    cand_domain_lower = (candidate_domain or "").lower()
    title_lower = job_title.lower()

    if cand_domain_lower and any(w in title_lower for w in cand_domain_lower.split() if len(w) > 3):
        domain_score += 8

    for role in (candidate_target_roles or []):
        if any(w in title_lower for w in role.lower().split() if len(w) > 3):
            domain_score += 5
            break

    # Domain vertical bonus
    for vert_name, vert_kws in DOMAIN_VERTICALS.items():
        if any(vk in resume_full for vk in vert_kws) and any(vk in jd_full for vk in vert_kws):
            domain_score += 4
            break

    domain_score = min(20, max(8, domain_score))

    # --- Total Score ---
    total_ats = min(98, max(42, tech_score + consulting_score + exp_score + domain_score))

    if total_ats >= 85:
        match_tier = "Top Consulting Tier (85%+)"
        match_badge = "Excellent Fit"
    elif total_ats >= 72:
        match_tier = "Strong Advisory Fit (72-84%)"
        match_badge = "Strong Fit"
    elif total_ats >= 58:
        match_tier = "Moderate Fit (58-71%)"
        match_badge = "Moderate Fit"
    else:
        match_tier = "Skill Gap Present (<58%)"
        match_badge = "Needs Review"

    # Actionable Consulting Recommendations
    recommendations = []
    if missing_tech:
        recommendations.append(f"Highlight proficiency in client tech stack: {', '.join(missing_tech[:3])}")
    if len(matched_comp_categories) < 2:
        recommendations.append("Emphasize client-facing deliverables, architecture decisions & stakeholder leadership in project descriptions.")
    if "senior" in job_title.lower() and cand_exp < 4.0:
        recommendations.append("Demonstrate end-to-end ownership and mentoring of junior engineers to bridge seniority requirements.")
    if not recommendations:
        recommendations.append("Exceptional consulting profile. Highly recommended for direct recruiter and client presentation.")

    return {
        "ats_score": total_ats,
        "match_badge": match_badge,
        "match_tier": match_tier,
        "matched_skills": matched_tech,
        "missing_skills": missing_tech[:6],
        "consulting_competencies": [c["category"] for c in cand_competencies],
        "experience_fit_text": exp_fit_text,
        "breakdown": {
            "tech_stack_score": tech_score,
            "tech_stack_max": 35,
            "consulting_leadership_score": consulting_score,
            "consulting_leadership_max": 25,
            "experience_score": exp_score,
            "experience_max": 20,
            "domain_score": domain_score,
            "domain_max": 20,
        },
        "recommendations": recommendations,
    }
