import React from 'react';
import {
  Filter,
  RotateCcw,
  Briefcase,
  Target,
  Sparkles,
  Layers,
  MapPin,
  Check,
  Archive,
  Bookmark,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { getActiveTheme } from '../../config/themeConfig';

export interface FiltersSidebarProps {
  selectedChannel: 'all' | 'career_page' | 'linkedin';
  onChannelChange: (ch: 'all' | 'career_page' | 'linkedin') => void;
  selectedSeniority: 'all' | 'entry' | 'intermediate' | 'senior' | 'lead' | 'manager';
  onSeniorityChange: (sen: 'all' | 'entry' | 'intermediate' | 'senior' | 'lead' | 'manager') => void;
  selectedWorkMode: 'all' | 'remote' | 'hybrid' | 'onsite';
  onWorkModeChange: (wm: 'all' | 'remote' | 'hybrid' | 'onsite') => void;
  minAtsScoreFilter: 'all' | '70' | '80' | '85';
  onMinAtsScoreChange: (score: 'all' | '70' | '80' | '85') => void;
  selectedSkills: string[];
  suggestedSkills: string[];
  onToggleSkill: (skill: string) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
  totalDiscoveredCount?: number;
  savedCount?: number;
  appliedCount?: number;
  showOnlySaved?: boolean;
  hasResume?: boolean;
  onToggleShowSaved?: () => void;
  onShowAllJobs?: () => void;
  onNavigateTracker?: () => void;
}

// Experienced-only seniority bands (DRC does not apply for freshers - Market POV)
const EXPERIENCED_SENIORITY_LEVELS = [
  { id: 'all', label: 'All Seniority Levels', sub: '2-15+ Yrs', badge: '2+ Yrs' },
  { id: 'intermediate', label: 'Mid-Level Engineer', sub: 'Individual Contributor', badge: '2-5 Yrs' },
  { id: 'senior', label: 'Senior Specialist', sub: 'Core Engineering', badge: '5-8 Yrs' },
  { id: 'lead', label: 'Staff / Principal Architect', sub: 'Technical Leadership', badge: '8-12 Yrs' },
  { id: 'manager', label: 'Engineering Manager', sub: 'Director / VP', badge: '12+ Yrs' },
] as const;

export const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  selectedChannel,
  onChannelChange,
  selectedSeniority,
  onSeniorityChange,
  selectedWorkMode,
  onWorkModeChange,
  minAtsScoreFilter,
  onMinAtsScoreChange,
  selectedSkills,
  suggestedSkills,
  onToggleSkill,
  onResetFilters,
  totalFilteredCount,
  totalDiscoveredCount = 1500,
  savedCount = 0,
  appliedCount = 0,
  showOnlySaved = false,
  hasResume = false,
  onToggleShowSaved,
  onShowAllJobs,
  onNavigateTracker,
}) => {
  const theme = getActiveTheme();

  // Active filters calculation for clean visual counter
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (selectedChannel !== 'all') count++;
    if (selectedSeniority !== 'all') count++;
    if (selectedWorkMode !== 'all') count++;
    if (selectedSkills.length > 0) count += selectedSkills.length;
    if (minAtsScoreFilter !== 'all') count++;
    if (showOnlySaved) count++;
    return count;
  }, [
    selectedChannel,
    selectedSeniority,
    selectedWorkMode,
    selectedSkills,
    minAtsScoreFilter,
    showOnlySaved,
  ]);

  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-space-md">
      {/* 1. Refine Openings Container */}
      <div className="p-space-md rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-space-md shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Refine Openings</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-space-xs py-0.5 rounded bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
              {totalFilteredCount} Active
            </span>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-[11px] font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3 text-primary" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Verified Pipeline Card */}
        <div className="p-space-sm rounded-xl bg-surface-container border border-outline-variant/30">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Verified Pipeline</span>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          </div>
          <div className="grid grid-cols-3 gap-space-xs text-center">
            <button
              type="button"
              onClick={onShowAllJobs}
              className={`p-space-xs rounded bg-surface-container-high cursor-pointer transition-colors text-center border ${
                !showOnlySaved
                  ? 'border-primary/50 bg-surface-container-highest shadow-sm'
                  : 'border-transparent hover:border-outline-variant/50'
              }`}
            >
              <div className="font-headline-sm text-headline-sm text-primary font-bold">
                {totalDiscoveredCount > 0 ? totalDiscoveredCount : '1500'}
              </div>
              <div className="font-badge-caps text-badge-caps text-on-surface-variant">ALL</div>
            </button>

            <button
              type="button"
              onClick={onToggleShowSaved}
              className={`p-space-xs rounded bg-surface-container-high cursor-pointer transition-colors text-center border ${
                showOnlySaved
                  ? 'border-amber-400/50 bg-surface-container-highest shadow-sm'
                  : 'border-transparent hover:border-amber-400/30'
              }`}
            >
              <div className="font-headline-sm text-headline-sm text-amber-300 font-bold">{savedCount}</div>
              <div className="font-badge-caps text-badge-caps text-on-surface-variant">SAVED</div>
            </button>

            <button
              type="button"
              onClick={onNavigateTracker}
              className="p-space-xs rounded bg-surface-container-high cursor-pointer transition-colors text-center border border-transparent hover:border-emerald-400/50"
              title="Open Application Tracker"
            >
              <div className="font-headline-sm text-headline-sm text-emerald-400 font-bold">{appliedCount}</div>
              <div className="font-badge-caps text-badge-caps text-on-surface-variant">APPLIED</div>
            </button>
          </div>
        </div>

        {/* Work Mode Segmented Control */}
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-space-xs font-semibold">Work Mode</label>
          <div className="grid grid-cols-4 gap-1 p-1 bg-surface-container rounded-xl">
            {[
              { id: 'all', label: 'All' },
              { id: 'remote', label: 'Remote' },
              { id: 'hybrid', label: 'Hybrid' },
              { id: 'onsite', label: 'Onsite' },
            ].map((wm) => {
              const isSelected = selectedWorkMode === wm.id;
              return (
                <button
                  key={wm.id}
                  type="button"
                  onClick={() => onWorkModeChange(wm.id as any)}
                  className={`py-1.5 rounded-lg text-label-sm font-label-sm text-center transition-all cursor-pointer font-semibold ${
                    isSelected
                      ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {wm.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Job Channel (Verified Sourcing) */}
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-space-xs font-semibold">Job Channel</label>
          <div className="space-y-1">
            {[
              { id: 'all', label: `All Verified Channels (${totalDiscoveredCount > 0 ? totalDiscoveredCount : '1,500'})`, hint: 'Career Pages + LinkedIn' },
              { id: 'career_page', label: 'Direct Career Portals', hint: 'Greenhouse, Lever, Workday' },
              { id: 'linkedin', label: 'LinkedIn Direct Postings', hint: 'Verified hiring manager posts' },
            ].map((ch) => {
              const isSelected = selectedChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => onChannelChange(ch.id as any)}
                  className={`w-full text-left px-3 py-2 rounded-xl border text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-surface-container-high border-primary/50 text-primary font-semibold'
                      : 'bg-surface-container border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-medium text-xs truncate">{ch.label}</div>
                    <div className="text-[10px] text-on-surface-variant/70 truncate">{ch.hint}</div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'border-primary bg-primary' : 'border-outline-variant bg-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 text-on-primary stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience Band */}
        <div>
          <div className="flex items-center justify-between mb-space-xs">
            <label className="block font-label-md text-label-md text-on-surface font-semibold">Experience Band</label>
            <span className="text-[10px] font-semibold text-primary">2+ to 15+ Yrs</span>
          </div>
          <div className="space-y-1">
            {EXPERIENCED_SENIORITY_LEVELS.map((sen) => {
              const isSelected = selectedSeniority === sen.id;
              return (
                <button
                  key={sen.id}
                  type="button"
                  onClick={() => onSeniorityChange(sen.id as any)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-surface-container-high border-primary/50 text-primary font-semibold'
                      : 'bg-surface-container border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span className="truncate">{sen.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-primary/20 text-primary font-bold' : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    {sen.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Resume ATS Compatibility Score (When resume uploaded) */}
        {hasResume && (
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-space-xs font-semibold">Resume ATS Match</label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-surface-container rounded-xl">
              {[
                { id: 'all', label: 'All' },
                { id: '70', label: '70%+' },
                { id: '80', label: '80%+' },
                { id: '85', label: '85%+' },
              ].map((score) => {
                const isSelected = minAtsScoreFilter === score.id;
                return (
                  <button
                    key={score.id}
                    type="button"
                    onClick={() => onMinAtsScoreChange(score.id as any)}
                    className={`py-1.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary-container text-on-primary-container shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {score.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* In-Demand Tech Stacks */}
        {suggestedSkills.length > 0 && (
          <div className="pt-space-xs border-t border-outline-variant/20">
            <div className="flex items-center justify-between mb-space-xs">
              <label className="block font-label-md text-label-md text-on-surface font-semibold">In-Demand Tech Stacks</label>
              {selectedSkills.length > 0 && (
                <span className="text-[10px] text-primary font-semibold">
                  {selectedSkills.length} selected
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestedSkills.slice(0, 10).map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => onToggleSkill(skill)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-primary/20 border-primary text-primary font-semibold'
                        : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <span>{skill}</span>
                    {isSelected ? (
                      <Check className="w-2.5 h-2.5 text-primary" />
                    ) : (
                      <span className="text-on-surface-variant/60 text-[10px]">+</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Direct Apply Concierge Card (Market POV CTA) */}
      <div className="p-space-md rounded-2xl bg-gradient-to-br from-surface-container-low to-surface-container border border-primary/20 space-y-space-sm relative overflow-hidden shadow-md">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm font-bold">
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span>DRC DIRECT CONCIERGE</span>
        </div>
        <div className="font-headline-sm text-headline-sm text-on-surface font-bold leading-snug">
          Tired of Endless Manual Applications?
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          Let Dheeraj Rathod Consult's automated executive dispatch team apply to 50+ verified roles on your behalf daily with custom cover letters.
        </p>
        <ul className="space-y-1.5 font-label-sm text-label-sm text-on-surface">
          <li className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
            <span>100% Direct Portal Submissions</span>
          </li>
          <li className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
            <span>ATS Score Guarantee (&gt;85%)</span>
          </li>
          <li className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
            <span>Dedicated Talent Partner</span>
          </li>
        </ul>
        <button
          type="button"
          onClick={onNavigateTracker}
          className="w-full py-2.5 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_28px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-space-xs cursor-pointer"
        >
          <span>Activate Concierge Service</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </aside>
  );
};

export default FiltersSidebar;
