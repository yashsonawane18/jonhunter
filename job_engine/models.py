"""
Job Engine - Data Models (models.py)
Schemas for Job Postings, Candidate Profiles, Connections, and Batch Tracking.
"""

from typing import List, Optional, Any
from pydantic import BaseModel, Field, field_validator


class ConnectionRecord(BaseModel):
    """Represents an HR / Hiring Team contact for the Connections section."""

    name: str = Field(default="Talent Acquisition Lead", description="Recruiter or Hiring Team member name")
    title: str = Field(default="Technical Recruiter", description="Designation / Role in company")
    linkedin_url: str = Field(default="https://www.linkedin.com", description="Direct LinkedIn profile or targeted search URL")
    company_people_url: str = Field(default="", description="Direct link to company's People tab on LinkedIn")
    apollo_url: str = Field(default="", description="Apollo.io 1-click email finder URL")
    email: str = Field(default="", description="Contact email address if available")
    mobile: str = Field(default="", description="Contact mobile number if available")
    connection_note: str = Field(default="", max_length=300, description="Personalized LinkedIn connection message <= 300 characters")
    char_count: int = Field(default=0, description="Length of connection note")
    is_currently_employed: bool = Field(default=True, description="Whether currently verified working at target company")
    verification_evidence: str = Field(default="", description="Verification rationale / office location / hiring domain")

    @field_validator("connection_note")
    @classmethod
    def validate_length(cls, v: str) -> str:
        if len(v) > 300:
            return v[:297].rstrip() + "..."
        return v


class JobPosting(BaseModel):
    """Job record with deep ATS compatibility breakdown and batch tracking."""

    id: str = Field(default="", description="Unique Job ID")
    job_title: str = Field(..., description="Job Title")
    company: str = Field(..., description="Company")
    location: str = Field(default="Pune, Maharashtra, India", description="Location / Remote")
    job_type: str = Field(default="Full-time", description="Job Type")
    salary: str = Field(default="Competitive / As per industry standards", description="Salary / Compensation")
    experience_required: str = Field(default="3", description="Experience Required (Years or text)")
    key_skills: List[str] = Field(default_factory=list, description="Key Roles / Skills")
    application_url: str = Field(..., description="Application Website / URL")
    status: str = Field(default="Not Applied", description="Status (Not Applied, Applied, Interviewing)")
    remarks: str = Field(default="", description="User custom remarks")
    total_call_received: bool = Field(default=False, description="Total Call Received")
    job_description: str = Field(..., description="Job Description")
    source_type: str = Field(default="LinkedIn Active Job", description="Source of posting")
    apply_type: str = Field(default="Easy Apply", description="Application method: Easy Apply or On-Site Apply")
    batch_number: Optional[int] = Field(default=1, description="Batch sequence number")
    
    # Deep ATS Compatibility Metrics (Calculated ONLY after resume upload)
    ats_score: Optional[int] = Field(default=None, description="ATS resume compatibility score % (None if no resume uploaded)")
    match_score: Optional[int] = Field(default=None, description="Overall match score (None if no resume uploaded)")
    matched_skills: List[str] = Field(default_factory=list, description="Skills present in both Candidate Profile and JD")
    missing_skills: List[str] = Field(default_factory=list, description="Skills required in JD but missing in Candidate Profile")
    experience_match: str = Field(default="Compatible", description="Experience fit comparison")
    connections: List[ConnectionRecord] = Field(default_factory=list, description="HR / Hiring Team contacts")
    discovered_at: Optional[str] = Field(default="", description="Timestamp when job was discovered")
    posted_time: Optional[str] = Field(default="⚡ Posted < 24h", description="Recency tier: < 24h, < 48h, < 7d")


class CandidateProfile(BaseModel):
    """Candidate profile model for job matching and duplicate tracking."""

    name: str = Field(default="Candidate", description="Full Name")
    email: str = Field(default="candidate@example.com", description="Email Address")
    phone: str = Field(default="", description="Phone Number")
    location: str = Field(default="Pune, Maharashtra, India", description="Current Location")
    total_experience_years: float = Field(default=3.0, description="Total Years of Experience")
    experience_text: Optional[str] = Field(default="3.0 Years", description="Formatted experience string")
    primary_domain: str = Field(default="Software Engineering", description="Primary Technical Domain")
    target_roles: List[str] = Field(default_factory=list, description="Target Job Titles")
    top_skills: List[str] = Field(default_factory=list, description="Core Skills List")
    education: List[str] = Field(default_factory=list, description="Degrees and Institutions")
    linkedin: Optional[str] = Field(default="", description="LinkedIn URL")
    summary: Optional[str] = Field(default="", description="Professional summary")
    raw_resume_text: Optional[str] = Field(default="", description="Parsed Plain Text from Resume")
    reference_role: Optional[str] = Field(default="", description="Reference target role")
    suggested_seniority: Optional[str] = Field(default="all", description="Inferred Seniority Level: entry, intermediate, senior, lead, manager")
    recommended_search_role: Optional[str] = Field(default="", description="Primary clean role keyword for instant search")


class CandidateApplication(BaseModel):
    """Submitted job application record for recruiter follow-up."""

    id: Optional[str] = Field(default="", description="Application ID e.g. APP-2026-XXXX")
    job_id: str = Field(..., description="Target Job ID")
    job_title: str = Field(..., description="Target Job Title")
    company: str = Field(..., description="Target Company")
    candidate_name: str = Field(..., description="Candidate Full Name")
    candidate_email: str = Field(..., description="Candidate Email Address")
    candidate_phone: Optional[str] = Field(default="", description="Candidate Phone Number")
    candidate_location: Optional[str] = Field(default="", description="Candidate Location")
    experience_years: float = Field(default=0.0, description="Total Experience Years")
    skills: List[str] = Field(default_factory=list, description="Candidate Skills List")
    education: Optional[str] = Field(default="", description="Education Summary")
    portfolio_url: Optional[str] = Field(default="", description="Portfolio or GitHub URL")
    linkedin_url: Optional[str] = Field(default="", description="LinkedIn Profile URL")
    resume_filename: Optional[str] = Field(default="", description="Uploaded Resume Filename")
    resume_raw_text: Optional[str] = Field(default="", description="Extracted Plain Text Resume")
    additional_applied_job_ids: List[str] = Field(default_factory=list, description="Complementary job IDs applied to")
    applied_at: Optional[str] = Field(default="", description="Timestamp when applied")
    status: str = Field(default="New", description="Application status: New, Reviewing, Contacted, Shortlisted, Rejected")
    recruiter_notes: Optional[str] = Field(default="", description="Internal Recruiter Notes")

