import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Archive,
  ClipboardList,
  Menu,
  X,
  Building2,
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import discoveryFiltersConfig from '../../config/discoveryFilters.json';
import { getActiveTheme } from '../../config/themeConfig';

export type JonHunterNavTab = 'discover' | 'career_pages' | 'recommended' | 'archive' | 'saved' | 'tracker';

export interface JonHunterNavProps {
  activeTab: JonHunterNavTab;
  onTabChange: (tab: JonHunterNavTab) => void;
  savedCount?: number;
  appliedCount?: number;
  totalDiscoveredCount?: number;
  onNavigateHome?: () => void;
  onNavigateSignIn?: () => void;
  engineOnline?: boolean | null;
}

export const JonHunterNav: React.FC<JonHunterNavProps> = ({
  activeTab,
  onTabChange,
  appliedCount = 0,
  totalDiscoveredCount = 1000,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = getActiveTheme();

  const navItems = [
    {
      id: 'discover' as JonHunterNavTab,
      label: 'Discover Roles',
      icon: Compass,
    },
    {
      id: 'career_pages' as JonHunterNavTab,
      label: 'Career Pages (Direct ATS)',
      icon: Building2,
      badge: '140+ Boards',
    },
    ...(discoveryFiltersConfig?.showRecommendationsSection ? [{
      id: 'recommended' as JonHunterNavTab,
      label: 'Recommended for You',
      icon: Sparkles,
      badge: 'Curated',
    }] : []),
    {
      id: 'archive' as JonHunterNavTab,
      label: 'Discovered Jobs (1000+)',
      icon: Archive,
      badge: `${totalDiscoveredCount > 0 ? totalDiscoveredCount : '1000'}+ Openings`,
    },
    {
      id: 'tracker' as JonHunterNavTab,
      label: 'Application Tracker',
      icon: ClipboardList,
      count: appliedCount,
    },
  ];

  return (
    <nav className={`sticky top-0 z-30 ${theme.navClass} border-b text-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Official Brand Logo */}
          <div className="flex items-center gap-3">
            <a
              href="/discover"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('discover');
              }}
              className="flex items-center gap-2 group cursor-pointer focus:outline-none"
            >
              <img
                src="/drc-logo-white.png"
                alt="Dheeraj Rathod Consult"
                className="h-8 sm:h-9 w-auto object-contain transition-opacity duration-200 group-hover:opacity-90"
              />
              <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                Executive Portal
              </span>
            </a>
          </div>

          {/* Center: 4 Navigation Tabs (High Visibility Buttons) */}
          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-[#0C121A]/80 border border-[#1B2636] shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isSavedTab = item.id === 'saved';
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer border ${
                    isActive
                      ? isSavedTab
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'bg-[#00C896] text-[#05130D] font-extrabold border-[#00C896] shadow-md shadow-[#00C896]/20'
                      : isSavedTab
                      ? `${theme.innerBoxClass} hover:opacity-90 text-amber-300/90 hover:text-amber-200 border-transparent hover:border-amber-500/30`
                      : 'text-zinc-300 hover:text-white border-transparent hover:bg-white/5'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isSavedTab
                        ? isActive
                          ? 'text-amber-300 fill-amber-300'
                          : 'text-amber-400'
                        : isActive
                        ? 'text-[#05130D]'
                        : 'text-zinc-400'
                    }`}
                  />
                  <span>{item.label}</span>

                  {item.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-black/20 text-[#05130D]' : 'bg-[#00C896]/15 text-[#00C896]'}`}>
                      {item.badge}
                    </span>
                  )}

                  {typeof item.count === 'number' && item.count > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isSavedTab
                          ? isActive
                            ? 'bg-amber-400 text-black'
                            : 'bg-amber-500/25 text-amber-300 border border-amber-500/30'
                          : isActive
                          ? 'bg-black/20 text-[#05130D]'
                          : 'bg-[#252832] text-zinc-200'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: Live Radar Status Indicator */}
          <div className="hidden sm:flex items-center gap-3">
            <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-xs text-zinc-300 shadow-sm`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono font-semibold text-white tracking-tight">9,295+ Openings Live</span>
            </div>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-1.5 rounded-lg text-zinc-300 hover:text-white ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} cursor-pointer`}
              aria-label="Toggle navigation tabs"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden ${theme.navClass} border-b px-4 pt-2 pb-3 space-y-1.5`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isSavedTab = item.id === 'saved';
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                  isActive
                    ? isSavedTab
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-[#00C896]/15 text-[#00C896] border-[#00C896]/35'
                    : isSavedTab
                    ? `${theme.innerBoxClass} text-amber-300 ${theme.innerBoxBorderClass}`
                    : `${theme.innerBoxClass} text-zinc-200 ${theme.innerBoxBorderClass}`
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isSavedTab ? 'text-amber-400 fill-amber-400/40' : 'text-[#00C896]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                      isSavedTab
                        ? 'bg-amber-400 text-black'
                        : 'bg-[#00C896] text-[#0A0A0A]'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};

export default JonHunterNav;
