import { useLayoutEffect, useRef, useState } from 'react';
import type { Theme } from '../theme/palettes';
import { useWords } from '../i18n';
import { OwnWallpaper, wallFill, type OwnPaper } from './OwnDecor';
import { FLOOR_Y, WINDOW_OPENING, WINDOW_OUTER, fv, sv } from './geometry';

/** Wallpaper patterns for both themes, shared by every view. */
export function WallMotifs() {
  return (
    <defs>
      <pattern id="motif-cozy" width="38" height="42" patternUnits="userSpaceOnUse">
        <g style={fv('wall-motif')} opacity="0.32">
          <path d="M10,22 C10.5,17 11,13 10,8" fill="none" style={sv('wall-motif')} strokeWidth="0.9" />
          <path d="M10,14 C6,13 4,10 5,8 C8,8 10,11 10,14 Z" />
          <path d="M10.4,11 C14,10 16,7 15,5 C12,5 10.6,8 10.4,11 Z" />
          <circle cx="29" cy="33" r="1.2" />
        </g>
      </pattern>
      <pattern id="motif-witchy" width="44" height="48" patternUnits="userSpaceOnUse">
        <g style={fv('wall-motif')} opacity="0.5">
          <path d="M11,7 C11.4,10 12,10.6 15,11 C12,11.4 11.4,12 11,15 C10.6,12 10,11.4 7,11 C10,10.6 10.6,10 11,7 Z" />
          <path d="M33,30 A6,6 0 1 0 33,42 A4.2,6 0 1 1 33,30 Z" />
          <circle cx="34" cy="10" r="0.9" />
          <circle cx="12" cy="38" r="0.7" />
        </g>
      </pattern>
    </defs>
  );
}

export function Wall({ theme, paper = null }: { theme: Theme; paper?: OwnPaper | null }) {
  const hole = `M0,-300 H400 V1000 H0 Z ${WINDOW_OUTER}`;
  return (
    <g>
      <WallMotifs />
      {paper && <OwnWallpaper paper={paper} />}
      <path fillRule="evenodd" style={fv('wall')} d={hole} />
      <path fillRule="evenodd" fill={wallFill(theme, paper)} d={hole} />
      {/* ceiling shadow and the shadow the sill casts on the wall */}
      <rect x="0" y="-300" width="400" height="326" style={fv('wall-shade')} opacity="0.7" />
      <path d="M12,548 L388,548 L380,560 L22,560 Z" style={fv('wall-shade')} />
    </g>
  );
}

export function WindowFrame() {
  return (
    <g>
      {/* depth of the frame, seen on the inner edge of the glass */}
      <path d={WINDOW_OPENING} fill="none" style={sv('frame-shade')} strokeWidth="9" />
      <path fillRule="evenodd" className="ink" style={fv('frame')} d={`${WINDOW_OUTER} ${WINDOW_OPENING}`} />
      <path d="M47,530 L47,212 A153,153 0 0 1 120,82" fill="none" style={sv('frame-hi')} strokeWidth="2.5" strokeLinecap="round" />
      {/* glazing bars */}
      <path className="ink" style={fv('frame')} d="M196,64 L204,64 L204,520 L196,520 Z" />
      <path className="ink" style={fv('frame')} d="M56,208 L344,208 L344,216 L56,216 Z" />
      <path className="ink" style={fv('frame')} d="M56,364 L344,364 L344,371 L56,371 Z" />
      <path d="M198,70 L198,518 M60,210 L194,210 M206,210 L340,210 M60,366 L194,366 M206,366 L340,366" style={sv('frame-hi')} strokeWidth="1.2" fill="none" />
      {/* a faint reflection on two panes, nothing more */}
      <path d="M70,500 L120,380 L128,380 L78,500 Z M84,500 L126,400 L130,400 L88,500 Z" fill="#ffffff" opacity="0.07" />
      <path d="M226,200 L268,120 L274,120 L232,200 Z" fill="#ffffff" opacity="0.06" />
    </g>
  );
}

export function Sill() {
  return (
    <g>
      <path className="ink" style={fv('sill-hi')} d="M18,516 L382,516 L392,530 L8,530 Z" />
      <path className="ink" style={fv('sill')} d="M8,530 L392,530 L392,548 L8,548 Z" />
      <path d="M14,538 C90,536 160,540 240,537 C300,535 350,539 386,537 M40,543 C120,542 200,545 300,542" fill="none" style={sv('sill-shade')} strokeWidth="1" strokeLinecap="round" />
    </g>
  );
}

/** One curtain panel, drawn for the left side; the right one is mirrored with different proportions. */
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** Where a closed panel's inner edge meets the other one, a little past the middle so they overlap. */
const CLOSED_EDGE = 206;
const f = (n: number) => n.toFixed(1);

type Panel = { tieY: number; innerTop: number; tieX: number; hemInner: number };
const LEFT: Panel = { tieY: 404, innerTop: 80, tieX: 38, hemInner: 62 };
const RIGHT: Panel = { tieY: 420, innerTop: 74, tieX: 34, hemInner: 56 };

/**
 * A panel's outline, from tied back (p = 0) to drawn closed across the window (p = 1). Both states
 * are drawn with the same points, so every step in between is a curtain too: the tie lets go, the
 * waist widens and the inner edge slides across to the middle.
 */
function panelShape(p: number, { tieY, innerTop, tieX, hemInner }: Panel) {
  const e = CLOSED_EDGE;
  const L = (a: number, b: number) => f(lerp(a, b, p));
  const h = lerp(hemInner, e, p);
  // the hem's little waves spread out along the wider bottom edge
  const s = lerp(1, 3.4, p);
  const inner =
    `${L(innerTop, e)},38 C${L(innerTop - 4, e + 1)},${L(tieY * 0.35, 180)} ${L(tieX + 18, e - 1)},${L(tieY * 0.7, 300)} ${L(tieX + 4, e)},${L(tieY - 8, 392)}` +
    ` C${L(tieX + 2, e + 1)},${L(tieY, 410)} ${L(tieX, e)},${L(tieY + 6, 425)} ${L(tieX + 2, e)},${L(tieY + 14, 440)}` +
    ` C${L(tieX + 10, e - 1)},${L(tieY + 80, 490)} ${L(hemInner - 6, e + 1)},${L(tieY + 150, 540)} ${f(h)},572`;
  const outline =
    `M2,38 L${inner} C${f(h - 10 * s)},576 ${f(h - 20 * s)},571 ${f(h - 30 * s)},575 C${f(h - 40 * s)},578 ${f(h - 48 * s)},572 ${f(Math.max(4, h - 58 * s))},576 L2,574 Z`;
  return { outline, inner: `M${inner}` };
}

/**
 * The folds: gathered into the tie while it's open, hanging straight when it's drawn. Each one
 * runs from the rod to the hem through its middle point; x positions are [open, closed].
 */
const FOLDS: Array<{ top: [number, number]; bot: [number, number]; mid: number; wave: number; wt: number; wb: number; tone: string }> = [
  { top: [12, 24], bot: [0.22, 18], mid: -6, wave: 5, wt: 8, wb: 14, tone: 'curtain-shade' },
  { top: [24, 62], bot: [0.42, 62], mid: -2, wave: -4, wt: 4, wb: 7, tone: 'curtain-hi' },
  { top: [36, 102], bot: [0.58, 98], mid: 1, wave: 6, wt: 8, wb: 12, tone: 'curtain-shade' },
  { top: [48, 142], bot: [0.74, 144], mid: 3, wave: -5, wt: 4, wb: 6, tone: 'curtain-hi' },
  { top: [60, 180], bot: [0.88, 178], mid: 5, wave: 4, wt: 7, wb: 11, tone: 'curtain-shade' },
];

function foldPath(p: number, fold: (typeof FOLDS)[number], { tieY, tieX, hemInner }: Panel) {
  const x0 = lerp(fold.top[0], fold.top[1], p);
  const x1 = lerp(fold.bot[0] * hemInner, fold.bot[1], p);
  const xm = lerp(tieX + fold.mid, (x0 + x1) / 2 + fold.wave, p);
  const ym = lerp(tieY, 320, p);
  const half = lerp(1, (fold.wt + fold.wb) / 4, p);
  const a = (ym - 38) * 0.5;
  const b = (574 - ym) * 0.4;
  return (
    `M${f(x0 - fold.wt / 2)},38 C${f(x0 - fold.wt / 2)},${f(38 + a)} ${f(xm - half)},${f(ym - a * 0.6)} ${f(xm - half)},${f(ym)}` +
    ` C${f(xm - half)},${f(ym + b * 0.7)} ${f(x1 - fold.wb / 2)},${f(574 - b)} ${f(x1 - fold.wb / 2)},574` +
    ` L${f(x1 + fold.wb / 2)},574` +
    ` C${f(x1 + fold.wb / 2)},${f(574 - b)} ${f(xm + half)},${f(ym + b * 0.7)} ${f(xm + half)},${f(ym)}` +
    ` C${f(xm + half)},${f(ym - a * 0.6)} ${f(x0 + fold.wt / 2)},${f(38 + a)} ${f(x0 + fold.wt / 2)},38 Z`
  );
}

const STAR = 'M0,-3 C0.3,-0.8 0.8,-0.3 3,0 C0.8,0.3 0.3,0.8 0,3 C-0.3,0.8 -0.8,0.3 -3,0 C-0.8,-0.3 -0.3,-0.8 0,-3 Z';

function Curtain({ theme, panel, p, mirror, onToggle }: { theme: Theme; panel: Panel; p: number; mirror?: boolean; onToggle?: () => void }) {
  const { outline, inner } = panelShape(p, panel);
  const { tieY: t, tieX } = panel;
  // the tie lets go first as the curtain is drawn, and is tied again only once it's fully open
  const tie = Math.max(0, 1 - p / 0.15);
  const charm = (open: [number, number], closed: [number, number]) => `translate(${f(lerp(open[0], closed[0], p))} ${f(lerp(open[1], closed[1], p))})`;
  return (
    <g transform={mirror ? 'translate(400 0) scale(-1 1)' : undefined}>
      <g className="curtain-sway" style={{ animationDelay: mirror ? '-3s' : '0s' }}>
        <path style={fv('curtain')} d={outline} />
        {FOLDS.map((fold, i) => (
          <path key={i} style={fv(fold.tone)} d={foldPath(p, fold, panel)} />
        ))}
        {/* the lining peeks along the inner edge */}
        <path d={inner} fill="none" style={sv('curtain-lining')} strokeWidth={f(lerp(3.5, 2, p))} opacity={f(lerp(1, 0.45, p))} />
        <path className="ink" fill="none" d={outline} />
        {theme === 'witchy' && (
          <g style={fv('tie')} opacity="0.8">
            <path transform={charm([22, t * 0.42], [70, 170])} d={STAR} />
            <path transform={charm([26, t + 120], [120, 470])} d="M0,-5 A5,5 0 1 0 0,5 A3.4,5 0 1 1 0,-5 Z" />
            <path transform={charm([tieX + 14, t + 190], [176, 540])} d={STAR} />
          </g>
        )}
        {tie > 0 && (
          <g opacity={tie}>
            <Tie theme={theme} x={tieX + 4} y={t + 2} />
          </g>
        )}
        {/* the cloth itself is what's tapped, but not where its hem hangs over the pictures on the wall */}
        {onToggle && (
          <path
            className="tappable"
            role="button"
            d={outline}
            fill="transparent"
            clipPath="url(#curtain-hit)"
            onClick={onToggle}
          />
        )}
      </g>
    </g>
  );
}

function Tie({ theme, x, y }: { theme: Theme; x: number; y: number }) {
  if (theme === 'cozy') {
    return (
      <g transform={`translate(${x} ${y})`}>
        <path className="ink" style={fv('tie')} d="M-30,-4 C-10,-7 10,-7 16,-4 L16,4 C10,7 -10,7 -30,4 Z" />
        <path className="ink" style={fv('tie')} d="M14,0 C24,-14 34,-10 32,-2 C30,4 22,4 14,0 Z" />
        <path className="ink" style={fv('tie')} d="M14,0 C22,10 32,14 32,6 C32,0 24,-2 14,0 Z" />
        <path className="ink" style={fv('tie')} d="M14,2 C16,14 20,26 24,34 L28,30 C22,22 19,12 17,2 Z" />
        <path className="ink" style={fv('tie')} d="M14,2 C12,16 10,26 6,32 L11,34 C15,24 17,14 16,2 Z" />
        <circle className="ink" cx="15" cy="0" r="3.4" style={fv('tie')} />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <path className="ink" style={fv('tie')} d="M-30,-3 C-10,-6 10,-6 14,-3 L14,3 C10,6 -10,6 -30,3 Z" />
      <path d="M-24,-4 L-20,4 M-14,-5 L-10,5 M-4,-5 L0,5 M6,-5 L10,4" stroke="#8f6f36" strokeWidth="1" />
      <path className="ink-thin" fill="none" d="M10,2 C14,10 14,16 12,22" />
      <path className="ink" style={fv('tie')} d="M12,20 C8,20 7,26 8,30 L9,44 L12,42 L13,46 L16,42 L18,44 L17,30 C18,25 16,20 12,20 Z" />
      <path d="M8,26 L17,26" stroke="#8f6f36" strokeWidth="1.2" />
    </g>
  );
}

/** The two panels' outlines at a moment of opening or closing: what hides the sky behind them. */
export function CurtainCover({ p, fill }: { p: number; fill: string }) {
  return (
    <>
      <path d={panelShape(p, LEFT).outline} fill={fill} />
      <path d={panelShape(p, RIGHT).outline} fill={fill} transform="translate(400 0) scale(-1 1)" />
    </>
  );
}

export function Curtains({ theme, p = 0, onToggle }: { theme: Theme; p?: number; onToggle?: () => void }) {
  return (
    <g>
      <defs>
        <clipPath id="curtain-hit">
          <rect x="0" y="0" width="400" height="548" />
        </clipPath>
      </defs>
      <Curtain theme={theme} panel={LEFT} p={p} onToggle={onToggle} />
      <Curtain theme={theme} panel={RIGHT} p={p} mirror onToggle={onToggle} />
      {/* rod */}
      <rect className="ink" x="0" y="30" width="400" height="7" rx="3" style={fv(theme === 'cozy' ? 'sill' : 'frame')} />
      {theme === 'cozy' ? (
        <>
          <circle className="ink" cx="7" cy="33" r="7" style={fv('sill-hi')} />
          <circle className="ink" cx="393" cy="33" r="7" style={fv('sill-hi')} />
        </>
      ) : (
        <>
          <path className="ink" style={fv('tie')} d="M10,24 A10,10 0 1 0 10,44 A7,10 0 1 1 10,24 Z" />
          <path className="ink" style={fv('tie')} d="M390,24 A10,10 0 1 1 390,44 A7,10 0 1 0 390,24 Z" />
        </>
      )}
      {[14, 32, 50, 68].flatMap((x, i) => {
        const at = lerp(x, [14, 74, 134, 194][i]!, p);
        return [at, 400 - at].map((cx, side) => <ellipse key={`${i}-${side}`} className="ink-thin" cx={f(cx)} cy="34" rx="4" ry="6" fill="none" />);
      })}
    </g>
  );
}

export function Shelf() {
  const rope = (x: number) => (
    <g>
      <path d={`M${x},0 L${x},330`} style={sv('ink')} strokeWidth="4" />
      <path d={`M${x},0 L${x},330`} style={sv('rope')} strokeWidth="2.4" />
      <path d={`M${x},0 L${x},330`} stroke="#000" strokeOpacity="0.18" strokeWidth="2.4" strokeDasharray="1.5 3" />
    </g>
  );
  return (
    <g>
      {rope(90)}
      {rope(310)}
      <path className="ink" style={fv('shelf')} d="M72,321 L328,321 L328,327 L72,327 Z" />
      <path className="ink" style={fv('shelf-shade')} d="M72,327 L328,327 L328,333 L72,333 Z" />
      {[90, 310].map((x) => (
        <g key={x}>
          <ellipse className="ink" cx={x} cy={337} rx="4" ry="3.5" style={fv('rope')} />
          <path className="ink-thin" d={`M${x - 1},340 C${x - 2},346 ${x + 1},350 ${x - 1},355 M${x + 1.5},340 C${x + 2},345 ${x + 4},348 ${x + 3},352`} style={sv('ink')} fill="none" />
        </g>
      ))}
    </g>
  );
}

export function Floor() {
  const boards = [-260, -170, -80, 10, 100, 190, 280, 370, 460, 550, 640];
  return (
    <g>
      <rect x="0" y={FLOOR_Y} width="400" height="260" style={fv('floor')} />
      {boards.map((bx) => {
        const topX = 200 + (bx - 200) * 0.55;
        return <path key={bx} d={`M${topX},${FLOOR_Y} L${bx},866`} style={sv('floor-line')} strokeWidth="1.1" opacity="0.7" />;
      })}
      <path d="M118,790 L160,790 M250,768 L290,768 M30,834 L78,834 M318,846 L372,846" style={sv('floor-line')} strokeWidth="1.1" opacity="0.6" />
      <rect x="0" y={FLOOR_Y} width="400" height="16" style={fv('floor-shade')} opacity="0.6" />
      <path className="ink" style={fv('skirting')} d={`M-2,${FLOOR_Y - 16} L402,${FLOOR_Y - 16} L402,${FLOOR_Y + 2} L-2,${FLOOR_Y + 2} Z`} />
      <path d={`M0,${FLOOR_Y - 11} L400,${FLOOR_Y - 11}`} style={sv('skirting-shade')} strokeWidth="1.5" />
    </g>
  );
}

/** How wide the words may be on each board; a longer name is drawn a little smaller to fit. */
const SIGN_ROOM = { cozy: 118, witchy: 122 } as const;

/** Shrinks the words to fit the board, measured once the font is ready (it changes the width). */
function useFitted(text: string, room: number) {
  const ref = useRef<SVGTextElement>(null);
  const [k, setK] = useState(1);
  useLayoutEffect(() => {
    let live = true;
    const measure = () => {
      const el = ref.current;
      if (!live || !el) return;
      const w = el.getComputedTextLength();
      setK(w > room ? room / w : 1);
    };
    measure();
    // the handwriting may not have arrived yet (on an iPhone it often hasn't even been asked for):
    // ask for it, and measure again whenever fonts finish loading
    const fonts = document.fonts;
    void fonts?.ready.then(measure);
    void fonts?.load('700 21px Kalam').then(measure, () => {});
    void fonts?.load('600 22px "Grenze Gotisch"').then(measure, () => {});
    fonts?.addEventListener?.('loadingdone', measure);
    const late = window.setTimeout(measure, 1500);
    return () => {
      live = false;
      fonts?.removeEventListener?.('loadingdone', measure);
      window.clearTimeout(late);
    };
  }, [text, room]);
  return { ref, k };
}

export function Sign({ theme, name = null, onTap }: { theme: Theme; name?: string | null; onTap?: () => void }) {
  const cozy = theme === 'cozy';
  const { t } = useWords();
  const text = name?.trim() || (cozy ? t("Olcia's garden", 'Ogródek Olci') : t("Olcia's Garden", 'Ogród Olci'));
  const { ref, k } = useFitted(text, cozy ? SIGN_ROOM.cozy : SIGN_ROOM.witchy);
  const fit = (y: number) => (k < 1 ? `translate(200 ${y}) scale(${k.toFixed(3)}) translate(-200 ${-y})` : undefined);
  return (
    <g className={onTap ? 'tappable' : undefined} onClick={onTap}>
      <path d="M200,566 L146,592 M200,566 L254,592" className="ink-thin" fill="none" />
      <circle cx="200" cy="566" r="2.4" className="ink-thin" style={fv('ink')} />
      <g transform="rotate(-2.5 200 606)">
        {cozy ? (
          <>
            <path className="ink" style={fv('sign-bg')} d="M134,590 L266,588 C267,600 266,614 267,626 L135,628 C133,616 135,602 134,590 Z" />
            <path d="M138,622 L264,620" style={sv('sign-shade')} strokeWidth="3" />
            <text ref={ref} x="200" y="615" transform={fit(608)} textAnchor="middle" fontFamily="Kalam" fontWeight="700" fontSize="21" style={fv('sign-ink')}>
              {text}
            </text>
          </>
        ) : (
          <>
            <path className="ink" fill="#5a4234" d="M128,586 L272,584 L273,632 L129,634 Z" />
            <path style={fv('sign-bg')} d="M134,591 L267,589 L268,627 L135,629 Z" />
            <path d="M140,600 C170,598 190,604 220,598" stroke="#fff" strokeOpacity="0.06" strokeWidth="6" fill="none" />
            <text ref={ref} x="200" y="618" transform={fit(610)} textAnchor="middle" fontFamily="Grenze Gotisch" fontWeight="600" fontSize="22" style={fv('sign-ink')} opacity="0.92">
              {text}
            </text>
            <path d="M146,598 A3.5,3.5 0 1 0 146,605 A2.4,3.5 0 1 1 146,598 Z M256,618 l0.6,2 l2,0.6 l-2,0.6 l-0.6,2 l-0.6,-2 l-2,-0.6 l2,-0.6 Z" style={fv('sign-ink')} opacity="0.85" />
          </>
        )}
      </g>
    </g>
  );
}
