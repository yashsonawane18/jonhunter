import React from 'react';
import { Button } from '../home/Button';
import { Play, Sparkles } from 'lucide-react';
import wh1 from '../../assets/wh7.jpeg';
import wh2 from '../../assets/wh8.jpeg';

interface QAtoBAHeroProps {
  onGetStarted?: () => void;
  onWatchSuccess?: () => void;
}

export const QAtoBAHero: React.FC<QAtoBAHeroProps> = ({ 
  onGetStarted, 
  onWatchSuccess 
}) => {
  const handleBookStrategyCall = () => {
    const registerSection = document.getElementById('register');

    if (registerSection) {
      registerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    onGetStarted?.();
  };

  return (
    <div className="relative w-full min-w-0 overflow-hidden bg-black text-white selection:bg-neon-green selection:text-black">
      {/* Background glow spots */}
      <div className="absolute top-0 left-0 w-72 h-72 sm:w-[600px] sm:h-[600px] bg-neon-green/5 blur-[90px] sm:blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute top-[40%] right-0 w-64 h-64 sm:w-[500px] sm:h-[500px] bg-[#a855f7]/5 blur-[90px] sm:blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 sm:left-10 w-72 h-72 sm:w-[600px] sm:h-[600px] bg-neon-emerald/5 blur-[90px] sm:blur-[130px] rounded-full pointer-events-none"></div>

      <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-14 sm:pb-20 overflow-hidden font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid min-w-0 grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column */}
            <div className="min-w-0 lg:col-span-7 space-y-5 sm:space-y-6 text-left">
              <h1 className="text-[2rem] min-[380px]:text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] break-words">
                Your QA Experience <br className="hidden min-[380px]:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green via-emerald-400 to-neon-emerald">
                  Deserves a Bigger Role
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-2xl font-light">
                We've helped professionals from <span className="text-white font-semibold">QA, Testing, UAT and Support</span> backgrounds successfully transition into <span className="text-neon-green font-bold">Business Analyst, Product Owner and Product Management</span> roles through a <span className="text-white font-medium">proven, mentor-led career transition framework</span>.
                <span className="block mt-4 text-xs sm:text-sm text-gray-400 font-normal uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse"></span>
                  Trusted by professionals now working across leading Product & Technology Companies.
                </span>
              </p>

              {/* Two CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                <Button 
                  onClick={handleBookStrategyCall}
                  variant="glow"
                  className="w-full sm:w-auto min-h-12 whitespace-normal uppercase text-[11px] sm:text-xs font-black tracking-wider sm:tracking-widest py-3.5 px-5 sm:px-8 shadow-neon-green/20"
                >
                  Book Your Free Career Strategy Call
                </Button>
                <button 
                  onClick={onWatchSuccess}
                  className="w-full sm:w-auto min-h-12 inline-flex items-center justify-center gap-2 bg-[#121214] hover:bg-[#1f1f23] text-white border-2 border-[#262626] rounded-full py-3.5 px-5 sm:px-8 text-[11px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest transition-all"
                >
                  <Play size={14} className="text-neon-green fill-neon-green" />
                  Watch Success Stories
                </button>
              </div>

              {/* Rating */}
              <div className="flex flex-wrap items-center gap-3 pt-3 pb-2">
                <div className="flex items-center gap-1.5 bg-[#052e16]/60 border border-[#22c55e]/20 px-3.5 py-1.5 rounded-full backdrop-blur-sm">
                  <div className="flex items-center text-amber-400 tracking-tighter">
                    ★ ★ ★ ★ ★
                  </div>
                  <span className="text-[10px] sm:text-xs font-black text-[#4ade80] uppercase tracking-wider ml-1 select-none">
                    Rated by Professionals
                  </span>
                </div>
                <div className="text-xs text-gray-400 font-light select-none">
                  5/5 satisfaction across major career networks
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-3">
                <div className="bg-[#051c14]/40 border border-[#22c55e]/10 p-4 sm:p-5 rounded-2xl relative overflow-hidden group hover:border-[#22c55e]/25 transition-all">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-neon-green/5 rounded-full blur-xl"></div>
                  <div className="text-neon-green text-3xl font-black tracking-tight flex items-center gap-1 transition-transform group-hover:scale-105 duration-300">
                    500+
                  </div>
                  <div className="text-[11px] text-gray-300 font-bold uppercase tracking-wider mt-1.5">Career Consultations</div>
                </div>

                <div className="bg-[#051c14]/40 border border-[#22c55e]/10 p-4 sm:p-5 rounded-2xl relative overflow-hidden group hover:border-[#22c55e]/25 transition-all">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-neon-green/5 rounded-full blur-xl"></div>
                  <div className="text-[#4ade80] text-3xl font-black tracking-tight transition-transform group-hover:scale-105 duration-300">
                    100+
                  </div>
                  <div className="text-[11px] text-gray-300 font-bold uppercase tracking-wider mt-1.5">Successful Transitions</div>
                </div>

                <div className="bg-[#052e16]/30 border border-[#22c55e]/15 p-4 sm:p-5 rounded-2xl min-[360px]:col-span-2 sm:col-span-1 relative overflow-hidden group hover:border-[#22c55e]/30 transition-all">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#22c55e]/10 rounded-full blur-xl"></div>
                  <div className="text-emerald-300 text-2xl font-black tracking-tight uppercase flex items-center gap-1.5">
                    Hiring <Sparkles size={14} className="text-neon-green shrink-0 animate-bounce" />
                  </div>
                  <div className="text-[11px] text-gray-200 font-bold uppercase tracking-wider mt-1.5">Across Top Product Companies.</div>
                </div>
              </div>
            </div>

            {/* Right Column - Two Phone Mockups */}
            <div className="min-w-0 lg:col-span-5 relative w-full flex items-center justify-center select-none mt-2 lg:mt-0">
              <div className="flex w-full max-w-[520px] flex-row items-center justify-center gap-2 min-[380px]:gap-3 sm:gap-6 px-1 sm:px-0">
                {/* Phone A */}
                <div className="relative w-[43%] min-w-0 sm:w-52 md:w-56 xl:w-64 h-auto aspect-[9/19]">
                  <div className="absolute inset-0 rounded-3xl bg-black shadow-2xl border border-white/10 overflow-hidden">
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <img src={wh1} alt="Success story 1" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-black rounded-b-xl border-b border-white/10"></div>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-neon-green/20 via-emerald-500/20 to-teal-500/20 blur-2xl -z-10 rounded-3xl"></div>
                </div>

                {/* Phone B */}
                <div className="relative w-[43%] min-w-0 sm:w-52 md:w-56 xl:w-64 h-auto aspect-[9/19] transform rotate-3 sm:rotate-6">
                  <div className="absolute inset-0 rounded-3xl bg-black shadow-2xl border border-white/10 overflow-hidden">
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <img src={wh2} alt="Success story 2" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-black rounded-b-xl border-b border-white/10"></div>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-neon-green/20 via-emerald-500/20 to-teal-500/20 blur-2xl -z-10 rounded-3xl"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
