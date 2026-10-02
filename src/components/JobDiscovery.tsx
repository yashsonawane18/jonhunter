import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Compass,
  RefreshCw,
  ExternalLink,
  Loader,
  Send,
  CheckCircle2,
  LogOut,
  AlertCircle,
  ChevronDown,
  Clock3,
  X,
  Sparkles,
} from 'lucide-react';
import DiscoveredJobsTracker from './DiscoveredJobsTracker';
import { toast } from 'sonner';
import { FEATURES } from '../config/features';
import { useUser } from '../contexts/UserContext';
import API_ENDPOINTS from '../config/api';
import NotificationBell from './NotificationBell';
import JobDiscoveryDisabled from './JobDiscoveryDisabled';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import type {
  DiscoveredJobListing,
  PendingRequest,
} from '../lib/jobDiscoveryApi';
import {
  fetchDiscoveredJobs,
  saveDiscoveredJob,
  fetchPendingRequests,
  fetchPendingCount,
  applyOnBehalf,
  fetchSavedDiscoveredJobs,
} from '../lib/jobDiscoveryApi';

// ─── Types ──────────────────────────────────────────────────────────

interface UserProfile {
  aspirations: string;
  interests: string[];
  isAdmin: boolean;
  experience?: string;
}

interface JobDiscoveryProps {
  onLogout: () => void;
  onNavigate?: (screen: string) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────

const getToken = (): string =>
  localStorage.getItem('session_token') ||
  localStorage.getItem('token') ||
  '';

const getHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  'X-SESSION-TOKEN': getToken(),
});

function timeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  } catch {
    return 'Recently';
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  if (score >= 60) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  return 'Fair';
}

function includesAny(value: string, terms: string[]): boolean {
  const lower = value.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

function isDeveloperProfile(role: string, skills: string[], summary: string): boolean {
  return includesAny(`${role} ${skills.join(' ')} ${summary}`, [
    'full stack',
    'fullstack',
    'developer',
    'software engineer',
    'react',
    'node',
    'java',
    'spring',
    'backend',
    'frontend',
  ]);
}

function isRelevantDeveloperJob(job: DiscoveredJobListing): boolean {
  const title = job.title.toLowerCase();
  const haystack = `${job.title} ${job.description} ${job.skills.join(' ')}`;
  if (includesAny(haystack, [
    'office assistant',
    'executive assistant',
    'assistant',
    'graphic designer',
    'designer',
    'sales',
    'business development',
    'representative',
    'content reviewer',
    'customer support',
    'product support',
    'service desk',
    'help desk',
    'marketing',
    'recruiter',
    'operations',
    'data entry',
  ])) {
    return false;
  }
  return includesAny(haystack, [
    'full stack',
    'fullstack',
    'software engineer',
    'software developer',
    'developer',
    'backend',
    'frontend',
    'react',
    'node',
    'java',
    'spring boot',
    'web developer',
    'application developer',
    'mern',
    'mean',
  ]);
}

function isIndiaLocation(location: string): boolean {
  if (!location.trim()) return false;
  if (includesAny(location, [
    'united states',
    'usa',
    'europe',
    'uk',
    'germany',
    'france',
    'canada',
    'australia',
    'africa',
    'oceania',
    'americas',
    'worldwide',
    'global',
  ])) {
    return false;
  }
  return includesAny(location, [
    'india',
    'remote - india',
    'remote india',
    'ist',
    'mumbai',
    'pune',
    'bangalore',
    'bengaluru',
    'hyderabad',
    'chennai',
    'delhi',
    'gurgaon',
    'gurugram',
    'noida',
    'ahmedabad',
    'kolkata',
    'indore',
    'jaipur',
    'nagpur',
    'nashik',
  ]);
}

type ScoreMapEntry = { score: number; reason: string };

interface DiscoveryShelfCache {
  jobs: DiscoveredJobListing[];
  scores: Record<string, ScoreMapEntry>;
  nextPage: number;
  savedAt: number;
}

const DISCOVERY_CACHE_PREFIX = 'job_discovery_shelf_v5_tracker_only_page';
const INITIAL_JOB_TARGET = 50;
const MORE_JOB_TARGET = 50;
const DISCOVERY_CACHE_TTL_MS = 48 * 60 * 60 * 1000;

const getDiscoveryCacheKey = (userId?: string | null) =>
  `${DISCOVERY_CACHE_PREFIX}_${userId || 'guest'}`;

const getRemovedJobsKey = (userId?: string | null) =>
  `job_discovery_removed_${userId || 'guest'}`;

const mapSavedJobToListing = (job: {
  external_job_id: string;
  job_title: string;
  company: string;
  job_url: string;
  location: string;
  is_remote: boolean;
  saved_at: string;
  match_score: number | null;
  match_reason: string | null;
}): DiscoveredJobListing => ({
  externalJobId: job.external_job_id,
  title: job.job_title,
  company: job.company,
  location: job.location || 'Location unknown',
  isRemote: !!job.is_remote,
  jobUrl: job.job_url || '',
  postedDate: job.saved_at || new Date().toISOString(),
  description: '',
  skills: [],
  source: 'Saved',
});

// ─── Component ──────────────────────────────────────────────────────

const JobDiscovery: React.FC<JobDiscoveryProps> = ({ onLogout, onNavigate }) => {
  // Feature flag check — first line
  if (!FEATURES.JOB_DISCOVERY) return <JobDiscoveryDisabled />;

  const { user_id, isPremiumUser } = useUser();
  const [discoveryTab, setDiscoveryTab] = useState<'drc_active' | 'legacy'>('drc_active');

  // Profile & admin state
  const [profile, setProfile] = useState<UserProfile>({
    aspirations: '',
    interests: [],
    isAdmin: false,
  });
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [jobLocation, setJobLocation] = useState<string>('');

  // Chip filter state
  const [activeChips, setActiveChips] = useState<string[]>([]);

  // New Recommended Jobs states
  const [minMatchScore, setMinMatchScore] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('job_discovery_view_mode') as 'grid' | 'list') || 'grid';
  });
  const [sortBy, setSortBy] = useState<string>('score_desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Advanced filters state
  const [filterRemote, setFilterRemote] = useState<string>('all'); // all, remote, hybrid, onsite
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterPostedWithin, setFilterPostedWithin] = useState<string>('all'); // all, 24h, 3d, 7d, 30d

  // Sync viewMode changes to localStorage
  useEffect(() => {
    localStorage.setItem('job_discovery_view_mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(getRemovedJobsKey(user_id));
      setRemovedJobIds(new Set(raw ? JSON.parse(raw) : []));
    } catch {
      setRemovedJobIds(new Set());
    }
  }, [user_id]);

  const persistDiscoveryShelf = useCallback((
    shelfJobs: DiscoveredJobListing[],
    shelfScores: Map<string, ScoreMapEntry>,
    nextPage: number,
  ) => {
    try {
      const scores = Object.fromEntries(shelfScores.entries());
      const payload: DiscoveryShelfCache = {
        jobs: shelfJobs.slice(0, 250),
        scores,
        nextPage,
        savedAt: Date.now(),
      };
      localStorage.setItem(getDiscoveryCacheKey(user_id), JSON.stringify(payload));
    } catch {
      // Cache is helpful, not critical.
    }
  }, [user_id]);

  const readDiscoveryShelf = useCallback((): DiscoveryShelfCache | null => {
    try {
      const raw = localStorage.getItem(getDiscoveryCacheKey(user_id));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as DiscoveryShelfCache;
      if (!Array.isArray(parsed.jobs)) return null;
      if (Date.now() - (parsed.savedAt || 0) > DISCOVERY_CACHE_TTL_MS) return null;
      return parsed;
    } catch {
      return null;
    }
  }, [user_id]);

  // Job data state
  const [jobs, setJobs] = useState<DiscoveredJobListing[]>([]);
  const [scoreCache, setScoreCache] = useState<Map<string, { score: number; reason: string }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [scoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<'saved' | 'pending_admin_apply' | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [removedJobIds, setRemovedJobIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(getRemovedJobsKey(user_id));
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });
  const [quickViewJob, setQuickViewJob] = useState<DiscoveredJobListing | null>(null);
  const [nextDiscoveryPage, setNextDiscoveryPage] = useState(1);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Admin state
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const initialDiscoveryLoadedRef = useRef(false);

  // ─── Fetch User Profile ─────────────────────────────────────────

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch from progress profile (has isAdmin + interests)
        const profileRes = await fetch(API_ENDPOINTS.PROGRESS_PROFILE(), {
          headers: getHeaders(),
        });
        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile({
            aspirations: data.aspirations || '',
            interests: data.interests || [],
            isAdmin: !!data.isAdmin,
            experience: data.experience || '',
          });
        }

        // Also fetch user skills from user details
        if (user_id) {
          const userRes = await fetch(API_ENDPOINTS.USER_DETAILS(user_id), {
            headers: getHeaders(),
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            const skills = Array.isArray(userData.skills) ? userData.skills : [];
            setUserSkills(skills);
            setJobTitle(userData.job_title || '');
            setJobLocation(userData.job_location || '');
            setProfile((prev) => ({
              ...prev,
              experience: prev.experience || userData.experience || '',
            }));
          }
        }

        // Fetch saved jobs to initialize savedJobIds
        try {
          const savedJobs = await fetchSavedDiscoveredJobs();
          const ids = new Set(savedJobs.map((j) => j.external_job_id));
          setSavedJobIds(ids);
        } catch (err) {
          console.error('[JobDiscovery] Saved jobs fetch error:', err);
        }
      } catch (err) {
        console.error('[JobDiscovery] Profile fetch error:', err);
      } finally {
        setProfileLoaded(true);
      }
    };

    fetchProfile();
  }, [user_id]);

  // Merge skills + interests for chips, deduplicated
  const allChips = React.useMemo(() => {
    const merged = new Set<string>();
    userSkills.forEach((s) => s && merged.add(s));
    profile.interests.forEach((s) => s && merged.add(s));
    return Array.from(merged);
  }, [userSkills, profile.interests]);

  // Client-side filtering, searching, and sorting memoized selector
  const processedJobs = React.useMemo(() => {
    let list = jobs.filter((job) => !removedJobIds.has(job.externalJobId)).map((job) => {
      const scoreObj = scoreCache.get(job.externalJobId);
      return {
        ...job,
        matchScore: scoreObj?.score ?? null,
        matchReason: scoreObj?.reason ?? null,
      };
    });

    if (isDeveloperProfile(jobTitle, userSkills, profile.aspirations)) {
      list = list.filter(isRelevantDeveloperJob);
    }

    if (isIndiaLocation(`${jobLocation} ${profile.aspirations}`)) {
      list = list.filter((j) => isIndiaLocation(`${j.location} ${j.description}`));
    }

    list = list.filter((j) => {
      if (j.matchScore === null) {
        return minMatchScore === 0 || scoring;
      }
      return minMatchScore === 0 || j.matchScore >= minMatchScore;
    });

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (j) =>
          j.company.toLowerCase().includes(query) ||
          j.title.toLowerCase().includes(query) ||
          j.location.toLowerCase().includes(query) ||
          (j.source || '').toLowerCase().includes(query) ||
          j.description.toLowerCase().includes(query) ||
          j.skills.some((s) => s.toLowerCase().includes(query))
      );
    }

    if (filterRemote !== 'all') {
      if (filterRemote === 'remote') {
        list = list.filter((j) => j.isRemote);
      } else if (filterRemote === 'hybrid') {
        list = list.filter((j) => j.location.toLowerCase().includes('hybrid'));
      } else if (filterRemote === 'onsite') {
        list = list.filter((j) => !j.isRemote && !j.location.toLowerCase().includes('hybrid'));
      }
    }

    if (filterLocation.trim()) {
      const loc = filterLocation.toLowerCase();
      list = list.filter((j) => j.location.toLowerCase().includes(loc));
    }

    if (filterPostedWithin !== 'all') {
      const now = Date.now();
      list = list.filter((j) => {
        const posted = new Date(j.postedDate).getTime();
        const diffHrs = (now - posted) / (1000 * 60 * 60);
        if (filterPostedWithin === '24h') return diffHrs <= 24;
        if (filterPostedWithin === '48h') return diffHrs <= 48;
        if (filterPostedWithin === '3d') return diffHrs <= 72;
        if (filterPostedWithin === '7d') return diffHrs <= 168;
        if (filterPostedWithin === '30d') return diffHrs <= 720;
        return true;
      });
    }

    list.sort((a, b) => {
      if (sortBy === 'score_desc') {
        return (b.matchScore || 0) - (a.matchScore || 0);
      }
      if (sortBy === 'newest') {
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime();
      }
      if (sortBy === 'company_asc') {
        return a.company.localeCompare(b.company);
      }
      if (sortBy === 'salary_desc' || sortBy === 'salary_asc') {
        const getVal = (sal?: string) => {
          if (!sal) return 0;
          const matched = sal.match(/\d[\d,.]*/g);
          if (!matched) return 0;
          const vals = matched.map((v) => parseFloat(v.replace(/,/g, '')));
          return vals.reduce((sum, v) => sum + v, 0) / vals.length;
        };
        const valA = getVal(a.salary);
        const valB = getVal(b.salary);
        return sortBy === 'salary_desc' ? valB - valA : valA - valB;
      }
      return 0;
    });

    return list;
  }, [jobs, removedJobIds, scoreCache, jobTitle, jobLocation, userSkills, profile.aspirations, minMatchScore, searchQuery, filterRemote, filterLocation, filterPostedWithin, sortBy, scoring]);

  // Initialize active chips once we have data
  useEffect(() => {
    if (allChips.length > 0 && activeChips.length === 0) {
      // Activate first 5 chips by default
      setActiveChips(allChips.slice(0, 5));
    }
  }, [allChips]);

  // ─── Fetch Admin Data ───────────────────────────────────────────

  useEffect(() => {
    if (!profile.isAdmin) return;

    const loadAdminData = async () => {
      try {
        const [requests, count] = await Promise.all([
          fetchPendingRequests(),
          fetchPendingCount(),
        ]);
        setPendingRequests(requests);
        setPendingCount(count);
      } catch {
        // Admin data is optional — don't block
      }
    };

    loadAdminData();
  }, [profile.isAdmin]);

  // ─── Fetch & Score Jobs (Debounced) ─────────────────────────────

  const mergeServerScores = useCallback((
    incomingJobs: DiscoveredJobListing[],
    baseScores: Map<string, ScoreMapEntry>,
  ) => {
    const newScores = new Map(baseScores);
    incomingJobs.forEach((job) => {
      if (typeof job.matchScore === 'number') {
        newScores.set(job.externalJobId, {
          score: job.matchScore,
          reason: job.matchReason || 'Profile-based match',
        });
      }
    });
    return newScores;
  }, []);

  const mergeUniqueJobs = useCallback((
    currentJobs: DiscoveredJobListing[],
    incomingJobs: DiscoveredJobListing[],
  ) => {
    const seen = new Set<string>();
    const merged: DiscoveredJobListing[] = [];

    [...currentJobs, ...incomingJobs].forEach((job) => {
      const key = job.externalJobId || job.jobUrl || `${job.title}:${job.company}:${job.location}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(job);
      }
    });

    return merged;
  }, []);

  const fetchAndScore = useCallback(async (
    chips: string[],
    remote: boolean,
    mode: 'replace' | 'append' = 'replace',
    forceRefresh = false,
    recent48Only = false,
  ) => {
    if (mode === 'append') {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const pageToFetch = mode === 'append' ? nextDiscoveryPage : 1;
      const result = await fetchDiscoveredJobs(
        chips,
        remote,
        jobTitle,
        jobLocation,
        profile.aspirations,
        profile.experience || '',
        {
          page: pageToFetch,
          minResults: mode === 'append' ? MORE_JOB_TARGET : INITIAL_JOB_TARGET,
          forceRefresh,
          recent48Only,
        },
      );
      const fetchedJobs = result.jobs;

      const mergedJobs = mode === 'append'
        ? mergeUniqueJobs(jobs, fetchedJobs)
        : fetchedJobs;
      const newScores = mergeServerScores(
        fetchedJobs,
        mode === 'append' ? scoreCache : new Map(),
      );
      const nextPage = result.nextPage || pageToFetch + 1;

      if (mode === 'append' && fetchedJobs.length === 0) {
        toast.info('All jobs from job tracker are loaded.');
      } else {
        setJobs(mergedJobs);
        setScoreCache(newScores);
        setNextDiscoveryPage(nextPage);
        persistDiscoveryShelf(mergedJobs, newScores, nextPage);
      }
    } catch (err) {
      setError('Unable to load jobs. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [
    jobs,
    scoreCache,
    nextDiscoveryPage,
    profile.aspirations,
    profile.experience,
    jobTitle,
    jobLocation,
    mergeUniqueJobs,
    mergeServerScores,
    persistDiscoveryShelf,
  ]);

  useEffect(() => {
    if (!profileLoaded || initialDiscoveryLoadedRef.current) return;
    if (allChips.length > 0 && activeChips.length === 0) return;

    initialDiscoveryLoadedRef.current = true;
    const cached = readDiscoveryShelf();

    if (cached && cached.jobs.length > 0) {
      setJobs(cached.jobs);
      setScoreCache(new Map(Object.entries(cached.scores || {})));
      setNextDiscoveryPage(cached.nextPage || 2);
      setLoading(false);
      return;
    }

    fetchAndScore(activeChips, filterRemote === 'remote', 'replace');
  }, [profileLoaded, allChips.length, activeChips, filterRemote, readDiscoveryShelf, fetchAndScore]);

  // ─── Handlers ───────────────────────────────────────────────────

  const handleChipToggle = (chip: string) => {
    const next = activeChips.includes(chip)
      ? activeChips.filter((c) => c !== chip)
      : [...activeChips, chip];
    setActiveChips(next);
    setScoreCache(new Map());
    setNextDiscoveryPage(1);
    fetchAndScore(next, filterRemote === 'remote', 'replace', true);
  };

  const handleRefresh = () => {
    setScoreCache(new Map()); // Clear score cache
    setNextDiscoveryPage(1);
    fetchAndScore(activeChips, filterRemote === 'remote', 'replace', true);
  };

  const handleRecent48Hours = () => {
    setFilterPostedWithin('48h');
    setSortBy('newest');
    setScoreCache(new Map());
    setNextDiscoveryPage(1);
    fetchAndScore(activeChips, filterRemote === 'remote', 'replace', true, true);
  };

  const handleLoadMore = () => {
    fetchAndScore(activeChips, filterRemote === 'remote', 'append');
  };

  const handleRemoteFilterChange = (value: string) => {
    setFilterRemote(value);
    if (value === 'remote' || filterRemote === 'remote') {
      setScoreCache(new Map());
      setNextDiscoveryPage(1);
      fetchAndScore(activeChips, value === 'remote', 'replace', true);
    }
  };

  const handleSaveJob = async (
    job: DiscoveredJobListing,
    status: 'saved' | 'pending_admin_apply',
  ): Promise<boolean> => {
    setSavingJobId(job.externalJobId);
    setSavingStatus(status);
    try {
      const score = scoreCache.get(job.externalJobId);
      await saveDiscoveredJob(
        job,
        score?.score ?? null,
        score?.reason ?? null,
        status,
      );

      setSavedJobIds((prev) => new Set(prev).add(job.externalJobId));

      if (status === 'saved') {
        toast.success('Job saved to tracker');
      } else {
        toast.success('Apply request sent to admin');
      }

      // Refresh admin count if admin
      if (profile.isAdmin) {
        const count = await fetchPendingCount();
        setPendingCount(count);
      }
      return true;
    } catch {
      toast.error('Failed to save job. Please try again.');
      return false;
    } finally {
      setSavingJobId(null);
      setSavingStatus(null);
    }
  };

  const handleApplyJob = async (job: DiscoveredJobListing) => {
    if (!savedJobIds.has(job.externalJobId)) {
      const saved = await handleSaveJob(job, 'saved');
      if (!saved) return;
    }
    if (job.jobUrl) {
      window.open(job.jobUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('No application link is available for this job.');
    }
  };

  const handleRemoveFromDiscovery = (job: DiscoveredJobListing) => {
    setRemovedJobIds((prev) => {
      const next = new Set(prev).add(job.externalJobId);
      localStorage.setItem(getRemovedJobsKey(user_id), JSON.stringify(Array.from(next)));
      return next;
    });
    if (quickViewJob?.externalJobId === job.externalJobId) {
      setQuickViewJob(null);
    }
    toast.success('Removed from discovery');
  };

  const handleApplyOnBehalf = async (requestId: string) => {
    setApplyingId(requestId);
    try {
      await applyOnBehalf(requestId);
      toast.success('Applied on behalf of user');

      // Refresh pending list
      const [requests, count] = await Promise.all([
        fetchPendingRequests(),
        fetchPendingCount(),
      ]);
      setPendingRequests(requests);
      setPendingCount(count);
    } catch {
      toast.error('Failed to apply. Please try again.');
    } finally {
      setApplyingId(null);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div className="flex-1 min-h-dvh h-full bg-[#0d0d0d] text-white overflow-hidden flex flex-col font-sans pb-20 md:pb-0">
      {/* Header */}
      <header className="px-4 sm:px-8 py-4 sm:py-5 border-b border-[#1e1e1e] flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 bg-[#111111] shrink-0">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#00C896] uppercase mb-1 block">
            Dashboard
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">Job Discovery</h1>
            <div className="flex items-center bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-0.5">
              <button
                onClick={() => setDiscoveryTab('drc_active')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  discoveryTab === 'drc_active'
                    ? 'bg-[#00C896] text-black font-bold shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Sparkles size={13} />
                Active Discovery &amp; Live Matching
              </button>
              <button
                onClick={() => setDiscoveryTab('legacy')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  discoveryTab === 'legacy'
                    ? 'bg-[#00C896] text-black font-bold shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Compass size={13} />
                External Job Shelf
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {discoveryTab === 'drc_active'
              ? 'Multi-query live LinkedIn & Direct ATS portal discovery with 0% Duplicate Guard'
              : 'Matched to your profile • Live listings from across the web'}
          </p>
        </div>
        <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 lg:w-auto lg:gap-3 lg:pb-0">
          {/* View Mode Toggle */}
          <div className="flex shrink-0 items-center bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-0.5 lg:mr-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#00C896] text-black font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-[#00C896] text-black font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              List
            </button>
          </div>

          {/* Remote Toggle */}
          <button
            onClick={() => handleRemoteFilterChange(filterRemote === 'remote' ? 'all' : 'remote')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
              filterRemote === 'remote'
                ? 'bg-[#00C896]/15 text-[#00C896] border-[#00C896]/30'
                : 'bg-[#222] text-[#888] border-[#333] hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${filterRemote === 'remote' ? 'bg-[#00C896]' : 'bg-[#555]'}`} />
            Remote Only
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-[#222] hover:bg-[#333] text-gray-400 hover:text-white border border-[#333] rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={handleRecent48Hours}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-[#00C896] hover:bg-[#00b386] text-black border border-[#00C896] rounded-lg text-xs font-extrabold transition-all disabled:opacity-50"
          >
            <Clock3 size={14} />
            Recent 48 hrs
          </button>

          {/* Admin: Pending count badge */}
          {profile.isAdmin && pendingCount > 0 && (
            <button
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className="flex items-center gap-2 px-3 py-2 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold transition-all hover:bg-amber-500/25"
            >
              <Send size={14} />
              Pending ({pendingCount})
              <ChevronDown size={12} className={`transition-transform ${showAdminPanel ? 'rotate-180' : ''}`} />
            </button>
          )}

          <NotificationBell />

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      {discoveryTab === 'drc_active' ? (
        <div className="flex-1 overflow-y-auto">
          <DiscoveredJobsTracker />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
        {/* Admin Pending Requests Panel */}
        {profile.isAdmin && showAdminPanel && pendingRequests.length > 0 && (
          <div className="px-8 py-5 bg-[#111111] border-b border-[#1e1e1e]">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4">
              Pending Apply Requests ({pendingRequests.length})
            </h3>
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between bg-[#1a1a1a] border border-[#222] rounded-lg px-5 py-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-white font-semibold text-sm">{req.job_title}</span>
                      <span className="text-gray-500 text-xs">at {req.company}</span>
                      {req.match_score !== null && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getScoreColor(req.match_score)}`}>
                          {req.match_score}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>👤 {req.user_name}</span>
                      <span>{req.user_email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {req.job_url && (
                      <a
                        href={req.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-[#222] rounded-lg transition-colors"
                      >
                        <ExternalLink size={12} />
                        View
                      </a>
                    )}
                    <button
                      onClick={() => handleApplyOnBehalf(req.id)}
                      disabled={applyingId === req.id}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-[#00C896] hover:bg-[#00b386] text-black text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {applyingId === req.id ? (
                        <Loader size={12} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={12} />
                      )}
                      Apply on Behalf
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search, Skill Chips, and Advanced Filters Panel */}
        <div className="px-8 py-5 border-b border-[#1e1e1e] bg-[#111111] space-y-4 shrink-0">
            {/* Row 1: Search & Sort */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search company, role, source, skills, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00C896] transition-colors"
              />
            </div>
            
            <div className="w-full md:w-56">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C896] transition-colors"
              >
                <option value="score_desc">Highest Match Score</option>
                <option value="newest">Newest Jobs</option>
                <option value="oldest">Oldest Jobs</option>
                <option value="company_asc">Company Name</option>
              </select>
            </div>
          </div>

          {/* Row 2: Workable filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
            {/* Min Match Score */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Min Match Score</label>
              <select
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(Number(e.target.value))}
                className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#00C896]"
              >
                <option value={0}>Show All</option>
                <option value={50}>50%+</option>
                <option value={60}>60%+</option>
                <option value={70}>70%+</option>
                <option value={80}>80%+</option>
                <option value={90}>90%+</option>
              </select>
            </div>

            {/* Remote */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Remote</label>
              <select
                value={filterRemote}
                onChange={(e) => handleRemoteFilterChange(e.target.value)}
                className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#00C896]"
              >
                <option value="all">All</option>
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            {/* Posted Within */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Posted Within</label>
              <select
                value={filterPostedWithin}
                onChange={(e) => setFilterPostedWithin(e.target.value)}
                className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#00C896]"
              >
                <option value="all">Any Time</option>
                <option value="24h">Past 24 Hours</option>
                <option value="48h">Past 48 Hours</option>
                <option value="3d">Past 3 Days</option>
                <option value="7d">Past Week</option>
                <option value="30d">Past Month</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Location</label>
              <input
                type="text"
                placeholder="City, remote, India..."
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00C896]"
              />
            </div>

            {/* Reset Filters */}
            <div className="flex flex-col justify-end">
              <button
                onClick={() => {
                  setMinMatchScore(0);
                  setSortBy('score_desc');
                  setSearchQuery('');
                  setFilterRemote('all');
                  setFilterLocation('');
                  setFilterPostedWithin('all');
                }}
                className="bg-[#222] border border-[#333] hover:border-[#444] text-xs font-semibold py-2 rounded-lg text-gray-400 hover:text-white transition-all"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Row 3: Skill Chips */}
          <div className="pt-2 border-t border-[#1e1e1e]">
            <div className="flex items-center gap-2 mb-2">
              <Compass size={13} className="text-[#00C896]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Discovering using Skills & Interests:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allChips.length === 0 ? (
                <span className="text-xs text-gray-500 italic">
                  Add skills in your profile to filter jobs
                </span>
              ) : (
                allChips.map((chip) => {
                  const isActive = activeChips.includes(chip);
                  return (
                    <button
                      key={chip}
                      onClick={() => handleChipToggle(chip)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
                        isActive
                          ? 'bg-[#00C896]/15 text-[#00C896] border-[#00C896]/30'
                          : 'bg-[#222] text-[#888] border-[#333] hover:text-white hover:border-[#444]'
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Jobs Content */}
        <div className="p-8 flex-1 overflow-y-auto">
          {loading ? (
            // Skeleton cards
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-6 space-y-4">
                  <Skeleton className="h-5 w-3/4 bg-[#222]" />
                  <Skeleton className="h-4 w-1/2 bg-[#222]" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 bg-[#222] rounded-full" />
                    <Skeleton className="h-6 w-20 bg-[#222] rounded-full" />
                  </div>
                  <Skeleton className="h-8 w-full bg-[#222] rounded-lg" />
                </div>
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <p className="text-gray-400 text-sm mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-5 py-2 bg-[#00C896] hover:bg-[#00b386] text-black font-semibold text-sm rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : processedJobs.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
              <div className="w-14 h-14 bg-[#222] rounded-full flex items-center justify-center mb-4">
                <Compass className="w-7 h-7 text-[#555]" />
              </div>
              <p className="text-white font-semibold text-base mb-2">No jobs found.</p>
              <p className="text-gray-400 text-xs mb-6">
                Try clearing filters or refreshing the job tracker.
              </p>
              <button
                onClick={() => onNavigate && onNavigate('profile')}
                className="px-5 py-2 bg-[#00C896] hover:bg-[#00b386] text-black font-bold text-xs rounded-lg transition-colors"
              >
                Update Profile
              </button>
            </div>
          ) : (
            <>
              {scoring && (
                <div className="flex items-center gap-2 mb-4 text-xs text-[#00C896] bg-[#00C896]/10 px-3 py-2 rounded-lg border border-[#00C896]/20">
                  <Loader size={12} className="animate-spin" />
                  Loading match scores...
                </div>
              )}

              {viewMode === 'grid' ? (
                /* Grid View (Desktop: 4 columns, Tablet: 2 columns, Mobile: 1 column) */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <TooltipProvider>
                    {processedJobs.map((job) => {
                      const isSaved = savedJobIds.has(job.externalJobId);
                      const isSaving = savingJobId === job.externalJobId;
                      const score = job.matchScore;

                      // Color coding: 90-100 Green, 75-89 Blue, 50-74 Orange
                      const scoreColor = score !== null && score >= 90 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                                      : score !== null && score >= 75 ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
                                      : 'text-amber-400 border-amber-500/30 bg-amber-500/10';

                      // Recommendation Badge
                      const recBadge = score !== null && score >= 90 ? 'Highly Recommended'
                                     : score !== null && score >= 75 ? 'Recommended'
                                     : 'Needs Resume Update';
                      
                      const recColor = score !== null && score >= 90 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                     : score !== null && score >= 75 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                     : 'bg-amber-500/10 text-amber-400 border border-amber-500/20';

                      const workType = job.location.toLowerCase().includes('hybrid') ? 'Hybrid'
                                     : job.isRemote ? 'Remote'
                                     : 'Onsite';

                      return (
                        <div
                          key={job.externalJobId}
                          className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5 hover:border-[#333] transition-all group flex flex-col justify-between h-[360px]"
                        >
                          <div>
                            {/* Card Header: Logo & Match Score */}
                            <div className="flex items-start justify-between mb-3.5">
                              {job.companyLogo ? (
                                <img
                                  src={job.companyLogo}
                                  alt={job.company}
                                  className="w-10 h-10 rounded-lg object-contain bg-white p-1 border border-[#222]"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-[#222] border border-[#333] flex items-center justify-center text-white font-bold text-sm shrink-0">
                                  {job.company.charAt(0)}
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                {score !== null && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-help shrink-0 ${scoreColor}`}>
                                        {score}% Fit
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-[#222] text-white border-[#333] text-xs max-w-xs">
                                      {job.matchReason || 'Highly compatible role matching details.'}
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                <button
                                  onClick={() => handleRemoveFromDiscovery(job)}
                                  className="w-7 h-7 rounded-full bg-[#1a1a1a] hover:bg-red-500/10 text-gray-500 hover:text-red-300 border border-[#2a2a2a] hover:border-red-500/30 flex items-center justify-center transition-all opacity-70 group-hover:opacity-100"
                                  title="Remove from discovery"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>

                          </div>

                            {/* Job Details */}
                            <div className="space-y-1 mb-3">
                              <h3 className="text-white font-bold text-sm truncate group-hover:text-[#00C896] transition-colors" title={job.title}>
                                {job.title}
                              </h3>
                              <p className="text-gray-400 text-xs truncate">{job.company}</p>
                            </div>

                            {/* Recommendation & Work Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-3.5">
                              {score !== null && (
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider shrink-0 ${recColor}`}>
                                  {recBadge}
                                </span>
                              )}
                              <span className="bg-[#222] text-gray-400 border border-[#333] px-2 py-0.5 rounded text-[9px] font-semibold shrink-0">
                                {workType}
                              </span>
                              {job.employmentType && (
                                <span className="bg-[#222] text-gray-400 border border-[#333] px-2 py-0.5 rounded text-[9px] font-semibold uppercase shrink-0">
                                  {job.employmentType.replace('_', ' ')}
                                </span>
                              )}
                            </div>

                            {/* Meta & Salary info */}
                            <div className="text-[11px] text-gray-500 space-y-1 mb-4">
                              <div className="truncate">📍 {job.location}</div>
                              {job.salary && <div className="text-gray-400 font-medium">💰 {job.salary}</div>}
                              <div>📅 Posted {timeAgo(job.postedDate)}</div>
                            </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 pt-3 border-t border-[#1e1e1e]">
                            <button
                              onClick={() => setQuickViewJob(job)}
                              className="px-2.5 py-2 bg-[#222] hover:bg-[#333] text-gray-400 hover:text-white rounded-lg text-xs font-bold transition-all border border-[#333] shrink-0"
                              title="Quick View Details"
                            >
                              Quick View
                            </button>
                            {isSaved ? (
                              <>
                                <span className="flex items-center gap-1 px-3 py-2 text-xs text-[#00C896] bg-[#00C896]/10 rounded-lg justify-center border border-[#00C896]/20">
                                  Saved
                                </span>
                                <button
                                  onClick={() => handleApplyJob(job)}
                                  className="flex items-center gap-1 px-2.5 py-2 bg-[#00C896] hover:bg-[#00b386] text-black font-extrabold text-xs rounded-lg transition-colors flex-1 justify-center"
                                  title="Apply externally"
                                >
                                  Apply <ExternalLink size={11} />
                                </button>
                              </>
                            ) : isPremiumUser ? (
                              <>
                                <button
                                  onClick={() => handleApplyJob(job)}
                                  disabled={isSaving}
                                  className="flex items-center gap-1 px-2.5 py-2 bg-[#00C896] hover:bg-[#00b386] text-black font-extrabold text-xs rounded-lg transition-colors flex-1 justify-center disabled:opacity-50"
                                >
                                  {isSaving && savingStatus === 'saved' ? <Loader size={10} className="animate-spin" /> : <>Apply <ExternalLink size={11} /></>}
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleApplyJob(job)}
                                disabled={isSaving}
                                className="flex items-center gap-1 px-3 py-2 bg-[#222] hover:bg-[#333] text-white font-semibold text-xs rounded-lg transition-colors flex-1 justify-center disabled:opacity-50 border border-[#333]"
                              >
                                {isSaving ? <Loader size={10} className="animate-spin" /> : <>Apply <ExternalLink size={11} /></>}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </TooltipProvider>
                </div>
              ) : (
                /* List View (Table Layout) */
                <div className="overflow-x-auto bg-[#111111] border border-[#1e1e1e] rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#222] bg-[#1a1a1a] text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                        <th className="px-5 py-3">Company</th>
                        <th className="px-5 py-3">Role</th>
                        <th className="px-5 py-3">Location</th>
                        <th className="px-5 py-3">Salary</th>
                        <th className="px-5 py-3">Posted</th>
                        <th className="px-5 py-3">Match Score</th>
                        <th className="px-5 py-3">Recommendation</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222] text-xs">
                      {processedJobs.map((job) => {
                        const isSaved = savedJobIds.has(job.externalJobId);
                        const isSaving = savingJobId === job.externalJobId;
                        const score = job.matchScore;

                        const scoreColor = score !== null && score >= 90 ? 'text-emerald-400'
                                        : score !== null && score >= 75 ? 'text-blue-400'
                                        : 'text-amber-400';

                        const recBadge = score !== null && score >= 90 ? 'Highly Recommended'
                                       : score !== null && score >= 75 ? 'Recommended'
                                       : 'Needs Resume Update';

                        const recBadgeColor = score !== null && score >= 90 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                           : score !== null && score >= 75 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                           : 'bg-amber-500/10 text-amber-400 border border-amber-500/20';

                        return (
                          <tr key={job.externalJobId} className="hover:bg-[#161619] transition-all">
                            <td className="px-5 py-3.5 font-semibold text-white">{job.company}</td>
                            <td className="px-5 py-3.5 font-bold text-[#00C896]">{job.title}</td>
                            <td className="px-5 py-3.5 text-gray-400">{job.location}</td>
                            <td className="px-5 py-3.5 text-gray-300 font-medium">{job.salary || '—'}</td>
                            <td className="px-5 py-3.5 text-gray-500">{timeAgo(job.postedDate)}</td>
                            <td className="px-5 py-3.5 font-extrabold">{score !== null ? <span className={scoreColor}>{score}%</span> : '—'}</td>
                            <td className="px-5 py-3.5">
                              {score !== null ? (
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${recBadgeColor}`}>
                                  {recBadge}
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-right space-x-2">
                              <button
                                onClick={() => setQuickViewJob(job)}
                                className="px-2 py-1 bg-[#222] hover:bg-[#333] text-gray-300 rounded font-semibold text-[10px] border border-[#333]"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleRemoveFromDiscovery(job)}
                                className="inline-flex w-7 h-7 items-center justify-center bg-[#222] hover:bg-red-500/10 text-gray-400 hover:text-red-300 rounded border border-[#333] hover:border-red-500/30 transition-colors align-middle"
                                title="Remove from discovery"
                              >
                                <X size={13} />
                              </button>
                              {isSaved ? (
                                <>
                                  <span className="px-2.5 py-1 bg-[#00C896]/10 text-[#00C896] rounded text-[10px] font-bold border border-[#00C896]/20">
                                    Saved
                                  </span>
                                  <button
                                    onClick={() => handleApplyJob(job)}
                                    className="px-2.5 py-1 bg-[#00C896] hover:bg-[#00b386] text-black rounded font-bold text-[10px]"
                                  >
                                    Apply External
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleApplyJob(job)}
                                  disabled={isSaving}
                                  className="px-2.5 py-1 bg-[#00C896] hover:bg-[#00b386] text-black rounded font-bold text-[10px] disabled:opacity-50"
                                >
                                  {isSaving ? 'Saving...' : 'Apply External'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex justify-center pt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#222] hover:bg-[#333] text-white border border-[#333] rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                >
                  {loadingMore ? <Loader size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  {loadingMore ? 'Searching...' : 'Search More Jobs'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Quick View Job Description Dialog */}
        {quickViewJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#111111] border border-[#222] rounded-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="p-5 border-b border-[#222] flex justify-between items-start">
                <div>
                  <h3 className="text-white font-bold text-lg">{quickViewJob.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{quickViewJob.company} • {quickViewJob.location}</p>
                </div>
                <button
                  onClick={() => setQuickViewJob(null)}
                  className="p-1 text-gray-400 hover:text-white rounded hover:bg-[#222]"
                >
                  ✕
                </button>
              </div>

              {/* Description */}
              <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-gray-300 leading-relaxed">
                {quickViewJob.salary && (
                  <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-3 flex justify-between items-center font-semibold">
                    <span className="text-gray-400 uppercase text-[10px]">Salary Offer:</span>
                    <span className="text-[#00C896] font-bold text-sm">{quickViewJob.salary}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-gray-400 font-semibold uppercase text-[10px] block">Role Description</span>
                  <style dangerouslySetInnerHTML={{__html: `
                    .job-description-html p { margin-bottom: 0.75rem; }
                    .job-description-html ul, .job-description-html ol { margin-left: 1.25rem; margin-bottom: 0.75rem; list-style-type: disc; }
                    .job-description-html li { margin-bottom: 0.25rem; }
                    .job-description-html strong { font-weight: 700; color: #fff; }
                    .job-description-html h1, .job-description-html h2, .job-description-html h3, .job-description-html h4 { font-weight: 700; color: #fff; margin-top: 0.75rem; margin-bottom: 0.5rem; }
                  `}} />
                  <div 
                    className="bg-[#161619] p-4 rounded-lg border border-[#222] text-xs text-gray-300 leading-relaxed overflow-x-hidden job-description-html whitespace-pre-wrap max-h-[45vh] overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: quickViewJob.description || 'No description listed.' }}
                  />
                </div>

                {quickViewJob.skills.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-gray-400 font-semibold uppercase text-[10px] block">Required Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickViewJob.skills.map((skill) => (
                        <span key={skill} className="bg-[#222] text-[#ccc] border border-[#333] px-2.5 py-1 rounded-full text-[10px]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-[#222] bg-[#161619] flex justify-end gap-2.5">
                <button
                  onClick={() => setQuickViewJob(null)}
                  className="px-4 py-2 bg-[#222] hover:bg-[#333] text-gray-400 hover:text-white rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => handleRemoveFromDiscovery(quickViewJob)}
                  className="px-4 py-2 bg-[#222] hover:bg-red-500/10 text-red-300 border border-red-500/20 font-semibold rounded-lg text-xs"
                >
                  Remove from Discovery
                </button>
                {quickViewJob.jobUrl && (
                  <a
                    href={quickViewJob.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#00C896] hover:bg-[#00b386] text-black font-bold rounded-lg text-xs flex items-center gap-1.5"
                  >
                    Apply Externally ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default JobDiscovery;
