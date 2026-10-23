import React from 'react';
import { MessageCircle, CheckCircle, MousePointer2, Briefcase, DollarSign } from 'lucide-react';

export const SmarterWay: React.FC = () => {
  return (
    <section className="bg-white dark:bg-black py-24 border-t border-gray-200 dark:border-white/5 relative overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center px-4 mb-16 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                The Smarter Way to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500 dark:from-neon-green dark:to-neon-emerald">Land a Job</span>
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
                Recruiters instantly see through & reject sloppy AI auto-filled applications.
                We apply to jobs with <span className="text-emerald-600 dark:text-neon-green font-bold">REAL HUMANS</span>, no AI Apply bullshit.
            </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {/* Card 1: Tell us about yourself */}
            <div className="bg-slate-50 dark:bg-[#0f172a] rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden group hover:border-yellow-400 dark:hover:border-yellow-500/30 transition-all duration-500 relative flex flex-col h-full shadow-lg dark:shadow-none">
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="p-8 pb-4 relative z-10 text-center">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-yellow-100 mb-4">1. Tell us about yourself</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">Share your profile, requirements, and career goals on an onboarding call.</p>
                </div>

                <div className="flex-1 relative mt-auto h-64 w-full flex justify-center items-end overflow-hidden">
                    {/* Person Image Placeholder */}
                    <div className="w-48 h-56 relative mx-auto z-10">
                        <img 
                          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80" 
                          alt="Candidate" 
                          className="w-full h-full object-cover rounded-t-full opacity-90 dark:opacity-80 mix-blend-normal dark:mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500 mask-image-gradient" 
                          style={{maskImage: 'linear-gradient(to top, black 80%, transparent 100%)'}}
                        />
                    </div>
                    
                    {/* Floating Chat Bubble */}
                    <div className="absolute top-10 left-4 bg-white dark:bg-[#1e293b]/90 backdrop-blur-md border border-gray-200 dark:border-white/10 p-3 rounded-2xl rounded-bl-none shadow-xl transform -rotate-6 group-hover:rotate-0 transition-transform duration-500 z-20 max-w-[160px]">
                        <div className="flex items-start gap-2">
                             <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                <MessageCircle size={14} className="text-purple-600 dark:text-purple-300" />
                             </div>
                             <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-tight text-left">I want a role in Product Management...</p>
                        </div>
                    </div>

                    {/* Salary Badge */}
                    <div className="absolute bottom-20 -right-2 bg-yellow-400 dark:bg-yellow-500 text-black font-bold px-3 py-1.5 rounded-lg shadow-lg dark:shadow-[0_0_15px_rgba(234,179,8,0.4)] transform rotate-3 group-hover:rotate-6 transition-transform z-20 flex items-center gap-1 text-xs">
                        <DollarSign size={12} fill="black" /> $260K CTC
                    </div>

                    {/* Name Tag */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white z-20 shadow-sm">
                        Matthew A.
                    </div>
                </div>
            </div>

            {/* Card 2: Select dream jobs */}
            <div className="bg-slate-50 dark:bg-[#0f172a] rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden group hover:border-pink-400 dark:hover:border-pink-500/30 transition-all duration-500 relative flex flex-col h-full shadow-lg dark:shadow-none">
                <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="p-8 pb-4 relative z-10 text-center">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-pink-200 mb-4">2. Select your dream jobs</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">Handpick & delegate your favorite jobs in a single click.</p>
                </div>

                <div className="flex-1 relative min-h-[250px] px-6 pb-6 flex flex-col justify-end">
                    {/* Stacked Cards Container */}
                    <div className="space-y-3 relative">
                        {/* Background Card */}
                        <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-md dark:shadow-lg transform scale-95 opacity-50 absolute -top-12 w-full">
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded bg-gray-100 dark:bg-white flex items-center justify-center text-black font-bold text-xs">S</div>
                                 <div className="flex-1">
                                     <div className="h-2 w-20 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                                     <div className="h-1.5 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                 </div>
                             </div>
                        </div>

                         {/* Main Card */}
                        <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl relative z-10 group-hover:-translate-y-2 transition-transform duration-500">
                             <div className="flex justify-between items-start mb-3">
                                 <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded bg-gray-100 dark:bg-white flex items-center justify-center text-black font-bold">A</div>
                                     <div className="text-left">
                                         <h4 className="text-slate-900 dark:text-white font-bold text-sm">Product Manager</h4>
                                         <p className="text-[10px] text-gray-500 dark:text-gray-400">Amazon • Seattle, WA</p>
                                     </div>
                                 </div>
                                 <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded text-gray-400">
                                     <Briefcase size={12} />
                                 </div>
                             </div>
                             <div className="flex gap-2 mb-3">
                                 <span className="bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded text-[10px] text-gray-500 dark:text-gray-400">$160k-200k</span>
                                 <span className="bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded text-[10px] text-gray-500 dark:text-gray-400">Full-Time</span>
                             </div>
                             <button className="w-full bg-pink-500 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-500 text-white text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md dark:shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                                 <MousePointer2 size={12} /> Delegate Job
                             </button>
                        </div>
                    </div>
                    
                    {/* Cursor Graphic */}
                    <div className="absolute bottom-8 right-8 text-pink-500 transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-100 z-20">
                         <MousePointer2 size={32} fill="currentColor" className="stroke-white dark:stroke-black" />
                    </div>
                </div>
            </div>

            {/* Card 3: We apply for you */}
            <div className="bg-slate-50 dark:bg-[#0f172a] rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden group hover:border-green-400 dark:hover:border-green-500/30 transition-all duration-500 relative flex flex-col h-full shadow-lg dark:shadow-none">
                 <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="p-8 pb-4 relative z-10 text-center">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-green-200 mb-4">3. We apply for you</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">Relax as your dedicated job assistant applies to them in 12-24 hours guaranteed.</p>
                </div>

                <div className="flex-1 relative px-6 pb-6 flex flex-col justify-end">
                     {/* Stats Pills */}
                     <div className="flex justify-center gap-2 mb-6">
                         <span className="px-3 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/5 text-[10px] text-gray-500 dark:text-gray-400 shadow-sm">Delegated (3)</span>
                         <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/20 border border-green-200 dark:border-green-500/30 text-[10px] text-green-700 dark:text-green-300 font-bold shadow-sm dark:shadow-[0_0_10px_rgba(34,197,94,0.2)]">Applied (16)</span>
                         <span className="px-3 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/5 text-[10px] text-gray-500 dark:text-gray-400 shadow-sm">Interviews (2)</span>
                     </div>

                     {/* Job List */}
                     <div className="space-y-3">
                         {[
                             { name: 'Software Engineer', company: 'Amazon', logo: 'A', delay: 0 },
                             { name: 'Product Manager', company: 'Stripe', logo: 'S', delay: 100 },
                             { name: 'Mgmt Consultant', company: 'BCG', logo: 'B', delay: 200 }
                         ].map((job, idx) => (
                             <div key={idx} className="bg-white dark:bg-[#1e293b] p-3 rounded-xl border border-gray-200 dark:border-white/5 flex items-center justify-between group-hover:translate-x-1 transition-transform shadow-sm" style={{ transitionDelay: `${job.delay}ms` }}>
                                 <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded bg-gray-100 dark:bg-white flex items-center justify-center text-black font-bold text-xs border border-gray-100">{job.logo}</div>
                                     <div className="text-left">
                                         <div className="text-xs font-bold text-slate-800 dark:text-white">{job.name}</div>
                                         <div className="text-[10px] text-gray-500 dark:text-gray-400">{job.company}</div>
                                     </div>
                                 </div>
                                 <div className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-green-200 dark:border-green-500/20">
                                     <CheckCircle size={10} /> Applied
                                 </div>
                             </div>
                         ))}
                     </div>
                </div>
            </div>
        </div>
    </section>
  );
};