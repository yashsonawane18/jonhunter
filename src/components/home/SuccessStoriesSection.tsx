import React from 'react';

export const SuccessStoriesSection: React.FC = () => {
  return (
    <>
      <style>{`
        /* Font imports */
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        /* CSS Variables */
        .stories-root {
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

        .stories-root {
          background: linear-gradient(180deg, var(--bg-2), var(--bg));
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          padding: 110px 0;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: var(--fg);
        }

        .stories-wrap {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 32px;
        }

        /* Section Head - left aligned */
        .stories-root .section-head {
          max-width: 1080px;
          margin-bottom: 60px;
          text-align: left;
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

        /* Walls container - stacked vertically */
        .stories-walls {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .stories-wall {
          position: relative;
          border: 1px solid var(--line);
          border-radius: 20px;
          overflow: hidden;
        }

        .stories-wall img {
          width: 100%;
          height: auto;
          display: block;
        }

        .stories-wall .wall-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 55%, rgba(7,9,10,0.92));
          display: flex;
          align-items: flex-end;
          padding: 36px;
        }

        .stories-wall .wall-overlay .wo-inner {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          gap: 16px;
        }

        .stories-wall .wall-overlay h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: clamp(24px, 3vw, 36px);
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .stories-wall .wall-overlay .wo-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 22px;
          border-radius: 999px;
          background: var(--green);
          color: #04130a;
          font-weight: 600;
          font-size: 14.5px;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stories-wall .wall-overlay .wo-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 0 6px rgba(74,222,128,0.12);
        }

        .stories-wall .wall-overlay .wo-cta .arrow {
          transition: transform 0.2s ease;
          display: inline-block;
        }

        .stories-wall .wall-overlay .wo-cta:hover .arrow {
          transform: translateX(3px);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .stories-root {
            padding: 80px 0;
          }
        }

        @media (max-width: 640px) {
          .stories-root {
            padding: 60px 0;
          }
          .stories-wrap {
            padding: 0 20px;
          }
          .stories-wall .wall-overlay {
            padding: 20px;
          }
          .stories-wall .wall-overlay h3 {
            font-size: 20px;
          }
          .wo-cta {
            padding: 10px 16px;
            font-size: 13px;
          }
        }
      `}</style>

      <div id="stories" className="stories-root">
        <div className="stories-wrap">
          <div className="section-head">
            <span className="eyebrow">Success stories · real people, real offers</span>
            <h2 className="display">
              They were testers.<br />
              Now they <span className="grad-text">own the product.</span>
            </h2>
            <p>
              Not stock photos. Not made‑up quotes. These are real DRC students who switched out of QA &amp; IT into
              Business Analyst, Product &amp; high‑paying remote roles — many with two offers in hand.
            </p>
          </div>

          {/* Walls – stacked vertically */}
          <div className="stories-walls">
            <div className="stories-wall">
              <img
                src="src/assets/drc_client.jpeg"
                alt="Our clients and partners"
                loading="lazy"
              />
              <div className="wall-overlay">
                <div className="wo-inner">
                  <h3>Trusted by leading<br />companies worldwide.</h3>
                  <a href="#register" className="wo-cta">
                    Join our network <span className="arrow">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};