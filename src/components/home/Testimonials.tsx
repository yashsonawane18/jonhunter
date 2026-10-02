import React from 'react';
import { TESTIMONIALS } from './constants';
import { Heart } from 'lucide-react';

export const Testimonials: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-emerald-50 dark:from-black dark:to-gray-900 py-24 relative overflow-hidden transition-colors duration-300">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="relative mb-16 flex flex-col md:flex-row items-end justify-between gap-8">
           <div className="relative">
             <h2 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white leading-none tracking-tight">
               Users' <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500 dark:from-neon-green dark:to-neon-emerald">Love</span>
             </h2>
             <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-md">
               Thank you for your praise and suggestions. With your support, we can go further.
             </p>
           </div>
           
           <div className="hidden md:block">
              <Heart className="w-12 h-12 text-emerald-500 dark:text-neon-green fill-emerald-500 dark:fill-neon-green animate-pulse" />
           </div>
        </div>

        {/* Masonry Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-2xl p-6 hover:shadow-xl dark:hover:bg-white/10 transition-all duration-300 flex flex-col justify-between group border border-gray-100 dark:border-white/5 shadow-sm">
              <div>
                <span className="text-4xl text-emerald-200 dark:text-neon-emerald/50 font-serif leading-none">“</span>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mt-2 mb-6 leading-relaxed group-hover:text-black dark:group-hover:text-white transition-colors">
                  {t.content}
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-gray-100 dark:border-white/5 pt-4">
                <img src={t.avatar} alt={t.author} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-white/10" />
                <div>
                   <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.author}</h4>
                   {/* <p className="text-[10px] text-gray-500 uppercase">{t.role}</p> */}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};