import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Bookmark,
  Briefcase,
  IndianRupee,
  MapPin,
} from 'lucide-react';
import { DiscoveredJobItem, searchInstantJobs } from '../../lib/drcDiscoveryApi';
import { CompanyLogo } from './CompanyLogo';

export interface RecommendedJobsSectionProps {
  onApplyRoleToSearch: (role: string, seniority?: 'entry' | 'intermediate' | 'senior' | 'lead' | 'manager') => void;
  onSelectJobForDetail: (job: DiscoveredJobItem) => void;
  savedJobIds: string[];
  onToggleStar: (job: DiscoveredJobItem) => void;
}

// 6 required roles for experienced candidates (DRC does not apply for freshers)
export const RECOMMENDED_ROLE_TABS = [
  {
    id: 'ai_ml',
    name: 'AI/ML & GenAI',
    keyword: 'GenAI Machine Learning LLM',
    tag: 'High Growth',
    seniority: 'senior' as const,
  },
  {
    id: 'python_dev',
    name: 'Python Developer',
    keyword: 'Python Developer FastAPI Django',
    tag: 'Hot Demand',
    seniority: 'intermediate' as const,
  },
  {
    id: 'data_analyst',
    name: 'Data Analyst',
    keyword: 'Data Analyst BI SQL',
    tag: 'Consulting Fit',
    seniority: 'intermediate' as const,
  },
  {
    id: 'fullstack',
    name: 'Full Stack Developer',
    keyword: 'Full Stack Developer React Node',
    tag: 'Top Volume',
    seniority: 'intermediate' as const,
  },
  {
    id: 'devops_cloud',
    name: 'Cloud & DevOps',
    keyword: 'DevOps Kubernetes AWS Cloud',
    tag: 'High Salary',
    seniority: 'senior' as const,
  },
  {
    id: 'java_microservices',
    name: 'Java & Microservices',
    keyword: 'Java Spring Boot Microservices',
    tag: 'Enterprise Fit',
    seniority: 'senior' as const,
  },
];

export const RecommendedJobsSection: React.FC<RecommendedJobsSectionProps> = ({
  onApplyRoleToSearch,
  onSelectJobForDetail,
  savedJobIds,
  onToggleStar,
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('ai_ml');
  const [roleJobs, setRoleJobs] = useState<DiscoveredJobItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const activeRoleObj =
    RECOMMENDED_ROLE_TABS.find((t) => t.id === selectedRoleId) || RECOMMENDED_ROLE_TABS[0];

  // Fetch real jobs when role tab changes
  useEffect(() => {
    let isCurrent = true;
    const fetchRoleRecommendations = async () => {
      setLoading(true);
      try {
        const res = await searchInstantJobs({
          query: activeRoleObj.keyword,
          location: 'All India (Remote & Nationwide)',
          seniority: activeRoleObj.seniority,
          limit: 6,
        });

        if (isCurrent) {
          if (res && res.jobs && res.jobs.length > 0) {
            setRoleJobs(res.jobs.slice(0, 6));
          } else {
            setRoleJobs([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch recommendations for role:', err);
        if (isCurrent) setRoleJobs([]);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchRoleRecommendations();
    return () => {
      isCurrent = false;
    };
  }, [selectedRoleId, activeRoleObj.keyword, activeRoleObj.seniority]);

  return (
    <section className="bg-[#101115] border border-[#262830] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C1E24] text-[#00C896] text-xs font-semibold uppercase tracking-wider mb-2 border border-[#2D303B]">
            <Sparkles className="w-3.5 h-3.5 text-[#00C896]" />
            <span>Curated For Experienced Professionals</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Jobs We Think You'll Love
          </h2>
          <p className="mt-1 text-sm text-zinc-300 max-w-xl">
            Real openings automatically matched to your domain from direct career portals & verified hiring batches.
          </p>
        </div>

        {/* View All In Search Action (Clean solid emerald) */}
        <button
          type="button"
          onClick={() => onApplyRoleToSearch(activeRoleObj.keyword, activeRoleObj.seniority)}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#00C896] hover:text-[#00E5AA] transition-colors cursor-pointer shrink-0"
        >
          <span>Explore all {activeRoleObj.name} roles</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 6 Role Pills Navigation (Clean, solid contrast) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {RECOMMENDED_ROLE_TABS.map((role) => {
          const isSelected = selectedRoleId === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRoleId(role.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-2 cursor-pointer border ${
                isSelected
                  ? 'bg-[#00C896] text-[#0A0A0A] border-transparent shadow-sm'
                  : 'bg-[#1C1E24] hover:bg-[#252832] text-zinc-200 hover:text-white border-[#2D303B] hover:border-[#3D404E]'
              }`}
            >
              <span>{role.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  isSelected
                    ? 'bg-black/20 text-[#0A0A0A] font-bold'
                    : 'bg-[#252832] text-zinc-300'
                }`}
              >
                {role.tag}
              </span>
            </button>
          );
        })}
      </div>

      {/* Recommendations Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-[#141519] border border-[#262830] rounded-2xl p-5 animate-pulse space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#20222A] rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-[#20222A] rounded w-3/4" />
                  <div className="h-3 bg-[#20222A] rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-[#20222A] rounded w-full" />
              <div className="h-8 bg-[#20222A] rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : roleJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleJobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            const displaySalary =
              !job?.salary || job.salary === '0' || (typeof job.salary === 'string' && job.salary.toLowerCase() === 'not disclosed')
                ? 'Salary Not Disclosed'
                : String(job.salary);
            const displayExp =
              !job?.experience_required || (typeof job.experience_required === 'string' && job.experience_required.toLowerCase().includes('any'))
                ? '2-5 Yrs Exp'
                : String(job.experience_required);

            return (
              <div
                key={job.id}
                className="bg-[#141519] hover:bg-[#181A20] border border-[#262830] hover:border-[#00C896]/50 rounded-2xl p-5 transition-colors duration-200 flex flex-col justify-between shadow-md"
              >
                <div>
                  {/* Top: Official Logo, Title, Bookmark */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <CompanyLogo
                        company={job?.company || ''}
                        applicationUrl={job?.application_url}
                        className="w-11 h-11"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold text-zinc-300 block truncate">
                          {job?.company}
                        </span>
                        <h4
                          onClick={() => onSelectJobForDetail(job)}
                          className="text-sm font-bold text-white hover:text-[#00C896] transition-colors cursor-pointer line-clamp-1"
                          title={job?.job_title}
                        >
                          {job?.job_title}
                        </h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleStar(job)}
                      aria-label="Save job"
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        isSaved
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          : 'bg-[#20222A] hover:bg-[#2A2D38] border-[#343744] text-zinc-300 hover:text-white'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Highlights Block (Solid background, clear text) */}
                  <div className="space-y-1.5 text-xs text-zinc-200 mb-3 bg-[#1C1E24] border border-[#2D303B] rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-[#00C896]" />
                        <span>Experience</span>
                      </span>
                      <span className="font-semibold text-zinc-100 truncate">{displayExp}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5 text-[#00C896]" />
                        <span>Compensation</span>
                      </span>
                      <span className="font-bold text-[#00C896] truncate">{displaySalary}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#00C896]" />
                        <span>Location</span>
                      </span>
                      <span className="font-medium text-zinc-200 truncate max-w-[140px]">
                        {job?.location || 'Pan-India'}
                      </span>
                    </div>
                  </div>

                  {/* Skills badges */}
                  {Array.isArray(job?.key_skills) && job.key_skills.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mb-4">
                      {job.key_skills.slice(0, 3).map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-[#1C1E24] text-zinc-300 border border-[#2D303B] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                      {job.key_skills.length > 3 && (
                        <span className="text-[10px] text-zinc-400 px-1 font-semibold">
                          +{job.key_skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions: Both Clearly Visible */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#262830]">
                  <button
                    type="button"
                    onClick={() => onSelectJobForDetail(job)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#20222A] hover:bg-[#2A2D38] text-white text-xs font-semibold border border-[#343744] hover:border-[#4B4F60] transition-colors text-center cursor-pointer"
                  >
                    View Details
                  </button>

                  <button
                    type="button"
                    onClick={() => onApplyRoleToSearch(job.job_title)}
                    className="py-2 px-3.5 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-[#0A0A0A] text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                    title="Find more jobs like this"
                  >
                    <span>More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#141519] rounded-2xl border border-dashed border-[#262830] p-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#1C1E24] text-[#00C896] flex items-center justify-center mx-auto mb-3 border border-[#2D303B]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No live recommendations cached right now</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-4">
            Try querying directly in the main search bar or explore other domains above.
          </p>
          <button
            type="button"
            onClick={() => onApplyRoleToSearch(activeRoleObj.keyword)}
            className="px-5 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-[#0A0A0A] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>Search {activeRoleObj.name} Roles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </section>
  );
};

export default RecommendedJobsSection;
