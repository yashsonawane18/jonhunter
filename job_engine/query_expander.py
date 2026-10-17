"""
Job Engine - Semantic Query Expander & Tech Taxonomy (query_expander.py)
Expands user search queries with tech synonyms, domain acronyms, and related frameworks
to guarantee comprehensive and strictly accurate job discovery across all engineering, data, product and consulting disciplines.
"""

import re
from typing import List, Set, Tuple, Dict, Optional, Any

# Genuine generic stop words that carry no technology or role domain meaning
ROLE_STOP_WORDS = {
    "job", "jobs", "role", "roles", "position", "positions", "hiring",
    "opening", "openings", "opportunity", "opportunities", "candidate", "level"
}

TECH_SYNONYMS_MAP = {
    "mern": ["mern", "mern stack", "react", "node", "express", "mongodb"],
    "mean": ["mean", "mean stack", "angular", "node", "express", "mongodb"],
    "fullstack": ["fullstack", "full stack", "full-stack"],
    "full stack": ["fullstack", "full stack", "full-stack"],
    "frontend": ["frontend", "front-end", "front end", "ui developer", "ui engineer"],
    "front-end": ["frontend", "front-end", "front end", "ui developer", "ui engineer"],
    "backend": ["backend", "back-end", "back end", "api engineer", "server engineer"],
    "back-end": ["backend", "back-end", "back end", "api engineer", "server engineer"],
    
    "python": ["python", "fastapi", "django", "flask", "pyspark"],
    "java": ["java", "spring boot", "spring", "hibernate", "j2ee", "jvm"],
    "react": ["react", "react.js", "reactjs", "next.js", "nextjs"],
    "angular": ["angular", "angularjs"],
    "vue": ["vue", "vue.js", "vuejs", "nuxt", "nuxt.js"],
    "node": ["node.js", "nodejs", "node", "express", "express.js", "nestjs"],
    "golang": ["golang", "go developer", "go engineer"],
    "go": ["golang", "go developer", "go engineer"],
    "dotnet": [".net", "c#", "asp.net", "dotnet", ".net core", "c sharp"],
    "c#": [".net", "c#", "asp.net", "dotnet", ".net core", "c sharp"],
    "rust": ["rust", "rust developer", "rust engineer"],
    
    "business analyst": ["business analyst", "business systems analyst", "business analytics", "functional consultant", "requirement analyst"],
    "data analyst": ["data analyst", "bi analyst", "business intelligence", "power bi", "tableau", "analytics analyst", "reporting analyst"],
    "product manager": ["product manager", "product owner", "technical product manager", "associate product manager"],
    "scrum master": ["scrum master", "agile coach", "agile delivery"],
    
    "qa": ["qa", "quality assurance", "sdet", "automation tester", "test automation", "test engineer", "software test", "selenium", "cypress", "playwright"],
    "sdet": ["sdet", "test automation", "qa automation", "software development engineer in test"],
    "testing": ["qa", "quality assurance", "sdet", "automation tester", "test automation", "test engineer"],
    
    "devops": ["devops", "sre", "site reliability", "kubernetes", "k8s", "docker", "terraform", "ci/cd", "infrastructure", "platform engineer"],
    "sre": ["sre", "site reliability", "devops", "platform engineer", "infrastructure engineer"],
    "cloud": ["cloud", "aws", "azure", "gcp", "cloud architect", "cloud engineer"],
    
    "data engineer": ["data engineer", "data platform", "spark", "pyspark", "pipeline", "etl", "snowflake", "databricks", "dbt"],
    "data": ["data engineer", "data platform", "data analyst", "data scientist", "spark", "etl", "analytics"],
    
    "ai": ["ai", "artificial intelligence", "ml", "machine learning", "deep learning", "genai", "generative ai", "llm", "ai engineer"],
    "ml": ["ml", "machine learning", "deep learning", "data scientist", "pytorch", "tensorflow", "ml engineer"],
    "genai": ["genai", "generative ai", "llm", "large language model", "langchain", "rag", "ai engineer"],
    
    "cybersecurity": ["cybersecurity", "cyber security", "infosec", "soc", "penetration testing", "cloud security", "appsec"],
    "security": ["cybersecurity", "cyber security", "infosec", "soc", "penetration testing", "cloud security", "appsec"],
    
    "ui/ux": ["ui/ux", "ux designer", "ui designer", "product designer", "user experience"],
    "mobile": ["android", "ios", "react native", "flutter", "swift", "kotlin", "mobile developer"],

    # Senior Leadership & Director Roles
    "director": ["director", "senior director", "director of engineering", "engineering director", "head of engineering", "vp of engineering", "vp engineering"],
    "director of engineering": ["director of engineering", "engineering director", "senior director of engineering", "head of engineering", "vp of engineering"],
    "vp": ["vp", "vice president", "vp of engineering", "vp engineering", "head of engineering"],
    "head of": ["head of", "head of engineering", "director of engineering", "vp of engineering"],
    "chief architect": ["chief architect", "principal architect", "head of architecture", "enterprise architect"],
    "engineering manager": ["engineering manager", "software engineering manager", "em", "lead engineering manager"],
}


def expand_query_keywords(query: str) -> List[str]:
    """
    Expands a user search query into precise domain synonyms and technical variants
    using strict word-boundary matching to prevent cross-technology contamination
    (e.g., 'javascript' will never expand into 'java' / 'spring boot').
    """
    if not query or not query.strip():
        return []

    q_clean = query.lower().strip()
    expanded: Set[str] = set()
    expanded.add(q_clean)

    # 1. Exact full key match in taxonomy
    if q_clean in TECH_SYNONYMS_MAP:
        for s in TECH_SYNONYMS_MAP[q_clean]:
            expanded.add(s)
    else:
        # Word-boundary matching only to avoid substring pollution
        for key, syns in TECH_SYNONYMS_MAP.items():
            pattern = r'(?:\b|_)' + re.escape(key) + r'(?:\b|_)'
            if re.search(pattern, q_clean):
                # Guard against 'java' matching inside 'javascript'
                if key == "java" and "javascript" in q_clean:
                    cleaned_without_js = re.sub(r'\bjavascript\b', '', q_clean).strip()
                    if not re.search(r'\bjava\b', cleaned_without_js):
                        continue
                # Guard against 'go' matching inside 'django' or 'algorithm'
                if key == "go" and not re.search(r'\bgo\b', q_clean):
                    continue
                for s in syns:
                    expanded.add(s)

    GENERIC_ROLE_WORDS = {"engineer", "developer", "programmer", "specialist", "consultant", "associate", "intern"}

    # 2. Tokenize meaningful terms (preserving seniority & role tokens like senior, lead, director)
    tokens = [w for w in re.split(r'[\s/,\-\+]+', q_clean) if len(w) > 1 and w not in ROLE_STOP_WORDS]
    if len(tokens) > 1:
        # In compound/multi-word queries (e.g. 'Data Engineer', 'React Developer'), generic role words
        # like 'engineer' or 'developer' must not be added as standalone keywords, preventing all-engineer pollution.
        for t in tokens:
            if t not in GENERIC_ROLE_WORDS:
                expanded.add(t)
                if t in TECH_SYNONYMS_MAP:
                    if t == "java" and "javascript" in q_clean:
                        continue
                    for syn in TECH_SYNONYMS_MAP[t]:
                        expanded.add(syn)
    else:
        for t in tokens:
            expanded.add(t)
            if t in TECH_SYNONYMS_MAP:
                if t == "java" and "javascript" in q_clean:
                    continue
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
    Evaluates whether a job matches a search query with precision matching manual search:
    - If called as match_job_with_expanded_query(title, query_string): returns bool
    - If called as match_job_with_expanded_query(title, desc, skills, query): returns (matched: bool, score: int)
    """
    if query is None and key_skills is None:
        # Called as (job_title, query)
        target_query = str(job_description_or_query or "").strip()
        if not target_query or target_query.lower() in ("", "all", "software engineer", "all jobs"):
            return True

        title_lower = (job_title or "").lower()
        q_clean = target_query.lower().strip()

        # 1. Exact phrase match in title (Word boundary)
        if re.search(r'(?:\b|_)' + re.escape(q_clean) + r'(?:\b|_)', title_lower):
            return True

        # 2. Specific technology / leadership matching
        expanded_kws = expand_query_keywords(q_clean)
        for kw in expanded_kws:
            if len(kw) >= 2:
                pattern = r'(?:\b|_)' + re.escape(kw) + r'(?:\b|_)'
                if re.search(pattern, title_lower):
                    return True

        return False

    # 4-argument full scoring mode: match_job_with_expanded_query(title, desc, skills, query)
    target_query = str(query or "").strip()
    if not target_query or target_query.lower() in ("", "all", "software engineer", "all jobs"):
        return True, 50

    q_clean = target_query.lower().strip()
    expanded_kws = expand_query_keywords(q_clean)
    title_lower = (job_title or "").lower()
    desc_lower = str(job_description_or_query or "").lower()
    skills_lower = [str(s).lower() for s in (key_skills or [])]

    score = 0

    # 1. Exact query match in title (Highest priority: 80 pts)
    if re.search(r'(?:\b|_)' + re.escape(q_clean) + r'(?:\b|_)', title_lower):
        score += 80

    # 2. Key domain / tech synonym match in title (40 pts)
    title_matched = False
    for kw in expanded_kws:
        if len(kw) >= 2 and re.search(r'(?:\b|_)' + re.escape(kw) + r'(?:\b|_)', title_lower):
            score += 40
            title_matched = True
            break

    # 3. Direct match in required key skills (25 pts)
    skills_matched = False
    for kw in expanded_kws:
        if len(kw) >= 2 and any(re.search(r'(?:\b|_)' + re.escape(kw) + r'(?:\b|_)', sk) for sk in skills_lower):
            score += 25
            skills_matched = True
            break

    # 4. Match in job description (ONLY counted if title or skills already showed domain alignment)
    if title_matched or skills_matched:
        for kw in expanded_kws:
            if len(kw) >= 3 and re.search(r'(?:\b|_)' + re.escape(kw) + r'(?:\b|_)', desc_lower):
                score += 15
                break

    # Job is only considered a match if title or explicit skills matched (score >= 25)
    return score >= 25, score
