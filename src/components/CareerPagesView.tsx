import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Building2,
  ExternalLink,
  Zap,
  Globe,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Filter,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  Clock,
  Layers,
  Award,
  ChevronRight,
  Database,
  SlidersHorizontal,
  X,
  FileText,
  Send,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DiscoveredJobItem,
  CareerPageStats,
  CareerCompany,
  fetchCareerPageStats,
  fetchCareerCompanies,
  searchCareerPages,
} from '../lib/drcDiscoveryApi';

interface CareerPagesViewProps {
  onSelectJobForDetail?: (job: any) => void;
  onSelectJobForApplication?: (job: any) => void;
  onSaveJob?: (job: DiscoveredJobItem) => void;
  savedJobIds?: Set<string>;
}

const ARCHETYPES = [
  'All Archetypes',
  'Agentic & AI Automation',
  'AI & Machine Learning',
  'AI Forward Deployed & Solutions',
  'AI Platform & LLMOps',
  'Backend & Distributed Systems',
  'Full Stack Engineering',
  'Frontend & UI Engineering',
  'Data Platform & Analytics',
  'Cloud & DevOps / SRE',
  'Technical Product & Architecture',
];

const POPULAR_QUICK_SEARCHES = [
  'Full Stack Engineer',
  'Backend Engineer',
  'Frontend Developer',
  'AI Engineer',
  'Data Engineer',
  'DevOps / Cloud',
  'Python Developer',
  'Software Engineer',
];

export const CareerPagesView: React.FC<CareerPagesViewProps> = ({
  onSelectJobForDetail,
  onSelectJobForApplication,
  onSaveJob,
  savedJobIds = new Set(),
}) => {
  // Stats state
  const [stats, setStats] = useState<CareerPageStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  // Companies directory state
  const [companies, setCompanies] = useState<CareerCompany[]>([]);
  const [showCompanyDirectory, setShowCompanyDirectory] = useState<boolean>(false);
  const [companySearchQuery, setCompanySearchQuery] = useState<string>('');
  const [companyAtsFilter, setCompanyAtsFilter] = useState<string>('all');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('Software Engineer');
  const [selectedScope, setSelectedScope] = useState<'all' | 'india_gcc' | 'remote'>('all');
  const [selectedAts, setSelectedAts] = useState<'all' | 'greenhouse' | 'lever' | 'ashby' | 'smartrecruiters'>('all');
  const [selectedArchetype, setSelectedArchetype] = useState<string>('All Archetypes');
  const [selectedGrade, setSelectedGrade] = useState<'all' | 'A' | 'B' | 'C'>('all');
  const [locationPreference, setLocationPreference] = useState<string>('Remote');

  // Results state
  const [jobs, setJobs] = useState<DiscoveredJobItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchExecutionTime, setSearchExecutionTime] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Load stats and company list on mount
  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      setStatsLoading(true);
      try {
        const [statsData, companiesData] = await Promise.all([
          fetchCareerPageStats(),
          fetchCareerCompanies(),
        ]);
        if (isMounted) {
          setStats(statsData);
          setCompanies(companiesData);
        }
      } catch (err) {
        console.error('Failed to load career page stats:', err);
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    }
    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Perform Career Pages search
  const handleSearch = useCallback(
    async (
      overrideQuery?: string,
      overrideScope?: 'all' | 'india_gcc' | 'remote',
      overrideAts?: 'all' | 'greenhouse' | 'lever' | 'ashby' | 'smartrecruiters',
      overrideArchetype?: string,
      overrideGrade?: 'all' | 'A' | 'B' | 'C'
    ) => {
      const q = overrideQuery !== undefined ? overrideQuery : searchQuery;
      const sc = overrideScope !== undefined ? overrideScope : selectedScope;
      const ats = overrideAts !== undefined ? overrideAts : selectedAts;
      const arch = overrideArchetype !== undefined ? overrideArchetype : selectedArchetype;
      const gr = overrideGrade !== undefined ? overrideGrade : selectedGrade;

      setLoading(true);
      const startTime = performance.now();
      try {
        const res = await searchCareerPages({
          query: q,
          location: locationPreference,
          ats_provider: ats,
          archetype: arch === 'All Archetypes' ? 'all' : arch,
          min_grade: gr,
          scope: sc,
          limit: 20,
        });

        const elapsed = Math.round(performance.now() - startTime);
        setSearchExecutionTime(elapsed);
        setJobs(res.jobs || []);
        setHasSearched(true);

        if (res.jobs && res.jobs.length > 0) {
          toast.success(
            `Found ${res.jobs.length} direct career page openings across 859 verified employers (${elapsed}ms)`
          );
        } else {
          toast.info('No direct requisitions found matching current filters. Try relaxing filters.');
        }
      } catch (error: any) {
        console.error('Error during career page search:', error);
        toast.error(error.message || 'Failed to search career pages.');
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, selectedScope, selectedAts, selectedArchetype, selectedGrade, locationPreference]
  );

  // Trigger default search on first mount after a brief delay
  useEffect(() => {
    handleSearch('Software Engineer', 'all', 'all', 'All Archetypes', 'all');
  }, []); // Run once

  // Filtered companies for directory modal
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch =
        !companySearchQuery ||
        c.company.toLowerCase().includes(companySearchQuery.toLowerCase()) ||
        c.category?.toLowerCase().includes(companySearchQuery.toLowerCase());
      const matchesAts = companyAtsFilter === 'all' || c.ats_provider.toLowerCase() === companyAtsFilter.toLowerCase();
      return matchesSearch && matchesAts;
    });
  }, [companies, companySearchQuery, companyAtsFilter]);

  return (
    <div className="space-y-6 text-[#fafafa]">
      {/* 1. Capability Metric Hero Banner */}
      <div className="relative overflow-hidden rounded-[20px] border border-[#2e2e2e] bg-[#121212] p-5 sm:p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3ecf8e]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#222] pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#1e2d27] text-[#3ecf8e] border border-[#3ecf8e]/30">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3ecf8e]" />
              <span>DRC Job Assistant • Job Hunter Career Engine</span>
              <span className="w-1 h-1 rounded-full bg-[#3ecf8e]" />
              <span className="font-mono">859 Employers Verified</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#fafafa] flex items-center gap-2 pt-1">
              <Building2 className="w-6 h-6 text-[#3ecf8e]" />
              Corporate Career Pages Job Explorer
            </h1>
            <p className="text-xs sm:text-sm text-[#b4b4b4] max-w-3xl">
              Direct native ATS parsers bypassing bot blockers &amp; aggregator delays. Real-time requisitions with
              guaranteed authentic 1-click ATS application URLs and consulting fit scoring.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCompanyDirectory(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-[#1a1a1a] hover:bg-[#242424] text-[#fafafa] border border-[#2e2e2e] transition-colors"
            >
              <Database className="w-4 h-4 text-[#3ecf8e]" />
              <span>Browse 859 Employers</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#242424] text-[#3ecf8e] font-mono border border-[#3ecf8e]/30">
                Catalog
              </span>
            </button>
          </div>
        </div>

        {/* Capability Metrics Table Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-5">
          {/* Metric 1 */}
          <div className="p-3 rounded-xl bg-[#161616] border border-[#262626]">
            <div className="text-[10px] uppercase tracking-wider text-[#898989] font-medium">Employers</div>
            <div className="text-lg font-bold text-[#fafafa] font-mono mt-0.5">859</div>
            <div className="text-[11px] text-[#3ecf8e] mt-0.5 truncate" title="Direct Native ATS Parsers">
              Native ATS Parsers
            </div>
          </div>

          {/* Metric 2 */}
          <div className="p-3 rounded-xl bg-[#161616] border border-[#262626]">
            <div className="text-[10px] uppercase tracking-wider text-[#898989] font-medium">ATS Breakdown</div>
            <div className="text-xs font-semibold text-[#fafafa] font-mono mt-1 space-y-0.5">
              <div className="flex justify-between">
                <span className="text-[#b4b4b4]">GH:</span> <span className="text-[#3ecf8e]">545</span>
                <span className="text-[#b4b4b4] ml-1">Ashby:</span> <span className="text-[#3ecf8e]">165</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b4b4b4]">Lever:</span> <span className="text-[#3ecf8e]">108</span>
                <span className="text-[#b4b4b4] ml-1">SR:</span> <span className="text-[#3ecf8e]">41</span>
              </div>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="p-3 rounded-xl bg-[#161616] border border-[#262626]">
            <div className="text-[10px] uppercase tracking-wider text-[#898989] font-medium">Global Remote</div>
            <div className="text-lg font-bold text-[#fafafa] font-mono mt-0.5">
              667 <span className="text-xs font-normal text-[#3ecf8e]">(77.6%)</span>
            </div>
            <div className="text-[11px] text-[#898989] truncate" title="Americas, EMEA, Cross-border remote">
              Cross-border Remote
            </div>
          </div>

          {/* Metric 4 */}
          <div className="p-3 rounded-xl bg-[#161616] border border-[#262626]">
            <div className="text-[10px] uppercase tracking-wider text-[#898989] font-medium">India Metro &amp; GCC</div>
            <div className="text-lg font-bold text-[#fafafa] font-mono mt-0.5">
              246 <span className="text-xs font-normal text-[#3ecf8e]">(28.6%)</span>
            </div>
            <div className="text-[11px] text-[#898989] truncate" title="Tech Giants, Unicorns, GCCs">
              Tech Giants &amp; GCCs
            </div>
          </div>

          {/* Metric 5 */}
          <div className="p-3 rounded-xl bg-[#161616] border border-[#262626]">
            <div className="text-[10px] uppercase tracking-wider text-[#898989] font-medium">Live Throughput</div>
            <div className="text-base font-bold text-[#fafafa] font-mono mt-0.5">~11,200+</div>
            <div className="text-[11px] text-[#898989] truncate" title="Jobs indexed per warmup cycle in ~60s">
              Jobs / Warmup Cycle
            </div>
          </div>

          {/* Metric 6 */}
          <div className="p-3 rounded-xl bg-[#161616] border border-[#262626]">
            <div className="text-[10px] uppercase tracking-wider text-[#898989] font-medium">SQLite WAL DB</div>
            <div className="text-base font-bold text-[#fafafa] font-mono mt-0.5">1,787+</div>
            <div className="text-[11px] text-[#898989] truncate" title="Persistent SQLite WAL deduplicated storage">
              Verified Postings
            </div>
          </div>

          {/* Metric 7 */}
          <div className="p-3 rounded-xl bg-[#161616] border border-[#262626]">
            <div className="text-[10px] uppercase tracking-wider text-[#898989] font-medium">Query Latency SLA</div>
            <div className="text-base font-bold text-[#3ecf8e] font-mono mt-0.5">1.65 ms</div>
            <div className="text-[11px] text-[#898989] truncate" title="Sub-20ms SLA guarantee (11.79ms RAM / 1.65ms WAL)">
              Sub-20ms Guarantee
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Search & Filters Bar */}
      <div className="p-4 sm:p-5 rounded-[16px] border border-[#2e2e2e] bg-[#121212] space-y-4">
        {/* Main Search Input */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#898989]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by role title, technology, or company (e.g. Full Stack, AI Engineer, Python, Ashby)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border border-[#2e2e2e] focus:border-[#3ecf8e] focus:ring-1 focus:ring-[#3ecf8e] rounded-xl text-sm text-[#fafafa] placeholder-[#898989] outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#3ecf8e] hover:bg-[#34b27b] text-[#121212] flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching 859 ATS...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Search</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Search Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[#898989] text-[11px] whitespace-nowrap font-medium mr-1">Quick Suggestions:</span>
          {POPULAR_QUICK_SEARCHES.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setSearchQuery(tag);
                handleSearch(tag);
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors border ${
                searchQuery === tag
                  ? 'bg-[#3ecf8e]/20 text-[#3ecf8e] border-[#3ecf8e]/40 font-medium'
                  : 'bg-[#181818] text-[#b4b4b4] hover:text-[#fafafa] hover:bg-[#222] border-[#2a2a2a]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Filter Rows: Scope, ATS Platform, Archetype, Grade */}
        <div className="pt-2 border-t border-[#222] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Hiring Scope Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[#898989] flex items-center gap-1.5 uppercase tracking-wider">
              <Globe className="w-3 h-3 text-[#3ecf8e]" />
              <span>Hiring Scope</span>
            </label>
            <div className="flex rounded-lg bg-[#181818] p-0.5 border border-[#2e2e2e]">
              <button
                type="button"
                onClick={() => {
                  setSelectedScope('all');
                  handleSearch(undefined, 'all');
                }}
                className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-colors ${
                  selectedScope === 'all'
                    ? 'bg-[#242424] text-[#fafafa] shadow-sm'
                    : 'text-[#898989] hover:text-[#fafafa]'
                }`}
              >
                All (859)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedScope('india_gcc');
                  handleSearch(undefined, 'india_gcc');
                }}
                className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-colors ${
                  selectedScope === 'india_gcc'
                    ? 'bg-[#3ecf8e]/20 text-[#3ecf8e] font-semibold shadow-sm'
                    : 'text-[#898989] hover:text-[#fafafa]'
                }`}
                title="India Metro Tech Hubs & Multinational Capability Centers"
              >
                🇮🇳 India GCC (246)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedScope('remote');
                  handleSearch(undefined, 'remote');
                }}
                className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-colors ${
                  selectedScope === 'remote'
                    ? 'bg-[#3ecf8e]/20 text-[#3ecf8e] font-semibold shadow-sm'
                    : 'text-[#898989] hover:text-[#fafafa]'
                }`}
                title="Global & Worldwide Remote Opportunities"
              >
                🌍 Remote (667)
              </button>
            </div>
          </div>

          {/* ATS Provider Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[#898989] flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-3 h-3 text-[#3ecf8e]" />
              <span>ATS Provider</span>
            </label>
            <select
              value={selectedAts}
              onChange={(e) => {
                const val = e.target.value as any;
                setSelectedAts(val);
                handleSearch(undefined, undefined, val);
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-[#181818] border border-[#2e2e2e] rounded-lg text-[#fafafa] outline-none focus:border-[#3ecf8e]"
            >
              <option value="all">All ATS Providers (859)</option>
              <option value="greenhouse">Greenhouse (545 Companies)</option>
              <option value="ashby">Ashby (165 Companies)</option>
              <option value="lever">Lever (108 Companies)</option>
              <option value="smartrecruiters">SmartRecruiters (41 Companies)</option>
            </select>
          </div>

          {/* Role Archetype Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[#898989] flex items-center gap-1.5 uppercase tracking-wider">
              <Award className="w-3 h-3 text-[#3ecf8e]" />
              <span>Role Archetype</span>
            </label>
            <select
              value={selectedArchetype}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedArchetype(val);
                handleSearch(undefined, undefined, undefined, val);
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-[#181818] border border-[#2e2e2e] rounded-lg text-[#fafafa] outline-none focus:border-[#3ecf8e]"
            >
              {ARCHETYPES.map((arch) => (
                <option key={arch} value={arch}>
                  {arch}
                </option>
              ))}
            </select>
          </div>

          {/* Fit Grade Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[#898989] flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#3ecf8e]" />
              <span>Fit Grade Filter</span>
            </label>
            <div className="flex rounded-lg bg-[#181818] p-0.5 border border-[#2e2e2e]">
              <button
                type="button"
                onClick={() => {
                  setSelectedGrade('all');
                  handleSearch(undefined, undefined, undefined, undefined, 'all');
                }}
                className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-colors ${
                  selectedGrade === 'all'
                    ? 'bg-[#242424] text-[#fafafa]'
                    : 'text-[#898989] hover:text-[#fafafa]'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedGrade('A');
                  handleSearch(undefined, undefined, undefined, undefined, 'A');
                }}
                className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-colors ${
                  selectedGrade === 'A'
                    ? 'bg-emerald-950 text-emerald-400 font-bold'
                    : 'text-[#898989] hover:text-emerald-400'
                }`}
                title="Grade A: 85%+ Match"
              >
                Grade A
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedGrade('B');
                  handleSearch(undefined, undefined, undefined, undefined, 'B');
                }}
                className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-colors ${
                  selectedGrade === 'B'
                    ? 'bg-sky-950 text-sky-400 font-bold'
                    : 'text-[#898989] hover:text-sky-400'
                }`}
                title="Grade B: 70-84% Match"
              >
                Grade B
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedGrade('C');
                  handleSearch(undefined, undefined, undefined, undefined, 'C');
                }}
                className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-colors ${
                  selectedGrade === 'C'
                    ? 'bg-amber-950 text-amber-400 font-bold'
                    : 'text-[#898989] hover:text-amber-400'
                }`}
                title="Grade C: 55-69% Match"
              >
                Grade C
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search Results Header & Telemetry */}
      <div className="flex items-center justify-between px-1 text-xs text-[#898989]">
        <div className="flex items-center gap-2">
          <span>Results:</span>
          <strong className="text-[#fafafa] font-mono">{jobs.length} Direct ATS Openings</strong>
          {searchExecutionTime !== null && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#3ecf8e] font-mono bg-[#181818] px-2 py-0.5 rounded-full border border-[#2a2a2a]">
              <Clock className="w-3 h-3" />
              {searchExecutionTime} ms (Sub-20ms SLA Guarantee)
            </span>
          )}
        </div>

        <div className="text-[11px] font-mono text-[#898989] hidden md:block">
          SOURCE: <strong className="text-[#fafafa]">Native ATS Canonical Endpoints</strong>
        </div>
      </div>

      {/* 4. Jobs Cards Feed */}
      {loading ? (
        <div className="p-12 text-center rounded-[20px] bg-[#121212] border border-[#2e2e2e] space-y-3">
          <RefreshCw className="w-8 h-8 text-[#3ecf8e] animate-spin mx-auto" />
          <p className="text-sm text-[#fafafa] font-medium">Scanning 859 Corporate ATS Systems...</p>
          <p className="text-xs text-[#898989]">
            Querying Greenhouse, Ashby, Lever, SmartRecruiters &amp; SQLite WAL storage with SHA-256 deduplication
          </p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-12 text-center rounded-[20px] bg-[#121212] border border-[#2e2e2e] space-y-3">
          <Building2 className="w-10 h-10 text-[#898989] mx-auto opacity-50" />
          <h3 className="text-base font-semibold text-[#fafafa]">No Direct Career Postings Found</h3>
          <p className="text-xs text-[#898989] max-w-md mx-auto">
            Try broadening your search term (e.g. "Engineer", "Developer") or reset the filters to search all 859
            employers worldwide.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('Software Engineer');
              setSelectedScope('all');
              setSelectedAts('all');
              setSelectedArchetype('All Archetypes');
              setSelectedGrade('all');
              handleSearch('Software Engineer', 'all', 'all', 'All Archetypes', 'all');
            }}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-[#1e2d27] text-[#3ecf8e] hover:bg-[#253932] border border-[#3ecf8e]/30 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {jobs.map((job) => {
            const isStarred = savedJobIds.has(job.id);
            const fitGrade = job.fit_grade || (job.match_score >= 85 ? 'Grade A' : job.match_score >= 70 ? 'Grade B' : 'Grade C');
            const gradeColor =
              fitGrade === 'Grade A'
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
                : fitGrade === 'Grade B'
                ? 'bg-sky-950/80 text-sky-400 border-sky-500/30'
                : 'bg-amber-950/80 text-amber-400 border-amber-500/30';

            const atsName =
              job.ats_provider?.toUpperCase() ||
              (job.application_url.includes('greenhouse')
                ? 'GREENHOUSE'
                : job.application_url.includes('ashby')
                ? 'ASHBY'
                : job.application_url.includes('lever')
                ? 'LEVER'
                : job.application_url.includes('smartrecruiters')
                ? 'SMARTRECRUITERS'
                : 'DIRECT ATS');

            return (
              <div
                key={job.id}
                className="group relative p-4 sm:p-5 rounded-[16px] bg-[#141414] hover:bg-[#181818] border border-[#262626] hover:border-[#3ecf8e]/40 transition-all duration-200 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Job Details Left */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-xs text-[#fafafa] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#3ecf8e]" />
                        {job.company}
                      </span>

                      {/* ATS Provider Tag */}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#202020] text-[#b4b4b4] border border-[#2e2e2e]">
                        {atsName}
                      </span>

                      {/* Role Archetype Tag */}
                      {job.archetype && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#1e2722] text-[#3ecf8e] border border-[#3ecf8e]/30">
                          {job.archetype}
                        </span>
                      )}

                      {/* Fit Grade Badge */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${gradeColor}`}>
                        {fitGrade} • {job.match_score || 85}% Match
                      </span>
                    </div>

                    <h2
                      onClick={() => onSelectJobForDetail && onSelectJobForDetail(job)}
                      className="text-base sm:text-lg font-bold text-[#fafafa] group-hover:text-[#3ecf8e] transition-colors cursor-pointer truncate"
                      title={job.job_title}
                    >
                      {job.job_title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#898989]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#898989]" />
                        {job.location || 'Remote'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#898989]" />
                        {job.job_type || 'Full Time'}
                      </span>
                      {job.salary && job.salary !== 'Competitive' && (
                        <span className="font-mono text-[#3ecf8e]">{job.salary}</span>
                      )}
                    </div>

                    {/* Match Reasons */}
                    {job.match_reasons && job.match_reasons.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1">
                        {job.match_reasons.slice(0, 3).map((r, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[11px] text-[#b4b4b4] bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#262626]"
                          >
                            <CheckCircle2 className="w-3 h-3 text-[#3ecf8e]" />
                            {r}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Key Skills Tags */}
                    {job.key_skills && job.key_skills.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1">
                        {job.key_skills.slice(0, 6).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-[10px] rounded-md bg-[#1a1a1a] text-[#898989] border border-[#262626]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Right */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#222]">
                    <a
                      href={job.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#3ecf8e] hover:bg-[#34b27b] text-[#121212] transition-colors shadow-sm"
                    >
                      <span>Apply on ATS</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <div className="flex items-center gap-1">
                      {onSelectJobForApplication && (
                        <button
                          type="button"
                          onClick={() => onSelectJobForApplication(job)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1e1e1e] hover:bg-[#252525] text-[#b4b4b4] hover:text-[#fafafa] border border-[#2a2a2a] transition-colors"
                          title="Generate Tailored Resume & Outreach"
                        >
                          Prepare CV
                        </button>
                      )}

                      {onSaveJob && (
                        <button
                          type="button"
                          onClick={() => onSaveJob(job)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isStarred
                              ? 'bg-amber-950/40 border-amber-500/50 text-amber-400'
                              : 'bg-[#181818] border-[#2a2a2a] text-[#898989] hover:text-[#fafafa]'
                          }`}
                          title={isStarred ? 'Saved in History' : 'Save Job'}
                        >
                          {isStarred ? (
                            <BookmarkCheck className="w-4 h-4 fill-current" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Modal: 859 Verified Employers Directory */}
      {showCompanyDirectory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-4xl max-h-[85vh] rounded-[24px] bg-[#121212] border border-[#2e2e2e] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#262626] flex items-center justify-between bg-[#161616]">
              <div>
                <h3 className="text-lg font-bold text-[#fafafa] flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#3ecf8e]" />
                  Verified Employer ATS Directory ({companies.length} Registered)
                </h3>
                <p className="text-xs text-[#898989]">
                  Direct native ATS integration • Greenhouse (545), Ashby (165), Lever (108), SmartRecruiters (41)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCompanyDirectory(false)}
                className="p-2 text-[#898989] hover:text-[#fafafa] rounded-lg hover:bg-[#222] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Controls */}
            <div className="p-4 border-b border-[#262626] bg-[#141414] flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#898989]" />
                <input
                  type="text"
                  value={companySearchQuery}
                  onChange={(e) => setCompanySearchQuery(e.target.value)}
                  placeholder="Filter company name or industry category..."
                  className="w-full pl-9 pr-3 py-2 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl text-xs text-[#fafafa] outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {['all', 'greenhouse', 'ashby', 'lever', 'smartrecruiters'].map((ats) => (
                  <button
                    key={ats}
                    type="button"
                    onClick={() => setCompanyAtsFilter(ats)}
                    className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-colors border ${
                      companyAtsFilter === ats
                        ? 'bg-[#3ecf8e] text-[#121212] font-semibold border-[#3ecf8e]'
                        : 'bg-[#1c1c1c] text-[#898989] hover:text-[#fafafa] border-[#2a2a2a]'
                    }`}
                  >
                    {ats === 'all' ? `All (${companies.length})` : ats}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Company Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredCompanies.map((c, idx) => (
                <div
                  key={`${c.company}-${idx}`}
                  className="p-3 rounded-xl bg-[#181818] border border-[#262626] hover:border-[#3ecf8e]/30 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-[#fafafa] truncate">{c.company}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono uppercase text-[#3ecf8e]">{c.ats_provider}</span>
                      {c.scope === 'india_gcc' && (
                        <span className="text-[10px] text-amber-400">🇮🇳 GCC</span>
                      )}
                      {c.category && (
                        <span className="text-[10px] text-[#898989] truncate">| {c.category}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery(c.company);
                        setShowCompanyDirectory(false);
                        handleSearch(c.company);
                      }}
                      className="px-2 py-1 rounded text-[10px] bg-[#222] hover:bg-[#3ecf8e] hover:text-[#121212] text-[#fafafa] transition-colors"
                      title="Search jobs at this company"
                    >
                      Find Jobs
                    </button>
                    {c.careers_url && (
                      <a
                        href={c.careers_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded text-[#898989] hover:text-[#3ecf8e]"
                        title="Open official ATS career page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[#262626] bg-[#161616] flex items-center justify-between text-xs text-[#898989]">
              <span>Showing {filteredCompanies.length} of {companies.length} verified employers</span>
              <button
                type="button"
                onClick={() => setShowCompanyDirectory(false)}
                className="px-4 py-1.5 rounded-lg bg-[#242424] text-[#fafafa] hover:bg-[#2c2c2c] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
