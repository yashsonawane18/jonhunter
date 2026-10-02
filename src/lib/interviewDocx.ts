import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  PageBreak,
  TabStopType,
} from 'docx';
import type { InterviewKit, QaItem, StarItem } from './interviewTypes';

// Builds the DRC "Interview Preparation Kit" as an editable Word document,
// replicating the reference deliverable's format and colour palette exactly
// (navy section bands, cream callouts, grey script box, alternating fit table).
//
// Sections 3-9 of the kit are generated; the original numbering is preserved so
// sections 1-2 and 10-17 can be added later without renumbering.
//
// §7-9 include a bordered "Your answer" box so the candidate can type their own
// version straight into the document (the "interactive doc with answer fields").

// --- Palette (extracted from the reference kit) ---
const NAVY = '1B2A4A'; // section bands, table header rows
const BLUE = '2E5C8A'; // sub-headings
const GOLD = 'C9912A'; // accent rule
const CREAM = 'F5E9D3'; // callout boxes
const GREY = 'F2F2F2'; // alternating rows + script box
const INK = '222222'; // body text
const WHITE = 'FFFFFF';
const BOXLINE = 'C6C6C6'; // answer-box border

const MARGIN = 1080; // 0.75in in twips

const clean = (s: unknown): string =>
  String(s ?? '')
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '');

const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'auto' };
const noBorders = {
  top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER,
  insideHorizontal: NO_BORDER, insideVertical: NO_BORDER,
};

// --- Building blocks ---

// Numbered section heading: navy, bold, with a gold rule beneath.
function h1(num: number, text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 400, after: 140 },
    border: { bottom: { color: GOLD, size: 12, style: BorderStyle.SINGLE, space: 4 } },
    children: [new TextRun({ text: `${num}.  ${text}`, bold: true, size: 30, color: NAVY })],
  });
}

function h2(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text: clean(text), bold: true, size: 24, color: BLUE })],
  });
}

function body(text: string, opts: { italic?: boolean; after?: number } = {}): Paragraph {
  return new Paragraph({
    spacing: { after: opts.after ?? 100 },
    children: [new TextRun({ text: clean(text), size: 21, color: INK, italics: opts.italic })],
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text: clean(text), size: 21, color: INK })],
  });
}

// Single-cell shaded box (cream callout / grey script box).
function box(fill: string, children: Paragraph[]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, color: 'auto', fill },
            margins: { top: 180, bottom: 180, left: 220, right: 220 },
            borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
            children,
          }),
        ],
      }),
    ],
  });
}

// Cream callout with a bold lead-in title.
function callout(title: string, text: string): Table {
  return box(CREAM, [
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: title, bold: true, size: 21, color: NAVY })] }),
    new Paragraph({ children: [new TextRun({ text: clean(text), size: 21, color: INK })] }),
  ]);
}

// Grey box used for the elevator-pitch script.
function scriptBox(text: string): Table {
  return box(GREY, [
    new Paragraph({ children: [new TextRun({ text: clean(text), size: 21, color: INK, italics: true })] }),
  ]);
}

// Empty bordered box for the candidate to type their own answer into.
function answerBox(): Table {
  const line = { style: BorderStyle.SINGLE, size: 4, color: BOXLINE };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            margins: { top: 120, bottom: 260, left: 180, right: 180 },
            borders: { top: line, bottom: line, left: line, right: line },
            children: [
              new Paragraph({ children: [new TextRun({ text: 'Your answer:', bold: true, size: 18, color: '888888' })] }),
              new Paragraph({ children: [new TextRun({ text: '', size: 21 })] }),
            ],
          }),
        ],
      }),
    ],
  });
}

// §4 fit table: navy header row (white text), alternating white/grey body rows.
function fitTable(rows: { requirement: string; evidence: string }[], company: string): Table {
  const headCell = (t: string) =>
    new TableCell({
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: NAVY },
      margins: { top: 140, bottom: 140, left: 160, right: 160 },
      children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, size: 20, color: WHITE })] })],
    });
  const cell = (t: string, fill: string) =>
    new TableCell({
      shading: { type: ShadingType.CLEAR, color: 'auto', fill },
      margins: { top: 120, bottom: 120, left: 160, right: 160 },
      children: [new Paragraph({ children: [new TextRun({ text: clean(t), size: 20, color: INK })] })],
    });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [4200, 5546],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [headCell(`${company || 'Company'} Requirement`), headCell('Evidence From Your Background')],
      }),
      ...rows.map((r, i) =>
        new TableRow({ children: [cell(r.requirement, i % 2 ? GREY : WHITE), cell(r.evidence, i % 2 ? GREY : WHITE)] }),
      ),
    ],
  });
}

// §7/§8: "Qn.  question" / optional "Approach: ..." / "Answer: ..."
function qaBlock(item: QaItem, idx: number, withBox: boolean): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [
    new Paragraph({
      spacing: { before: 220, after: 60 },
      children: [new TextRun({ text: `Q${idx}.  ${clean(item.question)}`, bold: true, size: 21, color: NAVY })],
    }),
  ];
  if (item.approach && item.approach.trim()) {
    out.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: 'Approach: ', bold: true, size: 20, color: BLUE }),
          new TextRun({ text: clean(item.approach), size: 20, color: INK, italics: true }),
        ],
      }),
    );
  }
  out.push(
    new Paragraph({
      spacing: { after: withBox ? 100 : 160 },
      children: [
        new TextRun({ text: 'Answer: ', bold: true, size: 21, color: BLUE }),
        new TextRun({ text: clean(item.answer), size: 21, color: INK }),
      ],
    }),
  );
  if (withBox) out.push(answerBox(), new Paragraph({ spacing: { after: 80 }, children: [] }));
  return out;
}

// §9: STAR block - Situation / Task / Action / Result
function starBlock(item: StarItem, idx: number, withBox: boolean): (Paragraph | Table)[] {
  const line = (label: string, text: string) =>
    new Paragraph({
      spacing: { after: 50 },
      children: [
        new TextRun({ text: `${label}: `, bold: true, size: 20, color: BLUE }),
        new TextRun({ text: clean(text), size: 20, color: INK }),
      ],
    });
  const out: (Paragraph | Table)[] = [
    new Paragraph({
      spacing: { before: 220, after: 60 },
      children: [new TextRun({ text: `Q${idx}.  ${clean(item.question)}`, bold: true, size: 21, color: NAVY })],
    }),
    line('Situation', item.situation),
    line('Task', item.task),
    line('Action', item.action),
    line('Result', item.result),
  ];
  if (withBox) out.push(new Paragraph({ spacing: { after: 60 }, children: [] }), answerBox(), new Paragraph({ spacing: { after: 80 }, children: [] }));
  return out;
}

// Navy cover block + candidate/role line.
function cover(kit: InterviewKit): (Paragraph | Table)[] {
  const navyCell = new TableCell({
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: NAVY },
    margins: { top: 340, bottom: 340, left: 300, right: 300 },
    borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'DRC', bold: true, size: 44, color: WHITE })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 }, children: [new TextRun({ text: 'DHEERAJ RATHOD CONSULT', bold: true, size: 22, color: WHITE })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40 }, children: [new TextRun({ text: 'Career Strategy & Placement Consultancy', size: 18, color: 'CBD5E1' })] }),
    ],
  });
  return [
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorders, rows: [new TableRow({ children: [navyCell] })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 320 }, children: [new TextRun({ text: 'Interview Preparation Kit', bold: true, size: 34, color: NAVY })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120 }, children: [new TextRun({ text: clean(kit.candidateName), bold: true, size: 26, color: INK })] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 200 },
      children: [new TextRun({ text: `${clean(kit.roleTitle)}${kit.company ? `  •  ${clean(kit.company)}` : ''}`, size: 21, color: BLUE })],
    }),
  ];
}

// The 7 section titles, in order. Shared by the Contents index and the section
// headings so their numbering can never drift.
function sectionTitles(kit: InterviewKit): string[] {
  return [
    'Job Description — Full Breakdown',
    'Candidate–Role Fit Analysis',
    'Your Unique Selling Points (USPs)',
    'Elevator Pitch — Tell Me About Yourself',
    'HR & General Interview Questions',
    `${kit.roleTitle || 'Role'} — Domain & Technical Questions`,
    'Behavioural (STAR) Questions',
  ];
}

// Contents index (a simple numbered list of the 7 sections), then a page break
// so the kit body starts on a fresh page.
function contents(kit: InterviewKit): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [
    new Paragraph({
      spacing: { before: 300, after: 140 },
      border: { bottom: { color: GOLD, size: 12, style: BorderStyle.SINGLE, space: 4 } },
      children: [new TextRun({ text: 'CONTENTS', bold: true, size: 28, color: NAVY })],
    }),
  ];
  sectionTitles(kit).forEach((t, i) =>
    out.push(
      new Paragraph({
        spacing: { after: 70 },
        children: [
          new TextRun({ text: `${i + 1}.`, bold: true, size: 22, color: BLUE }),
          new TextRun({ text: `   ${t}`, size: 22, color: INK }),
        ],
      }),
    ),
  );
  out.push(new Paragraph({ children: [new PageBreak()] }));
  return out;
}

export async function buildInterviewKitDocxBlob(
  kit: InterviewKit,
  opts: { answerFields?: boolean } = {},
): Promise<Blob> {
  const withBox = opts.answerFields !== false;
  const T = sectionTitles(kit);
  const children: (Paragraph | Table)[] = [...cover(kit), ...contents(kit)];

  // 1. Job Description - Full Breakdown
  children.push(h1(1, T[0]));
  if (kit.jdBreakdown.responsibilities?.length) {
    children.push(h2(`Core Responsibilities (as stated by ${kit.company || 'the company'})`));
    for (const r of kit.jdBreakdown.responsibilities) children.push(bullet(r));
  }
  if (kit.jdBreakdown.candidateProfile?.length) {
    children.push(h2('Desired Candidate Profile'));
    for (const c of kit.jdBreakdown.candidateProfile) children.push(bullet(c));
  }
  if (kit.jdBreakdown.readBetweenTheLines?.trim()) {
    children.push(new Paragraph({ spacing: { before: 160 }, children: [] }));
    children.push(callout('Read Between the Lines', kit.jdBreakdown.readBetweenTheLines));
  }

  // 2. Candidate-Role Fit Analysis
  children.push(h1(2, T[1]));
  if (kit.fitAnalysis.intro?.trim()) children.push(body(kit.fitAnalysis.intro));
  if (kit.fitAnalysis.rows?.length) children.push(fitTable(kit.fitAnalysis.rows, kit.company));
  if (kit.fitAnalysis.gapNote?.trim()) {
    children.push(new Paragraph({ spacing: { before: 160 }, children: [] }));
    children.push(body(kit.fitAnalysis.gapNote, { italic: true }));
  }

  // 3. Unique Selling Points
  children.push(h1(3, T[2]));
  if (kit.uspSection.intro?.trim()) children.push(body(kit.uspSection.intro));
  kit.uspSection.usps?.forEach((u, i) => {
    children.push(h2(`USP ${i + 1} — ${clean(u.title)}`));
    children.push(body(u.detail));
  });
  if (kit.uspSection.closingTip?.trim()) {
    children.push(new Paragraph({ spacing: { before: 160 }, children: [] }));
    children.push(callout('How to Close Any Answer', kit.uspSection.closingTip));
  }

  // 4. Elevator Pitch
  children.push(h1(4, T[3]));
  if (kit.elevatorPitch.intro?.trim()) children.push(body(kit.elevatorPitch.intro));
  children.push(h2('Suggested Script'));
  children.push(scriptBox(kit.elevatorPitch.script));
  if (kit.elevatorPitch.deliveryTips?.trim()) {
    children.push(new Paragraph({ spacing: { before: 160 }, children: [] }));
    children.push(callout('Delivery Tips', kit.elevatorPitch.deliveryTips));
  }

  // 5. HR & General
  children.push(h1(5, T[4]));
  kit.hrQuestions?.forEach((q, i) => children.push(...qaBlock(q, i + 1, withBox)));

  // 6. Domain & Technical
  children.push(h1(6, T[5]));
  kit.technicalQuestions?.forEach((q, i) => children.push(...qaBlock(q, i + 1, withBox)));

  // 7. Behavioural (STAR)
  children.push(h1(7, T[6]));
  children.push(body('For every answer below, structure as Situation → Task → Action → Result. Keep each under 2 minutes.'));
  kit.behaviouralQuestions?.forEach((q, i) => children.push(...starBlock(q, i + 1, withBox)));

  // Sources (web mode only) - shows which pages the company facts came from.
  if (kit.sources?.length) {
    children.push(h2('Company research sources'));
    for (const s of kit.sources) children.push(bullet(s));
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Calibri' } } } },
    sections: [
      {
        properties: { page: { margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                border: { bottom: { color: BOXLINE, size: 4, style: BorderStyle.SINGLE, space: 2 } },
                tabStops: [{ type: TabStopType.RIGHT, position: 9746 }],
                children: [
                  new TextRun({ text: 'DRC | Dheeraj Rathod Consult', bold: true, size: 16, color: NAVY }),
                  new TextRun({ text: '\tInterview Preparation Kit', size: 16, color: '888888' }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Dheeraj Rathod Consult  •  Career Strategy & Placement Consultancy  •  Confidential     |     Page ', size: 14, color: '888888' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 14, color: '888888' }),
                  new TextRun({ text: ' of ', size: 14, color: '888888' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 14, color: '888888' }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
  return Packer.toBlob(doc);
}

// Safe filename like Anushka_Verma_Interview_Prep_Kit_KiwiTech.docx
export function interviewKitFilename(name: string, company: string): string {
  const part = (s: string) => (s || '').trim().replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '').slice(0, 40);
  const n = part(name) || 'Candidate';
  const c = part(company);
  return `${n}_Interview_Prep_Kit${c ? `_${c}` : ''}.docx`;
}
