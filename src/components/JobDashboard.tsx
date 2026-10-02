import React, { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader,
  LogOut,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import API_ENDPOINTS from '../config/api';

interface Connection {
  name: string;
  title: string;
  emailOrLinkedIn: string;
  email?: string;
  mobileNumber?: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  experience: string;
  salary: string;
  matchScore: number;
  requirements: string[];
  jobUrl: string;
  description: string;
  insights?: string;
  source: string;
  isRemote: boolean;
  connections: Connection[];
  createdAt: string;
  matchParts?: {
    skills: number;
    role: number;
    location: number;
    experience: number;
  };
}

type StatFilter = 'all' | 'strong' | 'referral' | 'mobile';
type DatePreset = '' | '24h' | '48h' | 'custom';

interface Props {
  userPreferences: any;
  cvKeywords: string[];
  onLogout: () => void;
  onNavigate: (screen: string) => void;
  onJobApplied?: (job: Job & { status?: string }) => void;
  isPremiumUser: boolean;
}

const sessionToken = () =>
  localStorage.getItem('session_token') ||
  sessionStorage.getItem('session_token') ||
  localStorage.getItem('token') ||
  sessionStorage.getItem('token') ||
  '';

const asText = (value: unknown) =>
  value === 0 ? '0' : typeof value === 'string' ? value : value ? String(value) : '';

const decodeHtmlEntities = (value: string) => {
  if (typeof document === 'undefined') return value;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
};

const htmlToText = (value: unknown) =>
  decodeHtmlEntities(asText(value))
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

const unique = (items: string[]) =>
  Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));

const asSkills = (value: unknown) => {
  if (Array.isArray(value)) return unique(value.map((item) => asText(item).replace(/^\[|\]$/g, '')));
  const raw = asText(value).trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return asSkills(parsed);
  } catch {}
  return unique(raw.split(',').map((item) => item.replace(/^\[|\]$/g, '').trim()));
};

const parseMaybeArray = (value: unknown): any[] => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const normalizeConnections = (value: unknown): Connection[] =>
  parseMaybeArray(value)
    .map((conn: any) => ({
      name: asText(conn?.name),
      title: asText(conn?.title || conn?.position),
      emailOrLinkedIn: asText(conn?.emailOrLinkedIn || conn?.contact || conn?.linkedin || conn?.linkedIn || conn?.url),
      email: asText(conn?.email || conn?.email_address || conn?.email_id),
      mobileNumber: asText(conn?.mobileNumber || conn?.mobile || conn?.mobile_number || conn?.mobilenumber || conn?.phone),
    }))
    .filter((conn) => conn.name || conn.title || conn.emailOrLinkedIn || conn.email || conn.mobileNumber);

const connectionPrimary = (conn: Connection) =>
  conn.name || conn.title || conn.emailOrLinkedIn || conn.email || conn.mobileNumber || 'Connection';

const connectionContacts = (conn: Connection) =>
  unique([conn.emailOrLinkedIn, conn.email, conn.mobileNumber].map(asText));

const normalizeText = (value: unknown) =>
  asText(value)
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const importantWords = (value: string) =>
  unique(normalizeText(value).split(' ').filter((word) => word.length > 2 && !['and', 'the', 'for', 'with', 'role', 'job'].includes(word)));

const parseYears = (value: string) => {
  const text = normalizeText(value);
  if (!text) return null;
  if (text.includes('intern') || text.includes('fresher') || text.includes('new grad')) return 0;
  if (text.includes('entry')) return 1;
  if (text.includes('mid')) return 3;
  if (text.includes('senior')) return 5;
  const numbers = text.match(/\d+(?:\.\d+)?/g);
  return numbers?.length ? numbers.map(Number).reduce((sum, item) => sum + item, 0) / numbers.length : null;
};

const toDateValue = (value: unknown) => {
  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day] = value;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  const raw = asText(value);
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw.slice(0, 10);
  return date.toISOString().slice(0, 10);
};

const dateTime = (value: string) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
};

const formatJobDate = (value: string) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'Date not available';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const computeMatchScore = (
  job: Omit<Job, 'matchScore'>,
  profile: { role: string; skills: string[]; experience: string; location: string; jobType: string },
) => {
  const haystack = normalizeText(`${job.title} ${job.company} ${job.location} ${job.jobType} ${job.experience} ${job.requirements.join(' ')} ${job.description} ${job.insights || ''}`);
  const titleText = normalizeText(job.title);
  const roleWords = importantWords(profile.role);
  const roleHits = roleWords.filter((word) => haystack.includes(word)).length;
  const titleHits = roleWords.filter((word) => titleText.includes(word)).length;
  const roleScore = roleWords.length ? Math.min(35, (roleHits / roleWords.length) * 20 + (titleHits / roleWords.length) * 15) : 12;

  const profileSkills = unique(profile.skills);
  const skillHits = profileSkills.filter((skillName) => haystack.includes(normalizeText(skillName))).length;
  const skillScore = profileSkills.length ? Math.min(35, (skillHits / Math.min(profileSkills.length, Math.max(job.requirements.length, 1))) * 35) : 12;

  const userYears = parseYears(profile.experience);
  const jobYears = parseYears(job.experience);
  let experienceScore = 10;
  if (userYears !== null && jobYears !== null) {
    const gap = userYears - jobYears;
    experienceScore = gap >= 0 && gap <= 2 ? 20 : gap > 2 ? 17 : gap >= -1 ? 14 : 6;
  }

  let preferenceScore = 0;
  const location = normalizeText(profile.location);
  if (location && (normalizeText(job.location).includes(location) || normalizeText(job.location).includes('remote') || location.includes('remote'))) preferenceScore += 6;
  const jobType = normalizeText(profile.jobType);
  if (jobType && normalizeText(job.jobType).includes(jobType)) preferenceScore += 4;
  if (!location && !jobType) preferenceScore = 5;

  return Math.max(0, Math.min(100, Math.round(roleScore + skillScore + experienceScore + preferenceScore)));
};

const computeMatchParts = (
  job: Omit<Job, 'matchScore'>,
  profile: { role: string; skills: string[]; experience: string; location: string; jobType: string },
) => {
  const haystack = normalizeText(`${job.title} ${job.company} ${job.location} ${job.jobType} ${job.experience} ${job.requirements.join(' ')} ${job.description} ${job.insights || ''}`);
  const titleText = normalizeText(job.title);
  const roleWords = importantWords(profile.role);
  const roleHits = roleWords.filter((word) => haystack.includes(word)).length;
  const titleHits = roleWords.filter((word) => titleText.includes(word)).length;
  const role = roleWords.length ? Math.min(20, Math.round((roleHits / roleWords.length) * 10 + (titleHits / roleWords.length) * 10)) : 8;

  const profileSkills = unique(profile.skills);
  const skillHits = profileSkills.filter((skillName) => haystack.includes(normalizeText(skillName))).length;
  const skills = profileSkills.length ? Math.min(50, Math.round((skillHits / Math.max(profileSkills.length, 1)) * 50)) : 15;

  const userYears = parseYears(profile.experience);
  const jobYears = parseYears(job.experience);
  let experience = 8;
  if (userYears !== null && jobYears !== null) {
    const gap = userYears - jobYears;
    experience = gap >= 0 && gap <= 2 ? 15 : gap > 2 ? 12 : gap >= -1 ? 10 : 5;
  } else if (job.experience) {
    experience = 10;
  }

  const userLocation = normalizeText(profile.location);
  const jobLocation = normalizeText(job.location);
  const location = userLocation && (jobLocation.includes(userLocation) || jobLocation.includes('remote') || userLocation.includes('remote')) ? 15 : job.location ? 8 : 5;

  return { skills, role, location, experience };
};

const matchLabel = (score: number) =>
  score >= 80 ? 'Excellent match' : score >= 60 ? 'Good match' : score >= 40 ? 'Fair match' : 'Potential match';

const sourceLabel = (source: string, jobUrl = '') => {
  if (source && !/^https?:\/\//i.test(source) && source.length < 80) return source;
  try {
    const host = new URL(jobUrl).hostname.replace(/^www\./, '');
    return host ? host.split('.')[0].replace(/[-_]/g, ' ') : 'DRC database';
  } catch {
    return 'DRC database';
  }
};

const scoreParts = (job: Job) => {
  const parts = (job as any).matchParts || {};
  const skills = parts.skills ?? Math.min(50, Math.max(15, Math.round(job.matchScore * 0.5)));
  const role = parts.role ?? Math.min(20, Math.max(8, Math.round(job.matchScore * 0.2)));
  const location = parts.location ?? (job.location ? 15 : 8);
  const experience = parts.experience ?? (job.experience ? 15 : 8);
  return [
    ['Skills overlap', skills, 50],
    ['Role fit', role, 20],
    ['Location', location, 15],
    ['Experience', experience, 15],
  ] as const;
};

const LOCATION_OPTIONS = ['Remote', 'Pune', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai', 'Delhi NCR', 'Noida', 'Gurugram'];
const EXPERIENCE_OPTIONS = [
  { value: '', label: 'Any experience' },
  { value: '0-1', label: '0-1 years' },
  { value: '1-3', label: '1-3 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5-8', label: '5-8 years' },
  { value: '8-12', label: '8-12 years' },
  { value: '12+', label: '12+ years' },
];

const jobMatchesExperienceRange = (jobExperience: string, selectedRange: string) => {
  if (!selectedRange) return true;
  const jobYears = parseYears(jobExperience);
  if (jobYears === null) return false;
  if (selectedRange.endsWith('+')) return jobYears >= Number.parseFloat(selectedRange);
  const [min, max] = selectedRange.split('-').map(Number);
  return Number.isFinite(min) && Number.isFinite(max) ? jobYears >= min && jobYears <= max : true;
};

const jobMatchesDateFilter = (createdAt: string, preset: DatePreset, fromDate: string, toDate: string) => {
  if (!preset) return true;
  const createdTime = dateTime(createdAt);
  if (!createdTime) return false;
  if (preset === 'custom') {
    const fromTime = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : 0;
    const toTime = toDate ? new Date(`${toDate}T23:59:59`).getTime() : 0;
    if (fromTime && createdTime < fromTime) return false;
    if (toTime && createdTime > toTime) return false;
    return true;
  }
  const hours = preset === '24h' ? 24 : 48;
  return Date.now() - createdTime <= hours * 60 * 60 * 1000;
};

const JobDashboard: React.FC<Props> = ({ userPreferences, cvKeywords, onLogout, onJobApplied }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quickView, setQuickView] = useState<Job | null>(null);
  const [query, setQuery] = useState('');
  const [skill, setSkill] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [jobType, setJobType] = useState('all');
  const [onlyIntel, setOnlyIntel] = useState(true);
  const [datePreset, setDatePreset] = useState<DatePreset>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statFilter, setStatFilter] = useState<StatFilter>('all');

  const loadJobs = async () => {
    const userId = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
    if (!userId) {
      setError('Your session is missing user details. Please sign in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const headers = { 'X-SESSION-TOKEN': sessionToken() };
      const [jobsResponse, userResponse, trackerResponse] = await Promise.all([
        fetch(API_ENDPOINTS.JOBS_PAGE(0, 100), { headers }),
        fetch(API_ENDPOINTS.USER_DETAILS(userId), { headers }).catch(() => null),
        fetch(API_ENDPOINTS.USER_JOBS_FETCH(userId), { headers }).catch(() => null),
      ]);

      if (!jobsResponse.ok) {
        const detail = await jobsResponse.text().catch(() => '');
        if (jobsResponse.status === 401 || jobsResponse.status === 403) onLogout();
        throw new Error(detail || `Unable to load jobs (${jobsResponse.status})`);
      }

      const result = await jobsResponse.json();
      const userData = userResponse?.ok ? await userResponse.json() : {};
      const trackerData = trackerResponse?.ok ? await trackerResponse.json() : [];
      const trackedRows = Array.isArray(trackerData) ? trackerData : trackerData.jobs || trackerData.data || [];
      setSavedIds(new Set(trackedRows.map((item: any) => asText(item.job?.job_id || item.job_id || item.jobId)).filter(Boolean)));

      const profile = {
        role: asText(userData.job_title || userPreferences?.jobFunction || userPreferences?.role),
        skills: unique([...(Array.isArray(userData.skills) ? userData.skills : []), ...(cvKeywords || [])].map(asText)),
        experience: asText(userData.experience || userPreferences?.experience),
        location: asText(userData.job_location || userPreferences?.location),
        jobType: asText(userData.job_type || userPreferences?.jobType),
      };

      const rows = Array.isArray(result) ? result : result.jobs || result.relevant_jobs || [];
      const mappedJobs = rows
        .map((item: any): Job => {
          const job = item.job || item;
          const salary = job.salary ?? job.salary_range ?? job.salaryRange;
          const baseJob = {
            id: String(job.job_id || job.jobId || job.id || ''),
            title: asText(job.job_title || job.title),
            company: asText(job.company),
            location: asText(job.location),
            jobType: asText(job.job_type || job.jobType || job.work_type),
            experience: asText(job.experience || job.experience_level),
            salary: salary === 0 || salary ? String(salary) : '',
            requirements: asSkills(job.key_skills ?? job.keySkills),
            jobUrl: asText(job.application_url || job.job_url || job.jobUrl),
            description: htmlToText(job.description || job.insights),
            insights: htmlToText(job.insights),
            source: asText(job.source),
            isRemote: Boolean(job.is_remote ?? job.isRemote) || /remote/i.test(`${job.location} ${job.job_type || job.jobType}`),
            connections: normalizeConnections(job.connections),
            createdAt: toDateValue(job.created_at || job.createdAt || job.updated_at || job.updatedAt),
          };
          const matchParts = computeMatchParts(baseJob, profile);
          return {
            ...baseJob,
            matchParts,
            matchScore: Number(item.matchPercentage ?? job.matchPercentage ?? item.match_score ?? job.match_score) || computeMatchScore(baseJob, profile),
          };
        })
        .filter((job: Job) => job.id);

      setJobs(mappedJobs);
      setExpandedId((current) => current || mappedJobs[0]?.id || null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const visibleJobs = useMemo(
    () =>
      jobs
        .filter((job) => {
          if (savedIds.has(job.id)) return false;
          const searchable = `${job.title} ${job.company} ${job.location} ${job.requirements.join(' ')}`.toLowerCase();
          if (query && !searchable.includes(query.toLowerCase())) return false;
          if (skill && !job.requirements.some((entry) => entry.toLowerCase().includes(skill.toLowerCase()))) return false;
          if (!jobMatchesExperienceRange(job.experience, experience)) return false;
          if (location && !job.location.toLowerCase().includes(location.toLowerCase())) return false;
          if (!jobMatchesDateFilter(job.createdAt, datePreset, dateFrom, dateTo)) return false;
          if (jobType !== 'all' && !job.jobType.toLowerCase().includes(jobType)) return false;
          if (onlyIntel && !job.connections.length && !job.description && !job.jobUrl) return false;
          if (statFilter === 'strong' && job.matchScore < 80) return false;
          if (statFilter === 'referral' && job.connections.length === 0) return false;
          if (statFilter === 'mobile' && !job.connections.some((conn) => conn.mobileNumber)) return false;
          return true;
        })
        .sort((left, right) => dateTime(right.createdAt) - dateTime(left.createdAt) || right.matchScore - left.matchScore),
    [jobs, savedIds, query, skill, experience, location, datePreset, dateFrom, dateTo, jobType, onlyIntel, statFilter],
  );

  const saveJob = async (job: Job) => {
    const userId = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
    if (!userId) {
      toast.error('Please sign in again to save a job.');
      return;
    }

    setSavingId(job.id);
    try {
      const response = await fetch(API_ENDPOINTS.USER_JOBS_UPDATE(userId, job.id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-SESSION-TOKEN': sessionToken() },
        body: JSON.stringify({ status: 'saved', call_received: 'false', is_delete: 'false' }),
      });
      if (!response.ok) throw new Error((await response.text().catch(() => '')) || `Save request failed (${response.status})`);

      setSavedIds((previous) => new Set(previous).add(job.id));
      setJobs((previous) => previous.filter((item) => item.id !== job.id));
      setQuickView(null);
      onJobApplied?.({ ...job, status: 'saved' });
      toast.success('Job saved to your tracker');
    } catch (cause) {
      console.error('Unable to save master job', cause);
      toast.error(cause instanceof Error ? `Unable to save this job: ${cause.message}` : 'Unable to save this job.');
    } finally {
      setSavingId(null);
    }
  };

  const clearFilters = () => {
    setQuery('');
    setSkill('');
    setExperience('');
    setLocation('');
    setIsCustomLocation(false);
    setDatePreset('');
    setDateFrom('');
    setDateTo('');
    setJobType('all');
    setOnlyIntel(true);
    setStatFilter('all');
  };

  const filtersActive = Boolean(query || skill || experience || location || datePreset || dateFrom || dateTo || jobType !== 'all' || !onlyIntel || statFilter !== 'all');
  const baseFilteredJobs = jobs.filter((job) => {
    if (savedIds.has(job.id)) return false;
    const searchable = `${job.title} ${job.company} ${job.location} ${job.requirements.join(' ')}`.toLowerCase();
    if (query && !searchable.includes(query.toLowerCase())) return false;
    if (skill && !job.requirements.some((entry) => entry.toLowerCase().includes(skill.toLowerCase()))) return false;
    if (!jobMatchesExperienceRange(job.experience, experience)) return false;
    if (location && !job.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (!jobMatchesDateFilter(job.createdAt, datePreset, dateFrom, dateTo)) return false;
    if (jobType !== 'all' && !job.jobType.toLowerCase().includes(jobType)) return false;
    if (onlyIntel && !job.connections.length && !job.description && !job.jobUrl) return false;
    return true;
  });
  const stats = {
    total: baseFilteredJobs.length,
    strong: baseFilteredJobs.filter((job) => job.matchScore >= 80).length,
    referrals: baseFilteredJobs.filter((job) => job.connections.length > 0).length,
    phones: baseFilteredJobs.filter((job) => job.connections.some((conn) => conn.mobileNumber)).length,
  };

  const MetaPill = ({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'green' | 'amber' | 'blue' }) => {
    const color = tone === 'green' ? 'border-emerald-500/40 bg-emerald-500/12 text-emerald-300' : tone === 'amber' ? 'border-amber-500/40 bg-amber-500/12 text-amber-300' : tone === 'blue' ? 'border-sky-500/40 bg-sky-500/12 text-sky-300' : 'border-zinc-700 bg-zinc-900 text-zinc-300';
    return <span className={`inline-flex items-center rounded px-2 py-1 text-[10px] font-black uppercase ${color}`}>{children}</span>;
  };

  const ReferralContactsHover = ({ connections }: { connections: Connection[] }) => {
    if (!connections.length) return <span>No contacts yet</span>;
    return (
      <span className="group relative inline-flex cursor-help items-center gap-1 text-emerald-300 outline-none" tabIndex={0} aria-label={`${connections.length} referral contacts; focus for details`}>
        <Users size={12} />
        {connections.length} contacts
        <span role="tooltip" className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 hidden w-72 rounded-xl border border-emerald-500/30 bg-[#111] p-3 text-left shadow-2xl group-hover:block group-focus:block">
          <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Referral contacts</span>
          <span className="block space-y-2">
            {connections.map((connection, index) => (
              <span key={`${connectionPrimary(connection)}-${index}`} className="block border-t border-zinc-800 pt-2 first:border-t-0 first:pt-0">
                <span className="block text-xs font-bold text-white">{connectionPrimary(connection)}</span>
                {connection.title && <span className="mt-0.5 block text-[11px] text-slate-300">{connection.title}</span>}
                {connection.email && <span className="mt-1 block break-all text-[11px] text-emerald-300">{connection.email}</span>}
                {connection.mobileNumber && <span className="mt-0.5 block text-[11px] text-slate-300">{connection.mobileNumber}</span>}
                {connection.emailOrLinkedIn && <span className="mt-0.5 block break-all text-[11px] text-sky-300">{connection.emailOrLinkedIn}</span>}
              </span>
            ))}
          </span>
        </span>
      </span>
    );
  };

  const ExpandedIntel = ({ job }: { job: Job }) => (
    <div className="grid gap-5 border-t border-[#242424] bg-black px-4 py-5 lg:grid-cols-[1.45fr_.95fr]">
      <div className="space-y-5">
        <section>
          <div className="mb-2 flex items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">About the role</p>
            <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-300">From DRC record</span>
          </div>
          <p className="max-w-4xl whitespace-pre-wrap text-xs leading-6 text-slate-200">
            {job.description || job.insights || 'No detailed description has been added yet. Use the source link and referral contacts to complete the application intel.'}
          </p>
        </section>

        <section>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Skills required</p>
          <div className="flex flex-wrap gap-2">
            {job.requirements.length ? job.requirements.map((entry) => <MetaPill key={entry} tone="green">✓ {entry}</MetaPill>) : <span className="text-xs text-slate-500">No skills listed</span>}
          </div>
        </section>

        <section>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Nice to have</p>
          <ul className="list-disc space-y-1 pl-4 text-xs text-slate-300">
            <li>{job.experience || 'Relevant project experience'}</li>
            <li>{job.location ? `Comfortable with ${job.location}` : 'Location flexibility'}</li>
          </ul>
        </section>
      </div>

      <aside className="space-y-5">
        <section>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Match breakdown</p>
          <div className="space-y-3">
            {scoreParts(job).map(([label, value, max]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-[11px] text-slate-300">
                  <span>{label}</span>
                  <span className="font-black text-white">{value}/{max}</span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-800">
                  <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Connections and referrals</p>
            {job.connections.length > 0 && <span className="rounded border border-emerald-500/50 px-1.5 py-0.5 text-[9px] font-black uppercase text-emerald-300">Reusable</span>}
          </div>
          <div className="space-y-2">
            {job.connections.length ? job.connections.map((conn, index) => (
              <div key={`${connectionPrimary(conn)}-${index}`} className="rounded-lg border border-amber-500/40 bg-[#111] p-3">
                <p className="text-xs font-black text-white">{connectionPrimary(conn)}</p>
                {conn.title && <p className="mt-1 text-[11px] text-slate-300">{conn.title}</p>}
                <div className="mt-2 flex flex-wrap gap-2">
                  {connectionContacts(conn).map((detail) => (
                    <span key={detail} className="rounded border border-zinc-700 bg-black px-2 py-1 text-[10px] text-slate-300">{detail}</span>
                  ))}
                </div>
              </div>
            )) : <div className="rounded-lg border border-zinc-800 bg-[#111] p-3 text-xs text-slate-500">No referral connection stored for this job.</div>}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Created</p>
            <p className="mt-1 text-slate-200">{formatJobDate(job.createdAt)}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Response rate</p>
            <p className="mt-1 text-slate-200">{job.connections.length ? 'High intent lead' : 'Needs outreach'}</p>
          </div>
        </section>
      </aside>
    </div>
  );

  const JobRow = ({ job, index }: { job: Job; index: number }) => {
    const expanded = expandedId === job.id;
    return (
      <article className="overflow-hidden rounded-xl border border-[#242424] bg-[#0c0c0c]">
        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_150px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-start gap-3">
              <span className="rounded bg-emerald-500/15 px-2 py-1 text-[10px] font-black text-emerald-300">{String(index + 1).padStart(2, '0')}</span>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1d1d1d] text-xs font-black text-slate-300">{job.company.charAt(0) || 'D'}</div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-black text-white">{job.title || 'Untitled role'}</h2>
                  {job.connections.length > 0 && <MetaPill tone="amber">Referral available</MetaPill>}
                  {job.matchScore >= 85 && <MetaPill tone="blue">Rich history</MetaPill>}
                </div>
                <p className="mt-1 text-xs text-slate-400">{job.company || 'Company not specified'}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-400">
                  <span className="inline-flex items-center gap-1"><MapPin size={12} className="text-pink-400" />{job.location || 'Location not specified'}</span>
                  <span>Created {formatJobDate(job.createdAt)}</span>
                  <span>Briefcase {job.jobType || 'Role type not specified'}</span>
                  <span>{job.experience || 'Experience not specified'}</span>
                  {job.salary && <span>{job.salary}</span>}
                  <ReferralContactsHover connections={job.connections} />
                </div>
                <div className="mt-3 flex max-h-8 flex-wrap gap-2 overflow-hidden">
                  {job.requirements.slice(0, 5).map((entry) => <MetaPill key={entry} tone="green">✓ {entry}</MetaPill>)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/12 px-4 py-3 text-center">
              <p className="text-2xl font-black text-emerald-300">{job.matchScore}%</p>
              <p className="text-[10px] font-bold uppercase text-emerald-200">{matchLabel(job.matchScore)}</p>
            </div>
            <button onClick={() => saveJob(job)} disabled={savingId === job.id} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-black disabled:opacity-50">
              {savingId === job.id && <Loader size={13} className="animate-spin" />}
              Save job to Job Tracker
            </button>
            <button
              onClick={() => window.open(job.jobUrl, '_blank', 'noopener,noreferrer')}
              disabled={!job.jobUrl}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-black text-emerald-300 transition hover:bg-emerald-500 hover:text-black disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-900 disabled:text-slate-600"
            >
              Apply Now <ExternalLink size={13} />
            </button>
            <button onClick={() => setQuickView(job)} className="text-[11px] font-bold text-slate-500 underline underline-offset-4">Why this match?</button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[#242424] px-4 py-2 text-[11px] text-slate-400">
          <span className="font-bold text-emerald-300"><ShieldCheck size={12} className="mr-1 inline" />In DRC database</span>
          <span>|</span>
          <span>{sourceLabel(job.source, job.jobUrl)}</span>
          <span>|</span>
          <ReferralContactsHover connections={job.connections} />
          <span>|</span>
          <span>Created {formatJobDate(job.createdAt)}</span>
          <span>|</span>
          <span className="truncate">{job.jobUrl || 'No apply link'}</span>
          <button onClick={() => setExpandedId(expanded ? null : job.id)} className="ml-auto inline-flex items-center gap-1 font-black text-emerald-300">
            {expanded ? 'Hide intel' : 'View full intel'} {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {expanded && <ExpandedIntel job={job} />}
      </article>
    );
  };

  const locationSelectValue = isCustomLocation ? 'custom' : location;
  const showCustomLocation = isCustomLocation;
  const showCustomDateRange = datePreset === 'custom';
  const controlClass = 'h-10 w-full rounded-lg border border-[#2b2b2b] bg-black px-3 text-sm text-slate-200 outline-none transition focus:border-emerald-500';

  return (
    <div className="min-h-full bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-slate-500">Jobs</p>
            <h1 className="mt-1 text-2xl font-black">DRC Job Library</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
              Every job here was already added by DRC operators, so descriptions, contacts, referral routes and application links can be reused in one step.
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#2b2b2b] bg-[#101010] px-3 text-sm font-bold text-slate-300 transition hover:border-emerald-500/50 hover:text-white"
          >
            <LogOut size={16} />
            Logout
          </button>
        </header>

        <section className="mb-3 rounded-xl border border-emerald-500/35 bg-emerald-500/8 p-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-black text-emerald-300"><Sparkles size={15} /></span>
            <strong>Source: DRC internal database only</strong>
            <span>{stats.total} jobs matched to this profile</span>
            <span>{stats.strong} strong matches</span>
            <span>{stats.referrals} with referral contacts</span>
            <span>{stats.phones} verified mobile numbers</span>
          </div>
        </section>

        <section className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['all', 'Showing', stats.total, 'after filters'],
            ['strong', '80%+ Match', stats.strong, 'for this profile'],
            ['referral', 'Referral Available', stats.referrals, 'someone can refer'],
            ['mobile', 'With Mobile No.', stats.phones, 'direct contact'],
          ].map(([filter, label, value, caption]) => (
            <button
              key={label}
              type="button"
              onClick={() => setStatFilter(filter as StatFilter)}
              className={`rounded-xl border p-4 text-left transition ${
                statFilter === filter
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-[#242424] bg-[#101010] hover:border-emerald-500/40'
              }`}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-black text-emerald-300">{value}</p>
              <p className="mt-1 text-[11px] text-slate-500">{caption}</p>
            </button>
          ))}
        </section>

        <form onSubmit={(event) => event.preventDefault()} className="mb-4 rounded-xl border border-[#242424] bg-[#101010] p-3">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_160px_150px_150px_140px]">
            <label className="relative">
              <Search className="absolute left-3 top-3 text-slate-500" size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search job title, company or skill..." className="h-10 w-full rounded-lg border border-[#2b2b2b] bg-black pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500" />
            </label>
            <select
              value={locationSelectValue}
              onChange={(event) => {
                const nextLocation = event.target.value;
                setIsCustomLocation(nextLocation === 'custom');
                setLocation(nextLocation === 'custom' ? '' : nextLocation);
              }}
              className={controlClass}
            >
              <option value="">Any location</option>
              {LOCATION_OPTIONS.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
              <option value="custom">Custom location</option>
            </select>
            <select value={experience} onChange={(event) => setExperience(event.target.value)} className={controlClass}>
              {EXPERIENCE_OPTIONS.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
            </select>
            <select
              value={datePreset}
              onChange={(event) => {
                const value = event.target.value as DatePreset;
                setDatePreset(value);
                if (value !== 'custom') {
                  setDateFrom('');
                  setDateTo('');
                }
              }}
              className={controlClass}
            >
              <option value="">Any date</option>
              <option value="24h">Last 24 hrs</option>
              <option value="48h">Last 48 hrs</option>
              <option value="custom">Custom range</option>
            </select>
            <select value={jobType} onChange={(event) => setJobType(event.target.value)} className={controlClass}>
              <option value="all">All roles</option>
              <option value="full">Full-time</option>
              <option value="contract">Contract</option>
              <option value="part">Part-time</option>
              <option value="intern">Internship</option>
            </select>
          </div>
          {(showCustomLocation || showCustomDateRange) && (
            <div className="mt-2 grid gap-2 rounded-lg border border-[#242424] bg-black/50 p-2 sm:grid-cols-2 lg:grid-cols-4">
              {showCustomLocation && (
                <label className="sm:col-span-2 lg:col-span-1">
                  <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Location</span>
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Enter city, state, or remote"
                    className={controlClass}
                  />
                </label>
              )}
              {showCustomDateRange && (
                <>
                  <label>
                    <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">From</span>
                    <span className="relative block">
                      <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className={`${controlClass} date-input-white pr-10`} />
                      <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white" size={16} />
                    </span>
                  </label>
                  <label>
                    <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">To</span>
                    <span className="relative block">
                      <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className={`${controlClass} date-input-white pr-10`} />
                      <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white" size={16} />
                    </span>
                  </label>
                </>
              )}
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {['Business Analysis', 'JIRA', 'Requirement Gathering', 'SQL', 'Agile'].map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => {
                  setSkill(entry);
                  setQuery(entry);
                }}
                className={`rounded-full border px-3 py-1 text-[11px] transition ${
                  skill === entry || query === entry
                    ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                    : 'border-sky-500/30 bg-sky-500/10 text-sky-300 hover:border-sky-400/60'
                }`}
              >
                {entry}
              </button>
            ))}
            <label className="ml-auto inline-flex items-center gap-2 text-xs text-slate-300">
              <input type="checkbox" checked={onlyIntel} onChange={(event) => setOnlyIntel(event.target.checked)} className="h-4 w-4 accent-emerald-500" />
              Only jobs with collected intel
            </label>
            {filtersActive && <button type="button" onClick={clearFilters} className="rounded-full border border-[#333] px-3 py-1 text-[11px] text-slate-400">Clear all filters</button>}
          </div>
        </form>

        {loading ? (
          <div className="py-20 text-center text-slate-400"><Loader className="mx-auto animate-spin" /><p className="mt-3">Loading DRC jobs...</p></div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-100"><p>{error}</p><button onClick={loadJobs} className="mt-3 rounded-lg bg-[#222] px-4 py-2 text-sm">Retry</button></div>
        ) : visibleJobs.length === 0 ? (
          <div className="py-20 text-center text-slate-400"><Briefcase className="mx-auto mb-3" /><p>No DRC jobs match these filters.</p></div>
        ) : (
          <div className="grid gap-3">{visibleJobs.map((job, index) => <JobRow key={job.id} job={job} index={index} />)}</div>
        )}

        {quickView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#333] bg-[#101010]">
              <header className="flex items-start justify-between border-b border-[#242424] p-5">
                <div>
                  <h2 className="text-lg font-black">{quickView.title}</h2>
                  <p className="mt-1 text-xs text-slate-400">{quickView.company} - {quickView.location || 'Location not specified'}</p>
                </div>
                <button onClick={() => setQuickView(null)} className="rounded p-1 text-slate-400 hover:bg-[#222]" aria-label="Close quick view"><X size={18} /></button>
              </header>
              <div className="space-y-5 p-5 text-sm text-slate-300">
                <ExpandedIntel job={quickView} />
              </div>
              <footer className="flex justify-end gap-2 border-t border-[#242424] p-4">
                <button onClick={() => setQuickView(null)} className="rounded-lg bg-[#222] px-4 py-2 text-xs font-bold">Close</button>
                <button onClick={() => saveJob(quickView)} disabled={savingId === quickView.id} className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-black text-black disabled:opacity-50">{savingId === quickView.id ? 'Saving...' : 'Save to tracker'}</button>
              </footer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDashboard;
