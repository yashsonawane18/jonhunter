import React from "react";

const ITEMS = [
  { from: "Manual Tester", to: "Business Analyst" },
  { from: "QA Engineer", to: "Product Owner" },
  { from: "Automation Tester", to: "APM" },
  { from: "UAT Analyst", to: "BA" },
  { from: "Senior QA", to: "Product Manager" },
  { from: "Support Engineer", to: "Product Analyst" },
];

export const Ticker: React.FC = () => {
  // Duplicate the array for two separate tracks
  const trackItems = [...ITEMS, ...ITEMS];

  return (
    <>
      <style>
        {`
          @keyframes marquee-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee-scroll 32s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-marquee { animation-play-state: paused; }
          }
        `}
      </style>

      <div className="w-full min-w-0 bg-[#051810]/95 border-y border-[#4ade80]/25 py-3.5 sm:py-5 overflow-hidden relative select-none">
        {/* Edge gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-20 md:w-36 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-20 md:w-36 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>

        <div className="flex whitespace-nowrap overflow-hidden">
          {/* Track 1 */}
          <div className="flex animate-marquee gap-7 sm:gap-14 shrink-0 items-center justify-around pr-7 sm:pr-14">
            {trackItems.map((item, idx) => (
              <span key={`track1-${idx}`} className="flex items-center gap-7 sm:gap-14">
                <span className="text-sm sm:text-base font-normal text-gray-300 flex items-center gap-3 select-none">
                  <span className="tracking-tight">{item.from}</span>
                  <span className="text-[#4ade80]/80">→</span>
                  <span className="text-white font-medium tracking-tight">{item.to}</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] inline-block shadow-[0_0_8px_rgba(74,222,128,0.6)] shrink-0"></span>
              </span>
            ))}
          </div>

          {/* Track 2 – duplicate for seamless looping */}
          <div className="flex animate-marquee gap-7 sm:gap-14 shrink-0 items-center justify-around pr-7 sm:pr-14" aria-hidden="true">
            {trackItems.map((item, idx) => (
              <span key={`track2-${idx}`} className="flex items-center gap-7 sm:gap-14">
                <span className="text-sm sm:text-base font-normal text-gray-300 flex items-center gap-3 select-none">
                  <span className="tracking-tight">{item.from}</span>
                  <span className="text-[#4ade80]/80">→</span>
                  <span className="text-white font-medium tracking-tight">{item.to}</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] inline-block shadow-[0_0_8px_rgba(74,222,128,0.6)] shrink-0"></span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Ticker;
