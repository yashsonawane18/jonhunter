import React from 'react';

export const PlacementSection: React.FC = () => {
  return (
    <>
      <style>{`
        /* Font imports */
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        /* CSS Variables - exact match from landing page */
        .placement-root {
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

        .placement-root {
          background: var(--bg-2);
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          padding: 110px 0;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: var(--fg);
        }

        .placement-wrap {
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
  margin-right: auto;      /* keep container on the left */
}

.placement-root .section-head {
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

        /* Placement Grid */
        .placement-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .pl-card {
          padding: 28px;
          border: 1px solid var(--line);
          border-radius: var(--radius);
          background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent);
          display: flex;
          gap: 22px;
          align-items: flex-start;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .pl-card:hover {
          border-color: rgba(74,222,128,0.3);
          background: linear-gradient(180deg, rgba(74,222,128,0.04), transparent);
        }

        .pl-card .pl-num {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 36px;
          line-height: 1;
          background: var(--grad);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          min-width: 50px;
          letter-spacing: -0.02em;
        }

        .pl-card h4 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 18px;
          margin: 0 0 8px;
          letter-spacing: -0.01em;
        }

        .pl-card p {
          margin: 0;
          color: var(--fg-dim);
          font-size: 14px;
          line-height: 1.55;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .placement-root {
            padding: 80px 0;
          }
          .placement-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 640px) {
          .placement-root {
            padding: 60px 0;
          }
          .placement-wrap {
            padding: 0 20px;
          }
          .placement-grid {
            grid-template-columns: 1fr;
          }
          .pl-card {
            padding: 22px;
            gap: 16px;
          }
          .pl-card .pl-num {
            font-size: 28px;
            min-width: 40px;
          }
        }
      `}</style>

      <div id="placement" className="placement-root">
        <div className="placement-wrap">
          <div className="section-head">
            <span className="eyebrow">Track 02 · Job Placement</span>
            <h2 className="display">
              Where other programs stop,<br />
              we <span className="grad-text">start applying.</span>
            </h2>
            <p>
              A done-for-you job hunt service. We don't just hand you a curriculum and wish you luck.
              We sit on the same side of the table — until you sign.
            </p>
          </div>

          <div className="placement-grid">
            <div className="pl-card">
              <span className="pl-num">01</span>
              <div>
                <h4>Resume Engineering</h4>
                <p>1:1 rewriting by Dheeraj to reposition QA experience as BA / PO. ATS-optimized with target keywords.</p>
              </div>
            </div>

            <div className="pl-card">
              <span className="pl-num">02</span>
              <div>
                <h4>LinkedIn Optimization</h4>
                <p>Complete profile makeover — headline, About, Experience, Skills, banner. Activate recruiter visibility.</p>
              </div>
            </div>

            <div className="pl-card">
              <span className="pl-num">03</span>
              <div>
                <h4>Naukri Profile Setup</h4>
                <p>Rebuild with keyword targeting, hot-resume highlighting, and recruiter discovery configured.</p>
              </div>
            </div>

            <div className="pl-card">
              <span className="pl-num">04</span>
              <div>
                <h4>200+ Applications</h4>
                <p>We apply to 200+ matching BA / PO / PM jobs on your behalf across LinkedIn, Naukri &amp; portals.</p>
              </div>
            </div>

            <div className="pl-card">
              <span className="pl-num">05</span>
              <div>
                <h4>Recruiter Outreach</h4>
                <p>Sales Navigator-driven cold outreach to recruiters &amp; hiring managers with proven message templates.</p>
              </div>
            </div>

            <div className="pl-card">
              <span className="pl-num">06</span>
              <div>
                <h4>Referral Network</h4>
                <p>Access our internal referral network — into product companies, startups &amp; MNCs hiring BA / PO.</p>
              </div>
            </div>

            <div className="pl-card">
              <span className="pl-num">07</span>
              <div>
                <h4>Mock Interview Sessions</h4>
                <p>Unlimited mock interviews with real-time feedback. Behavioral, scenario-based, and case-study formats.</p>
              </div>
            </div>

            <div className="pl-card">
              <span className="pl-num">08</span>
              <div>
                <h4>Negotiation Support</h4>
                <p>Pre-interview research, post-interview debriefs, and offer negotiation — until you sign.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};