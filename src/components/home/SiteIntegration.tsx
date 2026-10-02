import React from "react";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";

interface SiteIntegrationProps {
  onNavigateToSignup?: () => void;
  onNavigateToQAtoBA?: () => void;
}

export const SiteIntegration: React.FC<SiteIntegrationProps> = ({
  onNavigateToSignup,
  onNavigateToQAtoBA,
}) => {
  return (
    <>
      <style>{`
        /* ----- reset / base font for the whole section ----- */
        .site-hero-wrapper * {
          font-family: 'Inter', sans-serif;
        }

        /* ----- hero container (dark background kept) ----- */
        .site-hero-wrapper {
          position: relative;
          overflow: hidden;
          background: radial-gradient(80% 60% at 50% 0%, #103821 0%, #0a1f13 45%, #06120b 100%);
          /* NEW: add top padding to avoid navbar overlap */
          padding-top: 80px; /* matches navbar height */
          height: auto; /* allow content to determine height */
        }
        .site-hero-wrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(40% 50% at 90% 30%, rgba(45,212,191,0.10), transparent 60%);
          pointer-events: none;
        }
        .site-curves {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.5;
          width: 100%;
          height: 100%;
        }
        .site-hero {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 30px 40px 60px;
          max-width: 1280px;
          margin: 0 auto;
        }

        /* ----- badges (unchanged) ----- */
        .site-badges {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-bottom: 26px;
          flex-wrap: wrap;
        }
        .site-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.04);
          font-size: 12px;
          color: #9fb3a6;
        }
        .site-badge .gd {
          width: 8px;
          height: 8px;
          border-radius: 2px;
          background: #4ade80;
        }

        /* ----- HEADING: exactly 72px / 700 / 72px line-height ----- */
        .site-hero h1 {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 72px;               /* matches Hero's lg:text-7xl */
          line-height: 72px;              /* matches Hero's leading-[1.1] but exact 72px */
          letter-spacing: -0.02em;
          margin: 0;
          color: #eaf2ec;                /* light mode fallback; dark background */
        }
        /* For smaller screens, scale down gracefully */
        @media (max-width: 768px) {
          .site-hero h1 {
            font-size: clamp(40px, 10vw, 72px);
            line-height: clamp(40px, 10vw, 72px);
          }
          /* reduce top padding on small screens if needed */
          .site-hero-wrapper {
            padding-top: 70px;
          }
        }

        /* Gradient span – matches Hero's gradient */
        .site-hero h1 .teal {
          background: linear-gradient(135deg, #059669 0%, #4ade80 50%, #2dd4bf 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          display: block;
        }

        /* ----- DESCRIPTION: exactly as Hero's text ----- */
        .site-hero p {
          font-family: 'Inter', sans-serif;
          color: #9fb3a6;                /* light gray on dark */
          font-size: 17px;
          line-height: 1.55;
          max-width: 560px;
          margin: 24px auto 0;
        }

        /* ----- CTA row (unchanged layout) ----- */
        .site-cta-row {
          display: flex;
          gap: 14px;
          justify-content: center;
          align-items: center;
          margin-top: 34px;
          flex-wrap: wrap;
        }
        .site-getstarted {
          padding: 15px 32px;
          border-radius: 999px;
          background: #fff;
          color: #07130c;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-family: 'Inter', sans-serif;
        }
        .site-getstarted:hover {
          background: #eef2f0;
          transform: scale(0.98);
        }
        .site-explore {
          padding: 15px 28px;
          border-radius: 999px;
          border: 1px solid #4ade80;
          color: #4ade80;
          font-weight: 600;
          font-size: 15px;
          background: rgba(74,222,128,0.08);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .site-explore:hover {
          background: rgba(74,222,128,0.2);
          transform: scale(0.98);
        }

        /* ----- training ribbon (unchanged) ----- */
        .train-ribbon {
          position: relative;
          z-index: 2;
          margin: 26px auto 0;
          max-width: 640px;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 20px;
          border-radius: 14px;
          border: 1px solid rgba(74,222,128,0.35);
          background: linear-gradient(135deg, rgba(74,222,128,0.14), rgba(5,150,105,0.05));
        }
        .train-ribbon .tr-ic {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #4ade80 0%, #059669 100%);
          display: grid;
          place-items: center;
          color: #04130a;
          flex-shrink: 0;
        }
        .train-ribbon .tr-txt {
          text-align: left;
          flex: 1;
        }
        .train-ribbon .tr-txt strong {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 15px;
          display: block;
          color: #eaf2ec;
        }
        .train-ribbon .tr-txt span {
          font-size: 12.5px;
          color: #9fb3a6;
        }
        .train-ribbon .tr-cta {
          padding: 9px 16px;
          border-radius: 999px;
          background: #4ade80;
          color: #04130a;
          font-weight: 600;
          font-size: 13px;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-family: 'Inter', sans-serif;
        }
        .train-ribbon .tr-cta:hover {
          background: #6ee7a8;
          transform: scale(0.96);
        }

        /* ----- responsive tweaks (unchanged) ----- */
        @media (max-width: 860px) {
          .site-hero {
            padding: 20px 24px 40px;
          }
          .train-ribbon {
            flex-wrap: wrap;
            justify-content: center;
            text-align: center;
          }
          .train-ribbon .tr-txt {
            text-align: center;
          }
        }
        @media (max-width: 480px) {
          .site-cta-row {
            flex-direction: column;
            width: 100%;
          }
          .site-getstarted, .site-explore {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="site-hero-wrapper">
        {/* Decorative curves */}
        <svg
          className="site-curves"
          viewBox="0 0 1180 700"
          preserveAspectRatio="none"
        >
          <path
            d="M-50 250 C 300 120, 800 360, 1250 180"
            stroke="rgba(74,222,128,0.25)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M-50 420 C 350 320, 850 520, 1250 360"
            stroke="rgba(45,212,191,0.18)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>

        <div className="site-hero">
          {/* Badges – unchanged */}
          <div className="site-badges">
            <span className="site-badge">
              <span className="gd"></span> Product of the month
            </span>
            <span className="site-badge">1500+ Job Seekers Helped</span>
          </div>

          {/* HEADING – exact styling from Hero */}
          <h1>
            Land High-Paying Jobs
            <span className="teal">
              A Dedicated Team Applies<br />On Your Behalf
            </span>
          </h1>

          {/* DESCRIPTION – exact text from Hero */}
          <p>
            Stop wasting hours on applications that never get read. We assign a dedicated human specialist to curate, tailor, and apply to your dream jobs for you—so you can focus on acing the interviews.
          </p>

          {/* CTA Row */}
          <div className="site-cta-row">
            <button className="site-getstarted" onClick={onNavigateToSignup}>
              Get Started
            </button>
            <button className="site-explore" onClick={onNavigateToQAtoBA}>
              Explore Training Programs <ArrowRight size={16} />
            </button>
          </div>

          {/* Training Ribbon */}
          <div className="train-ribbon">
            <div className="tr-ic">
              <BookOpen size={20} strokeWidth={2.5} />
            </div>
            <div className="tr-txt">
              <strong>New: QA → BA / PO Career Transition</strong>
              <span>15-day live program · we apply to 200+ jobs for you · register now</span>
            </div>
            <button className="tr-cta" onClick={onNavigateToQAtoBA}>
              Enroll →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};