import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Archive,
  ClipboardList,
  Menu,
  X,
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import discoveryFiltersConfig from '../../config/discoveryFilters.json';
import { getActiveTheme } from '../../config/themeConfig';

export type JonHunterNavTab = 'discover' | 'recommended' | 'archive' | 'saved' | 'tracker';

export interface JonHunterNavProps {
  activeTab: JonHunterNavTab;
  onTabChange: (tab: JonHunterNavTab) => void;
  savedCount?: number;
  appliedCount?: number;
  totalDiscoveredCount?: number;
  onNavigateHome?: () => void;
  onNavigateSignIn?: () => void;
  onUploadResumeClick?: () => void;
  engineOnline?: boolean | null;
}

export const JonHunterNav: React.FC<JonHunterNavProps> = ({
  activeTab,
  onTabChange,
  savedCount = 0,
  appliedCount = 0,
  totalDiscoveredCount = 1500,
  onNavigateHome,
  onNavigateSignIn,
  onUploadResumeClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'discover' as JonHunterNavTab,
      label: 'Discover Roles',
    },
    {
      id: 'archive' as JonHunterNavTab,
      label: `Discovered Jobs (${totalDiscoveredCount > 0 ? totalDiscoveredCount.toLocaleString() : '1,500'}+ Openings)`,
    },
    {
      id: 'tracker' as JonHunterNavTab,
      label: 'Application Tracker',
      count: appliedCount,
    },
  ];

  return (
    <header className="sticky top-0 w-full z-50 bg-surface-dim/90 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
      <div className="h-20 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between gap-space-md">
        {/* Left: DRC Logo & Title */}
        <div className="flex items-center gap-space-md shrink-0">
          <button
            type="button"
            onClick={onNavigateHome || (() => onTabChange('discover'))}
            className="flex items-center gap-space-sm text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant/40 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] group-hover:border-primary/50 transition-colors">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">DRC</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight leading-tight">
                Dheeraj Rathod Consult
              </span>
              <span className="font-badge-caps text-badge-caps text-on-surface-variant uppercase tracking-wider">
                Executive Discovery
              </span>
            </div>
          </button>
          <div className="px-space-xs py-0.5 rounded bg-surface-container-highest text-primary font-badge-caps text-badge-caps uppercase tracking-wider font-bold">
            PORTAL
          </div>
        </div>

        {/* Center: MD Navigation Links */}
        <nav className="hidden xl:flex items-center gap-space-xs">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`px-space-sm py-2 transition-all cursor-pointer text-sm font-medium rounded-lg flex items-center gap-2 ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(16,185,129,0.3)]'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span>{item.label}</span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-on-primary-container text-primary-container' : 'bg-surface-container-high text-primary'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Live Counter, Sign In, Upload Resume CTA */}
        <div className="flex items-center gap-3 sm:gap-space-md shrink-0">
          <div className="hidden md:flex items-center gap-space-xs px-space-sm py-1.5 rounded-full bg-surface-container-high border border-outline-variant/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="font-label-sm text-label-sm text-primary font-semibold">9,295+ Openings Live</span>
          </div>

          {onNavigateSignIn && (
            <button
              type="button"
              onClick={onNavigateSignIn}
              className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors hidden sm:block cursor-pointer"
            >
              Sign In
            </button>
          )}

          <button
            type="button"
            onClick={
              onUploadResumeClick ||
              (() => {
                const banner = document.getElementById('ats-scoring-banner');
                if (banner) {
                  banner.scrollIntoView({ behavior: 'smooth' });
                }
              })
            }
            className="px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-[0_0_24px_rgba(16,185,129,0.35)] hover:shadow-[0_0_32px_rgba(16,185,129,0.5)] transition-all flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span className="hidden sm:inline">Upload Resume (Instant Match)</span>
            <span className="sm:hidden">Upload Resume</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/30 cursor-pointer"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-surface-dim/95 border-b border-outline-variant/30 px-4 py-3 space-y-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span>{item.label}</span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-primary">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default JonHunterNav;
