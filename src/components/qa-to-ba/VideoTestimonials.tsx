import React, { useRef, useState } from 'react';
import { Play, ChevronLeft, ChevronRight, Zap, X } from 'lucide-react';

const BAPO_VIDEOS = [
  {
    id: 1,
    image: "/sourabh.jpeg",
    title: "Sourabh: No Interview Calls to Fintech MNC Offer in 15 Days",
    videoUrl: "/Sourabh_Short.mp4"
  },
  {
    id: 2,
    image: "/gayatri.jpeg",
    title: "Gayatri : “From 0 to 30+ Interview calls [BA Role]“",
    videoUrl: "/Gayatri_shortTestimonal.mp4"
  },
  {
    id: 3,
    image: "/neha.jpeg",
    title: "Neha : “Successfully moved from 23 LPA to 40 LPA With an Incredible 60% Hike“",
    videoUrl: "/Nehasete_short_testimonal.mp4"
  },
  {
    id: 4,
    image: "/ishaan.jpeg",
    title: "Ishaan : Got Offer from Product Company with a 80% Hike",
    videoUrl: "/Ishaan_short_testimonal.mp4"
  }
];

export const VideoTestimonials: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<typeof BAPO_VIDEOS[0] | null>(null);
  const [videoError, setVideoError] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 340;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const handleVideoError = () => {
    setVideoError(true);
    console.error('Video failed to load:', selectedVideo?.videoUrl);
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <section id="video-testimonials" className="bg-black py-14 sm:py-20 relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            From Hiring Freeze <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-emerald">To Multiple Remote Offers.</span>
          </h2>
          <p className="text-sm sm:text-lg text-gray-400 leading-relaxed">
            Every testimonial below represents a real, measurable career jump.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          {/* Left Arrow */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-neon-green hover:border-neon-green transition-all duration-300 hidden md:flex opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Scrollable Area */}
          <div 
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 sm:pb-8 scrollbar-hide snap-x snap-mandatory px-0 sm:px-4 scroll-px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {BAPO_VIDEOS.map((video) => (
              <div 
                key={video.id} 
                className="relative flex-shrink-0 w-[82vw] max-w-[280px] md:w-[320px] md:max-w-none aspect-[9/16] rounded-3xl sm:rounded-[2rem] overflow-hidden border border-white/10 group cursor-pointer hover:border-neon-green/50 transition-all duration-500 snap-start sm:snap-center shadow-2xl"
              >
                <img 
                  src={video.image} 
                  alt={video.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 filter brightness-75 group-hover:brightness-100"
                  referrerPolicy="no-referrer"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90"></div>

                {/* Play Button */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVideo(video);
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 active:scale-95 border border-white/20">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-neon-green to-neon-emerald flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.5)] group-hover:shadow-[0_0_30px_rgba(5,150,105,0.6)] transition-shadow duration-300">
                      <Play size={20} className="text-black fill-black ml-1" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10 transform sm:translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-green to-neon-emerald flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                      <Zap size={14} className="text-black fill-black" />
                    </div>
                    <p className="font-bold text-white text-base sm:text-lg leading-snug drop-shadow-md">
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
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-neon-emerald hover:border-neon-emerald hover:text-black transition-all duration-300 hidden md:flex opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:-translate-x-0"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="relative w-full max-w-4xl max-h-[90dvh] aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all duration-300"
              aria-label="Close video"
            >
              <X size={24} />
            </button>

            {/* Video Player */}
            {!videoError ? (
              <video
                ref={videoRef}
                src={selectedVideo.videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full"
                onError={handleVideoError}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white">
                <p className="text-lg font-medium mb-2">Video could not be loaded</p>
                <p className="text-sm text-gray-400">Please check the file path: {selectedVideo.videoUrl}</p>
                <button
                  onClick={handleCloseModal}
                  className="mt-4 px-6 py-2 bg-neon-green text-black rounded-full font-bold hover:bg-green-400 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
