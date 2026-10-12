import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

interface CompanyLogoProps {
  company: string;
  applicationUrl?: string;
  className?: string;
  size?: number;
}

// Map common company names to their primary official domains for crisp logo resolution
const KNOWN_COMPANY_DOMAINS: Record<string, string> = {
  zscaler: 'zscaler.com',
  okta: 'okta.com',
  google: 'google.com',
  microsoft: 'microsoft.com',
  amazon: 'amazon.com',
  aws: 'amazon.com',
  meta: 'meta.com',
  facebook: 'meta.com',
  apple: 'apple.com',
  netflix: 'netflix.com',
  uber: 'uber.com',
  salesforce: 'salesforce.com',
  adobe: 'adobe.com',
  atlassian: 'atlassian.com',
  nvidia: 'nvidia.com',
  oracle: 'oracle.com',
  cisco: 'cisco.com',
  ibm: 'ibm.com',
  intel: 'intel.com',
  paypal: 'paypal.com',
  stripe: 'stripe.com',
  snowflake: 'snowflake.com',
  datadog: 'datadoghq.com',
  splunk: 'splunk.com',
  servicenow: 'servicenow.com',
  workday: 'workday.com',
  intuit: 'intuit.com',
  spotify: 'spotify.com',
  airbnb: 'airbnb.com',
  tcs: 'tcs.com',
  'tata consultancy services': 'tcs.com',
  infosys: 'infosys.com',
  wipro: 'wipro.com',
  accenture: 'accenture.com',
  deloitte: 'deloitte.com',
  cognizant: 'cognizant.com',
  capgemini: 'capgemini.com',
  ey: 'ey.com',
  kpmg: 'kpmg.com',
  pwc: 'pwc.com',
  swiggy: 'swiggy.com',
  zomato: 'zomato.com',
  flipkart: 'flipkart.com',
  paytm: 'paytm.com',
  razorpay: 'razorpay.com',
  cred: 'cred.club',
  phonepe: 'phonepe.com',
  ola: 'olacabs.com',
  jio: 'jio.com',
  reliance: 'ril.com',
  airtel: 'airtel.in',
  hcl: 'hcltech.com',
  'hcl technologies': 'hcltech.com',
  techmahindra: 'techmahindra.com',
  'tech mahindra': 'techmahindra.com',
  goldmansachs: 'goldmansachs.com',
  'goldman sachs': 'goldmansachs.com',
  jpmorgan: 'jpmorgan.com',
  'jp morgan': 'jpmorgan.com',
  morganstanley: 'morganstanley.com',
  'morgan stanley': 'morganstanley.com',
  morgan: 'morganstanley.com',
  barclays: 'barclays.com',
  hsbc: 'hsbc.com',
  target: 'target.com',
  walmart: 'walmart.com',
};

export const getCompanyDomain = (companyName?: string, applicationUrl?: string): string => {
  const norm = String(companyName || '').toLowerCase().trim();
  if (KNOWN_COMPANY_DOMAINS[norm]) return KNOWN_COMPANY_DOMAINS[norm];

  for (const [k, d] of Object.entries(KNOWN_COMPANY_DOMAINS)) {
    if (norm.includes(k)) return d;
  }

  if (applicationUrl) {
    try {
      const u = new URL(applicationUrl);
      if (u.hostname.includes('greenhouse.io') || u.hostname.includes('lever.co')) {
        const parts = u.pathname.split('/').filter(Boolean);
        if (parts.length > 0 && parts[0] !== 'jobs') {
          return `${parts[0]}.com`;
        } else if (parts.length > 1) {
          return `${parts[1]}.com`;
        }
      }
      const hostParts = u.hostname.replace(/^www\./, '').split('.');
      if (hostParts.length >= 2) {
        return hostParts.slice(-2).join('.');
      }
    } catch {
      // ignore
    }
  }

  const clean = norm.replace(/[^a-z0-9]/g, '');
  return clean ? `${clean}.com` : '';
};

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  company,
  applicationUrl,
  className = 'w-12 h-12',
}) => {
  const [loadErrorStage, setLoadErrorStage] = useState<number>(0);
  const domain = getCompanyDomain(company, applicationUrl);

  const initial = (company || 'C').charAt(0).toUpperCase();

  // Try Clearbit first, then Google Favicon high-res, then fallback SVG monogram
  const primaryUrl = domain ? `https://logo.clearbit.com/${domain}` : null;
  const secondaryUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null;

  const currentSrc = loadErrorStage === 0 ? primaryUrl : loadErrorStage === 1 ? secondaryUrl : null;

  const handleImgError = () => {
    setLoadErrorStage((prev) => prev + 1);
  };

  if (!currentSrc || loadErrorStage >= 2) {
    return (
      <div
        className={`${className} rounded-xl bg-gradient-to-br from-emerald-600/30 to-green-700/20 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-md text-emerald-400 font-extrabold text-base`}
        title={company}
      >
        <span>{initial}</span>
      </div>
    );
  }

  return (
    <div
      className={`${className} rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 border border-white/20 shadow-md overflow-hidden`}
      title={company}
    >
      <img
        src={currentSrc}
        alt={`${company} official logo`}
        className="w-full h-full object-contain"
        onError={handleImgError}
        loading="lazy"
      />
    </div>
  );
};

export default CompanyLogo;
