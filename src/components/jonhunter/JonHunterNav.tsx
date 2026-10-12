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
        <div className="flex items-center justify-between h-14">
          {/* Sub-Header Branding / Context */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#18191E] border border-[#262830] flex items-center justify-center text-[#00C896] shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-1.5">
                <span>Dheeraj Rathod Consult</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30 font-mono font-bold">
                  PORTAL
                </span>
              </span>
            </div>
          </div>

          {/* Center: 4 Navigation Tabs (High Visibility Buttons) */}
          <div className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isSavedTab = item.id === 'saved';
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer border ${
                    isActive
                      ? isSavedTab
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'bg-[#00C896]/15 text-[#00C896] border-[#00C896]/35 shadow-sm'
                      : isSavedTab
                      ? `${theme.innerBoxClass} hover:opacity-90 text-amber-300/90 hover:text-amber-200 border ${theme.innerBoxBorderClass} hover:border-amber-500/30`
                      : `${theme.innerBoxClass} hover:opacity-90 text-zinc-300 hover:text-white border ${theme.innerBoxBorderClass} hover:border-[#00C896]/30`
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isSavedTab
                        ? isActive
                          ? 'text-amber-300 fill-amber-300'
                          : 'text-amber-400'
                        : isActive
                        ? 'text-[#00C896]'
                        : 'text-zinc-400'
                    }`}
                  />
                  <span>{item.label}</span>

                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#00C896]/20 text-[#00C896]">
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
                          ? 'bg-[#00C896] text-[#0A0A0A]'
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

          {/* Right: Live Verified Count */}
          <div className="hidden sm:flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${theme.innerBoxClass} border ${theme.innerBoxBorderClass} text-xs text-zinc-300`}>
              <span className="inline-block w-2 h-2 rounded-full bg-[#00C896]" />
              <span className="font-mono font-medium text-white">9,295+ Openings Live</span>
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
                    ? 'bg-[#18191E] text-amber-300 border-[#262830]'
                    : 'bg-[#18191E] text-zinc-200 border-[#262830]'
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
