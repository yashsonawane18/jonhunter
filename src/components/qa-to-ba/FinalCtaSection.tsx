import React from 'react';

export const FinalCtaSection: React.FC = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .final-cta-root {
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

        .final-cta-root {
          position: relative;
          overflow: hidden;
          padding: 120px 0;
          text-align: center;
          background: var(--bg);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: var(--fg);
        }

        .final-cta-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(50% 60% at 50% 50%, rgba(74,222,128,0.16), transparent 70%);
          pointer-events: none;
        }

        .final-wrap {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 32px;
          position: relative;
          z-index: 1;
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

        .final-cta-root h2 {
          font-size: clamp(40px, 5.5vw, 64px);
          max-width: 920px;
          margin: 22px auto 22px;
        }

        .grad-text {
          background: var(--grad);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .final-cta-root > .final-wrap > p {
          color: var(--fg-dim);
          font-size: 18px;
          max-width: 580px;
          margin: 0 auto 44px;
          line-height: 1.55;
        }

        /* Contact cards */
        .final-contact {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          max-width: 920px;
          margin: 0 auto;
        }

        .contact-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 22px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: linear-gradient(180deg, rgba(74,222,128,0.04), transparent);
          text-align: left;
          transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
          text-decoration: none;
          color: inherit;
        }

        .contact-card:hover {
          border-color: rgba(74,222,128,0.4);
          transform: translateY(-2px);
          background: linear-gradient(180deg, rgba(74,222,128,0.08), transparent);
        }

        .contact-card .cc-ic {
          width: 44px;
          height: 44px;
          border-radius: 11px;
          background: var(--grad-soft);
          border: 1px solid rgba(74,222,128,0.18);
          display: grid;
          place-items: center;
          color: var(--green);
          flex-shrink: 0;
        }

        .contact-card .cc-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: var(--fg-mute);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .contact-card .cc-value {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 16px;
          margin-top: 2px;
        }

        .contact-card .cc-arrow {
          margin-left: auto;
          color: var(--green);
          flex-shrink: 0;
        }

        /* Tagline quote card */
        .tagline-card {
          max-width: 720px;
          margin: 50px auto 0;
          padding: 40px 36px;
          border: 1px solid rgba(74,222,128,0.3);
          border-radius: 22px;
          background: linear-gradient(135deg, rgba(74,222,128,0.08), rgba(5,150,105,0.04));
          position: relative;
        }

        .tagline-card .tagline-quote {
          position: absolute;
          top: -28px;
          left: 28px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 120px;
          line-height: 0.8;
          color: var(--green);
          opacity: 0.6;
        }

        .tagline-card .tagline-text {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: clamp(22px, 2.6vw, 30px);
          line-height: 1.3;
          letter-spacing: -0.01em;
        }

        .micro {
          margin-top: 28px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--fg-mute);
          letter-spacing: 0.1em;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .final-cta-root {
            padding: 80px 0;
          }
        }

        @media (max-width: 768px) {
          .final-contact {
            grid-template-columns: 1fr;
            gap: 12px;
            max-width: 400px;
          }
        }

        @media (max-width: 640px) {
          .final-cta-root {
            padding: 60px 0;
          }
          .final-wrap {
            padding: 0 20px;
          }
          .tagline-card {
            padding: 30px 24px;
            margin-top: 36px;
          }
          .tagline-card .tagline-quote {
            font-size: 80px;
            top: -20px;
            left: 20px;
          }
          .contact-card {
            padding: 14px 18px;
          }
          .contact-card .cc-value {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="final-cta-root">
        <div className="final-wrap">
          <span className="eyebrow">Ready to transition your career?</span>
          <h2 className="display">
            QA / Tester → <span className="grad-text">BA / PO / PM.</span><br />
            Learn. Transition. Get hired.
          </h2>
          <p>
            One call. Then a plan. No commitment. No pitch deck. Just an honest read on your background and a tailored switch roadmap.
          </p>

          <div className="final-contact">
            <a className="contact-card" href="tel:+918625063353">
              <div className="cc-ic">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <div className="cc-label">Call directly</div>
                <div className="cc-value">+91 86250 63353</div>
              </div>
              <svg className="cc-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>

            <a className="contact-card" href="https://wa.me/918625063353" target="_blank" rel="noopener noreferrer">
              <div className="cc-ic">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <div>
                <div className="cc-label">WhatsApp message</div>
                <div className="cc-value">Chat with Dheeraj →</div>
              </div>
              <svg className="cc-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>

            <a className="contact-card" href="#register">
              <div className="cc-ic">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </div>
              <div>
                <div className="cc-label">Book discovery call</div>
                <div className="cc-value">Use the form →</div>
              </div>
              <svg className="cc-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>
          </div>

          <div className="tagline-card">
            <div className="tagline-quote">“</div>
            <div className="tagline-text">
              We don't just teach.<br />
              <span className="grad-text">We help you transition &amp; get hired.</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
