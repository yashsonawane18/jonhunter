import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Compass,
  RotateCcw,
  RefreshCw,
  Bookmark,
  Archive,
  AlertTriangle,
  Activity,
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
import { getUserFriendlyErrorMessage } from '../../lib/errors/AppError';
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

  // Filter to show only saved jobs in feed
  const [showOnlySaved, setShowOnlySaved] = useState<boolean>(false);

  // Seen ids to prevent duplicate cards during load more
  const [seenJobIds, setSeenJobIds] = useState<Set<string>>(new Set());
  const [batchOffset, setBatchOffset] = useState<number>(0);

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

        // Graceful Local Offline Degradation: Query cached 1,500+ requisitions
        if (allDiscoveredJobs && allDiscoveredJobs.length > 0) {
          setIsUsingOfflineCache(true);
          const q = (query || '').toLowerCase().trim();
          const qWords = q.split(/\s+/).filter(Boolean);

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
              const skillsStr = (job.key_skills || []).join(' ').toLowerCase();
              const haystack = `${title} ${desc} ${comp} ${skillsStr}`;
              const matches = qWords.some((word) => haystack.includes(word));
              if (!matches) return false;
            }
            return true;
          });

          const fallbackList = filtered.slice(0, 20);
          if (fallbackList.length > 0) {
            setJobsList(fallbackList);
            toast.warning(`Engine offline: Showing ${fallbackList.length} verified matching jobs from local archive.`);
          } else {
            setJobsList(allDiscoveredJobs.slice(0, 20));
            toast.warning('Engine offline: Showing 20 recent verified jobs from local archive.');
          }
        } else {
          toast.error(getUserFriendlyErrorMessage(err, 'Unable to connect to Job Discovery Engine. Please check connection.'));
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

  // Handlers for Filters - in-memory client-side filtering without network wipes
  const handleLocationChange = (loc: string) => {
    setSelectedLocation(loc);
  };

  const handleSenioritySelect = (seniority: 'all' | 'entry' | 'intermediate' | 'senior' | 'lead' | 'manager') => {
    setSelectedSeniority(seniority);
  };

  const handleChannelChange = (channel: 'all' | 'career_page' | 'linkedin') => {
    setSelectedChannel(channel);
  };

  const handleWorkModeChange = (wm: 'all' | 'remote' | 'hybrid' | 'onsite') => {
    setSelectedWorkMode(wm);
  };

  const handleToggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // Explicit user input: Clicking "Search Jobs" in Hero executes fresh engine search
  const handleManualSearch = () => {
    setSeenJobIds(new Set());
    setBatchOffset(0);
    executeFreshSearch(
      searchQuery,
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
    const qClean = (searchQuery || '').trim().toLowerCase();

    // Determine initial candidate list
    let list: DiscoveredJobItem[] = [];
    if (jobsList.length > 0) {
      list = jobsList;
    } else if (allDiscoveredJobs.length > 0) {
      if (qClean) {
        // Fall back to matching jobs from allDiscoveredJobs repository
        const qWords = qClean.split(/\s+/).filter((w) => w.length > 1);
        const matches = allDiscoveredJobs.filter((j) => {
          const t = (j.job_title || '').toLowerCase();
          const d = (j.job_description || '').toLowerCase();
          const s = (Array.isArray(j.key_skills) ? j.key_skills.join(' ') : '').toLowerCase();
          return t.includes(qClean) || qWords.every((w) => t.includes(w) || d.includes(w) || s.includes(w));
        });
        list = matches.length > 0 ? matches : allDiscoveredJobs.slice(0, 20);
      } else {
        list = allDiscoveredJobs.slice(0, 20);
      }
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

    // 2. Keyword relevance prioritization if user typed a search query
    if (qClean) {
      const qWords = qClean.split(/\s+/).filter((w) => w.length > 1);
      list = [...list].sort((a, b) => {
        const aTitle = (a.job_title || '').toLowerCase();
        const bTitle = (b.job_title || '').toLowerCase();
        const aExact = aTitle.includes(qClean) ? 2 : qWords.some((w) => aTitle.includes(w)) ? 1 : 0;
        const bExact = bTitle.includes(qClean) ? 2 : qWords.some((w) => bTitle.includes(w)) ? 1 : 0;
        return bExact - aExact;
      });
    }

    // 3. Channel Filter
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

    // 4. Work Mode Filter
    if (selectedWorkMode === 'remote') {
      list = list.filter((j) => (j.location || '').toLowerCase().includes('remote') || (j.job_type || '').toLowerCase().includes('remote'));
    } else if (selectedWorkMode === 'hybrid') {
      list = list.filter((j) => (j.location || '').toLowerCase().includes('hybrid') || (j.job_type || '').toLowerCase().includes('hybrid'));
    } else if (selectedWorkMode === 'onsite') {
      list = list.filter((j) => !(j.location || '').toLowerCase().includes('remote'));
    }

    // 5. Skills Filter
    if (selectedSkills.length > 0) {
      list = list.filter((j) => {
        const jobSkills = Array.isArray(j.key_skills) ? j.key_skills.map((s) => s.toLowerCase()) : [];
        const fullDesc = (j.job_description || j.job_title || '').toLowerCase();
        return selectedSkills.some((s) => jobSkills.includes(s.toLowerCase()) || fullDesc.includes(s.toLowerCase()));
      });
    }

    // 6. ATS Score Filter (ONLY applied if candidate uploaded a resume)
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
    selectedSkills,
    resumeProfile,
    minAtsScoreFilter,
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
                  onMinAtsScoreChange={setMinAtsScoreFilter}
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

              {/* Right Column: Search Results Feed */}
              <div className="lg:col-span-8 xl:col-span-9 space-y-5">
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
                        {showOnlySaved
                          ? `Saved Opportunities (${displayedJobsList.length})`
                          : displayedJobsList.length > 0
                          ? `Showing 1 - ${displayedJobsList.length} verified opportunities`
                          : 'Job Search Results'}
                      </h2>
                      {activeFilterCount > 0 && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30">
                          {activeFilterCount} active filters
                        </span>
                      )}
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
                {searching && !isAppending ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-[#141519] border border-[#262830] rounded-2xl p-6 animate-pulse space-y-4 shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#20222A]" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-[#20222A] rounded w-1/3" />
                            <div className="h-3 bg-[#20222A] rounded w-1/4" />
                          </div>
                        </div>
                        <div className="h-3 bg-[#20222A] rounded w-3/4" />
                        <div className="h-8 bg-[#20222A] rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : displayedJobsList.length > 0 ? (
                  <div className="space-y-4">
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
                              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
