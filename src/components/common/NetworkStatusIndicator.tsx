import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const NetworkStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 pointer-events-auto">
      {!isOnline ? (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-zinc-900/95 border border-amber-500/40 text-amber-300 shadow-2xl backdrop-blur-md text-xs font-semibold animate-pulse">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span>You are offline. Working with cached job requisitions.</span>
        </div>
      ) : showReconnected ? (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/95 border border-emerald-500/40 text-emerald-300 shadow-2xl backdrop-blur-md text-xs font-semibold">
          <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Internet connection restored. Live sync active.</span>
        </div>
      ) : null}
    </div>
  );
};

export default NetworkStatusIndicator;
