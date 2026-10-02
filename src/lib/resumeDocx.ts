import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  BorderStyle,
  TabStopType,
  TabStopPosition,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  AlignmentType,
  ExternalHyperlink,
} from 'docx';
import type { GeneratedResume, CoverLetter, ResumeTemplateId } from './resumeTypes';
import { formatResumeDateRange } from './resumeDate';

// Builds an editable Word (.docx) from the generated resume/cover letter.
// The layout mirrors the SELECTED template's colours + structure so the Word
// download looks like the on-screen preview / PDF (Modern = green; Classic =
// centered blue; Corporate = navy header band; Sidebar = dark two-column).
// Word also gives proper per-page margins + a repeating header (BUG-002) and an
// editable format users can open in Word / Google Docs (BUG-003).

// Strip our inline markdown/HTML emphasis to plain text for Word (users can
// re-bold in Word if they want).
const clean = (s: unknown): string =>
  String(s ?? '')
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '');

const meaningful = (s: unknown) => {
  const normalized = clean(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
  return Boolean(normalized) && !['na', 'nill', 'nil', 'none', 'no', 'notavailable', 'notapplicable', 'notspecified'].includes(normalized);
};

const MARGIN = 1080; // 0.75 inch in twips (1 inch = 1440)
const GREY = '6B7280';
const INK = '111827';
const BODY = '374151';

interface SkillPills {
  bg: string;
  color: string;
  border: string;
}

// Per-template palette + structure flags, matching src/lib/resumeTemplates.ts.
interface TplStyle {
  accent: string; // section-heading underline + role/company accent
  heading: string; // section-heading text colour
  skillHeading?: string;
  pills?: SkillPills; // Core Skills / Areas of Expertise chips (matches preview)
  centered?: boolean; // Classic: centered header
  band?: boolean; // Corporate: dark header band
  sidebar?: boolean; // Sidebar: dark two-column layout
  titleColor?: string;
  showAchievements?: boolean;
  showProjects?: boolean; // Early Career: render a Projects section
  competencyGrid?: boolean; // Corporate: skills as a 3-col grid
  // sidebar-only
  sideBg?: string;
  sideTitle?: string;
  sideText?: string;
}

const STYLES: Record<ResumeTemplateId, TplStyle> = {
  modern: {
    accent: '047857', heading: '065F46', showAchievements: true,
    skillHeading: 'Core Skills',
    pills: { bg: 'ECFDF5', color: '065F46', border: 'A7F3D0' },
  },
  classic: {
    accent: '1E3A8A', heading: '1E3A8A', centered: true, titleColor: '2563EB', showAchievements: false,
    skillHeading: 'Skills',
  },
  corporate: {
    accent: '0F2440', heading: '0F2440', band: true, showAchievements: true, competencyGrid: true,
    skillHeading: 'Core Competencies',
  },
  sidebar: {
    accent: '0D9488', heading: '0F2440', sidebar: true, showAchievements: true,
    sideBg: '0F2440', sideTitle: '5EEAD4', sideText: 'CBD5E1',
  },
  'ats-early': {
    accent: '2563EB', heading: '1E40AF', showAchievements: false, showProjects: true,
    skillHeading: 'Areas of Expertise',
    pills: { bg: 'EFF6FF', color: '1E40AF', border: 'BFDBFE' },
  },
  'ats-senior': {
    accent: 'B45309', heading: '92400E', showAchievements: true, showProjects: true,
    skillHeading: 'Areas of Expertise',
    pills: { bg: 'FFF7ED', color: '92400E', border: 'FED7AA' },
  },
};

// Normalise a profile URL: keep http(s) as-is, else prepend https://.
const normUrl = (v: unknown) => {
  const s = String(v ?? '').trim();
  return /^https?:\/\//i.test(s) ? s : `https://${s.replace(/^\/+/, '')}`;
};

const explicitUrl = (v: unknown) => {
  const s = String(v ?? '').trim();
  return /^(https?:\/\/|www\.)/i.test(s) ? normUrl(s) : null;
};

// Contact items in order, each with an optional link target. email/linkedin/
// github/other Accomplishments links become real hyperlinks; phone/location
// stay plain text. LinkedIn/GitHub/extra links show a short label (not the
// raw URL typed into the field) — matches the PDF/preview template.
function contactParts(r: GeneratedResume): Array<{ t: string; href: string | null; blue?: boolean }> {
  const c = r.contact;
  const parts: Array<{ t: string; href: string | null; blue?: boolean }> = [];
  if (c.email) parts.push({ t: c.email, href: `mailto:${String(c.email).trim()}` });
  if (c.phone) parts.push({ t: c.phone, href: null });
  if (c.location) parts.push({ t: c.location, href: null });
  const linkedin = explicitUrl(c.linkedin);
  const github = explicitUrl(c.github);
  if (linkedin) parts.push({ t: 'LinkedIn', href: linkedin });
  if (github) parts.push({ t: 'GitHub', href: github });
  // Other Accomplishments links (work sample, publication, portfolio, ...) —
  // same treatment as LinkedIn/GitHub, colored like a standard hyperlink.
  for (const l of c.links || []) {
    const href = explicitUrl(l?.url);
    if (href) parts.push({ t: l.label || 'Link', href, blue: true });
  }
  return parts;
}

// Runs for a contact line, joining parts with " • " and hyperlinking the linkable ones.
function contactChildren(r: GeneratedResume, size: number, color: string): (TextRun | ExternalHyperlink)[] {
  const out: (TextRun | ExternalHyperlink)[] = [];
  contactParts(r).forEach((p, i) => {
    if (i > 0) out.push(new TextRun({ text: '  •  ', size, color }));
    out.push(
      p.href
        ? new ExternalHyperlink({
            link: p.href,
            children: [new TextRun({ text: p.t, size, color: p.blue ? LINK_BLUE : color, underline: {} })],
          })
        : new TextRun({ text: p.t, size, color }),
    );
  });
  return out;
}

// Standard hyperlink blue — same shade the LinkedIn/GitHub contact links and
// the resume template's auto-linked URLs use.
const LINK_BLUE = '2563EB';
const URL_RE = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

// Find bare URLs in free text (e.g. an accomplishment written as
// "Published paper — https://doi.org/...") and turn them into real,
// clickable, blue-colored hyperlinks; everything else keeps the given style.
function linkifyRuns(text: string, size: number, color: string, bold = false): (TextRun | ExternalHyperlink)[] {
  const s = clean(text || '');
  const runs: (TextRun | ExternalHyperlink)[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  URL_RE.lastIndex = 0;
  while ((m = URL_RE.exec(s))) {
    let url = m[0];
    let trail = '';
    while (url && /[.,;:!?'")\]]$/.test(url)) {
      trail = url.slice(-1) + trail;
      url = url.slice(0, -1);
    }
    if (!url) continue;
    if (m.index > last) runs.push(new TextRun({ text: s.slice(last, m.index), size, color, bold }));
    runs.push(
      new ExternalHyperlink({
        link: normUrl(url),
        children: [new TextRun({ text: url, size, color: LINK_BLUE, underline: {} })],
      }),
    );
    if (trail) runs.push(new TextRun({ text: trail, size, color, bold }));
    last = m.index + m[0].length;
  }
  if (last < s.length || runs.length === 0) runs.push(new TextRun({ text: s.slice(last), size, color, bold }));
  return runs;
}

const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'auto' };
const noTableBorders = {
  top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER,
  insideHorizontal: NO_BORDER, insideVertical: NO_BORDER,
};

// Section heading: uppercase, accent underline (matches the .rt-h2 rule).
// keepNext so a heading never sits alone at the bottom of a page.
function heading(text: string, underline: string, color: string, center = false): Paragraph {
  return new Paragraph({
    spacing: { before: 220, after: 80 },
    alignment: center ? AlignmentType.CENTER : undefined,
    keepNext: true,
    keepLines: true,
    border: { bottom: { color: underline, size: 8, style: BorderStyle.SINGLE, space: 2 } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 20, color })],
  });
}

const thin = (color: string) => ({ style: BorderStyle.SINGLE, size: 4, color });

// One unbreakable block (job, project, education row) so a page break cannot
// cut a title/date row or split a bullet mid-line.
function keepBlock(children: (Paragraph | Table)[]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noTableBorders,
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            borders: noTableBorders,
            width: { size: 100, type: WidthType.PERCENTAGE },
            children: children.length ? children : [new Paragraph({})],
          }),
        ],
      }),
    ],
  });
}

function titleDateRow(left: (TextRun | ExternalHyperlink)[], dates: string): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noTableBorders,
    columnWidths: [7200, 2160],
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 7200, type: WidthType.DXA },
            borders: noTableBorders,
            children: [
              new Paragraph({
                spacing: { before: 80, after: 20 },
                keepNext: true,
                keepLines: true,
                children: left,
              }),
            ],
          }),
          new TableCell({
            width: { size: 2160, type: WidthType.DXA },
            borders: noTableBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                keepLines: true,
                spacing: { before: 80, after: 20 },
                children: [new TextRun({ text: dates || '', size: 18, color: GREY })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// --- Reusable content sections ---

function summaryParas(r: GeneratedResume, s: TplStyle): Paragraph[] {
  if (!r.summary || !r.summary.trim()) return [];
  return [
    heading('Professional Summary', s.accent, s.heading, s.centered),
    new Paragraph({
      alignment: s.centered ? AlignmentType.CENTER : undefined,
      keepLines: true,
      children: [new TextRun({ text: clean(r.summary), size: 22, color: BODY })],
    }),
  ];
}

function experienceParas(r: GeneratedResume, s: TplStyle, title = 'Experience'): (Paragraph | Table)[] {
  const items = (r.experience || []).filter((e) => meaningful(e.role) || meaningful(e.company) || e.bullets?.some(meaningful));
  if (!items.length) return [];
  const p: (Paragraph | Table)[] = [heading(title, s.accent, s.heading)];
  for (const e of items) {
    const bullets = (e.bullets || []).filter(meaningful).map(
      (b) =>
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 20 },
          keepLines: true,
          children: [new TextRun({ text: clean(b), size: 21, color: BODY })],
        }),
    );
    p.push(
      keepBlock([
        titleDateRow(
          [
            new TextRun({ text: e.role || '', bold: true, size: 22, color: INK }),
            new TextRun({ text: e.company ? ` · ${e.company}` : '', size: 22, color: s.accent }),
          ],
          e.dates || '',
        ),
        ...bullets,
      ]),
    );
  }
  return p;
}

function achievementParas(r: GeneratedResume, s: TplStyle): Paragraph[] {
  const items = (r.achievements || []).filter((a) => meaningful(a.title) || meaningful(a.detail));
  if (!s.showAchievements || !items.length) return [];
  const p: Paragraph[] = [heading('Key Achievements', s.accent, s.heading)];
  for (const a of items) {
    p.push(
      new Paragraph({
        bullet: { level: 0 },
        spacing: { after: 20 },
        keepLines: true,
        children: [
          ...linkifyRuns(a.title || '', 21, INK, true),
          ...(a.detail
            ? [new TextRun({ text: ' — ', size: 21, color: BODY }), ...linkifyRuns(a.detail, 21, BODY)]
            : []),
        ],
      }),
    );
  }
  return p;
}

function projectParas(r: GeneratedResume, s: TplStyle): (Paragraph | Table)[] {
  const items = (r.projects || []).filter((pr) => meaningful(pr.title) || meaningful(pr.description) || pr.bullets?.some(meaningful));
  if (!items.length) return [];
  const p: (Paragraph | Table)[] = [heading('Projects', s.accent, s.heading)];
  for (const pr of items) {
    const kids: (Paragraph | Table)[] = [
      titleDateRow([new TextRun({ text: pr.title || '', bold: true, size: 22, color: INK })], pr.dates || ''),
    ];
    if (pr.description) {
      kids.push(
        new Paragraph({
          spacing: { after: 20 },
          keepLines: true,
          children: [new TextRun({ text: clean(pr.description), italics: true, size: 21, color: BODY })],
        }),
      );
    }
    for (const b of (pr.bullets || []).filter(meaningful)) {
      kids.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 20 },
          keepLines: true,
          children: [new TextRun({ text: clean(b), size: 21, color: BODY })],
        }),
      );
    }
    p.push(keepBlock(kids));
  }
  return p;
}

function educationParas(r: GeneratedResume, s: TplStyle): (Paragraph | Table)[] {
  const items = (r.education || []).filter((e) => meaningful(e.degree) || meaningful(e.school));
  if (!items.length) return [];
  const p: (Paragraph | Table)[] = [heading('Education', s.accent, s.heading, s.centered)];
  for (const e of items) {
    p.push(
      keepBlock([
        titleDateRow(
          [
            new TextRun({ text: e.degree || '', bold: true, size: 21, color: INK }),
            new TextRun({ text: e.school ? ` — ${e.school}` : '', size: 21, color: BODY }),
          ],
          e.dates || '',
        ),
      ]),
    );
  }
  return p;
}

// Courses / certifications, rendered last. Name links out when the cert has a
// URL. Present in every template when the profile has certifications.
function certificationParas(r: GeneratedResume, s: TplStyle): (Paragraph | Table)[] {
  const items = (r.certifications || []).filter((c) => meaningful(c.name));
  if (!items.length) return [];
  const p: (Paragraph | Table)[] = [heading('Certifications', s.accent, s.heading, s.centered)];
  for (const c of items) {
    const runs: (TextRun | ExternalHyperlink)[] = [];
    runs.push(
      c.url
        ? new ExternalHyperlink({ link: normUrl(c.url), children: [new TextRun({ text: c.name || '', bold: true, size: 21, color: INK, underline: {} })] })
        : new TextRun({ text: c.name || '', bold: true, size: 21, color: INK }),
    );
    if (c.issuer) runs.push(new TextRun({ text: ` — ${c.issuer}`, size: 21, color: BODY }));
    p.push(keepBlock([titleDateRow(runs, c.date || '')]));
  }
  return p;
}

// One shaded band Word can actually render. Per-skill "pills" become boxes
// with uneven gaps and leftover cells — Word has no border-radius.
function skillsBand(skills: string[], pills: SkillPills): Table {
  const edge = thin(pills.border);
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noTableBorders,
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: pills.bg },
            margins: { top: 80, bottom: 80, left: 140, right: 140 },
            borders: { top: edge, bottom: edge, left: edge, right: edge },
            children: [
              new Paragraph({
                keepLines: true,
                spacing: { after: 0 },
                children: [new TextRun({ text: skills.join('   ·   '), size: 21, color: pills.color })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// Skills: pills (Modern / Early Career / Senior), 3-col grid (Corporate), or dots (Classic).
function skillsContent(r: GeneratedResume, s: TplStyle): (Paragraph | Table)[] {
  const skills = (r.skills || []).filter(meaningful);
  if (!skills.length) return [];
  const title = s.skillHeading || 'Core Skills';
  if (s.competencyGrid) {
    const cellBorder = { style: BorderStyle.SINGLE, size: 2, color: 'E5E7EB' };
    const rows: TableRow[] = [];
    for (let i = 0; i < skills.length; i += 3) {
      const cells = [0, 1, 2].map((k) => {
        const skill = skills[i + k];
        return new TableCell({
          width: { size: 33, type: WidthType.PERCENTAGE },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder },
          children: [
            new Paragraph({
              keepLines: true,
              children: skill
                ? [new TextRun({ text: '▸ ', color: s.accent, size: 20 }), new TextRun({ text: skill, size: 20, color: BODY })]
                : [new TextRun({ text: '', size: 20 })],
            }),
          ],
        });
      });
      rows.push(new TableRow({ cantSplit: true, children: cells }));
    }
    return [
      heading(title, s.accent, s.heading),
      new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: noTableBorders, rows }),
    ];
  }
  if (s.pills) {
    return [heading(title, s.accent, s.heading, s.centered), skillsBand(skills, s.pills)];
  }
  return [
    heading(title, s.accent, s.heading, s.centered),
    new Paragraph({
      alignment: s.centered ? AlignmentType.CENTER : undefined,
      keepLines: true,
      children: [new TextRun({ text: skills.join('   ·   '), size: 22, color: BODY })],
    }),
  ];
}

// --- Header variants ---

function headerBlock(r: GeneratedResume, s: TplStyle): (Paragraph | Table)[] {
  if (s.band) {
    // Corporate: solid navy band with white name, light title/contact.
    const bandContact = contactChildren(r, 16, '94A3B8');
    const cell = new TableCell({
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: '0F2440' },
      margins: { top: 200, bottom: 200, left: 200, right: 200 },
      borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: r.name || '', bold: true, size: 32, color: 'FFFFFF' })] }),
        ...(r.title ? [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40 }, children: [new TextRun({ text: r.title, size: 20, color: 'CBD5E1' })] })] : []),
        ...(bandContact.length ? [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 }, children: bandContact })] : []),
      ],
    });
    return [new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: noTableBorders, rows: [new TableRow({ children: [cell] })] })];
  }
  // Modern (left) / Classic (centered)
  const align = s.centered ? AlignmentType.CENTER : undefined;
  const p: Paragraph[] = [
    new Paragraph({ alignment: align, children: [new TextRun({ text: r.name || '', bold: true, size: 34, color: s.centered ? s.accent : INK })] }),
  ];
  if (r.title) {
    p.push(new Paragraph({ alignment: align, spacing: { after: 40 }, children: [new TextRun({ text: s.centered ? r.title : r.title.toUpperCase(), bold: !s.centered, size: 20, color: s.titleColor || s.accent })] }));
  }
  const contactRuns = contactChildren(r, 18, GREY);
  if (contactRuns.length) {
    p.push(new Paragraph({ alignment: align, spacing: { after: 120 }, children: contactRuns }));
  }
  return p;
}

// --- Layouts ---

function linearLayout(r: GeneratedResume, s: TplStyle): (Paragraph | Table)[] {
  const title = s.band || s.showProjects ? 'Professional Experience' : 'Experience';
  return [
    ...headerBlock(r, s),
    ...summaryParas(r, s),
    ...skillsContent(r, s),
    ...(s.showProjects ? projectParas(r, s) : []),
    ...experienceParas(r, s, title),
    ...achievementParas(r, s),
    ...educationParas(r, s),
    ...certificationParas(r, s),
  ];
}

// Sidebar: one two-column table — dark left rail (name/title/contact/skills),
// white right column (summary/experience/achievements/education).
function sidebarLayout(r: GeneratedResume, s: TplStyle): (Paragraph | Table)[] {
  const contact = contactParts(r);

  const sideChildren: Paragraph[] = [
    new Paragraph({ children: [new TextRun({ text: r.name || '', bold: true, size: 30, color: 'FFFFFF' })] }),
  ];
  if (r.title) sideChildren.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: r.title.toUpperCase(), size: 17, color: s.sideTitle })] }));
  const sideHead = (t: string) =>
    new Paragraph({ spacing: { before: 200, after: 60 }, border: { bottom: { color: s.sideTitle!, size: 4, style: BorderStyle.SINGLE, space: 2 } }, children: [new TextRun({ text: t.toUpperCase(), bold: true, size: 16, color: s.sideTitle })] });
  if (contact.length) {
    sideChildren.push(sideHead('Contact'));
    for (const c of contact) {
      const run = c.href
        ? new ExternalHyperlink({
            link: c.href,
            children: [new TextRun({ text: c.t, size: 17, color: c.blue ? LINK_BLUE : s.sideText, underline: {} })],
          })
        : new TextRun({ text: c.t, size: 17, color: s.sideText });
      sideChildren.push(new Paragraph({ spacing: { after: 30 }, children: [run] }));
    }
  }
  const skills = (r.skills || []).filter(meaningful);
  if (skills.length) {
    sideChildren.push(sideHead('Skills'));
    for (const sk of skills) sideChildren.push(new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: sk, size: 17, color: s.sideText })] }));
  }

  const mainChildren: (Paragraph | Table)[] = [
    ...summaryParas(r, s),
    ...experienceParas(r, s),
    ...achievementParas(r, s),
    ...educationParas(r, s),
    ...certificationParas(r, s),
  ];

  const leftCell = new TableCell({
    width: { size: 33, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: s.sideBg! },
    margins: { top: 220, bottom: 220, left: 200, right: 200 },
    borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
    children: sideChildren,
  });
  const rightCell = new TableCell({
    width: { size: 67, type: WidthType.PERCENTAGE },
    margins: { top: 220, bottom: 220, left: 240, right: 160 },
    borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
    children: mainChildren.length ? mainChildren : [new Paragraph({})],
  });

  return [new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: noTableBorders, columnWidths: [3216, 6530], rows: [new TableRow({ children: [leftCell, rightCell] })] })];
}

export async function buildResumeDocxBlob(r: GeneratedResume, templateId: ResumeTemplateId = 'modern'): Promise<Blob> {
  const s = STYLES[templateId] || STYLES.modern;
  const children = s.sidebar ? sidebarLayout(r, s) : linearLayout(r, s);
  const doc = new Document({
    styles: { default: { document: { run: { font: 'Calibri' } } } },
    sections: [
      {
        properties: {
          page: { margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } },
        },
        children,
      },
    ],
  });
  return Packer.toBlob(doc);
}

export async function buildCoverLetterDocxBlob(l: CoverLetter, accentHex = '#047857'): Promise<Blob> {
  const accent = accentHex.replace('#', '');
  const p: Paragraph[] = [];
  p.push(
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      spacing: { after: 60 },
      border: { bottom: { color: accent, size: 8, style: BorderStyle.SINGLE, space: 2 } },
      children: [
        new TextRun({ text: l.signature || '', bold: true, size: 28, color: INK }),
        new TextRun({ text: `\t${l.date || ''}`, size: 18, color: GREY }),
      ],
    }),
  );
  if (l.roleTitle || l.company) {
    p.push(new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: `Application for ${l.roleTitle || ''}${l.company ? ` — ${l.company}` : ''}`, size: 18, color: GREY })] }));
  }
  if (l.greeting) p.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: l.greeting, size: 22, color: '1F2937' })] }));
  for (const para of l.paragraphs || []) {
    p.push(new Paragraph({ spacing: { after: 140 }, children: [new TextRun({ text: clean(para), size: 22, color: BODY })] }));
  }
  p.push(new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: l.closing || 'Sincerely,', size: 22, color: '1F2937' })] }));
  p.push(new Paragraph({ children: [new TextRun({ text: l.signature || '', bold: true, size: 22, color: INK })] }));

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Calibri' } } } },
    sections: [{ properties: { page: { margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } }, children: p }],
  });
  return Packer.toBlob(doc);
}

// Triggers a browser download of a Blob.
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Safe filename like Resume_SeniorProgramManager_VishwasDubey.docx
export function docxFilename(kind: 'Resume' | 'CoverLetter', role: string, name: string): string {
  const part = (s: string) => (s || '').replace(/[^a-z0-9]+/gi, '').slice(0, 40) || 'X';
  return `${kind}_${part(role)}_${part(name)}.docx`;
}
