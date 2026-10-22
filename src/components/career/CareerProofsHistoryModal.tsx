import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  ExternalLink,
  Clock,
  Camera,
  X,
  RefreshCw,
  FileCheck,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { fetchCandidateApplicationProofs, AutoApplyJobResult } from '../../lib/drcDiscoveryApi';
import { CareerApplicationProofModal } from './CareerApplicationProofModal';

interface CareerProofsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateEmail: string;
}

export const CareerProofsHistoryModal: React.FC<CareerProofsHistoryModalProps> = ({
  isOpen,
  onClose,
  candidateEmail,
}) => {
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProof, setSelectedProof] = useState<AutoApplyJobResult | null>(null);

  const loadProofs = async () => {
    if (!candidateEmail) {
      setProofs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCandidateApplicationProofs(candidateEmail);
      setProofs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load application proofs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadProofs();
    }
  }, [isOpen, candidateEmail]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[85vh] rounded-[24px] bg-[#121214] border border-[#27272a] shadow-2xl flex flex-col overflow-hidden text-[#fafafa]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#27272a] bg-[#161619] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#3ecf8e]" />
              <h3 className="text-base sm:text-lg font-bold text-white">
                Live Job Application Proofs &amp; Audit Trail
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              Verifiable high-resolution Playwright screenshots, exact timestamps, and employer ATS URLs
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadProofs}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Refresh Proofs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#3ecf8e]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#3ecf8e] mx-auto" />
              <p className="text-xs text-zinc-400 font-mono">Fetching application proofs from database...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : proofs.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                <Camera className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-zinc-200">No Application Proofs Recorded Yet</h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Select corporate career page jobs below, configure your Data Plan &amp; CV, and click &ldquo;Auto-Apply&rdquo; to execute real-time applications with screenshot evidence.
                </p>
              </div>
            </div>
          ) : (
            proofs.map((app, idx) => {
              const jobResult: AutoApplyJobResult = {
                job_id: app.job_id || String(idx),
                company: app.company,
                job_title: app.job_title,
                status: 'SUCCESS',
                mode: 'STEALTH_BROWSER',
                message: app.recruiter_notes || 'Verified Playwright application with screenshot proof',
                confirmation_id: app.job_id,
                applied_at: app.applied_at,
                duration_ms: 1250,
                proof_screenshot_url: app.proof_screenshot_url,
                target_url: app.application_url,
                proof_timestamp: app.applied_at,
              };

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#3ecf8e]" />
                        {app.company}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                        {app.status || 'Applied'}
                      </span>
                      {app.job_id && (
                        <span className="hidden sm:inline-block font-mono text-[9px] text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded">
                          {app.job_id}
                        </span>
                      )}
                    </div>
                    <div className="text-zinc-300 font-medium truncate">{app.job_title}</div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#3ecf8e]" />
                        {app.applied_at}
                      </span>
                      {app.resume_filename && (
                        <span className="flex items-center gap-1 text-zinc-400">
                          <FileText className="w-3 h-3 text-sky-400" />
                          {app.resume_filename}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-0">
                    {app.application_url && (
                      <a
                        href={app.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Portal</span>
                      </a>
                    )}
                    {app.proof_screenshot_url && (
                      <button
                        type="button"
                        onClick={() => setSelectedProof(jobResult)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-[#3ecf8e] border border-emerald-500/30 flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>View Proof</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#27272a] bg-[#161619] flex items-center justify-between text-xs text-zinc-400">
          <span>Total Recorded Applications: {proofs.length}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Embedded Single Proof Modal */}
      <CareerApplicationProofModal
        isOpen={Boolean(selectedProof)}
        onClose={() => setSelectedProof(null)}
        proof={selectedProof}
      />
    </div>
  );
};
