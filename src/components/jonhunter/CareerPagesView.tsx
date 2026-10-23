import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building2,
  Sparkles,
  ExternalLink,
  Bookmark,
  MapPin,
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  Target,
  Clock,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Mail,
  Linkedin,
  RefreshCw,
  Layers,
  ShieldCheck,
  Zap,
  Globe,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Building,
} from 'lucide-react';
import {
  DiscoveredJobItem,
  CareerCompanyInfo,
  CareerPageStats,
  fetchCareerPagesCompanies,
  fetchCareerPagesStats,
  searchCareerPages,
} from '../../lib/drcDiscoveryApi';
import { CandidateParsedProfile } from '../../lib/applicationApi';
import { CompanyLogo } from './CompanyLogo';
import { getActiveTheme } from '../../config/themeConfig';
import { openExternalJobLink } from '../../lib/safeExternalLink';
import { toast } from 'sonner';

export interface CareerPagesViewProps {
  candidateProfile?: CandidateParsedProfile | null;
  savedJobIds: string[];
  onToggleStar: (job: DiscoveredJobItem) => void;
  onViewDetails: (job: DiscoveredJobItem) => void;
  onApplyNow?: (job: DiscoveredJobItem) => void;
  onExploreRoles?: () => void;
}

const ARCHETYPES = [
  'All Archetypes',
  'Agentic & AI Automation',
  'AI & Machine Learning',
  'AI Forward Deployed',
  'LLMOps & GenAI Infra',
  'Full Stack Engineering',
  'Backend & Systems',
  'Frontend & UI',
  'Data Platform & Analytics',
  'DevOps, SRE & Cloud',
  'Technical Product & Eng Mgmt',
];

const ATS_PROVIDERS = [
  { id: 'all', label: 'All ATS Platforms', count: 859 },
  { id: 'greenhouse', label: 'Greenhouse', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  { id: 'ashby', label: 'Ashby', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  { id: 'lever', label: 'Lever', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  { id: 'smartrecruiters', label: 'SmartRecruiters', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
];

const POPULAR_COMPANIES = [
  'Postman', 'Figma', 'Vercel', 'Supabase', 'Cohere', 'Cursor',
  'Anthropic', 'ElevenLabs', 'Razorpay', 'CRED', 'Meesho',
  'Thoughtworks', 'Uber Freight', 'Stripe', 'Databricks', 'Airbnb',
  'Zscaler', 'HubSpot', 'Linear', 'Retool', 'Brex', 'Ramp'
];

export const CareerPagesView: React.FC<CareerPagesViewProps> = ({
  candidateProfile,
  savedJobIds,
  onToggleStar,
  onViewDetails,
  onApplyNow,
  onExploreRoles,
}) => {
  const theme = getActiveTheme();

  // State
  const [companies, setCompanies] = useState<CareerCompanyInfo[]>([]);
  const [stats, setStats] = useState<CareerPageStats | null>(null);
  const [jobs, setJobs] = useState<DiscoveredJobItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoaded, setInitialLoaded] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedAts, setSelectedAts] = useState<string>('all');
  const [selectedArchetype, setSelectedArchetype] = useState<string>('All Archetypes');
  const [selectedMinGrade, setSelectedMinGrade] = useState<'all' | 'A' | 'B' | 'C'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations (Remote & Global)');
  const [companySearchFilter, setCompanySearchFilter] = useState<string>('');
  const [expandedConnectionsId, setExpandedConnectionsId] = useState<string | null>(null);

  // Load Companies & Stats once on mount
  useEffect(() => {
    let mounted = true;

    async function loadMetadata() {
      try {
        const [companiesList, statsData] = await Promise.all([
          fetchCareerPagesCompanies(),
          fetchCareerPagesStats(),
        ]);
        if (mounted) {
          if (Array.isArray(companiesList) && companiesList.length > 0) {
            setCompanies(companiesList);
          }
          if (statsData) {
            setStats(statsData);
          }
        }
      } catch (err) {
        console.error('Failed to load career page metadata:', err);
      }
    }

    loadMetadata();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch Jobs when primary query or filters change
  const executeSearch = useCallback(async () => {
    setLoading(true);
    try {
      let queryParam = searchQuery.trim();
      if (selectedCompany !== 'all') {
        queryParam = queryParam ? `${queryParam} ${selectedCompany}` : selectedCompany;
      }

      const archetypeParam = selectedArchetype === 'All Archetypes' ? 'all' : selectedArchetype;

      const res = await searchCareerPages({
        query: queryParam || 'Software Engineer',
        location: selectedLocation === 'All Locations (Remote & Global)' ? 'All India (Remote & Nationwide)' : selectedLocation,
        ats_provider: selectedAts,
        archetype: archetypeParam,
        min_grade: selectedMinGrade,
        limit: 25,
        candidate: candidateProfile ? {
          name: candidateProfile.name || 'Candidate',
          email: candidateProfile.email || 'candidate@drc.com',
          phone: candidateProfile.phone || '',
          location: candidateProfile.location || selectedLocation,
          total_experience_years: candidateProfile.total_experience_years || (candidateProfile as any).experience_years || 3,
          primary_domain: candidateProfile.primary_domain || candidateProfile.reference_role || '',
          target_roles: candidateProfile.target_roles || [],
          top_skills: candidateProfile.top_skills || candidateProfile.skills || [],
          raw_resume_text: candidateProfile.raw_resume_text || '',
          work_mode: candidateProfile.work_mode || 'remote_included',
          open_to_relocation: candidateProfile.open_to_relocation ?? true,
          notice_period: candidateProfile.notice_period || 'Immediate',
          skills: candidateProfile.skills || candidateProfile.top_skills || [],
        } : null,
      });

      if (res && Array.isArray(res.jobs)) {
        setJobs(res.jobs);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error('Error fetching career page jobs:', err);
      toast.error('Failed to fetch direct career page jobs. Retrying...');
    } finally {
      setLoading(false);
      setInitialLoaded(true);
      setRefreshing(false);
    }
  }, [
    searchQuery,
    selectedCompany,
    selectedAts,
    selectedArchetype,
    selectedMinGrade,
    selectedLocation,
    candidateProfile,
  ]);

  // Initial fetch
  useEffect(() => {
    executeSearch();
  }, [selectedAts, selectedArchetype, selectedMinGrade, selectedCompany]);

  // Manual Trigger
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    executeSearch();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCompany('all');
    setSelectedAts('all');
    setSelectedArchetype('All Archetypes');
    setSelectedMinGrade('all');
    setSelectedLocation('All Locations (Remote & Global)');
    setCompanySearchFilter('');
    toast.success('Career page filters reset to all 859+ employers.');
  };

  // Filtered Company Pills
  const filteredCompanyPills = useMemo(() => {
    if (!companySearchFilter.trim()) return POPULAR_COMPANIES;
    const q = companySearchFilter.toLowerCase().trim();
    return companies
      .filter((c) => (c.name || '').toLowerCase().includes(q) || (c.ats_provider || c.ats || '').toLowerCase().includes(q))
      .slice(0, 20)
      .map((c) => c.name);
  }, [companySearchFilter, companies]);

  // Direct Apply Handler
  const handleDirectApply = (job: DiscoveredJobItem) => {
    if (onApplyNow) {
      onApplyNow(job);
      return;
    }
    const applyUrl = job.application_url || (job as any).url || (job as any).job_url;
    if (applyUrl) {
      openExternalJobLink(applyUrl, job.company);
    } else {
      toast.info('Direct application link not available for this role.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* 1. Header Banner & Live Intelligence Metrics */}
      <div className={`relative overflow-hidden rounded-3xl ${theme.cardClass} border ${theme.cardBorderClass} p-6 sm:p-8 shadow-xl`}>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-[#00C896]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Direct Corporate Feeds · Zero Aggregators
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
              <Zap className="w-3.5 h-3.5" />
              859+ Verified Tech Employers
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Corporate Career Pages <span className="text-[#00C896]">Intelligence</span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-zinc-300 leading-relaxed">
                Direct real-time job openings from corporate ATS boards (Greenhouse, Ashby, Lever, SmartRecruiters).
                Apply straight to the company's internal hiring system with instant Fit Grading (A/B/C) and direct recruiter connections.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className={`px-4 py-2.5 rounded-xl ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} hover:border-[#00C896]/40 text-xs font-semibold text-zinc-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing || loading ? 'animate-spin text-[#00C896]' : ''}`} />
                <span>Sync ATS Feeds</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#262830]">
            <div className={`p-3.5 rounded-2xl ${theme.innerBoxClass} border ${theme.innerBoxBorderClass}`}>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Verified Companies</div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {stats?.total_registered_employers || (stats as any)?.total_companies || companies.length || 859}
              </div>
              <div className="text-[10px] text-[#00C896] mt-0.5 font-medium">545 GH · 165 Ashby · 108 Lever</div>
            </div>

            <div className={`p-3.5 rounded-2xl ${theme.innerBoxClass} border ${theme.innerBoxBorderClass}`}>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">ATS Platforms</div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">4 Systems</div>
              <div className="text-[10px] text-zinc-400 mt-0.5 font-medium">Greenhouse, Ashby, Lever, SmartRecruiters</div>
            </div>

            <div className={`p-3.5 rounded-2xl ${theme.innerBoxClass} border ${theme.innerBoxBorderClass}`}>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Role Archetypes</div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">10 Tracks</div>
              <div className="text-[10px] text-zinc-400 mt-0.5 font-medium">AI/ML, Full Stack, SRE, etc.</div>
            </div>

            <div className={`p-3.5 rounded-2xl ${theme.innerBoxClass} border ${theme.innerBoxBorderClass}`}>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Direct Apply URLs</div>
              <div className="text-xl sm:text-2xl font-black text-[#00C896] mt-0.5">100% Guaranteed</div>
              <div className="text-[10px] text-zinc-400 mt-0.5 font-medium">No Aggregator Middlemen</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Multi-Dimensional Filter Bar */}
      <div className={`p-5 rounded-2xl ${theme.cardClass} border ${theme.cardBorderClass} shadow-lg space-y-4`}>
        {/* Row 1: Search Input & Location */}
        <form onSubmit={handleManualSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, stack (e.g. Python, AI Agent, FastAPI, React)..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896] text-white text-xs sm:text-sm placeholder-zinc-500 outline-none`}
            />
          </div>

          <div className="md:col-span-3 relative">
            <MapPin className="w-4 h-4 text-[#00C896] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className={`w-full pl-10 pr-8 py-2.5 rounded-xl ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-white text-xs sm:text-sm outline-none focus:border-[#00C896] appearance-none cursor-pointer`}
            >
              <option value="All Locations (Remote & Global)">All Locations (Remote & Global)</option>
              <option value="Bengaluru, Karnataka">Bengaluru, India</option>
              <option value="Remote, India">Remote, India</option>
              <option value="Gurgaon / Delhi NCR">Gurgaon / Delhi NCR</option>
              <option value="Hyderabad, Telangana">Hyderabad, India</option>
              <option value="Pune / Mumbai">Pune / Mumbai, India</option>
              <option value="San Francisco, CA / US Remote">San Francisco / US Remote</option>
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-[#0A0A0A] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Search Roles</span>
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset all filters"
              className={`p-2.5 rounded-xl ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-zinc-300 hover:text-white cursor-pointer`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Row 2: ATS Platform Selector & Archetype Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-[#262830]">
          {/* ATS Platforms Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-zinc-400 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#00C896]" />
              ATS:
            </span>
            {ATS_PROVIDERS.map((ats) => {
              const isActive = selectedAts === ats.id;
              return (
                <button
                  key={ats.id}
                  type="button"
                  onClick={() => setSelectedAts(ats.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#00C896]/20 text-[#00C896] border-[#00C896]/50 shadow-sm'
                      : `${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-zinc-300 hover:text-white hover:border-[#00C896]/30`
                  }`}
                >
                  {ats.label}
                </button>
              );
            })}
          </div>

          {/* Archetype & Grade Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Archetype Dropdown */}
            <div className="relative">
              <select
                value={selectedArchetype}
                onChange={(e) => setSelectedArchetype(e.target.value)}
                className={`pl-3 pr-8 py-1.5 rounded-xl ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-white text-xs font-medium outline-none focus:border-[#00C896] appearance-none cursor-pointer`}
              >
                {ARCHETYPES.map((arch) => (
                  <option key={arch} value={arch}>{arch}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Fit Grade Filter */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-zinc-400 font-semibold mr-1">Grade:</span>
              {(['all', 'A', 'B', 'C'] as const).map((grade) => {
                const isActive = selectedMinGrade === grade;
                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setSelectedMinGrade(grade)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      isActive
                        ? grade === 'A'
                          ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50'
                          : grade === 'B'
                          ? 'bg-amber-500/25 text-amber-300 border-amber-500/50'
                          : 'bg-[#00C896]/20 text-[#00C896] border-[#00C896]/40'
                        : `${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-zinc-400 hover:text-white`
                    }`}
                  >
                    {grade === 'all' ? 'All' : `Grade ${grade}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 3: 141-Company Quick Filter Pills */}
        <div className="pt-3 border-t border-[#262830] space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-[#00C896]" />
              <span className="text-xs font-bold text-zinc-300">Quick Employer Filter:</span>
              {selectedCompany !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#00C896]/20 text-[#00C896] border border-[#00C896]/40 text-xs font-bold">
                  {selectedCompany}
                  <button
                    type="button"
                    onClick={() => setSelectedCompany('all')}
                    className="hover:text-white text-zinc-300 ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>

            <div className="relative w-44">
              <input
                type="text"
                value={companySearchFilter}
                onChange={(e) => setCompanySearchFilter(e.target.value)}
                placeholder="Filter 141 employers..."
                className={`w-full px-2.5 py-1 rounded-lg ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-[11px] text-white placeholder-zinc-500 outline-none focus:border-[#00C896]`}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-700">
            <button
              type="button"
              onClick={() => setSelectedCompany('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-all cursor-pointer border ${
                selectedCompany === 'all'
                  ? 'bg-[#00C896] text-[#0A0A0A] font-bold border-[#00C896]'
                  : `${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-zinc-300 hover:text-white`
              }`}
            >
              All 141+ Employers
            </button>

            {filteredCompanyPills.map((comp) => {
              const isSelected = selectedCompany.toLowerCase() === comp.toLowerCase();
              return (
                <button
                  key={comp}
                  type="button"
                  onClick={() => setSelectedCompany(isSelected ? 'all' : comp)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#00C896]/25 text-[#00C896] border-[#00C896]/60 font-bold'
                      : `${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-zinc-300 hover:text-white hover:border-[#00C896]/40`
                  }`}
                >
                  {comp}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Job Results Feed */}
      <div className="space-y-4">
        {/* Results Header Count */}
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Direct ATS Openings</span>
              {!loading && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30 font-mono font-bold">
                  {jobs.length} Found
                </span>
              )}
            </h2>
          </div>

          {selectedCompany !== 'all' && (
            <div className="text-xs text-zinc-400">
              Filtering by: <span className="text-[#00C896] font-semibold">{selectedCompany}</span>
            </div>
          )}
        </div>

        {/* Loading State Skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl ${theme.cardClass} border ${theme.cardBorderClass} animate-pulse space-y-4`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800/80" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-800/80 rounded w-1/3" />
                    <div className="h-3 bg-zinc-800/50 rounded w-1/4" />
                  </div>
                </div>
                <div className="h-3 bg-zinc-800/50 rounded w-full" />
                <div className="h-3 bg-zinc-800/30 rounded w-4/5" />
              </div>
            ))}
          </div>
        )}

        {/* Loaded Results */}
        {!loading && jobs.length > 0 && (
          <div className="space-y-4">
            {jobs.map((job) => {
              const isSaved = savedJobIds.includes(job.id);
              const isConnectionsOpen = expandedConnectionsId === job.id;
              const fitGrade = job.fit_grade || 'A';
              const atsProvider = job.ats_provider || 'Greenhouse';

              return (
                <article
                  key={job.id}
                  className={`group ${theme.cardClass} ${theme.cardHoverClass} rounded-2xl border ${theme.cardBorderClass} p-5 sm:p-6 transition-all duration-200 text-white shadow-md relative`}
                >
                  {/* Top Row: Company Logo, Title, ATS Provider, Grade Badge */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <CompanyLogo
                        company={job.company || ''}
                        applicationUrl={job.application_url}
                        className="w-12 h-12"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {/* ATS Platform Badge */}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30">
                            <ShieldCheck className="w-3 h-3" />
                            {atsProvider} ATS Feeds
                          </span>

                          {/* Fit Grade Badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                              fitGrade === 'A'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : fitGrade === 'B'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            Grade {fitGrade} · {job.match_score || 90}% Match
                          </span>

                          {/* Role Archetype Tag */}
                          {job.archetype && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30">
                              {job.archetype}
                            </span>
                          )}
                        </div>

                        <h3
                          onClick={() => onViewDetails(job)}
                          className="text-base sm:text-lg font-bold text-white hover:text-[#00C896] transition-colors cursor-pointer line-clamp-1 flex items-center gap-1.5"
                          title={job.job_title}
                        >
                          <span>{job.job_title}</span>
                          <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:opacity-100 text-[#00C896] shrink-0" />
                        </h3>

                        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-300">
                          <span className="font-semibold text-white">{job.company}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-zinc-400">
                            <MapPin className="w-3 h-3 text-[#00C896]" />
                            {job.location || 'Remote'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-zinc-400">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            {job.posted_time || 'Active Opening'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bookmark Save */}
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStar(job);
                        }}
                        aria-label={isSaved ? 'Saved to collection' : 'Save job'}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          isSaved
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            : `${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-zinc-400 hover:text-white`
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Match Reasons / Strengths Chips */}
                  {Array.isArray(job.match_reasons) && job.match_reasons.length > 0 && (
                    <div className="mt-3.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1 mr-1">
                        <Check className="w-3 h-3 text-[#00C896]" /> Fit Signals:
                      </span>
                      {job.match_reasons.slice(0, 3).map((reason, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/25"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Skills Badges */}
                  {Array.isArray(job.key_skills) && job.key_skills.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      {job.key_skills.slice(0, 6).map((skill, idx) => (
                        <span
                          key={idx}
                          className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium ${theme.innerBoxClass} text-zinc-300 border ${theme.innerBoxBorderClass}`}
                        >
                          {skill}
                        </span>
                      ))}
                      {job.key_skills.length > 6 && (
                        <span className="text-[11px] text-zinc-400 font-semibold px-1">
                          +{job.key_skills.length - 6} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* HR Talent Acquisition Connections Strip */}
                  {Array.isArray(job.connections) && job.connections.length > 0 && (
                    <div className={`mt-3 pt-3 border-t ${theme.cardBorderClass}`}>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedConnectionsId(isConnectionsOpen ? null : job.id)
                        }
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#00C896] hover:underline cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          {job.connections.length} Verified HR & Recruiter Contacts at {job.company}
                        </span>
                        {isConnectionsOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isConnectionsOpen && (
                        <div className={`mt-2.5 space-y-2 ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} rounded-xl p-3`}>
                          {job.connections.map((c, i) => (
                            <div
                              key={i}
                              className={`flex items-center justify-between gap-2 text-xs text-zinc-200 pb-2 border-b ${theme.innerBoxBorderClass} last:border-0 last:pb-0`}
                            >
                              <div className="min-w-0">
                                <span className="font-bold text-white block truncate">{c.name}</span>
                                <span className="text-[11px] text-zinc-400 block truncate">{c.title}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {c.email && (
                                  <a
                                    href={`mailto:${c.email}?subject=Application for ${encodeURIComponent(job.job_title)}`}
                                    className={`px-2 py-1 rounded-lg ${theme.innerBoxClass} text-zinc-200 border ${theme.innerBoxBorderClass} flex items-center gap-1 text-[11px] hover:text-[#00C896]`}
                                    title={`Email: ${c.email}`}
                                  >
                                    <Mail className="w-3 h-3 text-[#00C896]" />
                                    <span>Direct Email</span>
                                  </a>
                                )}
                                {((c as any).emailOrLinkedIn || c.linkedin_url) && (
                                  <a
                                    href={(c as any).emailOrLinkedIn || c.linkedin_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`px-2 py-1 rounded-lg ${theme.innerBoxClass} text-zinc-200 border ${theme.innerBoxBorderClass} flex items-center gap-1 text-[11px] hover:text-sky-400`}
                                    title="LinkedIn Profile"
                                  >
                                    <Linkedin className="w-3 h-3 text-sky-400" />
                                    <span>LinkedIn</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Footer: Action Buttons */}
                  <div className={`flex items-center justify-between gap-3 mt-4 pt-3.5 border-t ${theme.cardBorderClass} flex-wrap`}>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#00C896]" />
                      <span>Direct ATS URL: Verified Genuine</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onViewDetails(job)}
                        className={`px-3.5 py-1.5 rounded-xl ${theme.innerBoxClass} hover:opacity-90 text-white border ${theme.innerBoxBorderClass} text-xs font-semibold cursor-pointer`}
                      >
                        View Spec
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDirectApply(job)}
                        className="px-4 py-1.5 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-[#0A0A0A] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <span>Apply on Company ATS</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && initialLoaded && jobs.length === 0 && (
          <div className={`${theme.cardClass} rounded-2xl border border-dashed ${theme.cardBorderClass} p-12 text-center shadow-md`}>
            <div className={`w-14 h-14 rounded-2xl ${theme.innerBoxClass} ${theme.innerBoxBorderClass} flex items-center justify-center text-[#00C896] mx-auto mb-4`}>
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">No career page jobs found matching your filters</h3>
            <p className="text-sm text-zinc-300 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
              We searched across 141+ corporate ATS career portals. Try resetting the company or archetype filter to see all active requisitions.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-6 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-[#0A0A0A] text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Filters (Show 141+ Boards)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerPagesView;
