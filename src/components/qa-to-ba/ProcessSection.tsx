import React from 'react';

export const ProcessSection: React.FC = () => {
  return (
    <>
      <style>{`
        /* Font imports */
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        /* CSS Variables - exact match from landing page */
        .process-root {
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

        .process-root {
          background: var(--bg);
          padding: 110px 0;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: var(--fg);
        }

        .process-wrap {
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

        .process-root .section-head {
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

        /* Process List */
        .process-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .proc-item {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 32px;
          padding: 32px 0;
          border-top: 1px solid var(--line);
          position: relative;
          align-items: start;
        }

        .proc-item:first-child {
          border-top: none;
        }

        .proc-item .stage {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .proc-item .stage .marker {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--bg-3);
          border: 1px solid var(--line-2);
          display: grid;
          place-items: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          color: var(--green);
          font-size: 14px;
        }

        .proc-item .stage .when {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--green);
          letter-spacing: 0.12em;
        }

        .proc-item .stage .when small {
          display: block;
          color: var(--fg-mute);
          font-size: 10px;
          margin-top: 4px;
          letter-spacing: 0.08em;
        }

        .proc-item h4 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 22px;
          margin: 0 0 8px;
          letter-spacing: -0.01em;
        }

        .proc-item p {
          margin: 0;
          color: var(--fg-dim);
          font-size: 15px;
          line-height: 1.6;
          max-width: 720px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .process-root {
            padding: 80px 0;
          }
          .proc-item {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .proc-item .stage {
            margin-bottom: 4px;
          }
        }

        @media (max-width: 640px) {
          .process-root {
            padding: 60px 0;
          }
          .process-wrap {
            padding: 0 20px;
          }
          .proc-item {
            padding: 24px 0;
          }
          .proc-item h4 {
            font-size: 18px;
          }
          .proc-item p {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="process-root">
        <div className="process-wrap">
          <div className="section-head">
            <span className="eyebrow">End-to-end flow</span>
            <h2 className="display">
              From enrollment<br />
              to <span className="grad-text">offer letter.</span>
            </h2>
            <p>
              Exactly what happens once you join DRC — broken down step-by-step. No black box, no surprises.
            </p>
          </div>

          <div className="process-list">
            <div className="proc-item">
              <div className="stage">
                <div className="marker">01</div>
                <div className="when">
                  DAY 0
                  <small>Discovery Call</small>
                </div>
              </div>
              <div>
                <h4>30-min 1:1 with Dheeraj</h4>
                <p>We assess your background, target role (BA / PO / PM), salary expectations, and timeline — then design your personalized switch plan.</p>
              </div>
            </div>

            <div className="proc-item">
              <div className="stage">
                <div className="marker">02</div>
                <div className="when">
                  DAY 1-3
                  <small>Kickoff &amp; Mindset</small>
                </div>
              </div>
              <div>
                <h4>Course Kickoff &amp; Mindset Shift</h4>
                <p>15-day learning begins. Foundation videos, BA / PO / PM role clarity, and the critical resume-repositioning exercise. You finish with a draft BA-ready resume.</p>
              </div>
            </div>

            <div className="proc-item">
              <div className="stage">
                <div className="marker">03</div>
                <div className="when">
                  DAY 4-12
                  <small>Core Skills</small>
                </div>
              </div>
              <div>
                <h4>Core Skills &amp; Tools Training</h4>
                <p>BA fundamentals, Agile / Scrum, Jira, ADO, Figma, UAT, stakeholder management — with daily practice tasks and deliverables you can show in interviews.</p>
              </div>
            </div>

            <div className="proc-item">
              <div className="stage">
                <div className="marker">04</div>
                <div className="when">
                  DAY 13
                  <small>Profiles</small>
                </div>
              </div>
              <div>
                <h4>Resume + LinkedIn + Naukri Setup</h4>
                <p>1:1 resume review by Dheeraj. LinkedIn profile makeover. Naukri setup with keyword targeting. You're now visible to recruiters.</p>
              </div>
            </div>

            <div className="proc-item">
              <div className="stage">
                <div className="marker">05</div>
                <div className="when">
                  DAY 14-15
                  <small>Interview Prep</small>
                </div>
              </div>
              <div>
                <h4>Interview Prep &amp; Mock Sessions</h4>
                <p>30+ interview Q&amp;A bank, behavioral &amp; scenario practice, multiple mock interviews with real-time feedback. You walk in confident.</p>
              </div>
            </div>

            <div className="proc-item">
              <div className="stage">
                <div className="marker">06</div>
                <div className="when">
                  DAY 16+
                  <small>Activation</small>
                </div>
              </div>
              <div>
                <h4>Job Application Service Activated</h4>
                <p>We start applying to 200+ relevant BA / PO / PM jobs on your behalf. Daily tracking dashboard shows every submission.</p>
              </div>
            </div>

            <div className="proc-item">
              <div className="stage">
                <div className="marker">07</div>
                <div className="when">
                  WEEK 3-4
                  <small>Interviews</small>
                </div>
              </div>
              <div>
                <h4>Interview Calls Start Coming</h4>
                <p>Pre-interview prep calls before every interview. Company-specific research. Post-interview debrief. We refine your approach with each conversation.</p>
              </div>
            </div>

            <div className="proc-item">
              <div className="stage">
                <div className="marker">08</div>
                <div className="when">
                  UNTIL HIRED
                  <small>Offer</small>
                </div>
              </div>
              <div>
                <h4>Offer + Negotiation Support</h4>
                <p>Once you have an offer, we help negotiate the package. Salary, joining bonus, role clarity. We don't close your case until you sign.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

