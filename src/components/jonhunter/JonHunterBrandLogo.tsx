import React from 'react';

interface JonHunterBrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

export const JonHunterBrandLogo: React.FC<JonHunterBrandLogoProps> = ({
  className = '',
  size = 'md',
  showBadge = true,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  }[size];

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* High-Tech Glowing Emblem Icon */}
      <div className={`relative ${iconDimensions} rounded-xl bg-gradient-to-br from-[#0F1C18] to-[#0A1210] border border-[#00C896]/40 p-1.5 shadow-lg shadow-[#00C896]/15 flex items-center justify-center group-hover:border-[#00C896] transition-all duration-300`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-xl bg-[#00C896]/10 blur-sm pointer-events-none" />

        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10"
        >
          <defs>
            <linearGradient id="jhGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E5AA" />
              <stop offset="50%" stopColor="#00C896" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Radar target rings */}
          <circle cx="16" cy="16" r="13" stroke="url(#jhGradient)" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="3 3" />
          <circle cx="16" cy="16" r="9" stroke="url(#jhGradient)" strokeWidth="1.75" strokeOpacity="0.8" />
          
          {/* Crosshair ticks */}
          <line x1="16" y1="2" x2="16" y2="6" stroke="url(#jhGradient)" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="26" x2="16" y2="30" stroke="url(#jhGradient)" strokeWidth="2" strokeLinecap="round" />
          <line x1="2" y1="16" x2="6" y2="16" stroke="url(#jhGradient)" strokeWidth="2" strokeLinecap="round" />
          <line x1="26" y1="16" x2="30" y2="16" stroke="url(#jhGradient)" strokeWidth="2" strokeLinecap="round" />

          {/* Futuristic Target Monogram Arrow / Core */}
          <path
            d="M16 8L21 16L16 24L11 16L16 8Z"
            fill="url(#jhGradient)"
            fillOpacity="0.2"
            stroke="url(#jhGradient)"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="16" r="2.5" fill="#00E5AA" filter="url(#glow)" />
        </svg>
      </div>

      {/* Brand Typographic Wordmark */}
      <div className="flex items-center gap-2">
        <span className={`font-black tracking-tight ${textSizes} text-white flex items-center`}>
          <span>Jon</span>
          <span className="bg-gradient-to-r from-[#00E5AA] via-[#00C896] to-[#10B981] bg-clip-text text-transparent">
            Hunter
          </span>
        </span>

        {showBadge && (
          <span className="hidden xs:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase bg-[#00C896]/15 text-[#00E5AA] border border-[#00C896]/30 shadow-sm">
            AI
          </span>
        )}
      </div>
    </div>
  );
};

export default JonHunterBrandLogo;
