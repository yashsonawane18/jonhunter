import React from 'react';

export const FaqSection: React.FC = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .faq-root {
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

        .faq-root {
          background: var(--bg-2);
          border-top: 1px solid var(--line);
          padding: 110px 0;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: var(--fg);
        }

        .faq-wrap {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 32px;
        }

        /* Section Head */
        .section-head {
          max-width: 760px;
          margin: 0 auto 60px;
          text-align: center;
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
          margin: 0 auto;
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

        /* FAQ Grid */
        .faq-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          max-width: 880px;
          margin: 0 auto;
        }

        .faq {
          border: 1px solid var(--line);
          border-radius: 14px;
          background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent);
          overflow: hidden;
        }

        .faq summary {
          padding: 22px 26px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 17px;
          letter-spacing: -0.01em;
          list-style: none;
        }

        .faq summary::-webkit-details-marker {
          display: none;
        }

        .faq summary::after {
          content: '+';
          font-family: 'Space Grotesk', sans-serif;
          font-size: 24px;
          color: var(--green);
          transition: transform 0.2s ease;
        }

        .faq[open] summary::after {
          transform: rotate(45deg);
        }

        .faq .answer {
          padding: 0 26px 24px;
          color: var(--fg-dim);
          font-size: 14.5px;
          line-height: 1.6;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .faq-root {
            padding: 80px 0;
          }
        }

        @media (max-width: 640px) {
          .faq-root {
            padding: 60px 0;
          }
          .faq-wrap {
            padding: 0 20px;
          }
          .faq summary {
            padding: 18px 20px;
            font-size: 15px;
          }
          .faq .answer {
            padding: 0 20px 20px;
            font-size: 13.5px;
          }
        }
      `}</style>

      <div className="faq-root">
        <div className="faq-wrap">
          <div className="section-head">
            <span className="eyebrow">Frequently asked</span>
            <h2 className="display">Answers, before you ask.</h2>
          </div>

          <div className="faq-grid">
            <details className="faq" open>
              <summary>I'm a manual tester with no Agile background. Will this work for me?</summary>
              <div className="answer">
                Yes. The first three days are designed for exactly that — the "Foundation &amp; Mindset Shift" module assumes zero BA / PO context. By Day 6 you'll have written a BRD, an FRD, and a set of user stories from scratch.
              </div>
            </details>

            <details className="faq">
              <summary>What is the "job assurance guarantee" actually?</summary>
              <div className="answer">
                Our placement support has no time limit. We continue applying, prepping, and refining until you sign a BA / PO / PM offer letter. No artificial deadlines. No "your 3 months are up."
              </div>
            </details>

            <details className="faq">
              <summary>How much time per day will I need?</summary>
              <div className="answer">
                About 1.5–2 hours on weekdays during the 15-day core program — most students do it before or after their existing QA job. After Day 15, the placement service runs in parallel with your current role.
              </div>
            </details>

            <details className="faq">
              <summary>Who actually applies to the 200+ jobs?</summary>
              <div className="answer">
                Our placement team. We use your repositioned resume, your LinkedIn, and your Naukri profile, and we apply on your behalf across LinkedIn, Naukri, and direct company portals. You get a daily tracking dashboard.
              </div>
            </details>

            <details className="faq">
              <summary>What if my resume still says "tester" after the rewrite?</summary>
              <div className="answer">
                It won't. The 1:1 resume engineering session with Dheeraj rewrites your QA work as requirement-gathering, stakeholder, UAT and Agile experience. Same projects — repositioned vocabulary, BA-targeted keywords, ATS-friendly.
              </div>
            </details>

            <details className="faq">
              <summary>What's the refund policy?</summary>
              <div className="answer">
                7-day no-questions-asked refund from the day you join. After that, our model is success-based — we keep working with you until you sign.
              </div>
            </details>
          </div>
        </div>
      </div>
    </>
  );
};

