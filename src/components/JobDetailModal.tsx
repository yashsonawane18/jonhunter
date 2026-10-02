import React from 'react';
import {
  X,
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Clock3,
  ExternalLink,
  CheckCircle2,
  Share2,
  Sparkles,
  Send,
  Users,
  FileCheck,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { CandidateParsedProfile } from '../lib/applicationApi';

export interface JobDetailData {
  id: string;
  title: string;
  company: string;
  location?: string;
  jobType?: string;
  salary?: string;
  experience?: string;
  description?: string;
  skills?: string[];
  applicationUrl?: string;
  matchScore?: number;
  ats_score?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  experience_fit_text?: string;
  connections?: {
    name: string;
    title: string;
    linkedin_url: string;
    email?: string;
  }[];
  discoveredAt?: string;
  posted_time?: string;
}

interface JobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobDetailData | null;
  candidateProfile?: CandidateParsedProfile | null;
  onApply: (job: JobDetailData) => void;
  onUploadResumeClick?: () => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  isOpen,
  onClose,
  job,
  candidateProfile,
  onApply,
  onUploadResumeClick,
}) => {
  if (!isOpen || !job) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${job.title} at ${job.company}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Job link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#111] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#00C896]/15 border border-[#00C896]/30 text-[#00C896]">
                  Verified Tech Job
                </span>
                {job.posted_time && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                    <Clock3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{job.posted_time}</span>
                  </span>
                )}
                {candidateProfile && job.ats_score ? (
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    job.ats_score >= 85
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : job.ats_score >= 70
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                  }`}>
                    🎯 ATS Score: {job.ats_score}%
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800 border border-zinc-700 text-zinc-300">
                    ⚡ Verified Active Requisition
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-300">
                <span className="flex items-center gap-1 font-bold text-white">
                  <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                  {job.company}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  {job.location || 'All India'}
                </span>
                {job.experience && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                    {job.experience} Exp
                  </span>
                )}
                {job.salary && (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <DollarSign className="w-3.5 h-3.5" />
                    {job.salary}
                  </span>
                )}
                {job.posted_time && (
                  <span className="flex items-center gap-1 text-amber-300 font-medium">
                    <Clock3 className="w-3.5 h-3.5 text-amber-400" />
                    {job.posted_time}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* ATS Analysis Section */}
          {candidateProfile && job.ats_score ? (
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 space-y-3 shadow-lg shadow-emerald-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Real-Time ATS Resume Evaluation</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-sm">
                  {job.ats_score}% Match
                </span>
              </div>
              {job.experience_fit_text && (
                <p className="text-xs text-zinc-300 font-medium">{job.experience_fit_text}</p>
              )}
              {Array.isArray(job.matched_skills) && job.matched_skills.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                    ✓ Matched Skills ({job.matched_skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {job.matched_skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {Array.isArray(job.missing_skills) && job.missing_skills.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    ⚠ Missing Keywords / Skills Gap ({job.missing_skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {job.missing_skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00C896]/10 border border-[#00C896]/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[#00C896]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Want to see your live ATS Match Score?</h4>
                  <p className="text-[11px] text-zinc-400">Upload your resume to check keyword gaps and ATS fit for this opening.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onApply(job)}
                className="px-4 py-2 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-black text-xs font-black border-2 border-[#00E5AA] shadow-md shadow-[#00C896]/20 shrink-0 transition-all hover:scale-105"
              >
                Scan Resume
              </button>
            </div>
          )}

          {/* Key Skills */}
          {Array.isArray(job.skills) && job.skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Required Technical Stack & Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Full Job Description
            </h3>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-zinc-200 leading-relaxed whitespace-pre-line text-xs sm:text-sm font-sans">
              {job.description ||
                `${job.title} at ${job.company}. Please review required technical skills and submit your resume directly.`}
            </div>
          </div>

          {/* Hiring Team / Connections */}
          {Array.isArray(job.connections) && job.connections.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#00C896]" />
                <span>Verified Talent Acquisition / Hiring Team</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {job.connections.map((c, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{c.name}</p>
                      <p className="text-[11px] text-zinc-400">{c.title}</p>
                    </div>
                    {c.linkedin_url && (
                      <a
                        href={c.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <span>LinkedIn</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer / Action Bar */}
        <div className="p-4 sm:p-6 border-t border-zinc-800 bg-zinc-900/95 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 hover:border-zinc-400 text-white transition-colors shrink-0 shadow-sm"
              title="Share Job Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300">
              <Lock className="w-3.5 h-3.5 text-[#00C896] shrink-0" />
              <span>Official LinkedIn Link unlocks upon submission</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onApply(job)}
            className="px-8 py-3 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-black font-black text-sm flex items-center justify-center gap-2 border-2 border-[#00E5AA] shadow-xl shadow-[#00C896]/30 hover:scale-105 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Apply Now & Unlock Link (0 Login)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
