import React from 'react';

export const FeaturesSection: React.FC = () => {
  return (
    <>
      <style>{`
        /* Font imports */
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        /* CSS Variables - exact match from landing page */
        .features-root {
          --bg: #07090a;
          --bg-2: #0c1110;
          --bg-3: #111815;
          --line: rgba(255,255,255,0.08);
          --line-2: rgba(255,255,255,0.14);
          --fg: #e8eee9;
          --fg-dim: #9fa8a1;
          --fg-mute: #6c7670;
          --green: #4ade80;
          --emerald: #059669;
          --green-glow: rgba(74,222,128,0.18);
          --grad: linear-gradient(135deg, #4ade80 0%, #059669 100%);
          --grad-soft: linear-gradient(135deg, rgba(74,222,128,0.12), rgba(5,150,105,0.05));
          --radius: 18px;
          --radius-sm: 12px;
        }

        .features-root {
          background: var(--bg);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: var(--fg);
          padding: 110px 0;
          position: relative;
        }

        .features-wrap {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 32px;
        }

        /* Section Head */
        .section-head {
          max-width: 1240px;
  margin-bottom: 60px;
  text-align: left;        /* already present, but keep it */
  margin-left: 0;          /* prevent any automatic centering */
  margin-right: auto; 
        }

        .features-root .section-head {
          text-align: left;
  margin-left: 0;
  margin-right: auto;

        } 

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--green);
        }

        .eyebrow::before {
          content: '//';
          opacity: 0.6;
        }

        .display {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.04;
        }

        .section-head h2 {
          font-size: clamp(36px, 4.5vw, 56px);
          margin: 18px 0 18px;
        }

        .grad-text {
          background: var(--grad);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .section-head p {
          font-size: 18px;
          line-height: 1.55;
          color: var(--fg-dim);
        }

        /* Features Grid - 8 items */
        .features-8 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .feat {
          padding: 24px;
          border: 1px solid var(--line);
          border-radius: var(--radius);
          background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent);
          position: relative;
          transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
        }

        .feat:hover {
          border-color: rgba(74,222,128,0.35);
          transform: translateY(-2px);
          background: linear-gradient(180deg, rgba(74,222,128,0.04), transparent);
        }

        .feat-highlight {
          background: linear-gradient(160deg, rgba(74,222,128,0.12), rgba(5,150,105,0.04));
          border-color: rgba(74,222,128,0.35);
        }

        .feat-highlight:hover {
          background: linear-gradient(160deg, rgba(74,222,128,0.15), rgba(5,150,105,0.05));
        }

        .feat .ic {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          background: var(--grad-soft);
          border: 1px solid rgba(74,222,128,0.18);
          display: grid;
          place-items: center;
          color: var(--green);
          margin-bottom: 16px;
        }

        .feat h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 17px;
          margin: 0 0 8px;
          font-weight: 600;
          letter-spacing: -0.01em;
          line-height: 1.25;
        }

        .feat p {
          margin: 0;
          color: var(--fg-dim);
          font-size: 13.5px;
          line-height: 1.5;
        }

        .feat .feat-no {
          position: absolute;
          top: 18px;
          right: 22px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--fg-mute);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .features-root {
            padding: 80px 0;
          }
          .features-8 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .features-root {
            padding: 60px 0;
          }
          .features-wrap {
            padding: 0 20px;
          }
          .features-8 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="features-root">
        <div className="features-wrap">
          <div className="section-head">
            <span className="eyebrow">What makes DRC different</span>
            <h2 className="display">
              We don't just provide training.<br />
              We <span className="grad-text">transition you.</span>
            </h2>
            <p>
              Most programs hand you a curriculum and disappear. We educate, mentor, prepare, apply, and stay with you — until you get hired.
            </p>
          </div>

          <div className="features-8">
            {/* Feature 01 */}
            <div className="feat">
              <span className="feat-no">01</span>
              <div className="ic">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="m7 14 4-4 4 4 6-6" />
                </svg>
              </div>
              <h3>Career Transition Roadmap</h3>
              <p>A personalized switch plan — your current role, target role, salary expectation, timeline — mapped step by step.</p>
            </div>

            {/* Feature 02 */}
            <div className="feat">
              <span className="feat-no">02</span>
              <div className="ic">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <h3>Complete PM Training</h3>
              <p>End-to-end BA / PO / APM / PM foundations — BRD, FRD, PRD, Agile, Jira, Confluence, and AI tools for product.</p>
            </div>

            {/* Feature 03 */}
            <div className="feat">
              <span className="feat-no">03</span>
              <div className="ic">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
              </div>
              <h3>Resume Transformation</h3>
              <p>1:1 rewriting by Dheeraj. Your QA work — repositioned as BA / PO experience. ATS-optimized, keyword-targeted.</p>
            </div>

            {/* Feature 04 */}
            <div className="feat">
              <span className="feat-no">04</span>
              <div className="ic">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </div>
              <h3>LinkedIn Optimization</h3>
              <p>Complete profile makeover — headline, About, Experience, Skills, banner. Activate recruiter visibility.</p>
            </div>

            {/* Feature 05 */}
            <div className="feat">
              <span className="feat-no">05</span>
              <div className="ic">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <path d="M12 19v3" />
                </svg>
              </div>
              <h3>Mock Interviews</h3>
              <p>Unlimited mock interviews — behavioral, scenario, case-study formats — with real-time feedback & debrief.</p>
            </div>

            {/* Feature 06 */}
            <div className="feat">
              <span className="feat-no">06</span>
              <div className="ic">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3>Real-Time Project Practice</h3>
              <p>Live product case studies, real Jira ticket creation, backlog handling, mock sprint execution — portfolio-grade.</p>
            </div>

            {/* Feature 07 */}
            <div className="feat">
              <span className="feat-no">07</span>
              <div className="ic">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13" />
                  <path d="M22 2 15 22l-4-9-9-4z" />
                </svg>
              </div>
              <h3>200+ Job Applications</h3>
              <p>We apply on your behalf to 200+ relevant BA / PO / PM openings across LinkedIn, Naukri & company portals.</p>
            </div>

            {/* Feature 08 - Highlighted */}
            <div className="feat feat-highlight">
              <span className="feat-no">08</span>
              <div className="ic">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3>Placement Support — Until Hired</h3>
              <p>We stay with you until you have an offer letter. No time limit. No artificial deadline. No abandonment.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
