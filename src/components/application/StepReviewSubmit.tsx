import React, { useState } from 'react';
import {
  CheckCircle2,
  Building2,
  MapPin,
  FileText,
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  Loader2,
  Send,
} from 'lucide-react';
import { CandidateParsedProfile, CandidateApplicationPayload, submitCandidateApplication } from '../../lib/applicationApi';
import { toast } from 'sonner';

interface StepReviewSubmitProps {
  targetJob: {
    id: string;
    title: string;
    company: string;
    location?: string;
    salary?: string;
  };
  candidateProfile: CandidateParsedProfile;
  resumeFile: File | null;
  selectedAdditionalJobIds: string[];
  onBack: () => void;
  onSubmitSuccess: (applicationId: string) => void;
}

export const StepReviewSubmit: React.FC<StepReviewSubmitProps> = ({
  targetJob,
  candidateProfile,
  resumeFile,
  selectedAdditionalJobIds,
  onBack,
  onSubmitSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload: CandidateApplicationPayload = {
        job_id: targetJob.id,
        job_title: targetJob.title,
        company: targetJob.company,
        candidate_name: candidateProfile.name,
        candidate_email: candidateProfile.email,
        candidate_phone: candidateProfile.phone || '',
        candidate_location: candidateProfile.location || '',
        experience_years: candidateProfile.total_experience_years || 0,
        skills: candidateProfile.top_skills || [],
        education: candidateProfile.education?.join(', ') || '',
        linkedin_url: candidateProfile.linkedin || '',
        resume_filename: resumeFile?.name || 'Candidate_Resume.pdf',
        resume_raw_text: candidateProfile.raw_resume_text || '',
        additional_applied_job_ids: selectedAdditionalJobIds,
        status: 'New',
      };

      const result = await submitCandidateApplication(payload);
      toast.success('Application submitted successfully!');
      onSubmitSuccess(result.application_id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div>
          <h3 className="text-xl font-bold text-white">Review & Confirm Application</h3>
          <p className="text-xs text-zinc-400">
            Please verify your information before submitting directly to the recruiter inbox.
          </p>
        </div>
      </div>

      {/* Target Job Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-900/80 border border-zinc-700 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#00C896] uppercase tracking-wider">
            Primary Target Role
          </span>
          {selectedAdditionalJobIds.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              +{selectedAdditionalJobIds.length} Recommended Roles Included
            </span>
          )}
        </div>
        <h4 className="text-base font-bold text-white">{targetJob.title}</h4>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-300">
          <span className="flex items-center gap-1 font-medium">
            <Building2 className="w-3.5 h-3.5 text-zinc-400" />
            {targetJob.company}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            {targetJob.location || 'Pune, India'}
          </span>
          {targetJob.salary && (
            <span className="text-emerald-400 font-medium">
              {targetJob.salary}
            </span>
          )}
        </div>
      </div>

      {/* Candidate Profile Summary */}
      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
        <h5 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Candidate Summary
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <User className="w-4 h-4 text-zinc-500 shrink-0" />
            <span className="font-semibold text-white">{candidateProfile.name}</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
            <span className="truncate">{candidateProfile.email}</span>
          </div>

          {candidateProfile.phone && (
            <div className="flex items-center gap-2 text-zinc-300">
              <Phone className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>{candidateProfile.phone}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-zinc-300">
            <Briefcase className="w-4 h-4 text-zinc-500 shrink-0" />
            <span>{candidateProfile.total_experience_years} Years Experience</span>
          </div>
        </div>

        {/* Skills Preview */}
        {candidateProfile.top_skills && candidateProfile.top_skills.length > 0 && (
          <div className="pt-2 border-t border-zinc-800">
            <span className="text-[11px] text-zinc-400 font-medium block mb-1.5">
              Included Skills ({candidateProfile.top_skills.length}):
            </span>
            <div className="flex flex-wrap gap-1">
              {candidateProfile.top_skills.slice(0, 8).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 border border-zinc-700"
                >
                  {skill}
                </span>
              ))}
              {candidateProfile.top_skills.length > 8 && (
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-500">
                  +{candidateProfile.top_skills.length - 8} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Attached Resume */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <FileText className="w-4 h-4 text-[#00C896]" />
            <span className="font-medium">{resumeFile ? resumeFile.name : 'Candidate_Resume.pdf'}</span>
          </div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready for Direct Dispatch</span>
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 hover:border-zinc-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmit}
          className="px-8 py-3 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-black font-black text-xs flex items-center gap-2 border-2 border-[#00E5AA] shadow-xl shadow-[#00C896]/30 hover:scale-105 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>Submitting Application...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5 text-black" />
              <span>Submit Application Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
