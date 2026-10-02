import React, { useEffect, useRef, useState } from 'react';
import { Download, Sparkles, Pencil, Plus, X, RotateCcw, Loader, FileText } from 'lucide-react';
import { Button } from './home/Button';
// resumeDocx (and the heavy `docx` library) is imported lazily on demand — see
// handleDownloadDocx — so it doesn't bloat the main bundle.
import { regenerateResume } from '../lib/generateResume';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import type {
  GeneratedResume,
  CoverLetter,
  ResumeTemplateId,
} from '../lib/resumeTypes';
import type { InterviewKit } from '../lib/interviewTypes';
import { TEMPLATES, getTemplate, normUrl } from '../lib/resumeTemplates';
import InterviewKitPanel from './InterviewKitPanel';
import OutreachPanel from './OutreachPanel';

// JD + profile context, forwarded to the Interview Prep tab so it can generate
// its kit from the same job without re-reading the form.
export interface GenerationContext {
  userId: string;
  jobId: string;
  userJobId: string;
  jobTitle: string;
  company: string;
  jdText: string;
  keySkills: string[];
}

interface GeneratedResumeDialogProps {
  open: boolean;
  resume: GeneratedResume | null;
  coverLetter: CoverLetter | null;
  jobContext?: GenerationContext | null;
  onClose: () => void;
}

// Tracks the currently-focused editable field so the B/I/U toolbar knows which
// field's selection to wrap. Set by EditableText on focus.
type ActiveEditor = {
  el: HTMLTextAreaElement | HTMLInputElement;
  onChange: (v: string) => void;
};
const activeEditor: { current: ActiveEditor | null } = { current: null };

// Wrap the current selection (or the caret) with open/close markers and push
// the new value through the field's onChange, then restore the selection.
function applyFormat(open: string, close: string) {
  const a = activeEditor.current;
  if (!a) return;
  const el = a.el;
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  const v = el.value;
  const sel = v.slice(start, end) || 'text';
  const next = v.slice(0, start) + open + sel + close + v.slice(end);
  a.onChange(next);
  requestAnimationFrame(() => {
    try {
      el.focus();
      el.setSelectionRange(start + open.length, start + open.length + sel.length);
    } catch {
      /* noop */
    }
  });
}

// Small formatting toolbar for the manual editor. Applies to whichever rich
// field is focused. Uses onMouseDown-preventDefault so the field keeps focus
// (and its selection) when a button is clicked.
const FormatToolbar: React.FC = () => {
  const btns: Array<{ label: string; open: string; close: string; cls: string }> = [
    { label: 'B', open: '**', close: '**', cls: 'font-bold' },
    { label: 'I', open: '*', close: '*', cls: 'italic' },
    { label: 'U', open: '<u>', close: '</u>', cls: 'underline' },
  ];
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
        Select text, then:
      </span>
      {btns.map((b) => (
        <button
          key={b.label}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyFormat(b.open, b.close)}
          title={`${b.label === 'B' ? 'Bold' : b.label === 'I' ? 'Italic' : 'Underline'}`}
          className={`w-7 h-7 flex items-center justify-center rounded border border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 text-sm ${b.cls}`}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
};

// Preview + inline editor for the generated Resume + Cover Letter.
// Users can toggle Edit to tweak any field by hand; the PDF download always
// reflects the edited version. (AI "Regenerate with instruction" / per-section
// regenerate are stubbed for when the backend endpoint exists.)
const GeneratedResumeDialog: React.FC<GeneratedResumeDialogProps> = ({
  open,
  resume,
  coverLetter,
  jobContext,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'resume' | 'cover' | 'interview' | 'outreach'>('resume');
  const [isEditing, setIsEditing] = useState(false);
  const [templateId, setTemplateId] = useState<ResumeTemplateId>('modern');
  const [instruction, setInstruction] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);

  // Editable working copies. Reset whenever a new generation arrives.
  const [resumeDraft, setResumeDraft] = useState<GeneratedResume | null>(resume);
  const [coverDraft, setCoverDraft] = useState<CoverLetter | null>(coverLetter);
  // Interview kit lives here (not in the panel) so the footer download can see
  // it and stay visible while the long kit scrolls.
  const [interviewKit, setInterviewKit] = useState<InterviewKit | null>(null);
  const [isKitDocxBusy, setIsKitDocxBusy] = useState(false);

  useEffect(() => {
    setResumeDraft(resume);
    setInterviewKit(null);
    setIsEditing(false);
  }, [resume]);
  useEffect(() => {
    setCoverDraft(coverLetter);
  }, [coverLetter]);

  if (!resumeDraft) return null;

  const resetDrafts = () => {
    setResumeDraft(resume);
    setCoverDraft(coverLetter);
  };

  const handleRegenerate = async () => {
    const text = instruction.trim();
    if (!text || !resumeDraft) return;
    setRegenError(null);
    setIsRegenerating(true);
    try {
      const { resume: r, coverLetter: c } = await regenerateResume({
        instruction: text,
        target: activeTab === 'cover' ? 'coverLetter' : 'resume',
        resume: resumeDraft,
        coverLetter: coverDraft as CoverLetter,
      });
      setResumeDraft(r);
      if (c) setCoverDraft(c);
      setInstruction('');
    } catch (e) {
      setRegenError(e instanceof Error ? e.message : 'Could not apply changes.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const tpl = getTemplate(templateId);

  // Clean PDF: renders the exact selected template (all 4 supported) to an A4
  // PDF we build ourselves — no browser print dialog, so no date / about:blank /
  // page-number chrome. resumePdf pulls in jspdf + html2canvas lazily.
  const [isPdfBusy, setIsPdfBusy] = useState(false);
  const handleDownload = async () => {
    setIsPdfBusy(true);
    try {
      const pdfLib = await import('../lib/resumePdf');
      if (activeTab === 'resume') {
        await pdfLib.downloadTemplatePdf(
          tpl.css,
          tpl.resumeBody(resumeDraft),
          pdfLib.pdfFilename('Resume', resumeDraft.title, resumeDraft.name),
        );
      } else if (coverDraft) {
        await pdfLib.downloadTemplatePdf(
          tpl.css,
          tpl.coverBody(coverDraft),
          pdfLib.pdfFilename('CoverLetter', coverDraft.roleTitle, coverDraft.signature),
        );
      }
    } catch (e) {
      console.error('PDF export failed', e);
      alert('Could not create the PDF. Please try again.');
    } finally {
      setIsPdfBusy(false);
    }
  };

  const [isDocxBusy, setIsDocxBusy] = useState(false);
  const handleDownloadDocx = async () => {
    setIsDocxBusy(true);
    try {
      const docxLib = await import('../lib/resumeDocx');
      if (activeTab === 'resume') {
        const blob = await docxLib.buildResumeDocxBlob(resumeDraft, templateId);
        docxLib.downloadBlob(blob, docxLib.docxFilename('Resume', resumeDraft.title, resumeDraft.name));
      } else if (coverDraft) {
        const blob = await docxLib.buildCoverLetterDocxBlob(coverDraft, tpl.accent);
        docxLib.downloadBlob(blob, docxLib.docxFilename('CoverLetter', coverDraft.roleTitle, coverDraft.signature));
      }
    } catch (e) {
      console.error('DOCX export failed', e);
      alert('Could not create the Word file. Please try again.');
    } finally {
      setIsDocxBusy(false);
    }
  };

  const handleDownloadInterviewDocx = async () => {
    if (!interviewKit) return;
    setIsKitDocxBusy(true);
    try {
      const lib = await import('../lib/interviewDocx');
      const { downloadBlob } = await import('../lib/resumeDocx');
      const blob = await lib.buildInterviewKitDocxBlob(interviewKit);
      downloadBlob(blob, lib.interviewKitFilename(interviewKit.candidateName, interviewKit.company));
    } catch (e) {
      console.error('Interview kit DOCX failed', e);
      alert('Could not create the Word file. Please try again.');
    } finally {
      setIsKitDocxBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 transition-colors duration-300 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Sparkles className="w-5 h-5 text-[var(--color-jobright-teal)] dark:text-neon-green" />
            Generated Application Package
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {isEditing
              ? 'Editing — click any field to change it. Add or remove skills, bullets, and paragraphs. Downloads use your edits.'
              : 'Tailored to this job. Review, edit if needed, then download as PDF.'}{' '}
            Match score:{' '}
            <span className="font-semibold text-[var(--color-jobright-teal)] dark:text-neon-green">
              {resumeDraft.matchScore}%
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v: string) => setActiveTab(v as 'resume' | 'cover' | 'interview' | 'outreach')}
          className="w-full"
        >
          {/* Sticky green switch, stays visible while the document scrolls. */}
          <TabsList className="sticky top-0 z-20 grid w-full grid-cols-4 mb-4 bg-emerald-600 dark:bg-neon-green border border-emerald-700 dark:border-neon-green">
            <TabsTrigger
              value="resume"
              className="text-white/90 dark:text-black/80 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-black dark:data-[state=active]:text-neon-green"
            >
              Resume
            </TabsTrigger>
            <TabsTrigger
              value="cover"
              disabled={!coverDraft}
              className="text-white/90 dark:text-black/80 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-black dark:data-[state=active]:text-neon-green"
            >
              Cover Letter
            </TabsTrigger>
            <TabsTrigger
              value="interview"
              disabled={!jobContext}
              className="text-white/90 dark:text-black/80 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-black dark:data-[state=active]:text-neon-green"
            >
              Interview Prep
            </TabsTrigger>
            <TabsTrigger
              value="outreach"
              className="text-white/90 dark:text-black/80 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-black dark:data-[state=active]:text-neon-green"
            >
              Outreach
            </TabsTrigger>
          </TabsList>

          {/* AI edit — apply a free-text instruction to the active document. */}
          {isEditing && (
            <div className="mb-3 rounded-lg border border-dashed border-emerald-300 dark:border-neon-green/40 bg-emerald-50/40 dark:bg-neon-green/5 px-3 py-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-neon-green shrink-0" />
                <input
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleRegenerate();
                    }
                  }}
                  disabled={isRegenerating}
                  placeholder={`Tell AI what to change to the ${
                    activeTab === 'cover' ? 'cover letter' : 'resume'
                  } (e.g. "make it more concise")`}
                  className="flex-1 bg-transparent text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
                />
                <Button
                  variant="primary"
                  onClick={handleRegenerate}
                  disabled={isRegenerating || !instruction.trim()}
                  className="flex items-center gap-1.5 !px-3 !py-1.5 text-sm"
                >
                  {isRegenerating ? (
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {isRegenerating ? 'Applying...' : 'Apply'}
                </Button>
              </div>
              {regenError && (
                <p className="text-xs text-red-600 mt-1">{regenError}</p>
              )}
            </div>
          )}

          {/* Formatting toolbar — bold/italic/underline the selected text. */}
          {isEditing && <FormatToolbar />}

          {/* Template picker (Resume tab only) — sets the look for preview + PDF.
              The chosen template's accent still styles the cover letter. */}
          {activeTab === 'resume' && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
              Template:
            </span>
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplateId(t.id)}
                title={t.blurb}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  templateId === t.id
                    ? 'bg-emerald-600 text-white border-emerald-600 dark:bg-neon-green dark:text-black dark:border-neon-green'
                    : 'bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-white/15 hover:border-emerald-400'
                }`}
              >
                {t.name}
              </button>
            ))}
            {isEditing && (
              <span className="text-[11px] text-gray-400">
                (applies when you finish editing / download)
              </span>
            )}
          </div>
          )}

          <TabsContent value="resume">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {isEditing ? (
                <ResumeSheet resume={resumeDraft} editing onChange={setResumeDraft} />
              ) : (
                <TemplateHtml css={tpl.css} body={tpl.resumeBody(resumeDraft)} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="cover">
            {coverDraft && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {isEditing ? (
                  <CoverLetterSheet letter={coverDraft} editing onChange={setCoverDraft} />
                ) : (
                  <TemplateHtml css={tpl.css} body={tpl.coverBody(coverDraft)} />
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="interview">
            {jobContext && (
              <InterviewKitPanel
                userId={jobContext.userId}
                jobId={jobContext.jobId}
                userJobId={jobContext.userJobId}
                jobTitle={jobContext.jobTitle}
                company={jobContext.company}
                jdText={jobContext.jdText}
                keySkills={jobContext.keySkills}
                editing={isEditing}
                kit={interviewKit}
                onKitChange={setInterviewKit}
              />
            )}
          </TabsContent>

          <TabsContent value="outreach">
            <OutreachPanel
              resume={resumeDraft}
              jobTitle={jobContext?.jobTitle || resumeDraft.title}
              company={jobContext?.company || ''}
            />
          </TabsContent>
        </Tabs>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
          <div className="flex gap-2">
            <Button
              variant={isEditing ? 'primary' : 'outline'}
              onClick={() => setIsEditing((e) => !e)}
              className="flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              {isEditing ? 'Done editing' : 'Edit'}
            </Button>
            {isEditing && (
              <Button
                variant="ghost"
                onClick={resetDrafts}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {activeTab === 'outreach' ? (
              // Outreach has its own per-message Copy + Download in the panel.
              null
            ) : activeTab === 'interview' ? (
              // Interview Prep: download the full kit as a DRC-format Word doc.
              <Button
                variant="primary"
                onClick={handleDownloadInterviewDocx}
                disabled={isKitDocxBusy || !interviewKit}
                className="flex items-center gap-2"
              >
                {isKitDocxBusy ? <Loader className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {isKitDocxBusy ? 'Preparing…' : 'Download Kit (.docx)'}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleDownloadDocx}
                  disabled={isDocxBusy}
                  className="flex items-center gap-2"
                >
                  {isDocxBusy ? <Loader className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Word (.docx)
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDownload}
                  disabled={isPdfBusy}
                  className="flex items-center gap-2"
                >
                  {isPdfBusy ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {isPdfBusy ? 'Preparing…' : 'PDF'}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ---------------------------------------------------------------------------
// Small inline-editable text helper
// ---------------------------------------------------------------------------

const EditableText: React.FC<{
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  className?: string; // applied to the read-only span
  inputClassName?: string; // extra classes for the input/textarea
  placeholder?: string;
}> = ({
  value,
  editing,
  onChange,
  multiline,
  rows,
  className,
  inputClassName,
  placeholder,
}) => {
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);
  const register = () => {
    if (ref.current) activeEditor.current = { el: ref.current, onChange };
  };

  if (!editing) {
    return <span className={className}>{value}</span>;
  }
  const base =
    'w-full bg-white border border-gray-300 rounded px-2 py-1 text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500';
  return multiline ? (
    <textarea
      ref={ref}
      value={value}
      rows={rows}
      placeholder={placeholder}
      onFocus={register}
      onChange={(e) => onChange(e.target.value)}
      className={`${base} resize-vertical ${inputClassName || ''}`}
    />
  ) : (
    <input
      ref={ref}
      value={value}
      placeholder={placeholder}
      onFocus={register}
      onChange={(e) => onChange(e.target.value)}
      className={`${base} ${inputClassName || ''}`}
    />
  );
};

const IconBtn: React.FC<{
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ onClick, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className="inline-flex items-center justify-center rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
  >
    {children}
  </button>
);

// ---------------------------------------------------------------------------
// Resume sheet (read + edit)
// ---------------------------------------------------------------------------

const ResumeSheet: React.FC<{
  resume: GeneratedResume;
  editing: boolean;
  onChange: (r: GeneratedResume) => void;
}> = ({ resume, editing, onChange }) => {
  const [newSkill, setNewSkill] = useState('');

  const update = (patch: Partial<GeneratedResume>) =>
    onChange({ ...resume, ...patch });
  const updateContact = (patch: Partial<GeneratedResume['contact']>) =>
    update({ contact: { ...resume.contact, ...patch } });
  const updateExp = (i: number, patch: Partial<GeneratedResume['experience'][number]>) =>
    update({
      experience: resume.experience.map((e, idx) =>
        idx === i ? { ...e, ...patch } : e,
      ),
    });
  const updateBullet = (i: number, j: number, val: string) =>
    updateExp(i, {
      bullets: resume.experience[i].bullets.map((b, bi) => (bi === j ? val : b)),
    });
  const addBullet = (i: number) =>
    updateExp(i, { bullets: [...resume.experience[i].bullets, 'New achievement with a metric.'] });
  const removeBullet = (i: number, j: number) =>
    updateExp(i, { bullets: resume.experience[i].bullets.filter((_, bi) => bi !== j) });
  const addExperience = () =>
    update({
      experience: [
        ...resume.experience,
        { company: 'Company', role: 'Role', dates: 'Year — Year', bullets: ['Achievement with a metric.'] },
      ],
    });
  const removeExperience = (i: number) =>
    update({ experience: resume.experience.filter((_, idx) => idx !== i) });
  const removeSkill = (i: number) =>
    update({ skills: resume.skills.filter((_, idx) => idx !== i) });
  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !resume.skills.includes(s)) update({ skills: [...resume.skills, s] });
    setNewSkill('');
  };
  const updateEdu = (i: number, patch: Partial<GeneratedResume['education'][number]>) =>
    update({
      education: resume.education.map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
    });
  const addEducation = () =>
    update({
      education: [...resume.education, { school: 'School', degree: 'Degree', dates: 'Year — Year' }],
    });
  const removeEducation = (i: number) =>
    update({ education: resume.education.filter((_, idx) => idx !== i) });

  const achievements = resume.achievements || [];
  const updateAch = (i: number, patch: Partial<{ title: string; detail: string }>) =>
    update({ achievements: achievements.map((a, idx) => (idx === i ? { ...a, ...patch } : a)) });
  const addAchievement = () =>
    update({ achievements: [...achievements, { title: 'Achievement', detail: '' }] });
  const removeAchievement = (i: number) =>
    update({ achievements: achievements.filter((_, idx) => idx !== i) });

  const highlights = resume.highlights || [];
  const updateHl = (i: number, patch: Partial<{ value: string; label: string }>) =>
    update({ highlights: highlights.map((h, idx) => (idx === i ? { ...h, ...patch } : h)) });
  const addHighlight = () =>
    update({ highlights: [...highlights, { value: '', label: '' }] });
  const removeHighlight = (i: number) =>
    update({ highlights: highlights.filter((_, idx) => idx !== i) });

  // Contact segments for the read-only view: email/linkedin/github render as
  // real links (linkedin/github show a short label, not the raw URL typed
  // into the edit field); phone/location stay plain text.
  const contactSegs: Array<{ text: string; href?: string }> = [
    resume.contact.email ? { text: resume.contact.email, href: `mailto:${resume.contact.email.trim()}` } : null,
    resume.contact.phone ? { text: resume.contact.phone } : null,
    resume.contact.location ? { text: resume.contact.location } : null,
    resume.contact.linkedin ? { text: 'LinkedIn', href: normUrl(resume.contact.linkedin) } : null,
    resume.contact.github ? { text: 'GitHub', href: normUrl(resume.contact.github) } : null,
  ].filter((s): s is { text: string; href?: string } => s !== null);

  return (
    <div className="p-9 text-gray-800">
      {/* Header */}
      <header className="text-center pb-4 mb-5 border-b-2 border-emerald-600">
        <EditableText
          value={resume.name}
          editing={editing}
          onChange={(v) => update({ name: v })}
          className="text-3xl font-bold tracking-tight text-gray-900"
          inputClassName="text-2xl font-bold text-center"
        />
        <div className="mt-1.5">
          <EditableText
            value={resume.title}
            editing={editing}
            onChange={(v) => update({ title: v })}
            className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700"
            inputClassName="text-center"
          />
        </div>
        {editing ? (
          <div className="grid grid-cols-2 gap-2 mt-3 max-w-md mx-auto">
            <input
              value={resume.contact.email || ''}
              onChange={(e) => updateContact({ email: e.target.value })}
              placeholder="Email"
              className="text-xs bg-white border border-gray-300 rounded px-2 py-1"
            />
            <input
              value={resume.contact.phone || ''}
              onChange={(e) => updateContact({ phone: e.target.value })}
              placeholder="Phone"
              className="text-xs bg-white border border-gray-300 rounded px-2 py-1"
            />
            <input
              value={resume.contact.location || ''}
              onChange={(e) => updateContact({ location: e.target.value })}
              placeholder="Location"
              className="text-xs bg-white border border-gray-300 rounded px-2 py-1"
            />
            <input
              value={resume.contact.linkedin || ''}
              onChange={(e) => updateContact({ linkedin: e.target.value })}
              placeholder="LinkedIn"
              className="text-xs bg-white border border-gray-300 rounded px-2 py-1"
            />
          </div>
        ) : (
          contactSegs.length > 0 && (
            <p className="text-xs text-gray-500 mt-2.5">
              {contactSegs.map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="mx-2">•</span>}
                  {s.href ? (
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline"
                    >
                      {s.text}
                    </a>
                  ) : (
                    s.text
                  )}
                </React.Fragment>
              ))}
            </p>
          )
        )}
      </header>

      {/* Summary */}
      <Section title="Professional Summary">
        <EditableText
          value={resume.summary}
          editing={editing}
          onChange={(v) => update({ summary: v })}
          multiline
          rows={4}
          className="text-[13px] leading-relaxed text-gray-700"
          inputClassName="text-[13px]"
        />
      </Section>

      {/* Skills */}
      <Section title="Core Skills">
        <div className="flex flex-wrap gap-1.5 items-center">
          {resume.skills.map((skill, i) => (
            <span
              key={`${skill}-${i}`}
              className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-900 border border-emerald-100 px-2.5 py-1 rounded-full"
            >
              {skill}
              {editing && (
                <IconBtn onClick={() => removeSkill(i)} title="Remove skill">
                  <X className="w-3 h-3" />
                </IconBtn>
              )}
            </span>
          ))}
          {editing && (
            <span className="inline-flex items-center gap-1">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Add skill"
                className="text-[11px] bg-white border border-gray-300 rounded-full px-2.5 py-1 w-28 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <IconBtn onClick={addSkill} title="Add skill">
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
              </IconBtn>
            </span>
          )}
        </div>
      </Section>

      {/* Experience */}
      <Section title="Experience">
        <div className="space-y-4">
          {resume.experience.map((exp, i) => (
            <div key={i} className={editing ? 'border border-gray-200 rounded-lg p-3' : ''}>
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex-1">
                  <EditableText
                    value={exp.role}
                    editing={editing}
                    onChange={(v) => updateExp(i, { role: v })}
                    className="font-semibold text-gray-900 text-[14px]"
                    inputClassName="font-semibold text-[14px]"
                  />
                </div>
                <div className={editing ? 'w-40' : ''}>
                  <EditableText
                    value={exp.dates}
                    editing={editing}
                    onChange={(v) => updateExp(i, { dates: v })}
                    className="text-[11px] text-gray-500 whitespace-nowrap"
                    inputClassName="text-[11px]"
                  />
                </div>
                {editing && (
                  <IconBtn onClick={() => removeExperience(i)} title="Remove role">
                    <X className="w-4 h-4" />
                  </IconBtn>
                )}
              </div>
              <div className="mb-1.5 mt-1">
                <EditableText
                  value={exp.company}
                  editing={editing}
                  onChange={(v) => updateExp(i, { company: v })}
                  className="text-[12px] italic text-gray-600"
                  inputClassName="text-[12px]"
                />
              </div>
              <ul className={editing ? 'space-y-1.5' : 'list-disc list-outside ml-4 space-y-1'}>
                {exp.bullets.map((b, j) => (
                  <li key={j} className={editing ? 'flex items-start gap-2' : 'text-[13px] text-gray-700 leading-snug'}>
                    {editing ? (
                      <>
                        <EditableText
                          value={b}
                          editing
                          onChange={(v) => updateBullet(i, j, v)}
                          multiline
                          rows={2}
                          inputClassName="flex-1 text-[13px]"
                        />
                        <IconBtn onClick={() => removeBullet(i, j)} title="Remove bullet">
                          <X className="w-3.5 h-3.5" />
                        </IconBtn>
                      </>
                    ) : (
                      b
                    )}
                  </li>
                ))}
              </ul>
              {editing && (
                <button
                  type="button"
                  onClick={() => addBullet(i)}
                  className="mt-2 inline-flex items-center gap-1 text-[12px] text-emerald-700 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add bullet
                </button>
              )}
            </div>
          ))}
        </div>
        {editing && (
          <button
            type="button"
            onClick={addExperience}
            className="mt-3 inline-flex items-center gap-1 text-[12px] text-emerald-700 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add experience
          </button>
        )}
      </Section>

      {/* Education */}
      <Section title="Education">
        <div className="space-y-1.5">
          {resume.education.map((edu, i) => (
            <div key={i} className="flex items-baseline justify-between gap-4">
              {editing ? (
                <>
                  <div className="flex flex-1 gap-2">
                    <input
                      value={edu.degree}
                      onChange={(e) => updateEdu(i, { degree: e.target.value })}
                      placeholder="Degree"
                      className="flex-1 text-[13px] bg-white border border-gray-300 rounded px-2 py-1"
                    />
                    <input
                      value={edu.school}
                      onChange={(e) => updateEdu(i, { school: e.target.value })}
                      placeholder="School"
                      className="flex-1 text-[13px] bg-white border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                  <input
                    value={edu.dates}
                    onChange={(e) => updateEdu(i, { dates: e.target.value })}
                    placeholder="Years"
                    className="w-28 text-[11px] bg-white border border-gray-300 rounded px-2 py-1"
                  />
                  <IconBtn onClick={() => removeEducation(i)} title="Remove education">
                    <X className="w-4 h-4" />
                  </IconBtn>
                </>
              ) : (
                <>
                  <span className="text-[13px]">
                    <span className="font-medium text-gray-900">{edu.degree}</span> — {edu.school}
                  </span>
                  <span className="text-[11px] text-gray-500 whitespace-nowrap">{edu.dates}</span>
                </>
              )}
            </div>
          ))}
        </div>
        {editing && (
          <button
            type="button"
            onClick={addEducation}
            className="mt-2 inline-flex items-center gap-1 text-[12px] text-emerald-700 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add education
          </button>
        )}
      </Section>

      {/* Highlights (metrics strip) */}
      <Section title="Highlights (metrics)">
        <div className="space-y-2">
          {highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={h.value}
                onChange={(e) => updateHl(i, { value: e.target.value })}
                placeholder="e.g. 30%"
                className="w-24 text-[13px] bg-white border border-gray-300 rounded px-2 py-1"
              />
              <input
                value={h.label}
                onChange={(e) => updateHl(i, { label: e.target.value })}
                placeholder="e.g. Cost Reduction"
                className="flex-1 text-[13px] bg-white border border-gray-300 rounded px-2 py-1"
              />
              <IconBtn onClick={() => removeHighlight(i)} title="Remove highlight">
                <X className="w-4 h-4" />
              </IconBtn>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addHighlight}
          className="mt-2 inline-flex items-center gap-1 text-[12px] text-emerald-700 hover:underline"
        >
          <Plus className="w-3.5 h-3.5" /> Add highlight
        </button>
      </Section>

      {/* Key Achievements */}
      <Section title="Key Achievements" last>
        <div className="space-y-2">
          {achievements.map((a, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1 space-y-1">
                <input
                  value={a.title}
                  onChange={(e) => updateAch(i, { title: e.target.value })}
                  placeholder="Achievement title"
                  className="w-full text-[13px] font-medium bg-white border border-gray-300 rounded px-2 py-1"
                />
                <textarea
                  value={a.detail}
                  onChange={(e) => updateAch(i, { detail: e.target.value })}
                  placeholder="One-line proof / detail"
                  rows={2}
                  className="w-full text-[13px] bg-white border border-gray-300 rounded px-2 py-1 resize-vertical"
                />
              </div>
              <IconBtn onClick={() => removeAchievement(i)} title="Remove achievement">
                <X className="w-4 h-4" />
              </IconBtn>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addAchievement}
          className="mt-2 inline-flex items-center gap-1 text-[12px] text-emerald-700 hover:underline"
        >
          <Plus className="w-3.5 h-3.5" /> Add achievement
        </button>
      </Section>
    </div>
  );
};

const Section: React.FC<{
  title: string;
  last?: boolean;
  children: React.ReactNode;
}> = ({ title, last, children }) => (
  <section className={last ? '' : 'mb-5'}>
    <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-800 pb-1 mb-2.5 border-b border-gray-200">
      {title}
    </h2>
    {children}
  </section>
);

// ---------------------------------------------------------------------------
// Cover letter sheet (read + edit)
// ---------------------------------------------------------------------------

const CoverLetterSheet: React.FC<{
  letter: CoverLetter;
  editing: boolean;
  onChange: (l: CoverLetter) => void;
}> = ({ letter, editing, onChange }) => {
  const update = (patch: Partial<CoverLetter>) => onChange({ ...letter, ...patch });
  const updatePara = (i: number, val: string) =>
    update({ paragraphs: letter.paragraphs.map((p, idx) => (idx === i ? val : p)) });
  const addPara = () => update({ paragraphs: [...letter.paragraphs, 'New paragraph.'] });
  const removePara = (i: number) =>
    update({ paragraphs: letter.paragraphs.filter((_, idx) => idx !== i) });

  return (
    <div className="p-10 text-gray-800">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex-1">
          <EditableText
            value={letter.signature}
            editing={editing}
            onChange={(v) => update({ signature: v })}
            className="font-semibold text-gray-900"
            inputClassName="font-semibold"
          />
          <div className="mt-0.5 text-xs text-gray-500">
            {editing ? (
              <div className="flex gap-2 mt-1">
                <input
                  value={letter.roleTitle}
                  onChange={(e) => update({ roleTitle: e.target.value })}
                  placeholder="Role"
                  className="text-xs bg-white border border-gray-300 rounded px-2 py-1"
                />
                <input
                  value={letter.company}
                  onChange={(e) => update({ company: e.target.value })}
                  placeholder="Company"
                  className="text-xs bg-white border border-gray-300 rounded px-2 py-1"
                />
              </div>
            ) : (
              <>Application for {letter.roleTitle} — {letter.company}</>
            )}
          </div>
        </div>
        <div className="w-40">
          <EditableText
            value={letter.date}
            editing={editing}
            onChange={(v) => update({ date: v })}
            className="text-xs text-gray-500"
            inputClassName="text-xs text-right"
          />
        </div>
      </div>

      <div className="mb-4">
        <EditableText
          value={letter.greeting}
          editing={editing}
          onChange={(v) => update({ greeting: v })}
          className="text-sm text-gray-800"
          inputClassName="text-sm"
        />
      </div>

      <div className="space-y-3.5">
        {letter.paragraphs.map((p, i) => (
          <div key={i} className={editing ? 'flex items-start gap-2' : ''}>
            <EditableText
              value={p}
              editing={editing}
              onChange={(v) => updatePara(i, v)}
              multiline
              rows={3}
              className="text-[13px] leading-relaxed text-gray-700"
              inputClassName="text-[13px]"
            />
            {editing && (
              <IconBtn onClick={() => removePara(i)} title="Remove paragraph">
                <X className="w-3.5 h-3.5" />
              </IconBtn>
            )}
          </div>
        ))}
        {editing && (
          <button
            type="button"
            onClick={addPara}
            className="inline-flex items-center gap-1 text-[12px] text-emerald-700 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add paragraph
          </button>
        )}
      </div>

      <div className="mt-6">
        <EditableText
          value={letter.closing}
          editing={editing}
          onChange={(v) => update({ closing: v })}
          className="text-sm text-gray-800"
          inputClassName="text-sm"
        />
        <div className="mt-1">
          <EditableText
            value={letter.signature}
            editing={editing}
            onChange={(v) => update({ signature: v })}
            className="text-sm font-semibold text-gray-900"
            inputClassName="text-sm font-semibold"
          />
        </div>
      </div>
    </div>
  );
};

// Renders a template's self-contained HTML (read-only) for the on-screen
// preview. Only the active template's CSS is mounted at a time.
const TemplateHtml: React.FC<{ css: string; body: string }> = ({ css, body }) => (
  // Padding matches the PDF page margin (14mm) so the preview == the download.
  <div className="bg-white p-6 sm:p-[14mm]">
    <style dangerouslySetInnerHTML={{ __html: css }} />
    <div dangerouslySetInnerHTML={{ __html: body }} />
  </div>
);

export default GeneratedResumeDialog;
