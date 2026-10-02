import type {
  GeneratedResume,
  CoverLetter,
  ResumeTemplateId,
} from './resumeTypes';
import { formatResumeDateRange } from './resumeDate';

// Four fully-separate resume templates. Each renders to a self-contained HTML
// string (with inline CSS) that is used BOTH for the on-screen preview
// (injected read-only) and the PDF print window. Only one template's CSS is in
// the DOM at a time, so class names (.rt-*, .rtc-*) are reused across templates.

export interface ResumeTemplate {
  id: ResumeTemplateId;
  name: string;
  blurb: string;
  accent: string;
  css: string;
  resumeBody: (r: GeneratedResume) => string;
  coverBody: (l: CoverLetter) => string;
}

const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const meaningful = (s: unknown) => {
  const normalized = String(s ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
  return Boolean(normalized) && !['na', 'nill', 'nil', 'none', 'no', 'notavailable', 'notapplicable', 'notspecified'].includes(normalized);
};

// Render emphasis in AI/user text safely. We HTML-escape first (so no raw HTML
// can inject), then re-enable ONLY: markdown **bold** / *italic*, and a tiny
// whitelist of tags the model sometimes emits as HTML (<b> <strong> <i> <em>,
// with no attributes). Anything else stays escaped/literal.
const mdInline = (s: unknown) => {
  let t = esc(s);
  t = t.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
  t = t.replace(/&lt;(\/?)(b|strong|i|em|u)&gt;/gi, '<$1$2>');
  return t;
};

// When a section has no real profile data we leave it blank — we never
// fabricate content, and we don't show a placeholder.
const NO_DATA = '';

const summaryHtml = (r: GeneratedResume) =>
  r.summary && r.summary.trim() ? mdInline(r.summary) : NO_DATA;

// Renders a `.rt-h2` section only when it has content, so an empty section
// leaves no orphan heading. `wrap` optionally wraps the body.
const h2sec = (title: string, body: string, wrap?: (b: string) => string) =>
  body && body.trim() ? `<div class="rt-h2">${title}</div>${wrap ? wrap(body) : body}` : '';

// Normalise a profile URL: keep http(s) as-is, else prepend https://.
export const normUrl = (v: string) => {
  const s = String(v || '').trim();
  return /^https?:\/\//i.test(s) ? s : `https://${s.replace(/^\/+/, '')}`;
};

const explicitUrl = (v: unknown) => {
  const s = String(v || '').trim();
  return /^(https?:\/\/|www\.)/i.test(s) ? normUrl(s) : null;
};

// Safe href attribute value — no quote/space breakout from the attribute.
const hrefAttr = (s: string) => esc(s).replace(/"/g, '%22').replace(/\s/g, '%20');

// Find bare URLs in free text (e.g. an accomplishment written as "Published
// paper — https://doi.org/...") and turn them into real, clickable links —
// same treatment as the LinkedIn/GitHub contact links, but colored like a
// standard hyperlink so a URL embedded in body text reads as one. Runs
// mdInline (escaping + **bold**/*italic*) on the surrounding plain text so
// existing emphasis still works; only the URL itself becomes a link.
const URL_RE = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
const linkify = (s: unknown) => {
  const text = String(s ?? '');
  let out = '';
  let last = 0;
  let m: RegExpExecArray | null;
  URL_RE.lastIndex = 0;
  while ((m = URL_RE.exec(text))) {
    let url = m[0];
    let trail = '';
    // Don't swallow trailing sentence punctuation into the link.
    while (url && /[.,;:!?'")\]]$/.test(url)) {
      trail = url.slice(-1) + trail;
      url = url.slice(0, -1);
    }
    if (!url) continue;
    out += mdInline(text.slice(last, m.index));
    out += `<a class="rt-link rt-link-url" href="${hrefAttr(normUrl(url))}" target="_blank" rel="noopener noreferrer">${esc(url)}</a>`;
    out += esc(trail);
    last = m.index + m[0].length;
  }
  out += mdInline(text.slice(last));
  return out;
};

// Contact items in order, each with an optional link target. email/linkedin/
// github are clickable; phone/location stay plain text.
const contactSegments = (r: GeneratedResume): Array<{ d: string; href: string | null; blue?: boolean }> => {
  const c = r.contact;
  const segs: Array<{ d: string; href: string | null; blue?: boolean }> = [];
  if (c.email) segs.push({ d: c.email, href: `mailto:${c.email.trim()}` });
  if (c.phone) segs.push({ d: c.phone, href: null });
  if (c.location) segs.push({ d: c.location, href: null });
  // Link text is a short platform label, not the raw URL the user typed in —
  // the href still carries the real destination.
  const linkedin = explicitUrl(c.linkedin);
  const github = explicitUrl(c.github);
  if (linkedin) segs.push({ d: 'LinkedIn', href: linkedin });
  if (github) segs.push({ d: 'GitHub', href: github });
  // Other Accomplishments links (work sample, publication, portfolio, ...) —
  // same treatment as LinkedIn/GitHub, colored like a standard hyperlink.
  for (const l of c.links || []) {
    const href = explicitUrl(l?.url);
    if (href) segs.push({ d: l.label || 'Link', href, blue: true });
  }
  return segs;
};

const segHtml = (s: { d: string; href: string | null; blue?: boolean }) =>
  s.href
    ? `<a class="rt-link${s.blue ? ' rt-link-url' : ''}" href="${hrefAttr(s.href)}" target="_blank" rel="noopener noreferrer">${esc(s.d)}</a>`
    : esc(s.d);

const contactLine = (r: GeneratedResume) =>
  contactSegments(r).map(segHtml).join('&nbsp;&nbsp;•&nbsp;&nbsp;');

const expItems = (r: GeneratedResume) =>
  r.experience && r.experience.some((e) => meaningful(e.role) || meaningful(e.company) || e.bullets?.some(meaningful))
    ? r.experience
    .filter((e) => meaningful(e.role) || meaningful(e.company) || e.bullets?.some(meaningful))
    .map(
      (e) => `
      <div class="rt-exp">
        <div class="rt-row">
          <span class="rt-role">${esc(e.role)}<span class="rt-co"> · ${esc(e.company)}</span></span>
          <span class="rt-dates">${esc(formatResumeDateRange(e.dates))}</span>
        </div>
        <ul>${(e.bullets || []).filter(meaningful).map((b) => `<li>${mdInline(b)}</li>`).join('')}</ul>
      </div>`,
    )
    .join('')
    : NO_DATA;

const eduRows = (r: GeneratedResume) =>
  r.education && r.education.some((e) => meaningful(e.degree) || meaningful(e.school))
    ? r.education
    .filter((e) => meaningful(e.degree) || meaningful(e.school))
    .map(
      (e) => `
      <div class="rt-edu-row">
        <span><strong>${esc(e.degree)}</strong> — ${esc(e.school)}</span>
        <span class="rt-dates">${esc(formatResumeDateRange(e.dates))}</span>
      </div>`,
    )
    .join('')
    : NO_DATA;

// Courses / certifications from the profile, rendered last. Name links out when
// the cert has a URL; otherwise bold. "issuer" and "date" are optional.
const certItems = (r: GeneratedResume) =>
  r.certifications && r.certifications.some((c) => meaningful(c.name))
    ? r.certifications
        .filter((c) => meaningful(c.name))
        .map(
          (c) => `
      <div class="rt-edu-row">
        <span>${
          c.url
            ? `<a class="rt-link" href="${hrefAttr(normUrl(c.url))}" target="_blank" rel="noopener noreferrer">${esc(c.name)}</a>`
            : `<strong>${esc(c.name)}</strong>`
        }${c.issuer ? ` — ${esc(c.issuer)}` : ''}</span>
        <span class="rt-dates">${esc(c.date || '')}</span>
      </div>`,
        )
        .join('')
    : NO_DATA;

// The inner span + CSS nudge in .rt-skill-t counteracts a html2canvas quirk:
// it consistently rasterizes text ~7px below center inside a small
// bordered/padded inline-block pill, regardless of surrounding content
// (verified empirically) — the outer span keeps the border/background
// exactly where measured, only the text glyph run is shifted back up.
const skillPills = (r: GeneratedResume) =>
  r.skills && r.skills.some(meaningful)
    ? r.skills
        .filter(meaningful)
        .map((s) => `<span class="rt-skill"><span class="rt-skill-t">${esc(s)}</span></span>`)
        .join('')
    : NO_DATA;

const stripHtml = (r: GeneratedResume) =>
  r.highlights && r.highlights.some((h) => meaningful(h.value) || meaningful(h.label))
    ? `<div class="rt-strip">${r.highlights
        .filter((h) => meaningful(h.value) || meaningful(h.label))
        .map(
          (h) =>
            `<div class="rt-stat"><div class="v">${mdInline(h.value)}</div><div class="l">${mdInline(h.label)}</div></div>`,
        )
        .join('')}</div>`
    : '';

// Projects from the profile (Early Career template). Same visual structure as
// experience: "Title — dates", optional description, bullets.
const projItems = (r: GeneratedResume) =>
  r.projects && r.projects.some((p) => meaningful(p.title) || meaningful(p.description) || p.bullets?.some(meaningful))
    ? r.projects
        .filter((p) => meaningful(p.title) || meaningful(p.description) || p.bullets?.some(meaningful))
        .map(
          (p) => `
      <div class="rt-exp">
        <div class="rt-row">
          <span class="rt-role">${esc(p.title)}</span>
          <span class="rt-dates">${esc(formatResumeDateRange(p.dates))}</span>
        </div>
        ${p.description ? `<div class="rt-proj-desc">${mdInline(p.description)}</div>` : ''}
        ${p.bullets && p.bullets.some(meaningful) ? `<ul>${p.bullets.filter(meaningful).map((b) => `<li>${mdInline(b)}</li>`).join('')}</ul>` : ''}
      </div>`,
        )
        .join('')
    : NO_DATA;

const achHtml = (r: GeneratedResume, heading = 'Key Achievements') =>
  r.achievements && r.achievements.some((a) => meaningful(a.title) || meaningful(a.detail))
    ? `<div class="rt-h2">${heading}</div><ul class="rt-ach-list">${r.achievements
        .filter((a) => meaningful(a.title) || meaningful(a.detail))
        .map(
          (a) =>
            `<li><strong>${linkify(a.title)}</strong>${a.detail ? ` — ${linkify(a.detail)}` : ''}</li>`,
        )
        .join('')}</ul>`
    : '';

// --- Shared cover letter (accent-matched, one structure for all templates) ---

const coverCss = (accent: string) => `
  .rtc-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:22px; border-bottom:2px solid ${accent}; padding-bottom:12px; }
  .rtc-name { font-size:18px; font-weight:800; color:#111827; }
  .rtc-sub { color:#6b7280; font-size:12px; margin-top:3px; }
  .rtc-date { color:#6b7280; font-size:12px; }
  .rtc-greet { font-size:13.5px; color:#1f2937; margin-bottom:14px; }
  .rtc-p { font-size:13px; line-height:1.65; color:#374151; margin:0 0 13px; }
  .rtc-close { margin-top:20px; }
  .rtc-close .s1 { font-size:13.5px; color:#1f2937; }
  .rtc-close .s2 { font-size:13.5px; font-weight:800; color:#111827; margin-top:3px; }
`;

const coverBody = (l: CoverLetter) => `
  <div class="rtc-head">
    <div>
      <div class="rtc-name">${esc(l.signature)}</div>
      <div class="rtc-sub">Application for ${esc(l.roleTitle)} — ${esc(l.company)}</div>
    </div>
    <div class="rtc-date">${esc(l.date)}</div>
  </div>
  <div class="rtc-greet">${esc(l.greeting)}</div>
  ${l.paragraphs.map((p) => `<div class="rtc-p">${mdInline(p)}</div>`).join('')}
  <div class="rtc-close">
    <div class="s1">${esc(l.closing)}</div>
    <div class="s2">${esc(l.signature)}</div>
  </div>
`;

const BASE = `
  .rt, .rt * { box-sizing:border-box; }
  /* Reset UA default margins so the PDF (print window) matches the in-app
     preview; explicit .rt-* rules below re-apply intentional spacing. */
  .rt h1, .rt h2, .rt h3, .rt h4, .rt p, .rt ul, .rt ol, .rt li { margin:0; }
  .rt { font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif; color:#374151; line-height:1.4; }
  .rt-dates { color:#6b7280; font-size:10.5px; white-space:nowrap; }
  .rt-exp { margin-bottom:10px; page-break-inside:avoid; break-inside:avoid; }
  .rt-row { display:flex; justify-content:space-between; align-items:baseline; gap:12px; }
  .rt-role { font-weight:700; color:#111827; font-size:13px; }
  /* Custom bullet via ::before instead of native list-style: html2canvas
     positions a real disc marker inconsistently (it can render floating
     above the text baseline instead of centered on the line). */
  .rt-exp ul { margin:3px 0 0; padding-left:18px; list-style:none; }
  .rt-exp li { font-size:12px; line-height:1.4; margin-bottom:2px; position:relative; page-break-inside:avoid; break-inside:avoid; }
  .rt-exp li::before { content:"•"; position:absolute; left:-14px; color:#374151; }
  .rt-edu-row { display:flex; justify-content:space-between; font-size:12px; margin-bottom:3px; page-break-inside:avoid; break-inside:avoid; }
  .rt-h2 { page-break-after:avoid; break-after:avoid; }
  .rt-skills { page-break-inside:avoid; break-inside:avoid; }
  .rt-sum { font-size:12.5px; line-height:1.55; }
  .rt-nodata { color:#9ca3af; font-style:italic; font-size:12px; }
  .rt-link { color:inherit; text-decoration:underline; }
  .rt-link-url { color:#2563EB; }
  .rt-ach-list { margin:3px 0 0; padding-left:18px; list-style:none; }
  .rt-ach-list li { font-size:12px; line-height:1.45; margin-bottom:3px; position:relative; color:#374151; }
  .rt-ach-list li::before { content:"•"; position:absolute; left:-14px; color:#374151; }
  .rt-skill-t { display:inline-block; position:relative; top:-7.25px; }
`;

// ============================ 1. MODERN (green) ============================
const modern: ResumeTemplate = {
  id: 'modern',
  name: 'Modern',
  blurb: 'Green accents, metrics strip, achievements grid',
  accent: '#047857',
  css: `
  ${BASE}
  .rt-name { font-size:26px; font-weight:800; color:#111827; letter-spacing:-.01em; }
  .rt-title { color:#047857; font-weight:700; font-size:12px; text-transform:uppercase; letter-spacing:.12em; margin-top:4px; }
  .rt-contact { color:#6b7280; font-size:11px; margin-top:6px; }
  .rt-strip { display:flex; margin:14px 0 4px; border:1px solid #d1fae5; border-radius:8px; overflow:hidden; }
  .rt-stat { flex:1; padding:8px 10px; border-right:1px solid #ecfdf5; }
  .rt-stat:last-child { border-right:0; }
  .rt-stat .v { color:#047857; font-weight:800; font-size:16px; }
  .rt-stat .l { color:#6b7280; font-size:9px; text-transform:uppercase; letter-spacing:.04em; margin-top:1px; }
  .rt-h2 { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#065f46; border-bottom:2px solid #047857; padding-bottom:6px; margin:15px 0 8px; }
  .rt-co { color:#047857; font-weight:600; }
  .rt-skill { display:inline-block; font-size:10.5px; line-height:1; background:#ecfdf5; color:#065f46; border:1px solid #d1fae5; padding:4px 8px; border-radius:999px; margin:0 5px 5px 0; }
  .rt-ach { display:grid; grid-template-columns:1fr 1fr; gap:8px 18px; }
  .rt-ach .t { font-weight:700; color:#111827; font-size:11.5px; }
  .rt-ach .d { color:#6b7280; font-size:11px; line-height:1.4; }
  ${coverCss('#047857')}
  `,
  resumeBody: (r) => `<div class="rt">
    <div class="rt-name">${esc(r.name)}</div>
    <div class="rt-title">${esc(r.title)}</div>
    <div class="rt-contact">${contactLine(r)}</div>
    ${h2sec('Professional Summary', summaryHtml(r), (b) => `<div class="rt-sum">${b}</div>`)}
    ${stripHtml(r)}
    ${h2sec('Core Skills', skillPills(r), (b) => `<div class="rt-skills">${b}</div>`)}
    ${h2sec('Experience', expItems(r))}
    ${achHtml(r)}
    ${h2sec('Education', eduRows(r))}
    ${h2sec('Certifications', certItems(r))}
  </div>`,
  coverBody,
};

// ============================ 2. CLASSIC (blue, centered) ============================
const classic: ResumeTemplate = {
  id: 'classic',
  name: 'Classic',
  blurb: 'Centered, minimal, most ATS-friendly',
  accent: '#1e3a8a',
  css: `
  ${BASE}
  .rt-name { text-align:center; font-size:24px; font-weight:700; color:#1e3a8a; letter-spacing:.02em; }
  .rt-title { text-align:center; color:#2563eb; font-size:12px; margin-top:3px; }
  .rt-contact { text-align:center; color:#4b5563; font-size:11px; margin-top:5px; }
  .rt-h2 { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#1e3a8a; border-bottom:1px solid #93c5fd; padding-bottom:5px; margin:14px 0 7px; }
  .rt-co { color:#4b5563; font-style:italic; font-weight:400; }
  .rt-skills-line { font-size:12px; line-height:1.6; }
  ${coverCss('#1e3a8a')}
  `,
  resumeBody: (r) => `<div class="rt">
    <div class="rt-name">${esc(r.name)}</div>
    <div class="rt-title">${esc(r.title)}</div>
    <div class="rt-contact">${contactLine(r)}</div>
    ${h2sec('Professional Summary', summaryHtml(r), (b) => `<div class="rt-sum">${b}</div>`)}
    ${h2sec('Skills', r.skills && r.skills.some(meaningful) ? r.skills.filter(meaningful).map(esc).join(' &nbsp;·&nbsp; ') : '', (b) => `<div class="rt-skills-line">${b}</div>`)}
    ${h2sec('Experience', expItems(r))}
    ${h2sec('Education', eduRows(r))}
    ${h2sec('Certifications', certItems(r))}
  </div>`,
  coverBody,
};

// ============================ 3. CORPORATE (navy header band) ============================
const corporate: ResumeTemplate = {
  id: 'corporate',
  name: 'Corporate',
  blurb: 'Dark header band + competencies grid',
  accent: '#0f2440',
  css: `
  ${BASE}
  .rt, .rt * { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .rt-band { background:#0f2440; color:#fff; text-align:center; padding:16px 18px; border-radius:3px; }
  .rt-band .n { font-size:22px; font-weight:800; letter-spacing:.03em; }
  .rt-band .t { color:#cbd5e1; font-size:12px; margin-top:4px; }
  .rt-band .c { color:#94a3b8; font-size:10.5px; margin-top:6px; }
  .rt-h2 { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#0f2440; border-bottom:1px solid #cbd5e1; padding-bottom:6px; margin:15px 0 8px; }
  .rt-co { color:#334155; font-weight:600; }
  .rt-grid { display:grid; grid-template-columns:1fr 1fr 1fr; border-top:1px solid #e5e7eb; border-left:1px solid #e5e7eb; }
  .rt-grid .cell { padding:5px 9px; border-right:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; font-size:11px; color:#334155; }
  .rt-grid .cell::before { content:"▸ "; color:#0f2440; }
  ${coverCss('#0f2440')}
  `,
  resumeBody: (r) => `<div class="rt">
    <div class="rt-band">
      <div class="n">${esc(r.name)}</div>
      <div class="t">${esc(r.title)}</div>
      <div class="c">${contactLine(r)}</div>
    </div>
    ${h2sec('Professional Summary', summaryHtml(r), (b) => `<div class="rt-sum">${b}</div>`)}
    ${h2sec('Core Competencies', r.skills && r.skills.some(meaningful) ? `<div class="rt-grid">${r.skills.filter(meaningful).map((s) => `<div class="cell">${esc(s)}</div>`).join('')}</div>` : '')}
    ${h2sec('Professional Experience', expItems(r))}
    ${achHtml(r)}
    ${h2sec('Education', eduRows(r))}
    ${h2sec('Certifications', certItems(r))}
  </div>`,
  coverBody,
};

// ============================ 4. SIDEBAR (two-column dark sidebar) ============================
const sidebar: ResumeTemplate = {
  id: 'sidebar',
  name: 'Sidebar',
  blurb: 'Two-column with dark sidebar (best for human review)',
  accent: '#0d9488',
  css: `
  ${BASE}
  .rt, .rt * { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .rt-wrap { display:flex; background:linear-gradient(to right,#0f2440 0,#0f2440 33%,#fff 33%,#fff 100%); border-radius:3px; overflow:hidden; }
  .rt-side { width:33%; padding:16px 14px; color:#e2e8f0; }
  .rt-main { width:67%; padding:16px 18px; }
  .rt-side .n { color:#fff; font-size:19px; font-weight:800; line-height:1.1; }
  .rt-side .t { color:#5eead4; font-size:10.5px; text-transform:uppercase; letter-spacing:.06em; margin-top:5px; }
  .rt-side h3 { color:#5eead4; font-size:10px; text-transform:uppercase; letter-spacing:.08em; margin:15px 0 5px; border-bottom:1px solid rgba(94,234,212,.3); padding-bottom:3px; }
  .rt-side .it { font-size:10.5px; color:#cbd5e1; margin-bottom:3px; line-height:1.35; }
  .rt-main h2 { color:#0f2440; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; border-bottom:2px solid #0d9488; padding-bottom:5px; margin:0 0 7px; }
  .rt-main h2.mt { margin-top:14px; }
  .rt-co { color:#0d9488; font-weight:600; }
  .rt-ach { display:grid; grid-template-columns:1fr 1fr; gap:7px 14px; }
  .rt-ach .t { font-weight:700; color:#111827; font-size:11px; }
  .rt-ach .d { color:#6b7280; font-size:10.5px; line-height:1.35; }
  ${coverCss('#0d9488')}
  `,
  resumeBody: (r) => {
    const contactItems = contactSegments(r)
      .map((s) => `<div class="it">${segHtml(s)}</div>`)
      .join('');
    return `<div class="rt"><div class="rt-wrap">
      <div class="rt-side">
        <div class="n">${esc(r.name)}</div>
        <div class="t">${esc(r.title)}</div>
        <h3>Contact</h3>${contactItems}
        ${r.skills && r.skills.some(meaningful) ? `<h3>Skills</h3>${r.skills.filter(meaningful).map((s) => `<div class="it">${esc(s)}</div>`).join('')}` : ''}
      </div>
      <div class="rt-main">
        ${summaryHtml(r) ? `<h2>Summary</h2><div class="rt-sum">${summaryHtml(r)}</div>` : ''}
        ${expItems(r) ? `<h2 class="mt">Experience</h2>${expItems(r)}` : ''}
        ${r.achievements && r.achievements.length ? `<h2 class="mt">Key Achievements</h2><ul class="rt-ach-list">${r.achievements.map((a) => `<li><strong>${linkify(a.title)}</strong>${a.detail ? ` — ${linkify(a.detail)}` : ''}</li>`).join('')}</ul>` : ''}
        ${eduRows(r) ? `<h2 class="mt">Education</h2>${eduRows(r)}` : ''}
        ${certItems(r) ? `<h2 class="mt">Certifications</h2>${certItems(r)}` : ''}
      </div>
    </div></div>`;
  },
  coverBody,
};

// ============ 5 & 6. CAREER-STAGE (TechTalk CV structures) ============
// Two single-column templates keyed by seniority (from the TechTalk CV doc):
// "Early Career" (< 5 yrs) and "Senior" (5+ yrs, adds Key Achievements). They
// follow the SAME design language as the other four (system sans-serif, accent-
// underlined section headings, metrics strip, skill pills) — parameterised by
// accent, mirroring the `modern` template spec — each with its own on-brand
// colour. Reuse the shared body helpers.
const cleanCss = (accent: string, dark: string, pillBg: string, pillBorder: string) => `
  ${BASE}
  .rt-name { font-size:26px; font-weight:800; color:#111827; letter-spacing:-.01em; }
  .rt-title { color:${accent}; font-weight:700; font-size:12px; text-transform:uppercase; letter-spacing:.12em; margin-top:4px; }
  .rt-contact { color:#6b7280; font-size:11px; margin-top:6px; }
  .rt-strip { display:flex; margin:14px 0 4px; border:1px solid ${pillBorder}; border-radius:8px; overflow:hidden; }
  .rt-stat { flex:1; padding:8px 10px; border-right:1px solid ${pillBg}; }
  .rt-stat:last-child { border-right:0; }
  .rt-stat .v { color:${accent}; font-weight:800; font-size:16px; }
  .rt-stat .l { color:#6b7280; font-size:9px; text-transform:uppercase; letter-spacing:.04em; margin-top:1px; }
  .rt-h2 { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:${dark}; border-bottom:2px solid ${accent}; padding-bottom:6px; margin:15px 0 8px; }
  .rt-co { color:${accent}; font-weight:600; }
  .rt-skill { display:inline-block; font-size:10.5px; line-height:1; background:${pillBg}; color:${dark}; border:1px solid ${pillBorder}; padding:4px 8px; border-radius:999px; margin:0 5px 5px 0; }
  .rt-proj-desc { font-size:12px; color:#374151; margin:2px 0 1px; font-style:italic; }
  ${coverCss(accent)}
`;

const atsEarly: ResumeTemplate = {
  id: 'ats-early',
  name: 'Early Career',
  blurb: 'Under 5 yrs — summary, expertise, experience (single column)',
  accent: '#2563EB',
  css: cleanCss('#2563EB', '#1E40AF', '#EFF6FF', '#BFDBFE'),
  resumeBody: (r) => `<div class="rt">
    <div class="rt-name">${esc(r.name)}</div>
    <div class="rt-title">${esc(r.title)}</div>
    <div class="rt-contact">${contactLine(r)}</div>
    ${h2sec('Professional Summary', summaryHtml(r), (b) => `<div class="rt-sum">${b}</div>`)}
    ${h2sec('Areas of Expertise', skillPills(r), (b) => `<div class="rt-skills">${b}</div>`)}
    ${stripHtml(r)}
    ${h2sec('Projects', projItems(r))}
    ${h2sec('Professional Experience', expItems(r))}
    ${h2sec('Education', eduRows(r))}
    ${h2sec('Certifications', certItems(r))}
  </div>`,
  coverBody,
};

const atsSenior: ResumeTemplate = {
  id: 'ats-senior',
  name: 'Senior',
  blurb: '5+ yrs — adds a Key Achievements section (single column)',
  accent: '#B45309',
  css: cleanCss('#B45309', '#92400E', '#FFF7ED', '#FED7AA'),
  resumeBody: (r) => `<div class="rt">
    <div class="rt-name">${esc(r.name)}</div>
    <div class="rt-title">${esc(r.title)}</div>
    <div class="rt-contact">${contactLine(r)}</div>
    ${h2sec('Professional Summary', summaryHtml(r), (b) => `<div class="rt-sum">${b}</div>`)}
    ${h2sec('Areas of Expertise', skillPills(r), (b) => `<div class="rt-skills">${b}</div>`)}
    ${stripHtml(r)}
    ${h2sec('Projects', projItems(r))}
    ${achHtml(r, 'Key Achievements')}
    ${h2sec('Professional Experience', expItems(r))}
    ${h2sec('Education', eduRows(r))}
    ${h2sec('Certifications', certItems(r))}
  </div>`,
  coverBody,
};

export const TEMPLATES: ResumeTemplate[] = [modern, classic, corporate, sidebar, atsEarly, atsSenior];

export function getTemplate(id: ResumeTemplateId): ResumeTemplate {
  return TEMPLATES.find((t) => t.id === id) || modern;
}

// Wrap a body + css into a full printable HTML document.
// @page margin (not body padding) so EVERY page — including continuation pages —
// gets a proper top/bottom margin and no content is cut off (BUG-002). The
// downside is the browser may print its own header/footer in that margin; users
// can turn that off in the print dialog, or use the .docx export (which also
// repeats the name/contact header on page 2+).
export function buildPrintDoc(css: string, body: string, title: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${esc(title)}</title>
<style>@page{size:A4;margin:14mm;} html,body{margin:0;padding:0;} ${css}</style></head>
<body>${body}</body></html>`;
}
