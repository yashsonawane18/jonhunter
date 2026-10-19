import React, { useState } from 'react';
import { FAQS } from './constants';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="bg-[#121212] py-20 border-b border-[#2e2e2e]">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <div className="text-xs uppercase tracking-[0.1em] text-[#3ecf8e] font-mono mb-3">
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="text-3xl sm:text-4xl font-normal text-[#fafafa] tracking-[-0.007em] mb-4">
            Everything you need to know.
          </h2>
          <p className="text-sm sm:text-base font-normal text-[#b4b4b4] leading-relaxed tracking-[-0.007em]">
            Transparent answers on our discovery engine, application workflow, and consulting guarantees.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className={`rounded-[16px] p-5 border transition-colors ${
                openIndex === idx
                  ? 'bg-[#181818] border-[#3ecf8e]'
                  : 'bg-[#121212] border-[#2e2e2e] hover:border-[#4d4d4d]'
              }`}
            >
              <button 
                onClick={() => toggle(idx)}
                className="w-full flex justify-between items-center text-left focus:outline-none cursor-pointer"
              >
                <span className="font-medium text-sm sm:text-base text-[#fafafa] pr-4 tracking-[-0.007em]">
                  {faq.question}
                </span>
                <span className="text-[#898989] flex-shrink-0">
                  {openIndex === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>
              
              {openIndex === idx && (
                <div className="mt-3 pt-3 border-t border-[#2e2e2e]">
                  <p className="text-sm font-normal text-[#b4b4b4] leading-relaxed tracking-[-0.007em]">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};