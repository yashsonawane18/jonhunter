import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

/**
 * SubscriptionExpiryBanner
 *
 * Renders a dismissible amber warning banner at the top of the dashboard
 * when the user's premium plan expires in ≤ 7 days.
 *
 * Hidden automatically when:
 *  - User is not premium
 *  - daysUntilExpiry is null (no expiry date)
 *  - daysUntilExpiry > 7
 *  - User dismisses it (stored in component state for this session)
 */
const SubscriptionExpiryBanner: React.FC = () => {
  const { isPremiumUser, daysUntilExpiry, subscriptionPlan, subscriptionEndDate } = useUser();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if not relevant
  if (!isPremiumUser) return null;
  if (daysUntilExpiry === null) return null;
  if (daysUntilExpiry > 7) return null;
  if (dismissed) return null;

  const isExpired = daysUntilExpiry <= 0;
  const planLabel = subscriptionPlan ?? 'Premium';

  const bgColor = isExpired
    ? 'bg-red-950/80 border-red-500/40'
    : daysUntilExpiry <= 1
    ? 'bg-orange-950/80 border-orange-500/40'
    : 'bg-amber-950/80 border-amber-500/40';

  const textColor = isExpired
    ? 'text-red-200'
    : daysUntilExpiry <= 1
    ? 'text-orange-200'
    : 'text-amber-200';

  const iconColor = isExpired ? 'text-red-400' : 'text-amber-400';

  const message = isExpired
    ? `Your ${planLabel} plan has expired. Renew now to restore access to all premium features.`
    : daysUntilExpiry === 1
    ? `Your ${planLabel} plan expires tomorrow (${subscriptionEndDate}). Renew now to avoid interruption.`
    : `Your ${planLabel} plan expires in ${daysUntilExpiry} days (${subscriptionEndDate}). Contact us to renew.`;

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-2.5 border-b ${bgColor} ${textColor} text-sm`}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
        <span>{message}</span>
        <a
          href="https://dheerajrathodconsult.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-semibold hover:opacity-80 transition-opacity ml-1"
        >
          Renew plan →
        </a>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SubscriptionExpiryBanner;
