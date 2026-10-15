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
    <div id="ats-scoring-banner" className="p-space-md rounded-2xl bg-surface-container-low border border-primary/30 flex flex-col md:flex-row md:items-center justify-between gap-space-md shadow-sm">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-start gap-space-md">
        <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-[28px]">document_scanner</span>
        </div>

        <div>
          <div className="flex items-center gap-space-xs mb-1">
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
              DRC ATS Scoring Engine
            </span>
            <span className="px-space-xs py-0.5 rounded bg-surface-container text-primary font-badge-caps text-badge-caps uppercase">
              {resumeProfile ? 'PROFILE ACTIVE' : 'INSTANT MATCH'}
            </span>
          </div>

          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {resumeProfile ? (
              <span>
                Active for <strong className="text-on-surface">{resumeProfile.name || 'Candidate'}</strong> ({resumeProfile.total_experience_years || 0} Yrs Exp). Extracted {resumeProfile.skills?.length || 0} skills with live compatibility match on every role.
              </span>
            ) : (
              'Upload your latest resume to activate real-time ATS match scoring and see direct hiring manager alignments.'
            )}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
        {resumeProfile ? (
          <div className="flex items-center gap-2 bg-surface-container border border-primary/40 rounded-xl px-4 py-2">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            <span className="text-xs font-semibold text-on-surface truncate max-w-[160px]">
              {resumeFileName || 'Resume Loaded'}
            </span>
            <button
              type="button"
              onClick={onClearResume}
              className="p-1 rounded-md hover:bg-surface-container-high text-on-surface-variant hover:text-rose-400 transition-colors cursor-pointer ml-1"
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
            className="px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_28px_rgba(16,185,129,0.5)] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
          >
            {isParsing ? (
              <>
                <div className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin" />
                <span>Scanning Profile...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                <span>Upload Resume (PDF / DOCX)</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ResumeAtsBanner;
