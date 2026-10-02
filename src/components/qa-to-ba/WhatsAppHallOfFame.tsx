import React, { useRef } from 'react';
import { Check, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import wh1 from '../../assets/wh1.jpeg';
import wh2 from '../../assets/wh2.jpeg';
import wh3 from '../../assets/wh3.jpeg';
import wh4 from '../../assets/wh7.jpeg';
import wh5 from '../../assets/wh5.jpeg';
import wh6 from '../../assets/wh10.jpeg';

export const WhatsAppHallOfFame: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const cards = [
    { id: "screenshot-priya", name: "Priya", image: wh1 },
    { id: "screenshot-siddharth", name: "Siddharth", image: wh2 },
    { id: "screenshot-sumeet", name: "Sumeet", image: wh3 },
    { id: "screenshot-rushi", name: "Rushi", image: wh4 },
    { id: "screenshot-ishaan", name: "Ishaan", image: wh5 },
    { id: "screenshot-mitesh", name: "Mitesh", image: wh6 }
  ];

  const scroll = (direction: 'left' | 'right') => {
    const carousel = scrollRef.current;
    if (!carousel) return;

    const firstCard = carousel.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard?.offsetWidth ?? 320;
    const gap = 24;

    carousel.scrollBy({
      left: direction === 'left' ? -(cardWidth + gap) : cardWidth + gap,
      behavior: 'smooth',
    });
  };

  return (
    <section 
      className="py-14 sm:py-20 relative overflow-hidden border-t border-white/5 bg-gradient-to-b from-black via-[#040811] to-black" 
      id="whatsapp-hall-of-fame"
    >
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-neon-green/[0.03] blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-emerald-500/[0.02] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            The Messages That <br className="hidden sm:inline" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green via-emerald-400 to-neon-emerald">Make It Worth It</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 mt-4 leading-relaxed max-w-2xl mx-auto font-light">
            Real conversations from professionals who successfully made their career transition.
          </p>
        </div>

        {/* Clean edge-to-edge carousel, matching the video testimonial layout */}
        <div className="relative group/carousel">
          <div className="pointer-events-none absolute -inset-x-8 top-1/2 h-72 -translate-y-1/2 bg-neon-green/[0.035] blur-[100px]" />

          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-30 hidden md:flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#101612]/90 text-white opacity-0 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-neon-green/60 hover:bg-neon-green hover:text-black group-hover/carousel:translate-x-0 group-hover/carousel:opacity-100 focus-visible:translate-x-0 focus-visible:opacity-100"
            aria-label="Show previous WhatsApp message"
          >
            <ChevronLeft size={22} />
          </button>

          <div
            ref={scrollRef}
            className="relative z-10 flex snap-x snap-mandatory items-start gap-4 sm:gap-5 lg:gap-6 overflow-x-auto px-1 sm:px-4 py-3 pb-7 sm:pb-9 scrollbar-hide scroll-px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            
            {cards.map((c) => (
              <div 
                key={c.id}
                className="group/card relative w-[75vw] max-w-[245px] sm:w-[220px] sm:max-w-none md:w-[230px] lg:w-[240px] xl:w-[255px] shrink-0 snap-start sm:snap-center aspect-[591/1280] overflow-hidden rounded-[1.65rem] sm:rounded-[1.8rem] border border-white/15 bg-[#07100b] shadow-[0_20px_55px_rgba(0,0,0,0.5)] ring-1 ring-black/40 transition-all duration-500 hover:-translate-y-1.5 hover:border-neon-green/55 hover:shadow-[0_24px_65px_rgba(34,197,94,0.12)] select-none"
              >
                <img 
                  src={c.image} 
                  alt={`WhatsApp feedback from ${c.name}`}
                  className="h-full w-full object-cover object-top transition-transform duration-700 group-hover/card:scale-[1.015]"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent opacity-90 [background-size:100%_42%] [background-position:bottom] [background-repeat:no-repeat]" />

                <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-4.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neon-green text-black shadow-[0_0_22px_rgba(74,222,128,0.35)] ring-4 ring-neon-green/10">
                      <MessageCircle size={17} fill="currentColor" />
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-bold text-white drop-shadow-md">{c.name}</p>
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-neon-green text-black">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      </div>
                      <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55">
                        Verified feedback
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            ))}

          </div>

          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-30 hidden md:flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#101612]/90 text-white opacity-0 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-neon-green/60 hover:bg-neon-green hover:text-black group-hover/carousel:translate-x-0 group-hover/carousel:opacity-100 focus-visible:translate-x-0 focus-visible:opacity-100"
            aria-label="Show next WhatsApp message"
          >
            <ChevronRight size={22} />
          </button>

          {/* Footer hint */}
          <div className="relative z-10 text-center px-4 text-[10px] sm:text-[11px] font-mono text-gray-500 select-none uppercase tracking-wider sm:tracking-widest">
            // 100% genuine feedback from our community members
          </div>

        </div>

      </div>
    </section>
  );
};
