import React from "react";

export const CurriculumSection: React.FC = () => {
  return (
    <>
      <style>{`
        /* Font imports */
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        /* CSS Variables - exact match from landing page */
        .curriculum-root {
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

        .curriculum-root {
          background: var(--bg-2);
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          padding: 110px 0;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: var(--fg);
          position: relative;
        }

        .curriculum-wrap {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 32px;
        }

        /* Section Head */
        .section-head {
          max-width: 760px;
          margin-bottom: 60px;
        }

              .curriculum-root .section-head {
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


        /* Curriculum Grid */
        .curr-wrap {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 60px;
          align-items: start;
        }

        /* Timeline list */
        .curr-list {
          position: relative;
        }

        .curr-list::before {
          content: '';
          position: absolute;
          left: 22px;
          top: 6px;
          bottom: 6px;
          width: 2px;
          background: linear-gradient(180deg, var(--green), rgba(5,150,105,0.4) 60%, transparent);
        }

        .curr-item {
          position: relative;
          padding: 18px 0 18px 64px;
          border-bottom: 1px solid var(--line);
        }

        .curr-item:last-child {
          border-bottom: none;
        }

        .curr-item .num {
          position: absolute;
          left: 0;
          top: 18px;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: var(--bg-3);
          border: 1px solid var(--line-2);
          display: grid;
          place-items: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          color: var(--green);
          font-size: 16px;
          z-index: 1;
        }

        .curr-item.active .num {
          background: var(--grad);
          color: #04130a;
          border-color: transparent;
          box-shadow: 0 0 0 4px rgba(74,222,128,0.16);
        }

        .curr-item .head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .curr-item h4 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 19px;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .curr-item .days {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--green);
          letter-spacing: 0.08em;
        }

        .curr-item p {
          color: var(--fg-dim);
          font-size: 14.5px;
          line-height: 1.55;
          margin: 6px 0 0;
        }

        /* Sidebar */
        .curr-side {
          position: sticky;
          top: 100px;
          background: linear-gradient(180deg, rgba(74,222,128,0.05), transparent);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          padding: 32px;
        }

        .curr-side .pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(74,222,128,0.1);
          color: var(--green);
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          margin-bottom: 18px;
        }

        .curr-side h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 28px;
          margin: 0 0 14px;
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        .curr-side p {
          color: var(--fg-dim);
          font-size: 14.5px;
          line-height: 1.55;
          margin: 0 0 22px;
        }

        .curr-side ul {
          list-style: none;
          padding: 0;
          margin: 0 0 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .curr-side ul li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          color: var(--fg-dim);
        }

        .curr-side ul svg {
          color: var(--green);
          flex-shrink: 0;
          margin-top: 3px;
        }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 22px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 15px;
          border: 1px solid transparent;
          transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;
          white-space: nowrap;
          background: rgba(255,255,255,0.04);
          border-color: var(--line-2);
          color: var(--fg);
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
        }

        .btn-ghost:hover {
          background: rgba(255,255,255,0.08);
          transform: translateY(-1px);
        }

        .btn-ghost .arrow {
          transition: transform 0.2s ease;
          display: inline-block;
        }

        .btn-ghost:hover .arrow {
          transform: translateX(3px);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .curriculum-root {
            padding: 80px 0;
          }
          .curr-wrap {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .curr-side {
            position: static;
          }
        }

        @media (max-width: 640px) {
          .curriculum-root {
            padding: 60px 0;
          }
          .curriculum-wrap {
            padding: 0 20px;
          }
          .curr-side {
            padding: 28px;
          }
          .curr-side h3 {
            font-size: 24px;
          }
          .curr-item .head {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>

      <div id="curriculum" className="curriculum-root">
        <div className="curriculum-wrap">
          <div className="section-head">
            <span className="eyebrow">
              Track 01 · BA / PO / APM / PM Curriculum
            </span>
            <h2 className="display">
              15 days. 7 modules.
              <br />
              One <span className="grad-text">repositioned career.</span>
            </h2>
            <p>
              A focused curriculum for working professionals — daily practice
              tasks, real Jira tickets, BRD &amp; PRD templates, AI tools for
              product roles, and 1:1 mentorship from Dheeraj.
            </p>
          </div>

          <div className="curr-wrap">
            <div className="curr-list">
              <div className="curr-item active">
                <div className="num">01</div>
                <div className="head">
                  <h4>Foundation &amp; Mindset Shift</h4>
                  <span className="days">DAY 1-3</span>
                </div>
                <p>
                  From builder to decision-maker. Role clarity for BA / PO / PM.
                  The critical resume-repositioning exercise.
                </p>
              </div>
              <div className="curr-item">
                <div className="num">02</div>
                <div className="head">
                  <h4>BA &amp; Requirements Mastery</h4>
                  <span className="days">DAY 4-6</span>
                </div>
                <p>
                  BRD, FRD, User Stories, RACI matrices, stakeholder management
                  frameworks.
                </p>
              </div>
              <div className="curr-item">
                <div className="num">03</div>
                <div className="head">
                  <h4>Agile, Scrum &amp; PO Mastery</h4>
                  <span className="days">DAY 7-9</span>
                </div>
                <p>
                  Sprint planning, backlog grooming, prioritization (MoSCoW,
                  RICE), roadmaps.
                </p>
              </div>
              <div className="curr-item">
                <div className="num">04</div>
                <div className="head">
                  <h4>Industry Tools + AI for PMs</h4>
                  <span className="days">DAY 10-11</span>
                </div>
                <p>
                  Jira, Confluence, Azure DevOps, Figma — plus AI tools for
                  product roles (PRD generation, user research, prioritization
                  assists).
                </p>
              </div>
              <div className="curr-item">
                <div className="num">05</div>
                <div className="head">
                  <h4>UAT &amp; Stakeholder Skills</h4>
                  <span className="days">DAY 12</span>
                </div>
                <p>
                  Gap analysis, UAT planning, communication frameworks for
                  cross-functional teams.
                </p>
              </div>
              <div className="curr-item">
                <div className="num">06</div>
                <div className="head">
                  <h4>Interview Mastery</h4>
                  <span className="days">DAY 13-14</span>
                </div>
                <p>
                  STAR method, 30+ Q&amp;A bank, case studies, and scenario
                  interview rehearsal.
                </p>
              </div>
              <div className="curr-item">
                <div className="num">07</div>
                <div className="head">
                  <h4>Job Hunt Activation</h4>
                  <span className="days">DAY 15</span>
                </div>
                <p>
                  LinkedIn, Naukri, Sales Navigator, referral scripts — flows
                  into Track 02 (Placement).
                </p>
              </div>
            </div>

            <aside className="curr-side">
              <span className="pill">// COURSE OUTCOMES</span>
              <h3>What you'll walk out with.</h3>
              <p>
                Six concrete outcomes that show up on your resume, in your
                portfolio, and in your interview answers.
              </p>
              <ul>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Repositioned, ATS-ready BA resume
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  A live BRD, FRD &amp; User Story portfolio
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Working Jira &amp; ADO boards you can demo
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  The "no BA experience" killer answer
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  A recruiter-optimized LinkedIn
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  30+ interview Q&amp;A internalized
                </li>
              </ul>
              <a
                href="#register"
                className="btn-ghost"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Reserve your seat <span className="arrow">→</span>
              </a>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};
