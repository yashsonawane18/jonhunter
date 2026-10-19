import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Zap,
  ShieldCheck,
  Building2,
  ExternalLink,
  X,
  FileCheck,
  Award,
} from 'lucide-react';
import { AutoApplyBatchStatus, AutoApplyJobResult, fetchCareerAutoApplyStatus } from '../../lib/drcDiscoveryApi';

interface CareerAutoApplyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string | null;
  totalSelected: number;
}

export const CareerAutoApplyDrawer: React.FC<CareerAutoApplyDrawerProps> = ({
  isOpen,
  onClose,
  batchId,
  totalSelected,
}) => {
  const [batchStatus, setBatchStatus] = useState<AutoApplyBatchStatus | null>(null);
  const [pollingError, setPollingError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !batchId) return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const data = await fetchCareerAutoApplyStatus(batchId);
        if (isSubscribed) {
          setBatchStatus(data);
          if (data.status === 'COMPLETED' || data.status === 'ERROR') {
            clearInterval(interval);
          }
        }
      } catch (err: any) {
        if (isSubscribed) setPollingError(err.message);
      }
    }, 1500);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [isOpen, batchId]);

  if (!isOpen) return null;

  const completed = batchStatus?.completed || 0;
  const total = batchStatus?.total || totalSelected;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isDone = batchStatus?.status === 'COMPLETED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-[24px] bg-[#121212] border border-[#2e2e2e] shadow-2xl flex flex-col overflow-hidden text-[#fafafa]">
        {/* Header */}
        <div className="p-5 border-b border-[#262626] bg-[#161616] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#3ecf8e] fill-current animate-pulse" />
              <h3 className="text-lg font-bold text-[#fafafa]">
                Automated Career Pages Application Pipeline
              </h3>
            </div>
            <p className="text-xs text-[#898989]">
              Hybrid State Machine: Direct Native ATS API + Playwright Stealth Browser Execution
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#898989] hover:text-[#fafafa] hover:bg-[#222] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Telemetry */}
        <div className="p-5 border-b border-[#262626] bg-[#141414] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#898989] flex items-center gap-1.5">
              {!isDone ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-[#3ecf8e] animate-spin" />
                  <span>Processing Application Requisitions...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3ecf8e]" />
                  <span>All Target Requisitions Processed</span>
                </>
              )}
            </span>
            <span className="text-[#fafafa]">
              {completed} / {total} Completed ({percent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-[#222] overflow-hidden">
            <div
              className="h-full bg-[#3ecf8e] transition-all duration-300 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Metric Summary */}
          {batchStatus && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2 rounded-lg bg-[#181818] border border-[#262626] text-center">
                <div className="text-[10px] text-[#898989] uppercase font-mono">Successful</div>
                <div className="text-sm font-bold text-emerald-400 font-mono">
                  {batchStatus.successful}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#181818] border border-[#262626] text-center">
                <div className="text-[10px] text-[#898989] uppercase font-mono">Failed / Need Review</div>
                <div className="text-sm font-bold text-amber-400 font-mono">
                  {batchStatus.failed}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#181818] border border-[#262626] text-center">
                <div className="text-[10px] text-[#898989] uppercase font-mono">SLA Guarantee</div>
                <div className="text-sm font-bold text-[#3ecf8e] font-mono">
                  Direct ATS
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Job Items Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {(!batchStatus?.results || batchStatus.results.length === 0) ? (
            <div className="p-8 text-center text-[#898989] space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#3ecf8e] mx-auto" />
              <p className="text-xs">Connecting to employer ATS endpoints...</p>
            </div>
          ) : (
            batchStatus.results.map((res: AutoApplyJobResult, i: number) => {
              const isSuccess = res.status === 'SUCCESS';
              const isAlready = res.status === 'ALREADY_APPLIED';
              const badgeClass = isSuccess
                ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                : isAlready
                ? 'bg-sky-950 text-sky-400 border-sky-500/30'
                : 'bg-rose-950 text-rose-400 border-rose-500/30';

              return (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-[#161616] border border-[#242424] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#fafafa] flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#3ecf8e]" />
                        {res.company}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${badgeClass}`}>
                        {res.status}
                      </span>
                      {res.mode && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#222] text-[#898989]">
                          {res.mode}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#b4b4b4] truncate">{res.job_title}</div>
                    <div className="text-[11px] text-[#898989]">{res.message}</div>
                  </div>

                  <div className="text-right flex-shrink-0 space-y-1">
                    {res.confirmation_id && (
                      <div className="text-[10px] font-mono text-[#3ecf8e]">
                        ID: {res.confirmation_id}
                      </div>
                    )}
                    <div className="text-[10px] text-[#898989] font-mono">
                      {res.duration_ms} ms
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#262626] bg-[#161616] flex items-center justify-between text-xs">
          <span className="text-[#898989]">
            {isDone
              ? '✅ Batch completed. Saved to SQLite applied history.'
              : '⚡ Automated pipeline is executing in the background...'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#222] hover:bg-[#282828] text-[#fafafa] transition-colors"
          >
            {isDone ? 'Close & Review' : 'Dismiss to Background'}
          </button>
        </div>
      </div>
    </div>
  );
};
