import React, { useRef } from 'react';
import {
  Upload,
  CheckCircle2,
  X,
  Target,
} from 'lucide-react';
import { CandidateParsedProfile } from '../../lib/applicationApi';

export interface ResumeAtsBannerProps {
  resumeProfile: CandidateParsedProfile | null;
  resumeFileName: string;
  isParsing: boolean;
  onFileUpload: (file: File) => void;
  onClearResume: () => void;
}

export const ResumeAtsBanner: React.FC<ResumeAtsBannerProps> = ({
  resumeProfile,
  resumeFileName,
  isParsing,
  onFileUpload,
  onClearResume,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="bg-[#141519] border border-[#262830] rounded-2xl p-5 sm:p-6 shadow-xl text-white">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left: Value Proposition */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1C1E24] border border-[#2D303B] flex items-center justify-center text-[#00C896] shrink-0">
            <Target className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00C896] bg-[#00C896]/15 px-2.5 py-0.5 rounded-md border border-[#00C896]/30">
                DRC ATS Scoring Engine
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Instant Profile Match
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white">
              {resumeProfile
                ? `Matched for ${resumeProfile.name || 'Candidate'} (${resumeProfile.total_experience_years || 0} Yrs Experience)`
                : 'Upload Your Resume to Unlock 70–100% Match Scores'}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mt-1 leading-relaxed">
              {resumeProfile ? (
                <span>
                  Extracted {resumeProfile.skills?.length || 0} core competencies. Live match scores are displayed on all job cards below.
                </span>
              ) : (
                <span>
                  Our engine instantly maps your technical stack to identify roles where your interview conversion rate is highest.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Upload / Active File Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {resumeProfile ? (
            <div className="flex items-center gap-2.5 bg-[#1C1E24] border border-[#00C896]/50 rounded-xl px-4 py-2">
              <CheckCircle2 className="w-4 h-4 text-[#00C896] shrink-0" />
              <span className="text-xs font-semibold text-white truncate max-w-[180px]">
                {resumeFileName || 'Resume Loaded'}
              </span>
              <button
                type="button"
                onClick={onClearResume}
                className="p-1 rounded-md hover:bg-[#252832] text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer ml-1"
                title="Remove resume"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isParsing}
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-[#0A0A0A] font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-75"
            >
              {isParsing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Scanning Profile...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Resume (PDF / DOCX)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAtsBanner;
