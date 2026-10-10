import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  CheckCircle2,
  Circle,
  RefreshCw,
  Briefcase,
  MapPin,
  Building2,
  ShieldCheck,
  Layers,
  ChevronRight,
  AlertCircle,
  Clock,
  Sparkles,
  UserCheck,
  Send,
  UploadCloud,
  DollarSign,
  Filter,
  Globe,
  SlidersHorizontal,
  Compass,
  RotateCcw,
  GraduationCap,
  Award,
  Zap,
  Tag,
  Check,
  X,
  Star,
  Bookmark,
  BookmarkCheck,
  Trash2,
  FolderDown,
  Archive,
  CheckSquare,
  Plane,
  Home,
  Plus,
  Code2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DiscoveredJobItem,
  searchInstantJobs,
  fetchPanIndiaLocations,
  updateJobStatus,
  checkJobEngineHealth,
  getDiscoveredJobsHistory,
} from '../lib/drcDiscoveryApi';
import { useUser } from '../contexts/UserContext';
import { JobDetailModal, JobDetailData } from './JobDetailModal';
import { ApplicationFlowModal } from './application/ApplicationFlowModal';
import { ErrorBoundary } from './ErrorBoundary';
import {
  CandidateParsedProfile,
  parseCandidateResume,
  scoreDiscoveredJobsWithResume,
} from '../lib/applicationApi';
import discoveryFiltersConfig from '../config/discoveryFilters.json';

// Experience / Seniority Levels
export interface SeniorityLevelOption {
  id: 'all' | 'entry' | 'intermediate' | 'senior' | 'lead' | 'manager';
  label: string;
  badge: string;
  description: string;
  iconColor: string;
}

export const SENIORITY_LEVELS: SeniorityLevelOption[] = [
  { id: 'all', label: 'All Seniority Levels', badge: '🎓 Any Exp', description: 'All experience bands (0-15+ years)', iconColor: 'text-zinc-300' },
  { id: 'entry', label: 'Entry Level / Fresher / Junior', badge: '🟢 0-2 Yrs', description: 'Fresher, Graduate, Intern, Associate, SDE 1', iconColor: 'text-emerald-400' },
  { id: 'intermediate', label: 'Mid / Intermediate Level', badge: '🔵 2-5 Yrs', description: 'Intermediate, Developer, SDE 2', iconColor: 'text-sky-400' },
  { id: 'senior', label: 'Senior Engineer / Specialist', badge: '🟣 5-8 Yrs', description: 'Senior, Specialist, SDE 3', iconColor: 'text-purple-400' },
  { id: 'lead', label: 'Staff / Principal / Architect', badge: '👑 8+ Yrs', description: 'Staff, Lead, Principal, Enterprise Architect', iconColor: 'text-amber-400' },
  { id: 'manager', label: 'Engineering Manager / Director', badge: '💼 Leadership', description: 'Engineering Manager, Director, Head of Tech', iconColor: 'text-rose-400' },
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

// 36+ Instant 1-Click Role Filters including high-demand basic & trending roles
export const INSTANT_ROLE_FILTERS: InstantRoleFilter[] = [
  // 1. High-Demand Core Roles (Trending)
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

  // 2. Specialized Frontend & Full Stack
  { id: 'nextjs_react', name: 'Next.js & React Frontend Architect', category: 'Frontend & Full Stack', keyword: 'Next.js React' },
  { id: 'angular_fullstack', name: 'Angular Full Stack Developer', category: 'Frontend & Full Stack', keyword: 'Angular Developer' },
  { id: 'vue_frontend', name: 'Vue.js Modern Web UI Engineer', category: 'Frontend & Full Stack', keyword: 'Vue.js Frontend' },
  { id: 'ios_swift', name: 'iOS Native Developer (Swift / SwiftUI)', category: 'Frontend & Full Stack', keyword: 'iOS Swift Developer' },
  { id: 'android_kotlin', name: 'Android Native Developer (Kotlin)', category: 'Frontend & Full Stack', keyword: 'Android Kotlin Developer' },
  { id: 'frontend_perf', name: 'Frontend Performance & Design Systems', category: 'Frontend & Full Stack', keyword: 'Frontend Engineer' },

  // 3. Specialized Backend & Systems
  { id: 'golang_systems', name: 'Go / Golang Cloud Systems Engineer', category: 'Backend & Systems', keyword: 'Golang Developer' },
  { id: 'dotnet_core', name: 'C# / .NET Core Cloud Developer', category: 'Backend & Systems', keyword: '.NET Developer' },
  { id: 'rust_systems', name: 'Rust High-Performance Systems', category: 'Backend & Systems', keyword: 'Rust Systems Engineer' },
  { id: 'cloud_architect', name: 'Cloud & Solutions Architect (AWS/GCP)', category: 'Backend & Systems', keyword: 'Cloud Architect', popular: true },
  { id: 'k8s_sre', name: 'Kubernetes & Site Reliability (SRE)', category: 'Backend & Systems', keyword: 'SRE Kubernetes' },
  { id: 'database_dba', name: 'Database Administrator & DBA Architect', category: 'Backend & Systems', keyword: 'Database Administrator DBA' },

  // 4. Specialized AI & Data
  { id: 'mlops', name: 'MLOps & LLMOps Platform Engineer', category: 'AI, GenAI & Data', keyword: 'MLOps' },
  { id: 'data_platform', name: 'Data Platform & Lakehouse Architect', category: 'AI, GenAI & Data', keyword: 'Data Platform Lakehouse' },
  { id: 'nlp_cv', name: 'NLP & Computer Vision Scientist', category: 'AI, GenAI & Data', keyword: 'Computer Vision NLP' },
  { id: 'ai_agents', name: 'Autonomous AI Agents Specialist', category: 'AI, GenAI & Data', keyword: 'AI Agents Prompt Engineer' },

  // 5. Business, Leadership & Agile
  { id: 'solutions_arch', name: 'Enterprise Solutions Architect', category: 'Business & Product', keyword: 'Solutions Architect', popular: true },
  { id: 'eng_manager', name: 'Engineering Manager / Tech Lead', category: 'Business & Product', keyword: 'Engineering Manager' },
  { id: 'agile_lead', name: 'Scrum Master & Agile Delivery Lead', category: 'Business & Product', keyword: 'Scrum Master Agile' },
  { id: 'system_design', name: 'Distributed Systems & System Design', category: 'Business & Product', keyword: 'Distributed Systems Architect' },
  { id: 'embedded_iot', name: 'Embedded Systems & IoT Engineer', category: 'Business & Product', keyword: 'Embedded Systems IoT' },
  { id: 'devsecops', name: 'Cloud Security & DevSecOps Specialist', category: 'Security, QA & Cloud', keyword: 'DevSecOps Security' },
  { id: 'appsec_pen', name: 'Application Security & Pen Tester', category: 'Security, QA & Cloud', keyword: 'AppSec Penetration Tester' },
  { id: 'iac_terraform', name: 'Infrastructure as Code (Terraform)', category: 'Security, QA & Cloud', keyword: 'Terraform Infrastructure' },
];

const POPULAR_SKILLS_BY_DOMAIN: Record<string, string[]> = {
  frontend: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux', 'Vue.js', 'HTML5/CSS3', 'GraphQL', 'JavaScript'],
  backend: ['Python', 'FastAPI', 'Node.js', 'Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'AWS', 'Microservices', 'SQL'],
  fullstack: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'Next.js', 'MongoDB', 'REST API'],
  data: ['Python', 'SQL', 'PySpark', 'Snowflake', 'Power BI', 'Pandas', 'Databricks', 'ETL', 'Tableau', 'BigQuery'],
  devops: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Azure', 'GitHub Actions', 'Jenkins', 'Ansible'],
  ai: ['Python', 'PyTorch', 'TensorFlow', 'LLM', 'LangChain', 'RAG', 'GenAI', 'OpenAI', 'Computer Vision', 'NLP', 'FastAPI'],
  cloud: ['AWS', 'Azure', 'GCP', 'Terraform', 'Docker', 'Kubernetes', 'Cloud Security', 'DevOps', 'Microservices'],
  qa: ['Selenium', 'Playwright', 'Cypress', 'Python', 'Java', 'Manual Testing', 'API Testing', 'Postman', 'JIRA'],
  product: ['Product Strategy', 'Agile', 'Scrum', 'JIRA', 'User Stories', 'Roadmapping', 'Data Analytics', 'A/B Testing'],
  default: ['Python', 'React', 'AWS', 'SQL', 'Docker', 'Node.js', 'FastAPI', 'TypeScript', 'Kubernetes', 'Spring Boot', 'PySpark', 'GenAI'],
};

const getSuggestedSkillsForRole = (roleQuery: string): string[] => {
  const q = (roleQuery || '').toLowerCase();
  if (q.includes('front') || q.includes('ui') || q.includes('react') || q.includes('angular') || q.includes('design')) return POPULAR_SKILLS_BY_DOMAIN['frontend'];
  if (q.includes('back') || q.includes('java') || q.includes('api') || q.includes('node') || q.includes('django')) return POPULAR_SKILLS_BY_DOMAIN['backend'];
  if (q.includes('full') || q.includes('mern') || q.includes('web') || q.includes('software')) return POPULAR_SKILLS_BY_DOMAIN['fullstack'];
  if (q.includes('data') || q.includes('etl') || q.includes('analytics') || q.includes('bi')) return POPULAR_SKILLS_BY_DOMAIN['data'];
  if (q.includes('devops') || q.includes('sre') || q.includes('infra') || q.includes('platform')) return POPULAR_SKILLS_BY_DOMAIN['devops'];
  if (q.includes('ai') || q.includes('ml') || q.includes('genai') || q.includes('llm') || q.includes('intelligence')) return POPULAR_SKILLS_BY_DOMAIN['ai'];
  if (q.includes('cloud') || q.includes('aws') || q.includes('azure')) return POPULAR_SKILLS_BY_DOMAIN['cloud'];
  if (q.includes('qa') || q.includes('test') || q.includes('automation')) return POPULAR_SKILLS_BY_DOMAIN['qa'];
  if (q.includes('product') || q.includes('pm') || q.includes('owner')) return POPULAR_SKILLS_BY_DOMAIN['product'];
  return POPULAR_SKILLS_BY_DOMAIN['default'];
};

export const DiscoveredJobsTracker: React.FC = () => {
  const { user } = useUser();

  // Feature Visibility Flags (Configured via src/config/discoveryFilters.json)
  const showSeniorityFilter = useMemo(() => {
    if (typeof window !== 'undefined') {
      const urlParam = new URLSearchParams(window.location.search).get('seniorityFilter');
      if (urlParam === 'true') return true;
      if (urlParam === 'false') return false;
      const local = localStorage.getItem('drc_show_seniority_filter');
      if (local === 'true') return true;
      if (local === 'false') return false;
    }
    return Boolean(discoveryFiltersConfig.showSeniorityFilter);
  }, []);

  const showRoleFiltersMatrix = useMemo(() => {
    if (typeof window !== 'undefined') {
      const urlParam = new URLSearchParams(window.location.search).get('roleFilters');
      if (urlParam === 'true') return true;
      if (urlParam === 'false') return false;
      const local = localStorage.getItem('drc_show_role_filters_matrix');
      if (local === 'true') return true;
      if (local === 'false') return false;
    }
    return Boolean(discoveryFiltersConfig.showRoleFiltersMatrix);
  }, []);

  // Engine state
  const [engineOnline, setEngineOnline] = useState<boolean | null>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [isAppending, setIsAppending] = useState<boolean>(false);

  // Resume & Live ATS state
  const [resumeProfile, setResumeProfile] = useState<CandidateParsedProfile | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>('');
  const [parsingResume, setParsingResume] = useState<boolean>(false);
  const [minAtsScoreFilter, setMinAtsScoreFilter] = useState<'all' | '70' | '80' | '85'>('all');

  // Search, Seniority & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('All India (Remote & Nationwide)');
  const [selectedSeniority, setSelectedSeniority] = useState<'all' | 'entry' | 'intermediate' | 'senior' | 'lead' | 'manager'>('all');
  const [selectedRoleCategory, setSelectedRoleCategory] = useState<string>('🔥 Trending Roles');
  const [selectedActiveRole, setSelectedActiveRole] = useState<string | null>(null);
  const [roleFilterSearch, setRoleFilterSearch] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'career_page' | 'linkedin'>('all');
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  // Enhanced Candidate Search Preferences
  const [selectedWorkMode, setSelectedWorkMode] = useState<'remote_included' | 'remote_only' | 'hybrid' | 'onsite'>('remote_included');
  const [isOpenToRelocation, setIsOpenToRelocation] = useState<boolean>(true);
  const [selectedNoticePeriod, setSelectedNoticePeriod] = useState<string>('Immediate');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState<string>('');

  // Discovered Jobs Data & Duplicate-Guard State
  const [jobsList, setJobsList] = useState<DiscoveredJobItem[]>([]);
  const [seenJobIds, setSeenJobIds] = useState<Set<string>>(new Set());
  const [batchOffset, setBatchOffset] = useState<number>(0);

  // Persistent Discovered & Saved Requisitions Accumulator State (Never Trashed)
  const [allDiscoveredJobs, setAllDiscoveredJobs] = useState<DiscoveredJobItem[]>(() => {
    try {
      const saved = localStorage.getItem('drc_discovered_all_jobs_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('drc_starred_job_ids_v2');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // View Navigation: 'current_batch' (5 Fresh Jobs) vs 'saved_history' (All Discovered & Saved Requisitions)
  const [activeView, setActiveView] = useState<'current_batch' | 'saved_history'>('current_batch');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'saved' | 'applied' | 'not_applied'>('all');
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');
  const [historySourceFilter, setHistorySourceFilter] = useState<'all' | 'career_page' | 'linkedin'>('all');

  const candidateEmail = resumeProfile?.email || user?.email || 'candidate@drc.com';
  const candidateName = resumeProfile?.name || user?.name || 'Candidate';

  // Modals state
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<JobDetailData | null>(null);
  const [selectedJobForApplication, setSelectedJobForApplication] = useState<{
    id: string;
    title: string;
    company: string;
    location?: string;
    salary?: string;
    skills?: string[];
    description?: string;
    experience?: string;
    applicationUrl?: string;
  } | null>(null);

  // Status update remark input state per job
  const [editingRemarks, setEditingRemarks] = useState<{ [jobId: string]: string }>({});

  // 1. Verify Engine Health & Fetch Locations
  const verifyEngine = useCallback(async () => {
    const online = await checkJobEngineHealth();
    setEngineOnline(online);
    if (online) {
      const locs = await fetchPanIndiaLocations();
      setAvailableLocations(locs);
    }
    return online;
  }, []);

  // Sync with Backend SQLite Discovered History on Mount
  useEffect(() => {
    if (candidateEmail && !candidateEmail.startsWith('preview')) {
      getDiscoveredJobsHistory(candidateEmail)
        .then((res) => {
          if (res && res.all_jobs && res.all_jobs.length > 0) {
            setAllDiscoveredJobs((prev) => {
              const existingMap = new Map(prev.map((j) => [j.id || j.application_url, j]));
              res.all_jobs.forEach((j) => {
                const key = j.id || j.application_url;
                if (!existingMap.has(key)) {
                  existingMap.set(key, j);
                }
              });
              const merged = Array.from(existingMap.values());
              try {
                localStorage.setItem('drc_discovered_all_jobs_v2', JSON.stringify(merged.slice(0, 1000)));
              } catch (e) {
                console.warn('LocalStorage save notice:', e);
              }
              return merged;
            });
          }
        })
        .catch((err) => console.log('SQLite history fetch notice:', err));
    }
  }, [candidateEmail]);

  // 2. Fresh Search Requisitions (5 Jobs per Batch with Strict Channel Allocation, Seniority, Work Mode, Skills & Deduplication)
  const executeFreshSearch = useCallback(
    async (
      query: string = searchQuery,
      location: string = selectedLocation,
      seniority: 'all' | 'entry' | 'intermediate' | 'senior' | 'lead' | 'manager' = selectedSeniority,
      channel: 'all' | 'career_page' | 'linkedin' = selectedChannel,
      isAppend: boolean = false,
      profile: CandidateParsedProfile | null = resumeProfile,
      customSeen?: Set<string>,
      workMode: 'remote_included' | 'remote_only' | 'hybrid' | 'onsite' = selectedWorkMode,
      relocation: boolean = isOpenToRelocation,
      noticePeriod: string = selectedNoticePeriod,
      skills: string[] = selectedSkills
    ) => {
      if (isAppend) {
        setIsAppending(true);
      } else {
        setSearching(true);
      }

      try {
        const currentSeenSet = customSeen || seenJobIds;
        const currentSeenArray = Array.from(currentSeenSet);
        const limit = 5;

        const result = await searchInstantJobs(
          query,
          location,
          '',
          profile
            ? {
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                location: profile.location,
                total_experience_years: profile.total_experience_years,
                primary_domain: profile.primary_domain,
                target_roles: profile.target_roles,
                top_skills: profile.top_skills,
                raw_resume_text: profile.raw_resume_text,
                work_mode: workMode,
                open_to_relocation: relocation,
                notice_period: noticePeriod,
                skills: skills,
              }
            : null,
          limit,
          channel,
          currentSeenArray,
          isAppend ? batchOffset : 0,
          seniority,
          workMode,
          relocation,
          noticePeriod,
          skills
        );

        let retrieved = result.jobs || [];

        // If resume profile active, calculate deep ATS scores
        if (profile && retrieved.length > 0) {
          retrieved = await scoreDiscoveredJobsWithResume(profile, retrieved);
        }

        // Update seen IDs set to avoid any future repetition
        const updatedSeen = new Set(currentSeenSet);
        retrieved.forEach((j) => {
          if (j.id) updatedSeen.add(j.id);
          if (j.application_url) updatedSeen.add(j.application_url);
        });
        setSeenJobIds(updatedSeen);

        // Accumulate into allDiscoveredJobs (Never Trashed Persistence)
        if (retrieved.length > 0) {
          setAllDiscoveredJobs((prev) => {
            const existingMap = new Map(prev.map((j) => [j.id || j.application_url, j]));
            retrieved.forEach((j) => {
              const key = j.id || j.application_url;
              if (!existingMap.has(key)) {
                existingMap.set(key, j);
              } else {
                const ex = existingMap.get(key)!;
                existingMap.set(key, { ...ex, ...j, ats_score: j.ats_score || ex.ats_score });
              }
            });
            const updated = Array.from(existingMap.values());
            try {
              localStorage.setItem('drc_discovered_all_jobs_v2', JSON.stringify(updated.slice(0, 1000)));
            } catch (e) {
              console.warn('LocalStorage save notice:', e);
            }
            return updated;
          });
        }

        if (isAppend) {
          setJobsList((prev) => [...prev, ...retrieved]);
          setBatchOffset((prev) => prev + 1);
          if (retrieved.length > 0) {
            toast.success(`Loaded ${retrieved.length} more fresh jobs (Total Active: ${jobsList.length + retrieved.length})`);
          } else {
            toast.info('No more new jobs found matching these filters. Try resetting history or broadening keywords.');
          }
        } else {
          setJobsList(retrieved);
          setBatchOffset(1);
          if (retrieved.length > 0) {
            const careerCount = retrieved.filter(
              (j) =>
                j.source_type?.toLowerCase().includes('career') ||
                (!j.application_url?.includes('linkedin.com') && !j.source_type?.toLowerCase().includes('linkedin'))
            ).length;
            const liCount = retrieved.length - careerCount;

            const seniorityBadge = SENIORITY_LEVELS.find((s) => s.id === seniority)?.badge || '';

            if (channel === 'all') {
              toast.success(`Found 5 fresh jobs ${seniorityBadge} (${careerCount} Career Pages + ${liCount} LinkedIn)`);
            } else if (channel === 'career_page') {
              toast.success(`Found ${retrieved.length} fresh Career Page jobs ${seniorityBadge}`);
            } else {
              toast.success(`Found ${retrieved.length} fresh LinkedIn jobs ${seniorityBadge}`);
            }
          } else {
            toast.info('No new jobs found matching these filters. Try resetting seen history or changing search keywords.');
          }
        }
      } catch (err: any) {
        console.error('Instant search notice:', err.message);
        toast.error(`Search failed: ${err.message}`);
      } finally {
        setSearching(false);
        setIsAppending(false);
      }
    },
    [searchQuery, selectedLocation, selectedSeniority, selectedChannel, resumeProfile, seenJobIds, batchOffset, jobsList.length, selectedWorkMode, isOpenToRelocation, selectedNoticePeriod, selectedSkills]
  );

  const suggestedSkills = useMemo(() => {
    const roleText = searchQuery || selectedActiveRole || resumeProfile?.primary_domain || '';
    return getSuggestedSkillsForRole(roleText);
  }, [searchQuery, selectedActiveRole, resumeProfile?.primary_domain]);

  // Initial load
  useEffect(() => {
    verifyEngine().then((online) => {
      if (online) {
        executeFreshSearch('', 'All India (Remote & Nationwide)', 'all', 'all', false);
      }
    });
  }, [verifyEngine]);

  // Handlers for instant clicks
  const handleSenioritySelect = (seniority: 'all' | 'entry' | 'intermediate' | 'senior' | 'lead' | 'manager') => {
    setSelectedSeniority(seniority);
    executeFreshSearch(searchQuery, selectedLocation, seniority, selectedChannel, false);
  };

  const handleInstantRoleClick = (role: InstantRoleFilter) => {
    if (selectedActiveRole === role.id) {
      // Toggle off
      setSelectedActiveRole(null);
      setSearchQuery('');
      executeFreshSearch('', selectedLocation, selectedSeniority, selectedChannel, false);
    } else {
      // Toggle on
      setSelectedActiveRole(role.id);
      setSearchQuery(role.keyword);
      executeFreshSearch(role.keyword, selectedLocation, selectedSeniority, selectedChannel, false);
    }
  };

  const handleLocationChange = (newLoc: string) => {
    setSelectedLocation(newLoc);
    executeFreshSearch(searchQuery, newLoc, selectedSeniority, selectedChannel, false);
  };

  const handleChannelChange = (newChannel: 'all' | 'career_page' | 'linkedin') => {
    setSelectedChannel(newChannel);
    executeFreshSearch(searchQuery, selectedLocation, selectedSeniority, newChannel, false);
  };

  const handleManualSearch = () => {
    executeFreshSearch(searchQuery, selectedLocation, selectedSeniority, selectedChannel, false);
  };

  const handleWorkModeChange = (mode: 'remote_included' | 'remote_only' | 'hybrid' | 'onsite') => {
    setSelectedWorkMode(mode);
    executeFreshSearch(searchQuery, selectedLocation, selectedSeniority, selectedChannel, false, resumeProfile, undefined, mode, isOpenToRelocation, selectedNoticePeriod, selectedSkills);
  };

  const handleToggleRelocation = () => {
    const nextVal = !isOpenToRelocation;
    setIsOpenToRelocation(nextVal);
    executeFreshSearch(searchQuery, selectedLocation, selectedSeniority, selectedChannel, false, resumeProfile, undefined, selectedWorkMode, nextVal, selectedNoticePeriod, selectedSkills);
  };

  const handleNoticePeriodChange = (np: string) => {
    setSelectedNoticePeriod(np);
    executeFreshSearch(searchQuery, selectedLocation, selectedSeniority, selectedChannel, false, resumeProfile, undefined, selectedWorkMode, isOpenToRelocation, np, selectedSkills);
  };

  const handleToggleSkill = (skill: string) => {
    const isSelected = selectedSkills.includes(skill);
    const updated = isSelected ? selectedSkills.filter((s) => s !== skill) : [...selectedSkills, skill];
    setSelectedSkills(updated);
    executeFreshSearch(searchQuery, selectedLocation, selectedSeniority, selectedChannel, false, resumeProfile, undefined, selectedWorkMode, isOpenToRelocation, selectedNoticePeriod, updated);
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    if (!selectedSkills.includes(trimmed)) {
      const updated = [...selectedSkills, trimmed];
      setSelectedSkills(updated);
      setCustomSkillInput('');
      executeFreshSearch(searchQuery, selectedLocation, selectedSeniority, selectedChannel, false, resumeProfile, undefined, selectedWorkMode, isOpenToRelocation, selectedNoticePeriod, updated);
    } else {
      setCustomSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = selectedSkills.filter((s) => s !== skillToRemove);
    setSelectedSkills(updated);
    executeFreshSearch(searchQuery, selectedLocation, selectedSeniority, selectedChannel, false, resumeProfile, undefined, selectedWorkMode, isOpenToRelocation, selectedNoticePeriod, updated);
  };

  const handleResetSeenHistory = () => {
    const emptySet = new Set<string>();
    setSeenJobIds(emptySet);
    setBatchOffset(0);
    toast.info('Seen history reset. Re-running fresh search from the beginning...');
    executeFreshSearch(searchQuery, selectedLocation, selectedSeniority, selectedChannel, false, resumeProfile, emptySet);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedActiveRole(null);
    setSelectedLocation('All India (Remote & Nationwide)');
    setSelectedSeniority('all');
    setSelectedRoleCategory('🔥 Trending Roles');
    setSelectedChannel('all');
    setSelectedWorkMode('remote_included');
    setIsOpenToRelocation(true);
    setSelectedNoticePeriod('Immediate');
    setSelectedSkills([]);
    setCustomSkillInput('');
    setRoleFilterSearch('');
    executeFreshSearch('', 'All India (Remote & Nationwide)', 'all', 'all', false, resumeProfile, undefined, 'remote_included', true, 'Immediate', []);
  };

  // 3. Resume Upload & 70-100% ATS Matching Workflow
  const handleResumeUpload = async (file: File) => {
    setParsingResume(true);
    try {
      toast.info(`Parsing "${file.name}" with Deterministic Zero-LLM Engine...`);
      const parseResult = await parseCandidateResume(file);
      const parsedProf = parseResult.profile;

      setResumeProfile(parsedProf);
      setResumeFileName(file.name);
      setMinAtsScoreFilter('70'); // Set default ATS filter to 70%+ for precision matching
      toast.success(`Resume parsed for ${parsedProf.name}! Domain: ${parsedProf.primary_domain}`);

      // Extract recommended target role and seniority
      const targetRole = parsedProf.recommended_search_role || parsedProf.target_roles?.[0] || '';
      let autoSeniority: 'all' | 'entry' | 'intermediate' | 'senior' | 'lead' | 'manager' = 
        (parsedProf.suggested_seniority as any) || 'all';

      if (!parsedProf.suggested_seniority && parsedProf.total_experience_years !== undefined) {
        if (parsedProf.total_experience_years <= 2) autoSeniority = 'entry';
        else if (parsedProf.total_experience_years <= 5) autoSeniority = 'intermediate';
        else if (parsedProf.total_experience_years <= 8) autoSeniority = 'senior';
        else autoSeniority = 'lead';
      }

      // Auto-populate search bar, seniority, and skill filters
      if (targetRole) {
        setSearchQuery(targetRole);
      }
      setSelectedSeniority(autoSeniority);
      const extractedSkills = (parsedProf.top_skills || []).slice(0, 8);
      setSelectedSkills(extractedSkills);

      // Direct Live Market Discovery for 70-100% ATS Matching Requisitions
      toast.info(`Discovering verified live requisitions matching ${parsedProf.name}'s profile (70-100% ATS Target)...`);
      await executeFreshSearch(
        targetRole || searchQuery,
        selectedLocation,
        autoSeniority,
        selectedChannel,
        false,
        parsedProf,
        undefined,
        selectedWorkMode,
        isOpenToRelocation,
        selectedNoticePeriod,
        extractedSkills
      );

      // Asynchronously evaluate existing saved history with updated scores
      if (allDiscoveredJobs.length > 0) {
        scoreDiscoveredJobsWithResume(parsedProf, allDiscoveredJobs)
          .then((scoredSavedJobs) => {
            setAllDiscoveredJobs(scoredSavedJobs);
            try {
              localStorage.setItem('drc_discovered_all_jobs_v2', JSON.stringify(scoredSavedJobs.slice(0, 1000)));
            } catch (e) {
              console.warn('LocalStorage save notice:', e);
            }
          })
          .catch((err) => console.log('Background history score notice:', err));
      }
    } catch (err: any) {
      toast.error(`Resume parsing failed: ${err.message}`);
    } finally {
      setParsingResume(false);
    }
  };

  const handleClearResume = () => {
    setResumeProfile(null);
    setResumeFileName('');
    setMinAtsScoreFilter('all');
    toast.info('Resume cleared. Showing standard verified jobs view.');
    executeFreshSearch(searchQuery, selectedLocation, selectedSeniority, selectedChannel, false, null);
  };

  // 4. Toggle Star / Bookmark on a Job
  const handleToggleStar = (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
        toast.info('Removed from starred jobs');
      } else {
        next.add(jobId);
        toast.success('Job saved to Starred collection ⭐');
      }
      try {
        localStorage.setItem('drc_starred_job_ids_v2', JSON.stringify(Array.from(next)));
      } catch (e) {
        console.warn('LocalStorage star save notice:', e);
      }
      return next;
    });
  };

  // 5. Toggle Status (Not Applied <-> Applied)
  const handleToggleStatus = async (job: DiscoveredJobItem) => {
    const nextStatus = job.status === 'Applied' ? 'Not Applied' : 'Applied';
    const remark = editingRemarks[job.id] !== undefined ? editingRemarks[job.id] : job.remarks || '';

    try {
      await updateJobStatus(candidateEmail, job.id, nextStatus as any, remark);
      setJobsList((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: nextStatus, remarks: remark } : j))
      );
      setAllDiscoveredJobs((prev) => {
        const updated = prev.map((j) => (j.id === job.id ? { ...j, status: nextStatus, remarks: remark } : j));
        try {
          localStorage.setItem('drc_discovered_all_jobs_v2', JSON.stringify(updated.slice(0, 1000)));
        } catch {}
        return updated;
      });
      toast.success(`Job marked as ${nextStatus}`);
    } catch (err: any) {
      toast.error(`Failed to update status: ${err.message}`);
    }
  };

  // 6. Save Remarks
  const handleSaveRemark = async (jobId: string, currentStatus: string) => {
    const remark = editingRemarks[jobId] || '';
    try {
      await updateJobStatus(candidateEmail, jobId, currentStatus as any, remark);
      setJobsList((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, remarks: remark } : j))
      );
      setAllDiscoveredJobs((prev) => {
        const updated = prev.map((j) => (j.id === jobId ? { ...j, remarks: remark } : j));
        try {
          localStorage.setItem('drc_discovered_all_jobs_v2', JSON.stringify(updated.slice(0, 1000)));
        } catch {}
        return updated;
      });
      toast.success('Remarks saved');
    } catch {
      toast.error('Failed to save remarks');
    }
  };

  // 7. Delete Saved Job from History
  const handleDeleteSavedJob = (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAllDiscoveredJobs((prev) => {
      const updated = prev.filter((j) => j.id !== jobId);
      try {
        localStorage.setItem('drc_discovered_all_jobs_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setJobsList((prev) => prev.filter((j) => j.id !== jobId));
    toast.info('Job removed from saved history');
  };

  // 8. Clear Entire History
  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear your discovered and saved jobs history?')) {
      setAllDiscoveredJobs([]);
      setJobsList([]);
      setSeenJobIds(new Set());
      setSavedJobIds(new Set());
      localStorage.removeItem('drc_discovered_all_jobs_v2');
      localStorage.removeItem('drc_starred_job_ids_v2');
      toast.success('Discovered history cleared. Ready for fresh discovery.');
    }
  };

  const handleOpenApplicationModal = (job: DiscoveredJobItem | JobDetailData) => {
    if (!job) return;
    setSelectedJobForDetail(null);
    const title = ('job_title' in job ? job.job_title : (job as any).title) || 'Consulting Role';
    const skills = ('key_skills' in job ? job.key_skills : (job as any).skills) || [];
    const description = ('job_description' in job ? job.job_description : (job as any).description) || '';
    const experience = ('experience_required' in job ? job.experience_required : (job as any).experience) || '3-6 Years';
    const applicationUrl = ('application_url' in job ? job.application_url : (job as any).applicationUrl) || '';
    setSelectedJobForApplication({
      id: job.id || `JOB-${Date.now()}`,
      title,
      company: job.company || 'Enterprise Partner',
      location: job.location || 'All India',
      salary: job.salary || 'Competitive / Consulting Band',
      skills: Array.isArray(skills) ? skills : [],
      description,
      experience,
      applicationUrl,
    });
  };

  // Filtered role pills list based on Category tab & Search input
  const displayedRoleFilters = useMemo(() => {
    return INSTANT_ROLE_FILTERS.filter((r) => {
      const matchCat =
        selectedRoleCategory === 'All Roles'
          ? true
          : selectedRoleCategory === '🔥 Trending Roles'
          ? r.popular
          : r.category === selectedRoleCategory;
      const matchSearch =
        !roleFilterSearch ||
        r.name.toLowerCase().includes(roleFilterSearch.toLowerCase()) ||
        r.keyword.toLowerCase().includes(roleFilterSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedRoleCategory, roleFilterSearch]);

  // Filtered Discovered & Saved Requisitions History
  const filteredHistoryJobs = useMemo(() => {
    return allDiscoveredJobs.filter((job) => {
      // 1. Status / Star filter
      if (historyFilter === 'saved' && !savedJobIds.has(job.id)) return false;
      if (historyFilter === 'applied' && job.status !== 'Applied') return false;
      if (historyFilter === 'not_applied' && job.status === 'Applied') return false;

      // 2. Source filter
      if (historySourceFilter === 'career_page') {
        const isCareer =
          job.source_type?.toLowerCase().includes('career') ||
          (!job.application_url?.includes('linkedin.com') && !job.source_type?.toLowerCase().includes('linkedin'));
        if (!isCareer) return false;
      } else if (historySourceFilter === 'linkedin') {
        const isLinkedIn =
          job.source_type?.toLowerCase().includes('linkedin') ||
          job.application_url?.includes('linkedin.com');
        if (!isLinkedIn) return false;
      }

      // 3. Search query
      if (historySearchQuery.trim()) {
        const q = historySearchQuery.toLowerCase();
        const titleMatch = (job.job_title || '').toLowerCase().includes(q);
        const compMatch = (job.company || '').toLowerCase().includes(q);
        const locMatch = (job.location || '').toLowerCase().includes(q);
        const skillsMatch = Array.isArray(job.key_skills) && job.key_skills.some((s) => s.toLowerCase().includes(q));
        if (!titleMatch && !compMatch && !locMatch && !skillsMatch) return false;
      }

      return true;
    });
  }, [allDiscoveredJobs, historyFilter, savedJobIds, historySourceFilter, historySearchQuery]);

  const starredCount = useMemo(() => {
    return allDiscoveredJobs.filter((j) => savedJobIds.has(j.id)).length;
  }, [allDiscoveredJobs, savedJobIds]);

  const appliedCount = useMemo(() => {
    return allDiscoveredJobs.filter((j) => j.status === 'Applied').length;
  }, [allDiscoveredJobs]);

  const notAppliedCount = useMemo(() => {
    return allDiscoveredJobs.filter((j) => j.status !== 'Applied').length;
  }, [allDiscoveredJobs]);

  const displayedJobsList = useMemo(() => {
    if (!resumeProfile || minAtsScoreFilter === 'all') {
      return jobsList;
    }
    const minThreshold = parseInt(minAtsScoreFilter, 10);
    return jobsList.filter((j) => ((j.ats_score ?? (j as any).match_score ?? 0) >= minThreshold));
  }, [jobsList, resumeProfile, minAtsScoreFilter]);

  const isFiltersActive =
    searchQuery ||
    (showRoleFiltersMatrix && selectedActiveRole) ||
    (showSeniorityFilter && selectedSeniority !== 'all') ||
    selectedLocation !== 'All India (Remote & Nationwide)' ||
    selectedChannel !== 'all';

  return (
    <div className="min-h-full bg-black text-white p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#00C896]" />
              DRC Consulting Job Intelligence
            </h1>
            {engineOnline === true && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Pan-India Real-Time Index (Sub-20ms)
              </span>
            )}
            {engineOnline === false && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertCircle className="w-3.5 h-3.5" />
                Engine Connecting...
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Nationwide verified tech, architecture & advisory roles across India. 30+ instant 1-click role filters & entry/intermediate/senior level matching.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => verifyEngine().then(() => executeFreshSearch())}
            className="p-2.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white hover:text-[#00C896] transition-colors shadow-sm"
            title="Refresh engine index"
          >
            <RefreshCw className={`w-4 h-4 ${searching ? 'animate-spin text-[#00C896]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Deterministic Zero-LLM Resume Scanner Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-xl">
        {resumeProfile ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Consulting ATS Scoring Active
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
                      {resumeFileName || 'Resume Evaluated'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {resumeProfile.name} • {resumeProfile.primary_domain} ({resumeProfile.total_experience_years} yrs exp)
                  </h4>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {resumeProfile.top_skills.slice(0, 8).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {s}
                      </span>
                    ))}
                    {resumeProfile.top_skills.length > 8 && (
                      <span className="text-[10px] text-zinc-500">+{resumeProfile.top_skills.length - 8} more</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearResume}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 hover:border-zinc-400 text-xs font-bold text-white transition-all self-start sm:self-center shadow-sm"
              >
                Clear / Change Resume
              </button>
            </div>

            {/* Quick 1-Click ATS Score Fit Filter Bar */}
            <div className="pt-2.5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#00C896]" />
                  ATS Match Filter:
                </span>
                <button
                  type="button"
                  onClick={() => setMinAtsScoreFilter('70')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    minAtsScoreFilter === '70'
                      ? 'bg-emerald-500 text-black border border-emerald-400 shadow-md shadow-emerald-500/20 scale-105'
                      : 'bg-zinc-900 text-emerald-400 hover:bg-zinc-800 border border-emerald-500/30'
                  }`}
                >
                  <span>🟢 70%+ High ATS Match</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMinAtsScoreFilter('80')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    minAtsScoreFilter === '80'
                      ? 'bg-purple-400 text-black border border-purple-300 shadow-md shadow-purple-400/20 scale-105'
                      : 'bg-zinc-900 text-purple-300 hover:bg-zinc-800 border border-purple-500/30'
                  }`}
                >
                  <span>🟣 80%+ Strong Fit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMinAtsScoreFilter('85')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    minAtsScoreFilter === '85'
                      ? 'bg-amber-400 text-black border border-amber-300 shadow-md shadow-amber-400/20 scale-105'
                      : 'bg-zinc-900 text-amber-300 hover:bg-zinc-800 border border-amber-500/30'
                  }`}
                >
                  <span>👑 85%+ Top Tier</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMinAtsScoreFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    minAtsScoreFilter === 'all'
                      ? 'bg-zinc-700 text-white border border-zinc-500'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  <span>All Matches</span>
                </button>
              </div>

              <span className="text-[11px] text-zinc-400 font-medium">
                Active Matches: <strong className="text-[#00C896] font-bold font-mono">{displayedJobsList.length}</strong> / {jobsList.length}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#00C896]/10 border border-[#00C896]/30 flex items-center justify-center shrink-0 shadow-lg shadow-[#00C896]/5">
                <UploadCloud className="w-6 h-6 text-[#00C896]" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00C896]">
                    Deterministic Zero-LLM ATS Scanner
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono font-semibold">
                    Instant &lt;100ms • Zero API Cost
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Upload your resume to calculate your 4-Tier Consulting ATS Match Score across all openings
                </h4>
                <p className="text-xs text-zinc-400">
                  Evaluates technical stack, consulting leadership, seniority curve & domain depth. No login required.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                  disabled={parsingResume}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleResumeUpload(file);
                  }}
                />
                <div className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
                  parsingResume
                    ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-700'
                    : 'bg-[#00C896] hover:bg-[#00E5AA] text-black border-2 border-[#00E5AA] shadow-lg shadow-[#00C896]/30 hover:scale-105'
                }`}>
                  {parsingResume ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#00C896]" />
                      <span className="text-white">Parsing Resume...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 text-black" />
                      <span>Scan Resume for ATS Match</span>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Top Dual View Navigation Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-zinc-950/90 rounded-2xl border-2 border-zinc-800 shadow-xl">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveView('current_batch')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeView === 'current_batch'
                ? 'bg-[#00C896] text-black border-2 border-[#00E5AA] shadow-lg shadow-[#00C896]/30 scale-[1.02]'
                : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>⚡ Active Batch (5 Fresh Jobs)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('saved_history')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeView === 'saved_history'
                ? 'bg-[#00C896] text-black border-2 border-[#00E5AA] shadow-lg shadow-[#00C896]/30 scale-[1.02]'
                : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>📁 Discovered &amp; Saved History ({allDiscoveredJobs.length})</span>
            {starredCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-black font-extrabold flex items-center gap-0.5 shadow-sm">
                <Star className="w-2.5 h-2.5 fill-current" />
                {starredCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 px-2 text-xs text-zinc-400">
          <span className="hidden md:inline">
            Accumulated Requisitions: <strong className="text-white font-mono">{allDiscoveredJobs.length} Jobs</strong>
          </span>
        </div>
      </div>

      {/* VIEW 1: ACTIVE BATCH (5 FRESH JOBS WITH INSTANT 1-CLICK CONTROLS) */}
      {activeView === 'current_batch' && (
        <div className="space-y-6">
          {/* SECTION 1: Seniority / Experience Level Instant 1-Click Bar */}
          {showSeniorityFilter && (
            <div className="p-4 rounded-2xl border-2 border-zinc-800 bg-zinc-950/90 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#00C896]" />
                  <span>Experience &amp; Seniority Level (Instant 1-Click Filter)</span>
                </label>
                <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">
                  Active: <span className="text-[#00C896] font-bold">{SENIORITY_LEVELS.find((s) => s.id === selectedSeniority)?.label}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {SENIORITY_LEVELS.map((level) => {
                  const isActive = selectedSeniority === level.id;
                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => handleSenioritySelect(level.id)}
                      className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between ${
                        isActive
                          ? 'bg-zinc-800 border-[#00C896] shadow-lg shadow-[#00C896]/20 scale-[1.03] ring-1 ring-[#00C896]'
                          : 'bg-zinc-900/90 hover:bg-zinc-800/80 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-black ${isActive ? 'text-white' : level.iconColor}`}>
                          {level.badge}
                        </span>
                        {isActive && <Check className="w-3.5 h-3.5 text-[#00C896]" />}
                      </div>
                      <div className="text-[11px] font-bold text-white line-clamp-1">
                        {level.label.split('(')[0].trim()}
                      </div>
                      <div className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                        {level.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: 36+ Instant 1-Click Tech Role Pills Matrix */}
          {showRoleFiltersMatrix && (
            <div className="p-4 rounded-2xl border-2 border-zinc-800 bg-zinc-950/90 shadow-xl space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#00C896]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-200">
                    Instant 1-Click Role Filters ({INSTANT_ROLE_FILTERS.length} Requisitions Matrix)
                  </h3>
                  {selectedActiveRole && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00C896]/20 text-[#00C896] border border-[#00C896]/40 flex items-center gap-1">
                      <span>Filtered</span>
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-white"
                        onClick={() => {
                          setSelectedActiveRole(null);
                          setSearchQuery('');
                          executeFreshSearch('', selectedLocation, selectedSeniority, selectedChannel, false);
                        }}
                      />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Quick search input to find any of the 36 pills */}
                  <div className="relative w-full sm:w-48">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
                    <input
                      type="text"
                      value={roleFilterSearch}
                      onChange={(e) => setRoleFilterSearch(e.target.value)}
                      placeholder="Filter 36+ roles..."
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-8 pr-2 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00C896]"
                    />
                  </div>

                  {isFiltersActive && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-[11px] font-bold text-zinc-400 hover:text-[#00C896] underline whitespace-nowrap"
                    >
                      Reset All
                    </button>
                  )}
                </div>
              </div>

              {/* Category Pills Navigation Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {ROLE_CATEGORIES.map((cat) => {
                  const isActive = selectedRoleCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedRoleCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-[#00C896] text-black shadow-md font-black'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* The 36+ Instant Role Filter Buttons Grid */}
              <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                {displayedRoleFilters.map((role) => {
                  const isActive = selectedActiveRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleInstantRoleClick(role)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#00C896] text-black border-2 border-[#00E5AA] shadow-lg shadow-[#00C896]/30 scale-105'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 hover:border-[#00C896] hover:text-white shadow-sm'
                      }`}
                    >
                      {role.popular && <Sparkles className={`w-3 h-3 ${isActive ? 'text-black' : 'text-amber-400'}`} />}
                      <span>{role.name}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-black" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: Keyword Search, Pan-India Location, Work Mode & Core Skills Bar */}
          <div className="p-5 rounded-2xl border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur shadow-2xl space-y-4">
            {/* Row 1: Search, Location & Main Trigger */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/* Keyword Search Input */}
              <div className="md:col-span-5">
                <label className="block text-xs font-bold text-zinc-300 mb-1">Search Role, Tech Stack or Keyword</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedActiveRole(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleManualSearch();
                    }}
                    placeholder="e.g. Python, Cloud Architect, PySpark, Product Manager"
                    className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00C896] transition-colors"
                  />
                </div>
              </div>

              {/* Pan-India Location Selector */}
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-zinc-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#00C896]" />
                  <span>Location (Pan-India Coverage)</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedLocation}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00C896]"
                  >
                    {(availableLocations.length > 0 ? availableLocations : [
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
                    ]).map((loc) => {
                      const isWorldwide = loc.includes('Worldwide') || loc.includes('US /') || loc.includes('Europe') || loc.includes('Singapore');
                      return (
                        <option key={loc} value={loc}>
                          {isWorldwide ? `🌐 ${loc}` : `🇮🇳 ${loc}`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Search Trigger Button */}
              <div className="md:col-span-3 flex gap-2">
                <button
                  onClick={handleManualSearch}
                  disabled={searching || isAppending}
                  className="flex-1 h-[40px] flex items-center justify-center gap-1.5 rounded-xl font-extrabold text-xs bg-[#00C896] hover:bg-[#00E5AA] disabled:opacity-50 text-black border-2 border-[#00E5AA] shadow-lg shadow-[#00C896]/30 hover:scale-[1.02] transition-all"
                >
                  {searching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>Finding 5 Jobs...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 text-black" />
                      <span>Find 5 Fresh Jobs</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Row 2: Work Mode & Relocation Preferences (Solves City Drop-Offs & Droughts) */}
            <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
              {/* Work Mode Toggle Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 mr-1 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-[#00C896]" />
                  Work Mode:
                </span>
                <button
                  type="button"
                  onClick={() => handleWorkModeChange('remote_included')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    selectedWorkMode === 'remote_included'
                      ? 'bg-[#00C896] text-black border border-[#00E5AA] shadow-md shadow-[#00C896]/20'
                      : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
                  }`}
                  title="Includes selected city + Remote jobs nationwide so you never miss high-yield opportunities"
                >
                  <Globe className="w-3 h-3" />
                  <span>Remote Included (Best)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWorkModeChange('remote_only')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    selectedWorkMode === 'remote_only'
                      ? 'bg-sky-500 text-black border border-sky-400 shadow-md shadow-sky-500/20'
                      : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <Home className="w-3 h-3" />
                  <span>Remote Only (WFH)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWorkModeChange('hybrid')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    selectedWorkMode === 'hybrid'
                      ? 'bg-amber-400 text-black border border-amber-300 shadow-md shadow-amber-400/20'
                      : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <Building2 className="w-3 h-3" />
                  <span>Hybrid</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWorkModeChange('onsite')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    selectedWorkMode === 'onsite'
                      ? 'bg-purple-400 text-black border border-purple-300 shadow-md shadow-purple-400/20'
                      : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>On-Site Only</span>
                </button>
              </div>

              {/* Relocation & Notice Period Quick Options */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Relocation Toggle */}
                <button
                  type="button"
                  onClick={handleToggleRelocation}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    isOpenToRelocation
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}
                  title="If local city openings are sparse, automatically cascades to top Metro Hubs (Bengaluru, Pune, Hyderabad, Gurgaon, Mumbai)"
                >
                  <Plane className={`w-3 h-3 ${isOpenToRelocation ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  <span>✈️ Open to Relocation</span>
                  {isOpenToRelocation && <Check className="w-3 h-3 text-emerald-400" />}
                </button>

                {/* Notice Period Quick Select */}
                <div className="flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Notice:</span>
                  <select
                    value={selectedNoticePeriod}
                    onChange={(e) => handleNoticePeriodChange(e.target.value)}
                    className="bg-transparent text-xs text-zinc-200 font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="Immediate" className="bg-zinc-900 text-white">⚡ Immediate (&lt;15d)</option>
                    <option value="30_days" className="bg-zinc-900 text-white">🕒 30 Days</option>
                    <option value="60_90_days" className="bg-zinc-900 text-white">⏳ 60-90 Days</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 3: Core Tech Stack & Skills Targeting */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Code2 className="w-3 h-3 text-[#00C896]" />
                  <span>Target by Core Skills & Tech Stack:</span>
                </span>

                {/* Active Selected Skills Count or Reset */}
                {selectedSkills.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSkills([]);
                      executeFreshSearch(searchQuery, selectedLocation, selectedSeniority, selectedChannel, false, resumeProfile, undefined, selectedWorkMode, isOpenToRelocation, selectedNoticePeriod, []);
                    }}
                    className="text-[11px] text-zinc-400 hover:text-rose-400 underline font-semibold transition-colors"
                  >
                    Clear {selectedSkills.length} selected skills
                  </button>
                )}
              </div>

              {/* Skills Pills Bar */}
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Active Selected Skills (Emerald with X) */}
                {selectedSkills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-[#00C896] text-black border border-[#00E5AA] shadow-sm animate-in fade-in zoom-in duration-150"
                  >
                    <span>{sk}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(sk)}
                      className="hover:bg-black/20 rounded p-0.5 transition-colors"
                      title="Remove skill"
                    >
                      <X className="w-3 h-3 text-black" />
                    </button>
                  </span>
                ))}

                {/* Suggested Popular Skills for the active role (click to toggle) */}
                {suggestedSkills.map((sk) => {
                  const isSelected = selectedSkills.includes(sk);
                  if (isSelected) return null;
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => handleToggleSkill(sk)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-[#00C896]/60 transition-all flex items-center gap-1"
                    >
                      <Plus className="w-2.5 h-2.5 text-[#00C896]" />
                      <span>{sk}</span>
                    </button>
                  );
                })}

                {/* Inline custom skill input */}
                <div className="inline-flex items-center bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-0.5 focus-within:border-[#00C896]">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSkill();
                      }
                    }}
                    placeholder="+ Add custom skill"
                    className="bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none w-28 sm:w-36 py-0.5"
                  />
                  {customSkillInput.trim() && (
                    <button
                      type="button"
                      onClick={handleAddCustomSkill}
                      className="text-[10px] font-bold text-[#00C896] hover:text-[#00E5AA] ml-1 uppercase"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Unified Search Results Feed with Channel Selector Tabs */}
          <div className="border border-zinc-800 rounded-3xl bg-zinc-950/80 overflow-hidden shadow-2xl">
            {/* Source Allocation Tabs Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 border-b border-zinc-800 bg-zinc-900/80">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mr-1 hidden sm:inline">
                  Source Split:
                </span>

                {/* All Sources (3 Career + 2 LinkedIn) */}
                <button
                  type="button"
                  onClick={() => handleChannelChange('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedChannel === 'all'
                      ? 'bg-zinc-700 text-white border-2 border-zinc-500 shadow-md scale-105'
                      : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>🌟 All Sources (3 Career + 2 LinkedIn)</span>
                </button>

                {/* Career Pages Only (5 Jobs) */}
                <button
                  type="button"
                  onClick={() => handleChannelChange('career_page')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedChannel === 'career_page'
                      ? 'bg-emerald-500 text-black border-2 border-emerald-400 shadow-md shadow-emerald-500/20 scale-105'
                      : 'bg-zinc-900 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/30'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>🏢 Career Pages (5 Jobs)</span>
                </button>

                {/* LinkedIn Only (5 Jobs) */}
                <button
                  type="button"
                  onClick={() => handleChannelChange('linkedin')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedChannel === 'linkedin'
                      ? 'bg-[#0a66c2] text-white border-2 border-blue-400 shadow-md scale-105'
                      : 'bg-zinc-900 text-[#70b5f9] hover:bg-blue-500/10 border border-blue-500/30'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#70b5f9]" />
                  <span>💼 LinkedIn (5 Jobs)</span>
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium">
                {seenJobIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleResetSeenHistory}
                    className="text-[11px] font-semibold text-zinc-400 hover:text-[#00C896] underline flex items-center gap-1 transition-colors"
                    title="Reset seen IDs so past jobs can be re-searched"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Seen ({seenJobIds.size} tracked)</span>
                  </button>
                )}
                <span className="bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700 text-zinc-300 font-mono text-[11px]">
                  Showing <span className="text-[#00C896] font-bold">{displayedJobsList.length}</span> of {jobsList.length} fresh jobs
                </span>
              </div>
            </div>

            {/* Jobs List Feed */}
            {searching ? (
              <div className="p-16 text-center text-zinc-500 flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-[#00C896]" />
                <span className="text-sm font-medium">
                  Discovering 5 fresh jobs ({SENIORITY_LEVELS.find((s) => s.id === selectedSeniority)?.badge}) with zero duplicates...
                </span>
              </div>
            ) : jobsList.length === 0 ? (
              <div className="p-16 text-center text-zinc-500 space-y-3">
                <Briefcase className="w-12 h-12 mx-auto text-zinc-700" />
                <p className="text-base text-zinc-300 font-bold">No un-seen requisitions found</p>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  All matching jobs for this query and seniority level ({selectedSeniority}) have already been seen ({seenJobIds.size} tracked). Try resetting seen history or modifying keywords.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetSeenHistory}
                    className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold border border-zinc-700 transition-all flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#00C896]" />
                    <span>Reset Seen History &amp; Re-run</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-black text-xs font-black border-2 border-[#00E5AA] shadow-lg shadow-[#00C896]/30 hover:scale-105 transition-all"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : displayedJobsList.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 space-y-3">
                <Sparkles className="w-10 h-10 mx-auto text-amber-400" />
                <p className="text-base text-zinc-200 font-bold">No jobs meet the {minAtsScoreFilter}% ATS filter threshold</p>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  There are {jobsList.length} total fresh jobs available for this search. Click below to view all matches or broaden your skills.
                </p>
                <button
                  type="button"
                  onClick={() => setMinAtsScoreFilter('all')}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold border border-zinc-700 transition-all"
                >
                  Show All {jobsList.length} Requisitions
                </button>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/80">
                {displayedJobsList.map((job) => {
                  const isCareer =
                    job.source_type?.toLowerCase().includes('career') ||
                    (!job.application_url?.includes('linkedin.com') && !job.source_type?.toLowerCase().includes('linkedin'));
                  const isDual = job.source_type?.toLowerCase().includes('dual');
                  const currentRemark =
                    editingRemarks[job.id] !== undefined ? editingRemarks[job.id] : job.remarks || '';
                  const isStarred = savedJobIds.has(job.id);

                  return (
                    <div
                      key={job.id}
                      className="p-5 hover:bg-zinc-900/60 transition-colors flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                    >
                      {/* Left Job Info */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Star / Bookmark Button */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleStar(job.id, e)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isStarred
                                ? 'bg-amber-400/20 border-amber-400/60 text-amber-300 hover:bg-amber-400/30'
                                : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-amber-300 hover:border-amber-400/50'
                            }`}
                            title={isStarred ? 'Saved in Starred collection' : 'Star & Save this job'}
                          >
                            <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                          </button>

                          {/* Posted Time Badge */}
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>{job.posted_time || '⚡ Posted < 24h'}</span>
                          </span>

                          {isDual ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                              ✨ Dual-Verified (LinkedIn + Career Page)
                            </span>
                          ) : isCareer ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-emerald-400" />
                              <span>🏢 Company Career Page ({job.source_type?.replace('Direct Career Page (', '').replace(')', '') || 'ATS'})</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0a66c2]/20 text-[#70b5f9] border border-[#0a66c2]/40">
                              💼 LinkedIn Curated Post
                            </span>
                          )}

                          <h4
                            className="text-base font-bold text-white truncate hover:text-[#00C896] transition-colors cursor-pointer"
                            onClick={() =>
                              setSelectedJobForDetail({
                                id: job.id,
                                title: job.job_title,
                                company: job.company,
                                location: job.location,
                                jobType: job.job_type,
                                salary: job.salary,
                                experience: job.experience_required,
                                description: job.job_description,
                                skills: job.key_skills,
                                applicationUrl: job.application_url,
                                matchScore: resumeProfile ? job.ats_score : undefined,
                                ats_score: resumeProfile ? job.ats_score : undefined,
                                matched_skills: resumeProfile ? (job as any).matched_skills : [],
                                missing_skills: resumeProfile ? (job as any).missing_skills : [],
                                experience_fit_text: (job as any).experience_fit_text,
                                connections: job.connections,
                                discoveredAt: job.discovered_at,
                              })
                            }
                          >
                            {job.job_title}
                          </h4>

                          {/* 4-Tier Consulting ATS Match Badge (Displayed ONLY after resume is uploaded) */}
                          {resumeProfile && job.ats_score ? (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1 shadow-sm ${
                                job.ats_score >= 85
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : job.ats_score >= 70
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                              }`}
                            >
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                              <span>🎯 ATS Match: {job.ats_score}%</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenApplicationModal(job)}
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00C896]/15 hover:bg-[#00C896]/25 border border-[#00C896]/40 text-[#00C896] transition-all flex items-center gap-1 shadow-sm"
                              title="Upload your resume to calculate personalized ATS compatibility"
                            >
                              <UploadCloud className="w-3 h-3" />
                              <span>Scan Resume for ATS Match</span>
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                          <span className="flex items-center gap-1.5 text-zinc-100 font-bold">
                            <Building2 className="w-3.5 h-3.5 text-[#00C896]" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1.5 text-zinc-300">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                            {job.location}
                          </span>
                          {job.experience_required && (
                            <span className="text-zinc-300">• Experience: {job.experience_required}</span>
                          )}
                          {job.salary && (
                            <span className="text-emerald-400 font-bold">• {job.salary}</span>
                          )}
                          {job.posted_time && (
                            <span className="text-amber-300/90 font-medium flex items-center gap-1">
                              • <Clock className="w-3 h-3 text-amber-400" /> {job.posted_time}
                            </span>
                          )}
                        </div>

                        {/* Key Skills */}
                        {job.key_skills && job.key_skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {job.key_skills.slice(0, 6).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-200 border border-zinc-700 font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Resume ATS Matched & Missing Skills Breakdown */}
                        {resumeProfile && (
                          <div className="pt-1.5 space-y-1">
                            {Array.isArray((job as any).matched_skills) && (job as any).matched_skills.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-0.5">
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  Matched:
                                </span>
                                {(job as any).matched_skills.map((skill: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold"
                                  >
                                    ✓ {skill}
                                  </span>
                                ))}
                              </div>
                            )}

                            {Array.isArray((job as any).missing_skills) && (job as any).missing_skills.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                                  ⚡ Highlight:
                                </span>
                                {(job as any).missing_skills.slice(0, 4).map((skill: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-md text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium"
                                  >
                                    + {skill}
                                  </span>
                                ))}
                              </div>
                            )}

                            {(job as any).experience_fit_text && (
                              <p className="text-[11px] text-zinc-400 italic">
                                🎯 {(job as any).experience_fit_text}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Status Toggle & Remarks Notes Input */}
                        <div className="pt-1 flex flex-wrap items-center gap-2 max-w-xl">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(job)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 ${
                              job.status === 'Applied'
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-white'
                            }`}
                            title="Click to toggle status between Applied and Not Applied"
                          >
                            {job.status === 'Applied' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Applied</span>
                              </>
                            ) : (
                              <>
                                <Circle className="w-3.5 h-3.5" />
                                <span>Not Applied</span>
                              </>
                            )}
                          </button>

                          <input
                            type="text"
                            value={currentRemark}
                            placeholder="Add notes (e.g. applied on website, referral requested)..."
                            onChange={(e) =>
                              setEditingRemarks({ ...editingRemarks, [job.id]: e.target.value })
                            }
                            onBlur={() => handleSaveRemark(job.id, job.status)}
                            className="flex-1 min-w-[200px] bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#00C896]"
                          />
                        </div>
                      </div>

                      {/* Right Actions & Apply Button */}
                      <div className="flex flex-row lg:flex-col items-end gap-2.5 flex-shrink-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {isCareer ? (
                            <a
                              href={job.application_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2.5 rounded-xl text-xs font-black bg-[#4ade80] hover:bg-[#6ee7a8] text-black border-2 border-[#4ade80] shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all hover:scale-105"
                              title={`Apply directly on ${job.company} career portal without redirect`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Apply on Career Portal ↗</span>
                            </a>
                          ) : (
                            <a
                              href={job.application_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#0a66c2] hover:bg-[#004182] text-white border-2 border-blue-400 shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
                              title={`View verified posting on official LinkedIn: ${job.application_url}`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>LinkedIn Post ↗</span>
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenApplicationModal(job)}
                            className="px-3.5 py-2.5 rounded-xl text-xs font-black bg-[#00C896] hover:bg-[#00E5AA] text-black border-2 border-[#00E5AA] shadow-sm flex items-center gap-1.5 transition-all hover:scale-105"
                            title="Auto-fill application with parsed resume"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Apply &amp; Unlock</span>
                          </button>

                          <button
                            onClick={() =>
                              setSelectedJobForDetail({
                                id: job.id || `JOB-${Date.now()}`,
                                title: job.job_title || 'Consulting Role',
                                company: job.company || 'Enterprise Partner',
                                location: job.location || 'All India',
                                jobType: job.job_type || 'Full-time',
                                salary: job.salary || 'Competitive',
                                experience: job.experience_required || '3-6 Years',
                                description: job.job_description || '',
                                skills: Array.isArray(job.key_skills) ? job.key_skills : [],
                                applicationUrl: job.application_url || '',
                                matchScore: resumeProfile ? job.ats_score : undefined,
                                ats_score: resumeProfile ? job.ats_score : undefined,
                                matched_skills: Array.isArray((job as any).matched_skills) ? (job as any).matched_skills : [],
                                missing_skills: Array.isArray((job as any).missing_skills) ? (job as any).missing_skills : [],
                                experience_fit_text: (job as any).experience_fit_text || '',
                                connections: Array.isArray(job.connections) ? job.connections : [],
                                discoveredAt: job.discovered_at || '',
                              })
                            }
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 hover:border-zinc-400 text-zinc-200 hover:text-white shadow-sm transition-all"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer Actions: Load 5 More Fresh Jobs Button */}
            {jobsList.length > 0 && !searching && (
              <div className="p-5 border-t border-zinc-800 bg-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-zinc-400">
                  Showing <span className="text-white font-bold">{jobsList.length}</span> active requisitions ({seenJobIds.size} total tracked in session with zero duplicates)
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => executeFreshSearch(searchQuery, selectedLocation, selectedSeniority, selectedChannel, false)}
                    disabled={searching || isAppending}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold border border-zinc-700 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${searching ? 'animate-spin' : ''}`} />
                    <span>Find 5 New Jobs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeFreshSearch(searchQuery, selectedLocation, selectedSeniority, selectedChannel, true)}
                    disabled={searching || isAppending}
                    className="px-5 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-black text-xs font-extrabold border-2 border-[#00E5AA] shadow-lg shadow-[#00C896]/20 hover:scale-105 transition-all flex items-center gap-2"
                  >
                    {isAppending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-black" />
                        <span>Loading 5 Fresh Jobs...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-black" />
                        <span>+ Load Next 5 Fresh Jobs</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: ALL DISCOVERED & SAVED REQUISITIONS HISTORY MANAGER (NEVER TRASHED) */}
      {activeView === 'saved_history' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/90 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Discovered</p>
                <h3 className="text-2xl font-black text-white">{allDiscoveredJobs.length}</h3>
              </div>
              <Archive className="w-8 h-8 text-[#00C896]/60" />
            </div>

            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/90 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">⭐ Starred / Saved</p>
                <h3 className="text-2xl font-black text-amber-300">{starredCount}</h3>
              </div>
              <Star className="w-8 h-8 text-amber-400/60 fill-amber-400/20" />
            </div>

            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/90 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">✅ Applied</p>
                <h3 className="text-2xl font-black text-emerald-300">{appliedCount}</h3>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-400/60" />
            </div>

            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/90 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-sky-400">⏳ Ready to Apply</p>
                <h3 className="text-2xl font-black text-sky-300">{notAppliedCount}</h3>
              </div>
              <Briefcase className="w-8 h-8 text-sky-400/60" />
            </div>
          </div>

          {/* Controls & Filter Bar */}
          <div className="p-4 rounded-2xl border-2 border-zinc-800 bg-zinc-950/90 shadow-xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              {/* Status Sub-Filters Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setHistoryFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    historyFilter === 'all'
                      ? 'bg-[#00C896] text-black font-black shadow-md'
                      : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800'
                  }`}
                >
                  All Requisitions ({allDiscoveredJobs.length})
                </button>

                <button
                  type="button"
                  onClick={() => setHistoryFilter('saved')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    historyFilter === 'saved'
                      ? 'bg-amber-400 text-black font-black shadow-md'
                      : 'bg-zinc-900 text-amber-300 hover:text-amber-200 border border-amber-500/30'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Starred ({starredCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHistoryFilter('applied')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    historyFilter === 'applied'
                      ? 'bg-emerald-500 text-black font-black shadow-md'
                      : 'bg-zinc-900 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Applied ({appliedCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHistoryFilter('not_applied')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    historyFilter === 'not_applied'
                      ? 'bg-sky-500 text-black font-black shadow-md'
                      : 'bg-zinc-900 text-sky-300 hover:text-sky-200 border border-sky-500/30'
                  }`}
                >
                  <Circle className="w-3.5 h-3.5" />
                  <span>Not Applied ({notAppliedCount})</span>
                </button>
              </div>

              {/* Source Filter & Global Actions */}
              <div className="flex items-center gap-2">
                <select
                  value={historySourceFilter}
                  onChange={(e) => setHistorySourceFilter(e.target.value as any)}
                  className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00C896]"
                >
                  <option value="all">All Sources</option>
                  <option value="career_page">Company Career Pages</option>
                  <option value="linkedin">LinkedIn Posts</option>
                </select>

                {allDiscoveredJobs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllHistory}
                    className="p-1.5 rounded-xl bg-zinc-900 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-500/40 transition-colors"
                    title="Clear discovered jobs history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Keyword Search across Saved History */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
              <input
                type="text"
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                placeholder="Search across all discovered & saved jobs (title, company, skills, city)..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00C896]"
              />
            </div>
          </div>

          {/* Persistent History Requisitions Table / Cards */}
          <div className="border border-zinc-800 rounded-3xl bg-zinc-950/80 overflow-hidden shadow-2xl">
            {filteredHistoryJobs.length === 0 ? (
              <div className="p-16 text-center text-zinc-500 space-y-3">
                <Archive className="w-12 h-12 mx-auto text-zinc-700" />
                <p className="text-base text-zinc-300 font-bold">No requisitions in this view</p>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  {allDiscoveredJobs.length === 0
                    ? 'No jobs have been discovered yet. Search or click any of the 36+ instant role filters to discover and save jobs.'
                    : 'No jobs match your current search or sub-filters. Try switching tabs or clearing search keywords.'}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveView('current_batch')}
                  className="px-5 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-black text-xs font-black border-2 border-[#00E5AA] shadow-lg shadow-[#00C896]/30 hover:scale-105 transition-all"
                >
                  ⚡ Go to Fresh Discovery
                </button>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/80">
                {filteredHistoryJobs.map((job) => {
                  const isCareer =
                    job.source_type?.toLowerCase().includes('career') ||
                    (!job.application_url?.includes('linkedin.com') && !job.source_type?.toLowerCase().includes('linkedin'));
                  const isDual = job.source_type?.toLowerCase().includes('dual');
                  const currentRemark =
                    editingRemarks[job.id] !== undefined ? editingRemarks[job.id] : job.remarks || '';
                  const isStarred = savedJobIds.has(job.id);

                  return (
                    <div
                      key={job.id}
                      className="p-5 hover:bg-zinc-900/60 transition-colors flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                    >
                      {/* Left Info */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleToggleStar(job.id, e)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isStarred
                                ? 'bg-amber-400/20 border-amber-400/60 text-amber-300 hover:bg-amber-400/30'
                                : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-amber-300 hover:border-amber-400/50'
                            }`}
                            title={isStarred ? 'Saved in Starred collection' : 'Star & Save this job'}
                          >
                            <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                          </button>

                          {/* Posted Time Badge */}
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>{job.posted_time || '⚡ Posted < 24h'}</span>
                          </span>

                          {isDual ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                              ✨ Dual-Verified
                            </span>
                          ) : isCareer ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-emerald-400" />
                              <span>🏢 Company Career Page</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0a66c2]/20 text-[#70b5f9] border border-[#0a66c2]/40">
                              💼 LinkedIn Post
                            </span>
                          )}

                          <h4
                            className="text-base font-bold text-white truncate hover:text-[#00C896] transition-colors cursor-pointer"
                            onClick={() =>
                              setSelectedJobForDetail({
                                id: job.id,
                                title: job.job_title,
                                company: job.company,
                                location: job.location,
                                jobType: job.job_type,
                                salary: job.salary,
                                experience: job.experience_required,
                                description: job.job_description,
                                skills: job.key_skills,
                                applicationUrl: job.application_url,
                                matchScore: resumeProfile ? job.ats_score : undefined,
                                ats_score: resumeProfile ? job.ats_score : undefined,
                                matched_skills: resumeProfile ? (job as any).matched_skills : [],
                                missing_skills: resumeProfile ? (job as any).missing_skills : [],
                                experience_fit_text: (job as any).experience_fit_text,
                                connections: job.connections,
                                discoveredAt: job.discovered_at,
                              })
                            }
                          >
                            {job.job_title}
                          </h4>

                          {resumeProfile && job.ats_score ? (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1 shadow-sm ${
                                job.ats_score >= 85
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : job.ats_score >= 70
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                              }`}
                            >
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                              <span>🎯 ATS Match: {job.ats_score}%</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenApplicationModal(job)}
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00C896]/15 hover:bg-[#00C896]/25 border border-[#00C896]/40 text-[#00C896] transition-all flex items-center gap-1 shadow-sm"
                            >
                              <UploadCloud className="w-3 h-3" />
                              <span>Scan Resume for ATS Match</span>
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                          <span className="flex items-center gap-1.5 text-zinc-100 font-bold">
                            <Building2 className="w-3.5 h-3.5 text-[#00C896]" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1.5 text-zinc-300">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                            {job.location}
                          </span>
                          {job.experience_required && (
                            <span className="text-zinc-300">• Experience: {job.experience_required}</span>
                          )}
                          {job.salary && (
                            <span className="text-emerald-400 font-bold">• {job.salary}</span>
                          )}
                          {job.posted_time && (
                            <span className="text-amber-300/90 font-medium flex items-center gap-1">
                              • <Clock className="w-3 h-3 text-amber-400" /> {job.posted_time}
                            </span>
                          )}
                        </div>

                        {job.key_skills && job.key_skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {job.key_skills.slice(0, 6).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-200 border border-zinc-700 font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Status Toggle & Remarks Notes */}
                        <div className="pt-1 flex flex-wrap items-center gap-2 max-w-xl">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(job)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 ${
                              job.status === 'Applied'
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {job.status === 'Applied' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Applied</span>
                              </>
                            ) : (
                              <>
                                <Circle className="w-3.5 h-3.5" />
                                <span>Not Applied</span>
                              </>
                            )}
                          </button>

                          <input
                            type="text"
                            value={currentRemark}
                            placeholder="Add notes..."
                            onChange={(e) =>
                              setEditingRemarks({ ...editingRemarks, [job.id]: e.target.value })
                            }
                            onBlur={() => handleSaveRemark(job.id, job.status)}
                            className="flex-1 min-w-[200px] bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#00C896]"
                          />
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex flex-row lg:flex-col items-end gap-2.5 flex-shrink-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {isCareer ? (
                            <a
                              href={job.application_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2.5 rounded-xl text-xs font-black bg-[#4ade80] hover:bg-[#6ee7a8] text-black border-2 border-[#4ade80] shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Apply on Career Portal ↗</span>
                            </a>
                          ) : (
                            <a
                              href={job.application_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#0a66c2] hover:bg-[#004182] text-white border-2 border-blue-400 shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>LinkedIn Post ↗</span>
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenApplicationModal(job)}
                            className="px-3.5 py-2.5 rounded-xl text-xs font-black bg-[#00C896] hover:bg-[#00E5AA] text-black border-2 border-[#00E5AA] shadow-sm flex items-center gap-1.5 transition-all hover:scale-105"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Apply &amp; Unlock</span>
                          </button>

                          <button
                            onClick={() =>
                              setSelectedJobForDetail({
                                id: job.id || `JOB-${Date.now()}`,
                                title: job.job_title || 'Consulting Role',
                                company: job.company || 'Enterprise Partner',
                                location: job.location || 'All India',
                                jobType: job.job_type || 'Full-time',
                                salary: job.salary || 'Competitive',
                                experience: job.experience_required || '3-6 Years',
                                description: job.job_description || '',
                                skills: Array.isArray(job.key_skills) ? job.key_skills : [],
                                applicationUrl: job.application_url || '',
                                matchScore: resumeProfile ? job.ats_score : undefined,
                                ats_score: resumeProfile ? job.ats_score : undefined,
                                matched_skills: Array.isArray((job as any).matched_skills) ? (job as any).matched_skills : [],
                                missing_skills: Array.isArray((job as any).missing_skills) ? (job as any).missing_skills : [],
                                experience_fit_text: (job as any).experience_fit_text || '',
                                connections: Array.isArray(job.connections) ? job.connections : [],
                                discoveredAt: job.discovered_at || '',
                              })
                            }
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 hover:border-zinc-400 text-zinc-200 hover:text-white shadow-sm transition-all"
                          >
                            Details
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteSavedJob(job.id, e)}
                            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 border border-zinc-800 hover:border-rose-500/40 transition-colors"
                            title="Remove from saved history"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      <ErrorBoundary fallbackTitle="Could not display job details">
        <JobDetailModal
          isOpen={!!selectedJobForDetail}
          onClose={() => setSelectedJobForDetail(null)}
          job={selectedJobForDetail}
          candidateProfile={resumeProfile}
          onApply={(jobData) => handleOpenApplicationModal(jobData)}
        />
      </ErrorBoundary>

      {/* Multi-Step Application Flow Modal */}
      {selectedJobForApplication && (
        <ErrorBoundary fallbackTitle="Application flow encountered an issue">
          <ApplicationFlowModal
            isOpen={!!selectedJobForApplication}
            onClose={() => setSelectedJobForApplication(null)}
            job={selectedJobForApplication}
          />
        </ErrorBoundary>
      )}
    </div>
  );
};

export default DiscoveredJobsTracker;
