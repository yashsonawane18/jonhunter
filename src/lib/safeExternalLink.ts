/**
 * Safe External Link Opener (safeExternalLink.ts)
 * Guarantees external job links open reliably even when browsers block pop-ups.
 */

import { toast } from 'sonner';
import { errorLogger } from './errors/errorLogger';

export function openExternalJobLink(url: string, jobTitle = 'Job Posting'): void {
  if (!url || typeof window === 'undefined') {
    toast.error('Application link is unavailable for this opportunity.');
    return;
  }

  // Sanitize and ensure absolute URL with protocol
  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  try {
    // 1. Primary Attempt: Standard window.open
    const newWindow = window.open(targetUrl, '_blank', 'noopener,noreferrer');

    // 2. Detection of popup blocker
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      errorLogger.warn('safeExternalLink', `Primary window.open blocked for ${targetUrl}. Attempting DOM fallback.`);

      // 3. Fallback 1: Hidden DOM Anchor Click
      const link = document.createElement('a');
      link.href = targetUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Verify or notify user if still suspect
      toast.info(`Opening ${jobTitle}... If not redirected, click here.`, {
        action: {
          label: 'Open Link',
          onClick: () => {
            window.location.assign(targetUrl);
          },
        },
        duration: 6000,
      });
    }
  } catch (err: any) {
    errorLogger.error('safeExternalLink', `Failed to open ${targetUrl}`, { err });
    toast.error('Unable to open link. Please disable pop-up blocker.', {
      action: {
        label: 'Open',
        onClick: () => {
          window.location.assign(targetUrl);
        },
      },
    });
  }
}
