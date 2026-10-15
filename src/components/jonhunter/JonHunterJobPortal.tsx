import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Compass,
  RotateCcw,
  RefreshCw,
  Bookmark,
  Archive,
  AlertTriangle,
  Activity,
  Search,
  WifiOff,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DiscoveredJobItem,
  searchInstantJobs,
  fetchPanIndiaLocations,
  updateJobStatus,
  checkJobEngineHealth,
  getDiscoveredJobsHistory,
} from '../../lib/drcDiscoveryApi';
import { useUser } from '../../contexts/UserContext';
import { JobDetailModal, JobDetailData } from '../JobDetailModal';
import { ApplicationFlowModal } from '../application/ApplicationFlowModal';
import { ErrorBoundary } from '../ErrorBoundary';
import {
  CandidateParsedProfile,
  parseCandidateResume,
} from '../../lib/applicationApi';

import { JonHunterNav, JonHunterNavTab } from './JonHunterNav';
import { JonHunterHero } from './JonHunterHero';
import { RecommendedJobsSection } from './RecommendedJobsSection';
import { JobCardNaukri } from './JobCardNaukri';
import { JobCardErrorBoundary } from './JobCardErrorBoundary';
import { FiltersSidebar } from './FiltersSidebar';
import { ResumeAtsBanner } from './ResumeAtsBanner';
import { SavedJobsView } from './SavedJobsView';
import { DiscoveredArchiveView } from './DiscoveredArchiveView';
import { ApplicationTrackerView } from './ApplicationTrackerView';
import { DiagnosticsModal } from '../common/DiagnosticsModal';
import { safeStorage } from '../../lib/storage/safeStorage';
import { openExternalJobLink } from '../../lib/safeExternalLink';
import { errorLogger } from '../../lib/errors/errorLogger';
import { getUserFriendlyErrorMessage, isNetworkError } from '../../lib/errors/AppError';
import discoveryFiltersConfig from '../../config/discoveryFilters.json';
import { getActiveTheme } from '../../config/themeConfig';

export interface JonHunterJobPortalProps {
  onNavigateHome?: () => void;
  onNavigateSignIn?: () => void;
  onNavigateTracker?: () => void;
}

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

const getSuggestedSkillsForRole = (roleQuery?: string): string[] => {
  const q = String(roleQuery || '').toLowerCase();
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

export const JonHunterJobPortal: React.FC<JonHunterJobPortalProps> = ({
  onNavigateHome,
  onNavigateSignIn,
  onNavigateTracker,
}) => {
  const { user } = useUser();

  // Navigation tab state: 'discover' | 'recommended' | 'saved' | 'tracker'
  const [activeNavTab, setActiveNavTab] = useState<JonHunterNavTab>('discover');

  // Engine state
  const [engineOnline, setEngineOnline] = useState<boolean | null>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [isAppending, setIsAppending] = useState<boolean>(false);

  // Resume & Live ATS state
  const [resumeProfile, setResumeProfile] = useState<CandidateParsedProfile | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>('');
  const [parsingResume, setParsingResume] = useState<boolean>(false);
  const [minAtsScoreFilter, setMinAtsScoreFilter] = useState<'all' | '70' | '80' | '85'>('all');

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('All India (Remote & Nationwide)');
  const [selectedSeniority, setSelectedSeniority] = useState<'all' | 'entry' | 'intermediate' | 'senior' | 'lead' | 'manager'>('all');
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'career_page' | 'linkedin'>('all');
  const [selectedWorkMode, setSelectedWorkMode] = useState<'all' | 'remote' | 'hybrid' | 'onsite'>('all');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  // Jobs state
  const [jobsList, setJobsList] = useState<DiscoveredJobItem[]>([]);
  const [allDiscoveredJobs, setAllDiscoveredJobs] = useState<DiscoveredJobItem[]>(() => {
    return safeStorage.getItem<DiscoveredJobItem[]>('drc_discovered_all_jobs_v2', []);
  });

  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    return safeStorage.getItem<string[]>('drc_starred_job_ids_v2', []);
  });

  // Offline recovery & Diagnostics state
  const [isUsingOfflineCache, setIsUsingOfflineCache] = useState<boolean>(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<{
    title: string;
    query?: string;
    location?: string;
    reason: string;
    isNetwork?: boolean;
    timestamp: string;
  } | null>(null);

  // Filter to show only saved jobs in feed
  const [showOnlySaved, setShowOnlySaved] = useState<boolean>(false);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);

  // Seen ids to prevent duplicate cards during load more
  const [seenJobIds, setSeenJobIds] = useState<Set<string>>(new Set());
  const [batchOffset, setBatchOffset] = useState<number>(0);

  // Set global loader cursor when search or filter is processing
  useEffect(() => {
    if (searching || isAppending || isFiltering) {
      document.body.style.cursor = 'wait';
    } else {
      document.body.style.cursor = '';
    }
    return () => {
      document.body.style.cursor = '';
    };
  }, [searching, isAppending, isFiltering]);

  // Modals state
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<JobDetailData | null>(null);
  const [selectedJobForApplication, setSelectedJobForApplication] = useState<DiscoveredJobItem | null>(null);

  // User candidate identity
  const candidateEmail = user?.email || 'guest_consulting@drc.internal';

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

  // Sync with Backend SQLite Discovered History on Mount (Loads all 1000+ jobs latest to oldest)
  useEffect(() => {
    getDiscoveredJobsHistory('all')
      .then((res) => {
        if (res && res.all_jobs && res.all_jobs.length > 0) {
          setAllDiscoveredJobs(res.all_jobs);
          safeStorage.setItem('drc_discovered_all_jobs_v2', res.all_jobs.slice(0, 1500));
          // Seed the initial feed with the top 20 latest verified jobs so user immediately sees opportunities
          setJobsList((prev) => (prev.length === 0 ? res.all_jobs.slice(0, 20) : prev));
        }
      })
      .catch((err) => {
        errorLogger.warn('JonHunterJobPortal', `SQLite history fetch notice: ${err?.message || err}`);
      });
  }, []);

  // 2. Fresh Search Requisitions
  const executeFreshSearch = useCallback(
    async (
      query: string = searchQuery,
      location: string = selectedLocation,
      seniority: 'all' | 'entry' | 'intermediate' | 'senior' | 'lead' | 'manager' = selectedSeniority,
      channel: 'all' | 'career_page' | 'linkedin' = selectedChannel,
      isAppend: boolean = false,
      profile: CandidateParsedProfile | null = resumeProfile,
      customSeen?: Set<string>,
      workMode: 'all' | 'remote' | 'hybrid' | 'onsite' = selectedWorkMode,
      skills: string[] = selectedSkills
    ) => {
      if (isAppend) {
        setIsAppending(true);
      } else {
        setSearching(true);
        setSearchError(null);
      }

      try {
        const currentSeenSet = customSeen || seenJobIds;
        const currentSeenArray = Array.from(currentSeenSet);
        const limit = 5;

        // Convert workMode for API
        const apiWorkMode =
          workMode === 'remote' ? 'remote_only' : workMode === 'all' ? 'remote_included' : workMode;

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
                work_mode: apiWorkMode,
                open_to_relocation: true,
                notice_period: 'Immediate',
                skills: skills,
              }
            : null,
          limit,
          channel,
          currentSeenArray,
          isAppend ? batchOffset : 0,
          seniority,
          apiWorkMode,
          true,
          'Immediate',
          skills
        );

        setEngineOnline(true);
        setSearchError(null);
        const retrieved = result.jobs || [];

        const newSeen = new Set(currentSeenSet);
        retrieved.forEach((j) => {
          if (j.id) newSeen.add(j.id);
        });
        setSeenJobIds(newSeen);

        if (isAppend) {
          setJobsList((prev) => [...prev, ...retrieved]);
          setBatchOffset((prev) => prev + retrieved.length);
        } else {
          setJobsList(retrieved);
          setBatchOffset(retrieved.length);
        }

        setIsUsingOfflineCache(false);

        // Cache all discovered jobs safely
        setAllDiscoveredJobs((prev) => {
          const map = new Map(prev.map((j) => [j.id || j.application_url, j]));
          retrieved.forEach((j) => {
            const key = j.id || j.application_url;
            if (!map.has(key)) map.set(key, j);
          });
          const merged = Array.from(map.values());
          safeStorage.setItem('drc_discovered_all_jobs_v2', merged.slice(0, 1000));
          return merged;
        });
      } catch (err: any) {
        errorLogger.error('JonHunterJobPortal.executeFreshSearch', err);
        setEngineOnline(false);

        const isNet = isNetworkError(err);
        const qClean = (query || '').trim();
        const friendlyMsg = getUserFriendlyErrorMessage(
          err,
          'Unable to connect to the Job Discovery Engine. Please check your network or verify port 5055 is active.'
        );

        // Graceful Local Offline Degradation: Query cached requisitions
        if (allDiscoveredJobs && allDiscoveredJobs.length > 0) {
          setIsUsingOfflineCache(true);
          const qWords = qClean.toLowerCase().split(/\s+/).filter(Boolean);

          const filtered = allDiscoveredJobs.filter((job) => {
            if (!job) return false;
            // Match location if user requested a specific city
            if (location && location !== 'All India (Remote & Nationwide)') {
              const jobLoc = (job.location || '').toLowerCase();
              const reqLoc = location.split(',')[0].toLowerCase();
              if (!jobLoc.includes(reqLoc)) return false;
            }
            // Match keywords
            if (qWords.length > 0) {
              const title = (job.job_title || '').toLowerCase();
              const desc = (job.job_description || '').toLowerCase();
              const comp = (job.company || '').toLowerCase();
              const skillsStr = (Array.isArray(job.key_skills) ? job.key_skills.join(' ') : '').toLowerCase();
              const haystack = `${title} ${desc} ${comp} ${skillsStr}`;
              const matches = qWords.some((word) => haystack.includes(word));
              if (!matches) return false;
            }
            return true;
          });

          const fallbackList = filtered.slice(0, 20);
          if (fallbackList.length > 0) {
            setJobsList(fallbackList);
            setSearchError(null);
            toast.warning(`Engine offline: Showing ${fallbackList.length} verified matching jobs from local archive.`);
          } else {
            // No offline matching jobs found for this specific query/location
            setJobsList([]);
            setSearchError({
              title: isNet ? 'Job Search Network Connection Error' : 'Job Search Service Unavailable',
              query: qClean || undefined,
              location: location !== 'All India (Remote & Nationwide)' ? location : undefined,
              reason: isNet
                ? 'Unable to reach the Job Discovery engine (Port 5055 / Cloud API). The server may be restarting or offline, and no matching requisitions were found in the local archive.'
                : friendlyMsg,
              isNetwork: isNet,
              timestamp: new Date().toLocaleTimeString(),
            });
            toast.error(friendlyMsg);
          }
        } else {
          setJobsList([]);
          setSearchError({
            title: isNet ? 'Job Search Network Connection Error' : 'Job Search Service Unavailable',
            query: qClean || undefined,
            location: location !== 'All India (Remote & Nationwide)' ? location : undefined,
            reason: isNet
              ? 'Unable to reach the Job Discovery engine (Port 5055 / Cloud API). Please check your internet connection or verify the server status.'
              : friendlyMsg,
            isNetwork: isNet,
            timestamp: new Date().toLocaleTimeString(),
          });
          toast.error(friendlyMsg);
        }
      } finally {
        setSearching(false);
        setIsAppending(false);
      }
    },
    [
      searchQuery,
      selectedLocation,
      selectedSeniority,
      selectedChannel,
      resumeProfile,
      seenJobIds,
      batchOffset,
      selectedWorkMode,
      selectedSkills,
    ]
  );

  // Initial load
  useEffect(() => {
    verifyEngine().then(() => {
      executeFreshSearch('', 'All India (Remote & Nationwide)', 'all', 'all', false);
    });
  }, []);

  // Suggested skills
  const suggestedSkills = useMemo(() => {
    return getSuggestedSkillsForRole(searchQuery);
  }, [searchQuery]);

  // Handlers for Filters - in-memory client-side filtering with smooth middle loader feedback
  const triggerFilterTransition = useCallback(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setIsFiltering(false);
    }, 280);
    return () => clearTimeout(timer);
  }, []);

  const handleLocationChange = (loc: string) => {
    setSelectedLocation(loc);
    triggerFilterTransition();
  };

  const handleSenioritySelect = (seniority: 'all' | 'entry' | 'intermediate' | 'senior' | 'lead' | 'manager') => {
    setSelectedSeniority(seniority);
    triggerFilterTransition();
  };

  const handleChannelChange = (channel: 'all' | 'career_page' | 'linkedin') => {
    setSelectedChannel(channel);
    triggerFilterTransition();
  };

  const handleWorkModeChange = (wm: 'all' | 'remote' | 'hybrid' | 'onsite') => {
    setSelectedWorkMode(wm);
    triggerFilterTransition();
  };

  const handleToggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
    triggerFilterTransition();
  };

  const handleMinAtsScoreChange = (score: 'all' | '70' | '80' | '85') => {
    setMinAtsScoreFilter(score);
    triggerFilterTransition();
  };

  const isSearchProcessing = (searching && !isAppending) || isFiltering;

  // Explicit user input: Clicking "Search Jobs" in Hero executes fresh engine search
  const handleManualSearch = (queryOverride?: string) => {
    const activeQuery = typeof queryOverride === 'string' ? queryOverride : searchQuery;
    setSeenJobIds(new Set());
    setBatchOffset(0);
    setSearchError(null);
    executeFreshSearch(
      activeQuery,
      selectedLocation,
      selectedSeniority,
      selectedChannel,
      false,
      resumeProfile,
      new Set(),
      selectedWorkMode,
      selectedSkills
    );
  };

  // Quick search pill suggestion handler
  const handleQuickSearchSuggestion = (term: string) => {
    setSearchQuery(term);
    setSearchError(null);
    setSeenJobIds(new Set());
    setBatchOffset(0);
    executeFreshSearch(
      term,
      selectedLocation,
      selectedSeniority,
      selectedChannel,
      false,
      resumeProfile,
      new Set(),
      selectedWorkMode,
      selectedSkills
    );
  };

  // Explicit user input: Clicking "Load 5 More" appends fresh jobs
  const handleLoadMore = () => {
    executeFreshSearch(
      searchQuery,
      selectedLocation,
      selectedSeniority,
      selectedChannel,
      true,
      resumeProfile,
      seenJobIds,
      selectedWorkMode,
      selectedSkills
    );
  };

  // Resume Upload Handler
  const handleFileUpload = async (file: File) => {
    setParsingResume(true);
    setResumeFileName(file.name);
    try {
      const { profile: parsedProf } = await parseCandidateResume(file);
      setResumeProfile(parsedProf);

      if (parsedProf.target_roles && parsedProf.target_roles.length > 0 && !searchQuery) {
        setSearchQuery(parsedProf.target_roles[0]);
      }

      toast.success(`Resume scanned: ${parsedProf.name} (${parsedProf.total_experience_years || 0} yrs exp)`);

      const extractedSkills = parsedProf.top_skills || [];
      setSelectedSkills(extractedSkills);

      await executeFreshSearch(
        parsedProf.target_roles?.[0] || searchQuery,
        selectedLocation,
        selectedSeniority,
        selectedChannel,
        false,
        parsedProf,
        undefined,
        selectedWorkMode,
        extractedSkills
      );
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

  // Star / Bookmark Job
  const handleToggleStar = (job: DiscoveredJobItem) => {
    const jobId = job.id;
    setSavedJobIds((prev) => {
      const next = prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId];
      safeStorage.setItem('drc_starred_job_ids_v2', next);
      if (prev.includes(jobId)) {
        toast.info('Removed from saved jobs');
      } else {
        toast.success('Job saved to your collection ⭐');
      }
      return next;
    });
  };

  // Toggle Status (Not Applied <-> Applied)
  const handleToggleStatus = async (job: DiscoveredJobItem) => {
    const nextStatus = job.status === 'Applied' ? 'Not Applied' : 'Applied';
    const remark = job.remarks || '';

    try {
      await updateJobStatus(candidateEmail, job.id, nextStatus as any, remark);
      setJobsList((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: nextStatus, remarks: remark } : j))
      );
      setAllDiscoveredJobs((prev) => {
        const updated = prev.map((j) => (j.id === job.id ? { ...j, status: nextStatus, remarks: remark } : j));
        safeStorage.setItem('drc_discovered_all_jobs_v2', updated.slice(0, 1000));
        return updated;
      });
      toast.success(`Job marked as ${nextStatus}`);
    } catch (err: any) {
      toast.error(`Failed to update status: ${err.message}`);
    }
  };

  // Save Remarks
  const handleSaveRemark = async (job: DiscoveredJobItem, remarkText: string) => {
    const currentStatus = job.status || 'Not Applied';
    try {
      await updateJobStatus(candidateEmail, job.id, currentStatus as any, remarkText);
      setJobsList((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, remarks: remarkText } : j))
      );
      setAllDiscoveredJobs((prev) => {
        const updated = prev.map((j) => (j.id === job.id ? { ...j, remarks: remarkText } : j));
        safeStorage.setItem('drc_discovered_all_jobs_v2', updated.slice(0, 1000));
        return updated;
      });
      toast.success('Note saved successfully');
    } catch {
      toast.error('Failed to save note');
    }
  };

  // View Details Modal Trigger
  const handleViewDetail = (job: DiscoveredJobItem) => {
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
    });
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
    } as any);
  };

  // Apply Now handler - Supports direct external apply mode or modal flow via JSON config
  const handleApplyNow = (job: DiscoveredJobItem | JobDetailData) => {
    if (!job) return;

    // Check JSON config: default to bypassing application modal (direct apply) unless explicitly set to false
    const shouldBypassModal = discoveryFiltersConfig?.bypassApplicationModal !== false;

    if (shouldBypassModal) {
      const rawUrl =
        (job as any).application_url ||
        (job as any).applicationUrl ||
        (job as any).job_url ||
        (job as any).jobUrl ||
        (job as any).url ||
        (job as any).link ||
        '';

      const companyName = ('company' in job ? job.company : (job as any).company) || 'Enterprise Partner';

      if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim().length > 0) {
        openExternalJobLink(rawUrl, companyName);
        return;
      } else {
        toast.info('Direct application link not available for this role.');
      }
      return;
    }

    handleOpenApplicationModal(job);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchError(null);
    setSearchQuery('');
    setSelectedLocation('All India (Remote & Nationwide)');
    setSelectedSeniority('all');
    setSelectedChannel('all');
    setSelectedWorkMode('all');
    setSelectedSkills([]);
    setMinAtsScoreFilter('all');
    setShowOnlySaved(false);
    executeFreshSearch('', 'All India (Remote & Nationwide)', 'all', 'all', false, resumeProfile, undefined, 'all', []);
    toast.success('Filters reset to default.');
  };

  // Reset seen history
  const handleResetSeenHistory = () => {
    if (window.confirm('Reset seen requisition history? This will clear duplicate exclusions so you can explore all fresh postings again.')) {
      setSeenJobIds(new Set());
      setBatchOffset(0);
      executeFreshSearch(
        searchQuery,
        selectedLocation,
        selectedSeniority,
        selectedChannel,
        false,
        resumeProfile,
        new Set()
      );
      toast.success('Seen history reset. Reloading fresh requisitions.');
    }
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedLocation !== 'All India (Remote & Nationwide)') count++;
    if (selectedSeniority !== 'all') count++;
    if (selectedChannel !== 'all') count++;
    if (selectedWorkMode !== 'all') count++;
    if (selectedSkills.length > 0) count += selectedSkills.length;
    if (minAtsScoreFilter !== 'all') count++;
    if (showOnlySaved) count++;
    return count;
  }, [
    searchQuery,
    selectedLocation,
    selectedSeniority,
    selectedChannel,
    selectedWorkMode,
    selectedSkills,
    minAtsScoreFilter,
    showOnlySaved,
  ]);

  const displayedJobsList = useMemo(() => {
    // If a search error is active, suppress displayed jobs to allow Error Card to take prominence
    if (searchError) {
      return [];
    }

    const qClean = (searchQuery || '').trim().toLowerCase();

    // Determine initial candidate list from either active jobsList or archive pool
    let list: DiscoveredJobItem[] = [];
    const pool = jobsList.length > 0 ? jobsList : allDiscoveredJobs;

    if (qClean) {
      const qWords = qClean.split(/\s+/).filter((w) => w.length > 1);
      // Strictly filter candidate jobs by search relevance
      list = pool.filter((j) => {
        if (!j) return false;
        const t = (j.job_title || '').toLowerCase();
        const d = (j.job_description || '').toLowerCase();
        const c = (j.company || '').toLowerCase();
        const s = (Array.isArray(j.key_skills) ? j.key_skills.join(' ') : '').toLowerCase();
        const haystack = `${t} ${c} ${s} ${d}`;

        // Exact match in title, company or skills
        if (t.includes(qClean) || c.includes(qClean) || s.includes(qClean)) return true;
        // Or all words match anywhere
        if (qWords.length > 0 && qWords.every((w) => haystack.includes(w))) return true;
        // Or any keyword matches title or skills
        if (qWords.length > 0 && qWords.some((w) => t.includes(w) || s.includes(w))) return true;

        return false;
      });

      // Sort by relevance (exact title > title word > skills > description)
      list = [...list].sort((a, b) => {
        const aTitle = (a.job_title || '').toLowerCase();
        const bTitle = (b.job_title || '').toLowerCase();
        const aSkills = (Array.isArray(a.key_skills) ? a.key_skills.join(' ') : '').toLowerCase();
        const bSkills = (Array.isArray(b.key_skills) ? b.key_skills.join(' ') : '').toLowerCase();

        const getScore = (title: string, skills: string) => {
          if (title.includes(qClean)) return 100;
          if (skills.includes(qClean)) return 75;
          let score = 0;
          qWords.forEach((w) => {
            if (title.includes(w)) score += 20;
            if (skills.includes(w)) score += 10;
          });
          return score;
        };

        return getScore(bTitle, bSkills) - getScore(aTitle, aSkills);
      });
    } else {
      list = jobsList.length > 0 ? jobsList : allDiscoveredJobs.slice(0, 20);
    }

    // 1. Saved Filter
    if (showOnlySaved) {
      const savedSet = new Set(savedJobIds);
      const combined = [...jobsList, ...allDiscoveredJobs];
      const map = new Map<string, DiscoveredJobItem>();
      combined.forEach((j) => {
        if (j?.id && savedSet.has(j.id) && !map.has(j.id)) {
          map.set(j.id, j);
        }
      });
      list = Array.from(map.values());
    }

    // 2. Channel Filter
    if (selectedChannel === 'career_page') {
      list = list.filter((j) => {
        const src = (j.source_type || j.apply_type || '').toLowerCase();
        return src.includes('career') || src.includes('company');
      });
    } else if (selectedChannel === 'linkedin') {
      list = list.filter((j) => {
        const src = (j.source_type || j.apply_type || '').toLowerCase();
        return src.includes('linkedin');
      });
    }

    // 3. Work Mode Filter
    if (selectedWorkMode === 'remote') {
      list = list.filter((j) => (j.location || '').toLowerCase().includes('remote') || (j.job_type || '').toLowerCase().includes('remote'));
    } else if (selectedWorkMode === 'hybrid') {
      list = list.filter((j) => (j.location || '').toLowerCase().includes('hybrid') || (j.job_type || '').toLowerCase().includes('hybrid'));
    } else if (selectedWorkMode === 'onsite') {
      list = list.filter((j) => !(j.location || '').toLowerCase().includes('remote'));
    }

    // 4. Seniority Filter
    if (selectedSeniority !== 'all') {
      list = list.filter((j) => {
        const sen = (j.seniority || '').toLowerCase();
        const exp = (j.experience || '').toLowerCase();
        if (selectedSeniority === 'intermediate') {
          return sen.includes('intermediate') || sen.includes('mid') || exp.includes('2') || exp.includes('3') || exp.includes('4') || exp.includes('5');
        }
        if (selectedSeniority === 'senior') {
          return sen.includes('senior') || exp.includes('5') || exp.includes('6') || exp.includes('7') || exp.includes('8');
        }
        if (selectedSeniority === 'lead') {
          return sen.includes('lead') || sen.includes('principal') || sen.includes('staff') || exp.includes('8') || exp.includes('10');
        }
        if (selectedSeniority === 'manager') {
          return sen.includes('manager') || sen.includes('director') || exp.includes('12') || exp.includes('15');
        }
        return true;
      });
    }

    // 5. Location Filter
    if (selectedLocation && selectedLocation !== 'All India (Remote & Nationwide)') {
      const targetLoc = selectedLocation.split(',')[0].toLowerCase().trim();
      list = list.filter((j) => {
        const loc = (j.location || '').toLowerCase();
        return loc.includes(targetLoc);
      });
    }

    // 6. Skills Filter
    if (selectedSkills.length > 0) {
      list = list.filter((j) => {
        const jobSkills = Array.isArray(j.key_skills) ? j.key_skills.map((s) => s.toLowerCase()) : [];
        const fullDesc = (j.job_description || j.job_title || '').toLowerCase();
        return selectedSkills.some((s) => jobSkills.includes(s.toLowerCase()) || fullDesc.includes(s.toLowerCase()));
      });
    }

    // 7. ATS Score Filter (ONLY applied if candidate uploaded a resume)
    if (!resumeProfile || minAtsScoreFilter === 'all') {
      return list;
    }
    const minThreshold = parseInt(minAtsScoreFilter, 10);
    return list.filter((j) => ((j.ats_score ?? (j as any).match_score ?? 0) >= minThreshold));
  }, [
    jobsList,
    allDiscoveredJobs,
    searchQuery,
    showOnlySaved,
    savedJobIds,
    selectedChannel,
    selectedWorkMode,
    selectedSeniority,
    selectedLocation,
    selectedSkills,
    resumeProfile,
    minAtsScoreFilter,
    searchError,
  ]);

  const allCombinedJobs = useMemo(() => {
    const map = new Map<string, DiscoveredJobItem>();
    allDiscoveredJobs.forEach((j) => {
      if (j?.id) map.set(j.id, j);
    });
    jobsList.forEach((j) => {
      if (j?.id && !map.has(j.id)) map.set(j.id, j);
    });
    const combined = Array.from(map.values());
    // Sort latest to oldest
    combined.sort((a, b) => {
      const dateA = a.discovered_at ? new Date(a.discovered_at).getTime() : 0;
      const dateB = b.discovered_at ? new Date(b.discovered_at).getTime() : 0;
      if (dateB !== dateA) return dateB - dateA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });
    return combined;
  }, [allDiscoveredJobs, jobsList]);

  const appliedCount = useMemo(() => {
    return allDiscoveredJobs.filter((j) => j.status === 'Applied').length;
  }, [allDiscoveredJobs]);

  const theme = getActiveTheme();

  return (
    <div
      className={`min-h-screen text-white font-sans antialiased selection:bg-[#00C896]/20 selection:text-[#00C896] relative ${theme.wrapperClass}`}
      style={theme.wrapperStyle}
    >
      {/* Ambient background glow if applicable */}
      {theme.accentGlowSvg && (
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-40 mix-blend-screen"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(18, 128, 92, 0.25), transparent 70%)',
          }}
        />
      )}

      {/* 1. Sub-Header Navigation Bar */}
      <JonHunterNav
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
        savedCount={savedJobIds.length}
        appliedCount={appliedCount}
        totalDiscoveredCount={allDiscoveredJobs.length > 0 ? allDiscoveredJobs.length : 1500}
        onNavigateHome={onNavigateHome}
        onNavigateSignIn={onNavigateSignIn}
        engineOnline={engineOnline}
      />

      {/* 2. Main View Selection */}
      {activeNavTab === 'discover' && (
        <main>
          {/* Hero Section */}
          <JonHunterHero
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            selectedLocation={selectedLocation}
            onLocationChange={handleLocationChange}
            selectedSeniority={selectedSeniority}
            onSeniorityChange={handleSenioritySelect}
            locationsList={availableLocations}
            onExecuteSearch={handleManualSearch}
            isSearching={searching && !isAppending}
          />

          {/* Recommendations ("Jobs we think you'll love") - Controlled by discoveryFilters.json */}
          {discoveryFiltersConfig?.showRecommendationsSection && (
            <div id="recommended-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <RecommendedJobsSection
                onApplyRoleToSearch={(role, seniority) => {
                  setSearchQuery(role);
                  if (seniority) setSelectedSeniority(seniority);
                  executeFreshSearch(
                    role,
                    selectedLocation,
                    seniority || selectedSeniority,
                    selectedChannel,
                    false
                  );
                  const el = document.getElementById('search-results-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onSelectJobForDetail={handleViewDetail}
                savedJobIds={savedJobIds}
                onToggleStar={handleToggleStar}
              />
            </div>
          )}

          {/* Main Discovery Results & Filters Grid */}
          <div id="search-results-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Filters Sidebar */}
              <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-20">
                <FiltersSidebar
                  selectedChannel={selectedChannel}
                  onChannelChange={handleChannelChange}
                  selectedSeniority={selectedSeniority}
                  onSeniorityChange={handleSenioritySelect}
                  selectedWorkMode={selectedWorkMode}
                  onWorkModeChange={handleWorkModeChange}
                  minAtsScoreFilter={minAtsScoreFilter}
                  onMinAtsScoreChange={handleMinAtsScoreChange}
                  selectedSkills={selectedSkills}
                  suggestedSkills={suggestedSkills}
                  onToggleSkill={handleToggleSkill}
                  onResetFilters={handleResetFilters}
                  totalFilteredCount={displayedJobsList.length}
                  totalDiscoveredCount={allCombinedJobs.length > 0 ? allCombinedJobs.length : 1500}
                  savedCount={savedJobIds.length}
                  appliedCount={appliedCount}
                  showOnlySaved={showOnlySaved}
                  hasResume={!!resumeProfile}
                  onToggleShowSaved={() => setShowOnlySaved((prev) => !prev)}
                  onShowAllJobs={() => {
                    setShowOnlySaved(false);
                    setSelectedChannel('all');
                  }}
                  onNavigateTracker={() => setActiveNavTab('tracker')}
                />
              </div>

              {/* Right Column: Search Results Feed (Middle Section) */}
              <div
                className={`lg:col-span-8 xl:col-span-9 space-y-5 relative transition-all duration-200 ${
                  isSearchProcessing ? 'cursor-wait select-none' : ''
                }`}
                style={isSearchProcessing ? { cursor: 'wait' } : undefined}
              >
                {/* Resume ATS Scanner Banner */}
                <ResumeAtsBanner
                  resumeProfile={resumeProfile}
                  resumeFileName={resumeFileName}
                  isParsing={parsingResume}
                  onFileUpload={handleFileUpload}
                  onClearResume={handleClearResume}
                />

                {/* Results Header Toolbar (High Contrast, Clean Layout) */}
                <div className={`${theme.cardClass} rounded-2xl ${theme.cardBorderClass} p-4 sm:p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-base sm:text-lg font-bold text-white">
                        {isSearchProcessing && !isAppending
                          ? 'Searching Opportunities...'
                          : showOnlySaved
                          ? `Saved Opportunities (${displayedJobsList.length})`
                          : displayedJobsList.length > 0
                          ? `Showing 1 - ${displayedJobsList.length} verified opportunities`
                          : 'Job Search Results'}
                      </h2>
                      {isSearchProcessing && !isAppending ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30 flex items-center gap-1.5 animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin text-[#00C896]" />
                          <span>Scanning Engine</span>
                        </span>
                      ) : activeFilterCount > 0 ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30">
                          {activeFilterCount} active filters
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-zinc-300 mt-1">
                      {showOnlySaved
                        ? 'Quick access to all opportunities you have saved or bookmarked.'
                        : 'Direct career portals (Greenhouse, Lever, Workday) and verified hiring posts.'}
                    </p>
                  </div>

                  {/* Channel quick buttons, Saved toggle & 1000+ Archive Shortcut */}
                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <div className={`flex items-center ${theme.innerBoxClass} p-1 rounded-xl ${theme.innerBoxBorderClass} flex-wrap sm:flex-nowrap gap-1`}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowOnlySaved(false);
                          setSelectedChannel('all');
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          !showOnlySaved && selectedChannel === 'all'
                            ? 'bg-[#00C896] text-[#0A0A0A] font-bold shadow-sm'
                            : 'text-zinc-300 hover:text-white'
                        }`}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowOnlySaved(false);
                          setSelectedChannel('career_page');
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          !showOnlySaved && selectedChannel === 'career_page'
                            ? 'bg-[#00C896] text-[#0A0A0A] font-bold shadow-sm'
                            : 'text-zinc-300 hover:text-white'
                        }`}
                      >
                        Career Pages
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowOnlySaved(false);
                          setSelectedChannel('linkedin');
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          !showOnlySaved && selectedChannel === 'linkedin'
                            ? 'bg-[#00C896] text-[#0A0A0A] font-bold shadow-sm'
                            : 'text-zinc-300 hover:text-white'
                        }`}
                      >
                        LinkedIn
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowOnlySaved((prev) => !prev)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          showOnlySaved
                            ? 'bg-amber-400 text-[#0A0A0A] font-bold shadow-sm'
                            : 'text-zinc-300 hover:text-amber-300'
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${showOnlySaved ? 'fill-black text-black' : 'text-amber-400'}`} />
                        <span>Saved ({savedJobIds.length})</span>
                      </button>
                    </div>

                    {/* View All 1000+ Archive */}
                    <button
                      type="button"
                      onClick={() => setActiveNavTab('archive')}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border bg-[#00C896]/15 hover:bg-[#00C896]/25 text-[#00C896] border-[#00C896]/35 shadow-sm"
                      title="Explore complete 1000+ discovered repository ordered latest to oldest"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>1000+ Archive &rarr;</span>
                    </button>

                    {/* Reset Seen History */}
                    <button
                      type="button"
                      onClick={handleResetSeenHistory}
                      title="Reset seen exclusion cache"
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-200 hover:text-white bg-[#20222A] hover:bg-[#2A2D38] border border-[#343744] hover:border-[#4B4F60] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#00C896]" />
                      <span className="hidden sm:inline">Reset</span>
                    </button>

                    {/* System Diagnostics Trigger */}
                    <button
                      type="button"
                      onClick={() => setIsDiagnosticsOpen(true)}
                      title="Inspect engine connection & diagnostics"
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#20222A] hover:bg-[#2A2D38] border border-[#343744] hover:border-[#4B4F60] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="hidden lg:inline text-[11px]">System Status</span>
                    </button>
                  </div>
                </div>

                {/* Offline Cache Recovery Banner */}
                {isUsingOfflineCache && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-md">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Live Search Engine Reconnecting</p>
                        <p className="text-[11px] text-zinc-300">
                          Showing verified offline requisitions from local archive ({displayedJobsList.length} matching).
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={handleManualSearch}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry Live</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDiagnosticsOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Diagnostics
                      </button>
                    </div>
                  </div>
                )}

                {/* Job Cards Feed */}
                {isSearchProcessing && displayedJobsList.length === 0 ? (
                  <div className="space-y-4">
                    {/* Prominent Animated Search In Progress Card in Middle Section */}
                    <div className={`${theme.cardClass} rounded-2xl ${theme.cardBorderClass} p-8 sm:p-10 shadow-xl border relative overflow-hidden text-center cursor-wait`}>
                      {/* Top Animated Gradient Shimmer Bar */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00C896] to-transparent animate-pulse" />

                      {/* Concentric Pulsing Radar / Spinner */}
                      <div className="relative w-20 h-20 mx-auto mb-5 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-[#00C896]/15 animate-ping" />
                        <div className="absolute inset-1 rounded-full border-2 border-[#00C896]/30 border-t-[#00C896] animate-spin" />
                        <div className="w-12 h-12 rounded-2xl bg-[#00C896]/15 border border-[#00C896]/40 flex items-center justify-center text-[#00C896] shadow-[0_0_20px_rgba(0,200,150,0.3)]">
                          <Search className="w-6 h-6 animate-pulse" />
                        </div>
                      </div>

                      {/* Dynamic Title */}
                      <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                        {searchQuery.trim()
                          ? `Searching Verified Roles for "${searchQuery}"...`
                          : 'Discovering Verified Opportunities...'}
                      </h3>

                      <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto mt-2 leading-relaxed">
                        Querying real-time corporate career pages (Greenhouse, Lever, Workday) and pan-India requisitions
                        {selectedLocation !== 'All India (Remote & Nationwide)' ? ` across ${selectedLocation}` : ''}.
                      </p>

                      {/* Live scanning pill badges */}
                      <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#20222A] text-zinc-200 border border-[#343744]">
                          <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse" />
                          <span>Direct ATS Feeds</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#20222A] text-zinc-200 border border-[#343744]">
                          <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse" />
                          <span>Strict Keyword Match</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#20222A] text-zinc-200 border border-[#343744]">
                          <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse" />
                          <span>Pan-India Executive Band</span>
                        </span>
                      </div>
                    </div>

                    {/* Shimmer Skeleton Cards */}
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className={`${theme.cardClass} border ${theme.cardBorderClass} rounded-2xl p-6 animate-pulse space-y-4 shadow-md`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl ${theme.innerBoxClass}`} />
                            <div className="space-y-2">
                              <div className={`h-4 ${theme.innerBoxClass} rounded w-44`} />
                              <div className={`h-3 ${theme.innerBoxClass} rounded w-28`} />
                            </div>
                          </div>
                          <div className={`h-6 ${theme.innerBoxClass} rounded-full w-20`} />
                        </div>
                        <div className={`h-3 ${theme.innerBoxClass} rounded w-3/4`} />
                        <div className="flex gap-2">
                          <div className={`h-6 ${theme.innerBoxClass} rounded-lg w-16`} />
                          <div className={`h-6 ${theme.innerBoxClass} rounded-lg w-20`} />
                          <div className={`h-6 ${theme.innerBoxClass} rounded-lg w-24`} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : displayedJobsList.length > 0 ? (
                  <div className="space-y-4 relative">
                    {/* Middle Section Center Loading Overlay Animation when search/filter is processing */}
                    {isSearchProcessing && (
                      <div className="absolute inset-0 z-30 bg-[#10131A]/75 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-6 min-h-[350px] transition-all duration-200 cursor-wait">
                        <div className="relative w-20 h-20 mb-4 flex items-center justify-center pointer-events-none">
                          <div className="absolute inset-0 rounded-full bg-[#00C896]/20 animate-ping" />
                          <div className="absolute inset-1 rounded-full border-2 border-[#00C896]/30 border-t-[#00C896] animate-spin" />
                          <div className="w-12 h-12 rounded-2xl bg-[#00C896]/15 border border-[#00C896]/40 flex items-center justify-center text-[#00C896] shadow-[0_0_25px_rgba(0,200,150,0.35)]">
                            <Loader2 className="w-6 h-6 animate-spin text-[#00C896]" />
                          </div>
                        </div>

                        <div className="text-center px-4 pointer-events-none">
                          <h4 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center justify-center gap-2">
                            <span>
                              {searchQuery.trim()
                                ? `Searching Verified Roles for "${searchQuery}"...`
                                : 'Updating Verified Opportunities...'}
                            </span>
                          </h4>
                          <p className="text-xs text-zinc-300 mt-1 max-w-sm">
                            Querying live corporate career portals & verified hiring posts
                          </p>
                        </div>
                      </div>
                    )}
                    {displayedJobsList.map((job) => (
                      <JobCardErrorBoundary key={job.id} jobId={job.id} jobTitle={job.job_title}>
                        <JobCardNaukri
                          job={job}
                          isSaved={savedJobIds.includes(job.id)}
                          hasResume={!!resumeProfile}
                          onToggleStar={handleToggleStar}
                          onViewDetails={handleViewDetail}
                          onApplyNow={() => handleApplyNow(job)}
                          onToggleStatus={handleToggleStatus}
                          onSaveRemark={(j, r) => handleSaveRemark(j, r)}
                        />
                      </JobCardErrorBoundary>
                    ))}

                    {/* Appending Indicator Banner */}
                    {isAppending && (
                      <div className={`${theme.cardClass} rounded-2xl border border-[#00C896]/30 p-4 flex items-center justify-center gap-3 text-xs text-[#00C896] font-semibold shadow-md animate-pulse`}>
                        <Loader2 className="w-4 h-4 animate-spin text-[#00C896]" />
                        <span>Querying live engine for next 5 verified requisitions...</span>
                      </div>
                    )}

                    {/* Load 5 More Fresh Jobs Button (Solid, clearly visible) */}
                    {!showOnlySaved && (
                      <div className={`pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 ${theme.cardClass} rounded-2xl ${theme.cardBorderClass} p-4 shadow-md`}>
                        <div className="text-xs text-zinc-300">
                          <span>Showing {displayedJobsList.length} verified roles from active database</span>
                        </div>

                        <button
                          type="button"
                          disabled={isAppending}
                          onClick={handleLoadMore}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-75"
                        >
                          {isAppending ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Fetching Next 5 Openings...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4" />
                              <span>Load 5 More Opportunities</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : searchError ? (
                  /* Dedicated High-Contrast Error Card */
                  <div className={`${theme.cardClass} rounded-2xl border border-red-500/40 p-6 sm:p-8 shadow-xl bg-gradient-to-b from-red-500/10 via-transparent to-transparent`}>
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                        {searchError.isNetwork ? <WifiOff className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-lg font-bold text-white tracking-tight">{searchError.title}</h3>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/30">
                            {searchError.isNetwork ? 'Port 5055 / Cloud Offline' : 'Engine Error'}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {searchError.timestamp}
                          </span>
                        </div>

                        {searchError.query && (
                          <p className="text-sm font-semibold text-zinc-200 mt-1">
                            Search could not be completed for role: <span className="text-[#00C896] underline font-bold">"{searchError.query}"</span>
                            {searchError.location && <span> in {searchError.location}</span>}
                          </p>
                        )}

                        <div className="mt-3 p-3.5 rounded-xl bg-[#0C0E14] border border-[#272A32] text-xs text-zinc-300 font-mono leading-relaxed break-words">
                          {searchError.reason}
                        </div>

                        <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                          The search query could not be executed because the background engine service was unavailable or the connection was interrupted. You can retry the request, inspect system health diagnostics, or reset filters.
                        </p>

                        <div className="flex items-center gap-3 mt-5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleManualSearch(searchError.query)}
                            className="px-5 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retry Search Now</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsDiagnosticsOpen(true)}
                            className="px-4 py-2.5 rounded-xl bg-[#20222A] hover:bg-[#2A2D38] text-white border border-[#343744] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2"
                          >
                            <Activity className="w-3.5 h-3.5 text-[#00C896]" />
                            <span>Check System Status</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-medium transition-colors cursor-pointer flex items-center gap-2"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset Filters</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : showOnlySaved ? (
                  /* Empty State for Saved Jobs */
                  <div className={`${theme.cardClass} rounded-2xl border border-dashed ${theme.cardBorderClass} p-12 text-center shadow-md`}>
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
                      <Bookmark className="w-7 h-7 fill-amber-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">No Saved Jobs Yet</h3>
                    <p className="text-sm text-zinc-300 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
                      Click the "Save" button or bookmark icon on any job card to collect opportunities here for quick follow-up.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowOnlySaved(false)}
                      className="px-6 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-[#0A0A0A] text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Explore All Opportunities</span>
                    </button>
                  </div>
                ) : searchQuery.trim() !== '' ? (
                  /* No Verified Jobs Found for Keyword State */
                  <div className={`${theme.cardClass} rounded-2xl border border-dashed ${theme.cardBorderClass} p-8 sm:p-10 text-center shadow-md`}>
                    <div className={`w-14 h-14 rounded-2xl ${theme.innerBoxClass} ${theme.innerBoxBorderClass} flex items-center justify-center text-[#00C896] mx-auto mb-4`}>
                      <Search className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      No Verified Jobs Found for "{searchQuery}"
                    </h3>
                    <p className="text-sm text-zinc-300 max-w-lg mx-auto mt-2 leading-relaxed">
                      We couldn't find active openings matching your keyword in our current verified database
                      {selectedLocation !== 'All India (Remote & Nationwide)' ? ` for ${selectedLocation}` : ''}.
                    </p>

                    {/* Quick Suggestion Pills */}
                    <div className="mt-5 max-w-md mx-auto">
                      <p className="text-xs font-semibold text-zinc-400 mb-2.5 flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#00C896]" />
                        <span>Try searching for these verified high-demand roles:</span>
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {[
                          'Full Stack Developer',
                          'Python Engineer',
                          'React Developer',
                          'DevOps Engineer',
                          'Data Analyst',
                          'Cloud Architect',
                        ].map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => handleQuickSearchSuggestion(role)}
                            className="px-3 py-1.5 rounded-lg bg-[#20222A] hover:bg-[#2A2D38] text-xs font-semibold text-zinc-200 hover:text-[#00C896] border border-[#343744] hover:border-[#00C896]/40 transition-colors cursor-pointer"
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 mt-7 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSearchError(null);
                          executeFreshSearch('', selectedLocation, selectedSeniority, selectedChannel, false);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-[#0A0A0A] text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Clear Search & Show All</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="px-4 py-2.5 rounded-xl bg-[#20222A] hover:bg-[#2A2D38] text-zinc-300 hover:text-white border border-[#343744] text-xs font-medium inline-flex items-center gap-2 cursor-pointer"
                      >
                        <span>Reset All Filters</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Empty State */
                  <div className={`${theme.cardClass} rounded-2xl border border-dashed ${theme.cardBorderClass} p-12 text-center shadow-md`}>
                    <div className={`w-14 h-14 rounded-2xl ${theme.innerBoxClass} ${theme.innerBoxBorderClass} flex items-center justify-center text-[#00C896] mx-auto mb-4`}>
                      <Compass className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-white">No jobs found matching these filters</h3>
                    <p className="text-sm text-zinc-300 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
                      Try clearing your search query, selecting "All Opportunities", or widening your location/experience selection.
                    </p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="px-6 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-[#0A0A0A] text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset All Filters</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 3. Recommended Jobs Direct View (Controlled by config) */}
      {discoveryFiltersConfig?.showRecommendationsSection && activeNavTab === 'recommended' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <RecommendedJobsSection
            onApplyRoleToSearch={(role, seniority) => {
              setActiveNavTab('discover');
              setSearchQuery(role);
              if (seniority) setSelectedSeniority(seniority);
              executeFreshSearch(
                role,
                selectedLocation,
                seniority || selectedSeniority,
                selectedChannel,
                false
              );
            }}
            onSelectJobForDetail={handleViewDetail}
            savedJobIds={savedJobIds}
            onToggleStar={handleToggleStar}
          />
        </main>
      )}

      {/* 4. Discovered Jobs Repository View (All 1000+ Jobs Latest to Old) */}
      {(activeNavTab === 'archive' || activeNavTab === 'saved') && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DiscoveredArchiveView
            allJobs={allCombinedJobs}
            savedJobIds={savedJobIds}
            candidateProfile={resumeProfile}
            onToggleStar={handleToggleStar}
            onViewDetails={handleViewDetail}
            onApplyNow={handleApplyNow}
            onToggleStatus={handleToggleStatus}
            onSaveRemark={(j, r) => handleSaveRemark(j, r)}
            onExploreJobs={() => setActiveNavTab('discover')}
          />
        </main>
      )}

      {/* 5. Application Tracker View */}
      {activeNavTab === 'tracker' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ApplicationTrackerView
            allJobs={allCombinedJobs}
            savedJobIds={savedJobIds}
            onToggleStar={handleToggleStar}
            onViewDetails={handleViewDetail}
            onToggleStatus={handleToggleStatus}
            onSaveRemark={(j, r) => handleSaveRemark(j, r)}
            onExploreJobs={() => setActiveNavTab('discover')}
            onOpenFullTracker={onNavigateTracker}
            isAuthenticated={!!user}
          />
        </main>
      )}

      {/* Modals */}
      <ErrorBoundary fallbackTitle="Could not display job details">
        <JobDetailModal
          isOpen={!!selectedJobForDetail}
          onClose={() => setSelectedJobForDetail(null)}
          job={selectedJobForDetail}
          candidateProfile={resumeProfile}
          onApply={(jobData) => handleApplyNow(jobData as any)}
        />
      </ErrorBoundary>

      {selectedJobForApplication && (
        <ErrorBoundary fallbackTitle="Application flow encountered an issue">
          <ApplicationFlowModal
            isOpen={!!selectedJobForApplication}
            onClose={() => setSelectedJobForApplication(null)}
            job={selectedJobForApplication}
          />
        </ErrorBoundary>
      )}

      {/* Diagnostics Telemetry Modal */}
      <DiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />
    </div>
  );
};

export default JonHunterJobPortal;
