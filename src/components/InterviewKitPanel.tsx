import React, { useState } from 'react';
import { Sparkles, Loader, Globe, FileSearch } from 'lucide-react';
import { Button } from './home/Button';
import { generateInterviewKit } from '../lib/generateInterview';
import type { InterviewKit, InterviewMode, QaItem, StarItem } from '../lib/interviewTypes';

// Interview Prep Kit panel (Phase 2) — sections 3-9 of the DRC kit.
// Generated on demand (it's a much larger AI call than the resume), with two
// selectable paths so they can be compared:
//   Path A 'basic' — JD + company name only, no web
//   Path B 'web'   — Gemini + Google Search grounding for real company facts
// Both return the same shape, so only answer quality differs.

// DRC palette, matching the Word export in src/lib/interviewDocx.ts
const NAVY = '#1B2A4A';
const BLUE = '#2E5C8A';
const CREAM = '#F5E9D3';
const GREY = '#F2F2F2';

interface Props {
  userId: string;
  jobId?: string;
  userJobId?: string;
  jobTitle: string;
  company: string;
  jdText: string;
  keySkills: string[];
  editing: boolean;
  // Controlled by the dialog so the footer's "Download Kit" button can see the
  // generated kit and stay visible while the (long) content scrolls.
  kit: InterviewKit | null;
  onKitChange: (kit: InterviewKit | null) => void;
}

// Small inline-editable field (mirrors EditableText in GeneratedResumeDialog).
const Edit: React.FC<{
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  rows?: number;
  className?: string;
}> = ({ value, editing, onChange, rows = 3, className }) =>
  editing ? (
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-[13px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-vertical"
    />
  ) : (
    <span className={className}>{value}</span>
  );

const SectionTitle: React.FC<{ n: number; children: React.ReactNode }> = ({ n, children }) => (
  <h2
    className="text-[15px] font-bold mt-7 mb-3 pb-1.5"
    style={{ color: NAVY, borderBottom: '2px solid #C9912A' }}
  >
    {n}.&nbsp;&nbsp;{children}
  </h2>
);

const SubTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-[13px] font-bold mt-4 mb-1.5" style={{ color: BLUE }}>
    {children}
  </h3>
);

const Callout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-md px-4 py-3 my-3 text-[13px]" style={{ background: CREAM }}>
    <div className="font-bold mb-1" style={{ color: NAVY }}>{title}</div>
    <div className="text-gray-800">{children}</div>
  </div>
);

const InterviewKitPanel: React.FC<Props> = ({
  userId, jobId, userJobId, jobTitle, company, jdText, keySkills, editing, kit, onKitChange,
}) => {
  const [mode, setMode] = useState<InterviewMode>('basic');
  const [usedMode, setUsedMode] = useState<InterviewMode | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const { kit: k, mode: m } = await generateInterviewKit({
        userId, jobId, userJobId, jobTitle, company, jdText, keySkills, mode,
      });
      onKitChange(k);
      setUsedMode(m);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate the kit.');
    } finally {
      setBusy(false);
    }
  };

  const patch = (p: Partial<InterviewKit>) => kit && onKitChange({ ...kit, ...p });
  const patchQa = (key: 'hrQuestions' | 'technicalQuestions', i: number, v: string) =>
    kit && patch({ [key]: kit[key].map((q, idx) => (idx === i ? { ...q, answer: v } : q)) } as Partial<InterviewKit>);
  const patchStar = (i: number, field: keyof StarItem, v: string) =>
    kit && patch({ behaviouralQuestions: kit.behaviouralQuestions.map((q, idx) => (idx === i ? { ...q, [field]: v } : q)) });

  const QaList: React.FC<{ items: QaItem[]; k: 'hrQuestions' | 'technicalQuestions' }> = ({ items, k }) => (
    <>
      {items.map((q, i) => (
        <div key={i} className="mb-4">
          <div className="text-[13.5px] font-semibold" style={{ color: NAVY }}>
            Q{i + 1}.&nbsp;&nbsp;{q.question}
          </div>
          {q.approach && (
            <div className="text-[12.5px] mt-1">
              <span className="font-semibold" style={{ color: BLUE }}>Approach: </span>
              <span className="italic text-gray-700">{q.approach}</span>
            </div>
          )}
          <div className="text-[13px] mt-1">
            <span className="font-semibold" style={{ color: BLUE }}>Answer: </span>
            <Edit value={q.answer} editing={editing} onChange={(v) => patchQa(k, i, v)} className="text-gray-800" />
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 pb-4 mb-2 border-b border-gray-200">
        <span className="text-xs text-gray-500 mr-1">Research path:</span>
        <button
          type="button"
          onClick={() => setMode('basic')}
          className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${
            mode === 'basic' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          <FileSearch className="w-3.5 h-3.5" /> Path A — JD only
        </button>
        <button
          type="button"
          onClick={() => setMode('web')}
          className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${
            mode === 'web' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          <Globe className="w-3.5 h-3.5" /> Path B — live web
        </button>

        <div className="flex-1" />

        <Button variant="primary" onClick={run} disabled={busy} className="flex items-center gap-2 !px-3 !py-1.5 text-sm">
          {busy ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {busy ? 'Generating…' : kit ? 'Regenerate' : 'Generate Kit'}
        </Button>
        {kit && <span className="text-xs text-gray-400">Download is in the footer ↓</span>}
      </div>

      {error && <p className="text-sm text-red-600 my-3">{error}</p>}

      {!kit && !busy && !error && (
        <p className="text-sm text-gray-500 py-8 text-center">
          Choose a research path and click <strong>Generate Kit</strong> to build the interview prep kit
          (JD breakdown, fit analysis, USPs, elevator pitch, and ~30 questions with model answers).
          <br />
          <span className="text-xs">This takes longer than the resume — roughly 15–30 seconds.</span>
        </p>
      )}

      {busy && (
        <p className="text-sm text-gray-500 py-8 text-center">
          Building your kit via <strong>{mode === 'web' ? 'Path B (live web research)' : 'Path A (JD only)'}</strong>…
        </p>
      )}

      {kit && (
        <div className="text-gray-800">
          <div className="text-xs text-gray-500 mb-2">
            Generated via <strong>{usedMode === 'web' ? 'Path B — live web' : 'Path A — JD only'}</strong>
            {kit.sources?.length ? ` · ${kit.sources.length} source(s)` : ''}
          </div>

          {/* Contents index */}
          <div className="rounded-md px-4 py-3 mb-4" style={{ background: GREY }}>
            <div className="font-bold text-[13px] mb-1.5" style={{ color: NAVY }}>Contents</div>
            <div className="text-[12.5px] space-y-0.5">
              {[
                'Job Description — Full Breakdown',
                'Candidate–Role Fit Analysis',
                'Your Unique Selling Points (USPs)',
                'Elevator Pitch — Tell Me About Yourself',
                'HR & General Interview Questions',
                `${kit.roleTitle || 'Role'} — Domain & Technical Questions`,
                'Behavioural (STAR) Questions',
              ].map((t, i) => (
                <div key={i}>
                  <span className="font-semibold" style={{ color: BLUE }}>{i + 1}.</span>&nbsp;&nbsp;{t}
                </div>
              ))}
            </div>
          </div>

          {/* 1. JD breakdown */}
          <SectionTitle n={1}>Job Description — Full Breakdown</SectionTitle>
          {!!kit.jdBreakdown?.responsibilities?.length && (
            <>
              <SubTitle>Core Responsibilities (as stated by {kit.company || 'the company'})</SubTitle>
              <ul className="list-disc ml-5 text-[13px] space-y-1">
                {kit.jdBreakdown.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </>
          )}
          {!!kit.jdBreakdown?.candidateProfile?.length && (
            <>
              <SubTitle>Desired Candidate Profile</SubTitle>
              <ul className="list-disc ml-5 text-[13px] space-y-1">
                {kit.jdBreakdown.candidateProfile.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </>
          )}
          {kit.jdBreakdown?.readBetweenTheLines && (
            <Callout title="Read Between the Lines">{kit.jdBreakdown.readBetweenTheLines}</Callout>
          )}

          {/* 2. Fit analysis */}
          <SectionTitle n={2}>Candidate–Role Fit Analysis</SectionTitle>
          <p className="text-[13px] mb-2">{kit.fitAnalysis?.intro}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] border-collapse">
              <thead>
                <tr style={{ background: NAVY }}>
                  <th className="text-left text-white font-semibold px-3 py-2">{kit.company || 'Company'} Requirement</th>
                  <th className="text-left text-white font-semibold px-3 py-2">Evidence From Your Background</th>
                </tr>
              </thead>
              <tbody>
                {kit.fitAnalysis?.rows?.map((r, i) => (
                  <tr key={i} style={{ background: i % 2 ? GREY : '#fff' }}>
                    <td className="px-3 py-2 align-top">{r.requirement}</td>
                    <td className="px-3 py-2 align-top">{r.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {kit.fitAnalysis?.gapNote && (
            <p className="text-[13px] italic text-gray-700 mt-3">{kit.fitAnalysis.gapNote}</p>
          )}

          {/* 3. USPs */}
          <SectionTitle n={3}>Your Unique Selling Points (USPs)</SectionTitle>
          <p className="text-[13px]">{kit.uspSection?.intro}</p>
          {kit.uspSection?.usps?.map((u, i) => (
            <div key={i}>
              <SubTitle>USP {i + 1} — {u.title}</SubTitle>
              <p className="text-[13px]">{u.detail}</p>
            </div>
          ))}
          {kit.uspSection?.closingTip && (
            <Callout title="How to Close Any Answer">{kit.uspSection.closingTip}</Callout>
          )}

          {/* 4. Elevator pitch */}
          <SectionTitle n={4}>Elevator Pitch — Tell Me About Yourself</SectionTitle>
          <p className="text-[13px]">{kit.elevatorPitch?.intro}</p>
          <SubTitle>Suggested Script</SubTitle>
          <div className="rounded-md px-4 py-3 text-[13px] italic" style={{ background: GREY }}>
            <Edit
              value={kit.elevatorPitch?.script || ''}
              editing={editing}
              rows={6}
              onChange={(v) => patch({ elevatorPitch: { ...kit.elevatorPitch, script: v } })}
            />
          </div>
          {kit.elevatorPitch?.deliveryTips && (
            <Callout title="Delivery Tips">{kit.elevatorPitch.deliveryTips}</Callout>
          )}

          {/* 5. HR */}
          <SectionTitle n={5}>HR &amp; General Interview Questions</SectionTitle>
          <QaList items={kit.hrQuestions || []} k="hrQuestions" />

          {/* 6. Technical */}
          <SectionTitle n={6}>{kit.roleTitle || 'Role'} — Domain &amp; Technical Questions</SectionTitle>
          <QaList items={kit.technicalQuestions || []} k="technicalQuestions" />

          {/* 7. Behavioural */}
          <SectionTitle n={7}>Behavioural (STAR) Questions</SectionTitle>
          <p className="text-[13px] mb-2">
            Structure every answer as Situation → Task → Action → Result. Keep each under 2 minutes.
          </p>
          {kit.behaviouralQuestions?.map((q, i) => (
            <div key={i} className="mb-4">
              <div className="text-[13.5px] font-semibold" style={{ color: NAVY }}>
                Q{i + 1}.&nbsp;&nbsp;{q.question}
              </div>
              {(['situation', 'task', 'action', 'result'] as const).map((f) => (
                <div key={f} className="text-[13px] mt-1">
                  <span className="font-semibold capitalize" style={{ color: BLUE }}>{f}: </span>
                  <Edit value={q[f]} editing={editing} rows={2} onChange={(v) => patchStar(i, f, v)} className="text-gray-800" />
                </div>
              ))}
            </div>
          ))}

          {!!kit.sources?.length && (
            <>
              <SubTitle>Company research sources</SubTitle>
              <ul className="list-disc ml-5 text-[12px] space-y-0.5 text-gray-600">
                {kit.sources.map((s, i) => <li key={i} className="break-all">{s}</li>)}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewKitPanel;
