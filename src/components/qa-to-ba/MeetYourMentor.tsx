import React from "react";
import { Play, Video, Sparkles, Briefcase, TrendingUp, Users, Award, CheckCheck } from "lucide-react";
import dheerajImage from "../../assets/dheeraj-hero.jpg"

interface MeetYourMentorProps {
  onPlayClick?: () => void;
  mentorVideoThumbnail?: string;
  mentorImage?: string;
}

export const MeetYourMentor: React.FC<MeetYourMentorProps> = ({
  onPlayClick,
  mentorVideoThumbnail = "/assets/mentor-video-thumbnail.jpg", // replace with actual path
  mentorImage = dheerajImage, // replace with actual path
}) => {
  return (
    <section className="py-14 relative font-sans border-t border-white/5" id="curriculum-syllabus-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            A Mentor You Need for a <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-emerald">
              Successful Transition
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mt-4 leading-relaxed max-w-2xl mx-auto font-light">
            Dheeraj Rathod is a veteran Product Leader dedicated to building deep functional, analytical, and technical spec-writing capability in aspiring Business Analysts and Product Owners.
          </p>
        </div>

        {/* 16:9 Video Player Frame */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black/40 group shadow-2xl hover:border-[#22c55e]/40 transition-all duration-300">
            <img
              src={mentorVideoThumbnail}
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-[1.02] transition-transform duration-700"
              alt="Mentor video pitch thumbnail"
            />
            {/* Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"></div>

            {/* Glowing particles or light overlay */}
            <div className="absolute inset-0 bg-neon-green/[0.02] mix-blend-color-dodge"></div>

            {/* Central Glowing Pulsing Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={onPlayClick}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neon-green text-black flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.4)] group-hover:scale-110 group-hover:shadow-[0_0_50px_rgba(34,197,94,0.6)] transition-all duration-300 z-20 cursor-pointer"
              >
                <Play size={24} className="fill-black translate-x-0.5 text-black" />
              </button>
            </div>

            {/* Bottom Video Progress Control bar overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent flex items-center justify-between gap-4 text-xs font-mono text-white/60">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-neon-green animate-ping"></div>
                <span className="font-sans text-[11px] font-semibold text-white">MENTOR PITCH VIDEO</span>
              </div>
              <div className="flex items-center gap-2 bg-black/60 px-2.5 py-1 rounded border border-white/5 backdrop-blur-sm">
                <Video size={12} className="text-neon-green" />
                <span>12:45 MIN PITCH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Mentor Highlights Info Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4 text-left">
          {/* Left Col: Core Statement */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-b from-[#070c19] to-black border border-white/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl min-h-[300px]">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-neon-green/[0.02] rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-4" style={{ paddingLeft: '0px', paddingBottom: '0px' }}>
              <div className="rounded-xl bg-neon-green/10 border border-[#22c55e]/30 flex items-center justify-center text-neon-green font-sans" style={{ width: '64px', height: '64px' }}>
                <Sparkles size={24} style={{ width: '24px', height: '24px' }} />
              </div>
              <h3 className="text-lg sm:text-l font-black text-white leading-snug" style={{ fontSize: '33px', lineHeight: '41px', marginBottom: '24px', marginTop: '24px' }}>
                Why hundreds of professionals trust Dheeraj to guide one of the biggest decisions in their careers.
              </h3>
              <p className="text-gray-400 font-light" style={{ fontSize: '18px', lineHeight: '30px' }}>
                A career leap isn't just about reading textbooks. It is about architectural alignment, business empathy, and structured coaching. Dheeraj bridges raw aspirations to premium high-paying execution roles.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full bg-cover bg-center border border-[#22c55e]/20"
                style={{ backgroundImage: `url(${mentorImage})` }}
              ></div>
              <div>
                <h4 className="text-xs font-bold text-white">Dheeraj Rathod</h4>
                <p className="text-[10px] text-gray-400 font-medium">Lead Mentor & Product Expert</p>
              </div>
            </div>
          </div>

          {/* Right Col: Structured Metrics & Highlights Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Experience Card */}
            <div className="bg-black/40 hover:bg-[#070c19]/60 border border-white/5 hover:border-[#22c55e]/20 p-5 rounded-2xl transition-all duration-300 group">
              <div className="mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#22c55e]/10 flex items-center justify-center text-neon-green border border-[#22c55e]/20">
                  <Briefcase size={16} />
                </div>
              </div>
              <p className="text-sm font-bold text-white mt-1">10+ Years in Product Leadership</p>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed" style={{ fontWeight: 'normal' }}>
                Steering large-scale cross-functional software initiatives across enterprise verticals.
              </p>
            </div>

            {/* Career Highlights Card */}
            <div className="bg-black/40 hover:bg-[#070c19]/60 border border-white/5 hover:border-[#22c55e]/20 p-5 rounded-2xl transition-all duration-300 group">
              <div className="mb-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-[#a855f7] border border-purple-500/20">
                  <TrendingUp size={16} />
                </div>
              </div>
              <p className="text-sm font-bold text-white mt-1">Ex-Senior Product Lead & Coach</p>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed" style={{ fontWeight: 'normal' }}>
                Led high-performance scrum teams, engineered agile blueprints, and defined system specifications.
              </p>
            </div>

            {/* Students Mentored Card */}
            <div className="bg-black/40 hover:bg-[#070c19]/60 border border-white/5 hover:border-[#22c55e]/20 p-5 rounded-2xl transition-all duration-300 group">
              <div className="mb-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-[#06b6d4] border border-cyan-500/20">
                  <Users size={16} />
                </div>
              </div>
              <p className="text-sm font-bold text-white mt-1">500+ Professionals Globally</p>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed" style={{ fontWeight: 'normal' }}>
                Deeply coaching and directing ambitious engineers, QA testers, and operations roles into prime BA/PO spots.
              </p>
            </div>

            {/* Achievements Card */}
            <div className="bg-black/40 hover:bg-[#070c19]/60 border border-white/5 hover:border-[#22c55e]/20 p-5 rounded-2xl transition-all duration-300 group">
              <div className="mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#eab308]/10 flex items-center justify-center text-[#eab308] border border-[#eab308]/20">
                  <Award size={16} />
                </div>
              </div>
              <p className="text-sm font-bold text-white mt-1">Engineered High-Volume Systems</p>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed" style={{ fontWeight: 'normal' }}>
                Pioneered robust enterprise backlogs, aligned stakeholder roadmaps, and unlocked rapid market fits.
              </p>
            </div>

            {/* Transition Success Stories Card (Full span) */}
            <div className="sm:col-span-2 bg-[#052e16]/10 hover:bg-[#052e16]/20 border border-[#22c55e]/20 hover:border-[#22c55e]/40 p-5 rounded-2xl transition-all duration-300 group">
              <div className="mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#22c55e]/25 flex items-center justify-center text-neon-green border border-[#22c55e]/40 animate-pulse">
                  <CheckCheck size={16} />
                </div>
              </div>
              <p className="text-base font-black text-white mt-1">120+ Verifiable High-Hike Direct Careers Changed</p>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed" style={{ fontWeight: 'normal' }}>
                Real candidates transformed from Customer Support, Operations, and Quality Assurance to elite technical BAs and Product Owners with substantial salary rises.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};