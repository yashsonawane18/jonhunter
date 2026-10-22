import React from 'react';

export const ProofSection: React.FC = () => {
  const stats = [
    {
      value: "70%",
      label: "Offers in 90 days",
      description: "Tailored applications targeting verified engineering requisitions directly from enterprise ATS endpoints."
    },
    {
      value: "50%",
      label: "Reduction in search time",
      description: "Condensing the standard 5-6 month senior job search into 6-8 weeks of focused interviewing."
    },
    {
      value: "3.2×",
      label: "Interview pipeline expansion",
      description: "Direct ATS coverage across 850+ companies in US, EMEA, and Pan-India tech corridors."
    }
  ];

  return (
    <section className="bg-[#121212] py-20 border-b border-[#2e2e2e]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-[0.1em] text-[#3ecf8e] font-mono mb-3">
            VERIFIED OUTCOMES
          </div>
          <h2 className="text-3xl sm:text-4xl font-normal text-[#fafafa] tracking-[-0.007em] mb-4">
            Deterministic results backed by real data.
          </h2>
          <p className="text-sm sm:text-base font-normal text-[#b4b4b4] leading-relaxed tracking-[-0.007em]">
            Senior engineering and product roles demand precision. We replace spray-and-pray applications 
            with tailored matching and human domain review.
          </p>
        </div>

        {/* 3-Column Feature Cards: 16px radius, 1px solid #2e2e2e, #121212 background */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#121212] rounded-[16px] p-6 border border-[#2e2e2e] hover:border-[#4d4d4d] transition-colors"
            >
              <div className="text-5xl font-normal text-[#3ecf8e] mb-4 tracking-[-0.007em] font-mono">
                {stat.value}
              </div>
              <h3 className="text-lg font-medium text-[#fafafa] mb-2 tracking-[-0.007em]">
                {stat.label}
              </h3>
              <p className="text-sm font-normal text-[#b4b4b4] leading-relaxed tracking-[-0.007em]">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};