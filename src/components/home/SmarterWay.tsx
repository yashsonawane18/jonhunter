import React from 'react';
import { UserCheck, Sliders, CheckCircle2 } from 'lucide-react';

export const SmarterWay: React.FC = () => {
  const steps = [
    {
      num: "01",
      icon: UserCheck,
      title: "1. Tell us about your goals",
      description: "Define your ideal compensation, tech stack, workplace model (Remote vs Hybrid), and target tier-1 organizations.",
      snippet: "config.career_preferences = {\n  workplace: 'remote',\n  role_level: 'Senior / Staff',\n  min_base: '$180,000'\n};"
    },
    {
      num: "02",
      icon: Sliders,
      title: "2. Handpick verified requisitions",
      description: "Our crawler surfaces live openings across Greenhouse, Ashby, and Lever. You approve or reject in one click.",
      snippet: "POST /api/jobs/track\n{\n  job_id: 'gh_603841',\n  status: 'approved_for_application'\n}"
    },
    {
      num: "03",
      icon: CheckCircle2,
      title: "3. Human specialists apply for you",
      description: "No bot spam. Our specialists craft tailored answers, adapt your CV for the ATS schema, and submit directly.",
      snippet: "// Tailored ATS Schema Match\n{\n  fit_grade: 'A+',\n  semantic_score: 94,\n  submitted: true\n}"
    }
  ];

  return (
    <section className="bg-[#121212] py-20 border-b border-[#2e2e2e]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-[0.1em] text-[#3ecf8e] font-mono mb-3">
            HOW IT WORKS
          </div>
          <h2 className="text-3xl sm:text-4xl font-normal text-[#fafafa] tracking-[-0.007em] mb-4">
            The deliberate way to land a top role.
          </h2>
          <p className="text-sm sm:text-base font-normal text-[#b4b4b4] leading-relaxed tracking-[-0.007em]">
            Recruiters immediately filter out automated AI form-fillers. 
            We combine high-speed ATS discovery with human domain specialist submissions.
          </p>
        </div>

        {/* Feature Cards Grid: 16px radius, #121212 background, 1px solid #2e2e2e border */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-[#121212] rounded-[16px] p-6 border border-[#2e2e2e] hover:border-[#4d4d4d] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-mono text-[#3ecf8e] px-2 py-0.5 rounded-full bg-[#181818] border border-[#2e2e2e]">
                      STEP {step.num}
                    </span>
                    <Icon className="w-5 h-5 text-[#898989]" />
                  </div>

                  <h3 className="text-lg font-medium text-[#fafafa] mb-2 tracking-[-0.007em]">
                    {step.title}
                  </h3>
                  <p className="text-sm font-normal text-[#b4b4b4] leading-relaxed tracking-[-0.007em] mb-6">
                    {step.description}
                  </p>
                </div>

                {/* Dark Code-Style illustration snippet: #0d0d0d background, #4d4d4d text, phosphor accents */}
                <div className="rounded-lg bg-[#0d0d0d] border border-[#2e2e2e] p-3 font-mono text-[11px] text-[#898989] leading-relaxed overflow-x-auto whitespace-pre">
                  <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-[#242424]">
                    <span className="w-2 h-2 rounded-full bg-[#2e2e2e]" />
                    <span className="w-2 h-2 rounded-full bg-[#2e2e2e]" />
                    <span className="w-2 h-2 rounded-full bg-[#2e2e2e]" />
                    <span className="text-[10px] text-[#4d4d4d] ml-1">spec.ts</span>
                  </div>
                  {step.snippet}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};