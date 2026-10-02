import React from "react";
import { ArrowRight, Briefcase, Layers, Sparkles, Award } from "lucide-react";

export const AudienceSection: React.FC = () => {
  return (
    <section className="py-14 sm:py-20 lg:py-24 border-t border-white/5 relative overflow-hidden bg-[#040813] font-sans">
      {/* Ambient decorative lighting */}
      <div className="absolute top-[30%] left-[10%] w-64 h-64 sm:w-[400px] sm:h-[400px] bg-neon-green/5 blur-[100px] sm:blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[10%] w-64 h-64 sm:w-[400px] sm:h-[400px] bg-[#a855f7]/5 blur-[100px] sm:blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
            Your Experience Is <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green via-emerald-400 to-neon-emerald">More Relevant</span> Than You Think.
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mt-4 leading-relaxed max-w-2xl mx-auto font-normal">
            You don't need to begin your career again. You need a transition plan that builds on the experience you've already earned.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Left Card: SOURCE PROFILES (5 cols) */}
          <div className="min-w-0 lg:col-span-5 bg-[#070c19]/80 border border-white/10 rounded-2xl sm:rounded-3xl p-4 min-[360px]:p-5 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-[#22c55e]/20 transition-all duration-300">
            <div className="absolute top-0 left-0 w-32 h-32 bg-neon-green/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10 space-y-6 text-left">
              <div className="space-y-1.5">
                <div className="text-[18px] font-normal underline uppercase tracking-widest text-[#4ade80]/80 select-none font-sans">
                  YOUR CURRENT PROFILE
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Currently in Testing or Support
                </h3>
              </div>

              <div className="space-y-3 pt-1">
                {[
                  { role: "QA Engineer", exp: "2-10 YRS" },
                  { role: "Manual Tester", exp: "1-7 YRS" },
                  { role: "Automation Tester", exp: "2-8 YRS" },
                  { role: "UAT Analyst", exp: "2-10 YRS" },
                  { role: "Support Engineer", exp: "1-6 YRS" },
                  { role: "Test Lead / SDET", exp: "4-10 YRS" }
                ].map((profile, i) => (
                  <div 
                    key={i} 
                    className="flex min-w-0 items-center justify-between gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-[#051c14]/30 hover:border-[#22c55e]/15 transition-all duration-200 group/item"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.6)] shrink-0 group-hover/item:scale-125 transition-transform"></span>
                      <span className="min-w-0 text-xs min-[360px]:text-sm font-medium text-gray-300 group-hover/item:text-white transition-colors">{profile.role}</span>
                    </div>
                    <span className="text-[10px] font-sans text-gray-500 font-bold uppercase tracking-wider group-hover/item:text-[#4ade80] transition-colors">{profile.exp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Card: THE PROCESS PIPELINE BRIDGE (2 cols) */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center py-3 sm:py-6 lg:py-0 select-none relative min-h-[120px] sm:min-h-[160px] lg:min-h-0">
            
            {/* Connector Pipeline Line (Desktop) */}
            <div className="hidden lg:block absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-neon-green/35 to-transparent z-0"></div>
            
            {/* Connector Pipeline Line (Mobile) */}
            <div className="lg:hidden absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-transparent via-neon-green/35 to-transparent z-0"></div>

            {/* Content Badge Capsule */}
            <div className="relative z-10 bg-[#070c19] border border-[#22c55e]/20 p-4 rounded-2xl flex flex-col items-center gap-3 shadow-[0_0_25px_rgba(34,197,94,0.08)] hover:border-[#22c55e]/40 transition-all duration-300 max-w-[150px] w-full">
              
              {/* Single directional transition arrow */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#162a1c] to-[#040813] border border-[#22c55e]/30 flex items-center justify-center text-neon-green shadow-md hover:scale-105 transition-transform duration-300">
                <ArrowRight size={18} className="transform lg:rotate-0 rotate-90" />
              </div>

              {/* Duration */}
              <div className="text-center px-2.5 py-0.5 bg-neon-green/10 border border-neon-green/25 rounded-md">
                <span className="text-[10px] font-extrabold text-[#4ade80] tracking-wider whitespace-nowrap uppercase font-sans">
                  15 Days Prep
                </span>
              </div>

            </div>
          </div>

          {/* Right Card: TARGET ROLES & HIKE ESTIMATION (5 cols) */}
          <div className="min-w-0 lg:col-span-5 bg-[#070c19]/80 border border-white/10 rounded-2xl sm:rounded-3xl p-4 min-[360px]:p-5 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-[#a855f7]/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#a855f7]/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10 space-y-6 text-left">
              <div className="space-y-1.5">
                <div className="text-[18px] font-normal underline uppercase tracking-widest text-[#4ade80]/80 select-none font-sans">
                  TARGET PRODUCT ROLES
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  A Product-Domain Professional
                </h3>
              </div>

              {/* Target roles cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  { title: "Business Analyst", abbreviation: "BA", icon: Briefcase, color: "text-neon-green bg-neon-green/10" },
                  { title: "Product Owner", abbreviation: "PO", icon: Layers, color: "text-emerald-400 bg-[#10b981]/10" },
                  { title: "Associate Product Manager", abbreviation: "APM", icon: Sparkles, color: "text-amber-400 bg-amber-400/10" },
                  { title: "Product Manager", abbreviation: "PM", icon: Award, color: "text-purple-400 bg-purple-400/10" }
                ].map((role, i) => {
                  const IconComponent = role.icon;
                  return (
                    <div 
                      key={i} 
                      className="bg-black/40 border border-white/5 p-3.5 rounded-xl flex items-center gap-3.5 hover:border-[#22c55e]/35 transition-all duration-300 group/role"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role?.color} border border-white/10 shadow-md shrink-0`}>
                        <IconComponent size={18} />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[16px] font-normal text-white leading-tight group-hover/role:text-neon-green transition-colors font-sans" style={{ fontWeight: 'normal' }}>
                          {role.title}
                        </span>
                        <span className="text-[10px] font-sans font-semibold text-gray-500 uppercase tracking-wider mt-1 select-none">
                          {role.abbreviation}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dashed salary hike bottom banner with typography highlights */}
              <div className="bg-[#052e16]/20 border border-dashed border-[#22c55e]/30 p-5 rounded-2xl relative overflow-hidden mt-3 group/banner hover:border-[#22c55e]/45 transition-colors duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#22c55e]/5 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex gap-3 text-left">
                  <div className="mt-0.5 text-neon-green shrink-0">
                    <Sparkles size={16} className="animate-pulse" />
                  </div>
                  <div className="space-y-2.5">
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                      Most <strong className="font-bold text-white">QA professionals</strong> already possess many of the skills companies expect from <strong className="font-bold text-neon-green">Business Analysts</strong>.
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2 border-t border-white/5">
                      <span className="text-xs text-gray-400 font-sans">You don't need another degree.</span>
                      <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 bg-neon-green/10 text-neon-green rounded border border-[#22c55e]/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                        You need the right transition roadmap
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
