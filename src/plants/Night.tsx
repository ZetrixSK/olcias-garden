import type { Stage } from '../garden/species';
import { SeedMarker, Stem } from './common';

// ---------- kwiat nietoperza: bat flower (Tacca chantrieri) ----------

/** Near-black plum bracts with wine veins, as the real flower is in shade. */
const BAT = { wing: '#2b1b2e', vein: '#5a3a58', hi: '#6c4a68', flower: '#4a2238', whisker: '#2f1d2b', whisker2: '#553450' };
const BAT_LEAF = { base: '#456f4c', shade: '#365b3e', vein: '#2c4c34', hi: '#7aa27a' };

/** A broad, glossy, pleated leaf on a long stalk from the base, the way Tacca leaves stand. */
function TaccaLeaf({ rot, len, s = 1 }: { rot: number; len: number; s?: number }) {
  return (
    <g transform={`rotate(${rot})`}>
      <path d={`M0,0 L0,${-len}`} stroke="#4f7a4c" strokeWidth="1.7" strokeLinecap="round" />
      <g transform={`translate(0 ${-len}) scale(${s})`}>
        <path className="ink-thin" fill={BAT_LEAF.base} d="M0,0 C-9,-4 -12,-14 -10,-24 C-8,-31 -3,-35 0,-37 C3,-35 8,-31 10,-24 C12,-14 9,-4 0,0 Z" />
        <path d="M0,-1 C5,-5 10,-14 9.6,-24 C8,-31 3,-35 0,-37 Z" fill={BAT_LEAF.shade} opacity="0.55" />
        {/* the pleats: curved side veins sweeping up from the midrib */}
        <path
          d="M0,-1 L0,-35 M0,-8 C-4,-10 -7,-13 -8.6,-18 M0,-15 C-3.6,-17 -6,-21 -7,-26 M0,-22 C-2.6,-24 -4,-28 -4.6,-31 M0,-8 C4,-10 7,-13 8.6,-18 M0,-15 C3.6,-17 6,-21 7,-26 M0,-22 C2.6,-24 4,-28 4.6,-31"
          fill="none"
          stroke={BAT_LEAF.vein}
          strokeWidth="0.7"
        />
        <path d="M-6,-7 C-8.4,-14 -8,-22 -5,-29" fill="none" stroke={BAT_LEAF.hi} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      </g>
    </g>
  );
}

/** One wing-like bract: broad, swept up and out, with the scalloped trailing edge between its "finger" veins. */
function Wing() {
  return (
    <g>
      <path
        className="ink-thin"
        fill={BAT.wing}
        d="M0,-2 C-5,-17 -22,-31 -44,-33 C-43.4,-25 -41,-18.6 -36,-14.4 C-33,-15.6 -28,-12.6 -27,-6.4 C-23,-7.6 -18,-4.6 -17,0.6 C-13,-0.4 -8.4,2.4 -6.4,6 C-4,5 -2,3.6 0,2 Z"
      />
      {/* the inner half catches less light */}
      <path d="M0,-2 C-3,-9 -8,-15 -14,-20 C-12,-12 -10,-4 -6.4,6 C-4,5 -2,3.6 0,2 Z" fill="#1f1422" opacity="0.6" />
      {/* finger veins from the centre to each point of the scallops */}
      <path
        d="M-1,0 C-14,-10 -28,-22 -43,-32 M-1,0 C-12,-6 -24,-11 -35.6,-14.6 M-1,0 C-9,-3 -18,-5 -26.6,-6.6 M-1,0 C-6,-0.4 -12,0 -16.8,0.4"
        fill="none"
        stroke={BAT.vein}
        strokeWidth="0.75"
      />
      <path d="M-3,-8 C-12,-18 -24,-27 -40,-31" fill="none" stroke={BAT.hi} strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
    </g>
  );
}

/**
 * The trailing whiskers: long thin threads from under the flowers, falling in soft S-curves of
 * different lengths and curling at their ends. They hang from their tops and drift a little.
 */
function Whiskers({ n, len }: { n: number; len: number }) {
  const threads = Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const x0 = (t - 0.5) * 10;
    const spread = (t - 0.5) * 36;
    const sway = Math.sin(i * 2.1 + 0.6) * 5;
    const l = len * (0.5 + 0.5 * Math.abs(Math.sin(i * 1.37 + 0.9)));
    const curl = i % 2 ? 1 : -1;
    const k = 0.8 + 0.5 * Math.abs(Math.sin(i * 0.9));
    const f = (v: number) => v.toFixed(1);
    const d =
      `M${f(x0)},3 C${f(x0 + spread * 0.1)},${f(l * 0.25)} ${f(x0 + spread * 0.55 - sway)},${f(l * 0.4)} ${f(x0 + spread * 0.7)},${f(l * 0.6)}` +
      ` S${f(x0 + spread + sway)},${f(l * 0.88)} ${f(x0 + spread + sway * 0.4)},${f(l)}` +
      ` c${f(curl * 2.6 * k)},${f(2.2 * k)} ${f(curl * 5 * k)},${f(-0.4 * k)} ${f(curl * 3.4 * k)},${f(-3.6 * k)}`;
    const edge = Math.abs(t - 0.5) > 0.36;
    return <path key={i} d={d} fill="none" stroke={i % 3 === 1 ? BAT.whisker2 : BAT.whisker} strokeWidth={edge ? 0.5 : i % 3 === 1 ? 0.6 : 0.75} strokeLinecap="round" />;
  });
  return <g className="whiskers">{threads}</g>;
}

/** The open flower head: two great wings, two little "ears", a cluster of dark flowers and the whiskers. */
export function BatFlowerHead({ x, y, rot = 0, s = 1, whiskers = 16 }: { x: number; y: number; rot?: number; s?: number; whiskers?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <Whiskers n={whiskers} len={66} />
      {/* spread a little lower than a V, the way the real bracts open wide */}
      <g transform="rotate(-12)">
        <Wing />
      </g>
      <g transform="scale(-1 1) rotate(-12)">
        <Wing />
      </g>
      {/* the two small inner bracts stand up like ears */}
      <path className="ink-thin" fill={BAT.wing} d="M-1.4,-2 C-3,-6 -4.6,-10 -6,-14 C-3.6,-11 -1.6,-7 0,-3 Z M1.4,-2 C3,-6 4.6,-10 6,-14 C3.6,-11 1.6,-7 0,-3 Z" />
      {/* the flowers themselves: small dark bells, nodding on short stalks */}
      {[
        [-5, 3, -30],
        [0, 5, 0],
        [5, 3, 30],
        [-2.6, 7.4, -12],
        [2.8, 7.6, 14],
      ].map(([fx, fy, r], i) => (
        <g key={i} transform={`translate(${fx} ${fy}) rotate(${r})`}>
          <path d="M0,-3 L0,0" stroke={BAT.vein} strokeWidth="0.7" />
          <path className="ink-thin" fill={BAT.flower} d="M-2.4,0 C-2.8,2.6 -1.6,4.4 0,4.6 C1.6,4.4 2.8,2.6 2.4,0 C1.2,-0.6 -1.2,-0.6 -2.4,0 Z" />
          <path d="M-1,1 C-1.2,2.2 -0.8,3 0,3.4" fill="none" stroke={BAT.hi} strokeWidth="0.6" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

/** Not yet open: the wings folded down around the flowers, so the bud hangs like a sleeping bat. */
function SleepingBat({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path className="ink-thin" fill={BAT.wing} d="M0,0 C-6,2 -8.4,10 -6.4,18 C-4.4,23 4.4,23 6.4,18 C8.4,10 6,2 0,0 Z" />
      <path d="M-3,3 C-5.4,9 -5.4,14 -3.4,19.4 M3,3 C5.4,9 5.4,14 3.4,19.4 M0,2 L0,20" fill="none" stroke={BAT.vein} strokeWidth="0.7" />
      <path d="M-4,5 C-5.6,9 -5.6,13 -4.4,16" fill="none" stroke={BAT.hi} strokeWidth="0.9" strokeLinecap="round" />
      {/* ears at the bottom: it hangs head down */}
      <path className="ink-thin" fill={BAT.wing} d="M-3.4,20.6 L-5.4,26 L-1.2,21.6 Z M3.4,20.6 L5.4,26 L1.2,21.6 Z" />
      <path d="M-1.6,22 C-2,25 -1,28 -2.4,31 M1.2,22.2 C1.8,25.4 0.6,28 1.8,31.6" fill="none" stroke={BAT.whisker} strokeWidth="0.6" strokeLinecap="round" />
    </g>
  );
}

export function BatFlowerPlant({ stage, label = 'nietoperz' }: { stage: Stage; label?: string }) {
  if (stage === 'seed') {
    return (
      <g>
        <path d="M-12,0 C-8,-3 6,-3.5 12,-0.5" fill="none" stroke="#3a281f" strokeWidth="1.2" />
        {/* small kidney-shaped seeds, dark as the flower will be */}
        {[
          [-5, -2, -20],
          [0.6, -2.8, 14],
          [4.4, -1.6, -6],
        ].map(([x, y, r]) => (
          <path key={x} transform={`translate(${x} ${y}) rotate(${r})`} className="ink-thin" fill="#3e2a32" d="M-1.8,0 C-1.8,-1.6 1.8,-1.6 1.8,0 C1.8,1.2 0.6,1.4 0,0.8 C-0.6,1.4 -1.8,1.2 -1.8,0 Z" />
        ))}
        <SeedMarker label={label} />
      </g>
    );
  }
  if (stage === 'seedling') {
    return (
      <g>
        <TaccaLeaf rot={-16} len={6} s={0.45} />
        {/* the next leaf still rolled up tight, pushing through */}
        <g transform="rotate(12)">
          <Stem d="M0,0 L0,-8" w={1.2} color="#4f7a4c" />
          <path className="ink-thin" fill="#5d8a5c" d="M0,-6 C-2,-9 -2,-15 0,-20 C2,-15 2,-9 0,-6 Z" />
          <path d="M0.4,-8 C1.2,-11 1.2,-15 0.4,-18" fill="none" stroke={BAT_LEAF.vein} strokeWidth="0.6" />
        </g>
      </g>
    );
  }
  if (stage === 'bud') {
    return (
      <g>
        <TaccaLeaf rot={-62} len={10} s={0.85} />
        <TaccaLeaf rot={58} len={12} s={0.8} />
        {/* the stalk arches over at the top, and the folded bud hangs from it */}
        <Stem d="M1,0 C2,-26 4,-52 10,-64 C14,-71 20,-72 22,-66" w={2.2} color="#4a5e44" />
        <SleepingBat x={22} y={-66} s={1.15} />
        <TaccaLeaf rot={-22} len={18} s={0.85} />
        <TaccaLeaf rot={24} len={22} s={0.75} />
      </g>
    );
  }
  return (
    <g>
      <TaccaLeaf rot={-66} len={10} s={1} />
      <TaccaLeaf rot={62} len={12} s={0.95} />
      <Stem d="M1,0 C2,-36 1,-72 -1,-100" w={2.4} color="#4a5e44" />
      <TaccaLeaf rot={-28} len={20} s={0.9} />
      <TaccaLeaf rot={30} len={24} s={0.82} />
      <g className="bat-head">
        <BatFlowerHead x={-1} y={-102} s={1.12} />
      </g>
      {/* a second, younger head still folded */}
      <Stem d="M1,-30 C10,-44 16,-56 20,-62" w={1.6} color="#4a5e44" />
      <SleepingBat x={20} y={-62} s={0.72} />
    </g>
  );
}

// ---------- kwiat księżyca: moonflower (Ipomoea alba) ----------

const MOON = { petal: '#fbf8ef', star: '#e3e8c2', throat: '#f1e9b0', eye: '#c9cf86', shade: '#e9e4d2', bud: '#eef0dc', budLine: '#c9cfa6' };
const MOON_LEAF = { base: '#5e8f58', shade: '#4a7646', vein: '#3f6339' };
const WIRE = '#3a2f2a';

/** The five-sided face of an open moonflower, points slightly drawn out, as a path around (0,0). */
const FACE = (() => {
  const pt = (deg: number, r: number) => [Math.cos((deg * Math.PI) / 180) * r, Math.sin((deg * Math.PI) / 180) * r] as const;
  let d = '';
  for (let k = 0; k < 5; k++) {
    const a = k * 72 - 90;
    const [px, py] = pt(a, 13);
    // the edges bulge out between the five points, so the face is round with just a hint of a star
    const [cx, cy] = pt(a + 36, 14.3);
    const [nx, ny] = pt(a + 72, 13);
    if (k === 0) d += `M${px.toFixed(2)},${py.toFixed(2)} `;
    d += `Q${cx.toFixed(2)},${cy.toFixed(2)} ${nx.toFixed(2)},${ny.toFixed(2)} `;
  }
  return `${d}Z`;
})();

const STAR = [0, 1, 2, 3, 4]
  .map((k) => {
    const a = ((k * 72 - 90) * Math.PI) / 180;
    return `M0,0 L${(Math.cos(a) * 12.4).toFixed(2)},${(Math.sin(a) * 12.4).toFixed(2)}`;
  })
  .join(' ');

/** A heart-shaped leaf, its stalk at the notch. */
function HeartLeaf({ x, y, rot, s = 1 }: { x: number; y: number; rot: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0,4 L0,0" stroke="#6e9152" strokeWidth="1.2" />
      <path className="ink-thin" fill={MOON_LEAF.base} d="M0,0 C-3,3 -10,2 -11,-4 C-12,-11 -5,-17 0,-21 C5,-17 12,-11 11,-4 C10,2 3,3 0,0 Z" />
      <path d="M0,0 C3,3 10,2 11,-4 C12,-11 5,-17 0,-21 Z" fill={MOON_LEAF.shade} opacity="0.5" />
      <path d="M0,-1 L0,-19 M0,-5 C-3,-6 -6,-7 -8,-6 M0,-10 C-3,-11 -5,-13 -6,-15 M0,-5 C3,-6 6,-7 8,-6 M0,-10 C3,-11 5,-13 6,-15" fill="none" stroke={MOON_LEAF.vein} strokeWidth="0.6" />
    </g>
  );
}

/** A flower furled for the day: a plump bud twisted like a closed umbrella, green where it joins its calyx. */
function Furled({ x, y, rot, s = 1 }: { x: number; y: number; rot: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path className="ink-thin" fill={MOON.bud} d="M0,0 C-3.6,-4 -4,-12 -1.2,-21 C-0.4,-23.6 0.8,-24 1.4,-21.4 C3.8,-12 3.2,-4 0,0 Z" />
      <path d="M0,0 C-3.6,-4 -3.8,-8 -3.2,-11 C-1.4,-8 0.4,-4 0,0 Z" fill="#dfe6c0" />
      <path
        d="M-3.2,-5 C-1,-6.4 1.6,-8.4 2.4,-11.6 M-3.6,-10.6 C-1.4,-12 1.2,-14.4 1.8,-17.4 M-2.4,-15.8 C-1,-17.4 0.4,-19.4 0.8,-21.6"
        fill="none"
        stroke={MOON.budLine}
        strokeWidth="0.75"
        strokeLinecap="round"
      />
      <path className="ink-thin" fill="#7fa063" d="M-2.6,1.4 C-3.4,-1.6 -2,-4 0,-4.8 C2,-4 3.4,-1.6 2.6,1.4 C1,0.6 -1,0.6 -2.6,1.4 Z" />
    </g>
  );
}

/**
 * An open flower seen at an angle (`tilt` squashes it towards side-on): the pale five-pointed face
 * with its star of green-cream ribs and its yellow throat, at the end of its long tube.
 */
export function MoonFace({ x, y, rot = 0, tilt = 1, s = 1 }: { x: number; y: number; rot?: number; tilt?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path className="ink-thin" fill="#dfe6c0" d="M-1.4,4 L-1,15 C-0.6,16 0.6,16 1,15 L1.4,4 Z" />
      <g transform={`scale(1 ${tilt})`}>
        <path className="ink-thin" fill={MOON.petal} d={FACE} />
        <path d={FACE} fill={MOON.shade} transform="scale(0.62)" opacity="0.6" />
        <path d={STAR} fill="none" stroke={MOON.star} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M-9,-5 C-7,-9 -3,-11 1,-11.4" fill="none" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" opacity="0.9" />
        <circle r="3.2" fill={MOON.throat} />
        <circle r="1.3" fill={MOON.eye} />
      </g>
    </g>
  );
}

/** Where the flowers sit on the plant in bloom: x, y, angle, tilt, size. */
const MOON_FLOWERS: [number, number, number, number, number][] = [
  [-14, -98, -16, 0.86, 1.05],
  [16, -116, 12, 0.92, 1],
  [-6, -64, -30, 0.7, 0.92],
];

/** A pale moth that comes to the flowers at night, as their real moths do. */
function Moth() {
  return (
    <g transform="translate(24 -132)">
      <g className="flit" style={{ animationDuration: '11s' }}>
        <path className="ink-thin" fill="#e9e1cc" d="M0,0 C-5,-6 -11,-5 -10,0 C-9,3 -4,3 0,1 Z M0,0 C5,-6 11,-5 10,0 C9,3 4,3 0,1 Z" />
        <path className="ink-thin" fill="#ddd2b6" d="M0,1 C-4,3 -7,6 -5,8 C-3,9 -1,6 0,2 Z M0,1 C4,3 7,6 5,8 C3,9 1,6 0,2 Z" />
        <path d="M-6,-1.4 C-5,-2.4 -4,-2.4 -3.4,-1.4 M6,-1.4 C5,-2.4 4,-2.4 3.4,-1.4" fill="none" stroke="#b8a986" strokeWidth="0.7" />
        <ellipse cx="0" cy="1.6" rx="1.1" ry="3.4" fill="#b9ad90" className="ink-thin" />
        <path d="M-0.4,-1.6 C-1.6,-4 -3,-5 -4,-5.4 M0.4,-1.6 C1.6,-4 3,-5 4,-5.4" fill="none" stroke="#8f8468" strokeWidth="0.5" />
      </g>
    </g>
  );
}

/** The little wire trellis it climbs: a stake with a crescent moon at the top, touched with gold. */
function MoonTrellis({ h }: { h: number }) {
  const cy = -h - 14;
  return (
    <g strokeLinecap="round">
      <path d={`M0,2 L0,${-h + 1}`} stroke={WIRE} strokeWidth="1.6" fill="none" />
      <g transform={`translate(0 ${cy}) rotate(-18)`}>
        <path className="ink-thin" fill="#d9b867" d="M6,-13.7 A15,15 0 1,0 6,13.7 A16.5,16.5 0 0,1 6,-13.7 Z" />
        <path d="M-6,-9 A10,10 0 0,0 -7,7" fill="none" stroke="#f3dc98" strokeWidth="1.1" />
      </g>
    </g>
  );
}

/** The vine twining around the stake: a loose, uneven helix, passing in front of and behind it. */
function Twine({ h, from = 0 }: { h: number; from?: number }) {
  const turns = Math.max(1, Math.round((h - from) / 26));
  const f = (v: number) => v.toFixed(1);
  let d = `M0,${-from}`;
  for (let i = 0; i < turns; i++) {
    const y0 = -from - (i * (h - from)) / turns;
    const y1 = -from - ((i + 1) * (h - from)) / turns;
    const ym = (y0 + y1) / 2 + (i % 2 ? 2 : -2);
    const a = 5 + (i % 3) * 1.2;
    const b = 4 + ((i + 1) % 3) * 1.1;
    d += ` C${f(a)},${f(y0 - 2)} ${f(a + 1)},${f(ym + 4)} 0,${f(ym)} C${f(-b)},${f(ym - 4)} ${f(-b - 1)},${f(y1 + 3)} 0,${f(y1)}`;
  }
  return <Stem d={d} w={1.4} color="#6e9152" />;
}

/**
 * The flowers that glow, drawn on their own: these are drawn a second time above the room's night
 * tint so they shine through the dark, with a soft halo each and, now and then, a moth.
 */
export function MoonflowerGlow({ stage }: { stage: Stage }) {
  if (stage !== 'bloom') return null;
  return (
    <g className="moon-night" pointerEvents="none">
      <defs>
        <radialGradient id="moonflower-halo">
          <stop offset="0" stopColor="#fbf6dc" stopOpacity="0.62" />
          <stop offset="0.45" stopColor="#e9efc9" stopOpacity="0.22" />
          <stop offset="1" stopColor="#e9efc9" stopOpacity="0" />
        </radialGradient>
      </defs>
      {MOON_FLOWERS.map(([x, y, r, t, s], i) => (
        <g key={i}>
          <circle className="moon-halo" style={{ animationDelay: `${-i * 1.7}s` }} cx={x} cy={y} r={30 * s} fill="url(#moonflower-halo)" />
          <g className="moon-open">
            <MoonFace x={x} y={y} rot={r} tilt={t} s={s} />
          </g>
        </g>
      ))}
      <Moth />
    </g>
  );
}

export function MoonflowerPlant({ stage, label = 'księżyc' }: { stage: Stage; label?: string }) {
  if (stage === 'seed') {
    return (
      <g>
        <path d="M-12,0 C-8,-3 6,-3.5 12,-0.5" fill="none" stroke="#3a281f" strokeWidth="1.2" />
        {/* big, smooth, ivory seeds */}
        <path className="ink-thin" fill="#efe4c8" d="M-8,-1 C-8,-4.6 -3,-5 -2.4,-2 C-2.2,0 -4,0.4 -5.2,0 C-6.6,0.4 -8,0.2 -8,-1 Z" />
        <path className="ink-thin" fill="#e6d9b8" d="M1,-1.4 C1.4,-5 6.4,-4.6 6.4,-1.4 C6.2,0.4 4.4,0.6 3.6,0 C2.6,0.6 0.8,0.4 1,-1.4 Z" />
        <SeedMarker label={label} />
      </g>
    );
  }
  if (stage === 'seedling') {
    return (
      <g>
        <Stem d="M0,0 C0,-6 0,-10 0,-14" w={1.3} color="#6e9152" />
        {/* the two seed leaves of a morning glory: wide and deeply notched, like a butterfly */}
        <path className="ink-thin" fill="#7fa86a" d="M0,-14 C-3,-12 -9,-12 -12,-15 C-14,-17 -13,-21 -10,-21 C-9,-18 -7,-17 -6,-19 C-5,-22 -1,-21 0,-14 Z" />
        <path className="ink-thin" fill="#7fa86a" d="M0,-14 C3,-12 9,-12 12,-15 C14,-17 13,-21 10,-21 C9,-18 7,-17 6,-19 C5,-22 1,-21 0,-14 Z" />
        <HeartLeaf x={0} y={-15} rot={8} s={0.42} />
      </g>
    );
  }
  if (stage === 'bud') {
    return (
      <g>
        <MoonTrellis h={92} />
        <Twine h={78} />
        <HeartLeaf x={-3} y={-14} rot={-58} s={0.8} />
        <HeartLeaf x={4} y={-30} rot={52} s={0.82} />
        <HeartLeaf x={-4} y={-48} rot={-44} s={0.75} />
        <HeartLeaf x={4} y={-64} rot={40} s={0.66} />
        <Furled x={-4} y={-58} rot={-32} s={0.8} />
        <Furled x={5} y={-74} rot={24} s={0.7} />
        <path d="M0,-78 C3,-82 6,-82 7,-86 C8,-89 5,-90 4.6,-88" fill="none" stroke="#6e9152" strokeWidth="0.9" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      <MoonTrellis h={126} />
      <Twine h={112} />
      {/* the tip of the vine reaching up for the moon */}
      <Stem d="M0,-112 C-4,-116 -7,-120 -9,-126" w={1.1} color="#6e9152" />
      <HeartLeaf x={-3} y={-14} rot={-62} s={0.92} />
      <HeartLeaf x={4} y={-28} rot={56} s={0.95} />
      <HeartLeaf x={-4} y={-46} rot={-50} s={0.9} />
      <HeartLeaf x={4} y={-74} rot={46} s={0.85} />
      <HeartLeaf x={-4} y={-90} rot={-40} s={0.8} />
      <HeartLeaf x={4} y={-104} rot={36} s={0.72} />
      <HeartLeaf x={-8} y={-120} rot={-62} s={0.55} />
      {/* stalks out to where the flowers are */}
      <Stem d="M-1,-86 C-6,-88 -10,-92 -12,-96" w={1} color="#6e9152" />
      <Stem d="M1,-104 C8,-106 13,-110 15,-114" w={1} color="#6e9152" />
      <Stem d="M-1,-52 C-3,-56 -4,-60 -5,-62" w={1} color="#6e9152" />
      {/* by day the flowers are furled; at dusk they open, white, and at night they glow */}
      <g className="moon-day">
        {MOON_FLOWERS.map(([x, y, r, , s], i) => (
          <Furled key={i} x={x} y={y + 9} rot={r} s={s} />
        ))}
      </g>
      <g className="moon-night">
        {MOON_FLOWERS.map(([x, y, r, t, s], i) => (
          <g key={i} className="moon-open">
            <MoonFace x={x} y={y} rot={r} tilt={t} s={s} />
          </g>
        ))}
      </g>
      <Furled x={7} y={-88} rot={30} s={0.62} />
    </g>
  );
}
