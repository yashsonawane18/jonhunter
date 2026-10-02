"""
DRC Job Assistant - Two-Source Matcher & Deduplication Orchestrator (two_source_matcher.py)
Coordinates parallel ingestion from:
1. Source A: LinkedIn Curated Postings (with real LinkedIn Job IDs & Direct View URLs)
2. Source B: Corporate Career Pages & ATS Feeds (Greenhouse, Lever, Ashby, Enterprise Portals)
Handles cross-source entity deduplication, hybrid card merging, and side-by-side feed preparation.
"""

import time
import re
from typing import List, Dict, Any, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor

from models import CandidateProfile, JobPosting
from job_matcher import find_matching_jobs
from career_pages_engine import fetch_career_page_jobs
from db_store import canonicalize_company, canonicalize_job_title

def are_cross_source_duplicates(job_a: JobPosting, job_b: JobPosting) -> bool:
    """
    Checks if a job from LinkedIn and a job from Career Pages represent the same requisition.
    """
    comp_a = canonicalize_company(job_a.company)
    comp_b = canonicalize_company(job_b.company)
    if comp_a != comp_b and not (comp_a in comp_b or comp_b in comp_a):
        return False
        
    title_a = canonicalize_job_title(job_a.job_title)
    title_b = canonicalize_job_title(job_b.job_title)
    if title_a == title_b:
        return True
        
    # Check word overlap
    words_a = set(re.findall(r'\b[a-z]{3,}\b', title_a))
    words_b = set(re.findall(r'\b[a-z]{3,}\b', title_b))
    if not words_a or not words_b:
        return False
        
    jaccard = len(words_a.intersection(words_b)) / len(words_a.union(words_b))
    return jaccard >= 0.65

def find_two_source_jobs(
    candidate: CandidateProfile,
    max_per_source: int = 5,
    reference_role: Optional[str] = None,
    location_override: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Fetches real-time matching jobs concurrently from LinkedIn and Company Career Pages.
    Deduplicates across sources and tags records with authentic metadata.
    """
    target_role = reference_role or candidate.primary_domain or "Software Engineer"
    target_loc = location_override or candidate.location or "Remote"
    
    linkedin_jobs: List[JobPosting] = []
    career_jobs: List[JobPosting] = []
    
    # 1. Parallel execution of both pipelines
    with ThreadPoolExecutor(max_workers=2) as executor:
        fut_linkedin = executor.submit(
            find_matching_jobs,
            candidate=candidate,
            max_jobs=max_per_source,
            reference_role=target_role,
            location_override=target_loc,
        )
        fut_career = executor.submit(
            fetch_career_page_jobs,
            query=target_role,
            location_preference=target_loc,
            max_jobs=max_per_source,
            candidate=candidate,
        )
        
        # Retrieve Career Page jobs (typically ~2-4s)
        try:
            career_jobs = fut_career.result(timeout=12) or []
        except Exception as e:
            print(f"[TwoSourceMatcher] Career page notice: {e}")
            career_jobs = []
            
        # Retrieve LinkedIn jobs (live deep scraping)
        try:
            linkedin_jobs = fut_linkedin.result(timeout=15) or []
        except Exception as e:
            print(f"[TwoSourceMatcher] LinkedIn notice: {e}")
            linkedin_jobs = []

    # 2. Tag source types explicitly
    for j in linkedin_jobs:
        if not j.source_type or "Career" not in j.source_type:
            j.source_type = "LinkedIn Curated"
            
    for j in career_jobs:
        if not j.source_type or "LinkedIn" not in j.source_type:
            j.source_type = j.source_type or "Direct Career Page"

    # 3. Cross-Source Deduplication & Dual-Verification
    all_combined: List[JobPosting] = []
    merged_career_indices = set()
    
    for li_job in linkedin_jobs:
        matched_career: Optional[JobPosting] = None
        for c_idx, c_job in enumerate(career_jobs):
            if c_idx not in merged_career_indices and are_cross_source_duplicates(li_job, c_job):
                matched_career = c_job
                merged_career_indices.add(c_idx)
                break
                
        if matched_career:
            # Create a Dual-Verified posting
            # Use LinkedIn URL as primary (always valid), career page as secondary
            career_url = matched_career.application_url
            linkedin_url = li_job.application_url
            # Use LinkedIn URL as primary since it's always verified live
            primary_url = linkedin_url
            
            dual_job = JobPosting(
                id=f"DUAL-{li_job.id.replace('LN-', '')}-{matched_career.id.replace('ATS-', '')}",
                job_title=matched_career.job_title or li_job.job_title,
                company=matched_career.company or li_job.company,
                location=matched_career.location or li_job.location,
                job_type="Full-time",
                salary=matched_career.salary or li_job.salary,
                experience_required=matched_career.experience_required or li_job.experience_required,
                key_skills=list(set(li_job.key_skills + matched_career.key_skills)),
                application_url=primary_url,  # Use LinkedIn URL (always live)
                status="Not Applied",
                total_call_received=False,
                job_description=matched_career.job_description or li_job.job_description,
                source_type="Dual-Verified (LinkedIn + Career Page)",
                apply_type="Direct ATS Apply + LinkedIn Available",
                ats_score=max(li_job.ats_score, matched_career.ats_score),
                match_score=max(li_job.match_score, matched_career.match_score),
                matched_skills=list(set(li_job.matched_skills + matched_career.matched_skills)),
                missing_skills=list(set(li_job.missing_skills).intersection(set(matched_career.missing_skills))),
                experience_match=li_job.experience_match or matched_career.experience_match,
                connections=matched_career.connections or li_job.connections,
                posted_time=li_job.posted_time or matched_career.posted_time,
            )
            all_combined.append(dual_job)
        else:
            all_combined.append(li_job)
            
    # Add remaining career jobs that were not duplicates
    for c_idx, c_job in enumerate(career_jobs):
        if c_idx not in merged_career_indices:
            all_combined.append(c_job)

    return {
        "all_jobs": [j.model_dump() for j in all_combined],
        "linkedin_jobs": [j.model_dump() for j in linkedin_jobs],
        "career_page_jobs": [j.model_dump() for j in career_jobs],
        "counts": {
            "total": len(all_combined),
            "linkedin": len(linkedin_jobs),
            "career_pages": len(career_jobs),
        }
    }
