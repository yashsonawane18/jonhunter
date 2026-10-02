/**
 * API Configuration
 * In dev mode the app uses an explicit backend host from env vars:
 * - `VITE_API_BASE_URL` for remote backend URLs (direct requests, no proxy)
 * - `VITE_LOCAL_API_BASE_URL` for a local backend at http://localhost:8090
 * In production builds, the app uses `VITE_API_BASE_URL` or same-origin.
 */
const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const configuredDevApiBaseUrl = (import.meta.env.VITE_DEV_API_BASE_URL || '').replace(/\/$/, '');
const localDevApiBaseUrl = (import.meta.env.VITE_LOCAL_API_BASE_URL || 'http://localhost:8090').replace(/\/$/, '');
const isLocalFrontend =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

/* const API_BASE_URL = isLocalFrontend
  ? configuredDevApiBaseUrl || localDevApiBaseUrl
  : configuredApiBaseUrl || ''; */
const API_BASE_URL = import.meta.env.DEV
  ? configuredApiBaseUrl || configuredDevApiBaseUrl || localDevApiBaseUrl
  : configuredApiBaseUrl || '';


// No development proxy: select a backend URL explicitly through .env.
/* const API_BASE_URL = import.meta.env.VITE_USE_LOCAL_API === 'true'
  ? localApiBaseUrl
  : deployedApiBaseUrl; */
  
export const normalizeHostedUrl = (url: string) => {
  if (!url || typeof window === 'undefined') return url;

  try {
    const parsed = new URL(url, window.location.origin);
    const currentHost = window.location.hostname.replace(/^www\./, '');
    const parsedHost = parsed.hostname.replace(/^www\./, '');
    if (parsedHost === currentHost && (parsed.pathname.startsWith('/files/') || parsed.pathname.startsWith('/api/'))) {
      return `${window.location.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    return url;
  }

  return url;
};

export const API_ENDPOINTS = {
  API_BASE_URL,
  // ================= AUTH =================
  SIGNUP: `${API_BASE_URL}/api/users/signup`,
  LOGIN: `${API_BASE_URL}/api/users/login`,
  SAVE_SKILLS: `${API_BASE_URL}/api/users/save`,
  PARSE_RESUME: `${API_BASE_URL}/api/resumes/parse`,
  // AI resume generation (backend endpoint TBD — currently mocked in
  // src/lib/generateResume.ts). Expected body: { user_id, job_id }.
  RESUME_GENERATE: `${API_BASE_URL}/api/resumes/generate`,
  // Apply a free-text instruction to an already-generated package.
  RESUME_REGENERATE: `${API_BASE_URL}/api/resumes/regenerate`,
  // Interview Prep Kit (Phase 2). Body: { user_id, job_id, jd_text, ..., mode }
  // where mode is 'basic' (JD only) or 'web' (Google Search grounded).
  INTERVIEW_GENERATE: `${API_BASE_URL}/api/interview/generate`,

  // ================= JOBS =================
  JOBS: `${API_BASE_URL}/api/jobs`,
  JOBS_PAGE: (page = 0, size = 50) =>
    `${API_BASE_URL}/api/jobs?page=${page}&size=${size}`,

  // ================= USER JOBS =================
  USER_JOBS: (userId: string) => `${API_BASE_URL}/api/user-jobs/${userId}`,
  USER_JOBS_UPDATE: (userId: string, jobId: string) =>
    `${API_BASE_URL}/api/user-jobs/${userId}/${jobId}`,
  USER_JOBS_STATUS: (userId: string, jobId: string) =>
    `${API_BASE_URL}/api/user-jobs/${userId}/${jobId}/status`,
  USER_JOBS_FETCH: (userId: string) =>
    `${API_BASE_URL}/api/user-jobs/user/${userId}`,
  USER_JOBS_DELETE: (userJobId: string) =>
    `${API_BASE_URL}/api/user-jobs/${userJobId}`,

  // ================= FILES =================
  FILES_UPLOAD: `${API_BASE_URL}/files/upload`,
  FILES_FETCH: (userId: string, fileName: string) =>
    `${API_BASE_URL}/files/${userId}/${fileName}`,
  FILES_UPLOAD_USERPROFILE: `${API_BASE_URL}/files/upload/userprofile`,
  FILES_PROFILE_PICTURE: (userId: string) =>
    `${API_BASE_URL}/files/profile_picture/${userId}`,

  // ================= JOB DISCOVERY =================
  JOBS_RELEVANT: (userId: string) =>
    `${API_BASE_URL}/api/jobs/relevant?user_id=${userId}`,

  APPLY: `${API_BASE_URL}/api/apply`,

  // ================= REFERRAL JOBS (candidate-safe) =================
  REFERRALS_OVERVIEW: `${API_BASE_URL}/api/referrals`,
  REFERRALS_CV: (fileName: string) => `${API_BASE_URL}/api/referrals/cv/${encodeURIComponent(fileName)}`,
  REFERRALS_SUBMIT_OPENING: (openingId: string) => `${API_BASE_URL}/api/referrals/openings/${openingId}/submit`,
  REFERRALS_SUBMIT_COMPANY: (companyId: string) => `${API_BASE_URL}/api/referrals/companies/${companyId}/submit`,

  // ================= ENQUIRIES =================
  DISCOVERY_CALL_ENQUIRY: `${API_BASE_URL}/api/enquiries/discovery-call`,
  ADMIN_DISCOVERY_CALL_ENQUIRIES: `${API_BASE_URL}/admin/enquiries/discovery-call`,
  AI_ENGINEER_ACCELERATOR_ENQUIRY: `${API_BASE_URL}/api/enquiries/ai-engineer-accelerator`,
  ADMIN_AI_ENGINEER_ACCELERATOR_ENQUIRIES: `${API_BASE_URL}/admin/enquiries/ai-engineer-accelerator`,
  CAREER_AUDIT_BOOKING: `${API_BASE_URL}/api/bookings/career-audit`,

  // ================= PROFILE =================

  // ---------- Professional Summary ----------
  PROFESSIONAL_SUMMARY_CREATE: (userId: string) =>
    `${API_BASE_URL}/api/users/professional-summary?userId=${userId}`,

  PROFESSIONAL_SUMMARY_GET: (userId: string) =>
    `${API_BASE_URL}/api/users/professional-summary/${userId}`,

  PROFESSIONAL_SUMMARY_UPDATE: (userId: string) =>
    `${API_BASE_URL}/api/users/professional-summary/${userId}`,

  PROFESSIONAL_SUMMARY_DELETE: (userId: string) =>
    `${API_BASE_URL}/api/users/professional-summary/${userId}`,

  // ---------- Career DNA ----------
  CAREER_DNA_CREATE: (userId: string) =>
    `${API_BASE_URL}/api/users/career-dna?userId=${userId}`,

  CAREER_DNA_GET: (userId: string) =>
    `${API_BASE_URL}/api/users/career-dna/${userId}`,

  // 🔥 FIXED
  CAREER_DNA_UPDATE: (userId: string) =>
    `${API_BASE_URL}/api/users/career-dna?userId=${userId}`,

  CAREER_DNA_DELETE: (userId: string) =>
    `${API_BASE_URL}/api/users/career-dna/${userId}`,

  // ---------- Education ----------
  EDUCATION_CREATE: (userId: string) =>
    `${API_BASE_URL}/api/users/education?userId=${userId}`,

  EDUCATION_GET: (userId: string) =>
    `${API_BASE_URL}/api/users/education/${userId}`,

  EDUCATION_UPDATE: (id: string) =>
    `${API_BASE_URL}/api/users/education/${id}`,

  EDUCATION_DELETE: (id: string) =>
    `${API_BASE_URL}/api/users/education/${id}`,

  // ---------- Skills ----------
  SKILLS_GET: (userId: string) => `${API_BASE_URL}/api/users/${userId}`,
  SKILLS_CREATE: () => `${API_BASE_URL}/api/users/save`,
  SKILLS_UPDATE: () => `${API_BASE_URL}/api/users/save`,

  // ---------- Experience ----------
  EXPERIENCE_GET: (userId: string) =>
    `${API_BASE_URL}/api/work-experience/${userId}`,
  EXPERIENCE_CREATE: (userId: string) =>
    `${API_BASE_URL}/api/work-experience/${userId}`,
  EXPERIENCE_UPDATE: (id: string) =>
    `${API_BASE_URL}/api/work-experience/${id}`,
  EXPERIENCE_DELETE: (id: string) =>
    `${API_BASE_URL}/api/work-experience/${id}`,

  // ---------- Certifications ----------
  CERTIFICATIONS_GET: (userId: string) =>
    `${API_BASE_URL}/api/users/certification/${userId}`,

  CERTIFICATION_CREATE: (userId: string) =>
    `${API_BASE_URL}/api/users/certification?userId=${userId}`,

  CERTIFICATION_UPDATE: (id: string) =>
    `${API_BASE_URL}/api/users/certification/${id}`,

  CERTIFICATION_DELETE: (id: string) =>
    `${API_BASE_URL}/api/users/certification/${id}`,

  // ---------- Preferences ----------
  PREFERENCES_GET: (userId: string) =>
    `${API_BASE_URL}/api/users/preferences/${userId}`,

  PREFERENCES_CREATE: (userId: string) =>
    `${API_BASE_URL}/api/users/preferences?userId=${userId}`,

  PREFERENCES_UPDATE: (userId: string) =>
    `${API_BASE_URL}/api/users/preferences?userId=${userId}`,

  // ---------- IT Skills ----------
  IT_SKILLS_GET: (userId: string) =>
    `${API_BASE_URL}/api/users/it-skills/${userId}`,

  IT_SKILL_CREATE: (userId: string) =>
    `${API_BASE_URL}/api/users/it-skills?userId=${userId}`,

  IT_SKILL_UPDATE: (id: string) =>
    `${API_BASE_URL}/api/users/it-skills/${id}`,

  IT_SKILL_DELETE: (id: string) =>
    `${API_BASE_URL}/api/users/it-skills/${id}`,

  // ---------- Languages ----------
  LANGUAGES_GET: (userId: string) =>
    `${API_BASE_URL}/api/users/languages/${userId}`,

  LANGUAGE_CREATE: (userId: string) =>
    `${API_BASE_URL}/api/users/languages?userId=${userId}`,

  LANGUAGE_UPDATE: (id: string) =>
    `${API_BASE_URL}/api/users/languages/${id}`,

  LANGUAGE_DELETE: (id: string) =>
    `${API_BASE_URL}/api/users/languages/${id}`,

  // ---------- Projects ----------
  PROJECTS_GET: (userId: string) =>
    `${API_BASE_URL}/api/users/projects/${userId}`,

  PROJECT_CREATE: (userId: string) =>
    `${API_BASE_URL}/api/users/projects?userId=${userId}`,

  PROJECT_UPDATE: (id: string) =>
    `${API_BASE_URL}/api/users/projects/${id}`,

  PROJECT_DELETE: (id: string) =>
    `${API_BASE_URL}/api/users/projects/${id}`,

  // ---------- Accomplishments ----------
  ACCOMPLISHMENTS_GET: (userId: string) =>
    `${API_BASE_URL}/api/users/accomplishments/${userId}`,

  ACCOMPLISHMENT_CREATE: (userId: string) =>
    `${API_BASE_URL}/api/users/accomplishments?userId=${userId}`,

  ACCOMPLISHMENT_UPDATE: (userId: string) =>
    `${API_BASE_URL}/api/users/accomplishments/${userId}`,

  ACCOMPLISHMENT_DELETE: (id: string) =>
    `${API_BASE_URL}/api/users/accomplishments/${id}`,

  // ---------- USER ----------
  USER_PROFILE: (userId: string) =>
    `${API_BASE_URL}/api/users/profile/${userId}`,

  USER_DETAILS: (userId: string) =>
    `${API_BASE_URL}/api/users/${userId}`,

  USER_UPDATE: () => `${API_BASE_URL}/api/users/save`,

  // ---------- Avatar ----------
  USER_AVATAR_UPLOAD: () =>
    `${API_BASE_URL}/files/upload/userprofile`,

  // ================= NOTIFICATIONS =================
  NOTIFICATIONS_GET: (userId: string) =>
    `${API_BASE_URL}/api/notifications/${userId}`,
  NOTIFICATIONS_UNREAD_COUNT: (userId: string) =>
    `${API_BASE_URL}/api/notifications/${userId}/unread-count`,
  NOTIFICATIONS_READ_ALL: (userId: string) =>
    `${API_BASE_URL}/api/notifications/${userId}/read-all`,

  // ================= WEEKLY PROGRESS TRACKER =================
  PROGRESS_CHECKINS: () =>
    `${API_BASE_URL}/api/progress/checkins`,
  PROGRESS_CHECKIN_DELETE: (id: string) =>
    `${API_BASE_URL}/api/progress/checkins/${id}`,
  PROGRESS_PROFILE: () =>
    `${API_BASE_URL}/api/progress/profile`,
  // adding for remove 500 error
  // ================= DASHBOARD =================
DASHBOARD_KPIS: () =>
  `${API_BASE_URL}/api/dashboard/kpis`,

// ================= TIMELINE =================
TIMELINE: (userJobId: string) =>
  `${API_BASE_URL}/api/timeline/${userJobId}`,

// // ================= NOTIFICATIONS =================
// NOTIFICATION_MESSAGES: (userJobId: string) =>
//   `${API_BASE_URL}/api/notifications/messages/${userJobId}`,
// ================= NOTIFICATIONS =================

NOTIFICATION_MESSAGES: (userJobId: string) =>
  `${API_BASE_URL}/api/notifications/messages/${userJobId}`,

NOTIFICATION_SEND_UPDATE: () =>
  `${API_BASE_URL}/api/notifications/send-update`,

NOTIFICATION_WEBHOOK: () =>
  `${API_BASE_URL}/api/notifications/webhook`,

  PROGRESS_PERSONA_GENERATE: () =>
    `${API_BASE_URL}/api/progress/persona/generate`,
  PROGRESS_ADMIN_REPORTS: () =>
    `${API_BASE_URL}/admin/progress/generate-reports`,

  // ================= JOB DISCOVERY =================
  DISCOVERED_JOBS_SAVE: `${API_BASE_URL}/api/discovered-jobs`,
  DISCOVERED_JOBS_LIST: `${API_BASE_URL}/api/discovered-jobs`,
  DISCOVERED_JOBS_SEARCH: `${API_BASE_URL}/api/discovered-jobs/search`,
  DISCOVERED_JOBS_ADMIN_PENDING: `${API_BASE_URL}/admin/discovered-jobs/pending`,
  DISCOVERED_JOBS_ADMIN_PENDING_COUNT: `${API_BASE_URL}/admin/discovered-jobs/pending-count`,
  DISCOVERED_JOBS_ADMIN_APPLY: (id: string) =>
    `${API_BASE_URL}/admin/discovered-jobs/${id}/apply`,
};

export default API_ENDPOINTS;
