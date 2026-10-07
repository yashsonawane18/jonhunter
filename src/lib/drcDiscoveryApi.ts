/**
 * DRC Job Discovery & Excel Exporter API Client (drcDiscoveryApi.ts)
 * Connects the React Frontend to the co-located Job Discovery Engine (Port 5055).
 * Enhanced for Instant Sub-20ms Search, Pan-India Geo-Routing & Consulting ATS Scoring.
 */

export function getJobEngineCandidates(): string[] {
  const explicit = (import.meta as any).env?.VITE_JOB_ENGINE_URL;
  const isLocal =
    typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const candidates: string[] = [];

  if (explicit) {
    candidates.push(explicit.replace(/\/$/, ''));
  }
  if (isLocal) {
    candidates.push('http://127.0.0.1:5055');
    candidates.push('http://localhost:5055');
  }
  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL;
  if (apiBase) {
    candidates.push(apiBase.replace(/\/$/, ''));
  }
  if (!isLocal) {
    candidates.push('');
    candidates.push('http://127.0.0.1:5055');
  }
  return Array.from(new Set(candidates));
}

export const getEngineBaseUrl = (): string => {
  const candidates = getJobEngineCandidates();
  return candidates[0] || 'http://127.0.0.1:5055';
};

const ENGINE_BASE_URL = getEngineBaseUrl();

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
  work_mode?: 'remote_included' | 'remote_only' | 'hybrid' | 'onsite' | string;
  open_to_relocation?: boolean;
  notice_period?: string;
  skills?: string[];
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
  const endpoints = getJobEngineCandidates().map((base) => `${base}/api/locations`);
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep);
      if (res.ok) {
        const data = await res.json();
        if (data.locations && Array.isArray(data.locations)) {
          return data.locations;
        }
      }
    } catch {
      continue;
    }
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
    'Worldwide / Global Remote',
    'US / North America (Remote / Relocation)',
    'Europe & UK (Remote / Relocation)',
    'Singapore & APAC (Remote / Relocation)',
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
  experienceLevel: string = 'all',
  workMode: string = 'remote_included',
  openToRelocation: boolean = true,
  noticePeriod: string = 'Immediate',
  skills: string[] = []
): Promise<{ success: boolean; total: number; jobs: DiscoveredJobItem[] }> {
  const endpoints = getJobEngineCandidates().map((base) => `${base}/api/jobs/search`);
  let lastError: Error | null = null;

  const payload = {
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
          work_mode: candidate.work_mode || workMode,
          open_to_relocation: candidate.open_to_relocation ?? openToRelocation,
          notice_period: candidate.notice_period || noticePeriod,
        }
      : null,
    limit,
    source,
    exclude_job_ids: excludeJobIds,
    offset,
    experience_level: experienceLevel || 'all',
    work_mode: workMode || 'remote_included',
    open_to_relocation: openToRelocation,
    notice_period: noticePeriod || 'Immediate',
    skills: skills || [],
  };

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return await response.json();
      }
      const errorText = await response.text();
      lastError = new Error(`Instant search failed: ${errorText || response.statusText}`);
    } catch (e: any) {
      lastError = e;
    }
  }

  throw lastError || new Error('Instant search failed: Unable to reach Job Discovery Engine.');
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
  experienceLevel: string = 'all',
  workMode: string = 'remote_included',
  openToRelocation: boolean = true,
  noticePeriod: string = 'Immediate',
  skills: string[] = []
): Promise<DiscoveredJobItem[]> {
  const endpoints = getJobEngineCandidates().map((base) => `${base}/api/find-jobs`);
  let lastError: Error | null = null;

  const payload = {
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
      work_mode: candidate.work_mode || workMode,
      open_to_relocation: candidate.open_to_relocation ?? openToRelocation,
      notice_period: candidate.notice_period || noticePeriod,
    },
    max_jobs: maxJobs,
    reference_role: referenceRole,
    location_override: locationOverride,
    source: source || 'all',
    exclude_job_ids: excludeJobIds,
    offset,
    experience_level: experienceLevel || 'all',
    work_mode: workMode || 'remote_included',
    open_to_relocation: openToRelocation,
    notice_period: noticePeriod || 'Immediate',
    skills: skills || [],
  };

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return await response.json();
      }
      const errorText = await response.text();
      lastError = new Error(`Job discovery failed: ${errorText || response.statusText}`);
    } catch (e: any) {
      lastError = e;
    }
  }

  throw lastError || new Error('Job discovery failed: Unable to reach Job Discovery Engine.');
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
  const endpoints = getJobEngineCandidates().map((base) => `${base}/api/find-two-source-jobs`);
  let lastError: Error | null = null;

  const payload = {
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
  };

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return await response.json();
      }
      const errorText = await response.text();
      lastError = new Error(`Two-source job discovery failed: ${errorText || response.statusText}`);
    } catch (e: any) {
      lastError = e;
    }
  }

  throw lastError || new Error('Two-source job discovery failed: Unable to reach Job Discovery Engine.');
}

/**
 * Retrieves all historically discovered batches and jobs for a candidate.
 */
export async function getDiscoveredJobsHistory(candidateEmail: string): Promise<DiscoveredJobsResponse> {
  const endpoints = getJobEngineCandidates().map(
    (base) => `${base}/api/discovered-jobs?candidate_email=${encodeURIComponent(candidateEmail)}`
  );
  let lastError: Error | null = null;

  for (const url of endpoints) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (e: any) {
      lastError = e;
    }
  }

  throw lastError || new Error(`Failed to load discovered jobs history for ${candidateEmail}`);
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
  const endpoints = getJobEngineCandidates().map((base) => `${base}/api/update-job-status`);
  let lastError: Error | null = null;

  const payload = {
    candidate_email: candidateEmail,
    job_id: jobId,
    status,
    remarks,
  };

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (e: any) {
      lastError = e;
    }
  }

  throw lastError || new Error('Failed to update job status');
}
