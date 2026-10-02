import React from 'react';
import { Compass } from 'lucide-react';

/**
 * Shown when FEATURE_JOB_DISCOVERY is disabled.
 * Matches the app's dark-theme card styling.
 */
const JobDiscoveryDisabled: React.FC = () => {
  return (
    <div className="flex-1 h-screen bg-[#0d0d0d] text-white flex items-center justify-center font-sans">
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-10 max-w-md text-center shadow-sm">
        <div className="w-14 h-14 bg-[#222] rounded-full flex items-center justify-center mx-auto mb-5">
          <Compass className="w-7 h-7 text-[#555]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Job Discovery</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          This feature is currently disabled. Enable Job Discovery in your settings
          to explore live job listings matched to your profile.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#222] rounded-lg text-[#888] text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-[#555]" />
          Feature flag: OFF
        </div>
      </div>
    </div>
  );
};

export default JobDiscoveryDisabled;
