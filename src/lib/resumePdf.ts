// Client-side PDF export that preserves the EXACT template look with ZERO
// browser print chrome. We render the template HTML off-screen at A4 width,
// rasterize it, then slice onto pages at element / line boundaries so a page
// break never cuts a line of text in half (the old "shift the tall image by
// 297mm" path bisected bullets and lost top-of-page alignment).

const A4 = { w: 210, h: 297 }; // mm
const PX_PER_MM = 96 / 25.4;
const PAGE_W_PX = Math.round(A4.w * PX_PER_MM); // ~794px
const MARGIN_MM = 14;
const CONTENT_H_MM = A4.h - MARGIN_MM * 2;

// Block-level units we prefer to keep together. If one is taller than a page
// we fall back to line-box bottoms so text is still never bisected.
const BLOCK_SEL = [
  '.rt-name',
  '.rt-title',
  '.rt-contact',
  '.rt-band',
  '.rt-h2',
  '.rt-sum',
  '.rt-strip',
  '.rt-skills',
  '.rt-grid',
  '.rt-exp',
  '.rt-edu-row',
  '.rt-ach-list > li',
  '.rt-main > h2',
  '.rtc-head',
  '.rtc-greet',
  '.rtc-p',
  '.rtc-close',
].join(',');

const HEADING_SEL = '.rt-h2, .rt-main > h2';

type Box = {
  top: number;
  bottom: number;
  heading?: boolean;
  wholeBlock?: boolean;
  jobLiIndex?: number;
  jobLiCount?: number;
};

function relativeBox(el: Element, root: DOMRect): Box {
  const r = el.getBoundingClientRect();
  return { top: r.top - root.top, bottom: r.bottom - root.top };
}

// A job/project (.rt-exp) is a "whole block" box: when it doesn't fit we
// don't want to bail out and strand the rest of the page blank (a role with
// 9 bullets after a heading would otherwise push the *entire* page's worth
// of remaining space to the next page). Its own bullets are collected too
// (right after it, since they share/exceed its top), so the packer below
// can fall through to them and keep as many as actually fit.
function collectBoxes(page: HTMLElement): Box[] {
  const root = page.getBoundingClientRect();
  const boxes: Box[] = [];
  page.querySelectorAll(BLOCK_SEL).forEach((el) => {
    const b = relativeBox(el, root);
    if (b.bottom - b.top < 1) return;
    boxes.push({ ...b, heading: el.matches(HEADING_SEL), wholeBlock: el.matches('.rt-exp') });
  });
  page.querySelectorAll('.rt-exp').forEach((exp) => {
    const lis = exp.querySelectorAll('li');
    lis.forEach((el, idx) => {
      const b = relativeBox(el, root);
      if (b.bottom - b.top < 1) return;
      boxes.push({ ...b, jobLiIndex: idx, jobLiCount: lis.length });
    });
  });
  page.querySelectorAll('.rt-ach-list li, .rt-skill').forEach((el) => {
    const b = relativeBox(el, root);
    if (b.bottom - b.top < 1) return;
    boxes.push(b);
  });
  boxes.sort((a, b) => a.top - b.top || a.bottom - b.bottom);
  return boxes;
}

// Line boxes — used only when a single block is taller than one page.
function collectLineBoxes(page: HTMLElement): Box[] {
  const root = page.getBoundingClientRect();
  const lines: Box[] = [];
  const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.nodeValue && node.nodeValue.trim()
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const range = document.createRange();
    range.selectNodeContents(node);
    const rects = range.getClientRects();
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      lines.push({ top: r.top - root.top, bottom: r.bottom - root.top });
    }
  }
  return lines.sort((a, b) => a.top - b.top);
}

// Pack whole blocks onto pages. If a block would be cut, it moves to the next
// page. Extra 4px after the last block protects descenders (g, y, p).
function paginateBoxes(
  pageHeightCss: number,
  maxCss: number,
  boxes: Box[],
  lines: Box[],
): Array<[number, number]> {
  const pages: Array<[number, number]> = [];
  const slack = 4;
  let start = 0;

  // Content only ever occupies box bottoms; anything past the last box is
  // trailing container padding (the 24px bottom pad that protects the final
  // line's descenders), not real content — it must never spawn its own page.
  const lastContentBottom = boxes.reduce((m, b) => Math.max(m, b.bottom), 0) || pageHeightCss;
  const stopAt = Math.min(lastContentBottom, pageHeightCss);

  while (start < stopAt - 1) {
    const limit = Math.min(start + maxCss, pageHeightCss);
    let end = start;
    let lastHeadingTop = -1;
    let prevEnd = start; // end value before the most recently accepted box

    for (const b of boxes) {
      if (b.bottom <= start + 1) continue;
      if (b.bottom <= limit) {
        prevEnd = end;
        end = Math.max(end, b.bottom);
        if (b.heading) lastHeadingTop = b.top;
        else lastHeadingTop = -1;
        continue;
      }
      // This block does not fit on the remaining page.
      if (b.wholeBlock) {
        // Don't bail on the whole job — its individual bullets are next in
        // the (sorted) array, so keep going and let as many of them fit as
        // actually do, instead of stranding the rest of the page blank.
        continue;
      }
      // Widow guard: if this is a job's last bullet and it's the only one
      // that didn't fit, don't strand it alone at the top of the next page —
      // give back the previous bullet too, so at least two move together.
      if (b.jobLiIndex !== undefined && b.jobLiCount !== undefined) {
        if (b.jobLiIndex === b.jobLiCount - 1 && b.jobLiIndex > 0) {
          end = prevEnd;
        }
      }
      if (end > start) {
        if (lastHeadingTop >= start) end = lastHeadingTop;
        break;
      }
      // First block on the page is taller than a page — split on a line.
      const split = lines.reduce((acc, ln) => {
        if (ln.bottom > start + 8 && ln.bottom <= limit - slack) return ln.bottom;
        return acc;
      }, -1);
      end = split > start ? split : limit;
      break;
    }

    if (end <= start) end = limit;
    end = Math.min(end + slack, pageHeightCss);
    pages.push([start, end]);
    start = end;
  }
  return pages;
}

// html2canvas only rasterizes pixels — <a href> becomes flat, unclickable
// text in the image. We separately collect each link's CSS-space box and
// re-add it as a real PDF link annotation on top of the matching page(s).
type LinkBox = { top: number; bottom: number; left: number; right: number; href: string };

function collectLinks(page: HTMLElement): LinkBox[] {
  const root = page.getBoundingClientRect();
  const links: LinkBox[] = [];
  page.querySelectorAll('a[href]').forEach((el) => {
    const href = el.getAttribute('href');
    if (!href) return;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    links.push({
      top: r.top - root.top,
      bottom: r.bottom - root.top,
      left: r.left - root.left,
      right: r.right - root.left,
      href,
    });
  });
  return links;
}

function sliceCanvas(
  source: HTMLCanvasElement,
  y0: number,
  y1: number,
): HTMLCanvasElement {
  const h = Math.max(1, y1 - y0);
  const out = document.createElement('canvas');
  out.width = source.width;
  out.height = h;
  const ctx = out.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(source, 0, y0, source.width, h, 0, 0, source.width, h);
  }
  return out;
}

export async function downloadTemplatePdf(
  css: string,
  body: string,
  filename: string,
): Promise<void> {
  const [h2cMod, jspdfMod] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);
  const html2canvas = h2cMod.default;
  const JsPDF = jspdfMod.jsPDF;

  // Left/right padding only — top/bottom margins are applied per PDF page so
  // continuation pages keep the same alignment as page 1.
  const holder = document.createElement('div');
  holder.style.cssText = `position:fixed;left:-10000px;top:0;width:${PAGE_W_PX}px;background:#ffffff;z-index:-1;`;
  const page = document.createElement('div');
  page.style.cssText = `width:${PAGE_W_PX}px;padding:0 ${MARGIN_MM}mm 24px;box-sizing:border-box;background:#ffffff;`;
  page.innerHTML = `<style>${css}</style>${body}`;
  holder.appendChild(page);
  document.body.appendChild(holder);

  try {
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const canvas = await html2canvas(page, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      windowWidth: PAGE_W_PX,
    });

    const scale = canvas.width / Math.max(page.scrollWidth, 1);
    const cssHeight = canvas.height / scale;
    const maxCss = CONTENT_H_MM * (canvas.width / A4.w) / scale;
    const slices = paginateBoxes(cssHeight, maxCss, collectBoxes(page), collectLineBoxes(page));
    const links = collectLinks(page);
    const mmPerCssPx = 25.4 / 96;

    const pdf = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    slices.forEach(([css0, css1], i) => {
      const y0 = Math.round(css0 * scale);
      const y1 = Math.round(css1 * scale);
      const piece = sliceCanvas(canvas, y0, y1);
      if (i > 0) {
        // Guard band: on long single-shot renders html2canvas's text metrics
        // drift a few px from the DOM's measured box, so a faint sliver of
        // the previous page's last line can bleed into this page's top edge
        // even though the real next block starts well clear of the cut.
        const gctx = piece.getContext('2d');
        if (gctx) {
          gctx.fillStyle = '#ffffff';
          gctx.fillRect(0, 0, piece.width, Math.round(4 * scale));
        }
      }
      const imgH = (piece.height * A4.w) / piece.width;
      if (i > 0) pdf.addPage();
      pdf.addImage(piece.toDataURL('image/png'), 'PNG', 0, MARGIN_MM, A4.w, imgH, undefined, 'FAST');

      // Re-add each link that falls on this page as a real clickable annotation,
      // positioned over the (now-flat) rasterized text.
      for (const link of links) {
        const top = Math.max(link.top, css0);
        const bottom = Math.min(link.bottom, css1);
        if (bottom <= top) continue;
        pdf.link(
          link.left * mmPerCssPx,
          MARGIN_MM + (top - css0) * mmPerCssPx,
          (link.right - link.left) * mmPerCssPx,
          (bottom - top) * mmPerCssPx,
          { url: link.href },
        );
      }
    });
    pdf.save(filename);
  } finally {
    document.body.removeChild(holder);
  }
}

export function pdfFilename(kind: 'Resume' | 'CoverLetter', role: string, name: string): string {
  const part = (s: string) => (s || '').replace(/[^a-z0-9]+/gi, '').slice(0, 40) || 'X';
  return `${kind}_${part(role)}_${part(name)}.pdf`;
}
