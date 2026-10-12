import React, { useState } from 'react';
import {
  MapPin,
  Briefcase,
  IndianRupee,
  Bookmark,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Mail,
  Linkedin,
  Target,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { DiscoveredJobItem } from '../../lib/drcDiscoveryApi';
import { CompanyLogo } from './CompanyLogo';
import { getActiveTheme } from '../../config/themeConfig';
import discoveryFiltersConfig from '../../config/discoveryFilters.json';

export interface JobCardNaukriProps {
  job: DiscoveredJobItem;
  isSaved?: boolean;
  hasResume?: boolean;
  onToggleStar?: (job: DiscoveredJobItem) => void;
  onViewDetails?: (job: DiscoveredJobItem) => void;
  onApplyNow?: (job: DiscoveredJobItem) => void;
  onToggleStatus?: (job: DiscoveredJobItem) => void;
  onSaveRemark?: (job: DiscoveredJobItem, remark: string) => void;
}

export const JobCardNaukri: React.FC<JobCardNaukriProps> = ({
  job,
  isSaved = false,
  hasResume = false,
  onToggleStar,
  onViewDetails,
  onApplyNow,
}) => {
  const [showConnections, setShowConnections] = useState<boolean>(false);

  // Normalize salary display
  const displaySalary = React.useMemo(() => {
    if (!job?.salary || job.salary === '0') return 'Salary Not Disclosed';
    if (typeof job.salary === 'string' && job.salary.toLowerCase() === 'not disclosed') {
      return 'Salary Not Disclosed';
    }
    return String(job.salary);
  }, [job?.salary]);

  // Normalize experience display
  const displayExperience = React.useMemo(() => {
    if (!job?.experience_required) return '2-5 Yrs Exp';
    if (typeof job.experience_required === 'string' && job.experience_required.toLowerCase().includes('any')) {
      return '2-5 Yrs Exp';
    }
    return String(job.experience_required);
  }, [job?.experience_required]);

  // Format posted time
  const displayFreshness = React.useMemo(() => {
    if (job?.posted_time) return job.posted_time;
    return 'Posted recently';
  }, [job?.posted_time]);

  // Skills slicing
  const allSkills = React.useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(job?.matched_skills)) list.push(...job.matched_skills);
    if (Array.isArray(job?.key_skills)) {
      job.key_skills.forEach((s) => {
        if (!list.includes(s)) list.push(s);
      });
    }
    return list;
  }, [job?.matched_skills, job?.key_skills]);

  const visibleSkills = allSkills.slice(0, 5);
  const extraSkillsCount = Math.max(0, allSkills.length - 5);

  const isCareerPage =
    (typeof job?.source_type === 'string' && job.source_type.toLowerCase().includes('career')) ||
    (typeof job?.apply_type === 'string' && job.apply_type.toLowerCase().includes('career'));

  const atsScore = job?.ats_score || job?.match_score || 0;

  const theme = getActiveTheme();

  return (
    <article className={`group ${theme.cardClass} ${theme.cardHoverClass} rounded-2xl border ${theme.cardBorderClass} p-5 sm:p-6 transition-all duration-200 text-white shadow-md`}>
      {/* Top Row: Official Logo, Title, Bookmark */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Official Company Logo & Title Block */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <CompanyLogo
            company={job?.company || ''}
            applicationUrl={job?.application_url}
            className="w-12 h-12"
          />

          <div className="min-w-0 flex-1">
            <h3
              onClick={() => onViewDetails?.(job)}
              className="text-base sm:text-lg font-bold text-white hover:text-[#00C896] transition-colors cursor-pointer line-clamp-1 flex items-center gap-1.5"
              title={job?.job_title}
            >
              <span>{job?.job_title}</span>
              <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:opacity-100 text-[#00C896] shrink-0" />
            </h3>

            <div className="flex items-center gap-2.5 mt-1 flex-wrap">
              <span className="text-sm font-semibold text-zinc-200">{job?.company}</span>

              {/* Source Badge */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                  isCareerPage
                    ? 'bg-[#00C896]/15 text-[#00C896] border-[#00C896]/30'
                    : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                }`}
              >
                {isCareerPage ? 'Direct Career Portal' : 'LinkedIn Post'}
              </span>

              <span className="text-[11px] text-zinc-400 font-medium">
                Verified Opening
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions (ATS Score ONLY when resume is uploaded & Bookmark) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {hasResume && atsScore > 0 && (
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                atsScore >= 80
                  ? 'bg-[#00C896]/15 text-[#00C896] border-[#00C896]/35'
                  : atsScore >= 65
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/35'
                  : `${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-zinc-300`
              }`}
              title={`Live Resume ATS Match: ${atsScore}%`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>{atsScore}% ATS Match</span>
            </div>
          )}

          {/* Save / Bookmark Button with clear label */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar?.(job);
            }}
            aria-label={isSaved ? 'Saved to collection' : 'Save job'}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isSaved
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : `${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-zinc-300 hover:text-white`
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400 text-amber-400' : 'text-zinc-400'}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Specifications Row: Experience, Salary, Location (Solid, high contrast) */}
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t ${theme.cardBorderClass} text-xs`}>
        {/* Experience */}
        <div className={`flex items-center gap-2 ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} rounded-xl px-3 py-2 text-zinc-200`}>
          <Briefcase className="w-4 h-4 text-[#00C896] shrink-0" />
          <span className="font-medium truncate">{displayExperience}</span>
        </div>

        {/* Salary */}
        <div className="flex items-center gap-2 bg-[#00C896]/10 border border-[#00C896]/25 rounded-xl px-3 py-2 text-[#00C896]">
          <IndianRupee className="w-4 h-4 shrink-0" />
          <span className="font-bold truncate">{displaySalary}</span>
        </div>

        {/* Location */}
        <div className={`flex items-center gap-2 ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} rounded-xl px-3 py-2 text-zinc-200`}>
          <MapPin className="w-4 h-4 text-[#00C896] shrink-0" />
          <span className="font-medium truncate" title={job?.location || 'Pan-India'}>
            {job?.location || 'Pan-India'}
          </span>
        </div>
      </div>

      {/* Snippet / Description Preview */}
      {job?.job_description && (
        <p className="mt-3 text-xs sm:text-sm text-zinc-300 line-clamp-2 leading-relaxed">
          {job.job_description.replace(/^(Job Description|Role Overview):?\s*/i, '')}
        </p>
      )}

      {/* Skills Badges */}
      {visibleSkills.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mt-3.5">
          {visibleSkills.map((skill, idx) => {
            const isMatched = Array.isArray(job?.matched_skills) && job.matched_skills.includes(skill);
            return (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border ${
                  isMatched
                    ? 'bg-[#00C896]/15 text-[#00C896] border-[#00C896]/30 font-semibold'
                    : `${theme.innerBoxClass} text-zinc-300 border ${theme.innerBoxBorderClass} font-medium`
                }`}
              >
                {isMatched && <CheckCircle2 className="w-3.5 h-3.5 text-[#00C896] shrink-0" />}
                <span>{skill}</span>
              </span>
            );
          })}
          {extraSkillsCount > 0 && (
            <span className="text-xs text-zinc-400 font-semibold px-1.5 py-1">
              +{extraSkillsCount} more
            </span>
          )}
        </div>
      )}

      {/* Recruiter Connections Preview (Controlled via discoveryFilters.json - hidden when false) */}
      {discoveryFiltersConfig?.showLeadershipContacts && Array.isArray(job?.connections) && job.connections.length > 0 && (
        <div className={`mt-3 pt-3 border-t ${theme.cardBorderClass}`}>
          <button
            type="button"
            onClick={() => setShowConnections(!showConnections)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#00C896] hover:underline cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {job.connections.length} Direct Hiring Leadership {job.connections.length === 1 ? 'Contact' : 'Contacts'} Identified
            </span>
            {showConnections ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showConnections && (
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
                        href={`mailto:${c.email}`}
                        className={`px-2 py-1 rounded-lg ${theme.innerBoxClass} text-zinc-200 border ${theme.innerBoxBorderClass} flex items-center gap-1 text-[11px]`}
                        title={`Email: ${c.email}`}
                      >
                        <Mail className="w-3 h-3 text-[#00C896]" />
                        <span>Email</span>
                      </a>
                    )}
                    {c.emailOrLinkedIn && (
                      <a
                        href={c.emailOrLinkedIn}
                        target="_blank"
                        rel="noreferrer"
                        className={`px-2 py-1 rounded-lg ${theme.innerBoxClass} text-zinc-200 border ${theme.innerBoxBorderClass} flex items-center gap-1 text-[11px]`}
                        title="LinkedIn Profile"
                      >
                        <Linkedin className="w-3 h-3 text-sky-400" />
                        <span>Profile</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Row: Posted Freshness & Clear Action Buttons */}
      <div className={`flex items-center justify-between gap-3 mt-4 pt-3.5 border-t ${theme.cardBorderClass} flex-wrap sm:flex-nowrap`}>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
          <Clock className="w-3.5 h-3.5 text-[#00C896]" />
          <span>{displayFreshness}</span>
        </div>

        {/* Clear, High-Contrast Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap sm:flex-nowrap">
          {/* Quick Save toggle button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar?.(job);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              isSaved
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : `${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-zinc-200 hover:text-white`
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400 text-amber-400' : 'text-zinc-400'}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* View Details - Visible Secondary Button */}
          <button
            type="button"
            onClick={() => onViewDetails?.(job)}
            className={`px-4 py-2 rounded-xl ${theme.innerBoxClass} hover:opacity-90 text-white border ${theme.innerBoxBorderClass} text-xs font-semibold transition-colors cursor-pointer`}
          >
            View Details
          </button>

          {/* Apply Now - Solid High-Visibility Green Button */}
          <button
            type="button"
            onClick={() => onApplyNow?.(job)}
            className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Apply Now</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default JobCardNaukri;
