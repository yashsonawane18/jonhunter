import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Link2,
  X,
  Plus,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { CandidateParsedProfile, calculateAtsScore, AtsScoreResult } from '../../lib/applicationApi';
import { toast } from 'sonner';

interface StepProfileReviewProps {
  initialProfile: CandidateParsedProfile;
  resumeFileName?: string;
  targetJob?: {
    id?: string;
    title: string;
    company: string;
    location?: string;
    salary?: string;
    skills?: string[];
    description?: string;
    experience?: string;
  };
  onBack: () => void;
  onNext: (updatedProfile: CandidateParsedProfile) => void;
}

export const StepProfileReview: React.FC<StepProfileReviewProps> = ({
  initialProfile,
  resumeFileName,
  targetJob,
  onBack,
  onNext,
}) => {
  const [name, setName] = useState(initialProfile.name || '');
  const [email, setEmail] = useState(initialProfile.email || '');
  const [phone, setPhone] = useState(initialProfile.phone || '');
  const [location, setLocation] = useState(initialProfile.location || 'Pune, Maharashtra, India');
  const [experienceYears, setExperienceYears] = useState<number>(initialProfile.total_experience_years || 3.0);
  const [primaryDomain, setPrimaryDomain] = useState(initialProfile.primary_domain || 'Software Engineering');
  const [skills, setSkills] = useState<string[]>(initialProfile.top_skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [education, setEducation] = useState(
    initialProfile.education?.join(', ') || 'Bachelor of Engineering / Computer Science'
  );
  const [linkedin, setLinkedin] = useState(initialProfile.linkedin || '');
  const [portfolio, setPortfolio] = useState('');
  const [summary, setSummary] = useState(initialProfile.summary || '');

  // Live ATS scoring state
  const [atsResult, setAtsResult] = useState<AtsScoreResult | null>(null);
  const [atsLoading, setAtsLoading] = useState<boolean>(false);

  // Compute live ATS score whenever skills, domain, or experience changes
  useEffect(() => {
    if (!targetJob?.title) return;
    let isCurrent = true;

    async function computeScore() {
      setAtsLoading(true);
      try {
        const currentProf: CandidateParsedProfile = {
          ...initialProfile,
          name,
          email,
          total_experience_years: Number(experienceYears) || 0,
          primary_domain: primaryDomain,
          top_skills: skills,
          raw_resume_text: initialProfile.raw_resume_text || skills.join(' '),
        };

        const res = await calculateAtsScore(
          currentProf,
          targetJob?.title || '',
          targetJob?.description || '',
          targetJob?.experience || '',
          targetJob?.skills || []
        );

        if (isCurrent) {
          setAtsResult(res);
        }
      } catch {
        // Silent fallback
      } finally {
        if (isCurrent) setAtsLoading(false);
      }
    }

    computeScore();

    return () => {
      isCurrent = false;
    };
  }, [skills, primaryDomain, experienceYears, targetJob]);

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Skill is already added.');
      return;
    }
    setSkills([...skills, trimmed]);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    const updated: CandidateParsedProfile = {
      ...initialProfile,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      total_experience_years: Number(experienceYears) || 0,
      primary_domain: primaryDomain.trim(),
      top_skills: skills,
      education: education ? education.split(',').map((e) => e.trim()).filter(Boolean) : [],
      linkedin: linkedin.trim(),
      summary: summary.trim(),
    };

    onNext(updated);
  };

  return (
    <form onSubmit={handleContinue} className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div>
          <h3 className="text-xl font-bold text-white">Review Your Profile & ATS Match</h3>
          <p className="text-xs text-zinc-400">
            Auto-populated from {resumeFileName ? `"${resumeFileName}"` : 'your resume'}. Verified against {targetJob?.title || 'target role'}.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Auto-Populated</span>
        </div>
      </div>

      {/* Live ATS Compatibility Card */}
      {targetJob && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-emerald-500/30 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Live ATS Resume Score for: <span className="text-[#00C896]">{targetJob.title}</span></h4>
                <p className="text-[11px] text-zinc-400">{targetJob.company}</p>
              </div>
            </div>
            {atsLoading ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Evaluating...</span>
              </div>
            ) : atsResult ? (
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-black border ${
                  atsResult.ats_score >= 85
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : atsResult.ats_score >= 70
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-red-500/20 text-red-400 border-red-500/40'
                }`}>
                  {atsResult.ats_score}% ATS Match
                </span>
              </div>
            ) : null}
          </div>

          {atsResult && (
            <div className="space-y-2 pt-1 border-t border-zinc-800/80">
              <p className="text-xs text-zinc-300 font-medium">{atsResult.experience_fit_text}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {atsResult.matched_skills && atsResult.matched_skills.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      ✓ Matched Skills ({atsResult.matched_skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {atsResult.matched_skills.map((s) => (
                        <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {atsResult.missing_skills && atsResult.missing_skills.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      ⚠ Missing Keywords / Skills Gap ({atsResult.missing_skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {atsResult.missing_skills.map((s) => (
                        <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-medium">
                          + {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {atsResult.recommendations && atsResult.recommendations.length > 0 && (
                <p className="text-[11px] text-zinc-400 italic">
                  💡 Tip: {atsResult.recommendations[0]}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span>Full Name <span className="text-red-400">*</span></span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00C896] transition-colors"
          />
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-zinc-400" />
            <span>Email Address <span className="text-red-400">*</span></span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. john.doe@example.com"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00C896] transition-colors"
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-zinc-400" />
            <span>Phone Number</span>
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 98765 43210"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00C896] transition-colors"
          />
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            <span>Location / City</span>
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Pune, Maharashtra, India"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00C896] transition-colors"
          />
        </div>

        {/* Total Experience (Years) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
            <span>Total Experience (Years)</span>
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            max="40"
            value={experienceYears}
            onChange={(e) => setExperienceYears(parseFloat(e.target.value) || 0)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00C896] transition-colors"
          />
        </div>

        {/* Primary Domain */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
            <span>Primary Specialization / Domain</span>
          </label>
          <input
            type="text"
            value={primaryDomain}
            onChange={(e) => setPrimaryDomain(e.target.value)}
            placeholder="e.g. Backend Engineering / AI"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00C896] transition-colors"
          />
        </div>
      </div>

      {/* Skills Tag Management */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
          <span>Key Skills & Competencies ({skills.length})</span>
          <span className="text-[11px] text-zinc-500">Click &times; to remove or add more below</span>
        </label>
        <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl flex flex-wrap gap-1.5 min-h-[52px]">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 font-medium group hover:border-zinc-500 transition-colors"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="text-zinc-400 hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {skills.length === 0 && (
            <span className="text-xs text-zinc-500 italic">No skills listed yet. Add some below!</span>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkillInput}
            onChange={(e) => setNewSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill();
              }
            }}
            placeholder="Add a skill (e.g. Docker, PyTorch, FastAPI) and press Enter"
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00C896]"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white flex items-center gap-1 border-2 border-zinc-600 hover:border-zinc-400 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#00C896]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Education & Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
            <span>Education / Degrees</span>
          </label>
          <input
            type="text"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="e.g. B.Tech Computer Science, Pune University"
            className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00C896]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>LinkedIn / Portfolio URL</span>
          </label>
          <input
            type="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://linkedin.com/in/username"
            className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00C896]"
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 hover:border-zinc-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Upload</span>
        </button>

        <button
          type="submit"
          className="px-7 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-black font-black text-xs flex items-center gap-2 border-2 border-[#00E5AA] shadow-xl shadow-[#00C896]/30 hover:scale-105 transition-all"
        >
          <span>View Job Recommendations</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
};
