import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PAPERS, type PaperId } from '../garden/memories';
import { useWords } from '../i18n';

/** The painting's size in pixels: upright, 3 by 4, like the frame on the wall. */
export const PAINT_W = 768;
export const PAINT_H = 1024;
const UNDO_STEPS = 10;
/** The small copy shown on the album pages. */
const THUMB_W = 270;
const THUMB_H = 360;

export const PAPER_COLOUR: Record<PaperId, string> = { cream: '#f4ecd8', white: '#fbf8f2', blush: '#f5dde1', ink: '#211a24' };
const PAPER_NAMES: Record<PaperId | 'clear', [string, string]> = {
  cream: ['Cream paper', 'Kremowy papier'],
  white: ['White paper', 'Biały papier'],
  blush: ['Pink paper', 'Różowy papier'],
  ink: ['Black paper', 'Czarny papier'],
  clear: ['No paper · stands on a shelf', 'Bez papieru · stanie na półce'],
};

type Tool = 'pencil' | 'ink' | 'wash' | 'crayon' | 'eraser';
const TOOLS: Tool[] = ['pencil', 'ink', 'wash', 'crayon', 'eraser'];
/** How each tool lays down colour: how strong a stroke is, and its widths (small, medium, large). */
const BRUSH: Record<Tool, { alpha: number; sizes: [number, number, number] }> = {
  pencil: { alpha: 0.88, sizes: [3, 6, 11] },
  ink: { alpha: 1, sizes: [6, 13, 26] },
  wash: { alpha: 0.34, sizes: [24, 44, 78] },
  crayon: { alpha: 0.92, sizes: [10, 18, 32] },
  eraser: { alpha: 1, sizes: [16, 34, 70] },
};
const TOOL_NAMES: Record<Tool, [string, string]> = {
  pencil: ['Pencil', 'Ołówek'],
  ink: ['Ink brush', 'Pędzelek z tuszem'],
  wash: ['Watercolour', 'Akwarela'],
  crayon: ['Crayon', 'Kredka'],
  eraser: ['Eraser', 'Gumka'],
};

/** Colours from the garden itself: ink, roses and pansies, leaves, sky, sunflowers and earth. */
const COLOURS = [
  '#2a1f2e', '#6a5862', '#f8f1e4', '#8a3550', '#c0435f', '#e58aa6', '#f3c1cf', '#7b4fa0', '#b49ad6',
  '#3f5f9e', '#8fb7d9', '#4f7a4a', '#9cbf7a', '#e3b341', '#f0a35e', '#9a6a45', '#d9c7a8',
];

const TOOL_ICON: Record<Tool, JSX.Element> = {
  pencil: (
    <>
      <path d="M-8,9 L-6.5,3.5 L5.5,-8.5 L9,-5 L-3,7 Z M-6.5,3.5 L-3,7 M3.5,-6.5 L7,-3" />
      <path className="tip" d="M-8,9 L-7.3,6.3 L-5.3,8.3 Z" />
    </>
  ),
  ink: (
    <>
      <path d="M8.5,-9 L-1,1.5 M6.5,-9.5 L9.5,-6.5" />
      <path className="tip" d="M-1,1.5 C-4,1 -7,4 -7.5,9.5 C-2,9 1,6 0.5,3 Z" />
    </>
  ),
  wash: (
    <>
      <path d="M8.5,-9 L1,-1.5" />
      <path className="tip" d="M1,-1.5 C-2,-3 -6,0 -6,3 C-6,5 -4,6 -2,5.5 C1,4.5 2.5,1 1,-1.5 Z" />
      <path d="M-6,8 C-4.6,6.6 -3,6.8 -2.6,8.4 C-2.4,9.6 -3.6,10 -4.4,10 C-5.6,10 -6.6,9 -6,8" />
    </>
  ),
  crayon: (
    <>
      {/* a stubby wax crayon: wide, round-ended, a paper wrapper with two bands */}
      <path className="tip" d="M-5,1 L-8.6,7.6 C-8.9,8.4 -8.4,8.9 -7.6,8.6 L-1,5 Z" />
      <path d="M-5,1 L3,-7 C4.2,-8.2 8.2,-4.2 7,-3 L-1,5 Z M-2.2,-1.8 L1.8,2.2 M0.6,-4.6 L4.6,-0.6" />
    </>
  ),
  eraser: (
    <>
      <path d="M-8.5,4 L1.5,-6 L8.5,1 L1.5,8 L-4.5,8 Z M-3.5,-1 L3.5,6 M-9,9.5 L9,9.5" />
    </>
  ),
};

type Point = { x: number; y: number; p: number };
type Stroke = { id: number; last: Point; mid: Point; width: number; t: number };

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/**
 * Her easel: a sheet of paper and a handful of brushes. Strokes are drawn on a layer of their own
 * while her finger is down, then laid onto the painting, so a translucent wash stays even rather
 * than darkening wherever the stroke overlaps itself.
 */
export function Paint({ start, paper: startPaper, onSave, onClose }: {
  /** A painting to carry on with, if any. */
  start: string | null;
  paper: PaperId | null;
  onSave: (blob: Blob, thumb: Blob, paper: PaperId | null) => Promise<void>;
  onClose: () => void;
}) {
  const w = useWords();
  const { t } = w;
  const board = useRef<HTMLDivElement>(null);
  const ink = useRef<HTMLCanvasElement>(null);
  const live = useRef<HTMLCanvasElement>(null);
  const [fit, setFit] = useState({ w: 300, h: 400 });
  const [tool, setTool] = useState<Tool>('ink');
  const [size, setSize] = useState(1);
  const [colour, setColour] = useState(COLOURS[3]!);
  const [paper, setPaper] = useState<PaperId | null>(startPaper);
  const [paperOpen, setPaperOpen] = useState(false);
  const undo = useRef<ImageData[]>([]);
  const redo = useRef<ImageData[]>([]);
  const [, setSteps] = useState(0);
  const [touched, setTouched] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const stroke = useRef<Stroke | null>(null);

  // the paper is as large as fits between the buttons, always 3 by 4
  useLayoutEffect(() => {
    const el = board.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const k = Math.min(r.width / PAINT_W, r.height / PAINT_H);
      setFit({ w: Math.floor(PAINT_W * k), h: Math.floor(PAINT_H * k) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // carrying on with a painting: it goes back on the easel as it was
  useEffect(() => {
    if (!start) return;
    const img = new Image();
    img.onload = () => ink.current?.getContext('2d')?.drawImage(img, 0, 0, PAINT_W, PAINT_H);
    img.src = start;
  }, [start]);

  const ctxOf = (c: HTMLCanvasElement | null) => c?.getContext('2d') ?? null;
  const brush = BRUSH[tool];
  const width = brush.sizes[size]!;

  const at = (e: { clientX: number; clientY: number; pressure: number; pointerType: string }): Point => {
    const r = live.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * PAINT_W) / r.width,
      y: ((e.clientY - r.top) * PAINT_H) / r.height,
      // a pencil on the screen presses harder or softer; a finger is always the same
      p: e.pointerType === 'pen' && e.pressure > 0 ? 0.35 + e.pressure * 0.9 : 1,
    };
  };

  /** The crayon: a scatter of grains along the way, so the paper shows through like wax on tooth. */
  const grains = (c: CanvasRenderingContext2D, a: Point, b: Point, r: number) => {
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(1, Math.ceil(d / (r * 0.3)));
    for (let i = 0; i < steps; i++) {
      const x = lerp(a.x, b.x, i / steps);
      const y = lerp(a.y, b.y, i / steps);
      const n = Math.ceil(r * 1.4);
      for (let k = 0; k < n; k++) {
        const ang = Math.random() * Math.PI * 2;
        const rr = Math.sqrt(Math.random()) * r;
        const g = 0.8 + Math.random() * 1.4;
        c.fillRect(x + Math.cos(ang) * rr - g / 2, y + Math.sin(ang) * rr - g / 2, g, g);
      }
    }
  };

  /** The layer a stroke goes on: the eraser works on the painting itself, everything else on its own layer. */
  const target = () => (tool === 'eraser' ? ctxOf(ink.current) : ctxOf(live.current));

  const begin = (e: React.PointerEvent) => {
    if (!e.isPrimary || stroke.current || saving) return;
    const c = target();
    const base = ctxOf(ink.current);
    if (!c || !base) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setPaperOpen(false);
    undo.current.push(base.getImageData(0, 0, PAINT_W, PAINT_H));
    if (undo.current.length > UNDO_STEPS) undo.current.shift();
    redo.current = [];
    setSteps((s) => s + 1);
    setTouched(true);
    const pt = at(e);
    const w0 = width * pt.p * (tool === 'ink' ? 0.7 : 1);
    stroke.current = { id: e.pointerId, last: pt, mid: pt, width: w0, t: performance.now() };
    c.save();
    c.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    c.fillStyle = colour;
    c.strokeStyle = colour;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    // a tap leaves a dot
    if (tool === 'crayon') grains(c, pt, pt, w0 / 2);
    else {
      c.beginPath();
      c.arc(pt.x, pt.y, w0 / 2, 0, Math.PI * 2);
      c.fill();
    }
  };

  const extend = (e: React.PointerEvent) => {
    const s = stroke.current;
    if (!s || s.id !== e.pointerId) return;
    const c = target();
    if (!c) return;
    const native = e.nativeEvent as PointerEvent & { getCoalescedEvents?: () => PointerEvent[] };
    const events = native.getCoalescedEvents?.() ?? [native];
    for (const ev of events.length ? events : [native]) {
      const pt = at(ev);
      const dist = Math.hypot(pt.x - s.last.x, pt.y - s.last.y);
      if (dist < 0.8) continue;
      const now = performance.now();
      const speed = dist / Math.max(1, now - s.t);
      s.t = now;
      // the ink brush swells when it goes slowly and thins when it's flicked
      const goal = tool === 'ink' ? width * pt.p * Math.max(0.35, Math.min(1.15, 1.2 - speed * 0.22)) : width * pt.p;
      s.width = lerp(s.width, goal, tool === 'ink' ? 0.25 : 0.5);
      const mid = { x: (s.last.x + pt.x) / 2, y: (s.last.y + pt.y) / 2, p: pt.p };
      if (tool === 'crayon') grains(c, s.mid, mid, s.width / 2);
      else {
        c.lineWidth = s.width;
        c.beginPath();
        c.moveTo(s.mid.x, s.mid.y);
        c.quadraticCurveTo(s.last.x, s.last.y, mid.x, mid.y);
        c.stroke();
      }
      s.mid = mid;
      s.last = pt;
    }
  };

  const finish = (e: React.PointerEvent) => {
    const s = stroke.current;
    if (!s || s.id !== e.pointerId) return;
    stroke.current = null;
    const c = target();
    if (c) {
      if (tool !== 'crayon') {
        c.lineWidth = s.width;
        c.beginPath();
        c.moveTo(s.mid.x, s.mid.y);
        c.lineTo(s.last.x, s.last.y);
        c.stroke();
      }
      c.restore();
    }
    if (tool === 'eraser') return;
    // lay the stroke onto the painting, as strong as the tool paints
    const base = ctxOf(ink.current);
    const layer = live.current;
    if (!base || !layer) return;
    base.save();
    base.globalAlpha = brush.alpha;
    base.drawImage(layer, 0, 0);
    base.restore();
    ctxOf(layer)?.clearRect(0, 0, PAINT_W, PAINT_H);
  };

  const step = (from: React.MutableRefObject<ImageData[]>, to: React.MutableRefObject<ImageData[]>) => {
    const base = ctxOf(ink.current);
    const snap = from.current.pop();
    if (!base || !snap) return;
    to.current.push(base.getImageData(0, 0, PAINT_W, PAINT_H));
    base.putImageData(snap, 0, 0);
    setSteps((n) => n + 1);
  };

  const save = async () => {
    const src = ink.current;
    if (!src || saving) return;
    setSaving(true);
    const out = document.createElement('canvas');
    out.width = PAINT_W;
    out.height = PAINT_H;
    const c = out.getContext('2d');
    if (c) {
      if (paper) {
        c.fillStyle = PAPER_COLOUR[paper];
        c.fillRect(0, 0, PAINT_W, PAINT_H);
      }
      c.drawImage(src, 0, 0);
    }
    // the small copy for the album pages is drawn straight from the canvas, and both are encoded at once
    const small = document.createElement('canvas');
    small.width = THUMB_W;
    small.height = THUMB_H;
    const sc = small.getContext('2d');
    if (sc) {
      sc.imageSmoothingQuality = 'high';
      sc.drawImage(out, 0, 0, THUMB_W, THUMB_H);
    }
    const encode = (c: HTMLCanvasElement, jpeg: boolean) =>
      new Promise<Blob | null>((resolve) => (jpeg ? c.toBlob(resolve, 'image/jpeg', 0.86) : c.toBlob(resolve, 'image/png')));
    const [blob, thumb] = await Promise.all([encode(out, false), encode(small, !!paper)]);
    try {
      if (!blob || !thumb) throw new Error('could not encode');
      await onSave(blob, thumb, paper);
    } catch {
      setSaving(false);
      setFailed(true);
    }
  };

  const close = () => (touched && !leaving ? setLeaving(true) : onClose());

  return (
    <div className="paint" role="dialog" aria-label={t('Paint', 'Malowanie')}>
      <div className="paint-top">
        <button className="paint-close" aria-label={t('Close', 'Zamknij')} onClick={close}>
          ×
        </button>
        {leaving ? (
          <>
            <span className="paint-ask">{t('Leave without keeping it?', 'Wyjść bez zapisywania?')}</span>
            <button className="danger" onClick={onClose}>
              {t('Leave', 'Wyjdź')}
            </button>
            <button onClick={() => setLeaving(false)}>{t('Stay', 'Zostań')}</button>
          </>
        ) : (
          <>
            <button aria-label={t('Undo', 'Cofnij')} disabled={!undo.current.length} onClick={() => step(undo, redo)}>
              <svg viewBox="-12 -12 24 24" aria-hidden="true">
                <path d="M-7,-3 L-2,-8 M-7,-3 L-2,2 M-7,-3 L3,-3 C7,-3 9,0 9,3.5 C9,7 6.5,9 3,9 L-1,9" />
              </svg>
            </button>
            <button aria-label={t('Redo', 'Przywróć')} disabled={!redo.current.length} onClick={() => step(redo, undo)}>
              <svg viewBox="-12 -12 24 24" aria-hidden="true">
                <path d="M7,-3 L2,-8 M7,-3 L2,2 M7,-3 L-3,-3 C-7,-3 -9,0 -9,3.5 C-9,7 -6.5,9 -3,9 L1,9" />
              </svg>
            </button>
            <button
              className="paint-paper-pick"
              aria-label={t('Paper', 'Papier')}
              aria-expanded={paperOpen}
              onClick={() => setPaperOpen((o) => !o)}
            >
              <span className={`paper-chip${paper ? '' : ' clear'}`} style={paper ? { background: PAPER_COLOUR[paper] } : undefined} />
            </button>
            <button className="paint-keep" disabled={!touched || saving} onClick={() => void save()}>
              {saving ? t('Keeping…', 'Zapisuję…') : t('Keep it', 'Zapisz')}
            </button>
          </>
        )}
      </div>
      {failed && (
        <p className="paint-failed" role="status">
          {t("It couldn't be kept: the phone may be out of room.", 'Nie udało się zapisać: w telefonie może brakować miejsca.')}
        </p>
      )}
      <div className="paint-board" ref={board}>
        <div
          className={`paint-sheet${paper ? '' : ' clear'}`}
          style={{ width: fit.w, height: fit.h, background: paper ? PAPER_COLOUR[paper] : undefined }}
        >
          <canvas ref={ink} width={PAINT_W} height={PAINT_H} />
          <canvas
            ref={live}
            width={PAINT_W}
            height={PAINT_H}
            style={{ opacity: brush.alpha }}
            onPointerDown={begin}
            onPointerMove={extend}
            onPointerUp={finish}
            onPointerCancel={finish}
          />
        </div>
      </div>
      <div className="paint-tray">
        {paperOpen ? (
          <div className="paint-papers" role="group" aria-label={t('Paper', 'Papier')}>
            {[...PAPERS, null].map((p) => (
              <button
                key={p ?? 'clear'}
                aria-pressed={paper === p}
                onClick={() => {
                  setPaper(p);
                  setPaperOpen(false);
                }}
              >
                <span className={`paper-chip${p ? '' : ' clear'}`} style={p ? { background: PAPER_COLOUR[p] } : undefined} />
                <span>{t(...PAPER_NAMES[p ?? 'clear'])}</span>
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="paint-tools">
              {TOOLS.map((k) => (
                <button key={k} aria-label={t(...TOOL_NAMES[k])} aria-pressed={tool === k} onClick={() => setTool(k)}>
                  <svg viewBox="-12 -12 24 24" aria-hidden="true" style={k === 'eraser' ? undefined : { color: colour }}>
                    {TOOL_ICON[k]}
                  </svg>
                </button>
              ))}
              <button aria-label={t('Brush size', 'Grubość pędzla')} onClick={() => setSize((s) => (s + 1) % 3)}>
                <span className="size-dot" style={{ width: 6 + size * 6, height: 6 + size * 6 }} />
              </button>
            </div>
            <div className="paint-colours" role="group" aria-label={t('Colours', 'Kolory')}>
              {COLOURS.map((c) => (
                <button
                  key={c}
                  aria-label={c}
                  aria-pressed={colour === c && tool !== 'eraser'}
                  onClick={() => {
                    setColour(c);
                    if (tool === 'eraser') setTool('ink');
                  }}
                >
                  <span style={{ background: c }} />
                </button>
              ))}
              <label className="paint-own" aria-label={t('Any colour', 'Dowolny kolor')}>
                <input
                  type="color"
                  value={colour}
                  onChange={(e) => {
                    setColour(e.target.value);
                    if (tool === 'eraser') setTool('ink');
                  }}
                />
                <span style={{ background: COLOURS.includes(colour) ? undefined : colour }} />
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
