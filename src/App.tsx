import React, { useEffect } from 'react';
import JonHunterJobPortal from './components/jonhunter/JonHunterJobPortal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NetworkStatusIndicator } from './components/common/NetworkStatusIndicator';
import { Toaster } from './components/ui/sonner';

export default function App() {
  useEffect(() => {
    // Keep URL clean and aligned with discovery page
    const path = window.location.pathname;
    if (path !== '/' && path !== '/discover') {
      window.history.replaceState({}, '', '/discover');
    }
  }, []);

  return (
    <div className="size-full min-h-screen bg-[#080B0F] text-white">
      <ErrorBoundary fallbackTitle="Job Discovery Portal Recovered">
        <JonHunterJobPortal />
      </ErrorBoundary>
      <NetworkStatusIndicator />
      <Toaster richColors position="top-right" />
    </div>
  );
}
