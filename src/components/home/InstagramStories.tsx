
import React, { useState, useRef } from 'react';
import { Star, TrendingUp, Award, ChevronDown, ChevronUp } from 'lucide-react';

interface Story {
  id: number;
  name: string;
  role: string;
  achievement: string;
  details: string[];
  image: string;
  accent: string;
  badge: string;
}

const STORIES: Story[] = [
  {
    id: 1,
    name: "Amit Bhadale",
    role: "Senior Technical Business Analyst",
    achievement: "Secured a High-Paying CTC",
    details: ["Successfully transitioned role", "Handled 90-day notice", "High-paying CTC secured"],
    image: "/Testimonals/Amit_Bhadale.jpeg",
    accent: "from-yellow-400 to-orange-500",
    badge: "Senior Role"
  },
  {
    id: 2,
    name: "Bhushan",
    role: "Product Manager",
    achievement: "E-commerce & AI/ML domain",
    details: ["Entered as a fresher", "Secured PM role", "Highly competitive domain"],
    image: "/Testimonals/Bhushan.jpeg",
    accent: "from-blue-400 to-indigo-600",
    badge: "Fresher to PM"
  },
  {
    id: 3,
    name: "Siddharth",
    role: "Senior Position",
    achievement: "200% Salary Hike",
    details: ["Patiently waited 90 days", "Outstanding 200% hike", "Extraordinary results"],
    image: "/Testimonals/Siddharth.jpg",
    accent: "from-neon-green to-neon-emerald",
    badge: "200% Hike"
  },
  {
    id: 4,
    name: "Urvi",
    role: "Product Manager",
    achievement: "Transitioned to Product Manager",
    details: ["Transitioning to Product Manager", "100% salary hike", "Landing a PM leadership role"],
    image: "/Testimonals/urvi.jpeg",
    accent: "from-fuchsia-500 to-pink-500",
    badge: "100% Hike"
  },
  {
    id: 5,
    name: "Aditya Rathod",
    role: "Data Scientist",
    achievement: "Civil Engineer to Data Scientist",
    details: ["Bold career switch", "100% salary hike", "Remote job landed"],
    image: "/Testimonals/Aditya_Rathod.jpg",
    accent: "from-cyan-400 to-blue-500",
    badge: "Engineer Switch"
  },
  {
    id: 6,
    name: "Akshay Khandare",
    role: "Data Scientist",
    achievement: "90% Salary Hike",
    details: ["Unstoppable drive", "Remote job secured", "Dream role achieved"],
    image: "/Testimonals/Akshay_khandare.jpg",
    accent: "from-orange-400 to-red-500",
    badge: "90% Hike"
  },
  {
    id: 7,
    name: "Pawan Chavan",
    role: "Customer Support Specialist",
    achievement: "Remote Role Landed",
    details: ["Never-give-up attitude", "Work from anywhere", "Flexible future"],
    image: "/Testimonals/Pawan_Chavan.jpg",
    accent: "from-green-400 to-teal-500",
    badge: "Remote Hero"
  },
  {
    id: 8,
    name: "Pratik Borse",
    role: "Remote Job Offer",
    achievement: "120% Salary Hike",
    details: ["Smart positioning", "No luck, just skills", "Negotiated like a pro"],
    image: "/Testimonals/Pratik_Borse.jpg",
    accent: "from-indigo-400 to-purple-600",
    badge: "120% Hike"
  },
  {
    id: 9,
    name: "Priyanka",
    role: "Business Analyst",
    achievement: "Best-in-class BA Role",
    details: ["Secured top BA position", "Strong domain expertise", "Built a compelling profile"],
    image: "/Testimonals/priyanka.jpeg",
    accent: "from-emerald-400 to-sky-500",
    badge: "Business Analyst"
  },
  {
    id: 10,
    name: "Rushi",
    role: "Developer to Product Manager",
    achievement: "200% Salary Hike",
    details: ["Landed remote role", "Bagged 200% hike", "Strategic push"],
    image: "/Testimonals/Rushi.jpg",
    accent: "from-pink-400 to-rose-600",
    badge: "Dev to PM"
  },
  {
    id: 11,
    name: "Saurav Deshmukh",
    role: "Customer Support Executive",
    achievement: "Product Company Role",
    details: ["Remote role achieved", "Voice of the brand", "Clarity in search"],
    image: "/Testimonals/Saurav_Deshmukh.jpg",
    accent: "from-teal-400 to-emerald-600",
    badge: "Product Success"
  },
  {
    id: 12,
    name: "Ishaan",
    role: "Product Owner",
    achievement: "75% Salary Hike",
    details: ["Transitioned to PO", "75% salary bump", "Leadership in delivery"],
    image: "/Testimonals/ishaan.jpeg",
    accent: "from-sky-400 to-cyan-500",
    badge: "75% Hike"
  },
  {
    id: 13,
    name: "Apurva",
    role: "Business Analyst",
    achievement: "Business Analyst Role Landed",
    details: ["Strong analytical impact", "Confident BA interview", "Career growth unlocked"],
    image: "/Testimonals/apurva.jpeg",
    accent: "from-amber-400 to-orange-500",
    badge: "Business Analyst"
  },
  {
    id: 14,
    name: "Chinmay",
    role: "Business Analyst",
    achievement: "Business Analyst Role Achieved",
    details: ["Stepped into BA", "Applied product thinking", "Growth momentum built"],
    image: "/Testimonals/chinmay.jpeg",
    accent: "from-emerald-400 to-teal-500",
    badge: "Business Analyst"
  },
  {
    id: 15,
    name: "Sakshi",
    role: "SAP Ariba Consultant",
    achievement: "Secured within 1 Week",
    details: ["Officially joined BrainBox", "Super fast result", "Willingness to learn"],
    image: "/Testimonals/Sakshi.jpg",
    accent: "from-emerald-400 to-green-500",
    badge: "1 Week Result"
  },
  {
    id: 16,
    name: "Neha",
    role: "Scrum Master",
    achievement: "60% Salary Hike",
    details: ["Moved into Scrum Master role", "Delivered team leadership", "60% hike achieved"],
    image: "/Testimonals/neha.jpeg",
    accent: "from-sky-400 to-blue-500",
    badge: "Scrum Master"
  },
  {
    id: 17,
    name: "Akshay",
    role: "Front End Developer",
    achievement: "Front End Job Secured",
    details: ["Built a strong portfolio", "Landed a front end role", "Modern UI skillset"],
    image: "/Testimonals/akshay.jpeg",
    accent: "from-cyan-400 to-sky-500",
    badge: "Front End"
  },
  {
    id: 18,
    name: "Sumit",
    role: "Business Analyst",
    achievement: "Business Analyst Role Landed",
    details: ["Structured stakeholder insights", "Excelled in BA interviews", "Strong analytical impact"],
    image: "/Testimonals/sumit.jpeg",
    accent: "from-fuchsia-500 to-pink-500",
    badge: "Business Analyst"
  },
  {
    id: 19,
    name: "Nitish",
    role: "Business Analyst",
    achievement: "Business Analyst Placement",
    details: ["Secured high-growth BA role", "Delivered process clarity", "Consulting-ready skillset"],
    image: "/Testimonals/nitesh.jpeg",
    accent: "from-emerald-400 to-lime-500",
    badge: "Business Analyst"
  },
  {
    id: 20,
    name: "Mrunali",
    role: "Business Analyst",
    achievement: "Business Analyst Role Secured",
    details: ["Built strong domain expertise", "Nailed BA case studies", "Career-ready business analyst"],
    image: "/Testimonals/mrunali.jpeg",
    accent: "from-orange-400 to-red-500",
    badge: "Business Analyst"
  },
  {
    id: 21,
    name: "Sayali",
    role: "Business Analyst",
    achievement: "Business Analyst Role Achieved",
    details: ["Delivered actionable insights", "Land a BA opportunity", "Growing business impact"],
    image: "/Testimonals/sayali.jpeg",
    accent: "from-violet-400 to-purple-500",
    badge: "Business Analyst"
  },
];

const FEATURED_STORIES_COUNT = 4;

// Fix: Use React.FC to properly type the component and handle 'key' prop in list mapping
const TiltCard: React.FC<{ story: Story }> = ({ story }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = (y - centerY) / 10;
    const tiltY = (centerX - x) / 10;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div 
    id= "success-stories"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.1s ease-out'
      }}
      className="relative aspect-square rounded-2xl overflow-hidden bg-[#0a1120] border border-white/10 group cursor-pointer shadow-xl"
    >
      {/* Background with user image */}
      <div className="absolute inset-0">
        <img 
          src={story.image} 
          alt={story.name} 
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-40 group-hover:opacity-60"
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-40 transition-opacity`}></div>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
        {/* Top Section */}
        <div className="flex justify-between items-start">
           <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${story.accent} text-black text-[10px] font-bold uppercase tracking-wider shadow-lg`}>
              {story.badge}
           </div>
           <Star size={16} className="text-white/20 group-hover:text-neon-green transition-colors" />
        </div>

        {/* Middle Section - Text Bubble style */}
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
           <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl rounded-bl-none shadow-2xl mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-[10px] text-gray-200 leading-tight">
                {story.achievement}
              </p>
           </div>
           
           <h4 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-neon-green transition-all">
              {story.name}
           </h4>
           <p className="text-xs text-gray-400 font-medium">
              {story.role}
           </p>
        </div>

        {/* Bottom Section - List */}
        <div className="mt-4 space-y-1.5 overflow-hidden max-h-0 group-hover:max-h-20 transition-all duration-500">
           {story.details.map((detail, i) => (
             <div key={i} className="flex items-center gap-2">
                <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${story.accent}`}></div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">{detail}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Inner Border Glow */}
      <div className={`absolute inset-0 border-2 border-transparent group-hover:border-neon-green/30 rounded-2xl transition-colors duration-500 pointer-events-none`}></div>
      
      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${story.accent} opacity-40 group-hover:opacity-100 transition-opacity`}></div>
    </div>
  );
};

export const InstagramStories: React.FC = () => {
  const [showAllStories, setShowAllStories] = useState(false);
  const visibleStories = showAllStories ? STORIES : STORIES.slice(0, FEATURED_STORIES_COUNT);
  const remainingStoriesCount = STORIES.length - FEATURED_STORIES_COUNT;

  return (
    <section className="bg-black py-24 border-t border-white/5 relative overflow-hidden" id="instagram-section">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-neon-green/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-emerald/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
             <Award size={14} className="text-neon-green" />
             Success Stories
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            Our Hall Of <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-emerald">Success</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            From Civil Engineering to Data Science, and QA to Product Management. 
            Join the top 1% of candidates who <span className="text-white font-bold">cracked the code</span> to high-paying remote roles.
          </p>
        </div>

        {/* Featured stories first. Add new people to STORIES and they appear after clicking See More. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleStories.map((story) => (
            <TiltCard key={story.id} story={story} />
          ))}

          {showAllStories && (
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-neon-green/10 to-transparent border border-neon-green/20 flex flex-col items-center justify-center text-center p-8 group hover:bg-neon-green transition-all duration-500">
               <div className="w-16 h-16 rounded-full bg-neon-green/20 flex items-center justify-center mb-4 group-hover:bg-black transition-colors">
                  <TrendingUp size={32} className="text-neon-green" />
               </div>
               <h4 className="text-xl font-bold text-white group-hover:text-black transition-colors mb-2">Your Story Next?</h4>
               <p className="text-xs text-gray-400 group-hover:text-black/70 transition-colors mb-6">Join 1500+ successful career transformations today.</p>
               <button className="px-6 py-2 bg-white text-black text-xs font-bold rounded-full group-hover:bg-black group-hover:text-white transition-all shadow-xl">
                  START NOW
               </button>
            </div>
          )}
        </div>

        {remainingStoriesCount > 0 && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllStories((current) => !current)}
              aria-expanded={showAllStories}
              className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-7 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-neon-green/40 hover:bg-neon-green hover:text-black"
            >
              {showAllStories ? (
                <>
                  Show Less
                  <ChevronUp size={16} className="text-neon-green transition-colors group-hover:text-black" />
                </>
              ) : (
                <>
                  See More Stories
                  <span className="rounded-full bg-neon-green/15 px-2.5 py-1 text-[10px] text-neon-green transition-colors group-hover:bg-black/10 group-hover:text-black">
                    +{remainingStoriesCount}
                  </span>
                  <ChevronDown size={16} className="text-neon-green transition-colors group-hover:text-black" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
