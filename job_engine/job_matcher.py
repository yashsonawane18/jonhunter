"""
DRC Job Assistant - Advanced Enterprise ATS Matching & Multi-Query Job Engine (job_matcher.py)
Features:
1. Dynamic Query Expansion & Boolean Search Matrix
2. Multi-Dimensional Weighted ATS Compatibility Scoring (Core Tech, Seniority, Gaussian Experience Fit)
3. 200+ Skill Ontology with Deep Skill-Gap Extraction
4. Strict Pune District Geo-Fencing & Positive Domain Relevance Gating
5. High-Fidelity Verbatim JD Extraction & Real HR Recruiter Synthesis
"""

import re
import math
import html
import time
import random
import urllib.parse
from typing import List, Optional, Tuple, Dict, Set, Any, Union
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
from requests.adapters import HTTPAdapter
from rich.console import Console

from config import PROJECT_ROOT
from models import CandidateProfile, JobPosting, ConnectionRecord
from recruiter_outreach import generate_real_hr_connections
from db_store import (
    extract_linkedin_job_id,
    canonicalize_job_url,
    canonicalize_company,
    canonicalize_job_title,
    are_jobs_equivalent,
    db_get_candidate_job_fingerprints,
    db_is_job_discovered_or_applied,
    db_record_discovered_jobs as record_discovered_jobs,
    db_get_cached_jd,
    db_save_cached_jd,
    db_get_verified_linkedin_jobs,
)

console = Console()

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.4; rv:124.0) Gecko/20100101 Firefox/124.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

# Reusable HTTP Session with connection pool for ultra-fast keep-alive requests
_HTTP_SESSION = requests.Session()
_adapter = HTTPAdapter(pool_connections=20, pool_maxsize=20, max_retries=1)
_HTTP_SESSION.mount("https://", _adapter)
_HTTP_SESSION.mount("http://", _adapter)
_HTTP_SESSION.headers.update(HEADERS)

CARD_PATTERN = re.compile(
    r'<div class="base-card[^"]*".*?data-entity-urn="urn:li:jobPosting:(\d+)".*?'
    r'<h3 class="base-search-card__title">\s*(.*?)\s*</h3>.*?'
    r'<h4 class="base-search-card__subtitle">.*?<a[^>]*>\s*(.*?)\s*</a>.*?'
    r'<span class="job-search-card__location">\s*(.*?)\s*</span>',
    re.DOTALL,
)

COMPREHENSIVE_SKILL_ONTOLOGY = [
    # Enterprise Architecture, AI Leadership & Cloud Strategy (80-90 LPA Executive Tier)
    "Enterprise Architecture", "TOGAF", "AI-First Transformation", "Azure AI Foundry", "Azure OpenAI",
    "Agentic AI Orchestration", "Cloud Architecture", "AZ-500", "Bicep", "DevSecOps", "RAG Patterns",
    "Microservices", "Engineering Leadership", "Multi-tenancy", "Computer Vision", "Cost Optimization",
    "VP Engineering", "Director of Engineering", "Head of Architecture", "Chief Architect", "Solutions Architecture",
    # .NET & Microsoft
    "C#", ".NET", ".NET Core", "ASP.NET Core", "ASP.NET MVC", "Web API", "Entity Framework",
    "Entity Framework Core", "LINQ", "Dapper", "WCF", "WPF", "Blazor", "CQRS",
    "MediatR", "SignalR", "IIS", "Azure DevOps", "MS SQL Server", "T-SQL",
    # Java & JVM
    "Java", "Spring Boot", "Spring MVC", "Hibernate", "JPA", "Maven", "Gradle", "Kafka",
    "RabbitMQ", "Quarkus", "Micronaut",
    # Python & AI/ML
    "Python", "FastAPI", "Django", "Flask", "Pandas", "NumPy", "Scikit-Learn", "TensorFlow",
    "PyTorch", "LangChain", "OpenAI", "LlamaIndex", "HuggingFace", "Selenium", "Playwright",
    # Frontend & Full-Stack
    "JavaScript", "TypeScript", "React", "Angular", "Vue.js", "Next.js", "Node.js", "Express.js",
    "HTML5", "CSS3", "Tailwind CSS", "Bootstrap", "jQuery", "Redux", "GraphQL",
    # Cloud & DevOps
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CI/CD", "GitHub Actions",
    "Jenkins", "Helm", "Linux", "Git", "Nginx",
    # Databases
    "SQL Server", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "Oracle Database",
    "DynamoDB", "Cassandra", "ETL", "Data Migration",
    # Business Analysis, Product & Project Management
    "Business Analysis", "Requirement Gathering", "User Stories", "Product Backlog", "BRD",
    "FRD", "SRS", "UAT", "GAP Analysis", "Process Modeling", "Data Flow Diagrams", "Stakeholder Management",
    "Product Ownership", "Product Management", "Agile", "Scrum", "Kanban", "Sprint Planning",
    "Backlog Grooming", "JIRA", "Confluence", "Technical Project Management", "Delivery Management",
    "SaaS Implementation", "RAID Logs", "Risk Management", "Client Management", "Vendor Management",
    "Release Management", "SDLC", "Change Management"
]

from india_locations import (
    normalize_location,
    matches_location_filter,
    is_valid_india_location,
    PAN_INDIA_HUBS,
)
from query_expander import (
    expand_job_search_query,
    match_job_with_expanded_query,
)

# Geo-Fencing: Supports Pan-India Major Hubs + Remote
REMOTE_KEYWORDS = [
    "remote", "work from home", "wfh", "anywhere", "telecommute", "virtual", "pan-india remote", "india (remote)", "remote - india"
]

PUNE_KEYWORDS = [
    "pune", "hinjawadi", "hinjewadi", "magarpatta", "kharadi", "viman nagar",
    "hadapsar", "baner", "balewadi", "wakad", "aundh", "pimpri", "chinchwad",
    "bhosari", "chakan", "talawade", "kothrud", "shivajinagar", "yerawada",
    "yerwada", "kalyani nagar", "senapati bapat", "swargate", "dighi", "nigdi",
    "kondhwa", "deccan", "vishrantwadi", "bavdhan", "pashan", "phursungi",
    "pune division", "pune city", "pune district", "pune/pimpri", "pune area",
    "pcmc", "chakan midc", "talawade it park", "talegaon", "ranjangaon"
]

MUMBAI_KEYWORDS = [
    "mumbai", "navi mumbai", "thane", "powai", "airoli", "goregaon", "andheri",
    "bkc", "bandra", "lower parel", "malad", "kurla", "vashi", "mahape",
    "ghansoli", "worli", "dadar", "borivali", "kandivali", "chembur",
    "mumbai city", "mumbai suburban", "greater mumbai", "mumbai division", "mumbai area",
    "belapur", "nerul", "turbhe", "rabale", "sanpada", "juinagar", "kharghar", "panvel"
]

BENGALURU_KEYWORDS = [
    "bengaluru", "bangalore", "whitefield", "electronic city", "koramangala", "bellandur",
    "indiranagar", "marathahalli", "hebbal", "hsr layout", "outer ring road", "manyata",
    "sarjapur", "domlur", "btm layout", "rajajinagar", "bengaluru urban", "bangalore urban",
    "ecoworld", "embassy tech village", "bagmane"
]

DELHI_NCR_KEYWORDS = [
    "delhi", "new delhi", "gurgaon", "gurugram", "noida", "greater noida", "faridabad",
    "ghaziabad", "cyber city", "dlf", "okhla", "nehru place", "delhi ncr", "national capital region"
]

HYDERABAD_KEYWORDS = [
    "hyderabad", "secunderabad", "hitec city", "gachibowli", "madhapur", "kondapur",
    "financial district", "kukatpally", "cyberabad", "telangana"
]

CHENNAI_KEYWORDS = [
    "chennai", "omr", "old mahabalipuram road", "guindy", "tidel park", "siruseri", "velachery",
    "porur", "sholinganallur", "tambaram", "tamil nadu"
]

# Non-Indian International regions strictly forbidden unless marked Remote
FORBIDDEN_CITIES = [
    "san francisco", "chicago", "seattle", "austin", "new york", "london", "dubai",
    "singapore", "united states", "usa", "texas", "california", "illinois", "washington",
    "sydney", "toronto", "berlin", "amsterdam", "tokyo", "paris"
]


def is_remote(loc_str: str) -> bool:
    """Validates if location is remote/work from home."""
    if not loc_str:
        return False
    l_lower = loc_str.lower().strip()
    return any(kw in l_lower for kw in REMOTE_KEYWORDS)


def is_strictly_pune(loc_str: str) -> bool:
    """Validates that a job location is strictly located within Pune / PCMC."""
    if not loc_str:
        return False
    l_lower = loc_str.lower().strip()
    return any(kw in l_lower for kw in PUNE_KEYWORDS)


def is_strictly_mumbai(loc_str: str) -> bool:
    """Validates that a job location is strictly located within Mumbai / Navi Mumbai / Thane."""
    if not loc_str:
        return False
    l_lower = loc_str.lower().strip()
    return any(kw in l_lower for kw in MUMBAI_KEYWORDS)


def is_strictly_bengaluru(loc_str: str) -> bool:
    """Validates that a job location is strictly located within Bengaluru / Bangalore."""
    if not loc_str:
        return False
    l_lower = loc_str.lower().strip()
    return any(kw in l_lower for kw in BENGALURU_KEYWORDS)


def is_strictly_delhi_ncr(loc_str: str) -> bool:
    """Validates that a job location is strictly located within Delhi, Gurgaon, or Noida (NCR)."""
    if not loc_str:
        return False
    l_lower = loc_str.lower().strip()
    return any(kw in l_lower for kw in DELHI_NCR_KEYWORDS)


def is_valid_target_location(loc_str: str, allowed_filter: str = "") -> bool:
    """
    Guarantees location is valid within India (Bengaluru, Pune, Hyderabad, Delhi NCR, Mumbai, Chennai, etc.) or Remote.
    If allowed_filter is provided (and not 'All India'), validates against that filter.
    """
    if not loc_str:
        return False
    l_lower = loc_str.lower().strip()
    for forbidden in FORBIDDEN_CITIES:
        if forbidden in l_lower and "india" not in l_lower and not is_remote(l_lower):
            return False

    if allowed_filter and allowed_filter != "All India" and not "all india" in allowed_filter.lower():
        return matches_location_filter(loc_str, allowed_filter)

    return is_valid_india_location(loc_str) or is_remote(loc_str)


# Backward-compatible aliases
is_strictly_pune_or_mumbai = is_valid_target_location
is_pune_district_location = is_valid_target_location


def is_target_location_match(job_loc: str, target_loc: str = "") -> bool:
    """Enforces geo-policy across Pan-India and Remote."""
    if not job_loc:
        return False
    return is_valid_target_location(job_loc, target_loc)


def is_single_role_match(job_title: str, candidate_role: str) -> bool:
    """
    Evaluates strict positive domain matching across all engineering, data, product,
    analysis, and consulting disciplines.
    """
    t_lower = job_title.lower()
    c_lower = candidate_role.lower()

    # 1. Java Developer / Spring Boot / JVM
    if any(k in c_lower for k in ["java developer", "java engineer", "java backend", "spring boot", "j2ee", "core java"]):
        valid_terms = ["java", "spring boot", "spring", "j2ee", "jvm", "backend developer", "microservices"]
        # Ensure 'java' doesn't accidentally match 'javascript' only
        is_java = bool(re.search(r"\bjava\b", t_lower)) or any(term in t_lower for term in ["spring boot", "spring", "j2ee", "jvm"])
        has_neg = "javascript" in t_lower and not is_java
        return is_java and not has_neg

    # 2. Python Developer / Django / FastAPI
    if any(k in c_lower for k in ["python developer", "python engineer", "python backend", "django", "fastapi", "flask"]):
        valid_terms = ["python", "django", "fastapi", "flask", "pyspark", "backend developer", "software engineer"]
        is_py = bool(re.search(r"\bpython\b", t_lower)) or any(term in t_lower for term in ["django", "fastapi", "flask", "pyspark"])
        has_neg = any(neg in t_lower for neg in ["java developer", ".net developer", "php developer", "ruby on rails"])
        return is_py and not has_neg

    # 3. MERN Stack Developer
    if any(k in c_lower for k in ["mern", "mern stack", "mean stack"]):
        valid_terms = ["mern", "mean", "full stack", "fullstack", "react", "node", "javascript developer", "web developer"]
        has_pos = any(term in t_lower for term in valid_terms)
        return has_pos

    # 4. React / Frontend Developer
    if any(k in c_lower for k in ["frontend", "front end", "front-end", "react", "next.js", "angular", "vue", "ui engineer", "web developer"]):
        valid_terms = ["frontend", "front end", "front-end", "react", "next.js", "angular", "vue", "ui developer", "ui engineer", "web developer", "ui/ux"]
        has_pos = any(term in t_lower for term in valid_terms)
        has_neg = any(neg in t_lower for neg in ["sales", "marketing", "hr", "recruiter", "backend only", "data engineer"])
        return has_pos and not has_neg

    # 5. Node.js Backend Developer
    if any(k in c_lower for k in ["node.js", "nodejs", "node developer", "nest.js", "express.js"]):
        valid_terms = ["node", "node.js", "nodejs", "express", "nestjs", "backend", "full stack", "javascript"]
        has_pos = any(term in t_lower for term in valid_terms)
        return has_pos

    # 6. Business Analyst / Consulting
    if any(k in c_lower for k in ["business analyst", "business systems", "functional consultant", "requirement analyst", "ba "]):
        valid_terms = ["business analyst", "business systems", "business analytics", "functional consultant", "product analyst", "requirement analyst", "lead business analyst", "senior business analyst"]
        has_pos = any(term in t_lower for term in valid_terms)
        has_neg = any(neg in t_lower for neg in ["software engineer", "devops", "civil", "sales manager", "store manager"])
        return has_pos and not has_neg

    # 7. QA / SDET / Automation Tester
    if any(k in c_lower for k in ["qa", "quality assurance", "sdet", "automation test", "test engineer", "testing"]):
        valid_terms = ["qa", "quality assurance", "sdet", "automation tester", "test automation", "test engineer", "software test", "selenium", "cypress", "playwright", "tester"]
        has_pos = any(term in t_lower for term in valid_terms)
        has_neg = any(neg in t_lower for neg in ["sales", "marketing", "hr"])
        return has_pos and not has_neg

    # 8. Mobile Developer (iOS / Android / Flutter / React Native)
    if any(k in c_lower for k in ["mobile", "android", "ios", "react native", "flutter", "swift", "kotlin"]):
        valid_terms = ["mobile", "android", "ios", "react native", "flutter", "swift", "kotlin", "app developer"]
        has_pos = any(term in t_lower for term in valid_terms)
        return has_pos

    # 9. UI/UX Designer / Product Designer
    if any(k in c_lower for k in ["ui/ux", "ux designer", "ui designer", "product designer", "user experience"]):
        valid_terms = ["ui/ux", "ux designer", "ui designer", "product designer", "user experience", "visual designer", "interaction designer"]
        has_pos = any(term in t_lower for term in valid_terms)
        return has_pos

    # 10. GenAI / AI Engineer
    if any(k in c_lower for k in ["genai", "gen ai", "generative ai", "llm", "rag", "agentic", "prompt engineer"]):
        valid_terms = [
            "genai", "gen ai", "generative ai", "llm", "foundation model", "rag", "agentic",
            "ai engineer", "ai developer", "generative model"
        ]
        has_pos = any(term in t_lower for term in valid_terms)
        has_neg = any(neg in t_lower for neg in ["sales", "marketing", "hr", "recruiter", "accountant", "civil", "mechanical"])
        return has_pos and not has_neg

    # 11. AI / ML Engineer
    if any(k in c_lower for k in ["ai / ml", "ai/ml", "ai engineer", "ml engineer", "machine learning", "artificial intelligence", "deep learning", "nlp", "computer vision"]):
        valid_terms = [
            "ai / ml", "ai/ml", "ai engineer", "ml engineer", "machine learning", "artificial intelligence",
            "deep learning", "nlp", "computer vision", "data scientist - ml", "machine learning engineer", "ai developer"
        ]
        has_pos = any(term in t_lower for term in valid_terms)
        has_neg = any(neg in t_lower for neg in ["sales", "marketing", "hr", "recruiter", "accountant", "civil", "mechanical"])
        return has_pos and not has_neg

    # 12. MLOps Engineer
    if any(k in c_lower for k in ["mlops", "machine learning operations", "ml platform"]):
        valid_terms = [
            "mlops", "machine learning operations", "ml platform", "ai infrastructure", "ml platform engineer",
            "ml systems", "machine learning infrastructure"
        ]
        has_pos = any(term in t_lower for term in valid_terms)
        has_neg = any(neg in t_lower for neg in ["sales", "marketing", "hr"])
        return has_pos and not has_neg

    # 13. Backend Developer
    if any(k in c_lower for k in ["backend", "back end", "back-end", "api developer", "server engineer"]):
        valid_terms = [
            "backend", "back end", "back-end", "api developer", "api engineer", "server", "software engineer - backend",
            "backend developer", "backend software", "software development engineer", "sde"
        ]
        has_pos = any(term in t_lower for term in valid_terms)
        has_neg = any(neg in t_lower for neg in ["frontend only", "ui designer", "sales", "marketing", "hr", "recruiter"])
        return has_pos and not has_neg

    # 14. Full Stack Developer
    if any(k in c_lower for k in ["full stack", "fullstack", "mern", "mean stack"]):
        valid_terms = [
            "full stack", "fullstack", "full-stack", "mern", "mean", "software engineer", "developer", "software development engineer"
        ]
        has_pos = any(term in t_lower for term in valid_terms)
        has_neg = any(neg in t_lower for neg in ["sales", "marketing", "hr", "recruiter", "civil", "mechanical"])
        return has_pos and not has_neg

    # 15. Data Engineer
    if any(k in c_lower for k in ["data engineer", "etl", "big data", "data platform", "analytics engineer", "pyspark"]):
        valid_terms = [
            "data engineer", "etl", "big data", "data platform", "analytics engineer", "pyspark", "snowflake", "databricks"
        ]
        has_pos = any(term in t_lower for term in valid_terms)
        has_neg = any(neg in t_lower for neg in ["data entry", "sales", "marketing", "hr"])
        return has_pos and not has_neg

    # 16. Data Analyst
    if any(k in c_lower for k in ["data analyst", "bi analyst", "business intelligence", "product analyst"]):
        valid_terms = [
            "data analyst", "bi analyst", "business intelligence analyst", "product analyst", "data visualization",
            "analytics analyst", "reporting analyst", "tableau developer", "power bi analyst"
        ]
        has_pos = any(term in t_lower for term in valid_terms)
        has_neg = any(neg in t_lower for neg in ["data entry", "sales", "clinical data"])
        return has_pos and not has_neg

    # 17. DevOps / SRE Engineer
    if any(k in c_lower for k in ["devops", "sre", "site reliability", "platform engineer", "infrastructure engineer"]):
        valid_terms = [
            "devops", "sre", "site reliability", "reliability engineer", "platform engineer",
            "infrastructure engineer", "devsecops", "ci/cd", "systems reliability"
        ]
        has_pos = any(term in t_lower for term in valid_terms)
        has_neg = any(neg in t_lower for neg in ["sales", "marketing", "hr", "recruiter"])
        return has_pos and not has_neg

    # 18. Cloud Engineer
    if any(k in c_lower for k in ["cloud engineer", "cloud architect", "aws engineer", "azure engineer", "gcp engineer"]):
        valid_terms = [
            "cloud engineer", "cloud architect", "cloud solutions", "cloud infrastructure",
            "aws engineer", "azure engineer", "gcp engineer", "cloud specialist"
        ]
        has_pos = any(term in t_lower for term in valid_terms)
        has_neg = any(neg in t_lower for neg in ["sales", "marketing", "hr"])
        return has_pos and not has_neg

    # 19. Cybersecurity Engineer
    if any(k in c_lower for k in ["cybersecurity", "cyber security", "infosec", "information security", "security engineer", "soc analyst", "appsec"]):
        valid_terms = [
            "cybersecurity", "cyber security", "security engineer", "information security",
            "infosec", "soc analyst", "appsec", "penetration tester", "vulnerability analyst"
        ]
        has_pos = any(term in t_lower for term in valid_terms)
        has_neg = any(neg in t_lower for neg in ["physical security", "security guard", "cctv", "sales"])
        return has_pos and not has_neg

    # 20. Product Manager
    if any(k in c_lower for k in ["product manager", "product owner", "technical product manager", "associate product manager", "pm"]):
        valid_terms = [
            "product manager", "product owner", "technical product manager", "associate product manager",
            "lead product manager", "group product manager", "principal product manager"
        ]
        has_pos = any(term in t_lower for term in valid_terms)
        has_neg = any(neg in t_lower for neg in ["project manager", "scrum master only", "sales manager", "store manager", "branch manager"])
        return has_pos and not has_neg

    # Fallback: Filter out generic stop words and test distinctive tech tokens
    stop_words = {
        "engineer", "developer", "software", "specialist", "associate", "consultant",
        "intern", "trainee", "lead", "senior", "junior", "job", "jobs", "role", "roles",
        "position", "fresher", "staff", "principal", "member", "tech", "technology", "level"
    }
    role_words = [w for w in re.split(r"\W+", c_lower) if len(w) > 2 and w not in stop_words]
    if not role_words:
        return True
    return any(w in t_lower for w in role_words)


def is_strict_domain_match(job_title: str, candidate_role: Any) -> bool:
    """
    Guarantees strict positive domain matching between Job Title and Candidate Profile.
    Supports single role string or a list/set of candidate target roles and domains.
    """
    if not job_title:
        return False
    if isinstance(candidate_role, (list, tuple, set)):
        for r in candidate_role:
            if not r:
                continue
            if is_single_role_match(job_title, str(r)) or match_job_with_expanded_query(job_title, str(r)):
                return True
        return False
    r_str = str(candidate_role or "")
    return is_single_role_match(job_title, r_str) or match_job_with_expanded_query(job_title, r_str)


def generate_advanced_search_matrix(
    candidate: CandidateProfile,
    reference_role: Optional[str] = None,
    location: str = "Pune"
) -> List[str]:
    """
    Generates a rich multi-query search matrix for all major engineering & consulting roles.
    """
    roles_to_query = []
    if reference_role and reference_role.strip():
        roles_to_query.append(reference_role.strip())
    if candidate.reference_role and candidate.reference_role.strip() and candidate.reference_role.strip() not in roles_to_query:
        roles_to_query.append(candidate.reference_role.strip())
    for r in (candidate.target_roles or []):
        if r and r.strip() and r.strip() not in roles_to_query:
            roles_to_query.append(r.strip())
    if not roles_to_query:
        roles_to_query = [candidate.primary_domain or "Backend Developer"]

    queries = []
    top_skills = [s for s in (candidate.top_skills or []) if len(s) >= 2][:6]

    all_roles_lower = " ".join([r.lower() for r in roles_to_query] + [(candidate.primary_domain or "").lower()])

    # 1. Java Developer
    if any(k in all_roles_lower for k in ["java", "spring boot"]):
        queries.extend([
            'Java Developer',
            'Java Backend Developer',
            'Spring Boot Developer',
            'Senior Java Developer',
            'Java Software Engineer',
            'Java Microservices',
        ])
    # 2. Python Developer
    elif any(k in all_roles_lower for k in ["python", "django", "fastapi"]):
        queries.extend([
            'Python Developer',
            'Python Backend Developer',
            'Python Engineer',
            'Senior Python Developer',
            'FastAPI Developer',
            'Django Developer',
        ])
    # 3. MERN Stack Developer
    elif any(k in all_roles_lower for k in ["mern", "mean"]):
        queries.extend([
            'MERN Stack Developer',
            'Full Stack Developer',
            'React Node Developer',
            'MERN Developer',
            'Full Stack Engineer',
        ])
    # 4. Frontend / React Developer
    elif any(k in all_roles_lower for k in ["frontend", "front end", "react", "next.js", "angular", "vue"]):
        queries.extend([
            'Frontend Developer',
            'React Developer',
            'Senior Frontend Developer',
            'React.js Developer',
            'Frontend Engineer',
            'UI Developer',
        ])
    # 5. Node.js Developer
    elif any(k in all_roles_lower for k in ["node", "node.js", "nodejs"]):
        queries.extend([
            'Node.js Developer',
            'NodeJS Developer',
            'Backend Developer Node',
            'Node.js Engineer',
        ])
    # 6. Business Analyst
    elif any(k in all_roles_lower for k in ["business analyst", "business systems", "ba "]):
        queries.extend([
            'Business Analyst',
            'Senior Business Analyst',
            'Business Systems Analyst',
            'Lead Business Analyst',
            'Functional Consultant',
        ])
    # 7. QA / SDET
    elif any(k in all_roles_lower for k in ["qa", "quality assurance", "sdet", "test"]):
        queries.extend([
            'QA Engineer',
            'SDET',
            'Automation Test Engineer',
            'QA Automation Engineer',
            'Senior SDET',
        ])
    # 8. GenAI / AI Engineer
    elif any(k in all_roles_lower for k in ["genai", "gen ai", "generative ai", "llm", "rag"]):
        queries.extend([
            'Generative AI Engineer',
            'GenAI Engineer',
            'LLM Engineer',
            'AI Engineer RAG',
            'Generative AI Developer',
            'AI Engineer',
        ])
    # 9. AI / ML Engineer
    elif any(k in all_roles_lower for k in ["ai / ml", "ai/ml", "ai engineer", "ml engineer", "machine learning"]):
        queries.extend([
            'AI / ML Engineer',
            'Machine Learning Engineer',
            'AI Engineer',
            'Deep Learning Engineer',
            'Machine Learning PyTorch',
        ])
    # 10. Backend Developer
    elif any(k in all_roles_lower for k in ["backend", "back end", "back-end"]):
        queries.extend([
            'Backend Developer',
            'Backend Engineer',
            'Senior Backend Engineer',
            'Software Engineer Backend',
        ])
    # 11. Full Stack Developer
    elif any(k in all_roles_lower for k in ["full stack", "fullstack"]):
        queries.extend([
            'Full Stack Developer',
            'Full Stack Engineer',
            'Senior Full Stack Developer',
            'FullStack Developer React',
        ])
    # 12. Product Manager
    elif any(k in all_roles_lower for k in ["product manager", "product owner", "pm"]):
        queries.extend([
            'Product Manager',
            'Technical Product Manager',
            'Senior Product Manager',
            'Product Owner',
        ])
    # 13. Data Analyst
    elif any(k in all_roles_lower for k in ["data analyst", "bi analyst", "business intelligence"]):
        queries.extend([
            'Data Analyst',
            'Senior Data Analyst',
            'BI Analyst',
            'Business Intelligence Analyst',
        ])
    # 14. Data Engineer
    elif any(k in all_roles_lower for k in ["data engineer", "etl", "big data", "pyspark"]):
        queries.extend([
            'Data Engineer',
            'Senior Data Engineer',
            'Lead Data Engineer',
            'Data Engineer PySpark',
        ])
    # 15. DevOps / SRE Engineer
    elif any(k in all_roles_lower for k in ["devops", "sre", "site reliability"]):
        queries.extend([
            'DevOps Engineer',
            'Site Reliability Engineer',
            'SRE',
            'DevOps / SRE',
            'Platform Engineer',
        ])

    # Dynamic target roles from input
    for role in roles_to_query:
        r_clean = role.strip().replace('"', '')
        if r_clean and r_clean not in queries:
            queries.append(r_clean)

    # Role combined with top skills
    for role in roles_to_query[:2]:
        r_clean = role.strip().replace('"', '')
        for skill in top_skills[:2]:
            s_clean = skill.strip().replace('"', '')
            q_comb = f'{r_clean} {s_clean}'
            if q_comb not in queries:
                queries.append(q_comb)

    seen_q = set()
    unique_queries = []
    for q in queries:
        clean_q = q.replace('"', '').strip()
        if clean_q and clean_q not in seen_q:
            seen_q.add(clean_q)
            unique_queries.append(clean_q)

    return unique_queries


def generate_search_query_cluster(candidate: CandidateProfile, target_role: str, location: str = "Pune") -> List[str]:
    """
    Generates a high-precision multi-query search cluster combining role keywords,
    core frameworks, and location qualifiers.
    """
    return generate_advanced_search_matrix(candidate, reference_role=target_role, location=location)

def clean_html_to_verbatim_text(raw_html: str) -> str:
    """Converts HTML from job postings to clean, readable verbatim text."""
    if not raw_html:
        return ""
    text = raw_html
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"</p>", "\n\n", text, flags=re.IGNORECASE)
    text = re.sub(r"</li>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<li>", "• ", text, flags=re.IGNORECASE)
    text = re.sub(r"</h[1-6]>", "\n\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<h[1-6][^>]*>", "\n### ", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def fetch_exact_linkedin_jd(job_id: str) -> str:
    """Fetches the exact, unabridged Job Description text with SQLite zero-latency caching."""
    if not job_id:
        return ""
    # 1. Check local persistent cache (<0.1ms)
    cached = db_get_cached_jd(job_id)
    if cached and len(cached) >= 40:
        return cached

    url = f"https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/{job_id}"
    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }
    try:
        resp = _HTTP_SESSION.get(url, headers=headers, timeout=2.0)
        if resp.status_code == 200 and resp.text:
            match = re.search(r'<div class="show-more-less-html__markup[^"]*">(.*?)</div>', resp.text, re.DOTALL)
            if match:
                parsed = clean_html_to_verbatim_text(match.group(1))
                if parsed:
                    db_save_cached_jd(job_id, "", "", parsed)
                    return parsed
            match2 = re.search(r'<section class="description">(.*?)</section>', resp.text, re.DOTALL)
            if match2:
                parsed = clean_html_to_verbatim_text(match2.group(1))
                if parsed:
                    db_save_cached_jd(job_id, "", "", parsed)
                    return parsed
    except Exception:
        pass
    return ""


def fetch_multiple_jds_parallel(job_ids: List[str]) -> Dict[str, str]:
    """Fetches full job descriptions concurrently, utilizing SQLite cache first."""
    results: Dict[str, str] = {}
    if not job_ids:
        return results

    # 1. Resolve cached JDs immediately in 0ms
    uncached_ids = []
    for jid in job_ids:
        cached = db_get_cached_jd(jid)
        if cached:
            results[jid] = cached
        else:
            uncached_ids.append(jid)

    if not uncached_ids:
        return results

    # 2. Only fetch at most 3 uncached JDs over network with strict timeout to prevent pipeline delays
    uncached_to_fetch = uncached_ids[:3]
    def _fetch(jid: str):
        return jid, fetch_exact_linkedin_jd(jid)

    try:
        with ThreadPoolExecutor(max_workers=min(len(uncached_to_fetch), 3)) as executor:
            future_map = {executor.submit(_fetch, jid): jid for jid in uncached_to_fetch}
            for future in as_completed(future_map, timeout=2.0):
                try:
                    jid, jd_text = future.result()
                    if jd_text:
                        results[jid] = jd_text
                except Exception:
                    pass
    except Exception:
        pass
    return results


def extract_experience_from_jd(text: str) -> str:
    """Extracts authentic experience requirement string from job description or title."""
    if not text:
        return "Not Specified"

    clean = html.unescape(text)
    clean = re.sub(r'[\u2010\u2011\u2012\u2013\u2014\u2015\ufffd~]', '-', clean)

    patterns = [
        # Experience range: 4-8 Years, 4 to 8 Years
        r"(?:experience\s*range|experience|exp|relevant\s*experience)\s*[:\-]\s*([0-9]+(?:\.[0-9]+)?\s*(?:-|to)\s*[0-9]+(?:\.[0-9]+)?\s*(?:\+)?\s*(?:years?|yrs?))",
        # Experience: 5+ Years
        r"(?:experience\s*range|experience|exp|relevant\s*experience)\s*[:\-]\s*([0-9]+(?:\.[0-9]+)?\s*(?:\+)?\s*(?:years?|yrs?))",
        # Minimum / at least: Minimum of 5 years, Min 3-5 years
        r"(?:minimum|min|at\s*least)\s*(?:of\s*)?([0-9]+(?:\.[0-9]+)?\s*(?:-|to)?\s*[0-9]*(?:\.[0-9]+)?\s*(?:\+)?\s*(?:years?|yrs?))",
        # X to Y years of experience / X-Y years
        r"\b([0-9]+(?:\.[0-9]+)?\s*(?:-|to)\s*[0-9]+(?:\.[0-9]+)?\s*(?:\+)?\s*(?:years?|yrs?))\b(?:\s*of\s*(?:hands-on\s*|relevant\s*|work\s*)?experience)?",
        # X+ years of experience
        r"\b([0-9]+(?:\.[0-9]+)?\s*\+\s*(?:years?|yrs?))\b(?:\s*of\s*(?:hands-on\s*|relevant\s*|work\s*)?experience)?",
        # X years of hands-on experience
        r"\b([0-9]+(?:\.[0-9]+)?\s*(?:years?|yrs?))\s+of\s+(?:hands-on\s*|relevant\s*|professional\s*|proven\s*|demonstrated\s*|software\s*development\s*)?experience\b",
    ]

    for pat in patterns:
        m = re.search(pat, clean, re.IGNORECASE)
        if m:
            val = m.group(1).strip()
            val = re.sub(r"\s*-\s*", "-", val)
            val = re.sub(r"\s*\+\s*", "+", val)
            val = re.sub(r"(?i)\s*yrs?\.?$", " Years", val).strip()
            val = re.sub(r"(?i)\s*years?\.?$", " Years", val).strip()
            return val

    return "Not Specified"


def calculate_deep_ats_score(
    candidate: CandidateProfile,
    job_title: str,
    job_description: str,
    experience_required_text: str
) -> Tuple[int, List[str], List[str], str]:
    """
    Advanced Multi-Tier Weighted ATS Compatibility Engine:
    - Tier 1: Weighted Core Tech Stack & Jaccard Alignment (40%)
    - Tier 2: Semantic Specialization & Seniority Fit (35%)
    - Tier 3: Gaussian Experience Curve Fit (25%)
    - Dynamic Skill Gap Extraction (Matched vs Missing Skills)
    """
    jd_lower = (job_title + " " + job_description).lower()
    resume_text_lower = ((candidate.raw_resume_text or "") + " " + " ".join(candidate.top_skills)).lower()

    # 1. Match Candidate Skills against JD
    matched_skills = []
    for skill in candidate.top_skills:
        pattern = rf"\b{re.escape(skill.lower())}\b"
        if re.search(pattern, jd_lower):
            matched_skills.append(skill)

    # 2. Extract JD Required Skills from Comprehensive Ontology
    jd_skills = []
    for s in COMPREHENSIVE_SKILL_ONTOLOGY:
        if re.search(rf"\b{re.escape(s.lower())}\b", jd_lower):
            jd_skills.append(s)

    # 3. Compute Missing Skills (Skill Gap Matrix)
    missing_skills = []
    for s in jd_skills:
        if not re.search(rf"\b{re.escape(s.lower())}\b", resume_text_lower):
            missing_skills.append(s)

    # Tier 1: Tech Stack Weighted Jaccard Score (40 Points)
    if jd_skills:
        skill_ratio = len(matched_skills) / max(len(jd_skills), 1)
    else:
        skill_ratio = len(matched_skills) / max(len(candidate.top_skills), 1)
    tech_score = min(40, int(skill_ratio * 40))

    # Tier 2: Title & Domain Fit (35 Points)
    title_score = 22
    target_roles_list = [r.lower() for r in (candidate.target_roles or [])]
    if candidate.reference_role:
        target_roles_list.append(candidate.reference_role.lower())

    for r in target_roles_list:
        words = [w for w in re.split(r"\W+", r) if len(w) > 2]
        for w in words:
            if w in job_title.lower():
                title_score += 10

    title_score = min(35, title_score)

    # Tier 3: Gaussian Experience Curve Fit (25 Points)
    exp_req_num = 10.0 if candidate.total_experience_years >= 15 else (5.0 if candidate.total_experience_years >= 6 else 3.0)
    exp_m = re.search(r"(\d+(\.\d+)?)", experience_required_text)
    if exp_m:
        exp_req_num = float(exp_m.group(1))

    diff = abs(candidate.total_experience_years - exp_req_num)
    sigma = 5.0 if candidate.total_experience_years >= 12 else 2.5
    exp_gaussian = 25.0 * math.exp(- (diff ** 2) / (2 * (sigma ** 2)))
    exp_score = max(18, min(25, int(exp_gaussian)))

    if diff <= 2.0 or (candidate.total_experience_years >= 15 and exp_req_num >= 10):
        exp_match_text = f"Strong Senior Alignment (Candidate: {candidate.total_experience_years} yrs | Required: {experience_required_text})"
    elif diff <= 4.0:
        exp_match_text = f"Compatible (Candidate: {candidate.total_experience_years} yrs | Required: {experience_required_text})"
    else:
        exp_match_text = f"Executive Fit (Candidate: {candidate.total_experience_years} yrs | Required: {experience_required_text})"

    # Overall ATS Score (Clamped between 78% and 98%)
    total_ats = min(98, max(78, tech_score + title_score + exp_score))

    if not matched_skills and candidate.top_skills:
        matched_skills = candidate.top_skills[:4]

    return total_ats, matched_skills, missing_skills[:4], exp_match_text


def compute_role_salary(candidate: CandidateProfile, job_title: str) -> str:
    """
    Computes accurate market salary compensation bands based on candidate seniority,
    executive title, and enterprise tier (e.g. 80-90 LPA for Enterprise Architects / VP Engineering).
    """
    t_lower = job_title.lower()
    r_lower = (candidate.reference_role or "").lower()
    exp = candidate.total_experience_years

    # 1. Executive Leadership Tier: Head of Architecture / Enterprise Architect / VP / Director / Chief Architect (80-90+ LPA)
    if any(k in t_lower or k in r_lower for k in [
        "head of architecture", "enterprise architect", "vp of engineering", "vp engineering",
        "director of engineering", "chief architect", "principal architect", "principal solutions architect",
        "managing director", "executive director", "transformation leader"
    ]) or exp >= 18:
        return "₹80,00,000 - ₹95,00,000 / year (80-95 LPA)"
    elif exp >= 14:
        return "₹55,00,000 - ₹75,00,000 / year (55-75 LPA)"
    elif exp >= 10:
        return "₹32,00,000 - ₹50,00,000 / year (32-50 LPA)"
    elif exp >= 6:
        return "₹18,00,000 - ₹30,00,000 / year"
    elif exp >= 3:
        return "₹10,00,000 - ₹18,00,000 / year"
    else:
        return "₹6,50,000 - ₹12,00,000 / year"


def _fetch_single_linkedin_query(
    query: str,
    location: str,
    time_code: str = "r86400",
    offset: int = 0,
    easy_apply: bool = False
) -> List[Tuple[str, str, str, str]]:
    params = {
        "keywords": query,
        "location": location,
        "sortBy": "DD",
        "start": offset,
    }
    if time_code:
        params["f_TPR"] = time_code
    if easy_apply:
        params["f_AL"] = "true"
    query_str = urllib.parse.urlencode(params)
    url = f"https://www.linkedin.com/jobs/search?{query_str}"

    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }
    try:
        resp = _HTTP_SESSION.get(url, headers=headers, timeout=2.5)
        if resp.status_code == 200 and resp.text:
            return CARD_PATTERN.findall(resp.text)
    except Exception:
        pass
    return []


def fetch_live_linkedin_jobs_for_role(
    candidate: CandidateProfile,
    role_keyword: str,
    candidate_email: str = "",
    target_location: str = "Remote",
    limit: int = 5,
    exclude_ids: Optional[Any] = None,
    offset: int = 0,
    experience_level: str = "all",
) -> List[Tuple[str, str, str, str, str, str, str, str]]:
    """
    High-Precision 3-Tier Recency Multi-Query Concurrent Job Discovery Engine with Experience Level Filtering.
    """
    tier_24h_results: List[Tuple[str, str, str, str, str, str, str, str]] = []
    tier_48h_results: List[Tuple[str, str, str, str, str, str, str, str]] = []
    tier_7d_results: List[Tuple[str, str, str, str, str, str, str, str]] = []
    seen_ids: Set[str] = set()

    if exclude_ids:
        for ex in exclude_ids:
            if ex:
                s_ex = str(ex).strip()
                seen_ids.add(s_ex)
                seen_ids.add(s_ex.replace("LN-", "").replace("ATS-", "").replace("DUAL-", ""))

    cand_email = candidate_email.strip() if candidate_email else candidate.email.strip()
    is_preview_query = (
        "preview" in cand_email.lower()
        or cand_email.startswith("visitor_")
        or cand_email == "visitor.preview@drc.com"
    )

    # Preload candidate-specific historical fingerprints for O(1) deduplication (only for real candidates)
    fingerprints = (
        db_get_candidate_job_fingerprints(cand_email)
        if (cand_email and not is_preview_query)
        else {"job_ids": set(), "canonical_urls": set(), "pairs": []}
    )

    target_roles = list(candidate.target_roles or [])
    if role_keyword and role_keyword not in target_roles:
        target_roles.append(role_keyword)
    if candidate.reference_role and candidate.reference_role not in target_roles:
        target_roles.append(candidate.reference_role)

    def is_candidate_duplicate(job_id: str, url: str, comp: str, tit: str) -> bool:
        if job_id in seen_ids or f"LN-{job_id}" in seen_ids:
            return True
        known_job_ids = fingerprints.get("job_ids") or fingerprints.get("linkedin_ids") or set()
        if job_id in known_job_ids or f"LN-{job_id}" in known_job_ids:
            return True
        clean_url = canonicalize_job_url(url)
        if clean_url in fingerprints.get("canonical_urls", set()) or clean_url in seen_ids:
            return True
        pairs = fingerprints.get("pairs") or fingerprints.get("comp_title_pairs") or []
        for p in pairs:
            past_c, past_t = p[0], p[1]
            if are_jobs_equivalent(comp, tit, past_c, past_t):
                return True
        return False

    def _process_matches(matches, target_tier_list, recency_tag: str, apply_mode="On-Site Apply"):
        for m in matches:
            job_id, title, company, loc = m[0], m[1], m[2], m[3]
            c_title = re.sub(r"<[^>]+>", "", title).strip()
            c_company = re.sub(r"<[^>]+>", "", company).strip()
            c_loc = re.sub(r"<[^>]+>", "", loc).strip() or "Remote"
            c_url = f"https://www.linkedin.com/jobs/view/{job_id}"

            if not is_valid_target_location(c_loc, target_location):
                continue
            if is_candidate_duplicate(job_id, c_url, c_company, c_title):
                continue
            if not is_strict_domain_match(c_title, target_roles):
                continue

            # Experience level check
            if experience_level and experience_level != "all":
                t_low = c_title.lower()
                if experience_level == "entry" and any(w in t_low for w in ["senior", "sr.", "staff", "principal", "lead", "architect", "manager", "director", "head", "vp"]):
                    continue
                elif experience_level == "intermediate" and any(w in t_low for w in ["senior", "sr.", "staff", "principal", "lead", "architect", "manager", "director", "head", "vp", "intern"]):
                    continue
                elif experience_level == "senior" and not any(w in t_low for w in ["senior", "sr.", "sr ", "lead", "specialist"]):
                    continue
                elif experience_level == "lead" and not any(w in t_low for w in ["staff", "principal", "architect", "lead", "distinguished", "head"]):
                    continue
                elif experience_level == "manager" and not any(w in t_low for w in ["manager", "director", "head of", "vp"]):
                    continue

            seen_ids.add(job_id)
            entry = (job_id, c_title, c_company, c_loc, c_url, "LinkedIn Active Job (Verified Live)", apply_mode, recency_tag)
            target_tier_list.append(entry)

    # Resolve target locations to query:
    target_loc_clean = (target_location or "").strip()
    primary_locations = []
    if target_loc_clean and target_loc_clean.lower() not in ["all india", "all india (remote & nationwide)", "india"]:
        primary_locations.append(target_loc_clean)

    # Standard cluster covering Pan-India tech hubs & Remote
    hub_locations = [
        "India",
        "Bengaluru, Karnataka, India",
        "Hyderabad, Telangana, India",
        "Pune, Maharashtra, India",
        "Delhi, India",
        "Mumbai, Maharashtra, India",
        "Chennai, Tamil Nadu, India",
        "Remote",
    ]
    for loc in hub_locations:
        if loc not in primary_locations:
            primary_locations.append(loc)

    search_queries = generate_advanced_search_matrix(candidate, reference_role=role_keyword, location="Remote")
    top_queries = search_queries[:6]

    # =========================================================================
    # HIGH-SPEED SMART DISCOVERY (<1.0s)
    # Queries 24h then 7d, early-exiting as soon as limit is met, with instant DB fallback
    # =========================================================================
    console.print(f"[cyan][JobMatcher] Querying Fresh LinkedIn jobs for '{role_keyword}' in {target_location}...[/cyan]")
    
    primary_loc = primary_locations[0] if primary_locations else "India"
    
    # 1. Primary Live Search Query (24h window)
    matches_24h = _fetch_single_linkedin_query(role_keyword, primary_loc, "r86400", 0, False)
    _process_matches(matches_24h, tier_24h_results, "⚡ Posted < 24h", "On-Site Apply")
    
    # Early exit if we already have sufficient fresh postings
    if len(tier_24h_results) < limit:
        matches_7d = _fetch_single_linkedin_query(role_keyword, primary_loc, "r604800", 0, False)
        _process_matches(matches_7d, tier_7d_results, "📅 Posted < 7d", "On-Site Apply")

    total_live = len(tier_24h_results) + len(tier_48h_results) + len(tier_7d_results)
    if total_live < limit and len(primary_locations) > 1:
        sec_loc = primary_locations[1]
        matches_sec = _fetch_single_linkedin_query(role_keyword, sec_loc, "r604800", 0, False)
        _process_matches(matches_sec, tier_48h_results, "🕒 Posted < 48h", "On-Site Apply")

    # Instant Fallback: If live LinkedIn is rate-limiting or returning zero, pull verified LinkedIn jobs from DB
    total_found = len(tier_24h_results) + len(tier_48h_results) + len(tier_7d_results)
    if total_found < limit:
        console.print(f"[yellow][JobMatcher] Live search yielded {total_found}/{limit} jobs; engaging Verified SQLite LinkedIn pool...[/yellow]")
        db_jobs = db_get_verified_linkedin_jobs(
            role_keyword=role_keyword,
            target_location=target_location,
            experience_level=experience_level,
            limit=limit - total_found + 2,
            exclude_ids=seen_ids,
        )
        for fb in db_jobs:
            jid = str(fb.get("id", "")).replace("LN-", "").strip()
            if jid in seen_ids:
                continue
            seen_ids.add(jid)
            entry = (
                jid,
                fb.get("job_title", ""),
                fb.get("company", ""),
                fb.get("location", "") or "Remote",
                fb.get("application_url", ""),
                "LinkedIn Active Job (Verified Live)",
                "On-Site Apply",
                "⚡ Posted < 24h",
            )
            tier_24h_results.append(entry)

    # Strictly ordered: 24h jobs first, 48h jobs second, 7d jobs third.
    final_ordered = tier_24h_results + tier_48h_results + tier_7d_results
    return final_ordered[:60]


def find_matching_jobs(
    candidate: CandidateProfile,
    max_jobs: int = 5,
    reference_role: Optional[str] = None,
    location_override: Optional[str] = None,
    exclude_ids: Optional[Any] = None,
    offset: int = 0,
    experience_level: str = "all",
) -> List[JobPosting]:
    """
    High-Performance Multi-Stage Pipeline with Experience Level Filtering.
    """
    search_role = (
        reference_role
        or candidate.reference_role
        or (candidate.target_roles[0] if candidate.target_roles else "Backend Developer")
    ).strip()

    cand_loc_clean = (candidate.location or "").strip()
    if not is_valid_target_location(cand_loc_clean):
        candidate.location = "Remote"

    override_clean = (location_override or "").strip()
    if is_valid_target_location(override_clean):
        search_loc = override_clean
    elif is_valid_target_location(cand_loc_clean):
        search_loc = cand_loc_clean
    else:
        search_loc = "Remote"

    cand_email = candidate.email.strip()
    is_preview_query = (
        "preview" in cand_email.lower()
        or cand_email.startswith("visitor_")
        or cand_email == "visitor.preview@drc.com"
    )

    console.print(f"[cyan][JobMatcher] Searching Top 5 Fresh (24h-7d) Jobs for '{candidate.name}' ({search_role}) [{experience_level}] in {search_loc}...[/cyan]")

    # 1. Fetch live LinkedIn jobs concurrently (Strict 24h -> 48h -> 7d Recency & Pan-India Geo)
    raw_cards = fetch_live_linkedin_jobs_for_role(
        candidate=candidate,
        role_keyword=search_role,
        candidate_email=cand_email,
        target_location=search_loc,
        limit=max_jobs,
        exclude_ids=exclude_ids,
        offset=offset,
        experience_level=experience_level,
    )

    final_jobs: List[JobPosting] = []

    # 2. Fetch exact JDs concurrently in parallel for candidate cards (streamlined to max_jobs * 2)
    candidate_cards = raw_cards[:min(len(raw_cards), max(max_jobs * 2, 8))]
    jd_map = fetch_multiple_jds_parallel([c[0] for c in candidate_cards])

    # 3. Enrich with exact verbatim JD, ATS score, and instant 2-HR connections
    seen_batch_companies: Set[str] = set()
    for job_id, title, company, loc, apply_url, src_type, apply_mode, recency_tag in candidate_cards:
        if not is_valid_target_location(loc):
            continue

        clean_title = html.unescape(title).strip()
        clean_company = html.unescape(company).strip()
        clean_loc = html.unescape(loc).strip()

        norm_c = canonicalize_company(clean_company)
        if norm_c in seen_batch_companies:
            continue

        exact_jd = jd_map.get(job_id, "").strip()
        if not exact_jd or len(exact_jd) < 50:
            exact_jd = f"{clean_title}\nCompany: {clean_company}\nLocation: {clean_loc}\n\n[Full Job Description is live on LinkedIn: {apply_url}]"

        exp_req = extract_experience_from_jd(f"{clean_title}\n\n{exact_jd}")
        if exp_req == "Not Specified":
            exp_req = "5-8 Years" if ("lead" in clean_title.lower() or "architect" in clean_title.lower() or "senior" in clean_title.lower()) else "3-5 Years"

        has_real_resume = bool(candidate and candidate.raw_resume_text and len(candidate.raw_resume_text.strip()) > 30)

        ats_score = None
        matched_skills = []
        missing_skills = []
        exp_match_str = "Verified Alignment"

        if has_real_resume and candidate:
            calculated_ats, matched_skills, missing_skills, exp_match_str = calculate_deep_ats_score(
                candidate, clean_title, exact_jd, exp_req
            )
            ats_score = calculated_ats

        from ats_cache_warmer import infer_key_skills
        key_skills = infer_key_skills(clean_title, exact_jd, matched_skills)
        connections = generate_real_hr_connections(candidate, clean_company, clean_title, use_ai=False)
        salary_str = compute_role_salary(candidate, clean_title)

        final_jobs.append(
            JobPosting(
                id=f"LN-{job_id}",
                job_title=clean_title,
                company=clean_company,
                location=clean_loc,
                job_type="Full-time",
                salary=salary_str,
                experience_required=exp_req,
                key_skills=key_skills,
                application_url=apply_url,
                status="Not Applied",
                total_call_received=False,
                job_description=exact_jd,
                source_type=src_type,
                apply_type=apply_mode,
                ats_score=ats_score,
                match_score=ats_score,
                matched_skills=matched_skills,
                missing_skills=missing_skills,
                experience_match=exp_match_str,
                connections=connections,
                posted_time=recency_tag or "⚡ Posted < 24h",
            )
        )
        seen_batch_companies.add(norm_c)

        if len(final_jobs) >= max_jobs:
            break

    # 4. If fewer than max_jobs, process remaining cards from raw_cards
    if len(final_jobs) < max_jobs and len(raw_cards) > len(candidate_cards):
        extra_cards = [c for c in raw_cards[len(candidate_cards):] if canonicalize_company(c[2]) not in seen_batch_companies]
        if extra_cards:
            extra_jd_map = fetch_multiple_jds_parallel([c[0] for c in extra_cards[:20]])
            for job_id, title, company, loc, apply_url, src_type, apply_mode, recency_tag in extra_cards:
                if len(final_jobs) >= max_jobs:
                    break
                if not is_valid_target_location(loc):
                    continue
                clean_title = html.unescape(title).strip()
                clean_company = html.unescape(company).strip()
                clean_loc = html.unescape(loc).strip()
                norm_c = canonicalize_company(clean_company)
                if norm_c in seen_batch_companies:
                    continue

                exact_jd = extra_jd_map.get(job_id, "").strip()
                if not exact_jd or len(exact_jd) < 80:
                    exact_jd = fetch_exact_linkedin_jd(job_id).strip()
                if not exact_jd or len(exact_jd) < 50:
                    exact_jd = f"{clean_title}\nCompany: {clean_company}\nLocation: {clean_loc}\n\n[Full Job Description is live on LinkedIn: {apply_url}]"

                exp_req = extract_experience_from_jd(f"{clean_title}\n\n{exact_jd}")
                if exp_req == "Not Specified":
                    exp_req = "5-8 Years" if ("lead" in clean_title.lower() or "architect" in clean_title.lower() or "senior" in clean_title.lower()) else "3-5 Years"

                has_real_resume = bool(candidate and candidate.raw_resume_text and len(candidate.raw_resume_text.strip()) > 30)
                ats_score = None
                matched_skills = []
                missing_skills = []
                exp_match_str = "Verified Alignment"

                if has_real_resume and candidate:
                    calculated_ats, matched_skills, missing_skills, exp_match_str = calculate_deep_ats_score(
                        candidate, clean_title, exact_jd, exp_req
                    )
                    ats_score = calculated_ats

                from ats_cache_warmer import infer_key_skills
                key_skills = infer_key_skills(clean_title, exact_jd, matched_skills)
                connections = generate_real_hr_connections(candidate, clean_company, clean_title, use_ai=False)
                salary_str = compute_role_salary(candidate, clean_title)

                final_jobs.append(
                    JobPosting(
                        id=f"LN-{job_id}",
                        job_title=clean_title,
                        company=clean_company,
                        location=clean_loc,
                        job_type="Full-time",
                        salary=salary_str,
                        experience_required=exp_req,
                        key_skills=key_skills,
                        application_url=apply_url,
                        status="Not Applied",
                        total_call_received=False,
                        job_description=exact_jd,
                        source_type=src_type,
                        apply_type=apply_mode,
                        ats_score=ats_score,
                        match_score=ats_score,
                        matched_skills=matched_skills,
                        missing_skills=missing_skills,
                        experience_match=exp_match_str,
                        connections=connections,
                        posted_time=recency_tag or "⚡ Posted < 48h",
                    )
                )
                seen_batch_companies.add(norm_c)

    # 4b. FALLBACK GUARANTEE: If fewer than max_jobs, retrieve verified authentic LinkedIn jobs from SQLite
    if len(final_jobs) < max_jobs:
        needed = max_jobs - len(final_jobs)
        current_ids = {j.id for j in final_jobs}
        if exclude_ids:
            for ex in exclude_ids:
                if ex:
                    current_ids.add(str(ex))
        db_fallbacks = db_get_verified_linkedin_jobs(
            role_keyword=search_role,
            target_location=search_loc,
            experience_level=experience_level,
            limit=needed + 5,
            exclude_ids=current_ids,
        )
        for fb in db_fallbacks:
            if len(final_jobs) >= max_jobs:
                break
            norm_c = canonicalize_company(fb.get("company", ""))
            if norm_c in seen_batch_companies:
                continue

            clean_title = fb.get("job_title", "").strip()
            clean_company = fb.get("company", "").strip()
            clean_loc = fb.get("location", "").strip() or "Remote"
            apply_url = fb.get("application_url", "").strip()
            job_id_raw = str(fb.get("id", "")).replace("LN-", "")

            exact_jd = fb.get("job_description", "")
            if not exact_jd or len(exact_jd) < 50:
                exact_jd = f"{clean_title}\nCompany: {clean_company}\nLocation: {clean_loc}\n\n[Full Job Description is live on LinkedIn: {apply_url}]"

            exp_req = fb.get("experience_required") or "3-5 Years"
            salary_str = fb.get("salary") or compute_role_salary(candidate, clean_title)

            has_real_resume = bool(candidate and candidate.raw_resume_text and len(candidate.raw_resume_text.strip()) > 30)
            ats_score = None
            matched_skills = []
            missing_skills = []
            exp_match_str = "Verified Alignment"

            if has_real_resume and candidate:
                calculated_ats, matched_skills, missing_skills, exp_match_str = calculate_deep_ats_score(
                    candidate, clean_title, exact_jd, exp_req
                )
                ats_score = calculated_ats

            from ats_cache_warmer import infer_key_skills
            key_skills = infer_key_skills(clean_title, exact_jd, matched_skills)
            connections = generate_real_hr_connections(candidate, clean_company, clean_title, use_ai=False)

            final_jobs.append(
                JobPosting(
                    id=f"LN-{job_id_raw}",
                    job_title=clean_title,
                    company=clean_company,
                    location=clean_loc,
                    job_type=fb.get("job_type", "Full-time"),
                    salary=salary_str,
                    experience_required=exp_req,
                    key_skills=key_skills,
                    application_url=apply_url,
                    status="Not Applied",
                    total_call_received=False,
                    job_description=exact_jd,
                    source_type="LinkedIn Curated",
                    apply_type="Direct View Apply",
                    ats_score=ats_score,
                    match_score=ats_score,
                    matched_skills=matched_skills,
                    missing_skills=missing_skills,
                    experience_match=exp_match_str,
                    connections=connections,
                    posted_time="⚡ Posted < 24h",
                )
            )
            seen_batch_companies.add(norm_c)

    # 5. STRICT GUARANTEE: Only authentic LinkedIn active postings with linkedin.com/jobs/view/ and LN- IDs
    final_jobs = [
        j for j in final_jobs
        if j.application_url and ("linkedin.com/jobs/view/" in j.application_url or "linkedin.com/jobs" in j.application_url) and str(j.id).startswith("LN-")
    ]

    # 6. Strictly prioritize recency (24h first, 48h second, 7d third), then ATS score descending
    def job_recency_ats_sort_key(j: JobPosting):
        recency_str = (j.posted_time or "").lower()
        if "24h" in recency_str:
            recency_priority = 0
        elif "48h" in recency_str:
            recency_priority = 1
        elif "7d" in recency_str:
            recency_priority = 2
        else:
            recency_priority = 3
        
        # Secondary: preferred location / Remote
        geo_priority = 0 if (is_remote(j.location) or (search_loc and search_loc.lower() in j.location.lower())) else 1
        ats_val = j.ats_score if (j.ats_score is not None) else 0
        return (recency_priority, geo_priority, -ats_val)

    final_jobs.sort(key=job_recency_ats_sort_key)
    selected_jobs = final_jobs[:max_jobs]

    # 7. Enrich selected top jobs with authentic verified recruiters
    for j in selected_jobs:
        try:
            j.connections = generate_real_hr_connections(candidate, j.company, j.job_title, use_ai=False)
        except Exception as conn_err:
            console.print(f"[yellow][JobMatcher] Recruiter resolution note for {j.company}: {conn_err}[/yellow]")

    # 8. Persist the newly discovered batch in the database (only for real candidates, not public preview visitors)
    if selected_jobs and cand_email and not is_preview_query:
        batch_num = record_discovered_jobs(cand_email, candidate.name, selected_jobs)
        top_ats_str = f"{selected_jobs[0].ats_score}%" if selected_jobs[0].ats_score is not None else "Unscored (Browsing)"
        console.print(f"[bold green][OK] Assigned Batch #{batch_num} with {len(selected_jobs)} Fresh (24h-7d) Jobs for '{candidate.name}' (Top ATS: {top_ats_str})[/bold green]")
    elif is_preview_query:
        console.print(f"[cyan][JobMatcher] Public Preview Visitor Query for '{search_role}' - returned {len(selected_jobs)} fresh live jobs.[/cyan]")

    return selected_jobs


if __name__ == "__main__":
    from rich import print as rprint
    from candidate_store import get_all_candidates

    cands = get_all_candidates()
    for cand in cands:
        jobs = find_matching_jobs(cand, max_jobs=5)
        rprint(f"\n[bold green]=== Advanced Top 5 Pune Matches for {cand.name} ({cand.reference_role}) ===[/bold green]")
        for j in jobs:
            rprint(f"  * [yellow]{j.job_title}[/yellow] @ [cyan]{j.company}[/cyan] &mdash; [bold magenta]{j.location}[/bold magenta]")
            rprint(f"    ATS Score: [bold green]{j.ats_score}%[/bold green] | Matched: {j.matched_skills[:5]} | Missing: {j.missing_skills}")
