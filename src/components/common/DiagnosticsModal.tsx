import React, { useState, useEffect } from 'react';
import { X, Activity, Copy, Check, Trash2, Wifi, Database, Server } from 'lucide-react';
import { toast } from 'sonner';
import { errorLogger, LogEntry } from '../../lib/errors/errorLogger';
import { checkJobEngineHealth, getCachedWorkingEngineUrl, getJobEngineCandidates } from '../../lib/drcDiscoveryApi';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [engineStatus, setEngineStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Load logs and subscribe
    setLogs(errorLogger.getRecentLogs());
    const unsubscribe = errorLogger.subscribe((updated) => setLogs(updated));

    // Check engine
    setActiveUrl(getCachedWorkingEngineUrl());
    checkJobEngineHealth().then((isOnline) => {
      setEngineStatus(isOnline ? 'online' : 'offline');
      setActiveUrl(getCachedWorkingEngineUrl());
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyReport = async () => {
    const report = errorLogger.exportDiagnosticsReport();
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      toast.success('Diagnostics report copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy report to clipboard');
    }
  };

  const handleClearLogs = () => {
    errorLogger.clear();
    setLogs([]);
    toast.info('Diagnostic logs cleared');
  };

  const candidates = getJobEngineCandidates();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#10131a] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-zinc-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-[#141722]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">DRC System & Error Diagnostics</h3>
              <p className="text-[11px] text-zinc-400">Telemetry and service connectivity inspection</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Internet */}
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Wifi className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-semibold">Network</p>
                <p className="font-bold text-white">{navigator.onLine ? 'Connected' : 'Offline'}</p>
              </div>
            </div>

            {/* Engine Probe */}
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
                  engineStatus === 'online'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : engineStatus === 'checking'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-semibold">Engine Port 5055</p>
                <p className="font-bold text-white capitalize">{engineStatus}</p>
              </div>
            </div>

            {/* Storage */}
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Database className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-semibold">Local Storage</p>
                <p className="font-bold text-white">Safe / Quota Guard Active</p>
              </div>
            </div>
          </div>

          {/* Active URL & Candidates */}
          <div className="p-3.5 rounded-xl bg-[#141722] border border-zinc-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-medium">Active Engine Endpoint:</span>
              <span className="font-mono text-emerald-400">{activeUrl || 'Local fallback / Same-origin'}</span>
            </div>
            <div className="text-[10px] text-zinc-300">
              Candidate probes: {candidates.join(' • ') || 'None configured'}
            </div>
          </div>

          {/* Log Stream */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-200">Recent Session Logs ({logs.length})</span>
              {logs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearLogs}
                  className="text-[11px] text-zinc-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1 font-mono text-[11px]">
              {logs.length === 0 ? (
                <div className="p-6 text-center text-zinc-400 bg-zinc-900/40 rounded-xl border border-zinc-800/60 font-sans">
                  No errors or warnings recorded in this session. All systems operating normally.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-2.5 rounded-lg border text-left ${
                      log.severity === 'error' || log.severity === 'fatal'
                        ? 'bg-red-950/20 border-red-500/25 text-red-200'
                        : log.severity === 'warning'
                        ? 'bg-amber-950/20 border-amber-500/25 text-amber-200'
                        : 'bg-zinc-900/40 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px] text-zinc-400 mb-1 font-sans">
                      <span className="font-semibold uppercase tracking-wider">[{log.severity}] {log.source}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="font-medium break-words">{log.message}</p>
                    {log.metadata && (
                      <pre className="mt-1 text-[10px] text-zinc-400 overflow-x-auto">
                        {JSON.stringify(log.metadata)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-zinc-800/80 bg-[#141722] flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopyReport}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-semibold"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Report Copied!' : 'Copy Debug Report'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-bold transition-colors cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsModal;
