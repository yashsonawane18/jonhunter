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

// Experienced-only seniority bands (DRC does not apply for freshers)
const EXPERIENCED_SENIORITY_LEVELS = [
  { id: 'all', label: 'All Seniority Levels (2-15+ Yrs)', badge: '2+ Yrs' },
  { id: 'intermediate', label: 'Mid Level Engineer (2-5 Yrs)', badge: '2-5 Yrs' },
  { id: 'senior', label: 'Senior Specialist (5-8 Yrs)', badge: '5-8 Yrs' },
  { id: 'lead', label: 'Staff / Principal Architect (8-12 Yrs)', badge: '8-12 Yrs' },
  { id: 'manager', label: 'Engineering Manager / Director (12+ Yrs)', badge: '12+ Yrs' },
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
  totalDiscoveredCount = 950,
  savedCount = 0,
  appliedCount = 0,
  showOnlySaved = false,
  hasResume = false,
  onToggleShowSaved,
  onShowAllJobs,
  onNavigateTracker,
}) => {
  const theme = getActiveTheme();

  return (
    <aside className={`${theme.cardClass} border ${theme.cardBorderClass} rounded-2xl p-5 shadow-xl text-white space-y-5`}>
      {/* Header with Title & High-Visibility Reset Button */}
      <div className={`flex items-center justify-between pb-4 border-b ${theme.cardBorderClass}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} flex items-center justify-center text-[#00C896]`}>
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Filter Roles</h3>
            <span className="text-[11px] text-zinc-400 font-medium">
              {totalFilteredCount} matching openings
            </span>
          </div>
        </div>

        {/* Clearly visible Reset button */}
        <button
          type="button"
          onClick={onResetFilters}
          className={`px-2.5 py-1.5 rounded-lg ${theme.innerBoxClass} hover:opacity-90 border ${theme.innerBoxBorderClass} text-xs font-semibold text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer`}
          title="Reset all filters"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#00C896]" />
          <span>Reset</span>
        </button>
      </div>

      {/* NEW SECTION: Requisition Pipeline & History Archive (950+ Openings) */}
      <div className={`p-4 rounded-xl ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-[#00C896]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Requisition Archive
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30">
            {totalDiscoveredCount > 0 ? `${totalDiscoveredCount} Live` : '950+ Live'}
          </span>
        </div>

        <p className="text-[11px] text-zinc-300 leading-relaxed">
          Access all verified openings discovered across corporate career portals &amp; curated hiring batches.
        </p>

        {/* Quick KPI stats buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Saved shortcut */}
          <button
            type="button"
            onClick={onToggleShowSaved}
            className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
              showOnlySaved
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                : `${theme.cardClass} hover:opacity-95 border ${theme.cardBorderClass} text-zinc-200`
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Saved</span>
              <Bookmark className={`w-3.5 h-3.5 ${showOnlySaved ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
            </div>
            <div className="text-base font-extrabold text-white">
              {savedCount}
            </div>
          </button>

          {/* Applied shortcut */}
          <button
            type="button"
            onClick={onNavigateTracker}
            className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${theme.cardClass} hover:opacity-95 border ${theme.cardBorderClass} text-zinc-200`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Applied</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-base font-extrabold text-white">
              {appliedCount}
            </div>
          </button>
        </div>

        {/* Show All Requisitions action button */}
        <button
          type="button"
          onClick={onShowAllJobs}
          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 border ${
            !showOnlySaved
              ? 'bg-[#00C896]/20 text-[#00C896] border-[#00C896]/40'
              : `${theme.cardClass} border ${theme.cardBorderClass} text-zinc-300 hover:text-white`
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Browse All ({totalDiscoveredCount > 0 ? totalDiscoveredCount : '950+'} Jobs)</span>
        </button>
      </div>

      {/* 1. Job Source / Application Channel */}
      <div>
        <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#00C896]" />
          <span>Job Channel</span>
        </label>
        <div className="space-y-1.5">
          {[
            { id: 'all', label: 'All Opportunities', desc: 'Direct Career Portals + LinkedIn' },
            { id: 'career_page', label: 'Direct Career Portals', desc: 'Greenhouse, Lever, Workday' },
            { id: 'linkedin', label: 'LinkedIn Job Posts', desc: 'Direct recruiter posts' },
          ].map((ch) => {
            const isSelected = selectedChannel === ch.id;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => onChannelChange(ch.id as any)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#00C896]/15 border-[#00C896] text-[#00C896] font-bold'
                    : `${theme.innerBoxClass} hover:opacity-90 border ${theme.innerBoxBorderClass} text-zinc-200 hover:text-white`
                }`}
              >
                <div>
                  <span className="block font-semibold">{ch.label}</span>
                  <span className="text-[10px] text-zinc-400 font-normal">{ch.desc}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#00C896] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Experience Level (Experienced Only - NO FRESHER) */}
      <div>
        <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-[#00C896]" />
          <span>Experience Level</span>
        </label>
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
                    ? 'bg-[#00C896]/15 border-[#00C896] text-[#00C896] font-bold'
                    : `${theme.innerBoxClass} hover:opacity-90 border ${theme.innerBoxBorderClass} text-zinc-200 hover:text-white`
                }`}
              >
                <span className="truncate">{sen.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected
                      ? 'bg-[#00C896]/20 text-[#00C896] font-bold'
                      : 'bg-[#252832] text-zinc-300'
                  }`}
                >
                  {sen.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Work Mode */}
      <div>
        <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#00C896]" />
          <span>Work Mode</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'all', label: 'Any Mode' },
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
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border text-center transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#00C896] text-[#0A0A0A] font-bold border-transparent shadow-sm'
                    : `${theme.innerBoxClass} hover:opacity-90 border ${theme.innerBoxBorderClass} text-zinc-200 hover:text-white`
                }`}
              >
                {wm.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Minimum Live ATS Score (ONLY shown when resume is uploaded) */}
      {hasResume && (
        <div>
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[#00C896]" />
            <span>Resume ATS Match</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
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
                  className={`py-2 rounded-xl text-xs font-bold border text-center transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#00C896] text-[#0A0A0A] border-transparent shadow-sm'
                      : `${theme.innerBoxClass} hover:opacity-90 border ${theme.innerBoxBorderClass} text-zinc-200 hover:text-white`
                  }`}
                >
                  {score.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Recommended Skills Tag Cloud */}
      {suggestedSkills.length > 0 && (
        <div className={`pt-4 border-t ${theme.cardBorderClass}`}>
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00C896]" />
            <span>Target Skills</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {suggestedSkills.slice(0, 10).map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => onToggleSkill(skill)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#00C896]/20 border-[#00C896] text-[#00C896] font-bold'
                      : `${theme.innerBoxClass} hover:opacity-90 border ${theme.innerBoxBorderClass} text-zinc-300 hover:text-white`
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};

export default FiltersSidebar;
