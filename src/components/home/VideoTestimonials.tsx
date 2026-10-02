import React, { useRef, useState } from 'react';
import { Play, ChevronLeft, ChevronRight, Zap, X } from 'lucide-react';

const VIDEOS = [
  {
    id: 1,
    image: "/1.jpg",
    title: "Bhushan :  Fresher to AI Product Manager in 15 Days?",
    videoUrl: "/Bhushan_Testimonal.mp4"
  },
  {
    id: 2,
    image: "/2.jpg",
    title: "Pratik : “Laid Off to Perfect Job Offers“",
    videoUrl: "/Pratik Testimonal.mp4"
  },
  {
    id: 3,
    image: "/3.jpg",
    title: "Siddharth : “From 90-Day Notice Struggle to 200% Hike“",
    videoUrl: "/Sidhart pujara Testimonal Finali.mp4"
  },
  {
    id: 4,
    image: "/4.jpg",
    title: "Sourabh : No Interview Calls to Fintech MNC Offer in 15 Days",
    videoUrl: "/Sourabh Testimonal.mp4"
  },
  {
     id: 8,
     image: "/gayatri.jpeg",
     title: "Gayatri : From 0 to 30+ Interview calls [BA Role]",
     videoUrl: "/Gayatri_shortTestimonal.mp4"
   },
   {
     id: 6,
     image: "/amit.jpeg",
     title: "Amit : Two Seniors Position Offers In 15 Days",
   videoUrl: "/amit.mp4"
   },
   {
     id: 7,
     image: "/rushikesh.jpeg",
     title: "Rushikesh : From Developers to Business Analyst",
   videoUrl: "/rushikesh.mp4"
   },
   
   {
     id: 9,
     image: "/neha.jpeg",
     title: "Neha : Successfully moved from 23 LPA to 40 LPA With an Incredible 60% Hike",
     videoUrl: "/Nehasete_short_testimonal.mp4"
   }
];

export const VideoTestimonials: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<typeof VIDEOS[0] | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 340; // Card width + gap
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="bg-slate-50 dark:bg-black py-24 relative overflow-hidden border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            From Hiring Freeze <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500 dark:from-neon-green dark:to-neon-emerald">To Multiple Remote Offers.</span>
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
            Every testimonial below represents a real, measurable career jump.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          {/* Left Arrow */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md border border-gray-200 dark:border-white/10 flex items-center justify-center text-slate-900 dark:text-white hover:bg-emerald-100 dark:hover:bg-neon-green hover:border-emerald-200 dark:hover:border-neon-green transition-all duration-300 hidden md:flex opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0 shadow-lg"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Scrollable Area */}
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {VIDEOS.map((video) => (
              <div 
                key={video.id} 
                className="relative flex-shrink-0 w-[280px] md:w-[320px] aspect-[9/16] rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 group cursor-pointer hover:border-emerald-400 dark:hover:border-neon-green/50 transition-all duration-500 snap-center shadow-xl dark:shadow-2xl bg-black"
              >
                <img 
                  src={video.image} 
                  alt={video.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 filter brightness-90 group-hover:brightness-100"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 dark:to-black/90"></div>

                {/* Play Button */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                   <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 active:scale-95 border border-white/30">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 dark:from-neon-green dark:to-neon-emerald flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.5)] group-hover:shadow-[0_0_30px_rgba(5,150,105,0.6)] transition-shadow duration-300">
                         <Play size={20} className="text-white dark:text-black fill-white dark:fill-black ml-1" />
                      </div>
                   </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                   <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-400 dark:from-neon-green dark:to-neon-emerald flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                         <Zap size={14} className="text-white dark:text-black fill-white dark:fill-black" />
                      </div>
                      <p className="font-bold text-white text-lg leading-snug drop-shadow-md">
                         {video.title}
                      </p>
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md border border-gray-200 dark:border-white/10 flex items-center justify-center text-slate-900 dark:text-white hover:bg-emerald-100 dark:hover:bg-neon-emerald hover:border-emerald-200 dark:hover:border-neon-emerald hover:text-emerald-800 dark:hover:text-black transition-all duration-300 hidden md:flex opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:-translate-x-0 shadow-lg"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>
        </div>

      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all duration-300"
              aria-label="Close video"
            >
              <X size={24} />
            </button>

            {/* Video Player */}
            <video
              ref={videoRef}
              src={selectedVideo.videoUrl}
              controls
              autoPlay
              className="w-full h-full"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </section>
  );
};
