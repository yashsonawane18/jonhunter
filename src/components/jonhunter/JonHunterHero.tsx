import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { IndiaLocationOption } from '../../lib/drcDiscoveryApi';
import { getActiveTheme } from '../../config/themeConfig';

export interface JonHunterHeroProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  selectedSeniority: 'all' | 'entry' | 'intermediate' | 'senior' | 'lead' | 'manager';
  onSeniorityChange: (sen: 'all' | 'entry' | 'intermediate' | 'senior' | 'lead' | 'manager') => void;
  onExecuteSearch: (queryOverride?: string) => void;
  locationsList: (string | IndiaLocationOption)[];
  isSearching?: boolean;
}

// Experienced roles only (DRC does not apply for freshers)
const EXPERIENCED_SENIORITY_OPTIONS = [
  { id: 'all', label: 'All Experienced Roles (2-15+ Yrs)', badge: '2+ Yrs' },
  { id: 'intermediate', label: 'Mid Level Engineer (2-5 Yrs)', badge: '2-5 Yrs' },
  { id: 'senior', label: 'Senior Specialist (5-8 Yrs)', badge: '5-8 Yrs' },
  { id: 'lead', label: 'Staff / Principal Architect (8-12 Yrs)', badge: '8-12 Yrs' },
  { id: 'manager', label: 'Engineering Manager / Director (12+ Yrs)', badge: '12+ Yrs' },
] as const;

// Trending Experienced Searches
const TRENDING_SEARCHES = [
  'Full Stack Developer',
  'Python Cloud Architect',
  'GenAI & LLM Engineer',
  'DevOps & Kubernetes Lead',
  'Data Engineer (PySpark / SQL)',
  'Java Spring Boot Lead',
  'React / Next.js Architect',
];

export const JonHunterHero: React.FC<JonHunterHeroProps> = ({
  searchQuery,
  onSearchQueryChange,
  selectedLocation,
  onLocationChange,
  selectedSeniority,
  onSeniorityChange,
  onExecuteSearch,
  locationsList,
  isSearching = false,
}) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationSearchFilter, setLocationSearchFilter] = useState('');
  const [showSeniorityDropdown, setShowSeniorityDropdown] = useState(false);

  const locDropdownRef = useRef<HTMLDivElement>(null);
  const seniorityDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locDropdownRef.current && !locDropdownRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (seniorityDropdownRef.current && !seniorityDropdownRef.current.contains(e.target as Node)) {
        setShowSeniorityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLocations = (locationsList || []).filter((loc) => {
    const locName = typeof loc === 'string' ? loc : (loc as any)?.name || '';
    return locName.toLowerCase().includes((locationSearchFilter || '').toLowerCase());
  });

  const selectedSeniorityObj =
    EXPERIENCED_SENIORITY_OPTIONS.find((o) => o.id === selectedSeniority) ||
    EXPERIENCED_SENIORITY_OPTIONS[0];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteSearch(searchQuery);
  };

  const theme = getActiveTheme();

  return (
    <section className={`bg-transparent border-b ${theme.cardBorderClass} pt-10 pb-12 sm:pt-14 sm:pb-16 text-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Pill */}
        <div className="flex items-center justify-center mb-5">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-[#00C896] text-xs font-semibold uppercase tracking-wider`}>
            <ShieldCheck className="w-4 h-4 text-[#00C896]" />
            <span>Dheeraj Rathod Consult &bull; Executive Job Discovery</span>
          </div>
        </div>

        {/* Clean, Senior Typography (NO shades or gradient text) */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            We Apply. You Interview. <span className="text-[#00C896]">You Get Hired.</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Dheeraj Rathod Consult applies directly to verified engineering, product, and leadership openings across top career portals. Exclusively for experienced candidates (2+ to 15+ years).
          </p>
        </div>

        {/* Search Bar Container */}
        <div className="max-w-5xl mx-auto">
          <form
            onSubmit={handleFormSubmit}
            className={`${theme.cardClass} border ${theme.cardBorderClass} rounded-2xl shadow-xl p-2.5 sm:p-3`}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-2.5 items-center">
              {/* Field 1: Keywords / Skills / Role */}
              <div className={`md:col-span-5 relative flex items-center ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} focus-within:border-[#00C896] rounded-xl px-3.5 py-2.5`}>
                <Search className="w-5 h-5 text-[#00C896] shrink-0 mr-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  placeholder="Role, skills or company (e.g. Python, Full Stack, GenAI)"
                  className="w-full bg-transparent text-sm font-medium text-white placeholder-zinc-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      onSearchQueryChange('');
                      onExecuteSearch('');
                    }}
                    className="p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Field 2: Location Selector */}
              <div ref={locDropdownRef} className="md:col-span-3 relative">
                <button
                  type="button"
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className={`w-full flex items-center justify-between ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} hover:border-[#00C896]/50 rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors cursor-pointer`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className="w-4 h-4 text-[#00C896] shrink-0" />
                    <span className="truncate text-zinc-100 font-medium text-xs sm:text-sm">
                      {(selectedLocation || 'All India').replace(' (Remote & Nationwide)', '')}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0 ml-1" />
                </button>

                {showLocationDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#1C1E24] border border-[#343744] rounded-xl shadow-2xl z-50 p-2 max-h-72 overflow-y-auto">
                    <input
                      type="text"
                      value={locationSearchFilter}
                      onChange={(e) => setLocationSearchFilter(e.target.value)}
                      placeholder="Search metro / location..."
                      className="w-full bg-[#141519] border border-[#2D303B] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-[#00C896] mb-1.5"
                    />
                    <div className="space-y-0.5">
                      {filteredLocations.map((loc, idx) => {
                        const locName = typeof loc === 'string' ? loc : (loc as any)?.name || '';
                        const isRemote = locName.toLowerCase().includes('remote');
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              onLocationChange(locName);
                              setShowLocationDropdown(false);
                              setLocationSearchFilter('');
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              selectedLocation === locName
                                ? 'bg-[#00C896]/20 text-[#00C896] font-bold border border-[#00C896]/35'
                                : 'text-zinc-200 hover:bg-[#252832] hover:text-white'
                            }`}
                          >
                            <span className="truncate">{locName}</span>
                            {isRemote && (
                              <span className="text-[10px] font-semibold text-[#00C896] px-1.5 py-0.5 bg-[#00C896]/15 rounded">
                                Remote
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Field 3: Experience Dropdown (NO FRESHER) */}
              <div ref={seniorityDropdownRef} className="md:col-span-2 relative">
                <button
                  type="button"
                  onClick={() => setShowSeniorityDropdown(!showSeniorityDropdown)}
                  className="w-full flex items-center justify-between bg-[#1C1E24] border border-[#2D303B] hover:border-[#3D404E] rounded-xl px-3 py-2.5 text-left text-sm transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Briefcase className="w-4 h-4 text-[#00C896] shrink-0" />
                    <span className="truncate text-zinc-100 font-medium text-xs">
                      {selectedSeniorityObj.badge}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0 ml-1" />
                </button>

                {showSeniorityDropdown && (
                  <div className="absolute top-full left-0 right-0 md:w-56 mt-2 bg-[#1C1E24] border border-[#343744] rounded-xl shadow-2xl z-50 p-1.5 space-y-1">
                    {EXPERIENCED_SENIORITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onSeniorityChange(opt.id as any);
                          setShowSeniorityDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                          selectedSeniority === opt.id
                            ? 'bg-[#00C896]/20 text-[#00C896] font-bold border border-[#00C896]/35'
                            : 'text-zinc-200 hover:bg-[#252832] hover:text-white'
                        }`}
                      >
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Primary Search Button (Solid, highly visible) */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-[#0A0A0A] font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 shadow-sm"
                >
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Search Jobs</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Trending Searches Tags (Solid, clearly visible buttons) */}
          <div className="flex items-center gap-2 mt-4 flex-wrap justify-center sm:justify-start">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00C896]" />
              <span>Trending Roles:</span>
            </span>
            {TRENDING_SEARCHES.map((term, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onSearchQueryChange(term);
                  onExecuteSearch(term);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#1C1E24] hover:bg-[#252832] text-zinc-200 hover:text-white border border-[#2D303B] hover:border-[#3D404E] transition-colors font-medium cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JonHunterHero;
