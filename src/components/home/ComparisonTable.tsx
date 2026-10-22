import React from 'react';
import { Check, X } from 'lucide-react';

export const ComparisonTable: React.FC = () => {
  const rows = [
    { name: "Direct ATS Ingestion (Greenhouse, Lever, Ashby)", solo: false, ai: false, consult: false, us: true },
    { name: "Accuracy & Attention to Detail", solo: true, ai: false, consult: false, us: true },
    { name: "Fully Managed Job Submissions", solo: false, ai: false, consult: false, us: true },
    { name: "Consistent & Reliable Execution", solo: false, ai: false, consult: false, us: true },
    { name: "Shorter Time-to-Offer Window", solo: false, ai: false, consult: false, us: true },
    { name: "Transparent Proof & Tracking Log", solo: false, ai: false, consult: false, us: true },
    { name: "Zero Cost Keyword Scraping Architecture", solo: false, ai: true, consult: false, us: true },
    { name: "Dedicated Human Career Specialist", solo: false, ai: false, consult: true, us: true },
  ];

  return (
    <section className="bg-[#121212] py-20 border-b border-[#2e2e2e]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-[0.1em] text-[#3ecf8e] font-mono mb-3">
            BENCHMARK
          </div>
          <h2 className="text-3xl sm:text-4xl font-normal text-[#fafafa] tracking-[-0.007em] mb-4">
            How JonHunter compares.
          </h2>
          <p className="text-sm sm:text-base font-normal text-[#b4b4b4] leading-relaxed tracking-[-0.007em]">
            Compare our deterministic engineering approach against solo searching, AI spam tools, and old-school agencies.
          </p>
        </div>

        {/* Table Container: 16px radius, border 1px solid #2e2e2e, #121212 background */}
        <div className="rounded-[16px] border border-[#2e2e2e] bg-[#121212] overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#2e2e2e] text-xs font-mono text-[#898989]">
                <th className="p-4 sm:p-5 font-normal tracking-[-0.007em] text-[#fafafa]">CAPABILITY</th>
                <th className="p-4 sm:p-5 font-normal text-center">SOLO SEARCH</th>
                <th className="p-4 sm:p-5 font-normal text-center">AI EXTENSIONS</th>
                <th className="p-4 sm:p-5 font-normal text-center">AGENCIES</th>
                <th className="p-4 sm:p-5 font-medium text-center bg-[#242424] text-[#3ecf8e] border-l border-r border-[#2e2e2e]">
                  JONHUNTER / DRC
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e2e2e]">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#181818] transition-colors">
                  <td className="p-4 sm:p-5 text-[#fafafa] font-normal tracking-[-0.007em]">
                    {row.name}
                  </td>
                  <td className="p-4 sm:p-5 text-center">
                    {row.solo ? (
                      <Check className="w-4 h-4 text-[#898989] mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-[#4d4d4d] mx-auto" />
                    )}
                  </td>
                  <td className="p-4 sm:p-5 text-center">
                    {row.ai ? (
                      <Check className="w-4 h-4 text-[#898989] mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-[#4d4d4d] mx-auto" />
                    )}
                  </td>
                  <td className="p-4 sm:p-5 text-center">
                    {row.consult ? (
                      <Check className="w-4 h-4 text-[#898989] mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-[#4d4d4d] mx-auto" />
                    )}
                  </td>
                  <td className="p-4 sm:p-5 text-center bg-[#242424] border-l border-r border-[#2e2e2e]">
                    <div className="w-5 h-5 rounded-full bg-[#121212] border border-[#3ecf8e] flex items-center justify-center mx-auto">
                      <Check className="w-3 h-3 text-[#3ecf8e]" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};