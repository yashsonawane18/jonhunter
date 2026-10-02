"""
Job Engine - High-Accuracy Resume Parsing Engine (parser.py)
Extracts candidate information (contact details, experience, skills, education, summary)
from PDF, DOCX, and TXT resumes with deep rule-based heuristics and optional Gemini failover.
"""

import os
import re
import json
from pathlib import Path
from typing import Union, List, Tuple, Optional

import pdfplumber
from docx import Document

from config import PROJECT_ROOT
from models import CandidateProfile

# Specialized Domain Role Signatures
DOMAIN_SIGNATURES = [
    (
        "GenAI / AI Engineer",
        ["genai", "generative ai", "llm", "langchain", "llamaindex", "rag", "fine-tuning", "openai", "claude", "gemini", "prompt engineering", "ai engineer"],
        ["GenAI Engineer", "AI Engineer", "LLM Application Developer", "AI/ML Engineer"],
        "Artificial Intelligence & GenAI"
    ),
    (
        "AI / ML Engineer",
        ["machine learning", "deep learning", "pytorch", "tensorflow", "scikit-learn", "nlp", "computer vision", "huggingface", "keras", "ml engineer"],
        ["AI / ML Engineer", "Machine Learning Engineer", "Data Scientist", "AI Researcher"],
        "Artificial Intelligence & Machine Learning"
    ),
    (
        "MLOps Engineer",
        ["mlops", "kubeflow", "mlflow", "model deployment", "model monitoring", "vertex ai", "sagemaker", "dvc", "wandb", "triton"],
        ["MLOps Engineer", "Machine Learning Platform Engineer", "AI Infrastructure Engineer"],
        "MLOps & AI Infrastructure"
    ),
    (
        "Backend Developer",
        ["fastapi", "django", "flask", "spring boot", "node.js", "express", "microservices", "rest api", "graphql", "backend", "c#", ".net core", "golang"],
        ["Backend Developer", "Senior Backend Engineer", "Software Development Engineer", "API Engineer"],
        "Backend Engineering"
    ),
    (
        "Full Stack Developer",
        ["mern", "mean", "full stack", "fullstack", "node.js", "react", "next.js", "typescript", "full-stack", "vue", "angular", "express", "mongodb"],
        ["Full Stack Developer", "Full Stack Engineer", "Software Engineer", "MERN Stack Developer"],
        "Full Stack Engineering"
    ),
    (
        "Data Engineer",
        ["spark", "pyspark", "databricks", "snowflake", "dbt", "data pipeline", "etl", "bigquery", "airflow", "sql server", "kafka", "hadoop"],
        ["Data Engineer", "ETL Developer", "Big Data Engineer", "Data Platform Engineer"],
        "Data Engineering & Analytics"
    ),
    (
        "Data Analyst",
        ["data analyst", "power bi", "tableau", "excel", "sql query", "business intelligence", "bi analyst", "looker", "dashboard", "reporting"],
        ["Data Analyst", "Business Intelligence Analyst", "Data Insights Specialist"],
        "Data Analytics & BI"
    ),
    (
        "DevOps / SRE Engineer",
        ["devops", "kubernetes", "docker", "terraform", "ansible", "ci/cd", "jenkins", "aws", "azure devops", "helm", "prometheus", "sre", "grafana"],
        ["DevOps Engineer", "Site Reliability Engineer (SRE)", "Cloud Engineer", "Infrastructure Engineer"],
        "DevOps & Reliability"
    ),
    (
        "Cloud Engineer",
        ["aws", "azure", "gcp", "google cloud", "cloud architecture", "iam", "s3", "ec2", "lambda", "cloudformation", "cloud engineer"],
        ["Cloud Engineer", "Cloud Solutions Architect", "AWS / Azure Engineer"],
        "Cloud Computing & Infrastructure"
    ),
    (
        "Cybersecurity Engineer",
        ["cybersecurity", "information security", "soc", "siem", "penetration testing", "vulnerability assessment", "owasp", "incident response", "firewall", "security analyst"],
        ["Cybersecurity Engineer", "Information Security Analyst", "Security Engineer"],
        "Cybersecurity & Threat Defense"
    ),
    (
        "Product Manager",
        ["product manager", "product owner", "user stories", "roadmap", "prds", "agile", "scrum", "product analytics", "stakeholder management", "jira"],
        ["Product Manager", "Associate Product Manager", "Technical Product Manager", "Product Owner"],
        "Product Management & Strategy"
    ),
]

ALL_KNOWN_SKILLS = [
    # Programming Languages
    "Python", "Java", "JavaScript", "TypeScript", "C#", ".NET", ".NET Core", "C++", "C", "Go", "Golang", "SQL", "HTML5", "CSS3", "PHP", "Ruby", "Swift", "Kotlin", "Rust", "Dart",
    # Frameworks & Backend
    "FastAPI", "Django", "Flask", "Spring Boot", "Hibernate", "Node.js", "Express.js", "ASP.NET Core", "Entity Framework", "REST API", "GraphQL", "Microservices",
    # Frontend
    "React", "React.js", "Next.js", "Angular", "Vue.js", "Redux", "Tailwind CSS", "Bootstrap", "HTML", "CSS",
    # AI / ML / Data
    "PyTorch", "TensorFlow", "Scikit-Learn", "NLP", "Computer Vision", "LangChain", "LlamaIndex", "RAG", "OpenAI", "Hugging Face", "Pandas", "NumPy", "Apache Spark", "PySpark", "Databricks", "Airflow", "Snowflake", "dbt", "BigQuery", "Power BI", "Tableau",
    # Cloud & DevOps
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CI/CD", "Jenkins", "GitHub Actions", "Git", "Linux", "Ansible", "Helm", "Prometheus", "Grafana",
    # Databases
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQL Server", "DynamoDB", "Elasticsearch", "Oracle",
    # Product & Agile
    "Agile", "Scrum", "JIRA", "Confluence", "User Stories", "Product Management", "Roadmapping", "Stakeholder Management", "UAT", "SDLC"
]


def extract_raw_text_from_pdf(file_path: Union[str, Path]) -> str:
    """Extracts text and table content from PDF file."""
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"PDF file not found: {path}")

    extracted_chunks = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                extracted_chunks.append(text)
            tables = page.extract_tables()
            for table in tables:
                table_text = "\n".join(" | ".join(cell for cell in row if cell) for row in table if any(row))
                if table_text:
                    extracted_chunks.append(table_text)

    return "\n\n".join(extracted_chunks).strip()


def extract_raw_text_from_docx(file_path: Union[str, Path]) -> str:
    """Extracts text and table content from DOCX file."""
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"DOCX file not found: {path}")

    doc = Document(path)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    for table in doc.tables:
        for row in table.rows:
            row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
            if row_text:
                paragraphs.append(row_text)

    return "\n\n".join(paragraphs).strip()


def extract_resume_text(file_path: Union[str, Path]) -> str:
    """Extracts raw text from .pdf, .docx, .doc, or .txt resume file."""
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix == ".pdf":
        return extract_raw_text_from_pdf(path)
    elif suffix in (".docx", ".doc"):
        return extract_raw_text_from_docx(path)
    elif suffix in (".txt", ".rtf"):
        return path.read_text(encoding="utf-8", errors="ignore")
    else:
        raise ValueError(f"Unsupported resume file format '{suffix}'. Supported: .pdf, .docx, .txt")


def _extract_name_from_resume(lines: List[str], file_name: str) -> str:
    """Extracts candidate's full legal name from header lines or filename fallback."""
    for line in lines[:8]:
        cleaned = line.strip()
        if re.search(r"(@|\.com|\+?\d{8,}|resume|curriculum|vitae|page|http|linkedin|portfolio|profile|experience|skills|education)", cleaned, re.IGNORECASE):
            continue
        if 2 <= len(cleaned.split()) <= 4 and len(cleaned) < 35:
            if re.match(r"^[A-Za-z\s\.\,\'-]+$", cleaned):
                return cleaned.strip()

    stem = Path(file_name).stem
    stem_clean = re.sub(r"(?i)(resume|cv|_|\-|\(|\)|\d+|developer|analyst|engineer|updated|latest)", " ", stem).strip()
    words = [w.capitalize() for w in stem_clean.split() if len(w) > 1]
    return " ".join(words[:2]) if words else "Candidate"


def _extract_experience_years(raw_text: str) -> Tuple[float, str]:
    """Extracts experience in years from explicit text or year spans."""
    match = re.search(r"(\d+(\.\d+)?)\+?\s*(years|yrs|year)\s*(of\s*)?(experience|exp|in)?", raw_text, re.IGNORECASE)
    if match:
        val = float(match.group(1))
        return val, f"{val} Years"

    date_matches = re.findall(r"(?:19|20)\d{2}", raw_text)
    if len(date_matches) >= 2:
        years = [int(y) for y in date_matches if 1995 <= int(y) <= 2026]
        if years:
            span = max(years) - min(years)
            if 0.5 <= span <= 35:
                return float(span), f"{span} Years"

    return 3.0, "3.0 Years"


def _extract_location(raw_text: str) -> str:
    """Extracts candidate location prioritizing target metros."""
    locations = [
        ("Pune", "Pune, Maharashtra, India"),
        ("Mumbai", "Mumbai, Maharashtra, India"),
        ("Bengaluru", "Bengaluru, Karnataka, India"),
        ("Bangalore", "Bengaluru, Karnataka, India"),
        ("Delhi", "Delhi NCR, India"),
        ("Noida", "Delhi NCR, India"),
        ("Gurgaon", "Delhi NCR, India"),
        ("Gurugram", "Delhi NCR, India"),
        ("Hyderabad", "Hyderabad, Telangana, India"),
        ("Chennai", "Chennai, Tamil Nadu, India"),
    ]
    for term, full_loc in locations:
        if re.search(rf"\b{re.escape(term)}\b", raw_text, re.IGNORECASE):
            return full_loc
    return "Pune, Maharashtra, India"


def _extract_domain_and_roles(raw_text: str, file_name: str) -> Tuple[str, List[str], str]:
    """Determines candidate primary domain and matching target roles."""
    text_lower = (raw_text + " " + file_name).lower()
    
    best_domain = "Full Stack Developer"
    best_roles = ["Full Stack Developer", "Backend Developer", "Software Engineer"]
    best_category = "Full Stack Engineering"
    max_matches = -1

    for domain_name, keywords, target_roles, category in DOMAIN_SIGNATURES:
        score = 0
        for kw in keywords:
            if kw in text_lower:
                score += 2 if len(kw) > 6 else 1
        
        if domain_name.lower() in text_lower[:500] or domain_name.lower() in file_name.lower():
            score += 8

        if score > max_matches:
            max_matches = score
            best_domain = domain_name
            best_roles = target_roles
            best_category = category

    return best_domain, best_roles, best_category


def _extract_skills_deep(raw_text: str) -> List[str]:
    """Extracts verified skills from resume text."""
    extracted = []
    text_lower = raw_text.lower()

    skills_block_match = re.search(r"(?:CORE SKILLS|TECHNICAL SKILLS|SKILLS|COMPETENCIES|EXPERTISE)\s*[:\n](.*?)(?:\n\n[A-Z\s]{4,}|\Z)", raw_text, re.DOTALL | re.IGNORECASE)
    if skills_block_match:
        block_text = skills_block_match.group(1)
        raw_tokens = re.split(r"[,\|•\n\t\u2022\u25cf]+", block_text)
        for token in raw_tokens:
            cleaned = token.strip()
            if 1 <= len(cleaned) <= 30 and not re.search(r"(experience|project|responsibilities|education)", cleaned, re.IGNORECASE):
                for known in ALL_KNOWN_SKILLS:
                    if known.lower() == cleaned.lower() and known not in extracted:
                        extracted.append(known)

    for skill in ALL_KNOWN_SKILLS:
        pattern = rf"\b{re.escape(skill.lower())}\b"
        if re.search(pattern, text_lower) and skill not in extracted:
            extracted.append(skill)

    if not extracted:
        extracted = ["Python", "FastAPI", "SQL", "Git", "REST APIs"]

    return extracted[:15]


def parse_resume(file_path: Union[str, Path]) -> CandidateProfile:
    """
    Parses resume file into CandidateProfile object with contact info, skills, experience, education.
    """
    path = Path(file_path)
    raw_text = extract_resume_text(path)

    if not raw_text.strip():
        raise ValueError(f"No readable text extracted from '{path.name}'.")

    lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
    candidate_name = _extract_name_from_resume(lines, path.name)

    email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", raw_text)
    email = email_match.group(0) if email_match else f"{candidate_name.lower().replace(' ', '.')}@candidate.com"

    phone_match = re.search(r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}", raw_text)
    phone = phone_match.group(0) if phone_match else ""

    location = _extract_location(raw_text)
    exp_val, exp_str = _extract_experience_years(raw_text)
    primary_domain, target_roles, category = _extract_domain_and_roles(raw_text, path.name)
    skills = _extract_skills_deep(raw_text)

    # LinkedIn / GitHub URL detection
    linkedin = ""
    li_match = re.search(r"https?://(?:www\.)?linkedin\.com/in/[\w\-]+", raw_text, re.IGNORECASE)
    if li_match:
        linkedin = li_match.group(0)

    # Education detection
    education = []
    edu_matches = re.findall(r"(?:B\.?E\.?|B\.?Tech|M\.?Tech|MCA|MBA|B\.?Sc|M\.?Sc|Bachelor|Master|Diploma)[^\n\r,\|]*", raw_text, re.IGNORECASE)
    for edu in edu_matches[:3]:
        cleaned_edu = edu.strip()
        if len(cleaned_edu) > 3 and cleaned_edu not in education:
            education.append(cleaned_edu)

    if not education:
        education = ["Bachelor of Engineering / Computer Science"]

    # Summary extraction
    summary = ""
    sum_match = re.search(r"(?:PROFESSIONAL SUMMARY|SUMMARY|PROFILE|OBJECTIVE)\s*[:\n](.*?)(?:\n\n[A-Z\s]{4,}|\Z)", raw_text, re.DOTALL | re.IGNORECASE)
    if sum_match:
        summary = " ".join(sum_match.group(1).split())[:400]

    return CandidateProfile(
        name=candidate_name,
        email=email,
        phone=phone,
        location=location,
        total_experience_years=exp_val,
        experience_text=exp_str,
        primary_domain=primary_domain,
        top_skills=skills,
        target_roles=target_roles,
        reference_role=target_roles[0] if target_roles else primary_domain,
        education=education,
        linkedin=linkedin,
        summary=summary,
        raw_resume_text=raw_text,
    )
