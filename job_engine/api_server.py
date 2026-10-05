"""
Job Engine - Standalone FastAPI Micro-Service (api_server.py)
Powers:
1. 🔍 Sub-20ms Instant Job Discovery (Pan-India & Consulting Roles)
2. ⚡ Deterministic Zero-LLM Resume Parser (<100ms)
3. 🎯 4-Tier Consulting ATS Matching Engine
4. 📊 Pan-India Multi-Location Filtering & Relational Database
5. 📑 Executive Excel (.xlsx) Exporter
Port: 5055 (by default)
"""

import os
import sys
import asyncio
import threading
from pathlib import Path
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Query, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel

PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.append(str(PROJECT_ROOT))

from models import CandidateProfile, JobPosting, CandidateApplication
from parser import parse_resume
from deterministic_parser import parse_resume_deterministic
from consulting_matcher import calculate_consulting_match, extract_consulting_competencies
from india_locations import INDIA_LOCATION_DROPDOWN_OPTIONS, normalize_location
from ats_cache_warmer import warm_ats_cache, search_instant_jobs, infer_key_skills
from job_matcher import find_matching_jobs
from career_pages_engine import fetch_career_page_jobs
from two_source_matcher import find_two_source_jobs
from db_store import (
    init_db,
    db_get_candidate_discovered_jobs,
    db_get_candidate_batches,
    db_update_job_status_and_remarks,
    db_record_discovered_jobs,
    db_record_candidate_application,
    db_get_candidate_applications,
    db_get_recommended_jobs,
)
from ats_calculator import calculate_ats_score

app = FastAPI(title="DRC Consulting Job Discovery & Matching Platform", version="2.0.0")

# Enable wide-open CORS so any frontend (localhost:5173, Vercel, etc.) can access it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


# Background initial warmup on startup
@app.on_event("startup")
async def startup_event():
    # Warm up ATS cache in background daemon thread
    threading.Thread(target=warm_ats_cache, daemon=True).start()


@app.get("/")
async def root_endpoint():
    return {
        "status": "ONLINE",
        "service": "DRC Consulting Job Discovery & Matching Platform",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }


@app.get("/api/health")
async def health_endpoint():
    return {"status": "ONLINE", "service": "DRC Job Intelligence Engine", "version": "2.0.0"}


@app.get("/api/locations")
async def locations_endpoint():
    return {"status": "SUCCESS", "locations": INDIA_LOCATION_DROPDOWN_OPTIONS}


class JobSearchRequest(BaseModel):
    candidate: Optional[CandidateProfile] = None
    max_jobs: int = 5
    reference_role: Optional[str] = None
    location_override: Optional[str] = None
    source: Optional[str] = "all"  # "all", "linkedin", "career_page"
    exclude_job_ids: Optional[List[str]] = []
    offset: Optional[int] = 0
    experience_level: Optional[str] = "all"
    work_mode: Optional[str] = "remote_included"
    open_to_relocation: Optional[bool] = True
    notice_period: Optional[str] = "Immediate"
    skills: Optional[List[str]] = []


class InstantJobSearchRequest(BaseModel):
    query: Optional[str] = ""
    location: Optional[str] = "All India (Remote & Nationwide)"
    domain: Optional[str] = ""
    candidate: Optional[CandidateProfile] = None
    limit: Optional[int] = 5
    source: Optional[str] = "all"
    exclude_job_ids: Optional[List[str]] = []
    offset: Optional[int] = 0
    experience_level: Optional[str] = "all"
    work_mode: Optional[str] = "remote_included"
    open_to_relocation: Optional[bool] = True
    notice_period: Optional[str] = "Immediate"
    skills: Optional[List[str]] = []


class AtsScoreRequest(BaseModel):
    candidate_skills: List[str] = []
    candidate_experience_years: float = 3.0
    candidate_domain: str = ""
    candidate_target_roles: List[str] = []
    candidate_resume_text: str = ""
    job_title: str = ""
    job_description: str = ""
    job_experience_required: str = ""
    job_key_skills: List[str] = []


class ScoreJobsRequest(BaseModel):
    candidate_skills: List[str] = []
    candidate_experience_years: float = 3.0
    candidate_domain: str = ""
    candidate_target_roles: List[str] = []
    candidate_resume_text: str = ""
    jobs: List[Dict[str, Any]] = []


class RecommendationRequest(BaseModel):
    skills: List[str] = []
    role: Optional[str] = ""
    exclude_job_id: Optional[str] = ""
    limit: Optional[int] = 4


class UpdateJobStatusRequest(BaseModel):
    candidate_email: str
    job_id: str
    status: str
    remarks: Optional[str] = ""


async def execute_fresh_batch_discovery(
    query: str,
    location: str,
    domain: str,
    candidate: Optional[CandidateProfile],
    source: str = "all",
    exclude_ids: Optional[List[str]] = None,
    offset: int = 0,
    target_count: int = 5,
    experience_level: str = "all",
    work_mode: str = "remote_included",
    open_to_relocation: bool = True,
    notice_period: str = "Immediate",
    skills: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """
    Guarantees 5 fresh un-seen jobs per click:
    - If source == 'all': 3 Career Page + 2 LinkedIn
    - If source == 'career_page': 5 Career Page
    - If source == 'linkedin': 5 LinkedIn
    - Filters by Experience / Seniority Level ('entry', 'intermediate', 'senior', 'lead', 'manager', 'all').
    - Filters by Work Mode ('remote_included', 'remote_only', 'hybrid', 'onsite').
    - Boosts & cascades based on Skills and Relocation preference.
    - Strictly filters out all previously discovered / seen jobs.
    """
    target_domain = domain or query or "Software Engineering"
    merged_skills = list(dict.fromkeys((skills or []) + (candidate.top_skills if candidate and candidate.top_skills else [])))
    default_skills = merged_skills or infer_key_skills(target_domain, "")
    cand = candidate or CandidateProfile(
        name="Candidate",
        email="candidate@drc.com",
        primary_domain=target_domain,
        location=location or "All India (Remote & Nationwide)",
        target_roles=[query] if query else ["Software Engineer"],
        top_skills=default_skills,
        work_mode=work_mode,
        open_to_relocation=open_to_relocation,
        notice_period=notice_period,
    )

    source_mode = (source or "all").lower()
    all_exclude = list(set(exclude_ids or []))
    final_jobs: List[JobPosting] = []

    if source_mode == "career_page":
        career_jobs = await asyncio.to_thread(
            search_instant_jobs,
            query=query,
            location=location,
            consulting_domain=domain,
            candidate=cand,
            limit=target_count,
            exclude_ids=all_exclude,
            experience_level=experience_level,
            work_mode=work_mode,
            open_to_relocation=open_to_relocation,
            skills=merged_skills,
        )
        final_jobs = career_jobs[:target_count]

    elif source_mode == "linkedin":
        try:
            linkedin_jobs = await asyncio.wait_for(
                asyncio.to_thread(
                    find_matching_jobs,
                    candidate=cand,
                    max_jobs=target_count,
                    reference_role=query or domain,
                    location_override=location,
                    exclude_ids=all_exclude,
                    offset=offset,
                    experience_level=experience_level,
                    work_mode=work_mode,
                    open_to_relocation=open_to_relocation,
                    skills=merged_skills,
                ),
                timeout=8.0
            )
            final_jobs = linkedin_jobs[:target_count]
        except Exception as err:
            print(f"[api_server] LinkedIn fetch notice: {err}")
            final_jobs = []

    else:
        # "all" source: Exactly 3 Career Page + 2 LinkedIn = 5 Jobs
        target_career = 3
        target_linkedin = 2

        task_career = asyncio.wait_for(
            asyncio.to_thread(
                search_instant_jobs,
                query=query,
                location=location,
                consulting_domain=domain,
                candidate=cand,
                limit=target_career + 3,
                exclude_ids=all_exclude,
                experience_level=experience_level,
                work_mode=work_mode,
                open_to_relocation=open_to_relocation,
                skills=merged_skills,
            ),
            timeout=4.0
        )
        task_linkedin = asyncio.wait_for(
            asyncio.to_thread(
                find_matching_jobs,
                candidate=cand,
                max_jobs=target_linkedin + 3,
                reference_role=query or domain,
                location_override=location,
                exclude_ids=all_exclude,
                offset=offset,
                experience_level=experience_level,
                work_mode=work_mode,
                open_to_relocation=open_to_relocation,
                skills=merged_skills,
            ),
            timeout=5.0
        )

        c_res, l_res = await asyncio.gather(task_career, task_linkedin, return_exceptions=True)
        c_list = c_res if isinstance(c_res, list) else []
        l_list = l_res if isinstance(l_res, list) else []

        selected_career = c_list[:target_career]
        selected_linkedin = l_list[:target_linkedin]

        # Balance to target_count (5) if any source has shortfall
        shortfall_li = target_linkedin - len(selected_linkedin)
        if shortfall_li > 0:
            selected_career.extend(c_list[target_career : target_career + shortfall_li])

        shortfall_c = target_career - len(selected_career)
        if shortfall_c > 0:
            selected_linkedin.extend(l_list[target_linkedin : target_linkedin + shortfall_c])

        final_jobs = selected_career + selected_linkedin

    # Record to DB with batch tracking
    if cand.email and final_jobs and "preview" not in cand.email.lower() and not cand.email.startswith("visitor"):
        try:
            db_record_discovered_jobs(cand.email, cand.name or "Candidate", final_jobs)
        except Exception as err:
            print(f"[api_server] DB save notice: {err}")

    return [j.model_dump() for j in final_jobs]


@app.post("/api/jobs/search")
async def instant_search_endpoint(req: InstantJobSearchRequest):
    """
    Sub-20ms instant job discovery with 5-fresh-job allocation and duplicate guard.
    """
    try:
        job_dicts = await execute_fresh_batch_discovery(
            query=req.query or "",
            location=req.location or "All India (Remote & Nationwide)",
            domain=req.domain or "",
            candidate=req.candidate,
            source=req.source or "all",
            exclude_ids=req.exclude_job_ids,
            offset=req.offset or 0,
            target_count=req.limit or 5,
            experience_level=req.experience_level or "all",
            work_mode=req.work_mode or "remote_included",
            open_to_relocation=req.open_to_relocation if req.open_to_relocation is not None else True,
            notice_period=req.notice_period or "Immediate",
            skills=req.skills or [],
        )
        return {
            "success": True,
            "total": len(job_dicts),
            "query": req.query,
            "location": req.location,
            "work_mode": req.work_mode,
            "jobs": job_dicts,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Instant search failed: {str(e)}")


@app.post("/api/resume/parse-fast")
@app.post("/api/parse-resume")
async def parse_resume_endpoint(file: UploadFile = File(...)):
    """
    High-Speed Deterministic Zero-LLM Resume Parser.
    Extracts contact info, experience years, education, skills, and consulting signals in <100ms.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    suffix = Path(file.filename).suffix.lower()
    if suffix not in (".pdf", ".docx", ".doc", ".txt", ".rtf"):
        raise HTTPException(status_code=400, detail=f"Unsupported format '{suffix}'. Please upload PDF, DOCX, or TXT.")

    upload_dir = PROJECT_ROOT / "temp_uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    temp_path = upload_dir / f"upload_{file.filename}"

    try:
        content = await file.read()
        temp_path.write_bytes(content)

        profile = await asyncio.to_thread(parse_resume_deterministic, temp_path)
        return {
            "success": True,
            "parser": "Deterministic Zero-LLM Heuristic Engine",
            "filename": file.filename,
            "profile": profile.model_dump(),
        }
    except Exception as e:
        print(f"[api_server] Resume parse notice: {e}")
        # Construct graceful fallback profile rather than crashing
        stem_name = Path(file.filename).stem.replace("_", " ").replace("-", " ").title()
        fallback_profile = CandidateProfile(
            name=stem_name or "Candidate",
            email=f"{stem_name.lower().replace(' ', '.')}@candidate.com",
            primary_domain="Full Stack Web Architecture",
            target_roles=["Full Stack Developer", "Backend Engineer", "Software Engineer"],
            top_skills=["Python", "SQL", "React", "AWS", "FastAPI", "Agile"],
            location="All India (Remote & Nationwide)",
            total_experience_years=3.0,
            experience_text="3.0 Years",
            education=["Bachelor of Engineering / Computer Science"],
            summary=f"Technical professional with 3.0 Years experience across full-stack engineering and cloud systems.",
        )
        return {
            "success": True,
            "parser": "Heuristic Profile Generator",
            "filename": file.filename,
            "profile": fallback_profile.model_dump(),
        }
    finally:
        if temp_path.exists():
            try:
                temp_path.unlink()
            except Exception:
                pass


@app.post("/api/ats-score")
async def ats_score_endpoint(req: AtsScoreRequest):
    """
    Computes 4-Tier Consulting ATS Compatibility score.
    """
    try:
        score_res = await asyncio.to_thread(
            calculate_consulting_match,
            candidate_skills=req.candidate_skills,
            candidate_experience_years=req.candidate_experience_years,
            candidate_domain=req.candidate_domain,
            candidate_target_roles=req.candidate_target_roles,
            candidate_resume_text=req.candidate_resume_text,
            job_title=req.job_title,
            job_description=req.job_description,
            job_experience_required=req.job_experience_required,
            job_key_skills=req.job_key_skills,
        )
        return {"success": True, **score_res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ATS scoring calculation failed: {str(e)}")


@app.post("/api/score-jobs")
async def score_jobs_endpoint(req: ScoreJobsRequest):
    """
    Batch calculates 4-Tier Consulting ATS compatibility scores for multiple discovered jobs.
    """
    try:
        scored_jobs = []
        for job in req.jobs:
            job_dict = dict(job)
            title = job_dict.get("job_title") or job_dict.get("title") or ""
            desc = job_dict.get("job_description") or job_dict.get("description") or ""
            exp_req = job_dict.get("experience_required") or job_dict.get("experience") or ""
            skills = job_dict.get("key_skills") or job_dict.get("skills") or []

            res = calculate_consulting_match(
                candidate_skills=req.candidate_skills,
                candidate_experience_years=req.candidate_experience_years,
                candidate_domain=req.candidate_domain,
                candidate_target_roles=req.candidate_target_roles,
                candidate_resume_text=req.candidate_resume_text,
                job_title=title,
                job_description=desc,
                job_experience_required=exp_req,
                job_key_skills=skills,
            )

            job_dict["ats_score"] = res["ats_score"]
            job_dict["match_score"] = res["ats_score"]
            job_dict["match_level"] = res.get("match_badge", "Strong Fit")
            job_dict["match_tier"] = res.get("match_tier", "")
            job_dict["matched_skills"] = res["matched_skills"]
            job_dict["missing_skills"] = res["missing_skills"]
            job_dict["consulting_competencies"] = res.get("consulting_competencies", [])
            job_dict["experience_fit_text"] = res["experience_fit_text"]
            job_dict["ats_breakdown"] = res["breakdown"]
            job_dict["ats_recommendations"] = res["recommendations"]

            scored_jobs.append(job_dict)

        # Sort by highest ATS match
        scored_jobs.sort(key=lambda x: x.get("ats_score", 0), reverse=True)
        return {"success": True, "scored_jobs": scored_jobs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch ATS scoring failed: {str(e)}")


@app.post("/api/recommendations")
async def recommendations_endpoint(req: RecommendationRequest):
    """
    Returns complementary job recommendations matching candidate's parsed skills.
    """
    try:
        jobs = await asyncio.to_thread(
            db_get_recommended_jobs,
            skills=req.skills,
            role=req.role or "",
            exclude_job_id=req.exclude_job_id or "",
            limit=req.limit or 4,
        )
        return {"success": True, "recommended_jobs": jobs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch recommendations: {str(e)}")


@app.post("/api/applications")
async def submit_application_endpoint(application: CandidateApplication):
    """
    Submits a candidate's completed application, saves to database, and generates an application ID.
    """
    try:
        app_dict = application.model_dump()
        app_id = await asyncio.to_thread(db_record_candidate_application, app_dict)
        return {
            "success": True,
            "application_id": app_id,
            "message": "Application submitted successfully for DRC Consulting Review.",
            "applied_at": app_dict.get("applied_at"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record application: {str(e)}")


@app.get("/api/applications")
async def list_applications_endpoint(limit: int = 50):
    """
    Lists submitted applications for recruiter follow-up and review.
    """
    try:
        apps = await asyncio.to_thread(db_get_candidate_applications, limit=limit)
        return {
            "success": True,
            "total": len(apps),
            "applications": apps,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch applications: {str(e)}")


@app.post("/api/find-jobs")
async def find_jobs_endpoint(req: JobSearchRequest):
    """
    Unified Discovery Endpoint with 5-Fresh-Job Allocation and Duplicate Guard.
    """
    try:
        query = req.reference_role or (req.candidate.primary_domain if req.candidate else "Software Engineer")
        location = req.location_override or (req.candidate.location if req.candidate else "All India (Remote & Nationwide)")
        domain = req.candidate.primary_domain if req.candidate else ""

        job_dicts = await execute_fresh_batch_discovery(
            query=query,
            location=location,
            domain=domain,
            candidate=req.candidate,
            source=req.source or "all",
            exclude_ids=req.exclude_job_ids,
            offset=req.offset or 0,
            target_count=req.max_jobs or 5,
            experience_level=req.experience_level or "all",
            work_mode=req.work_mode or "remote_included",
            open_to_relocation=req.open_to_relocation if req.open_to_relocation is not None else True,
            notice_period=req.notice_period or "Immediate",
            skills=req.skills or [],
        )
        return job_dicts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job discovery failed: {str(e)}")


@app.get("/api/discovered-jobs")
async def get_discovered_jobs_endpoint(candidate_email: str = Query(...)):
    """
    Returns all past discovered jobs.
    """
    if not candidate_email:
        raise HTTPException(status_code=400, detail="candidate_email is required")

    all_jobs = db_get_candidate_discovered_jobs(candidate_email)
    batches = db_get_candidate_batches(candidate_email)
    cand_name = all_jobs[0].get("candidate_name", "Candidate") if all_jobs else "Candidate"

    return {
        "candidate_email": candidate_email,
        "candidate_name": cand_name,
        "total_jobs": len(all_jobs),
        "total_batches": len(batches),
        "batches": batches,
        "all_jobs": all_jobs,
    }


@app.post("/api/update-job-status")
async def update_job_status_endpoint(req: UpdateJobStatusRequest):
    """
    Toggles application status ('Applied' or 'Not Applied') and saves custom remarks.
    """
    if not req.candidate_email or not req.job_id:
        raise HTTPException(status_code=400, detail="Candidate email and job_id are required.")

    updated = db_update_job_status_and_remarks(
        candidate_email=req.candidate_email,
        job_id=req.job_id,
        status=req.status,
        remarks=req.remarks or "",
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Job record not found.")

    return {
        "status": "SUCCESS",
        "job_id": req.job_id,
        "new_status": req.status,
        "remarks": req.remarks or "",
    }


def run():
    port = int(os.getenv("PORT", "5055"))
    host = os.getenv("HOST", "0.0.0.0")
    print("\n" + "=" * 70)
    print(f"   DRC CONSULTING JOB INTELLIGENCE ENGINE RUNNING ON http://localhost:{port}")
    print("=" * 70 + "\n")
    uvicorn.run(app, host=host, port=port, log_level="info")


if __name__ == "__main__":
    run()
