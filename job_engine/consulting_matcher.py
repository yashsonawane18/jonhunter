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
    Calculates 4-Tier Consulting ATS Compatibility Score (0 - 100%):
    1. Technical Stack & Core Skills (40% Weight)
    2. Industry & Domain / Role Alignment (25% Weight)
    3. Experience & Seniority Curve (20% Weight)
    4. Consulting & Leadership Competencies (15% Weight)
    Enforces strict gating so unrelated roles (e.g. Sales/Support for Developers) score <40%,
    while high-match roles accurately score 75% - 98%.
    """
    title_lower = (job_title or "").lower()
    desc_lower = (job_description or "").lower()
    jd_full = f"{title_lower} {desc_lower}"
    resume_full = f"{candidate_resume_text or ''} {' '.join(candidate_skills or [])} {candidate_domain or ''}".lower()

    # Detect negative non-tech role mismatch if candidate is in technical domain
    is_cand_tech = any(
        kw in (candidate_domain or "").lower() or kw in " ".join(candidate_skills or []).lower() or kw in " ".join(candidate_target_roles or []).lower()
        for kw in ["developer", "engineer", "software", "react", "python", "java", "frontend", "backend", "full stack", "data", "cloud", "devops", "qa", "architect", "tech", "node", "ai"]
    )
    is_job_unrelated_non_tech = any(
        kw in title_lower for kw in [
            "sales manager", "account manager", "business development", "inside sales",
            "telecaller", "customer support", "art director", "graphic designer", "content reviewer",
            "compliance officer", "facilities manager", "recruiter", "talent acquisition partner"
        ]
    ) and not any(kw in title_lower for kw in ["software", "developer", "engineer", "architect", "technical", "engineering"])

    # --- 1. Technical Stack Match (0 - 40 points) ---
    req_skills = list(job_key_skills) if job_key_skills else []
    if not req_skills:
        # Heuristic skill extraction from title and JD
        KNOWN_TECH_VOCAB = [
            "Python", "Java", "React", "Next.js", "Node.js", "TypeScript", "JavaScript",
            "FastAPI", "Django", "Flask", "Spring Boot", "AWS", "Docker", "Kubernetes",
            "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "PySpark", "Spark",
            "Databricks", "Kafka", "GraphQL", "Tailwind CSS", "Angular", "Vue",
            "C#", ".NET", "Golang", "Go", "Terraform", "CI/CD", "Azure", "GCP",
            "GenAI", "LLM", "LangChain", "Selenium", "Cypress", "Automation", "SDET",
            "Business Analysis", "Product Management", "Scrum", "Agile"
        ]
        for kw in KNOWN_TECH_VOCAB:
            kw_low = kw.lower()
            if kw_low in title_lower or re.search(r'\b' + re.escape(kw_low) + r'\b', desc_lower):
                req_skills.append(kw)

    matched_tech = []
    missing_tech = []

    for s in (candidate_skills or []):
        s_lower = s.lower()
        if s_lower in title_lower or re.search(r'\b' + re.escape(s_lower) + r'\b', jd_full):
            if s not in matched_tech:
                matched_tech.append(s)

    for s in req_skills:
        s_lower = s.lower()
        if s_lower in resume_full or re.search(r'\b' + re.escape(s_lower) + r'\b', resume_full):
            if s not in matched_tech:
                matched_tech.append(s)
        else:
            if s not in missing_tech:
                missing_tech.append(s)

    num_matched = len(matched_tech)
    total_req = max(len(req_skills), 1)

    if num_matched == 0:
        tech_score = 0
    elif num_matched >= 5:
        tech_score = 40
    elif num_matched >= 3:
        tech_score = 32 + min(8, int((num_matched / total_req) * 8))
    elif num_matched >= 2:
        tech_score = 24 + min(8, int((num_matched / total_req) * 8))
    elif num_matched == 1:
        tech_score = 14
    else:
        tech_score = int((num_matched / total_req) * 40)

    # --- 2. Industry & Domain / Role Alignment (0 - 25 points) ---
    domain_score = 0
    cand_domain_lower = (candidate_domain or "").lower()

    # Title keyword match against candidate domain or target roles
    domain_words = [w for w in re.split(r'[\s/&,]+', cand_domain_lower) if len(w) >= 3 and w not in ("and", "the", "for", "with")]
    if domain_words and any(w in title_lower for w in domain_words):
        domain_score += 15

    for role in (candidate_target_roles or []):
        role_words = [w for w in re.split(r'[\s/&,]+', role.lower()) if len(w) >= 3 and w not in ("and", "the", "for", "with")]
        if role_words and any(w in title_lower for w in role_words):
            domain_score = max(domain_score, 18)
            break

    # Domain vertical alignment
    for vert_name, vert_kws in DOMAIN_VERTICALS.items():
        if any(vk in resume_full for vk in vert_kws) and any(vk in jd_full for vk in vert_kws):
            domain_score += 5
            break

    if is_cand_tech and is_job_unrelated_non_tech:
        domain_score = 0

    domain_score = min(25, domain_score)

    # --- 3. Experience & Seniority Curve (0 - 20 points) ---
    min_exp, max_exp = 2.0, 5.0
    range_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:yrs|years|yr)?", job_experience_required.lower())
    if range_match:
        min_exp, max_exp = float(range_match.group(1)), float(range_match.group(2))
    elif any(w in title_lower for w in ["lead", "principal", "architect", "staff", "director"]):
        min_exp, max_exp = 6.0, 12.0
    elif "senior" in title_lower or "sr" in title_lower:
        min_exp, max_exp = 4.0, 8.0
    elif any(w in title_lower for w in ["junior", "fresher", "intern", "associate", "entry"]):
        min_exp, max_exp = 0.0, 2.0

    cand_exp = float(candidate_experience_years or 3.0)

    if min_exp <= cand_exp <= max_exp + 2.0:
        exp_score = 20
        exp_fit_text = f"Optimal Consulting Fit ({cand_exp:.1f} yrs matches {min_exp:.0f}-{max_exp:.0f} yrs target)"
    elif cand_exp < min_exp:
        diff = min_exp - cand_exp
        if diff <= 1.5:
            exp_score = 14
            exp_fit_text = f"Growth Candidate ({cand_exp:.1f} yrs vs {min_exp:.0f}+ yrs required)"
        else:
            exp_score = 6
            exp_fit_text = f"Experience Gap ({cand_exp:.1f} yrs vs {min_exp:.0f}+ yrs required)"
    else:
        exp_score = 16
        exp_fit_text = f"Experienced Advisory Fit ({cand_exp:.1f} yrs exceeds {max_exp:.0f} yrs required)"

    # --- 4. Consulting & Leadership Competencies (0 - 15 points) ---
    cand_competencies = extract_consulting_competencies(resume_full)
    jd_competencies = extract_consulting_competencies(jd_full)

    matched_comp_categories = []
    for c in cand_competencies:
        for jc in jd_competencies:
            if c["category"] == jc["category"]:
                matched_comp_categories.append(c["category"])
                break

    if len(matched_comp_categories) >= 3:
        consulting_score = 15
    elif len(matched_comp_categories) >= 2:
        consulting_score = 12
    elif len(matched_comp_categories) >= 1:
        consulting_score = 8
    elif cand_competencies:
        consulting_score = 5
    else:
        consulting_score = 0

    # --- Strict Relevance Gating ---
    # If the job has 0 matched tech skills AND 0 domain overlap, cap total ATS score to max 30%
    if num_matched == 0 and domain_score <= 5:
        total_ats = min(32, tech_score + domain_score + exp_score // 3 + consulting_score // 3)
    elif is_cand_tech and is_job_unrelated_non_tech:
        total_ats = min(28, tech_score + domain_score)
    else:
        raw_total = tech_score + domain_score + exp_score + consulting_score
        # High match boost if multiple core skills + title match
        if num_matched >= 3 and domain_score >= 15:
            raw_total = max(raw_total, 85 + min(12, num_matched * 2))
        elif num_matched >= 2 and domain_score >= 12:
            raw_total = max(raw_total, 76 + min(10, num_matched * 3))
        elif num_matched >= 1 and domain_score >= 12:
            raw_total = max(raw_total, 68)

        total_ats = min(98, max(15, raw_total))

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

    recommendations = []
    if missing_tech:
        recommendations.append(f"Highlight proficiency in client tech stack: {', '.join(missing_tech[:3])}")
    if len(matched_comp_categories) < 2:
        recommendations.append("Emphasize client-facing deliverables, architecture decisions & stakeholder leadership in project descriptions.")
    if "senior" in title_lower and cand_exp < 4.0:
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
            "tech_stack_max": 40,
            "domain_score": domain_score,
            "domain_max": 25,
            "experience_score": exp_score,
            "experience_max": 20,
            "consulting_leadership_score": consulting_score,
            "consulting_leadership_max": 15,
        },
        "recommendations": recommendations,
    }
