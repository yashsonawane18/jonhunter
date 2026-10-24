import React, { useState } from 'react';
import {
  Compass,
  Archive,
  Building2,
  Bookmark,
  Menu,
  X,
} from 'lucide-react';
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
  savedCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = getActiveTheme();

  // Clean, professional, uncluttered navigation items
  const navItems = [
    {
      id: 'discover' as JonHunterNavTab,
      label: 'Discover',
      icon: Compass,
    },
    {
      id: 'career_pages' as JonHunterNavTab,
      label: 'Career Pages',
      icon: Building2,
    },
    {
      id: 'archive' as JonHunterNavTab,
      label: '1,000+ Archive',
      icon: Archive,
    },
    {
      id: 'saved' as JonHunterNavTab,
      label: 'Saved',
      icon: Bookmark,
      count: savedCount,
    },
  ];

  return (
    <nav className={`sticky top-0 z-30 ${theme.navClass} border-b text-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Official Brand Logo - Clean & Prominent */}
          <div className="flex items-center">
            <a
              href="/discover"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('discover');
              }}
              className="flex items-center group cursor-pointer focus:outline-none"
            >
              <img
                src="/drc-logo-white.png"
                alt="Dheeraj Rathod Consult"
                className="h-9 sm:h-10 w-auto object-contain transition-opacity duration-200 group-hover:opacity-90"
              />
            </a>
          </div>

          {/* Center: Simplified Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[#0B1017]/90 border border-[#182230] shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isSavedTab = item.id === 'saved';

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? isSavedTab
                        ? 'bg-amber-400 text-black font-extrabold shadow-sm'
                        : 'bg-[#00C896] text-[#05130D] font-extrabold shadow-md shadow-[#00C896]/20'
                      : isSavedTab
                      ? 'text-zinc-300 hover:text-amber-300 hover:bg-white/5'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive
                        ? isSavedTab
                          ? 'fill-black text-black'
                          : 'text-[#05130D]'
                        : isSavedTab && typeof item.count === 'number' && item.count > 0
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-zinc-400'
                    }`}
                  />
                  <span>{item.label}</span>

                  {typeof item.count === 'number' && item.count > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                        isActive
                          ? 'bg-black/25 text-black'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
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
          <div className="hidden sm:flex items-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0E1520] border border-[#1B2636] text-xs text-zinc-300 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono font-medium text-white tracking-tight">9,295+ Verified Openings</span>
            </div>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-zinc-300 hover:text-white bg-[#0E1520] border border-[#1B2636] cursor-pointer"
              aria-label="Toggle navigation tabs"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden ${theme.navClass} border-b px-4 pt-2 pb-3 space-y-1`}>
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                  isActive
                    ? isSavedTab
                      ? 'bg-amber-400 text-black border-amber-400 font-bold'
                      : 'bg-[#00C896] text-[#05130D] border-[#00C896] font-bold'
                    : 'bg-[#0E1520] text-zinc-200 border-[#1B2636] hover:bg-[#141E2E]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-inherit'
                        : isSavedTab
                        ? 'text-amber-400'
                        : 'text-[#00C896]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                      isActive
                        ? 'bg-black/20 text-inherit'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
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
