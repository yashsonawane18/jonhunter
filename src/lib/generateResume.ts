import type {
  GenerateResumeRequest,
  GenerateResumeResponse,
  GeneratedResume,
  CoverLetter,
} from './resumeTypes';
import API_ENDPOINTS from '../config/api';

// ---------------------------------------------------------------------------
// MOCK MODE (current)
// The real backend endpoint (POST /api/resumes/generate) does not exist yet.
// Until it does, this returns a realistic, JD-aware resume after a short delay
// so the whole flow is testable in the browser with no backend.
//
// When the backend is ready, flip USE_MOCK to false and fill in the fetch
// below. Nothing else in the UI needs to change — same request/response shape.
//
//   import API_ENDPOINTS from '../config/api';
//   const res = await fetch(API_ENDPOINTS.RESUME_GENERATE, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'X-SESSION-TOKEN': sessionToken,
//     },
//     body: JSON.stringify({ user_id, job_id, user_job_id }),
//   });
//   if (!res.ok) throw new Error(`Generation failed: ${res.status}`);
//   const data = await res.json();
//   return { resume: data.resume ?? data };
// ---------------------------------------------------------------------------

// Set to true to use the local mock; false calls the real backend
// POST /api/resumes/generate. The real call only needs user_id + job_id —
// the backend resolves the full profile and JD itself.
const USE_MOCK = false;

function getSessionToken(): string {
  return (
    localStorage.getItem('session_token') ||
    sessionStorage.getItem('session_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('token') ||
    ''
  );
}

export async function generateResume(
  req: GenerateResumeRequest,
): Promise<GenerateResumeResponse> {
  if (USE_MOCK) {
    return generateResumeMock(req);
  }
  return generateResumeReal(req);
}

async function generateResumeReal(
  req: GenerateResumeRequest,
): Promise<GenerateResumeResponse> {
  const res = await fetch(API_ENDPOINTS.RESUME_GENERATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-SESSION-TOKEN': getSessionToken(),
    },
    body: JSON.stringify({
      user_id: req.userId,
      job_id: req.jobId,
      user_job_id: req.userJobId || '',
      // JD context sent directly so the backend can generate without a saved
      // job (BUG-006). The backend prefers a resolved DB job, else uses these.
      job_title: req.jobTitle || '',
      company: req.company || '',
      jd_text: req.jdText || '',
      key_skills: req.keySkills || [],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let message = text || res.statusText;
    try {
      message = JSON.parse(text).message || message;
    } catch {
      // Plain-text backend errors are still useful.
    }
    throw new Error(
      `Resume generation failed (${res.status}): ${message}`,
    );
  }

  const data = await res.json();
  const resume = data.resume as GeneratedResume;
  const coverLetter = data.coverLetter as CoverLetter;
  if (!hasRenderableResume(resume)) {
    throw new Error(
      'Resume generation returned an empty resume. Please add profile details or try again.',
    );
  }
  // Backend returns { resume, coverLetter } in the same shape as the mock.
  return {
    resume,
    coverLetter,
  };
}

function hasRenderableResume(resume: GeneratedResume | null | undefined): boolean {
  if (!resume) return false;
  return Boolean(
    resume.name?.trim() ||
      resume.title?.trim() ||
      resume.summary?.trim() ||
      resume.skills?.length ||
      resume.experience?.length ||
      resume.education?.length,
  );
}

export interface RegenerateRequest {
  instruction: string;
  target: 'resume' | 'coverLetter';
  resume: GeneratedResume;
  coverLetter: CoverLetter;
}

// Applies a free-text instruction to the current package and returns the
// updated { resume, coverLetter }. Mocked when USE_MOCK is true.
export async function regenerateResume(
  req: RegenerateRequest,
): Promise<GenerateResumeResponse> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    // Mock can't truly rewrite; return the input so the UI flow is testable.
    return { resume: req.resume, coverLetter: req.coverLetter };
  }

  const res = await fetch(API_ENDPOINTS.RESUME_REGENERATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-SESSION-TOKEN': getSessionToken(),
    },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `Regenerate failed (${res.status}): ${text || res.statusText}`,
    );
  }

  const data = await res.json();
  return {
    resume: data.resume as GeneratedResume,
    coverLetter: data.coverLetter as CoverLetter,
  };
}

async function generateResumeMock(
  req: GenerateResumeRequest,
): Promise<GenerateResumeResponse> {
  // Simulate model + network latency.
  await new Promise((resolve) => setTimeout(resolve, 1800));

  const company = req.company?.trim() || 'the target company';
  const role = req.jobTitle?.trim() || 'the role';
  const jdKeywords = extractKeywords(req.jdText, req.keySkills);

  const resume: GeneratedResume = {
    name: 'Vishwas',
    title: role,
    contact: {
      email: 'vishwas@email.com',
      phone: '+91 90000 00000',
      location: 'India',
      linkedin: 'linkedin.com/in/vishwas',
    },
    summary:
      `Lead/Principal professional (10+ years) tailored for ${role} at ${company}. ` +
      `Proven track record leading cross-functional teams, driving delivery within ` +
      `timelines and budget, and turning ${jdKeywords[0] || 'stakeholder'} priorities ` +
      `into measurable outcomes.`,
    skills: jdKeywords.slice(0, 12),
    experience: [
      {
        company: 'Current Employer',
        role: 'Lead / Principal',
        dates: '01/2019 - Present',
        bullets: [
          `Led cross-functional teams to deliver ${role}-aligned programs on time and within budget across multiple cycles.`,
          `Built and implemented processes that drove efficiencies and reduced costs, improving throughput by ~30%.`,
          `Owned stakeholder management with partners and vendors, aligning ${jdKeywords[1] || 'delivery'} to business goals.`,
        ],
      },
      {
        company: 'Previous Employer',
        role: 'Senior Manager',
        dates: '01/2014 - 12/2018',
        bullets: [
          `Managed post-delivery analysis and feedback loops to measure efficacy and continuously improve outcomes.`,
          `Developed vision and roadmap for new initiatives through in-depth research and SME interviews.`,
        ],
      },
    ],
    education: [
      {
        school: 'University',
        degree: 'Bachelor’s / Master’s',
        dates: '2010 — 2014',
      },
    ],
    matchScore: computeMatchScore(jdKeywords),
    highlights: [
      { value: '10+', label: 'Years Experience' },
      { value: '30%', label: 'Cost Reduction' },
      { value: '12+', label: 'Programs Led' },
      { value: '100%', label: 'On-Time Delivery' },
    ],
    achievements: [
      { title: 'On-time, on-budget delivery', detail: 'Led programs across multiple cycles hitting 100% of timeline and budget targets.' },
      { title: '30% efficiency gain', detail: 'Built processes that reduced costs and improved throughput.' },
      { title: 'Stakeholder alignment', detail: 'Owned partner and vendor relationships across cross-functional teams.' },
      { title: 'Cutting-edge content', detail: 'Partnered with SMEs and faculty to ship high-quality programs.' },
    ],
  };

  const coverLetter = buildCoverLetter(req, resume, jdKeywords);

  return { resume, coverLetter };
}

// Cover letter following the PRD structure: Hook → Why This Company →
// Why This Role → Top achievements → Call to action. ~250-350 words.
function buildCoverLetter(
  req: GenerateResumeRequest,
  resume: GeneratedResume,
  jdKeywords: string[],
): CoverLetter {
  const company = req.company?.trim() || 'your company';
  const role = req.jobTitle?.trim() || 'the role';
  const topSkills = jdKeywords.slice(0, 3).join(', ');
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const paragraphs = [
    // Hook
    `I was excited to come across the ${role} opening at ${company}. With 10+ years ` +
      `leading programs at Lead/Principal level, I bring a track record of turning ambitious ` +
      `goals into delivered outcomes — exactly the kind of ownership this role calls for.`,
    // Why this company
    `What draws me to ${company} is its focus on building high-quality work within real ` +
      `timelines and budgets. I want to contribute where ${topSkills || 'strong execution'} ` +
      `directly shape results, and where cross-functional collaboration is the norm rather ` +
      `than the exception.`,
    // Why this role
    `In this role I would lead and manage the team end to end — planning and budgeting, ` +
      `building processes that drive efficiency, and partnering closely with stakeholders, ` +
      `vendors, and experts to ship cutting-edge work. My experience maps closely to your ` +
      `priorities around ${topSkills || 'delivery and stakeholder management'}.`,
    // Top achievements
    `A couple of highlights: I led cross-functional teams to deliver programs on time and ` +
      `within budget across multiple cycles, and I built processes that reduced costs while ` +
      `improving throughput by roughly 30%. I would bring the same rigor to ${company}.`,
    // Call to action
    `I'd welcome the chance to discuss how I can help ${company} deliver its programs. ` +
      `Thank you for your time and consideration — I look forward to speaking with you.`,
  ];

  return {
    date: today,
    recipient: 'Hiring Manager',
    company,
    roleTitle: role,
    greeting: 'Dear Hiring Manager,',
    paragraphs,
    closing: 'Sincerely,',
    signature: resume.name,
  };
}

// Pull keywords from the JD text, preferring the explicit key-skills already on
// the job, then any recognised terms from a small dictionary.
function extractKeywords(jd: string, keySkills: string[]): string[] {
  const base = (keySkills || []).map((s) => s.trim()).filter(Boolean);

  const dictionary = [
    'Project Management',
    'Program Management',
    'Team Leadership',
    'Stakeholder Management',
    'Agile',
    'Scrum',
    'Content Strategy',
    'Budgeting',
    'Curriculum Design',
    'Process Optimization',
    'Vendor Management',
    'Learning Analytics',
    'Integration Testing',
  ];

  const lower = (jd || '').toLowerCase();
  const fromJd = dictionary.filter((k) =>
    k
      .toLowerCase()
      .split(/[^a-z]+/)
      .some((token) => token.length > 3 && lower.includes(token)),
  );

  return dedupe([...base, ...fromJd, ...dictionary]).slice(0, 12);
}

function computeMatchScore(keywords: string[]): number {
  // Fake but stable: more matched keywords → higher score, capped 72–94.
  const score = 72 + Math.min(keywords.length, 12) * 2;
  return Math.min(score, 94);
}

function dedupe(items: string[]): string[] {
  return Array.from(new Set(items));
}
