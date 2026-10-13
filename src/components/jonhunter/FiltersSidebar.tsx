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
    <aside className={`${theme.cardClass} border ${theme.cardBorderClass} rounded-2xl p-5 shadow-xl text-white space-y-6 transition-all duration-200`}>
      {/* 1. Header: Clean Minimalist Title & Reset */}
      <div className={`flex items-center justify-between pb-4 border-b ${theme.cardBorderClass}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} flex items-center justify-center text-[#00C896]`}>
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">Refine Openings</h3>
              {activeFiltersCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#00C896]/20 text-[#00C896] border border-[#00C896]/35">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">
              {totalFilteredCount} matching roles
            </span>
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] font-semibold text-zinc-400 hover:text-[#00C896] transition-colors cursor-pointer flex items-center gap-1"
            title="Reset all filters"
          >
            <RotateCcw className="w-3 h-3 text-[#00C896]" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* 2. Business POV: DRC Executive Verified Badge & Pipeline Strip */}
      <div className={`p-4 rounded-xl ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} relative overflow-hidden space-y-3`}>
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C896]/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C896] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C896]" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-200">
              Verified Pipeline
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30">
            {totalDiscoveredCount > 0 ? `${totalDiscoveredCount}+ Roles` : '1500+ Roles'}
          </span>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Direct openings from corporate career portals & verified hiring leadership. Exclusively for experienced candidates.
        </p>

        {/* Minimalist 3-Pill Pipeline Strip */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {/* All */}
          <button
            type="button"
            onClick={onShowAllJobs}
            className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer border ${
              !showOnlySaved
                ? 'bg-[#00C896]/15 border-[#00C896]/40 text-[#00C896] font-bold shadow-xs'
                : `${theme.cardClass} border ${theme.cardBorderClass} text-zinc-300 hover:text-white`
            }`}
          >
            <span className="block text-[10px] uppercase font-medium text-zinc-400">All</span>
            <span className="block text-xs font-bold">{totalDiscoveredCount > 0 ? totalDiscoveredCount : '1500+'}</span>
          </button>

          {/* Saved */}
          <button
            type="button"
            onClick={onToggleShowSaved}
            className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer border ${
              showOnlySaved
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold shadow-xs'
                : `${theme.cardClass} border ${theme.cardBorderClass} text-zinc-300 hover:text-amber-300`
            }`}
          >
            <span className="block text-[10px] uppercase font-medium text-zinc-400">Saved</span>
            <span className="block text-xs font-bold text-amber-300">{savedCount}</span>
          </button>

          {/* Applied */}
          <button
            type="button"
            onClick={onNavigateTracker}
            className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer border ${theme.cardClass} border ${theme.cardBorderClass} text-zinc-300 hover:text-emerald-300`}
            title="Open Application Tracker"
          >
            <span className="block text-[10px] uppercase font-medium text-zinc-400">Applied</span>
            <span className="block text-xs font-bold text-emerald-400">{appliedCount}</span>
          </button>
        </div>
      </div>

      {/* 3. Work Mode - Segmented Control (Minimal, 1 Horizontal Line) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#00C896]" />
          <span>Work Mode</span>
        </label>
        <div className={`grid grid-cols-4 p-1 rounded-xl ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} gap-1`}>
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
                className={`py-1.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#00C896] text-[#0A0A0A] font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {wm.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Job Source / Application Channel (Naukri-Style Clean Selectable Rows) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#00C896]" />
          <span>Job Channel</span>
        </label>
        <div className="space-y-1">
          {[
            { id: 'all', label: 'All Verified Channels', hint: 'Career Pages + LinkedIn' },
            { id: 'career_page', label: 'Direct Career Portals', hint: 'Greenhouse, Lever, Workday' },
            { id: 'linkedin', label: 'LinkedIn Verified Posts', hint: 'Direct hiring manager posts' },
          ].map((ch) => {
            const isSelected = selectedChannel === ch.id;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => onChannelChange(ch.id as any)}
                className={`w-full text-left px-3 py-2 rounded-xl border text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#00C896]/15 border-[#00C896]/50 text-[#00C896] font-semibold'
                    : `${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-zinc-300 hover:text-white hover:border-[#00C896]/30`
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="font-medium text-xs truncate">{ch.label}</div>
                  <div className="text-[10px] text-zinc-400 truncate">{ch.hint}</div>
                </div>

                {/* Custom radio pill */}
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'border-[#00C896] bg-[#00C896]'
                      : 'border-zinc-600 bg-transparent'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Experience Level - Seniority Bands (Experienced Talent Only) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-[#00C896]" />
            <span>Experience Band</span>
          </label>
          <span className="text-[10px] font-semibold text-[#00C896]">2+ to 15+ Yrs</span>
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
                    ? 'bg-[#00C896]/15 border-[#00C896]/50 text-[#00C896] font-semibold'
                    : `${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-zinc-300 hover:text-white hover:border-[#00C896]/30`
                }`}
              >
                <span className="truncate">{sen.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected
                      ? 'bg-[#00C896]/20 text-[#00C896] font-bold'
                      : 'bg-[#252832] text-zinc-400'
                  }`}
                >
                  {sen.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Resume ATS Compatibility Score (ONLY shown when resume is uploaded) */}
      {hasResume && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[#00C896]" />
            <span>Resume ATS Match</span>
          </label>
          <div className="grid grid-cols-4 gap-1">
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
                  className={`py-1.5 rounded-lg text-xs font-bold border text-center transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#00C896] text-[#0A0A0A] border-transparent shadow-sm'
                      : `${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-zinc-300 hover:text-white`
                  }`}
                >
                  {score.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Target Skills - Compact Modern Chip Cloud */}
      {suggestedSkills.length > 0 && (
        <div className={`pt-4 border-t ${theme.cardBorderClass} space-y-2.5`}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00C896]" />
              <span>In-Demand Skills</span>
            </label>
            {selectedSkills.length > 0 && (
              <span className="text-[10px] text-[#00C896] font-semibold">
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
                      ? 'bg-[#00C896]/20 border-[#00C896] text-[#00C896] font-semibold shadow-xs'
                      : `${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-zinc-300 hover:text-white hover:border-zinc-500`
                  }`}
                >
                  <span>{skill}</span>
                  {isSelected ? (
                    <Check className="w-2.5 h-2.5 text-[#00C896]" />
                  ) : (
                    <span className="text-zinc-500 text-[10px]">+</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. Business POV: Executive Placement Marketing Card (Consulting Authority) */}
      <div className={`p-4 rounded-xl border border-[#00C896]/30 bg-gradient-to-br from-[#00C896]/10 via-[#00C896]/5 to-transparent space-y-2.5`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#00C896]/20 border border-[#00C896]/40 flex items-center justify-center text-[#00C896]">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">DRC Direct Apply Concierge</h4>
            <span className="text-[10px] text-[#00C896] font-medium">Executive Placement Guarantee</span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-300 leading-relaxed">
          Tired of endless manual job applications? We customize your resume for ATS and apply directly to hiring decision-makers on your behalf.
        </p>

        <div className="space-y-1 pt-1 text-[10px] text-zinc-300 font-medium">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-[#00C896] shrink-0" />
            <span>Fast-track HR interview scheduling</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-[#00C896] shrink-0" />
            <span>100% verified corporate career portals</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default FiltersSidebar;
