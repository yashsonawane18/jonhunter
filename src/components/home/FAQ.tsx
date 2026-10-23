import React, { useState } from 'react';
import { FAQS } from './constants';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="bg-mint-50 dark:bg-[#050505] py-24 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center">
          Have more questions? <span className="text-emerald-600 dark:text-neon-green">Let's chat!</span>
        </h2>
        
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
           We understand that you might have questions specific to your situation. Schedule a call with our founder – we're here to help you succeed!
        </p>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div key={idx} className={`rounded-2xl p-6 border transition-all duration-200 shadow-sm ${openIndex === idx ? 'bg-white dark:bg-white/10 border-emerald-500 dark:border-neon-green/50' : 'bg-white dark:bg-white/5 border-transparent dark:border-white/5 hover:bg-white dark:hover:bg-white/10'}`}>
              <button 
                onClick={() => toggle(idx)}
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <span className="font-bold text-sm md:text-base text-slate-800 dark:text-gray-200 pr-4">
                  {faq.question}
                </span>
                <span className={`p-2 rounded-full transition-colors ${openIndex === idx ? 'bg-emerald-500 dark:bg-neon-green text-white dark:text-black' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}`}>
                  {openIndex === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pb-2">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};