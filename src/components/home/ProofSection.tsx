import React from 'react';

export const ProofSection: React.FC = () => {
  const stats = [
    {
      value: "70%",
      label: "Offers in 90 days",
      description: "47% directly from our tailored applications, 26% from network openings our team unlocks."
    },
    {
      value: "50%",
      label: "Less time wasted on job search",
      description: "We reduce the average 5–6 month senior search to 6–10 weeks."
    },
    {
      value: "3.2×",
      label: "Increase in salary pipeline",
      description: "Remote roles in US/EU markets typically add $40k–$120k in offer variance."
    }
  ];

  return (
    <section className="bg-white dark:bg-black py-24 relative overflow-hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header */}
            <div className="text-center mb-16 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                    Clear outcomes backed by <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500 dark:from-neon-green dark:to-neon-emerald">real data</span>
                </h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                    Senior roles require precision. We prioritize deep skill alignment, market-fit roles, and tailored documents. Result? Fewer generic applications and more revenue-driving opportunities.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-slate-50 dark:bg-[#0f172a] rounded-[2rem] p-8 md:p-10 border border-gray-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-neon-green/30 transition-all duration-300 group hover:-translate-y-2 shadow-lg dark:shadow-2xl relative overflow-hidden">
                        {/* Glow Effect */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-100 dark:bg-neon-green/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-emerald-200 dark:group-hover:bg-neon-green/20 transition-colors"></div>

                        <div className="relative z-10">
                            <div className="text-6xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500 dark:from-neon-green dark:to-neon-emerald mb-8 tracking-tighter group-hover:scale-105 transition-transform origin-left drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]">
                                {stat.value}
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                {stat.label}
                            </h3>
                            <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-gray-300 transition-colors">
                                {stat.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
  );
};