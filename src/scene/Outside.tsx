import type { Weather } from '../theme/palettes';
import { fv, seeded } from './geometry';

function Tree({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path className="ink-thin" fill="none" d={`M0,0 L0,${-r * 0.9}`} />
      <path
        className="ink-thin"
        style={fv('tree')}
        d={`M0,${-r * 0.4} C${-r * 1.1},${-r * 0.5} ${-r * 1.1},${-r * 2.3} 0,${-r * 2.4} C${r * 1.1},${-r * 2.3} ${r * 1.1},${-r * 0.5} 0,${-r * 0.4} Z`}
      />
      <path style={fv('tree-shade')} d={`M${r * 0.15},${-r * 0.45} C${r * 0.9},${-r * 0.6} ${r * 1},${-r * 1.6} ${r * 0.7},${-r * 2} C${r * 0.5},${-r * 1.3} ${r * 0.3},${-r * 0.8} ${r * 0.15},${-r * 0.45} Z`} />
    </g>
  );
}

function House({ x, y, w, h, lit }: { x: number; y: number; w: number; h: number; lit: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path className="ink-thin" style={fv('house')} d={`M0,0 L0,${-h} L${w},${-h} L${w},0 Z`} />
      <path className="ink-thin" style={fv('roof')} d={`M-2,${-h} L${w / 2},${-h - w * 0.62} L${w + 2},${-h} Z`} />
      <rect x={w * 0.35} y={-h * 0.72} width={w * 0.3} height={h * 0.34} fill={lit ? '#f4c66c' : 'var(--roof)'} opacity={lit ? 1 : 0.5} />
    </g>
  );
}

export function Landscape({ weather }: { weather: Weather }) {
  const lit = weather.night;
  return (
    <g>
      <path
        className="ink-soft"
        style={fv('hill-far')}
        d="M40,446 C92,424 140,436 186,430 C236,424 280,408 360,420 L360,530 L40,530 Z"
      />
      <Tree x={74} y={444} r={6} />
      <Tree x={88} y={440} r={7.5} />
      <Tree x={150} y={434} r={6.5} />
      <Tree x={318} y={418} r={7} />
      <Tree x={332} y={421} r={5.5} />
      <path
        className="ink-soft"
        style={fv('hill-near')}
        d="M40,476 C86,458 140,462 196,474 C246,484 292,458 360,462 L360,530 L40,530 Z"
      />
      {/* a little village on the near hill, with a crooked church spire */}
      <House x={226} y={474} w={13} h={10} lit={lit} />
      <House x={243} y={471} w={11} h={12} lit={false} />
      <g transform="translate(262 468)">
        <path className="ink-thin" style={fv('house')} d="M0,0 L0,-20 L10,-20 L10,0 Z" />
        <path className="ink-thin" style={fv('roof')} d="M-1,-20 L5.5,-46 L11,-20 Z" />
        <rect x="3.5" y="-15" width="3" height="5" fill={lit ? '#f4c66c' : 'var(--roof)'} opacity={lit ? 1 : 0.5} />
      </g>
      <House x={278} y={466} w={14} h={11} lit={lit} />
      <Tree x={300} y={464} r={6} />
      <Tree x={60} y={474} r={8} />
      <Tree x={118} y={466} r={6} />
    </g>
  );
}

const rainRnd = seeded(7);
/** Positions as fractions of the window, so the same rain fits any window. */
const RAIN = Array.from({ length: 70 }, () => ({
  x: rainRnd(),
  y: rainRnd(),
  l: 9 + rainRnd() * 9,
  o: 0.35 + rainRnd() * 0.4,
}));

const dropRnd = seeded(41);
const DROPS = Array.from({ length: 34 }, () => ({
  x: 0.07 + dropRnd() * 0.86,
  y: 0.1 + dropRnd() * 0.88,
  r: 1.2 + dropRnd() * 2.4,
}));

const RIVULETS: Array<[number, number, string, string]> = [
  [0.2, 0.17, '9s', '0s'],
  [0.62, 0.25, '11s', '-4s'],
  [0.86, 0.46, '8s', '-2s'],
];

export type Box = { x: number; y: number; w: number; h: number };
const BIG_WINDOW: Box = { x: 40, y: 40, w: 360, h: 480 };

function Drop({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d={`M0,${-r * 1.3} C${r * 0.7},${-r * 0.4} ${r},${r * 0.2} ${r},${r * 0.45} C${r},${r * 1.1} ${-r},${r * 1.1} ${-r},${r * 0.45} C${-r},${r * 0.2} ${-r * 0.7},${-r * 0.4} 0,${-r * 1.3} Z`}
        fill="#dfe6ee"
        fillOpacity={0.28}
        stroke="#2c3647"
        strokeOpacity={0.35}
        strokeWidth={0.6}
      />
      <circle cx={-r * 0.35} cy={r * 0.1} r={r * 0.28} fill="#fff" opacity={0.75} />
    </g>
  );
}

/** Falling rain outside and droplets on the glass. Rendered inside the window clip. */
export function Rain({ box = BIG_WINDOW, density = 1, dropScale = 1 }: { box?: Box; density?: number; dropScale?: number }) {
  const { x, y, w, h } = box;
  const streaks = RAIN.slice(0, Math.round(RAIN.length * density));
  return (
    <g>
      <g className="rainfall" style={{ ['--fall' as string]: `${h}px` }}>
        {[0, -h].map((off) => (
          <g key={off} transform={`translate(0 ${off})`}>
            {streaks.map((d, i) => (
              <path
                key={i}
                d={`M${(x + d.x * w).toFixed(1)},${(y + d.y * h).toFixed(1)} l-3,${(d.l * dropScale).toFixed(1)}`}
                stroke="#dbe3ea"
                strokeOpacity={d.o}
                strokeWidth={1.1 * dropScale}
                strokeLinecap="round"
              />
            ))}
          </g>
        ))}
      </g>
      {DROPS.map((d, i) => (
        <Drop key={i} x={x + d.x * w} y={y + d.y * h} r={d.r * dropScale} />
      ))}
      {RIVULETS.map(([fx, fy, dur, delay], i) => (
        <g key={i} className="rivulet" style={{ animationDuration: dur, animationDelay: delay }}>
          <path d={`M${x + fx * w},${y + fy * h - 30} l0.6,30`} stroke="#e6ecf2" strokeOpacity={0.35} strokeWidth={1.4} strokeLinecap="round" />
          <Drop x={x + fx * w + 0.6} y={y + fy * h} r={2.8 * dropScale} />
        </g>
      ))}
    </g>
  );
}
