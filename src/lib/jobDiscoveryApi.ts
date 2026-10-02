/**
 * Job Discovery API utilities.
 *
 * Discovery is backend-driven. The server reads jobs from job_tracker,
 * calculates profile-aware match scores, and returns a ready-to-render shelf.
 */
import API_ENDPOINTS from '../config/api';

export interface DiscoveredJobListing {
  externalJobId: string;
  title: string;
  company: string;
  location: string;
  isRemote: boolean;
  jobUrl: string;
  postedDate: string;
  description: string;
  skills: string[];
  companyLogo?: string;
  employmentType?: string;
  salary?: string;
  source?: string;
  matchScore?: number;
  matchReason?: string;
}

export interface FetchDiscoveredJobsOptions {
  page?: number;
  minResults?: number;
  forceRefresh?: boolean;
  recent48Only?: boolean;
}

export interface DiscoveredJobsResponse {
  jobs: DiscoveredJobListing[];
  nextPage: number;
  generatedAt?: string;
  sourceStrategy?: string;
  isFallback?: boolean;
}

export interface SavedDiscoveredJob {
  id: string;
  external_job_id: string;
  job_title: string;
  company: string;
  job_url: string;
  location: string;
  is_remote: boolean;
  match_score: number | null;
  match_reason: string | null;
  status: 'saved' | 'pending_admin_apply' | 'applied' | 'rejected';
  applied_by_admin_id: string | null;
  applied_at: string | null;
  saved_at: string;
  user_id: string;
}

export interface PendingRequest {
  id: string;
  external_job_id: string;
  job_title: string;
  company: string;
  job_url: string;
  location: string;
  is_remote: boolean;
  match_score: number | null;
  match_reason: string | null;
  status: string;
  saved_at: string;
  user_id: string;
  user_name: string;
  user_email: string;
}

const getToken = (): string =>
  localStorage.getItem('session_token') ||
  sessionStorage.getItem('session_token') ||
  localStorage.getItem('token') ||
  sessionStorage.getItem('token') ||
  '';

const getHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  'X-SESSION-TOKEN': getToken(),
});

function normalizeJob(item: any): DiscoveredJobListing {
  const rawMatchScore = item.matchScore ?? item.match_score ?? item.score;
  return {
    externalJobId: String(item.externalJobId || item.external_job_id || item.id || item.jobUrl || crypto.randomUUID()),
    title: item.title || item.job_title || 'Untitled',
    company: item.company || 'Unknown',
    location: item.location || 'Location unknown',
    isRemote: Boolean(item.isRemote ?? item.is_remote),
    jobUrl: item.jobUrl || item.job_url || item.applicationUrl || '',
    postedDate: item.postedDate || item.posted_at || item.createdAt || new Date().toISOString(),
    description: item.description || '',
    skills: Array.isArray(item.skills) ? item.skills : [],
    companyLogo: item.companyLogo || item.company_logo || '',
    employmentType: item.employmentType || item.job_type || '',
    salary: item.salary || '',
    source: item.source || 'Careers',
    matchScore: typeof rawMatchScore === 'number' ? rawMatchScore : Number.isFinite(Number(rawMatchScore)) ? Number(rawMatchScore) : undefined,
    matchReason: item.matchReason || item.match_reason || item.reason || '',
  };
}

export async function fetchDiscoveredJobs(
  skills: string[],
  remoteOnly: boolean,
  role?: string,
  location?: string,
  aspirations?: string,
  experience?: string,
  options: FetchDiscoveredJobsOptions = {},
): Promise<DiscoveredJobsResponse> {
  const response = await fetch(API_ENDPOINTS.DISCOVERED_JOBS_SEARCH, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      skills,
      remoteOnly,
      role,
      location,
      aspirations,
      experience,
      page: options.page ?? 1,
      limit: options.minResults ?? 60,
      forceRefresh: options.forceRefresh ?? false,
      recent48Only: options.recent48Only ?? false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Discovery search failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    jobs: (data.jobs || []).map(normalizeJob),
    nextPage: data.nextPage || (options.page ?? 1) + 1,
    generatedAt: data.generatedAt,
    sourceStrategy: data.sourceStrategy,
    isFallback: Boolean(data.isFallback),
  };
}

export async function saveDiscoveredJob(
  job: DiscoveredJobListing,
  matchScore: number | null,
  matchReason: string | null,
  status: 'saved' | 'pending_admin_apply',
): Promise<SavedDiscoveredJob> {
  const response = await fetch(API_ENDPOINTS.DISCOVERED_JOBS_SAVE, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      external_job_id: job.externalJobId,
      job_title: job.title,
      company: job.company,
      job_url: job.jobUrl,
      location: job.location,
      is_remote: job.isRemote,
      match_score: matchScore,
      match_reason: matchReason,
      status,
      description: job.description,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save job');
  }

  return response.json();
}

export async function fetchPendingRequests(): Promise<PendingRequest[]> {
  const response = await fetch(API_ENDPOINTS.DISCOVERED_JOBS_ADMIN_PENDING, {
    headers: getHeaders(),
  });

  if (!response.ok) return [];
  return response.json();
}

export async function fetchPendingCount(): Promise<number> {
  const response = await fetch(API_ENDPOINTS.DISCOVERED_JOBS_ADMIN_PENDING_COUNT, {
    headers: getHeaders(),
  });

  if (!response.ok) return 0;
  const data = await response.json();
  return data.count || 0;
}

export async function applyOnBehalf(discoveredJobId: string): Promise<SavedDiscoveredJob> {
  const response = await fetch(API_ENDPOINTS.DISCOVERED_JOBS_ADMIN_APPLY(discoveredJobId), {
    method: 'PATCH',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to apply on behalf');
  }

  return response.json();
}

export async function fetchSavedDiscoveredJobs(): Promise<SavedDiscoveredJob[]> {
  const response = await fetch(API_ENDPOINTS.DISCOVERED_JOBS_LIST, {
    headers: getHeaders(),
  });

  if (!response.ok) return [];
  return response.json();
}
