import React from 'react';
import { AlertOctagon } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#080B0F] text-white flex items-center justify-center p-6 select-none">
      <div className="max-w-md w-full bg-[#0E1520] border border-[#1B2636] rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 mx-auto mb-5">
          <AlertOctagon className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Service Offline</h1>
        <p className="text-sm text-zinc-400 leading-relaxed mb-6">
          This platform is currently paused and unavailable. All operations have been temporarily suspended.
        </p>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-medium">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>Status: STOPPED (Offline)</span>
        </div>
      </div>
    </div>
  );
}
