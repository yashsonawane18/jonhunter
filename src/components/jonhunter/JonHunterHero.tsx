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
  onExecuteSearch: () => void;
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
    onExecuteSearch();
  };

  const theme = getActiveTheme();

  return (
    <section className="relative pt-12 pb-14 sm:pt-20 sm:pb-16 overflow-hidden text-on-surface">
      {/* Ambient background glow blob */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
        <div className="w-[800px] h-[400px] bg-primary/20 blur-[140px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* DRC Brand Pill */}
        <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high border border-outline-variant/30 mb-space-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="font-badge-caps text-badge-caps uppercase tracking-wider text-primary font-semibold">
            Dheeraj Rathod Consult &bull; Executive Job Discovery
          </span>
        </div>

        {/* Headline with wavy accent */}
        <h1 className="font-headline-hero text-headline-hero-mobile md:text-headline-hero text-on-surface tracking-tight mb-space-sm font-extrabold max-w-4xl mx-auto leading-tight">
          We Apply. You Interview. <br className="hidden sm:inline" />
          <span className="text-primary underline decoration-primary/40 decoration-wavy underline-offset-8">
            You Get Hired.
          </span>
        </h1>

        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-space-xl">
          Curated C-Suite, VP, and Lead Engineering roles across Tier-1 VC-funded startups &amp; Fortune 500 enterprises. Verified daily with direct recruiter concierge routing.
        </p>

        {/* Search Console Bar */}
        <div className="max-w-4xl mx-auto bg-surface-container-low border border-outline-variant/40 rounded-2xl p-space-xs shadow-[0_24px_48px_rgba(0,0,0,0.5)]">
          <form
            onSubmit={handleFormSubmit}
            className="grid grid-cols-1 md:grid-cols-12 gap-space-xs items-center"
          >
            {/* Input 1: Role / Keyword */}
            <div className="md:col-span-5 flex items-center gap-space-sm px-space-sm py-2.5 bg-surface-container rounded-xl">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Role, Tech Stack or Target Company..."
                className="bg-transparent border-none text-on-surface placeholder:text-outline text-body-md focus:outline-none w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchQueryChange('')}
                  className="p-1 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Input 2: Location Dropdown */}
            <div ref={locDropdownRef} className="md:col-span-3 relative">
              <button
                type="button"
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="w-full flex items-center justify-between gap-space-sm px-space-sm py-2.5 bg-surface-container hover:bg-surface-container-high rounded-xl text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px] shrink-0">location_on</span>
                  <span className="truncate text-on-surface text-body-sm font-medium">
                    {(selectedLocation || 'All India').replace(' (Remote & Nationwide)', '')}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-on-surface-variant shrink-0 ml-1" />
              </button>

              {showLocationDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-high border border-outline-variant/40 rounded-xl shadow-2xl z-50 p-2 max-h-72 overflow-y-auto">
                  <input
                    type="text"
                    value={locationSearchFilter}
                    onChange={(e) => setLocationSearchFilter(e.target.value)}
                    placeholder="Search metro / location..."
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary mb-1.5"
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
                              ? 'bg-primary-container text-on-primary-container font-bold'
                              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                          }`}
                        >
                          <span className="truncate">{locName}</span>
                          {isRemote && (
                            <span className="text-[10px] font-semibold text-primary px-1.5 py-0.5 bg-surface-container-highest rounded">
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

            {/* Input 3: Experience Dropdown */}
            <div ref={seniorityDropdownRef} className="md:col-span-2 relative">
              <button
                type="button"
                onClick={() => setShowSeniorityDropdown(!showSeniorityDropdown)}
                className="w-full flex items-center justify-between gap-space-sm px-space-sm py-2.5 bg-surface-container hover:bg-surface-container-high rounded-xl text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px] shrink-0">work_history</span>
                  <span className="truncate text-on-surface text-body-sm font-medium">
                    {selectedSeniorityObj.badge}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-on-surface-variant shrink-0 ml-1" />
              </button>

              {showSeniorityDropdown && (
                <div className="absolute top-full left-0 right-0 md:w-56 mt-2 bg-surface-container-high border border-outline-variant/40 rounded-xl shadow-2xl z-50 p-1.5 space-y-1">
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
                          ? 'bg-primary-container text-on-primary-container font-bold'
                          : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                      }`}
                    >
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input 4: Submit CTA Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-3 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-[0_0_24px_rgba(16,185,129,0.4)] hover:shadow-[0_0_32px_rgba(16,185,129,0.6)] transition-all flex items-center justify-center gap-space-xs cursor-pointer disabled:opacity-70"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    <span>Discover Roles</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Filter Chips / Trending */}
        <div className="flex items-center justify-center gap-space-xs mt-space-md flex-wrap text-label-sm font-label-sm">
          <span className="text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-primary">trending_up</span>
            <span>Trending:</span>
          </span>
          {TRENDING_SEARCHES.map((term, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onSearchQueryChange(term);
                onExecuteSearch();
              }}
              className="px-space-xs py-1 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/30 transition-all cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JonHunterHero;
