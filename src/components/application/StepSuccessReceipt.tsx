import React from 'react';
import {
  CheckCircle2,
  Copy,
  ArrowRight,
  Briefcase,
  Mail,
  Building2,
  ExternalLink,
  Sparkles,
  Lock,
  Unlock,
} from 'lucide-react';
import { toast } from 'sonner';

interface StepSuccessReceiptProps {
  applicationId: string;
  jobTitle: string;
  company: string;
  candidateEmail: string;
  additionalRolesCount: number;
  applicationUrl?: string;
  onDone: () => void;
}

export const StepSuccessReceipt: React.FC<StepSuccessReceiptProps> = ({
  applicationId,
  jobTitle,
  company,
  candidateEmail,
  additionalRolesCount,
  applicationUrl,
  onDone,
}) => {
  const handleCopyId = () => {
    navigator.clipboard.writeText(applicationId);
    toast.success('Application ID copied to clipboard!');
  };

  const handleCopyLink = () => {
    if (applicationUrl) {
      navigator.clipboard.writeText(applicationUrl);
      toast.success('Official LinkedIn link copied to clipboard!');
    }
  };

  return (
    <div className="py-6 text-center space-y-6">
      {/* Success Badge */}
      <div className="flex flex-col items-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-white">Application Submitted!</h3>
          <p className="text-sm text-zinc-400">
            Your candidate profile and resume have been recorded in our system.
          </p>
        </div>
      </div>

      {/* Unlocked Official Career Portal / LinkedIn Job Link */}
      {applicationUrl ? (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-blue-950/40 border-2 border-[#00C896] max-w-md mx-auto text-left space-y-3 shadow-2xl shadow-[#00C896]/10">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[#00C896]">
                <Unlock className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#00C896]">
                Official Requisition Link Unlocked
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>Copy Link</span>
            </button>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            Your application is recorded for DRC Consulting Review. You can now access the direct official requisition link:
          </p>

          <a
            href={applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 border-2 shadow-xl transition-all hover:scale-[1.02] ${
              applicationUrl.includes('linkedin.com')
                ? 'bg-[#0077b5] hover:bg-[#005e93] text-white border-blue-400 shadow-blue-900/40'
                : 'bg-[#00C896] hover:bg-[#00E5AA] text-black border-[#00E5AA] shadow-[#00C896]/30'
            }`}
          >
            <span>{applicationUrl.includes('linkedin.com') ? 'Proceed to Official LinkedIn Post' : 'Proceed to Official Career Portal'}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      ) : null}

      {/* Reference Card */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-700 max-w-md mx-auto space-y-3 text-left">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Application Reference ID
          </span>
          <button
            type="button"
            onClick={handleCopyId}
            className="flex items-center gap-1 text-xs font-mono text-[#00C896] hover:underline"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>
        </div>
        <p className="text-base font-mono font-bold text-white tracking-wide">
          {applicationId || 'APP-2026-CONFIRMED'}
        </p>

        <div className="pt-2 border-t border-zinc-800 space-y-1.5 text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
            <span className="font-semibold text-white">{jobTitle}</span>
            <span className="text-zinc-500">at</span>
            <span className="font-medium text-zinc-300">{company}</span>
          </div>

          {additionalRolesCount > 0 && (
            <p className="text-[11px] text-emerald-400 font-medium">
              ✓ Also applied to +{additionalRolesCount} complementary matching openings
            </p>
          )}

          <div className="flex items-center gap-2 text-zinc-400 pt-1">
            <Mail className="w-3.5 h-3.5 text-zinc-500" />
            <span>Confirmation routed to: <strong className="text-white">{candidateEmail}</strong></span>
          </div>
        </div>
      </div>

      {/* Recruiter Follow-up Timeline Box */}
      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 max-w-md mx-auto text-xs text-emerald-300 space-y-1">
        <p className="font-bold">What happens next?</p>
        <p className="text-zinc-400">
          Hiring managers and recruiters typically review submitted applications within <strong>48 to 72 hours</strong>. Keep an eye on your email for interview scheduling.
        </p>
      </div>

      {/* Done CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onDone}
          className="px-8 py-3.5 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-black font-black text-sm inline-flex items-center gap-2 border-2 border-[#00E5AA] shadow-xl shadow-[#00C896]/30 hover:scale-105 transition-all"
        >
          <span>Explore More Verified Jobs</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
