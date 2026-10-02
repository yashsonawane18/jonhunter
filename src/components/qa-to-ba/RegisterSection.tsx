import React, { useState } from 'react';
import API_ENDPOINTS from '../../config/api';
import { CheckCircle2, Send, Shield, ChevronDown } from 'lucide-react';

export const RegisterSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentRole: '',
    program: 'QA → BA / PO (Career Transition)' // fixed default
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.currentRole || !formData.program) {
      alert('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('Submitting...');

    try {
      const payload = {
        full_name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        whatsapp_number: formData.phone.trim(),
        current_role: formData.currentRole.trim(),
        target_role: formData.program.trim()
      };

      const response = await fetch(API_ENDPOINTS.DISCOVERY_CALL_ENQUIRY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorMsg = errorJson.message || errorJson.error || errorText;
        } catch {
          // keep plain text
        }
        throw new Error(errorMsg || 'Submission failed');
      }

      const result = await response.json();
      console.log('Enquiry submitted:', result);

      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        currentRole: '', 
        program: 'QA → BA / PO (Career Transition)' 
      });
      setShowSuccessModal(true);
      setSubmitMessage('');
    } catch (error: any) {
      console.error('Discovery call submission error:', error);
      setSubmitMessage(`✗ Failed: ${error.message || 'Please try again later.'}`);
      setTimeout(() => {
        if (submitMessage?.startsWith('✗ Failed')) setSubmitMessage('');
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section id="register" className="scroll-mt-16 py-14 sm:py-20 relative overflow-hidden border-t border-white/5 bg-[#030712] font-sans">
        {/* Background radial light */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-neon-green/[0.012] blur-[130px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-emerald-500/[0.01] blur-[140px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid min-w-0 grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16 items-start">
            
            {/* Left Content Column */}
            <div className="min-w-0 lg:col-span-6 space-y-7 sm:space-y-8 text-left">
              <div>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                  Book your free <br className="hidden min-[360px]:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green via-emerald-400 to-neon-emerald">
                    1:1 strategy call.
                  </span>
                </h2>
                <p className="text-base sm:text-lg text-gray-400 mt-6 leading-relaxed font-light">
                  30 minutes with our team. We'll assess your background, pick your target role, and map the exact steps to your next offer. Zero commitment — just clarity.
                </p>
              </div>

              {/* Bullet Points */}
              <div className="space-y-5 sm:space-y-6">
                <div className="flex gap-3 sm:gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center text-neon-green shrink-0 mt-1">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white leading-snug">
                      A personalized switch roadmap
                    </h4>
                    <p className="text-sm text-gray-400 mt-1 font-light leading-relaxed">
                      Your current role → target role, step by step
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8] shrink-0 mt-1">
                    <Send size={16} className="ml-0.5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white leading-snug">
                      A dedicated team applies for you
                    </h4>
                    <p className="text-sm text-gray-400 mt-1 font-light leading-relaxed">
                      200+ applications across LinkedIn, Naukri & portals
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center text-[#a855f7] shrink-0 mt-1">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white leading-snug">
                      Support until you're hired
                    </h4>
                    <p className="text-sm text-gray-400 mt-1 font-light leading-relaxed">
                      No time limit. We stay till you sign the offer.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer highlight list */}
              <div className="pt-8 border-t border-white/5 flex flex-wrap gap-x-8 gap-y-3 text-xs sm:text-sm text-gray-400 font-mono">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                  1500+ helped
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                  50%–200% hikes
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                  Replies in 24h
                </span>
              </div>
            </div>

            {/* Right Column: Card with form */}
            <div className="min-w-0 lg:col-span-6">
              <div className="bg-[#080d19]/80 border border-white/5 rounded-2xl sm:rounded-3xl p-4 min-[360px]:p-5 sm:p-10 relative overflow-hidden backdrop-blur-md hover:border-white/10 transition-colors duration-300">
                {/* Subtle backlighting blur */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#22c55e]/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                
                {showSuccessModal ? (
                  <div className="py-12 text-center space-y-6 relative z-10">
                    <div className="w-16 h-16 bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                      ✓
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        Your free 1:1 strategy call is booked!
                      </h3>
                      <p className="text-sm text-gray-400 font-light leading-relaxed max-w-sm mx-auto">
                        Thank you, <strong className="text-white">{formData.name}</strong>! Our lead career strategist will review your background and call you at <strong className="text-white">{formData.phone}</strong> within 24 hours.
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setShowSuccessModal(false);
                        setFormData({ 
                          name: '', 
                          email: '', 
                          phone: '', 
                          currentRole: '', 
                          program: 'QA → BA / PO (Career Transition)' 
                        });
                      }}
                      className="text-xs font-bold text-neon-green uppercase tracking-wider hover:underline"
                    >
                      Book Another Call
                    </button>
                  </div>
                ) : (
                  <div className="relative z-10">
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                      Apply for the next cohort
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light leading-relaxed">
                      Limited seats per batch. Tell us about you — we'll call to confirm your fit.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">
                      
                      {submitMessage && submitMessage.startsWith('✗ Failed') && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs font-light">
                          {submitMessage}
                        </div>
                      )}

                      {/* Full Name */}
                      <div>
                        <label className="text-xs font-mono font-normal text-gray-500 tracking-wider mb-2 block uppercase">
                          Full Name
                        </label>
                        <input 
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Priya Sharma"
                          className="w-full bg-[#0d1425] border border-white/5 hover:border-white/10 rounded-xl px-4 py-3.5 text-white text-xs sm:text-sm placeholder-gray-600 focus:outline-none focus:border-[#22c55e]/30 focus:ring-1 focus:ring-[#22c55e]/30 transition-all font-light"
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="text-xs font-mono font-normal text-gray-500 tracking-wider mb-2 block uppercase">
                          Email
                        </label>
                        <input 
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@work.com"
                          className="w-full bg-[#0d1425] border border-white/5 hover:border-white/10 rounded-xl px-4 py-3.5 text-white text-xs sm:text-sm placeholder-gray-600 focus:outline-none focus:border-[#22c55e]/30 focus:ring-1 focus:ring-[#22c55e]/30 transition-all font-light"
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* WhatsApp Number */}
                      <div>
                        <label className="text-xs font-mono font-normal text-gray-500 tracking-wider mb-2 block uppercase">
                          WhatsApp Number
                        </label>
                        <input 
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full bg-[#0d1425] border border-white/5 hover:border-white/10 rounded-xl px-4 py-3.5 text-white text-xs sm:text-sm placeholder-gray-600 focus:outline-none focus:border-[#22c55e]/30 focus:ring-1 focus:ring-[#22c55e]/30 transition-all font-light"
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Current Role */}
                      <div>
                        <label className="text-xs font-mono font-normal text-gray-500 tracking-wider mb-2 block uppercase">
                          Current Role
                        </label>
                        <div className="relative">
                          <select
                            name="currentRole"
                            required
                            value={formData.currentRole}
                            onChange={handleChange}
                            className="w-full bg-[#0d1425] border border-white/5 hover:border-white/10 rounded-xl px-4 py-3.5 pr-10 text-white text-xs sm:text-sm focus:outline-none focus:border-[#22c55e]/30 focus:ring-1 focus:ring-[#22c55e]/30 transition-all font-light appearance-none cursor-pointer"
                            disabled={isSubmitting}
                          >
                            <option value="" disabled className="text-gray-600 bg-[#0d1425]">Select your current role</option>
                            <option value="Manual QA / Tester" className="bg-[#0d1425] text-white">Manual QA / Tester</option>
                            <option value="QA Automation Engineer" className="bg-[#0d1425] text-white">QA Automation Engineer</option>
                            <option value="SDET / Test Lead" className="bg-[#0d1425] text-white">SDET / Test Lead</option>
                            <option value="UAT Analyst" className="bg-[#0d1425] text-white">UAT Analyst</option>
                            <option value="Support Engineer" className="bg-[#0d1425] text-white">Support Engineer</option>
                            <option value="Non-IT / Other" className="bg-[#0d1425] text-white">Non-IT / Other</option>
                          </select>
                          <ChevronDown size={14} className="text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Which Program - displayed as static text, hidden input for submission */}
                      <div>
                        <label className="text-xs font-mono font-normal text-gray-500 tracking-wider mb-2 block uppercase">
                          Which Program?
                        </label>
                        <div className="bg-[#0d1425] border border-white/5 rounded-xl px-4 py-3.5 text-white text-xs sm:text-sm font-light">
                          QA → BA / PO (Career Transition)
                        </div>
                        <input
                          type="hidden"
                          name="program"
                          value={formData.program}
                        />
                      </div>

                      {/* Submit button */}
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold uppercase py-4 rounded-xl text-xs tracking-wider transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] shadow-lg inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Submitting...' : 'Book my free 1:1 call →'}
                      </button>

                      {/* Sub-note */}
                      <p className="text-[10px] text-gray-500 text-center font-light pt-2 select-none uppercase tracking-wide">
                        We respond within 24 hours, Mon–Sat · 100% confidential.
                      </p>
                    </form>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};
