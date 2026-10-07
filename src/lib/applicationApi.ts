/**
 * Application & Resume API Client (applicationApi.ts)
 * Connects frontend multi-step application flow to the Job Engine on Port 5055.
 */

import { DiscoveredJobItem, getJobEngineCandidates } from './drcDiscoveryApi';

const getEngineBaseUrl = (): string => {
  const candidates = getJobEngineCandidates();
  return candidates[0] || 'http://127.0.0.1:5055';
};

export interface CandidateParsedProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  total_experience_years: number;
  experience_text?: string;
  primary_domain: string;
  target_roles: string[];
  top_skills: string[];
  education: string[];
  linkedin?: string;
  summary?: string;
  raw_resume_text?: string;
  reference_role?: string;
  suggested_seniority?: 'all' | 'entry' | 'intermediate' | 'senior' | 'lead' | 'manager' | string;
  recommended_search_role?: string;
  work_mode?: 'remote_included' | 'remote_only' | 'hybrid' | 'onsite' | string;
  open_to_relocation?: boolean;
  notice_period?: string;
  skills?: string[];
}

export interface AtsScoreResult {
  ats_score: number;
  match_level: 'Excellent' | 'Good' | 'Fair' | 'Low';
  matched_skills: string[];
  missing_skills: string[];
  experience_fit_text: string;
  breakdown: {
    skill_score: number;
    skill_max: number;
    title_score: number;
    title_max: number;
    experience_score: number;
    experience_max: number;
  };
  recommendations: string[];
}

export interface CandidateApplicationPayload {
  id?: string;
  job_id: string;
  job_title: string;
  company: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  candidate_location?: string;
  experience_years: number;
  skills: string[];
  education?: string;
  portfolio_url?: string;
  linkedin_url?: string;
  resume_filename?: string;
  resume_raw_text?: string;
  additional_applied_job_ids?: string[];
  applied_at?: string;
  status?: string;
  recruiter_notes?: string;
}

/**
 * Uploads and parses a candidate's resume (PDF, DOCX, TXT)
 */
export async function parseCandidateResume(file: File): Promise<{
  success: boolean;
  filename: string;
  profile: CandidateParsedProfile;
}> {
  const endpoints = getJobEngineCandidates().map((base) => `${base}/api/parse-resume`);
  let lastError: Error | null = null;

  for (const url of endpoints) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        return await res.json();
      }
      const err = await res.json().catch(() => ({ detail: 'Failed to parse resume.' }));
      lastError = new Error(err.detail || 'Resume parsing failed.');
    } catch (e: any) {
      lastError = e;
    }
  }

  throw lastError || new Error('Resume parsing failed: Unable to reach Job Discovery Engine.');
}

/**
 * Fetches contextual job recommendations based on candidate's extracted skills
 */
export async function fetchJobRecommendations(
  skills: string[],
  role: string = '',
  excludeJobId: string = '',
  limit: number = 4
): Promise<DiscoveredJobItem[]> {
  const endpoints = getJobEngineCandidates().map((base) => `${base}/api/recommendations`);
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills,
          role,
          exclude_job_id: excludeJobId,
          limit,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.recommended_jobs || [];
      }
    } catch {
      continue;
    }
  }
  return [];
}

/**
 * Submits complete candidate application and saves to SQLite database
 */
export async function submitCandidateApplication(
  payload: CandidateApplicationPayload
): Promise<{ success: boolean; application_id: string; message: string }> {
  const endpoints = getJobEngineCandidates().map((base) => `${base}/api/applications`);
  let lastError: Error | null = null;

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return await res.json();
      }
      const err = await res.json().catch(() => ({ detail: 'Application submission failed.' }));
      lastError = new Error(err.detail || 'Failed to submit application.');
    } catch (e: any) {
      lastError = e;
    }
  }

  throw lastError || new Error('Failed to submit application: Unable to reach Job Discovery Engine.');
}

/**
 * Lists candidate applications for recruiter review
 */
export async function fetchCandidateApplications(limit = 50): Promise<CandidateApplicationPayload[]> {
  const endpoints = getJobEngineCandidates().map((base) => `${base}/api/applications?limit=${limit}`);
  for (const url of endpoints) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        return data.applications || [];
      }
    } catch {
      continue;
    }
  }
  return [];
}

/**
 * Calculates live ATS score between a candidate profile and a specific job
 */
export async function calculateAtsScore(
  profile: CandidateParsedProfile,
  jobTitle: string,
  jobDescription: string = '',
  jobExperienceRequired: string = '',
  jobKeySkills: string[] = []
): Promise<AtsScoreResult> {
  const endpoints = getJobEngineCandidates().map((base) => `${base}/api/ats-score`);
  let lastError: Error | null = null;

  const payload = {
    candidate_skills: profile.top_skills || [],
    candidate_experience_years: profile.total_experience_years || 3.0,
    candidate_domain: profile.primary_domain || '',
    candidate_target_roles: profile.target_roles || [],
    candidate_resume_text: profile.raw_resume_text || '',
    job_title: jobTitle,
    job_description: jobDescription,
    job_experience_required: jobExperienceRequired,
    job_key_skills: jobKeySkills,
  };

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e: any) {
      lastError = e;
    }
  }

  throw lastError || new Error('Failed to calculate ATS score');
}

/**
 * Batch scores multiple discovered jobs against candidate profile
 */
export async function scoreDiscoveredJobsWithResume(
  profile: CandidateParsedProfile,
  jobs: DiscoveredJobItem[]
): Promise<DiscoveredJobItem[]> {
  const endpoints = getJobEngineCandidates().map((base) => `${base}/api/score-jobs`);
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_skills: profile.top_skills || [],
          candidate_experience_years: profile.total_experience_years || 3.0,
          candidate_domain: profile.primary_domain || '',
          candidate_target_roles: profile.target_roles || [],
          candidate_resume_text: profile.raw_resume_text || '',
          jobs: jobs,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.scored_jobs || jobs;
      }
    } catch {
      continue;
    }
  }
  return jobs;
}
