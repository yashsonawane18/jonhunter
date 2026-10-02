import type {
  GenerateInterviewRequest,
  GenerateInterviewResponse,
  InterviewKit,
  InterviewMode,
} from './interviewTypes';
import API_ENDPOINTS from '../config/api';

// Calls POST /api/interview/generate to build the Interview Prep Kit.
// `mode` selects the generation path so both can be compared side by side:
//   'basic' - JD + company name only, no web access
//   'web'   - Gemini with Google Search grounding for real company facts

function getSessionToken(): string {
  return (
    localStorage.getItem('session_token') ||
    sessionStorage.getItem('session_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('token') ||
    ''
  );
}

export async function generateInterviewKit(
  req: GenerateInterviewRequest,
): Promise<GenerateInterviewResponse> {
  const res = await fetch(API_ENDPOINTS.INTERVIEW_GENERATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-SESSION-TOKEN': getSessionToken(),
    },
    body: JSON.stringify({
      user_id: req.userId,
      job_id: req.jobId || '',
      user_job_id: req.userJobId || '',
      job_title: req.jobTitle || '',
      company: req.company || '',
      jd_text: req.jdText || '',
      key_skills: req.keySkills || [],
      mode: req.mode,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `Interview kit generation failed (${res.status}): ${text || res.statusText}`,
    );
  }

  const data = await res.json();
  return {
    kit: (data.kit ?? data) as InterviewKit,
    mode: (data.mode ?? req.mode) as InterviewMode,
  };
}
