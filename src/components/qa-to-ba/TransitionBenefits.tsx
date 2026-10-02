import React from 'react';
import {
  BookOpen,
  Layout,
  Zap,
  FileText,
  MessageSquare,
  Users,
  Sparkles,
  Award,
} from 'lucide-react';

export const TransitionBenefits: React.FC = () => {
  return (
    <section
      className="py-14 sm:py-20 relative overflow-hidden border-t border-white/5 bg-[#030712]"
      id="successful-transition-benefits"
    >
      {/* Decorative background radial lights */}
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-[#22c55e]/[0.015] blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/3 left-10 w-[350px] h-[350px] bg-emerald-500/[0.015] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            Everything You Need for <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green via-emerald-400 to-neon-emerald">
              A Successful Transition
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mt-4 leading-relaxed max-w-2xl mx-auto font-light">
            We focus entirely on concrete outcomes and placement readiness rather than tedious theory lessons. Here is exactly what is provided to guarantee your success.
          </p>
        </div>

        {/* Premium Benefit Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              title: "Business Analysis Fundamentals",
              description:
                "Map crisp workflow diagrams, draft structured requirements, and learn the exact methodologies used by top modern engineering squads.",
              icon: <BookOpen size={18} />,
              accentColor: "group-hover:border-neon-green/30",
              iconBg:
                "bg-neon-green/10 text-neon-green border-neon-green/20",
            },
            {
              title: "Real Business Scenarios",
              description:
                "Solve authentic enterprise backlog requests. Build actual specs, design edge cases, and run real sprint ceremonies inside Jira.",
              icon: <Layout size={18} />,
              accentColor: "group-hover:border-[#38bdf8]/30",
              iconBg:
                "bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/20",
            },
            {
              title: "Product Thinking",
              description:
                "Evolve from a simple task executor. Prioritize products using RICE/MoSCoW models and make value-driven backlog decisions.",
              icon: <Zap size={18} />,
              accentColor: "group-hover:border-[#a855f7]/30",
              iconBg:
                "bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/20",
            },
            {
              title: "Resume & LinkedIn Reviews",
              description:
                "Receive a professional profile overhaul. Highlight high-value keywords to systemically clear strict recruiter ATS filters.",
              icon: <FileText size={18} />,
              accentColor: "group-hover:border-[#f43f5e]/30",
              iconBg:
                "bg-[#f43f5e]/10 text-[#f43f5e] border-[#f43f5e]/20",
            },
            {
              title: "Mock Interviews",
              description:
                "Simulate rigorous, realistic interviews with active industry leads. Learn to answer tricky logic and estimation questions with ease.",
              icon: <MessageSquare size={18} />,
              accentColor: "group-hover:border-[#fb923c]/30",
              iconBg:
                "bg-[#fb923c]/10 text-[#fb923c] border-[#fb923c]/20",
            },
            {
              title: "Career Mentorship",
              description:
                "Get direct validation of your learning progress and specs from seasoned product mentors who have walked the same path.",
              icon: <Users size={18} />,
              accentColor: "group-hover:border-[#06b6d4]/30",
              iconBg:
                "bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]/20",
            },
            {
              title: "Community Support",
              description:
                "Cooperate with transition candidates worldwide. Share interview tips, exchange homework feedback, and maintain deep daily drive.",
              icon: <Sparkles size={18} />,
              accentColor: "group-hover:border-[#eab308]/30",
              iconBg:
                "bg-[#eab308]/10 text-[#eab308] border-[#eab308]/20",
            },
            {
              title: "Placement Guidance",
              description:
                "Get direct ecosystem referrals, targeted warm recruiter hooks, and active expert backing during final salary negotiations.",
              icon: <Award size={18} />,
              accentColor: "group-hover:border-neon-emerald/30",
              iconBg:
                "bg-emerald-500/10 text-neon-emerald border-emerald-500/20",
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className={`group min-w-0 bg-[#080d19]/40 border border-white/5 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:bg-[#0c1426] hover:-translate-y-1 flex flex-col justify-between ${card.accentColor}`}
            >
              <div>
                {/* Top line with Icon only */}
                <div className="mb-4 sm:mb-6">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border ${card.iconBg} text-lg shrink-0 inline-flex`}
                  >
                    {card.icon}
                  </div>
                </div>

                {/* Benefit Card Titles & Description */}
                <h4 className="text-base font-bold text-white tracking-wide mb-3 group-hover:text-neon-green transition-colors leading-snug">
                  {card.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-400 font-light leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransitionBenefits;
