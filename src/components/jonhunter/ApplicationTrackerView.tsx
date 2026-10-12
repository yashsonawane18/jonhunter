import React from 'react';
import {
  ClipboardList,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Compass,
  AlertCircle,
} from 'lucide-react';
import { DiscoveredJobItem } from '../../lib/drcDiscoveryApi';

export interface ApplicationTrackerViewProps {
  allJobs: DiscoveredJobItem[];
  savedJobIds: string[];
  onToggleStar: (job: DiscoveredJobItem) => void;
  onViewDetails: (job: DiscoveredJobItem) => void;
  onToggleStatus: (job: DiscoveredJobItem) => void;
  onSaveRemark: (job: DiscoveredJobItem, remark: string) => void;
  onExploreJobs: () => void;
  onOpenFullTracker?: () => void;
  isAuthenticated?: boolean;
}

export const ApplicationTrackerView: React.FC<ApplicationTrackerViewProps> = ({
  allJobs,
  onViewDetails,
  onExploreJobs,
  onOpenFullTracker,
  isAuthenticated = false,
}) => {
  const appliedJobs = (allJobs || []).filter(
    (job) => job && typeof job.status === 'string' && job.status.toLowerCase().includes('applied')
  );

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#262830]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00C896]/15 border border-[#00C896]/30 flex items-center justify-center text-[#00C896]">
              <ClipboardList className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Application Pipeline</h2>
          </div>
          <p className="text-sm text-zinc-300 mt-1">
            Track requisition status, interview responses, and direct recruiter contacts.
          </p>
        </div>

        {onOpenFullTracker && (
          <button
            type="button"
            onClick={onOpenFullTracker}
            className="px-4 py-2 rounded-xl bg-[#20222A] hover:bg-[#2A2D38] text-white border border-[#343744] hover:border-[#4B4F60] text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <span>Open Executive Dashboard Tracker</span>
            <ArrowRight className="w-4 h-4 text-[#00C896]" />
          </button>
        )}
      </div>

      {/* Auth Notice if not logged in */}
      {!isAuthenticated && (
        <div className="bg-[#1C1E24] border border-amber-500/35 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            Sign in to sync your application notes and interview pipeline across all devices.
          </span>
        </div>
      )}

      {/* Applied Jobs List */}
      {appliedJobs.length > 0 ? (
        <div className="space-y-3">
          {appliedJobs.map((job) => (
            <div
              key={job.id}
              className="bg-[#141519] hover:bg-[#181A20] border border-[#262830] hover:border-[#00C896]/50 rounded-2xl p-5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-zinc-300">{job.company}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[#00C896]/15 text-[#00C896] font-semibold border border-[#00C896]/30">
                    <CheckCircle2 className="w-3 h-3 text-[#00C896]" />
                    <span>Applied</span>
                  </span>
                </div>
                <h4
                  onClick={() => onViewDetails(job)}
                  className="text-base font-bold text-white hover:text-[#00C896] transition-colors cursor-pointer truncate"
                >
                  {job.job_title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                  <span>{job.location || 'Pan-India'}</span>
                  <span>&bull;</span>
                  <span>{job.discovered_at || 'Recently applied'}</span>
                </div>
                {job.remarks && (
                  <p className="mt-2 text-xs text-zinc-200 bg-[#1C1E24] border border-[#2D303B] rounded-lg p-2.5">
                    Note: "{job.remarks}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onViewDetails(job)}
                  className="px-4 py-2 rounded-xl bg-[#20222A] hover:bg-[#2A2D38] text-white border border-[#343744] hover:border-[#4B4F60] text-xs font-semibold transition-colors cursor-pointer"
                >
                  View Details
                </button>
                {job.application_url && (
                  <a
                    href={job.application_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-[#20222A] hover:bg-[#2A2D38] text-zinc-200 hover:text-white border border-[#343744] hover:border-[#4B4F60] transition-colors"
                    title="Open career portal link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#141519] rounded-2xl border border-dashed border-[#262830] p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1C1E24] border border-[#2D303B] flex items-center justify-center text-zinc-300 mx-auto mb-4">
            <ClipboardList className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Applied Requisitions Tracked</h3>
          <p className="text-sm text-zinc-300 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
            When you apply to jobs via DRC or mark them as "Applied", they will appear here with real-time status and recruiter follow-ups.
          </p>
          <button
            type="button"
            onClick={onExploreJobs}
            className="px-5 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-[#0A0A0A] text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Roles to Apply</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ApplicationTrackerView;
