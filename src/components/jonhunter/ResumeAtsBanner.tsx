import React, { useRef } from 'react';
import {
  Upload,
  CheckCircle2,
  X,
  Target,
} from 'lucide-react';
import { CandidateParsedProfile } from '../../lib/applicationApi';
import { toast } from 'sonner';
import { errorLogger } from '../../lib/errors/errorLogger';

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
    if (!file) return;

    // Reset input value so user can re-upload same file if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // 1. Check file size (max 10MB)
    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('File exceeds 10MB limit. Please upload a smaller resume.');
      errorLogger.warn('ResumeAtsBanner', `File too large: ${file.name} (${file.size} bytes)`);
      return;
    }

    // 2. Check 0-byte file
    if (file.size === 0) {
      toast.error('The selected file appears to be empty. Please choose a valid resume.');
      return;
    }

    // 3. Check allowed extensions
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const fileNameLower = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => fileNameLower.endsWith(ext));
    if (!hasValidExt) {
      toast.error('Unsupported file format. Please upload a PDF, DOCX, or TXT document.');
      errorLogger.warn('ResumeAtsBanner', `Unsupported extension: ${file.name}`);
      return;
    }

    onFileUpload(file);
  };

  return (
    <div className="bg-gradient-to-r from-[#0C131D] via-[#0E1622] to-[#0A121A] border border-[#1E2C3D] rounded-2xl p-5 sm:p-6 shadow-2xl text-white">
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
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
            <Target className="w-6 h-6 text-emerald-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
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
            <div className="flex items-center gap-2.5 bg-[#141C27] border border-emerald-500/50 rounded-xl px-4 py-2 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-white truncate max-w-[180px]">
                {resumeFileName || 'Resume Loaded'}
              </span>
              <button
                type="button"
                onClick={onClearResume}
                className="p-1 rounded-md hover:bg-white/10 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer ml-1"
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
              style={{ backgroundColor: '#00C896', color: '#05130D' }}
              className="btn-drc-primary px-5 py-2.5 rounded-xl text-[#05130D] font-extrabold text-xs shadow-md shadow-[#00C896]/30 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-75 active:scale-[0.98]"
            >
              {isParsing ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#05130D] border-t-transparent rounded-full animate-spin" />
                  <span className="font-extrabold text-[#05130D]">Scanning Profile...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-[#05130D] stroke-[2.5]" />
                  <span className="font-extrabold text-[#05130D]">Upload Resume (PDF / DOCX)</span>
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
