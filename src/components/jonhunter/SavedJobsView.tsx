import React, { useState } from 'react';
import {
  Bookmark,
  Search,
  Compass,
} from 'lucide-react';
import { DiscoveredJobItem } from '../../lib/drcDiscoveryApi';
import { JobCardNaukri } from './JobCardNaukri';

export interface SavedJobsViewProps {
  allJobs: DiscoveredJobItem[];
  savedJobIds: string[];
  onToggleStar: (job: DiscoveredJobItem) => void;
  onViewDetails: (job: DiscoveredJobItem) => void;
  onApplyNow?: (job: DiscoveredJobItem) => void;
  onToggleStatus: (job: DiscoveredJobItem) => void;
  onSaveRemark: (job: DiscoveredJobItem, remark: string) => void;
  onExploreJobs: () => void;
}

export const SavedJobsView: React.FC<SavedJobsViewProps> = ({
  allJobs,
  savedJobIds,
  onToggleStar,
  onViewDetails,
  onApplyNow,
  onToggleStatus,
  onSaveRemark,
  onExploreJobs,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const savedJobs = (allJobs || []).filter((job) => job && savedJobIds && savedJobIds.includes(job.id));

  const filteredSavedJobs = savedJobs.filter((job) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    const title = typeof job?.job_title === 'string' ? job.job_title.toLowerCase() : '';
    const comp = typeof job?.company === 'string' ? job.company.toLowerCase() : '';
    const loc = typeof job?.location === 'string' ? job.location.toLowerCase() : '';
    return title.includes(q) || comp.includes(q) || loc.includes(q);
  });

  return (
    <div className="space-y-6 text-white">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#262830]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400">
              <Bookmark className="w-4 h-4 fill-amber-400" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Saved Opportunities</h2>
          </div>
          <p className="text-sm text-zinc-300 mt-1">
            {savedJobs.length} {savedJobs.length === 1 ? 'role' : 'roles'} saved for your application pipeline.
          </p>
        </div>

        {/* Filter Input */}
        {savedJobs.length > 0 && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search saved roles..."
              className="w-full bg-[#1C1E24] border border-[#2D303B] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-[#00C896]"
            />
          </div>
        )}
      </div>

      {/* Content */}
      {filteredSavedJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredSavedJobs.map((job) => (
            <JobCardNaukri
              key={job.id}
              job={job}
              isSaved={true}
              onToggleStar={onToggleStar}
              onViewDetails={onViewDetails}
              onApplyNow={onApplyNow || onViewDetails}
              onToggleStatus={onToggleStatus}
              onSaveRemark={onSaveRemark}
            />
          ))}
        </div>
      ) : savedJobs.length > 0 ? (
        <div className="bg-[#141519] rounded-2xl border border-[#262830] p-12 text-center">
          <p className="text-sm text-zinc-300">No saved jobs matching "{filterQuery}"</p>
          <button
            type="button"
            onClick={() => setFilterQuery('')}
            className="mt-3 text-xs font-bold text-[#00C896] hover:underline cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="bg-[#141519] rounded-2xl border border-dashed border-[#262830] p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1C1E24] border border-[#2D303B] flex items-center justify-center text-zinc-300 mx-auto mb-4">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Saved Jobs Yet</h3>
          <p className="text-sm text-zinc-300 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
            Click the bookmark icon on any job card in Discover to save it for quick review and direct application.
          </p>
          <button
            type="button"
            onClick={onExploreJobs}
            className="px-5 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-[#0A0A0A] text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Opportunities</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedJobsView;
