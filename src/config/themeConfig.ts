import React from 'react';
import discoveryFiltersConfig from './discoveryFilters.json';

export type BackgroundThemeKey = 'black' | 'green' | 'midnight_emerald';

export interface ThemeDefinition {
  key: BackgroundThemeKey;
  label: string;
  wrapperClass: string;
  wrapperStyle: React.CSSProperties;
  navClass: string;
  cardClass: string;
  cardHoverClass: string;
  cardBorderClass: string;
  innerBoxClass: string;
  innerBoxBorderClass: string;
  pillActiveClass: string;
  pillInactiveClass: string;
  accentGreen: string;
  accentGlowSvg?: boolean;
}

export const THEMES: Record<BackgroundThemeKey, ThemeDefinition> = {
  // Option 1: Executive Midnight Dark (Polished Enterprise B2B Aesthetic)
  black: {
    key: 'black',
    label: 'Executive Midnight Slate',
    wrapperClass: 'bg-[#080B0F] text-white selection:bg-[#00C896]/20 selection:text-[#00C896]',
    wrapperStyle: {
      backgroundColor: '#080B0F',
      backgroundImage: `
        radial-gradient(ellipse 80% 45% at 50% -8%, rgba(0, 200, 150, 0.16) 0%, rgba(8, 11, 15, 0.95) 55%, #080B0F 100%),
        radial-gradient(circle at 10% 40%, rgba(16, 185, 129, 0.03) 0%, transparent 40%),
        radial-gradient(circle at 90% 70%, rgba(14, 165, 233, 0.03) 0%, transparent 40%)
      `,
      backgroundAttachment: 'fixed',
    },
    navClass: 'bg-[#080B0F]/90 backdrop-blur-xl border-[#1A2433]',
    cardClass: 'bg-[#0E1520]/95 backdrop-blur-md text-white shadow-xl',
    cardHoverClass: 'hover:bg-[#121B28] hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/5',
    cardBorderClass: 'border-[#1B2636]',
    innerBoxClass: 'bg-[#131B26] text-zinc-100',
    innerBoxBorderClass: 'border-[#202D40]',
    pillActiveClass: 'bg-[#00C896] text-[#05130D] font-extrabold shadow-md shadow-[#00C896]/25',
    pillInactiveClass: 'text-zinc-300 hover:text-white',
    accentGreen: '#00C896',
    accentGlowSvg: true,
  },

  // Option 2: Green Dark Combination from jonhunter.vercel.app (Dheeraj Rathod Consult signature aesthetic)
  green: {
    key: 'green',
    label: 'DRC Deep Emerald & Dark Green',
    wrapperClass: 'bg-[#03140E] text-white relative',
    wrapperStyle: {
      backgroundColor: '#03140E',
      backgroundImage: `
        radial-gradient(ellipse 95% 65% at 50% -8%, rgba(18, 128, 92, 0.42) 0%, rgba(5, 33, 23, 0.90) 45%, #03140E 100%),
        radial-gradient(circle at 15% 30%, rgba(0, 200, 150, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 85% 60%, rgba(18, 128, 92, 0.12) 0%, transparent 45%)
      `,
      backgroundAttachment: 'fixed',
    },
    navClass: 'bg-[#041B13]/90 backdrop-blur-md border-[#114533]',
    cardClass: 'bg-[#07241A]/90 backdrop-blur-sm text-white',
    cardHoverClass: 'hover:bg-[#0A2E21] hover:border-[#00C896]/60',
    cardBorderClass: 'border-[#134937]',
    innerBoxClass: 'bg-[#0B3023] text-zinc-100',
    innerBoxBorderClass: 'border-[#1B5742]',
    pillActiveClass: 'bg-[#00C896] text-[#0A0A0A] font-bold shadow-md shadow-[#00C896]/20',
    pillInactiveClass: 'text-emerald-100/80 hover:text-white',
    accentGreen: '#00C896',
    accentGlowSvg: true,
  },

  // Option 3: Cyber Slate & Emerald Duotone (Senior UI/UX Designer recommendation)
  midnight_emerald: {
    key: 'midnight_emerald',
    label: 'Cyber Slate & Ambient Emerald',
    wrapperClass: 'bg-[#080D12] text-white relative',
    wrapperStyle: {
      backgroundColor: '#080D12',
      backgroundImage: `
        radial-gradient(ellipse 85% 55% at 50% -10%, rgba(0, 200, 150, 0.22) 0%, rgba(11, 23, 33, 0.85) 50%, #080D12 100%),
        radial-gradient(ellipse 60% 40% at 95% 90%, rgba(14, 165, 233, 0.08) 0%, transparent 60%)
      `,
      backgroundAttachment: 'fixed',
    },
    navClass: 'bg-[#0B1520]/90 backdrop-blur-md border-[#1B2A3A]',
    cardClass: 'bg-[#0E1B26]/90 backdrop-blur-sm text-white',
    cardHoverClass: 'hover:bg-[#122332] hover:border-[#00C896]/60',
    cardBorderClass: 'border-[#1D3246]',
    innerBoxClass: 'bg-[#142636] text-zinc-100',
    innerBoxBorderClass: 'border-[#243D54]',
    pillActiveClass: 'bg-[#00C896] text-[#0A0A0A] font-bold shadow-md shadow-[#00C896]/20',
    pillInactiveClass: 'text-zinc-300 hover:text-white',
    accentGreen: '#00C896',
    accentGlowSvg: true,
  },
};

/**
 * Returns active theme configured via discoveryFilters.json
 */
export const getActiveTheme = (): ThemeDefinition => {
  const configuredTheme = (discoveryFiltersConfig as any)?.backgroundTheme as BackgroundThemeKey;
  if (configuredTheme && THEMES[configuredTheme]) {
    return THEMES[configuredTheme];
  }
  return THEMES['green']; // Default to DRC green dark combination
};
