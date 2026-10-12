import React, { useState, useMemo } from 'react';
import {
  Archive,
  Search,
  Filter,
  Layers,
  ArrowUpDown,
  Compass,
  CheckCircle2,
  Bookmark,
  ChevronDown,
} from 'lucide-react';
import { DiscoveredJobItem } from '../../lib/drcDiscoveryApi';
import { CandidateParsedProfile } from '../../lib/applicationApi';
import { JobCardNaukri } from './JobCardNaukri';
import { getActiveTheme } from '../../config/themeConfig';

export interface DiscoveredArchiveViewProps {
  allJobs: DiscoveredJobItem[];
  savedJobIds: string[];
  candidateProfile?: CandidateParsedProfile | null;
  onToggleStar: (job: DiscoveredJobItem) => void;
  onViewDetails: (job: DiscoveredJobItem) => void;
  onApplyNow?: (job: DiscoveredJobItem) => void;
  onToggleStatus: (job: DiscoveredJobItem) => void;
  onSaveRemark: (job: DiscoveredJobItem, remark: string) => void;
  onExploreJobs: () => void;
}

export const DiscoveredArchiveView: React.FC<DiscoveredArchiveViewProps> = ({
  allJobs,
  savedJobIds,
  candidateProfile,
  onToggleStar,
  onViewDetails,
  onApplyNow,
  onToggleStatus,
  onSaveRemark,
  onExploreJobs,
}) => {
  const theme = getActiveTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'career_page' | 'linkedin'>('all');
  const [sortOrder, setSortOrder] = useState<'latest' | 'ats'>('latest');
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(25);

  // Filter and sort the 1000+ jobs
  const filteredJobs = useMemo(() => {
    let list = Array.isArray(allJobs) ? [...allJobs] : [];

    // 1. Channel Filter
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

    // 2. Saved Filter
    if (showSavedOnly) {
      const savedSet = new Set(savedJobIds);
      list = list.filter((j) => savedSet.has(j.id));
    }

    // 3. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((j) => {
        const title = (j.job_title || '').toLowerCase();
        const company = (j.company || '').toLowerCase();
        const location = (j.location || '').toLowerCase();
        const skills = Array.isArray(j.key_skills) ? j.key_skills.join(' ').toLowerCase() : '';
        return title.includes(q) || company.includes(q) || location.includes(q) || skills.includes(q);
      });
    }

    // 4. Sort: Latest to Oldest by default
    if (sortOrder === 'ats' && candidateProfile) {
      list.sort((a, b) => (b.ats_score || 0) - (a.ats_score || 0));
    } else {
      // Latest to Oldest (by discovered_at timestamp or ID)
      list.sort((a, b) => {
        const dateA = a.discovered_at ? new Date(a.discovered_at).getTime() : 0;
        const dateB = b.discovered_at ? new Date(b.discovered_at).getTime() : 0;
        if (dateB !== dateA) return dateB - dateA;
        return String(b.id || '').localeCompare(String(a.id || ''));
      });
    }

    return list;
  }, [allJobs, selectedChannel, showSavedOnly, searchQuery, sortOrder, candidateProfile, savedJobIds]);

  const displayedJobs = useMemo(() => {
    return filteredJobs.slice(0, visibleCount);
  }, [filteredJobs, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 25);
  };

  return (
    <div className="space-y-6 text-white max-w-7xl mx-auto">
      {/* Top Banner / Repository Header */}
      <div className={`${theme.cardClass} rounded-2xl border ${theme.cardBorderClass} p-5 sm:p-6 shadow-lg`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-9 h-9 rounded-xl bg-[#00C896]/15 border border-[#00C896]/35 flex items-center justify-center text-[#00C896]">
                <Archive className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Discovered Jobs Repository
              </h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#00C896]/20 text-[#00C896] border border-[#00C896]/40">
                {allJobs.length > 0 ? `${allJobs.length}+ Active Requisitions` : '1000+ Active Requisitions'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
              Complete archive of all verified opportunities harvested across Direct Career Portals and LinkedIn. Sorted from <strong>latest to oldest</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onExploreJobs}
              className="px-4 py-2 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Compass className="w-4 h-4" />
              <span>Back to Discover Search</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-5 pt-5 border-t border-[#262830] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(25);
              }}
              placeholder="Filter by title, company, skills, or city..."
              className={`w-full pl-9 pr-4 py-2 rounded-xl ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-[#00C896] transition-colors`}
            />
          </div>

          {/* Channel Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className={`flex items-center ${theme.innerBoxClass} p-1 rounded-xl border ${theme.innerBoxBorderClass} gap-1`}>
              <button
                type="button"
                onClick={() => {
                  setSelectedChannel('all');
                  setVisibleCount(25);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedChannel === 'all'
                    ? 'bg-[#00C896] text-[#0A0A0A] font-bold shadow-sm'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                All Sources
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedChannel('career_page');
                  setVisibleCount(25);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedChannel === 'career_page'
                    ? 'bg-[#00C896] text-[#0A0A0A] font-bold shadow-sm'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                Career Pages
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedChannel('linkedin');
                  setVisibleCount(25);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedChannel === 'linkedin'
                    ? 'bg-[#00C896] text-[#0A0A0A] font-bold shadow-sm'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                LinkedIn
              </button>
            </div>

            {/* Saved filter toggle */}
            <button
              type="button"
              onClick={() => {
                setShowSavedOnly((prev) => !prev);
                setVisibleCount(25);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 border ${
                showSavedOnly
                  ? 'bg-amber-400 text-[#0A0A0A] border-amber-400 font-bold shadow-sm'
                  : `${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-zinc-300 hover:text-amber-300`
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${showSavedOnly ? 'fill-black text-black' : 'text-amber-400'}`} />
              <span>Saved ({savedJobIds.length})</span>
            </button>

            {/* Sort Toggle (Latest vs ATS) */}
            {candidateProfile && (
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'latest' ? 'ats' : 'latest')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  sortOrder === 'ats'
                    ? 'bg-[#00C896]/20 text-[#00C896] border-[#00C896]/40 font-bold'
                    : `${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-zinc-300`
                }`}
                title="Toggle between Latest and ATS match score order"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>{sortOrder === 'latest' ? 'Sorted: Latest' : 'Sorted: ATS Match'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header Info */}
      <div className="flex items-center justify-between text-xs text-zinc-300 px-1">
        <span>
          Showing <strong>{displayedJobs.length}</strong> of <strong>{filteredJobs.length}</strong> requisitions
          {selectedChannel !== 'all' && ` in ${selectedChannel === 'career_page' ? 'Direct Career Portals' : 'LinkedIn'}`}
        </span>
        <span className="text-zinc-400">
          Order: <strong>Latest Discovered to Oldest</strong>
        </span>
      </div>

      {/* Jobs Feed */}
      {displayedJobs.length > 0 ? (
        <div className="space-y-4">
          {displayedJobs.map((job) => (
            <JobCardNaukri
              key={job.id}
              job={job}
              isSaved={savedJobIds.includes(job.id)}
              hasResume={!!candidateProfile}
              onToggleStar={onToggleStar}
              onViewDetails={onViewDetails}
              onApplyNow={onApplyNow || onViewDetails}
              onToggleStatus={onToggleStatus}
              onSaveRemark={onSaveRemark}
            />
          ))}

          {/* Show More Button */}
          {visibleCount < filteredJobs.length && (
            <div className={`pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 ${theme.cardClass} rounded-2xl ${theme.cardBorderClass} p-4 shadow-md`}>
              <div className="text-xs text-zinc-300">
                <span>Showing {displayedJobs.length} of {filteredJobs.length} verified roles in repository</span>
              </div>
              <button
                type="button"
                onClick={handleLoadMore}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <ChevronDown className="w-4 h-4" />
                <span>Show Next 25 Roles ({filteredJobs.length - visibleCount} remaining)</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className={`${theme.cardClass} rounded-2xl border border-dashed ${theme.cardBorderClass} p-12 text-center shadow-md`}>
          <div className={`w-14 h-14 rounded-2xl ${theme.innerBoxClass} ${theme.innerBoxBorderClass} flex items-center justify-center text-[#00C896] mx-auto mb-4`}>
            <Archive className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Requisitions Found</h3>
          <p className="text-sm text-zinc-300 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
            {searchQuery
              ? `No roles matched your filter "${searchQuery}". Try clearing the search or changing the channel filter.`
              : 'The repository is ready. Click below to return to the active discovery search.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedChannel('all');
              setShowSavedOnly(false);
            }}
            className="px-6 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-[#0A0A0A] text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Reset Repository Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DiscoveredArchiveView;
