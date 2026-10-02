// WhyProductRoles.tsx
import React from "react";

export const WhyProductRoles: React.FC = () => {
  const cards = [
    {
      label: "Salary",
      title: "Better salary growth",
      desc: "BA / PO / PM bands sit 30–100% above equivalent QA bands at every experience level.",
    },
    {
      label: "Strategy",
      title: "Strategic responsibilities",
      desc: "Own the “what” and “why” — not just the “did it ship clean.” Sit at the decision table.",
    },
    {
      label: "Leadership",
      title: "Leadership opportunities",
      desc: "PO → Senior PO → PM → Director runs much longer and steeper than QA → QA Lead → Manager.",
    },
    {
      label: "Balance",
      title: "Better work-life balance",
      desc: "No more weekend regression cycles or release-night fire drills. Calendar control comes back.",
    },
    {
      label: "Velocity",
      title: "Faster career progression",
      desc: "Promotion cycles are shorter — every released feature is a portfolio item, not a closed ticket.",
    },
    {
      label: "Demand",
      title: "Higher industry demand",
      desc: "BA / PO / PM openings keep growing — cross-industry, cross-stack, AI-resistant.",
    },
  ];

  return (
    <>
      <style>
        {`
          .why-card:hover {
            transform: translateY(-3px);
            border-color: rgba(74, 222, 128, 0.3);
          }
        `}
      </style>

      <section
        className="relative py-24 overflow-hidden"
        style={{ background: "#07090a" }}
      >
        {/* Radial background effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(50% 60% at 80% 20%, rgba(74,222,128,0.08), transparent 65%)",
          }}
        />

        <div className="relative z-10 max-w-[1240px] mx-auto px-6 md:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-2 mb-4 font-['JetBrains_Mono',monospace] text-xs tracking-[0.18em] text-[#4ade80]">
              <span className="opacity-60">//</span>
              <span>WHY PRODUCT ROLES?</span>
            </div>
            <h2 className="font-['Space_Grotesk',sans-serif] font-semibold leading-tight tracking-tighter text-4xl md:text-5xl lg:text-6xl text-white">
              The career math is{" "}
              <span className="bg-gradient-to-r from-[#4ade80] to-[#059669] bg-clip-text text-transparent">
                simple.
              </span>
            </h2>
            <p className="mt-4 text-[#9fa8a1] text-lg max-w-2xl mx-auto">
              Product roles outperform QA on every metric that matters — salary,
              autonomy, leadership runway, work-life balance, and demand.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((card, idx) => (
              <div
                key={idx}
                className="why-card p-7 rounded-xl border border-white/10 bg-gradient-to-b from-[#4ade80]/5 to-transparent transition-all duration-200 cursor-default"
              >
                <div className="inline-flex items-center gap-2 font-['JetBrains_Mono',monospace] text-xs tracking-[0.14em] uppercase text-[#4ade80]">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 17l6-6 4 4 8-8" />
                    <path d="M14 7h7v7" />
                  </svg>
                  {card.label}
                </div>
                <h4 className="font-['Space_Grotesk',sans-serif] font-semibold text-xl tracking-tight text-white mt-4 mb-2">
                  {card.title}
                </h4>
                <p className="text-[#9fa8a1] text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Bottom Banner */}
          <div
            className="mt-12 p-8 rounded-2xl border border-[#4ade80]/35 bg-gradient-to-r from-[#4ade80]/10 to-[#059669]/5 flex flex-wrap items-center justify-between gap-6"
          >
            <div>
              <div className="font-['JetBrains_Mono',monospace] text-xs tracking-[0.14em] text-[#4ade80]">
                // REAL OUTCOME · ACROSS COHORTS
              </div>
              <div className="font-['Space_Grotesk',sans-serif] font-semibold text-4xl md:text-5xl lg:text-6xl tracking-tighter mt-2">
                <span className="bg-gradient-to-r from-[#4ade80] to-[#059669] bg-clip-text text-transparent">
                  50% – 200%
                </span>{" "}
                salary hikes
              </div>
            </div>
            <div className="text-[#9fa8a1] text-base max-w-md leading-relaxed">
              at first product role transition. Most professionals see their
              salary climb again within 12 months once they're inside the
              product track.
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

