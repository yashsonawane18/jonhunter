"""
Job Engine - Semantic Query Expander & Tech Taxonomy (query_expander.py)
Expands user search queries with tech synonyms, domain acronyms, and related frameworks
to guarantee comprehensive and strictly accurate job discovery across all engineering, data, product and consulting disciplines.
"""

import re
from typing import List, Set, Tuple, Dict, Optional, Any

ROLE_STOP_WORDS = {
    "engineer", "developer", "software", "specialist", "associate", "consultant",
    "intern", "trainee", "lead", "senior", "junior", "job", "jobs", "role", "roles",
    "position", "fresher", "staff", "principal", "member", "tech", "technology", "level"
}

TECH_SYNONYMS_MAP = {
    "mern": ["mern", "react", "node", "express", "mongodb", "full stack", "fullstack"],
    "mean": ["mean", "angular", "node", "express", "mongodb", "full stack"],
    "fullstack": ["fullstack", "full stack", "full-stack", "mern", "mean", "software engineer", "web developer", "react", "node"],
    "full stack": ["fullstack", "full stack", "full-stack", "mern", "mean", "software engineer", "web developer", "react", "node"],
    "frontend": ["frontend", "front-end", "front end", "react", "next.js", "angular", "vue", "typescript", "javascript", "ui engineer", "web developer"],
    "front-end": ["frontend", "front-end", "front end", "react", "next.js", "angular", "vue", "typescript", "javascript", "ui engineer"],
    "backend": ["backend", "back-end", "back end", "python", "java", "golang", "go", "node", "nodejs", "fastapi", "django", "spring", "microservices", "c#", ".net"],
    "back-end": ["backend", "back-end", "back end", "python", "java", "golang", "go", "node", "nodejs", "fastapi", "django", "spring", "microservices"],
    
    "python": ["python", "fastapi", "django", "flask", "pyspark", "backend python"],
    "java": ["java", "spring boot", "spring", "hibernate", "microservices", "j2ee", "jvm"],
    "react": ["react", "react.js", "reactjs", "next.js", "nextjs", "frontend react"],
    "angular": ["angular", "angularjs", "typescript", "frontend angular"],
    "vue": ["vue", "vue.js", "vuejs", "nuxt", "nuxt.js"],
    "node": ["node.js", "nodejs", "node", "express", "express.js", "nestjs"],
    "golang": ["golang", "go developer", "go engineer", "go systems"],
    "dotnet": [".net", "c#", "asp.net", "dotnet", ".net core", "c sharp"],
    "c#": [".net", "c#", "asp.net", "dotnet", ".net core", "c sharp"],
    
    "business analyst": ["business analyst", "business systems analyst", "business analytics", "functional consultant", "requirement analyst", "product analyst", "ba"],
    "data analyst": ["data analyst", "bi analyst", "business intelligence", "power bi", "tableau", "analytics analyst", "reporting analyst", "sql analyst"],
    "product manager": ["product manager", "product owner", "technical product manager", "associate product manager", "product lead", "group product manager"],
    "scrum master": ["scrum master", "agile coach", "agile delivery", "scrum"],
    
    "qa": ["qa", "quality assurance", "sdet", "automation tester", "test automation", "test engineer", "software test", "selenium", "cypress", "playwright"],
    "sdet": ["sdet", "test automation", "qa automation", "software development engineer in test", "automation test lead"],
    "testing": ["qa", "quality assurance", "sdet", "automation tester", "test automation", "test engineer"],
    
    "devops": ["devops", "sre", "site reliability", "cloud", "kubernetes", "k8s", "docker", "terraform", "ci/cd", "infrastructure", "platform engineer"],
    "sre": ["sre", "site reliability", "devops", "platform engineer", "infrastructure engineer", "systems reliability"],
    "cloud": ["cloud", "aws", "azure", "gcp", "devops", "cloud architect", "infrastructure", "kubernetes", "terraform"],
    
    "data engineer": ["data engineer", "data platform", "spark", "pyspark", "pipeline", "etl", "snowflake", "databricks", "dbt", "sql", "bigquery"],
    "data": ["data engineer", "data platform", "spark", "pyspark", "pipeline", "etl", "snowflake", "databricks", "dbt", "bigquery"],
    
    "ai": ["ai", "artificial intelligence", "ml", "machine learning", "deep learning", "genai", "generative ai", "llm", "nlp", "computer vision", "data scientist"],
    "ml": ["ml", "machine learning", "deep learning", "ai", "artificial intelligence", "data scientist", "pytorch", "tensorflow"],
    "genai": ["genai", "generative ai", "llm", "large language model", "langchain", "llamaindex", "rag", "prompt engineering", "ai engineer"],
    
    "cybersecurity": ["cybersecurity", "cyber security", "infosec", "soc", "penetration testing", "cloud security", "appsec", "vulnerability"],
    "security": ["cybersecurity", "cyber security", "infosec", "soc", "penetration testing", "cloud security", "appsec"],
    
    "ui/ux": ["ui/ux", "ux designer", "ui designer", "product designer", "user experience", "visual designer", "interaction designer"],
    "mobile": ["android", "ios", "mobile engineer", "mobile developer", "react native", "flutter", "swift", "kotlin"],
}


def expand_query_keywords(query: str) -> List[str]:
    """
    Expands a user search query into distinct domain keywords and high-priority synonyms,
    filtering out generic non-distinguishing stop-words.
    """
    if not query or not query.strip():
        return []

    q_clean = query.lower().strip()
    expanded: Set[str] = set()
    expanded.add(q_clean)

    # Check exact full phrase matches in taxonomy
    for key, syns in TECH_SYNONYMS_MAP.items():
        if key == q_clean or key in q_clean or q_clean in key:
            for s in syns:
                expanded.add(s)

    # Add meaningful word tokens (excluding stop-words)
    tokens = [w for w in re.split(r'[\s/,\-\+]+', q_clean) if len(w) > 1 and w not in ROLE_STOP_WORDS]
    for t in tokens:
        expanded.add(t)
        if t in TECH_SYNONYMS_MAP:
            for syn in TECH_SYNONYMS_MAP[t]:
                expanded.add(syn)

    return [x for x in expanded if x and x not in ROLE_STOP_WORDS]


expand_job_search_query = expand_query_keywords


def match_job_with_expanded_query(
    job_title: str,
    job_description_or_query: Any = "",
    key_skills: Optional[List[str]] = None,
    query: Optional[str] = None,
) -> Any:
    """
    Flexible evaluator:
    - If called as match_job_with_expanded_query(title, query_string): returns bool
    - If called as match_job_with_expanded_query(title, desc, skills, query): returns (matched: bool, score: int)
    """
    if query is None and key_skills is None:
        # Called as (job_title, query)
        target_query = str(job_description_or_query or "").strip()
        if not target_query:
            return True
        expanded_kws = expand_query_keywords(target_query)
        title_lower = (job_title or "").lower()
        if target_query.lower() in title_lower:
            return True
        return any(kw in title_lower for kw in expanded_kws if len(kw) > 2)

    # 4-argument full scoring mode
    target_query = str(query or "").strip()
    if not target_query:
        return True, 50

    expanded_kws = expand_query_keywords(target_query)
    title_lower = (job_title or "").lower()
    desc_lower = str(job_description_or_query or "").lower()
    skills_lower = [str(s).lower() for s in (key_skills or [])]

    score = 0
    # 1. Exact query match in title (Highest priority)
    if target_query.lower() in title_lower:
        score += 80

    # 2. Key domain match in title
    for kw in expanded_kws:
        if len(kw) >= 3 and kw in title_lower:
            score += 40
            break

    # 3. Match in required skills
    for kw in expanded_kws:
        if len(kw) >= 3 and any(kw in sk for sk in skills_lower):
            score += 25
            break

    # 4. Match in job description
    for kw in expanded_kws:
        if len(kw) >= 3 and kw in desc_lower:
            score += 15
            break

    return score > 0, score
