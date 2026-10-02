/**
 * DRC Job Discovery & Excel Exporter API Client (drcDiscoveryApi.ts)
 * Connects the React Frontend to the co-located Job Discovery Engine (Port 5055).
 * Enhanced for Instant Sub-20ms Search, Pan-India Geo-Routing & Consulting ATS Scoring.
 */

const ENGINE_BASE_URL = (
  (import.meta as any).env?.VITE_JOB_ENGINE_URL ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname) ? 'http://127.0.0.1:5055' : '')
).replace(/\/$/, '');

export interface ConnectionRecord {
  name: string;
  title: string;
  linkedin_url: string;
  company_people_url?: string;
  apollo_url?: string;
  email?: string;
  mobile?: string;
  connection_note?: string;
  verification_evidence?: string;
}

export interface DiscoveredJobItem {
  id: string;
  candidate_email?: string;
  candidate_name?: string;
  batch_number?: number;
  job_title: string;
  company: string;
  location: string;
  job_type: string;
  salary: string;
  experience_required: string;
  key_skills: string[];
  application_url: string;
  status: 'Applied' | 'Not Applied' | string;
  remarks?: string;
  apply_type?: string;
  total_call_received?: boolean;
  job_description: string;
  source_type: string;
  ats_score: number;
  match_score: number;
  match_level?: string;
  match_tier?: string;
  matched_skills: string[];
  missing_skills: string[];
  consulting_competencies?: string[];
  experience_match: string;
  connections: ConnectionRecord[];
  discovered_at: string;
}

export interface DiscoveredBatch {
  batch_number: number;
  discovered_at: string;
  jobs_count: number;
  jobs: DiscoveredJobItem[];
}

export interface DiscoveredJobsResponse {
  candidate_email: string;
  candidate_name: string;
  total_jobs: number;
  total_batches: number;
  batches: DiscoveredBatch[];
  all_jobs: DiscoveredJobItem[];
}

export interface CandidateSearchPayload {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  total_experience_years?: number;
  primary_domain?: string;
  target_roles?: string[];
  top_skills: string[];
  raw_resume_text?: string;
}

/**
 * Checks if the local/hosted Job Engine micro-service is running.
 */
export async function checkJobEngineHealth(): Promise<boolean> {
  const endpoints = [
    ENGINE_BASE_URL ? `${ENGINE_BASE_URL}/api/health` : null,
    ENGINE_BASE_URL ? `${ENGINE_BASE_URL}/` : null,
    '/api/health',
    'http://127.0.0.1:5055/api/health',
  ].filter(Boolean) as string[];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, { method: 'GET', signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ONLINE') return true;
      }
    } catch {
      continue;
    }
  }
  return false;
}

/**
 * Fetches canonical Pan-India location dropdown list from backend.
 */
export async function fetchPanIndiaLocations(): Promise<string[]> {
  try {
    const res = await fetch(`${ENGINE_BASE_URL}/api/locations`);
    if (res.ok) {
      const data = await res.json();
      if (data.locations && Array.isArray(data.locations)) {
        return data.locations;
      }
    }
  } catch (err) {
    console.log('Location fetch notice:', err);
  }
  return [
    'All India (Remote & Nationwide)',
    'Bengaluru, Karnataka',
    'Pune, Maharashtra',
    'Hyderabad, Telangana',
    'Delhi NCR (Gurgaon / Noida)',
    'Mumbai / Navi Mumbai',
    'Chennai, Tamil Nadu',
    'Kolkata, West Bengal',
    'Ahmedabad / GIFT City, Gujarat',
    'Kochi / Trivandrum, Kerala',
    'Jaipur, Rajasthan',
    'Indore, Madhya Pradesh',
    'Chandigarh / Mohali',
  ];
}

/**
 * Sub-20ms Instant Job Search across Pan-India Requisitions.
 * Eliminates batch delays and applies consulting ATS compatibility scoring.
 */
export async function searchInstantJobs(
  query: string,
  location: string = 'All India (Remote & Nationwide)',
  domain: string = '',
  candidate?: CandidateSearchPayload | null,
  limit: number = 5,
  source: string = 'all',
  excludeJobIds: string[] = [],
  offset: number = 0,
  experienceLevel: string = 'all'
): Promise<{ success: boolean; total: number; jobs: DiscoveredJobItem[] }> {
  const response = await fetch(`${ENGINE_BASE_URL}/api/jobs/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: query || '',
      location: location || 'All India (Remote & Nationwide)',
      domain: domain || '',
      candidate: candidate
        ? {
            name: candidate.name || 'Candidate',
            email: candidate.email || 'candidate@example.com',
            phone: candidate.phone || '',
            location: candidate.location || location,
            total_experience_years: candidate.total_experience_years ?? 3.0,
            primary_domain: candidate.primary_domain || 'Software Engineering',
            target_roles: candidate.target_roles || [],
            top_skills: candidate.top_skills || [],
            raw_resume_text: candidate.raw_resume_text || '',
          }
        : null,
      limit,
      source,
      exclude_job_ids: excludeJobIds,
      offset,
      experience_level: experienceLevel || 'all',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Instant search failed: ${errorText || response.statusText}`);
  }

  return response.json();
}

/**
 * Discovers fresh matching jobs with strict Duplicate Guard.
 */
export async function findMatchingJobs(
  candidate: CandidateSearchPayload,
  maxJobs = 5,
  referenceRole?: string,
  locationOverride?: string,
  source: string = 'all',
  excludeJobIds: string[] = [],
  offset: number = 0,
  experienceLevel: string = 'all'
): Promise<DiscoveredJobItem[]> {
  const response = await fetch(`${ENGINE_BASE_URL}/api/find-jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      candidate: {
        name: candidate.name || 'Candidate',
        email: candidate.email,
        phone: candidate.phone || '',
        location: candidate.location || 'All India (Remote & Nationwide)',
        total_experience_years: candidate.total_experience_years ?? 3.0,
        primary_domain: candidate.primary_domain || 'Software Engineering',
        target_roles: candidate.target_roles || [],
        top_skills: candidate.top_skills || [],
        raw_resume_text: candidate.raw_resume_text || '',
      },
      max_jobs: maxJobs,
      reference_role: referenceRole,
      location_override: locationOverride,
      source: source || 'all',
      exclude_job_ids: excludeJobIds,
      offset,
      experience_level: experienceLevel || 'all',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Job discovery failed: ${errorText || response.statusText}`);
  }

  return response.json();
}

/**
 * Discovers side-by-side opportunities from both LinkedIn and Corporate Career Pages concurrently.
 */
export async function findTwoSourceJobs(
  candidate: CandidateSearchPayload,
  maxJobs = 10,
  referenceRole?: string,
  locationOverride?: string
): Promise<{
  all_jobs: DiscoveredJobItem[];
  linkedin_jobs: DiscoveredJobItem[];
  career_page_jobs: DiscoveredJobItem[];
  counts: { total: number; linkedin: number; career_pages: number };
}> {
  const response = await fetch(`${ENGINE_BASE_URL}/api/find-two-source-jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      candidate: {
        name: candidate.name || 'Candidate',
        email: candidate.email,
        phone: candidate.phone || '',
        location: candidate.location || 'All India (Remote & Nationwide)',
        total_experience_years: candidate.total_experience_years ?? 3.0,
        primary_domain: candidate.primary_domain || 'Software Engineering',
        target_roles: candidate.target_roles || [],
        top_skills: candidate.top_skills || [],
        raw_resume_text: candidate.raw_resume_text || '',
      },
      max_jobs: maxJobs,
      reference_role: referenceRole,
      location_override: locationOverride,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Two-source job discovery failed: ${errorText || response.statusText}`);
  }

  return response.json();
}

/**
 * Retrieves all historically discovered batches and jobs for a candidate.
 */
export async function getDiscoveredJobsHistory(candidateEmail: string): Promise<DiscoveredJobsResponse> {
  const response = await fetch(
    `${ENGINE_BASE_URL}/api/discovered-jobs?candidate_email=${encodeURIComponent(candidateEmail)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to load discovered jobs history for ${candidateEmail}`);
  }

  return response.json();
}

/**
 * Toggles status between "Applied" and "Not Applied" and saves remarks.
 */
export async function updateJobStatus(
  candidateEmail: string,
  jobId: string,
  status: 'Applied' | 'Not Applied',
  remarks = ''
): Promise<{ status: string; new_status: string; remarks: string }> {
  const response = await fetch(`${ENGINE_BASE_URL}/api/update-job-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      candidate_email: candidateEmail,
      job_id: jobId,
      status,
      remarks,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update job status`);
  }

  return response.json();
}
