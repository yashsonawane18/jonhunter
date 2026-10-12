import React from 'react';
import JonHunterJobPortal, { JonHunterJobPortalProps } from './jonhunter/JonHunterJobPortal';

// Experience / Seniority Levels
export interface SeniorityLevelOption {
  id: 'all' | 'entry' | 'intermediate' | 'senior' | 'lead' | 'manager';
  label: string;
  badge: string;
  description: string;
  iconColor: string;
}

export const SENIORITY_LEVELS: SeniorityLevelOption[] = [
  { id: 'all', label: 'All Seniority Levels (2-15+ Yrs)', badge: '2+ Yrs', description: 'Experienced bands (2-15+ years)', iconColor: 'text-zinc-300' },
  { id: 'intermediate', label: 'Mid Level Engineer', badge: '2-5 Yrs', description: 'Intermediate, Developer, SDE 2', iconColor: 'text-sky-400' },
  { id: 'senior', label: 'Senior Engineer / Specialist', badge: '5-8 Yrs', description: 'Senior, Specialist, SDE 3', iconColor: 'text-purple-400' },
  { id: 'lead', label: 'Staff / Principal / Architect', badge: '8-12 Yrs', description: 'Staff, Lead, Principal, Enterprise Architect', iconColor: 'text-amber-400' },
  { id: 'manager', label: 'Engineering Manager / Director', badge: '12+ Yrs', description: 'Engineering Manager, Director, Head of Tech', iconColor: 'text-rose-400' },
];

export interface InstantRoleFilter {
  id: string;
  name: string;
  category: string;
  keyword: string;
  popular?: boolean;
}

export const ROLE_CATEGORIES = [
  '🔥 Trending Roles',
  'All Roles',
  'Frontend & Full Stack',
  'Backend & Systems',
  'AI, GenAI & Data',
  'Business & Product',
  'Security, QA & Cloud',
] as const;

export const INSTANT_ROLE_FILTERS: InstantRoleFilter[] = [
  { id: 'fullstack_dev', name: 'Full Stack Developer', category: 'Frontend & Full Stack', keyword: 'Full Stack Developer', popular: true },
  { id: 'mern_stack', name: 'MERN Stack Developer', category: 'Frontend & Full Stack', keyword: 'MERN Stack Developer', popular: true },
  { id: 'java_dev', name: 'Java Developer (Spring Boot)', category: 'Backend & Systems', keyword: 'Java Developer', popular: true },
  { id: 'python_dev', name: 'Python Developer (Django / FastAPI)', category: 'Backend & Systems', keyword: 'Python Developer', popular: true },
  { id: 'business_analyst', name: 'Business Analyst', category: 'Business & Product', keyword: 'Business Analyst', popular: true },
  { id: 'product_manager', name: 'Product Manager', category: 'Business & Product', keyword: 'Product Manager', popular: true },
  { id: 'react_dev', name: 'React Developer / Frontend', category: 'Frontend & Full Stack', keyword: 'React Developer', popular: true },
  { id: 'node_dev', name: 'Node.js Backend Developer', category: 'Backend & Systems', keyword: 'Node.js Developer', popular: true },
  { id: 'devops_cloud', name: 'DevOps & Cloud Engineer', category: 'Security, QA & Cloud', keyword: 'DevOps Engineer', popular: true },
  { id: 'qa_sdet', name: 'QA & Automation Tester (SDET)', category: 'Security, QA & Cloud', keyword: 'QA Automation Engineer', popular: true },
  { id: 'data_analyst', name: 'Data Analyst & BI Specialist', category: 'AI, GenAI & Data', keyword: 'Data Analyst', popular: true },
  { id: 'data_eng', name: 'Data Engineer (PySpark / SQL)', category: 'AI, GenAI & Data', keyword: 'Data Engineer', popular: true },
  { id: 'ai_ml_eng', name: 'AI & Machine Learning Engineer', category: 'AI, GenAI & Data', keyword: 'Machine Learning Engineer', popular: true },
  { id: 'genai_llm', name: 'GenAI & LLM Architect', category: 'AI, GenAI & Data', keyword: 'GenAI LLM', popular: true },
  { id: 'ui_ux_designer', name: 'UI / UX Product Designer', category: 'Frontend & Full Stack', keyword: 'UI UX Designer', popular: true },
  { id: 'mobile_dev', name: 'Mobile App Developer (Flutter / React Native)', category: 'Frontend & Full Stack', keyword: 'Mobile Developer', popular: true },
  { id: 'cybersecurity', name: 'Cybersecurity Analyst & SecOps', category: 'Security, QA & Cloud', keyword: 'Cybersecurity', popular: true },
];

export type DiscoveredJobsTrackerProps = JonHunterJobPortalProps;

/**
 * DiscoveredJobsTracker - Naukri-inspired redesign with DRC green identity.
 * Delegates cleanly to the modular JonHunterJobPortal.
 */
export const DiscoveredJobsTracker: React.FC<DiscoveredJobsTrackerProps> = (props) => {
  return <JonHunterJobPortal {...props} />;
};

export default DiscoveredJobsTracker;
