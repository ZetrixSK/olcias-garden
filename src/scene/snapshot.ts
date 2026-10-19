/**
 * A picture of the garden exactly as it is on screen: the scene's drawing is copied with the
 * room's styles, fonts and her own pictures written into it, then drawn onto a canvas.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    return res.ok ? await toDataUrl(await res.blob()) : null;
  } catch {
    return null;
  }
}

/**
 * The page's styles as text, with each font file written in, since a picture can't fetch anything
 * itself. Only the font faces the scene uses are kept. Animations are switched off, so everything
 * is drawn at rest.
 */
async function styleText(): Promise<string> {
  const parts: string[] = [];
  const fonts: Promise<string | null>[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSFontFaceRule) {
        const family = rule.style.getPropertyValue('font-family').replace(/["']/g, '').trim();
        if (!/^(Kalam|Grenze Gotisch)$/.test(family)) continue;
        const woff2 = /url\(["']?([^"')]+\.woff2)["']?\)/.exec(rule.cssText)?.[1];
        if (!woff2) continue;
        const css = rule.cssText;
        fonts.push(
          fetchAsDataUrl(new URL(woff2, sheet.href ?? document.baseURI).href).then((data) =>
            data ? css.replace(/src:[^;]+;/, `src: url(${data}) format("woff2");`) : null,
          ),
        );
      } else parts.push(rule.cssText);
    }
  }
  const faces = (await Promise.all(fonts)).filter((f): f is string => f !== null);
  return [...faces, ...parts, '*, *::before, *::after { animation: none !important; transition: none !important; }'].join('\n');
}

/** Draws the scene that's on screen into a PNG, `scale` pixels per screen point. */
export async function snapshotScene(scale: number): Promise<Blob> {
  const svg = document.querySelector<SVGSVGElement>('.view svg.scene');
  const garden = document.querySelector<HTMLElement>('.garden');
  if (!svg || !garden) throw new Error('no scene');
  const { width, height } = svg.getBoundingClientRect();
  const w = Math.round(width);
  const h = Math.round(height);

  // her pictures are held as blob: addresses only this page can read; written in as data instead
  const scene = svg.cloneNode(true) as SVGSVGElement;
  await Promise.all(
    Array.from(scene.querySelectorAll('image')).map(async (img) => {
      const href = img.getAttribute('href') ?? img.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
      if (!href || href.startsWith('data:')) return;
      const data = await fetchAsDataUrl(href);
      if (data) img.setAttribute('href', data);
      else img.remove();
    }),
  );
  scene.setAttribute('width', String(w));
  scene.setAttribute('height', String(h));

  // the scene's styles depend on the garden around it: its theme, night, and palette colours
  const root = document.createElementNS(SVG_NS, 'svg');
  root.setAttribute('xmlns', SVG_NS);
  root.setAttribute('width', String(w));
  root.setAttribute('height', String(h));
  root.setAttribute('viewBox', `0 0 ${w} ${h}`);
  const style = document.createElementNS(SVG_NS, 'style');
  style.textContent = await styleText();
  root.appendChild(style);
  const wrap = document.createElementNS(SVG_NS, 'g');
  wrap.setAttribute('class', garden.className.replace(/\breplaying\b/, ''));
  wrap.setAttribute('style', garden.getAttribute('style') ?? '');
  wrap.appendChild(scene);
  root.appendChild(wrap);

  const text = new XMLSerializer().serializeToString(root);
  const url = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    // Safari sometimes needs a moment before the picture's fonts are ready to draw
    await new Promise((r) => window.setTimeout(r, 120));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const g = canvas.getContext('2d');
    if (!g) throw new Error('no canvas');
    g.fillStyle = getComputedStyle(garden).backgroundColor || '#ecdfc9';
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('no picture'))), 'image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}
