import React from "react";

export const TransitionMilestones: React.FC = () => {
  return (
    <section className="py-14 sm:py-20 lg:py-24 relative overflow-hidden font-sans border-t border-white/5 bg-[#030712]" id="transition-milestones-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            Where other programs stop, <br className="hidden sm:block" />
            we <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-emerald-400">
              start applying.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 mt-6 leading-relaxed max-w-3xl mx-auto font-light">
            A done-for-you job hunt service. We don't just hand you a curriculum and wish you luck. <br className="hidden sm:inline" />
            We sit on the same side of the table — until you sign.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {[
            { number: '01', title: 'Resume Engineering', desc: '1:1 rewriting by Dheeraj to reposition QA experience as BA / PO. ATS-optimized with target keywords.' },
            { number: '02', title: 'LinkedIn Optimization', desc: 'Complete profile makeover — headline, About, Experience, Skills, banner. Activate recruiter visibility.' },
            { number: '03', title: 'Naukri Profile Setup', desc: 'Rebuild with keyword targeting, hot-resume highlighting, and recruiter discovery configured.' },
            { number: '04', title: '200+ Applications', desc: 'We apply to 200+ matching BA / PO / PM jobs on your behalf across LinkedIn, Naukri & portals.' },
            { number: '05', title: 'Recruiter Outreach', desc: 'Sales Navigator-driven cold outreach to recruiters & hiring managers with proven message templates.' },
            { number: '06', title: 'Referral Network', desc: 'Access our internal referral network — into product companies, startups & MNCs hiring BA / PO.' },
            { number: '07', title: 'Mock Interview Sessions', desc: 'Unlimited mock interviews with real-time feedback. Behavioral, scenario-based, and case-study formats.' },
            { number: '08', title: 'Negotiation Support', desc: 'Pre-interview research, post-interview debriefs, and offer negotiation — until you sign.' }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="min-w-0 bg-[#080d19]/60 border border-white/5 hover:border-neon-green/20 rounded-2xl p-4 min-[360px]:p-5 sm:p-8 flex gap-3 min-[360px]:gap-4 sm:gap-6 items-start transition-all duration-300 hover:bg-[#0c1426] hover:-translate-y-0.5 group"
            >
              <div className="text-xl sm:text-3xl font-black text-neon-green font-mono tracking-tighter shrink-0 mt-0.5 select-none opacity-90 group-hover:opacity-100 transition-opacity">
                {item.number}
              </div>
              <div className="min-w-0 space-y-1.5">
                <h4 className="text-base sm:text-lg font-bold text-white tracking-wide group-hover:text-neon-green transition-colors duration-300">
                  {item.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-light">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
