import React from 'react';
import {
  Zap,
  Star,
  Check,
  Minus,
  ArrowLeft,
  Download,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface PricingProps {
  onNavigateHome?: () => void;
  onGetStarted?: () => void;
}

interface PricingTier {
  id: 'base' | 'plus' | 'premium';
  name: string;
  badge: string;
  description: string;
  price: string;
  icon: React.ElementType;
  ctaText: string;
  isPopular?: boolean;
  note?: string;
  /** tailwind accent tokens */
  accentText: string;
  accentBg: string;
  accentBorder: string;
  iconWrap: string;
  ctaClass: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'base',
    name: 'Base',
    badge: 'ACCELERATOR',
    description:
      'The perfect match for starting professionals and job seekers with a smaller target market.',
    price: '7,000',
    icon: Zap,
    ctaText: 'Choose Base',
    accentText: 'text-[#38bdf8]',
    accentBg: 'bg-[#38bdf8]/10',
    accentBorder: 'border-white/10',
    iconWrap: 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20',
    ctaClass:
      'bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-[0_8px_24px_rgba(37,99,235,0.35)]',
  },
  {
    id: 'plus',
    name: 'Plus',
    badge: 'ACCELERATOR',
    description:
      'For the professionals who already have many search criteria and need a high interview call rate.',
    price: '14,999',
    icon: Star,
    ctaText: 'Choose Plus',
    isPopular: true,
    note: '30% performance assured',
    accentText: 'text-neon-green',
    accentBg: 'bg-neon-green/10',
    accentBorder: 'border-neon-green/60',
    iconWrap: 'bg-neon-green/15 text-neon-green border border-neon-green/30',
    ctaClass:
      'bg-neon-green hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(74,222,128,0.4)]',
  },
  {
    id: 'premium',
    name: 'Premium',
    badge: 'ADVANCED',
    description:
      'The ultimate solution for high-paying leadership roles and career transitions with maximum calls.',
    price: '32,000',
    icon: Star,
    ctaText: 'Choose Premium',
    accentText: 'text-orange-400',
    accentBg: 'bg-orange-400/10',
    accentBorder: 'border-white/10',
    iconWrap: 'bg-orange-400/10 text-orange-400 border border-orange-400/20',
    ctaClass:
      'bg-orange-500 hover:bg-orange-600 text-white shadow-[0_8px_24px_rgba(249,115,22,0.35)]',
  },
];

type CellValue = string | boolean;

interface FeatureRow {
  label: string;
  base: CellValue;
  plus: CellValue;
  premium: CellValue;
}

const FEATURE_ROWS: FeatureRow[] = [
  { label: 'Duration', base: '15 Days', plus: '30 Days', premium: '90 Days' },
  {
    label: 'Target Outcome',
    base: 'Strong profile & clear direction',
    plus: 'High interview call rate',
    premium: 'Max interview calls & offers',
  },
  {
    label: 'Job Applications Done by Us',
    base: '200+ targeted jobs',
    plus: '500+ tailored applications',
    premium: '1000+ highly targeted',
  },
  { label: 'Video Job Hunt Source', base: true, plus: true, premium: true },
  {
    label: 'ATS-Optimized Resume Writing',
    base: 'Professional (Basic)',
    plus: 'Advanced',
    premium: 'Deep ATS + JD mapping',
  },
  {
    label: 'LinkedIn Profile Optimization',
    base: 'Basic',
    plus: 'Advanced',
    premium: 'Full optimization',
  },
  { label: 'Recruiter Profile Optimization', base: false, plus: true, premium: true },
  {
    label: 'Other Job Boards',
    base: false,
    plus: false,
    premium: 'HR, Hiring Manager + more',
  },
  {
    label: 'Job Search Strategy',
    base: 'Job search roadmap',
    plus: 'Recruiter strategy',
    premium: 'Full HR managed',
  },
  { label: 'Custom DRC Job Tracker', base: true, plus: true, premium: true },
  { label: 'Weekly Progress Report', base: false, plus: true, premium: true },
  { label: 'Application Proof (Screenshots)', base: false, plus: true, premium: true },
  { label: 'Daily Profile Refresh', base: false, plus: true, premium: true },
  { label: 'Hidden Job Market Access', base: false, plus: false, premium: true },
  {
    label: 'Hiring Manager Outreach',
    base: false,
    plus: false,
    premium: 'LinkedIn + Email',
  },
  {
    label: 'Interview Call Guarantee',
    base: false,
    plus: 'Min. 5 calls',
    premium: '10-20 calls',
  },
  { label: 'Effort Required from You', base: 'Medium', plus: 'Low', premium: 'Very Low' },
];

const TRUST_POINTS = [
  'No placement fees',
  'No salary cuts',
  'No fake job promises',
  'Career services and application service force',
];

const COLUMN_ACCENTS: Record<'base' | 'plus' | 'premium', string> = {
  base: 'text-[#38bdf8]',
  plus: 'text-neon-green',
  premium: 'text-orange-400',
};

const Cell: React.FC<{ value: CellValue; col: 'base' | 'plus' | 'premium' }> = ({
  value,
  col,
}) => {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            col === 'base'
              ? 'bg-[#38bdf8]/15 text-[#38bdf8]'
              : col === 'plus'
              ? 'bg-neon-green/15 text-neon-green'
              : 'bg-orange-400/15 text-orange-400'
          }`}
        >
          <Check size={14} strokeWidth={3} />
        </div>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex justify-center text-gray-700">
        <Minus size={16} />
      </div>
    );
  }
  return (
    <span className="block text-center text-xs sm:text-sm font-semibold text-gray-200 leading-snug">
      {value}
    </span>
  );
};

export const Pricing: React.FC<PricingProps> = ({ onNavigateHome, onGetStarted }) => {
  return (
    <div className="bg-[#030712] font-sans min-h-screen pt-24 sm:pt-28">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-neon-green/[0.04] blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/[0.03] blur-[160px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar: Back + Download */}
        <div className="flex items-center justify-between py-4">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Home
          </button>
          <a
            href="/pricing.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-300 border border-white/10 hover:border-neon-green/40 hover:text-white rounded-full px-5 py-2.5 transition-all"
          >
            <Download size={14} />
            Download Pricing PDF
          </a>
        </div>

        {/* Hero */}
        <div className="text-center pt-10 pb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-neon-green/30 text-[10px] font-black text-neon-green uppercase tracking-[0.3em] mb-10">
            Pricing Plans
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
            <span className="text-white">Focus on Your Career.</span>
            <br />
            <span className="text-gray-600">Not Endless Applications</span>
          </h1>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-8">
          {PRICING_TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 ${
                  tier.isPopular
                    ? 'bg-[#0a1322] border-2 border-neon-green shadow-[0_30px_80px_rgba(74,222,128,0.18)] md:-mt-4 md:mb-4'
                    : 'bg-[#0a1120]/80 border border-white/10 backdrop-blur-md hover:border-white/20'
                }`}
              >
                {/* Most popular badge */}
                {tier.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-neon-green text-black text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap shadow-lg">
                    Most Popular
                  </div>
                )}

                {/* Header row: title + icon */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <span
                      className={`text-[9px] font-black uppercase tracking-[0.25em] block mb-2 ${tier.accentText}`}
                    >
                      {tier.badge}
                    </span>
                    <h3 className="text-3xl font-black text-white tracking-tight">
                      {tier.name}
                    </h3>
                  </div>
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${tier.iconWrap}`}
                  >
                    <Icon size={20} fill={tier.id === 'base' ? 'none' : 'currentColor'} />
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-400 font-light leading-relaxed min-h-[60px] mb-8">
                  {tier.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    ₹{tier.price}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    / One-Time
                  </span>
                </div>

                {/* CTA */}
                <div className="mt-auto">
                  <button
                    onClick={onGetStarted}
                    className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 ${tier.ctaClass}`}
                  >
                    {tier.ctaText}
                  </button>
                  {tier.note && (
                    <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neon-green mt-3">
                      <Check size={12} strokeWidth={3} />
                      {tier.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Feature Breakdown */}
        <div className="pt-32 pb-16">
          <div className="text-center mb-12">
            <span className="text-[10px] font-black text-neon-green uppercase tracking-[0.4em] block mb-4">
              Side by Side
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Detailed Feature Breakdown
            </h2>
          </div>

          <div className="bg-[#0a1120]/70 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
            {/* Header row */}
            <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-2 px-4 sm:px-8 py-6 border-b border-white/10 bg-white/[0.02]">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 self-center">
                Feature List
              </span>
              {PRICING_TIERS.map((tier) => (
                <span
                  key={tier.id}
                  className={`text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] ${COLUMN_ACCENTS[tier.id]}`}
                >
                  {tier.badge}
                </span>
              ))}
            </div>

            {/* Rows */}
            {FEATURE_ROWS.map((row, idx) => (
              <div
                key={row.label}
                className={`grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-2 px-4 sm:px-8 py-5 items-center ${
                  idx !== FEATURE_ROWS.length - 1 ? 'border-b border-white/5' : ''
                } hover:bg-white/[0.02] transition-colors`}
              >
                <span className="text-xs sm:text-sm font-medium text-gray-300">
                  {row.label}
                </span>
                <Cell value={row.base} col="base" />
                <Cell value={row.plus} col="plus" />
                <Cell value={row.premium} col="premium" />
              </div>
            ))}
          </div>
        </div>

        {/* Trust & Transparency + CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-28">
          {/* Trust card */}
          <div className="bg-[#0a1120]/80 border border-white/10 rounded-3xl p-8 sm:p-10 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center text-neon-green">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Trust &amp; Transparency
              </h3>
            </div>
            <div className="space-y-5">
              {TRUST_POINTS.map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-neon-green/15 text-neon-green flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-sm text-gray-300 font-medium">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA card */}
          <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-neon-green to-emerald-500 flex flex-col justify-center">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 blur-3xl rounded-full pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-black text-black leading-tight tracking-tight mb-4">
                Ready to let us handle
                <br />
                the application grind?
              </h3>
              <p className="text-sm text-black/70 font-semibold leading-relaxed mb-8 max-w-md">
                Join 1500+ professionals who switched to their dream roles with DRC.
              </p>
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 bg-black text-white font-black text-xs uppercase tracking-widest px-7 py-4 rounded-xl hover:bg-gray-900 transition-all active:scale-95 group"
              >
                Get Started Now
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
