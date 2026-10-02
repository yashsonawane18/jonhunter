// ProgramsSection.tsx
import React from "react";

export const ProgramsSection: React.FC = () => {
  const programs = [
    {
      title: "QA → BA / PO",
      tag: "Most popular",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="m7 14 4-4 4 4 6-6" />
        </svg>
      ),
      sub: "CAREER TRANSITION · 15 DAYS",
      description:
        "The flagship. Reposition your QA experience into Business Analyst & Product Owner roles — with a dedicated team applying to jobs for you.",
      features: [
        "BRD, FRD, PRD & Agile mastery",
        "1:1 resume + LinkedIn rebuild",
        "200+ applications done for you",
      ],
      audience: "QA · TEST · UAT · SUPPORT",
      ctaText: "Enroll",
      featured: true,
    },
    {
      title: "Data Science",
      tag: "High demand",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14a9 3 0 0 0 18 0V5" />
          <path d="M3 12a9 3 0 0 0 18 0" />
        </svg>
      ),
      sub: "DATA & ANALYTICS TRACK",
      description:
        "Move from testing & IT into data roles. Python, SQL, statistics, ML foundations, and real portfolio projects that get you interviews.",
      features: [
        "Python · SQL · Pandas · viz",
        "ML & analytics case studies",
        "Portfolio + placement support",
      ],
      audience: "IT · ANALYST · ENGINEER",
      ctaText: "Learn more",
      featured: false,
    },
    {
      title: "GenAI Course",
      tag: "New",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a7 7 0 0 0-4 12.7V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.3A7 7 0 0 0 12 2z" />
          <path d="M9 21h6" />
        </svg>
      ),
      sub: "AI FOR PROFESSIONALS",
      description:
        "Become AI-fluent. Prompt engineering, LLM apps, and AI tools that 10x BA, PM & analyst work — the most future-proof skill in tech.",
      features: [
        "Prompt engineering & LLM apps",
        "AI for product & analysis work",
        "Hands-on build projects",
      ],
      audience: "ALL BACKGROUNDS",
      ctaText: "Learn more",
      featured: false,
    },
  ];

  return (
    <>
      <style>
        {`
          .program-card {
            transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
          }
          .program-card:hover {
            transform: translateY(-3px);
            border-color: rgba(74, 222, 128, 0.35);
            background: linear-gradient(180deg, rgba(74, 222, 128, 0.05), transparent);
          }
        `}
      </style>

      <section id="programs" className="relative py-24" style={{ background: "#07090a" }}>
        <div className="max-w-[1240px] mx-auto px-6 md:px-8">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <div className="flex items-center gap-2 mb-4 font-['JetBrains_Mono',monospace] text-xs tracking-[0.18em] text-[#4ade80]">
              <span className="opacity-60">//</span>
              <span>OUR PROGRAMS</span>
            </div>
            <h2 className="font-['Space_Grotesk',sans-serif] font-semibold leading-tight tracking-tighter text-4xl md:text-5xl lg:text-6xl text-white">
              Pick the track that
              <br />
              matches your{" "}
              <span className="bg-gradient-to-r from-[#4ade80] to-[#059669] bg-clip-text text-transparent">
                next move.
              </span>
            </h2>
            <p className="mt-4 text-[#9fa8a1] text-lg max-w-2xl">
              Whatever your background, there's a guided, mentored path into a
              high-growth, high-paying role. Every track is live, hands-on, and
              ends with placement support.
            </p>
          </div>

          {/* Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program, idx) => (
              <div
                key={idx}
                className={`program-card relative p-8 rounded-2xl border flex flex-col h-full ${
                  program.featured
                    ? "border-[#4ade80]/40 bg-gradient-to-b from-[#4ade80]/10 to-[#059669]/5"
                    : "border-white/10 bg-gradient-to-b from-white/5 to-transparent"
                }`}
              >
                {/* Tag */}
                <span className="absolute top-5 right-6 font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.12em] uppercase text-[#4ade80]">
                  {program.tag}
                </span>

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4ade80]/20 to-[#059669]/10 border border-[#4ade80]/20 flex items-center justify-center text-[#4ade80] mb-5">
                  {program.icon}
                </div>

                {/* Title & Sub */}
                <h3 className="font-['Space_Grotesk',sans-serif] font-semibold text-2xl tracking-tight text-white">
                  {program.title}
                </h3>
                <div className="font-['JetBrains_Mono',monospace] text-[11px] tracking-[0.08em] text-[#4ade80] mt-1 mb-3">
                  {program.sub}
                </div>

                {/* Description */}
                <p className="text-[#9fa8a1] text-sm leading-relaxed mb-5">
                  {program.description}
                </p>

                {/* Features list */}
                <ul className="space-y-2 mb-6 flex-1">
                  {program.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13.5px] text-[#9fa8a1]">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="text-[#4ade80] mt-0.5 flex-shrink-0"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Footer with audience and CTA */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                  <span className="font-['JetBrains_Mono',monospace] text-[11px] tracking-[0.06em] text-[#6c7670]">
                    {program.audience}
                  </span>
                  <a
                    href="#register"
                    className="inline-flex items-center gap-1 text-[#4ade80] font-semibold text-sm hover:gap-2 transition-all"
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector("#register")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {program.ctaText} <span className="arrow">→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
