// Shared "specific format" contract for the Generate Resume feature.
// The mock service (now) and the real backend endpoint (later) both return
// exactly this shape, so the UI never has to change when the backend lands.

// A labeled link from the candidate's profile Accomplishments (online
// profiles, work samples, publications, presentations, patents) that isn't
// already covered by linkedin/github — e.g. a portfolio site or a paper URL.
export interface ResumeContactLink {
  label: string;
  url: string;
}

export interface ResumeContact {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  links?: ResumeContactLink[];
}

export interface ResumeExperience {
  company: string;
  role: string;
  dates: string;
  bullets: string[]; // STAR + metric style, reordered to the JD
}

export interface ResumeEducation {
  school: string;
  degree: string;
  dates: string;
}

// A quantified stat for the "metrics strip" (e.g. { value: "20%", label: "Downtime Reduced" }).
export interface ResumeHighlight {
  value: string;
  label: string;
}

// A "Key Achievements" grid item.
export interface ResumeAchievement {
  title: string;
  detail: string;
}

// A project entry (used by the Early Career template). Populated ONLY from the
// candidate's real profile "projects" — never fabricated.
export interface ResumeProject {
  title: string;
  dates?: string;
  description?: string;
  bullets?: string[];
}

// A course / certification. From the candidate's real profile certifications;
// rendered at the end of the resume when present.
export interface ResumeCertification {
  name: string;
  issuer?: string;
  date?: string;
  url?: string;
}

export interface GeneratedResume {
  name: string;
  title: string; // headline tailored to the target role
  yearsExperience?: string; // total experience from profile, e.g. "6 years" (for Outreach)
  contact: ResumeContact;
  summary: string; // rewritten to the JD
  skills: string[]; // reordered to JD keywords
  experience: ResumeExperience[];
  education: ResumeEducation[];
  matchScore: number; // 0-100, JD vs resume
  highlights?: ResumeHighlight[]; // optional metrics strip
  achievements?: ResumeAchievement[]; // optional Key Achievements grid
  projects?: ResumeProject[]; // optional; from profile "projects" (Early Career template)
  certifications?: ResumeCertification[]; // optional; from profile certifications, rendered last
}

export type ResumeTemplateId =
  | 'modern'
  | 'classic'
  | 'corporate'
  | 'sidebar'
  // ATS-first single-column structures from the TechTalk CV templates:
  | 'ats-early' // "< 5 Years of Experience"
  | 'ats-senior'; // "5+ Years of Experience" (adds Key Achievements)

// Cover letter paired with the resume. Follows the PRD structure:
// Hook → Why This Company → Why This Role → Top achievements → Call to action.
export interface CoverLetter {
  date: string;
  recipient: string; // hiring manager name, or a role-appropriate salutation target
  company: string;
  roleTitle: string;
  greeting: string; // e.g. "Dear Hiring Manager,"
  paragraphs: string[]; // body paragraphs in order
  closing: string; // e.g. "Sincerely,"
  signature: string; // candidate name
}

// What the Generate Resume button sends. In the real flow the backend resolves
// the full candidate profile from user_id and the JD from job_id, so the client
// only needs identifiers (plus the JD text we already have on screen).
export interface GenerateResumeRequest {
  userId: string;
  jobId: string;
  userJobId?: string; // fallback id (the user-job wrapper) if jobId is missing
  jobTitle: string;
  company: string;
  jdText: string; // jobForm.insights
  keySkills: string[]; // jobForm.keyResponsibilities
}

export interface GenerateResumeResponse {
  resume: GeneratedResume;
  coverLetter: CoverLetter;
}
