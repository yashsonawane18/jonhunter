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

  // Compute monogram fallback
  const monogram = React.useMemo(() => {
    const name = String(job?.company || 'DRC').trim();
    const parts = name.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [job?.company]);

  const isRemote = React.useMemo(() => {
    const loc = String(job?.location || '').toLowerCase();
    const mode = String(job?.work_mode || '').toLowerCase();
    return loc.includes('remote') || mode.includes('remote');
  }, [job?.location, job?.work_mode]);

  const portalSource = React.useMemo(() => {
    if (isCareerPage) {
      if (job?.application_url?.toLowerCase().includes('greenhouse')) return 'Direct Greenhouse';
      if (job?.application_url?.toLowerCase().includes('lever')) return 'Direct Lever';
      if (job?.application_url?.toLowerCase().includes('workday')) return 'Direct Workday';
      return 'Direct Career Portal';
    }
    return 'LinkedIn Verified';
  }, [isCareerPage, job?.application_url]);

  const domain = React.useMemo(() => {
    try {
      if (job?.application_url) {
        const u = new URL(job.application_url);
        return u.hostname.replace('www.', '');
      }
    } catch {
      // ignore
    }
    return `${job?.company?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`;
  }, [job?.application_url, job?.company]);

  return (
    <article className="p-space-md rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary/50 transition-all shadow-sm space-y-space-md group">
      {/* Top Row: Company Monogram, Title, Badges, Match Score */}
      <div className="flex items-start justify-between gap-space-md">
        <div className="flex items-start gap-space-sm min-w-0 flex-1">
          {/* Monogram / Company Box */}
          <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center font-headline-sm text-headline-sm text-primary font-bold shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            {monogram}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-space-xs flex-wrap mb-1">
              <h3
                onClick={() => onViewDetails?.(job)}
                className="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors cursor-pointer line-clamp-1"
                title={job?.job_title}
              >
                {job?.job_title}
              </h3>
              <span className="px-space-xs py-0.5 rounded bg-surface-container text-primary font-badge-caps text-badge-caps uppercase">
                {isCareerPage ? 'VERIFIED DIRECT' : 'LINKEDIN VERIFIED'}
              </span>
              {isRemote && (
                <span className="px-space-xs py-0.5 rounded bg-surface-container text-tertiary font-badge-caps text-badge-caps uppercase">
                  100% REMOTE
                </span>
              )}
            </div>

            <div className="flex items-center gap-space-xs text-body-sm text-on-surface-variant flex-wrap">
              <span className="font-semibold text-on-surface">{job?.company}</span>
              <span>&bull;</span>
              <span className="text-on-surface-variant/80">{domain}</span>
              <span>&bull;</span>
              <span>{displayFreshness}</span>
            </div>
          </div>
        </div>

        {/* ATS Match score (only shown when resume is uploaded) */}
        {hasResume && atsScore > 0 ? (
          <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-md text-label-md font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span>{atsScore}% ATS Match</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span>Verified</span>
          </div>
        )}
      </div>

      {/* 4-Column Parameters Box */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-xs p-space-sm rounded-xl bg-surface-container text-body-sm">
        <div>
          <span className="text-on-surface-variant font-label-sm text-label-sm block uppercase tracking-wider">COMPENSATION</span>
          <span className="font-semibold text-on-surface truncate block">{displaySalary}</span>
        </div>
        <div>
          <span className="text-on-surface-variant font-label-sm text-label-sm block uppercase tracking-wider">LOCATION</span>
          <span className="font-semibold text-on-surface truncate block" title={job?.location || 'Pan-India'}>
            {job?.location || 'Pan-India'}
          </span>
        </div>
        <div>
          <span className="text-on-surface-variant font-label-sm text-label-sm block uppercase tracking-wider">EXPERIENCE</span>
          <span className="font-semibold text-on-surface truncate block">{displayExperience}</span>
        </div>
        <div>
          <span className="text-on-surface-variant font-label-sm text-label-sm block uppercase tracking-wider">PORTAL SOURCE</span>
          <span className="font-semibold text-primary truncate block">{portalSource}</span>
        </div>
      </div>

      {/* Description Preview */}
      {job?.job_description && (
        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 leading-relaxed">
          {job.job_description.replace(/^(Job Description|Role Overview):?\s*/i, '')}
        </p>
      )}

      {/* Skills Badges */}
      {visibleSkills.length > 0 && (
        <div className="flex items-center gap-space-xs flex-wrap">
          {visibleSkills.map((skill, idx) => {
            const isMatched = Array.isArray(job?.matched_skills) && job.matched_skills.includes(skill);
            return (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-label-sm text-label-sm ${
                  isMatched
                    ? 'bg-primary/15 text-primary border border-primary/30 font-semibold'
                    : 'bg-surface-container text-on-surface-variant border border-outline-variant/30'
                }`}
              >
                {isMatched && <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />}
                <span>{skill}</span>
              </span>
            );
          })}
          {extraSkillsCount > 0 && (
            <span className="font-label-sm text-label-sm text-on-surface-variant/70 font-semibold px-1">
              +{extraSkillsCount} more
            </span>
          )}
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between pt-space-xs border-t border-outline-variant/20 flex-wrap sm:flex-nowrap gap-3">
        {/* Save Opportunity Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar?.(job);
          }}
          className={`px-space-md py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-space-xs cursor-pointer ${
            isSaved
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px] text-amber-400">
            {isSaved ? 'bookmark' : 'bookmark_border'}
          </span>
          <span>{isSaved ? 'Saved Opportunity' : 'Save Opportunity'}</span>
        </button>

        <div className="flex items-center gap-space-xs w-full sm:w-auto justify-end">
          {/* View Details */}
          <button
            type="button"
            onClick={() => onViewDetails?.(job)}
            className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-all cursor-pointer"
          >
            View Details
          </button>

          {/* Apply via DRC Concierge (or Direct Apply) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onApplyNow?.(job);
            }}
            className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-[0_0_16px_rgba(16,185,129,0.3)] hover:shadow-[0_0_24px_rgba(16,185,129,0.5)] transition-all flex items-center gap-space-xs cursor-pointer"
          >
            <span>Apply via DRC Concierge</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default JobCardNaukri;
