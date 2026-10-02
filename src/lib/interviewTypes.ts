// Contract for the Interview Prep Kit (Phase 2).
// The kit has 7 sections, numbered 1-7 (these mirror sections 3-9 of the full
// DRC "Interview Preparation Kit" deliverable):
//   1. Job Description - Full Breakdown
//   2. Candidate-Role Fit Analysis
//   3. Your Unique Selling Points (USPs)
//   4. Elevator Pitch - Tell Me About Yourself
//   5. HR & General Interview Questions
//   6. Role Domain & Technical Questions
//   7. Behavioural (STAR) Questions
//
// Both generation paths (mode 'basic' = JD + company name only, and mode 'web'
// = Gemini with Google Search grounding) return this SAME shape, so the UI and
// the Word export are identical and only answer quality differs. That keeps the
// A/B comparison fair.

// --- 1. Job Description breakdown ---
export interface JdBreakdown {
  responsibilities: string[]; // "Core Responsibilities (as stated by <Company>)"
  candidateProfile: string[]; // "Desired Candidate Profile"
  readBetweenTheLines: string; // cream callout: what the JD implies but doesn't say
}

// --- 4. Candidate-Role Fit Analysis ---
// One row per JD requirement, matched to provable evidence from the profile.
export interface FitRow {
  requirement: string; // what the company asked for
  evidence: string; // specific, provable line from the candidate's background
}

export interface FitAnalysis {
  intro: string;
  rows: FitRow[];
  gapNote: string; // honest "one area to be upfront about" - never hidden
}

// --- 5. Unique Selling Points ---
export interface Usp {
  title: string; // e.g. "You already run the full requirements lifecycle solo"
  detail: string;
}

export interface UspSection {
  intro: string;
  usps: Usp[];
  closingTip: string; // cream callout: "How to Close Any Answer"
}

// --- 6. Elevator Pitch ---
export interface ElevatorPitch {
  intro: string; // structure note: Present -> Past -> Why Them
  script: string; // the pitch itself (grey script box)
  deliveryTips: string; // cream callout
}

// --- 7 & 8. Q&A style questions ---
export interface QaItem {
  question: string;
  approach?: string; // optional "Approach:" line
  answer: string; // model answer in the candidate's own voice
}

// --- 9. Behavioural (STAR) ---
export interface StarItem {
  question: string;
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface InterviewKit {
  candidateName: string;
  roleTitle: string;
  company: string;
  jdBreakdown: JdBreakdown; // 1
  fitAnalysis: FitAnalysis; // 2
  uspSection: UspSection; // 3
  elevatorPitch: ElevatorPitch; // 4
  hrQuestions: QaItem[]; // 5  (~8-10)
  technicalQuestions: QaItem[]; // 6  (~12-16)
  behaviouralQuestions: StarItem[]; // 7  (~6-8)
  sources?: string[]; // mode 'web' only: URLs actually used for company facts
}

// Which generation path produced / should produce the kit.
export type InterviewMode = 'basic' | 'web';

export interface GenerateInterviewRequest {
  userId: string;
  jobId?: string;
  userJobId?: string;
  jobTitle: string;
  company: string;
  jdText: string;
  keySkills: string[];
  mode: InterviewMode;
}

export interface GenerateInterviewResponse {
  kit: InterviewKit;
  mode: InterviewMode;
}
