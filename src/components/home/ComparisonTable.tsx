import React from 'react';
import { Check, X, ShieldCheck, Zap } from 'lucide-react';

export const ComparisonTable: React.FC = () => {
  const rows = [
    { name: "Accuracy & Attention to Detail", solo: true, ai: false, consult: false, us: true },
    { name: "Fully Managed Job Applications", solo: false, ai: false, consult: false, us: true },
    { name: "Consistent & Reliable Everyday", solo: false, ai: false, consult: false, us: true },
    { name: "Better Use of Your Time", solo: false, ai: true, consult: false, us: true },
    { name: "Shorter Time to Land a Job", solo: false, ai: false, consult: false, us: true },
    { name: "Proof of Job Application", solo: false, ai: false, consult: false, us: true },
    { name: "Transparent & Affordable Pricing", solo: false, ai: true, consult: false, us: true },
    { name: "Dedicated Support", solo: false, ai: false, consult: false, us: true },
  ];

  const renderIcon = (isTrue: boolean, isUs: boolean) => {
    if (isTrue) {
      if (isUs) {
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-400 dark:from-neon-green dark:to-neon-emerald flex items-center justify-center shadow-[0_0_10px_rgba(74,222,128,0.4)] mx-auto">
            <Check size={18} className="text-white dark:text-black stroke-[3]" />
          </div>
        );
      }
      return (
        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-green-500/20 flex items-center justify-center mx-auto border border-emerald-200 dark:border-green-500/30">
          <Check size={14} className="text-emerald-600 dark:text-green-400" />
        </div>
      );
    }
    return (
      <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto border border-red-200 dark:border-red-500/20">
        <X size={14} className="text-red-500 dark:text-red-400/70" />
      </div>
    );
  };

  return (
    <section className="bg-white dark:bg-black py-24 border-t border-gray-200 dark:border-white/5 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            More Strategic Than AI. More Effective Than Doing It Alone.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500 dark:from-neon-green dark:to-neon-emerald">
              And 10x More Real Than “Career Gurus”.
            </span>
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            See why DRC outperforms solo job hunting, AI tools, and traditional consultancies
          </p>
        </div>

        {/* Table Container */}
        <div className="bg-slate-50 dark:bg-[#0f172a] rounded-[2rem] border border-gray-200 dark:border-white/10 overflow-hidden shadow-xl dark:shadow-2xl relative">
          
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-full bg-gradient-to-l from-emerald-50 to-transparent dark:from-neon-green/5 dark:to-transparent pointer-events-none"></div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="py-8 px-6 text-left text-lg font-bold text-slate-900 dark:text-white w-1/4">What You Get</th>
                  <th className="py-8 px-6 text-center text-gray-500 dark:text-gray-400 font-medium w-1/6">Solo</th>
                  <th className="py-8 px-6 text-center text-gray-500 dark:text-gray-400 font-medium w-1/6">AI Auto Apply</th>
                  <th className="py-8 px-6 text-center text-gray-500 dark:text-gray-400 font-medium w-1/6">Consultancies</th>
                  <th className="py-8 px-6 text-center w-1/4 bg-white dark:bg-white/5 relative">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-400 dark:from-neon-green dark:to-neon-emerald flex items-center justify-center">
                        <Zap size={18} className="text-white dark:text-black fill-white dark:fill-black" />
                      </div>
                      <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500 dark:from-neon-green dark:to-neon-emerald">
                        DRC
                      </span>
                    </div>
                    {/* Top highlight bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-400 dark:from-neon-green dark:to-neon-emerald"></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-200 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 transition-colors group">
                    <td className="py-6 px-6 text-slate-700 dark:text-gray-300 font-medium border-r border-gray-200 dark:border-white/5 group-hover:text-black dark:group-hover:text-white transition-colors">
                      {row.name}
                    </td>
                    <td className="py-6 px-6 text-center border-r border-gray-200 dark:border-white/5">
                      {renderIcon(row.solo, false)}
                    </td>
                    <td className="py-6 px-6 text-center border-r border-gray-200 dark:border-white/5">
                      {renderIcon(row.ai, false)}
                    </td>
                    <td className="py-6 px-6 text-center border-r border-gray-200 dark:border-white/5">
                      {renderIcon(row.consult, false)}
                    </td>
                    <td className="py-6 px-6 text-center bg-gradient-to-r from-emerald-50/50 to-green-50/50 dark:from-neon-green/5 dark:to-neon-emerald/5 relative">
                      {renderIcon(row.us, true)}
                    </td>
                  </tr>
                ))}
                
                {/* Summary Footer Row */}
                <tr className="h-24">
                  <td className="py-6 px-6 text-lg font-bold text-slate-900 dark:text-white border-r border-gray-200 dark:border-white/5 border-t border-gray-200 dark:border-white/10">
                    In Summary
                  </td>
                  <td className="py-6 px-6 text-center bg-red-50 dark:bg-red-900/10 border-r border-gray-200 dark:border-white/5 border-t border-gray-200 dark:border-white/10">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-bold text-red-600 dark:text-red-300">Soul Crushing 😵</span>
                    </div>
                  </td>
                  <td className="py-6 px-6 text-center bg-gray-100 dark:bg-gray-900/50 border-r border-gray-200 dark:border-white/5 border-t border-gray-200 dark:border-white/10">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Snake Oil</span>
                    </div>
                  </td>
                  <td className="py-6 px-6 text-center bg-red-50 dark:bg-red-900/10 border-r border-gray-200 dark:border-white/5 border-t border-gray-200 dark:border-white/10">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-bold text-red-600 dark:text-red-300">20% Salary gone 💀</span>
                      <span className="text-[10px] text-red-500 dark:text-red-400/70">for nothing</span>
                    </div>
                  </td>
                  <td className="py-6 px-6 text-center bg-gradient-to-r from-emerald-100/50 to-green-100/50 dark:from-neon-green/20 dark:to-neon-emerald/20 border-t border-emerald-300 dark:border-neon-green/30 relative">
                     <div className="flex flex-col items-center gap-1">
                       <span className="text-base font-bold text-emerald-800 dark:text-white drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">Your True WingMan 🤝</span>
                     </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};