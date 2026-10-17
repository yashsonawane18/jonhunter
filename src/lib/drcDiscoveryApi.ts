import { safeStorage } from './storage/safeStorage';
import { ApiError } from './errors/AppError';
import { errorLogger } from './errors/errorLogger';

let cachedWorkingEngineUrl: string | null = safeStorage.getItem<string | null>('drc_working_engine_url', null, 'session');

export function setCachedWorkingEngineUrl(url: string | null): void {
  if (!url) return;
  const cleanUrl = url.replace(/\/$/, '');
  cachedWorkingEngineUrl = cleanUrl;
  safeStorage.setItem('drc_working_engine_url', cleanUrl, 'session');
}

export function getCachedWorkingEngineUrl(): string | null {
  return cachedWorkingEngineUrl;
}

export function getJobEngineCandidates(): string[] {
  const explicit = (import.meta as any).env?.VITE_JOB_ENGINE_URL;
  const isLocal =
    typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const candidates: string[] = [];

  // Prioritize cached responsive URL from current session
  if (cachedWorkingEngineUrl) {
    candidates.push(cachedWorkingEngineUrl);
  }

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
    // Hosted Cloud Engine & Vercel Same-Origin Reverse Proxy
    candidates.push('https://jonhunter-9pkh.onrender.com');
    candidates.push('');
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
  fit_grade?: string;
  archetype?: string;
  match_reasons?: string[];
  ats_provider?: string;
  posted_time?: string;
}

export interface CareerCompanyInfo {
  name: string;
  ats: string;
  slug: string;
  hub: string;
  domain: string;
  careers_url: string;
}

export interface CareerPageStats {
  total_companies_tracked: number;
  ats_breakdown: Record<string, number>;
  direct_link_guarantee: string;
  supported_archetypes: string[];
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
 * Runs fast parallel probes (2.5s timeout) across all candidates.
 * Resolves in milliseconds if local or remote responds, caching the responsive base URL.
 */
export async function checkJobEngineHealth(): Promise<boolean> {
  const candidates = getJobEngineCandidates();
  if (candidates.length === 0) return false;

  const probePromises = candidates.map(async (base) => {
    const url = base ? `${base}/api/health` : '/api/health';
    const isLocalProbe = base.startsWith('http://localhost') || base.startsWith('http://127.0.0.1');
    try {
      const res = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(isLocalProbe ? 2500 : 4500),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && (data.status === 'ONLINE' || data.service)) {
          setCachedWorkingEngineUrl(base);
          return true;
        }
      }
    } catch {
      // Unreachable or timed out
    }
    throw new Error(`Probe failed for ${url}`);
  });

  try {
    await Promise.any(probePromises);
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetches canonical Pan-India location dropdown list from backend.
 */
export async function fetchPanIndiaLocations(): Promise<string[]> {
  const candidates = getJobEngineCandidates();
  for (const base of candidates) {
    const ep = base ? `${base}/api/locations` : '/api/locations';
    try {
      const res = await fetch(ep, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        if (data.locations && Array.isArray(data.locations)) {
          setCachedWorkingEngineUrl(base);
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
  const candidates = getJobEngineCandidates();
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

  for (const base of candidates) {
    const url = base ? `${base}/api/jobs/search` : '/api/jobs/search';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        setCachedWorkingEngineUrl(base);
        return await response.json();
      }
      if (response.status === 405) {
        // Skip endpoints that do not accept POST (e.g. static fallbacks)
        continue;
      }
      const errorText = await response.text().catch(() => '');
      lastError = new ApiError(`Instant search failed: ${errorText || response.statusText}`, {
        statusCode: response.status,
        endpoint: url,
        userMessage: 'Job discovery engine reported an issue. Falling back to local verified requisitions...',
      });
    } catch (e: any) {
      errorLogger.warn('drcDiscoveryApi', `Probe ${url} error: ${e?.message}`);
      lastError = new ApiError(e?.message || 'Connection error', {
        category: 'NETWORK_OFFLINE',
        endpoint: url,
        cause: e,
        userMessage: 'Unable to contact live search server. Falling back to verified archive...',
      });
    }
  }

  throw lastError || new ApiError('Unable to reach Job Discovery Engine.', { category: 'NETWORK_OFFLINE' });
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
  const candidates = getJobEngineCandidates();
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

  for (const base of candidates) {
    const url = base ? `${base}/api/find-jobs` : '/api/find-jobs';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        setCachedWorkingEngineUrl(base);
        return await response.json();
      }
      if (response.status === 405) {
        continue;
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
  const candidates = getJobEngineCandidates();
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

  for (const base of candidates) {
    const url = base ? `${base}/api/find-two-source-jobs` : '/api/find-two-source-jobs';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        setCachedWorkingEngineUrl(base);
        return await response.json();
      }
      if (response.status === 405) {
        continue;
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
  const candidates = getJobEngineCandidates();
  let lastError: Error | null = null;

  for (const base of candidates) {
    const url = base
      ? `${base}/api/discovered-jobs?candidate_email=${encodeURIComponent(candidateEmail)}`
      : `/api/discovered-jobs?candidate_email=${encodeURIComponent(candidateEmail)}`;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
      if (response.ok) {
        setCachedWorkingEngineUrl(base);
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
  const candidates = getJobEngineCandidates();
  let lastError: Error | null = null;

  const payload = {
    candidate_email: candidateEmail,
    job_id: jobId,
    status,
    remarks,
  };

  for (const base of candidates) {
    const url = base ? `${base}/api/update-job-status` : '/api/update-job-status';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        setCachedWorkingEngineUrl(base);
        return await response.json();
      }
    } catch (e: any) {
      lastError = e;
    }
  }

  throw lastError || new Error('Failed to update job status');
}

/**
 * Fetches the verified 140+ corporate employer catalog tracked on direct ATS portals.
 */
export async function fetchCareerPagesCompanies(): Promise<CareerCompanyInfo[]> {
  const candidates = getJobEngineCandidates();
  for (const base of candidates) {
    const url = base ? `${base}/api/career-pages/companies` : '/api/career-pages/companies';
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const data = await response.json();
        setCachedWorkingEngineUrl(base);
        return data.companies || [];
      }
    } catch {
      // try next
    }
  }
  return [];
}

/**
 * Fetches live coverage statistics for Corporate ATS portals.
 */
export async function fetchCareerPagesStats(): Promise<CareerPageStats | null> {
  const candidates = getJobEngineCandidates();
  for (const base of candidates) {
    const url = base ? `${base}/api/career-pages/stats` : '/api/career-pages/stats';
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const data = await response.json();
        setCachedWorkingEngineUrl(base);
        return data.stats || null;
      }
    } catch {
      // try next
    }
  }
  return null;
}

/**
 * Searches real-time corporate ATS portals directly with Archetype and Grade filters.
 */
export async function searchCareerPages(params: {
  query?: string;
  location?: string;
  ats_provider?: string;
  archetype?: string;
  min_grade?: string;
  limit?: number;
  candidate?: CandidateSearchPayload | null;
}): Promise<{ success: boolean; count: number; jobs: DiscoveredJobItem[] }> {
  const candidates = getJobEngineCandidates();
  let lastError: Error | null = null;

  const payload = {
    query: params.query || 'Software Engineer',
    location: params.location || 'All India (Remote & Nationwide)',
    ats_provider: params.ats_provider || 'all',
    archetype: params.archetype || 'all',
    min_grade: params.min_grade || 'all',
    limit: params.limit || 15,
    candidate: params.candidate || null,
  };

  for (const base of candidates) {
    const url = base ? `${base}/api/career-pages/search` : '/api/career-pages/search';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(12000),
      });

      if (response.ok) {
        setCachedWorkingEngineUrl(base);
        return await response.json();
      }
    } catch (e: any) {
      lastError = e;
    }
  }

  throw lastError || new Error('Corporate Career Pages search failed');
}
