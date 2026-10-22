import React from "react";
import { ArrowRight, BookOpen, Sparkles, Terminal, Compass } from "lucide-react";

interface SiteIntegrationProps {
  onNavigateToSignup?: () => void;
  onNavigateToQAtoBA?: () => void;
  onNavigateToDiscover?: () => void;
}

export const SiteIntegration: React.FC<SiteIntegrationProps> = ({
  onNavigateToSignup,
  onNavigateToQAtoBA,
  onNavigateToDiscover,
}) => {
  const handleDiscover = () => {
    if (onNavigateToDiscover) {
      onNavigateToDiscover();
    } else {
      window.location.href = '/discover';
    }
  };

  const partnerLogos = [
    "Google",
    "Microsoft",
    "Amazon",
    "Stripe",
    "Uber",
    "Meta",
    "Datadog",
    "Snowflake"
  ];

  return (
    <div className="bg-[#121212] pt-24 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#2e2e2e]">
      <div className="max-w-[1200px] mx-auto text-center">
        {/* Supabase Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#242424] border border-[#2e2e2e] text-xs font-normal text-[#b4b4b4] tracking-[-0.007em] mb-8 hover:border-[#4d4d4d] transition-colors cursor-pointer"
          onClick={onNavigateToQAtoBA}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#3ecf8e]" />
          <span>New: QA → BA / PO Career Transition Program</span>
          <span className="text-[#898989] font-mono text-[11px]">→</span>
        </div>

        {/* Display Headline: 72px Circular weight 400 (deliberate anti-bold), #fafafa, -0.007em tracking */}
        <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-normal leading-[1.05] tracking-[-0.007em] text-[#fafafa] max-w-4xl mx-auto mb-6">
          Land High-Paying Roles.
          <span className="block text-[#3ecf8e] mt-1 font-normal">
            A Dedicated Team Applies On Your Behalf.
          </span>
        </h1>

        {/* Subtitle: 16px Circular 400, #b4b4b4, line-height 1.5 */}
        <p className="text-base sm:text-lg font-normal leading-relaxed text-[#b4b4b4] max-w-2xl mx-auto tracking-[-0.007em] mb-10">
          Stop wasting hours on applications that get lost in black-box applicant tracking systems. 
          We pair you with career specialists and a deterministic discovery engine crawling 850+ tier-1 corporate career boards.
        </p>

        {/* Action Button Row: Pill Primary (#3ecf8e fill, 9999px radius) & Pill Ghost */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
          <button
            type="button"
            onClick={onNavigateToSignup}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-medium tracking-[-0.007em] text-[#121212] bg-[#3ecf8e] hover:bg-[#00c573] border border-[#3ecf8e] hover:border-[#1f4b37] transition-all cursor-pointer select-none"
          >
            Start Your Job Search
          </button>

          <button
            type="button"
            onClick={handleDiscoverClickHelper}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-normal tracking-[-0.007em] text-[#fafafa] bg-transparent hover:bg-white/[0.04] border border-[#393939] hover:border-[#4d4d4d] transition-all cursor-pointer select-none"
          >
            <Compass className="w-4 h-4 text-[#3ecf8e]" />
            <span>Discover 850+ Live Boards</span>
          </button>
        </div>

        {/* Feature Banner: 16px radius card, 1px solid #2e2e2e */}
        <div className="max-w-2xl mx-auto p-4 sm:p-5 rounded-[16px] bg-[#121212] border border-[#2e2e2e] flex flex-col sm:flex-row items-center justify-between gap-4 text-left mb-16">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-[#242424] border border-[#2e2e2e] flex items-center justify-center flex-shrink-0">
              <Terminal className="w-4 h-4 text-[#3ecf8e]" />
            </div>
            <div>
              <div className="text-sm font-medium text-[#fafafa] tracking-[-0.007em]">
                Verified Corporate ATS Ingestion
              </div>
              <div className="text-xs font-normal text-[#898989] tracking-[-0.007em]">
                Direct API connections to Greenhouse, Ashby, Lever & SmartRecruiters.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToQAtoBA}
            className="px-4 py-1.5 rounded-full text-xs font-normal text-[#fafafa] border border-[#393939] hover:border-[#4d4d4d] bg-[#242424] hover:bg-[#2e2e2e] transition-colors whitespace-nowrap"
          >
            Explore Program →
          </button>
        </div>

        {/* Logo Cloud Strip: #898989 monochrome text/marks on #121212 canvas */}
        <div className="pt-8 border-t border-[#2e2e2e]">
          <div className="text-xs uppercase font-normal tracking-[0.1em] text-[#898989] mb-6">
            Candidates placed across tier-1 engineering organizations
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-80">
            {partnerLogos.map((logo) => (
              <span
                key={logo}
                className="text-sm sm:text-base font-normal tracking-tight text-[#898989] hover:text-[#b4b4b4] transition-colors font-mono select-none"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  function handleDiscoverClickHelper() {
    if (onNavigateToDiscover) {
      onNavigateToDiscover();
    } else {
      window.location.href = '/discover';
    }
  }
};