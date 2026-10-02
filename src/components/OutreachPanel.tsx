import React, { useMemo, useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { Button } from './home/Button';
import type { GeneratedResume } from '../lib/resumeTypes';

// "Outreach" tab (Phase 2): LinkedIn connection + referral message templates,
// auto-filled from the resume + job (no AI/backend). Each message is editable
// and has a Copy button (the key action — paste into LinkedIn). [Name] (the
// person being messaged) stays an editable placeholder.

interface Props {
  resume: GeneratedResume;
  jobTitle: string;
  company: string;
}

interface OutreachMsg {
  label: string;
  tip: string;
  body: string;
  limit?: number; // char limit (LinkedIn connection note = 200)
}

function buildMessages(resume: GeneratedResume, jobTitle: string, company: string): OutreachMsg[] {
  const name = (resume.name || '').trim() || '[Your Name]';
  const role = (jobTitle || resume.title || '').trim() || '[Role]';
  const co = (company || '').trim() || '[Company]';
  const domain = (resume.title || '').trim() || '[Domain]';
  const skills = (resume.skills || []).filter(Boolean);
  const skill = (i: number) => skills[i] || `[Skill ${i + 1}]`;
  const skillsList = skills.length ? skills.slice(0, 3).join(', ') : '[Skills]';
  const project =
    resume.projects?.[0]?.title ||
    resume.experience?.[0]?.company ||
    '[Project]';
  const years = (resume.yearsExperience || '').trim() || '[X years]'; // from profile total experience

  return [
    {
      label: '1. Connection note',
      tip: 'Keep it short, polite, and personalized to build a strong connection.',
      limit: 200,
      body: `Hi [Name], I came across the ${role} at ${co} and noticed your profile. I'd love to connect, learn from your experience, and if suitable, seek your guidance regarding this opportunity.`,
    },
    {
      label: '2. After connection is accepted — Version 1',
      tip: 'Keep your message professional, clear, and to the point.',
      body: `Hi [Name],

Thank you for accepting my request!

I'm ${name} with ${years} of experience in ${domain}.

I've worked on ${project} using ${skill(0)}, ${skill(1)}, and ${skill(2)}.

I recently applied for the ${role} at ${co}.

If you feel my profile is a good fit, I'd be grateful if you could refer me. I'm happy to share my resume.

Thank you for your time!`,
    },
    {
      label: '3. After connection is accepted — Version 3',
      tip: 'Personalize your message and keep it genuine — be polite, concise, and show interest.',
      body: `Hi [Name],

Thank you for connecting — I really appreciate it.

I'm actively exploring opportunities in ${domain}. I have ${years} of experience with ${skillsList} and recently completed work on ${project}.

I found the ${role} at ${co} very interesting. If you're comfortable referring candidates, I'd be thankful if you could consider referring me.

I've attached my resume and would truly appreciate your support.`,
    },
    {
      label: '4. Polite follow-up (after 2–3 days)',
      tip: 'Gentle and understanding — no pressure.',
      body: `Hi [Name],

Just following up on my previous message regarding the referral for the ${role}.

I completely understand if you've been busy. If possible, I'd really appreciate your support.

Thank you!`,
    },
  ];
}

const OutreachPanel: React.FC<Props> = ({ resume, jobTitle, company }) => {
  const base = useMemo(() => buildMessages(resume, jobTitle, company), [resume, jobTitle, company]);
  const [texts, setTexts] = useState<string[]>(base.map((m) => m.body));
  const [copied, setCopied] = useState<number | null>(null);

  const copy = async (i: number) => {
    try {
      await navigator.clipboard.writeText(texts[i]);
      setCopied(i);
      setTimeout(() => setCopied((c) => (c === i ? null : c)), 1500);
    } catch {
      alert('Copy failed — please select the text and copy manually.');
    }
  };

  const downloadTxt = () => {
    const content = base
      .map((m, i) => `${m.label.toUpperCase()}\n${'-'.repeat(m.label.length)}\n${texts[i]}`)
      .join('\n\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safe = (resume.name || 'Candidate').replace(/[^a-z0-9]+/gi, '_').slice(0, 40);
    a.href = url;
    a.download = `Outreach_Messages_${safe}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const update = (i: number, v: string) => setTexts((t) => t.map((x, idx) => (idx === i ? v : x)));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-gray-200">
        <div>
          <div className="text-[15px] font-bold text-gray-900">LinkedIn Outreach Messages</div>
          <div className="text-xs text-gray-500">
            Auto-filled from your resume + this job. Edit any message, replace <strong>[Name]</strong> with the
            recipient, then copy.
          </div>
        </div>
        <button
          type="button"
          onClick={downloadTxt}
          className="shrink-0 inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          <Download className="w-4 h-4" /> Download all (.txt)
        </button>
      </div>

      <div className="space-y-5">
        {base.map((m, i) => {
          const over = m.limit != null && texts[i].length > m.limit;
          return (
            <div key={i} className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
                <span className="text-[13px] font-semibold text-gray-800">{m.label}</span>
                <div className="flex items-center gap-2">
                  {m.limit != null && (
                    <span className={`text-xs ${over ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                      {texts[i].length}/{m.limit}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => copy(i)}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    {copied === i ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === i ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <textarea
                value={texts[i]}
                onChange={(e) => update(i, e.target.value)}
                rows={m.body.split('\n').length + 1}
                className="w-full px-3 py-2 text-[13px] leading-relaxed text-gray-800 resize-vertical focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <div className="px-3 py-1.5 text-[11px] text-gray-500 bg-gray-50/60 border-t border-gray-100">
                💡 {m.tip}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OutreachPanel;
