import React from "react";
import {
  GitBranch,
  Users,
  Layers,
  FileText,
  TrendingUp,
  MessageSquare,
  Briefcase,
  Award,
} from "lucide-react";

export const TransitionFramework: React.FC = () => {
  return (
    <section className="py-14 sm:py-20 relative font-sans border-t border-white/5 bg-gradient-to-b from-black via-[#060b13] to-black overflow-hidden" id="transition-framework-section">
      {/* Decorative background lights */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-neon-green/[0.02] blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/[0.02] blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/25 text-[10px] font-black text-neon-green uppercase tracking-widest mb-4">
            <GitBranch size={12} className="text-neon-green animate-pulse" /> THE TRANSITION FRAMEWORK
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            A Structured Path to <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-emerald">
              Your Next Role
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mt-4 leading-relaxed max-w-2xl mx-auto font-light">
            Show that this isn't just another course. It's a structured career journey designed to guide you step-by-step from raw potential to placement.
          </p>
        </div>

        {/* Minimal Elegant Roadmap Timeline */}
        <div className="max-w-4xl mx-auto relative pl-6 min-[360px]:pl-8 sm:pl-10 border-l border-white/10 space-y-8 sm:space-y-12">
          {[
            {
              step: "01",
              title: "Career Assessment",
              purpose: "Identify your transferable skills and align your background with high-demand BA/PO tracks.",
              icon: <Users size={16} />,
              color: "text-neon-green bg-neon-green/10 border-neon-green/30"
            },
            {
              step: "02",
              title: "Skill Gap Analysis",
              purpose: "Uncover critical methodology, document creation, and technical concepts you need to master.",
              icon: <Layers size={16} />,
              color: "text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/30"
            },
            {
              step: "03",
              title: "Personalised Roadmap",
              purpose: "Build a customized week-by-week learning checklist tailored to your target roles and experience.",
              icon: <GitBranch size={16} />,
              color: "text-[#a855f7] bg-[#a855f7]/10 border-[#a855f7]/30"
            },
            {
              step: "04",
              title: "Hands-on Learning",
              purpose: "Write real specs, draft INVEST user stories, map flowcharts in Miro, and coordinate inside live Jira boards.",
              icon: <FileText size={16} />,
              color: "text-[#f43f5e] bg-[#f43f5e]/10 border-[#f43f5e]/30"
            },
            {
              step: "05",
              title: "Resume & LinkedIn Optimisation",
              purpose: "Overhaul your online presence and CV with target industry keywords to clear recruiters' ATS screening.",
              icon: <TrendingUp size={16} />,
              color: "text-[#fb923c] bg-[#fb923c]/10 border-[#fb923c]/30"
            },
            {
              step: "06",
              title: "Mock Interviews",
              purpose: "Simulate rigorous product and analyst round tables with seasoned hiring managers to build ultimate confidence.",
              icon: <MessageSquare size={16} />,
              color: "text-[#eab308] bg-[#eab308]/10 border-[#eab308]/30"
            },
            {
              step: "07",
              title: "Placement Guidance",
              purpose: "Get direct introductions, target recruiters, and receive expert support during salary negotiation stages.",
              icon: <Briefcase size={16} />,
              color: "text-[#06b6d4] bg-[#06b6d4]/10 border-[#06b6d4]/30"
            },
            {
              step: "08",
              title: "Business Analyst / Product Role",
              purpose: "Step into your dream transition position as an elite, high-earning professional ready to add instant value.",
              icon: <Award size={16} />,
              color: "text-neon-green bg-neon-green/20 border-neon-green/40 animate-pulse"
            }
          ].map((item, index) => (
            <div key={index} className="relative group">
              {/* Timeline connector circle */}
              <div className="absolute -left-[31px] min-[360px]:-left-[39px] sm:-left-[45px] top-1.5 w-4 h-4 rounded-full bg-black border-2 border-white/20 group-hover:border-neon-green group-hover:bg-neon-green transition-all duration-300 z-10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white group-hover:bg-black transition-colors duration-300"></div>
              </div>

              {/* Outer decorative pulsing circle */}
              <div className="absolute -left-[39px] min-[360px]:-left-[47px] sm:-left-[53px] top-[-1px] w-8 h-8 rounded-full bg-neon-green/0 group-hover:bg-neon-green/[0.08] transition-all duration-500 pointer-events-none"></div>

              <div className="min-w-0 bg-gradient-to-r from-[#070c19] to-black border border-white/5 hover:border-[#22c55e]/20 p-4 sm:p-5 rounded-2xl transition-all duration-300 shadow-lg flex flex-col sm:flex-row sm:items-center gap-4 sm:hover:translate-x-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${item.color}`}>
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-wider">Step {item.step}</span>
                    <div className="h-1 w-1 rounded-full bg-white/20"></div>
                    <h4 className="text-sm font-bold text-white group-hover:text-neon-green transition-colors">{item.title}</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 font-light leading-relaxed">
                    {item.purpose}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

