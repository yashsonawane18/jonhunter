import React from 'react';
import {
  X,
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Clock3,
  ExternalLink,
  Share2,
  Send,
  Users,
  FileCheck,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-[#121212] border border-[#2e2e2e] rounded-[16px] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#2e2e2e] bg-[#121212] space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-normal bg-[#242424] border border-[#2e2e2e] text-[#3ecf8e]">
                  Verified ATS Posting
                </span>
                {job.posted_time && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-normal bg-[#181818] border border-[#2e2e2e] text-[#b4b4b4] flex items-center gap-1">
                    <Clock3 className="w-3 h-3 text-[#3ecf8e]" />
                    <span>{job.posted_time}</span>
                  </span>
                )}
                {candidateProfile && job.ats_score ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-normal border border-[#2e2e2e] bg-[#242424] text-[#3ecf8e]">
                    ATS Score: {job.ats_score}%
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-normal bg-[#181818] border border-[#2e2e2e] text-[#898989]">
                    Active Requisition
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-medium tracking-[-0.007em] text-[#fafafa]">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#b4b4b4]">
                <span className="flex items-center gap-1 font-medium text-[#fafafa]">
                  <Building2 className="w-3.5 h-3.5 text-[#3ecf8e]" />
                  {job.company}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#898989]" />
                  {job.location || 'All India (Remote & Nationwide)'}
                </span>
                {job.experience && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#898989]" />
                    {job.experience} Exp
                  </span>
                )}
                {job.salary && (
                  <span className="flex items-center gap-1 text-[#3ecf8e] font-medium">
                    <DollarSign className="w-3.5 h-3.5" />
                    {job.salary}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#181818] hover:bg-[#242424] border border-[#2e2e2e] hover:border-[#4d4d4d] text-[#b4b4b4] hover:text-[#fafafa] flex items-center justify-center transition-colors shrink-0"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm bg-[#121212]">
          {/* ATS Analysis Section */}
          {candidateProfile && job.ats_score ? (
            <div className="p-4 rounded-[16px] bg-[#181818] border border-[#2e2e2e] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#3ecf8e]" />
                  <span className="text-sm font-medium text-[#fafafa]">Real-Time ATS Resume Evaluation</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#242424] border border-[#3ecf8e] text-[#3ecf8e] font-mono text-xs">
                  {job.ats_score}% Match
                </span>
              </div>
              {job.experience_fit_text && (
                <p className="text-xs text-[#b4b4b4] font-normal leading-relaxed">{job.experience_fit_text}</p>
              )}
              {Array.isArray(job.matched_skills) && job.matched_skills.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-normal text-[#3ecf8e] uppercase tracking-wider block">
                    ✓ Matched Competencies ({job.matched_skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {job.matched_skills.map((s) => (
                      <span key={s} className="px-2.5 py-0.5 rounded-full text-xs font-normal bg-[#242424] text-[#fafafa] border border-[#2e2e2e]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Key Skills */}
          {Array.isArray(job.skills) && job.skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-normal uppercase tracking-wider text-[#898989]">
                Required Technical Stack & Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-[#181818] border border-[#2e2e2e] text-xs font-normal text-[#fafafa]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-normal uppercase tracking-wider text-[#898989]">
              Requisition Description
            </h3>
            <div className="p-4 rounded-[16px] bg-[#181818] border border-[#2e2e2e] text-[#b4b4b4] leading-relaxed whitespace-pre-line text-xs sm:text-sm font-sans">
              {job.description ||
                `${job.title} at ${job.company}. Review the technical stack specifications above and submit your profile directly.`}
            </div>
          </div>

          {/* Hiring Team / Connections */}
          {Array.isArray(job.connections) && job.connections.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-normal uppercase tracking-wider text-[#898989] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#3ecf8e]" />
                <span>Verified Talent Acquisition / Hiring Contacts</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {job.connections.map((c, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#181818] border border-[#2e2e2e] flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-medium text-[#fafafa]">{c.name}</p>
                      <p className="text-[11px] text-[#898989]">{c.title}</p>
                    </div>
                    {c.linkedin_url && (
                      <a
                        href={c.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-full bg-[#242424] hover:bg-[#2e2e2e] border border-[#2e2e2e] text-[#fafafa] text-xs font-normal flex items-center gap-1 transition-colors"
                      >
                        <span>LinkedIn</span>
                        <ExternalLink className="w-3 h-3 text-[#3ecf8e]" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer / Action Bar */}
        <div className="p-4 sm:p-5 border-t border-[#2e2e2e] bg-[#121212] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-full bg-[#181818] hover:bg-[#242424] border border-[#393939] hover:border-[#4d4d4d] text-[#fafafa] transition-colors shrink-0"
              title="Share Job Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181818] border border-[#2e2e2e] text-[11px] text-[#898989]">
              <Lock className="w-3 h-3 text-[#3ecf8e] shrink-0" />
              <span>Official ATS application link verified</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onApply(job)}
            className="px-6 py-2 rounded-full bg-[#3ecf8e] hover:bg-[#00c573] text-[#121212] font-medium text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#3ecf8e] hover:border-[#1f4b37] transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Apply Now (Zero Login Required)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
