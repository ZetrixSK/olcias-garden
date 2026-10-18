import type { Weather } from '../theme/palettes';
import type { Season } from '../theme/seasons';
import { fv, seeded } from './geometry';

/** A bare winter tree: trunk and a few forked branches, with snow resting on them. */
function BareTree({ x, y, r }: { x: number; y: number; r: number }) {
  const h = r * 2.3;
  return (
    <g transform={`translate(${x} ${y})`} fill="none" strokeLinecap="round">
      <path
        d={`M0,0 L0,${-h} M0,${-h * 0.45} L${-r * 0.8},${-h * 0.8} M0,${-h * 0.6} L${r * 0.75},${-h * 0.92} M${-r * 0.4},${-h * 0.62} L${-r * 0.55},${-h * 0.98} M0,${-h * 0.8} L${r * 0.35},${-h * 1.05}`}
        style={{ stroke: 'var(--tree)' }}
        strokeWidth={0.9}
      />
      <path d={`M${-r * 0.75},${-h * 0.79} l${r * 0.3},${r * 0.2} M${r * 0.7},${-h * 0.9} l${-r * 0.28},${r * 0.2}`} stroke="#f4f6f8" strokeWidth={0.9} />
    </g>
  );
}

function Blossom({ x, y, r, seed }: { x: number; y: number; r: number; seed: number }) {
  const rnd = seeded(seed);
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={(rnd() - 0.5) * r * 1.4} cy={-r * (0.8 + rnd() * 1.4)} r={0.7 + rnd() * 0.5} fill={i % 3 ? '#f6c9d6' : '#fdf0f3'} />
      ))}
    </g>
  );
}

function Tree({ x, y, r, season = 'summer' }: { x: number; y: number; r: number; season?: Season }) {
  if (season === 'winter') return <BareTree x={x} y={y} r={r} />;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path className="ink-thin" fill="none" d={`M0,0 L0,${-r * 0.9}`} />
      <path
        className="ink-thin"
        style={fv('tree')}
        d={`M0,${-r * 0.4} C${-r * 1.1},${-r * 0.5} ${-r * 1.1},${-r * 2.3} 0,${-r * 2.4} C${r * 1.1},${-r * 2.3} ${r * 1.1},${-r * 0.5} 0,${-r * 0.4} Z`}
      />
      <path style={fv('tree-shade')} d={`M${r * 0.15},${-r * 0.45} C${r * 0.9},${-r * 0.6} ${r * 1},${-r * 1.6} ${r * 0.7},${-r * 2} C${r * 0.5},${-r * 1.3} ${r * 0.3},${-r * 0.8} ${r * 0.15},${-r * 0.45} Z`} />
      {season === 'spring' && <Blossom x={0} y={0} r={r} seed={Math.round(x * 7 + y)} />}
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

export function Landscape({ weather, season = 'summer' }: { weather: Weather; season?: Season }) {
  const lit = weather.night;
  return (
    <g>
      <path
        className="ink-soft"
        style={fv('hill-far')}
        d="M40,446 C92,424 140,436 186,430 C236,424 280,408 360,420 L360,530 L40,530 Z"
      />
      <Tree season={season} x={74} y={444} r={6} />
      <Tree season={season} x={88} y={440} r={7.5} />
      <Tree season={season} x={150} y={434} r={6.5} />
      <Tree season={season} x={318} y={418} r={7} />
      <Tree season={season} x={332} y={421} r={5.5} />
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
      <Tree season={season} x={300} y={464} r={6} />
      <Tree season={season} x={60} y={474} r={8} />
      <Tree season={season} x={118} y={466} r={6} />
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

const airRnd = seeded(23);
const LEAVES = Array.from({ length: 7 }, (_, i) => ({
  x: 70 + airRnd() * 260,
  y: 150 + airRnd() * 260,
  s: 1.5 + airRnd() * 0.7,
  dur: `${11 + airRnd() * 7}s`,
  delay: `${-airRnd() * 18}s`,
  c: ['#cf7d43', '#e0a24a', '#b4553a'][i % 3]!,
}));
const FLAKES = Array.from({ length: 46 }, () => ({ x: 40 + airRnd() * 320, y: 40 + airRnd() * 480, r: 1.3 + airRnd() * 1.6 }));

/**
 * What the season puts in the air outside: a few autumn leaves drifting down, snow falling on
 * a grey winter day, and snow banked against the bottom of the glass all winter.
 * Drawn in the big window's coordinates, inside its clip.
 */
export function SeasonAir({ season, weather }: { season: Season; weather: Weather }) {
  if (season === 'autumn' && weather.sky !== 'rain' && !weather.night) {
    return (
      <g className="season-air">
        {LEAVES.map((l, i) => (
          <g key={i} transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) scale(${l.s.toFixed(2)})`}>
            <g className="leaf-fall" style={{ animationDuration: l.dur, animationDelay: l.delay }}>
              <path className="ink-thin" fill={l.c} d="M0,-5 C3,-4 4.4,-1 3.4,2 C2.4,4 0.6,4.6 0,5 C-0.6,4.6 -2.4,4 -3.4,2 C-4.4,-1 -3,-4 0,-5 Z" />
              <path d="M0,-4 L0,5.6" stroke="#7a4426" strokeWidth="0.6" />
            </g>
          </g>
        ))}
      </g>
    );
  }
  if (season !== 'winter') return null;
  return (
    <g>
      {weather.sky === 'cloudy' && (
        <g className="season-air">
          <g className="snowfall" style={{ ['--fall' as string]: '480px' }}>
            {[0, -480].map((off) => (
              <g key={off} transform={`translate(0 ${off})`}>
                {FLAKES.map((f, i) => (
                  <circle key={i} cx={f.x.toFixed(1)} cy={f.y.toFixed(1)} r={f.r.toFixed(2)} fill="#fbfcff" opacity={0.85} />
                ))}
              </g>
            ))}
          </g>
        </g>
      )}
      {/* snow banked along the bottom of the glass */}
      <path
        d="M40,530 L40,506 C52,500 62,512 74,509 C90,505 104,515 124,514 C150,513 170,519 200,518 C232,517 252,512 276,514 C298,516 316,506 334,508 C346,509 354,502 362,500 L362,530 Z"
        fill="#f4f7fa"
        stroke="#c9d3de"
        strokeWidth="0.8"
      />
    </g>
  );
}

// ---- the branch outside the window ----

type Twig = { d: string; pts: Array<[number, number, number]> };

/** A branch reaching into the top of the window from the left, close to the glass. */
const BRANCH = 'M20,184 C60,176 92,160 128,150 C150,144 168,140 188,126';
const TWIGS: Twig[] = [
  { d: 'M70,170 C82,154 92,142 108,132', pts: [[90, 147, -40], [104, 135, -30], [80, 160, -50]] },
  { d: 'M118,153 C130,160 144,170 160,174', pts: [[138, 165, 30], [154, 172, 20]] },
  { d: 'M150,143 C156,130 160,118 170,108', pts: [[160, 122, -60], [168, 110, -50]] },
  { d: 'M40,180 C46,190 54,196 66,200', pts: [[52, 192, 40], [62, 198, 30]] },
];
const MAIN_PTS: Array<[number, number, number]> = [[50, 178, -20], [112, 154, -15], [176, 134, -30], [186, 126, -20], [96, 160, 10]];

const LEAF_PATH = 'M0,0 C2.6,-2 3.4,-6 0,-11 C-3.4,-6 -2.6,-2 0,0 Z';
const SEASON_LEAF: Record<Exclude<Season, 'winter'>, string[]> = {
  spring: ['#9cc47e', '#b4d58e'],
  summer: ['#5f8e57', '#77a466', '#4f7a4a'],
  autumn: ['#d9873f', '#c35a35', '#e7b04a', '#a8452f'],
};

function BlossomFlower({ x, y, s, c }: { x: number; y: number; s: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-2.6" rx="1.9" ry="2.6" transform={`rotate(${a})`} fill={c} className="ink-thin" />
      ))}
      <circle r="1.1" fill="#d9767f" />
    </g>
  );
}

/**
 * The season at a glance: blossom in spring, full leaf in summer, turning leaves in autumn and a
 * bare branch with snow along it in winter.
 */
export function SeasonBranch({ season }: { season: Season }) {
  const rnd = seeded(5);
  const points = [...MAIN_PTS, ...TWIGS.flatMap((t) => t.pts)];
  return (
    <g>
      <g fill="none" strokeLinecap="round">
        <path d={BRANCH} style={{ stroke: 'var(--ink)' }} strokeWidth="6" />
        <path d={BRANCH} stroke="#6b4e44" strokeWidth="4.2" />
        {TWIGS.map((t) => (
          <g key={t.d}>
            <path d={t.d} style={{ stroke: 'var(--ink)' }} strokeWidth="3" />
            <path d={t.d} stroke="#6b4e44" strokeWidth="1.8" />
          </g>
        ))}
      </g>
      {season === 'winter' ? (
        <g fill="none" stroke="#f6f8fb" strokeLinecap="round">
          <path d="M28,180 C60,172 92,156 128,146 C150,140 166,136 184,123" strokeWidth="2.6" />
          <path d="M74,165 C84,152 92,141 106,131 M152,139 C157,128 160,118 168,108" strokeWidth="1.6" />
        </g>
      ) : (
        points.map(([x, y, rot], i) => {
          const colors = SEASON_LEAF[season];
          // autumn has lost some of its leaves already
          if (season === 'autumn' && i % 3 === 2) return null;
          const s = 0.9 + rnd() * 0.5;
          return (
            <g key={i}>
              <g transform={`translate(${x} ${y}) rotate(${rot + 60}) scale(${s})`}>
                <path className="ink-thin" fill={colors[i % colors.length]} d={LEAF_PATH} />
                <path d="M0,-1 L0,-9" stroke="#00000033" strokeWidth="0.6" />
              </g>
              <g transform={`translate(${x} ${y}) rotate(${rot - 60}) scale(${s * 0.85})`}>
                <path className="ink-thin" fill={colors[(i + 1) % colors.length]} d={LEAF_PATH} />
              </g>
              {season === 'spring' && i % 2 === 0 && (
                <BlossomFlower x={x + 2} y={y - 4} s={1 + rnd() * 0.4} c={i % 4 ? '#f7cfdb' : '#fdf1f4'} />
              )}
            </g>
          );
        })
      )}
    </g>
  );
}

/** Frost feathering the corners of the panes on a winter morning or night. Room window only. */
export function Frost() {
  const corners: Array<[number, number, number]> = [
    [56, 208, 1], [196, 208, -1], [204, 208, 1], [344, 208, -1],
    [56, 364, 1], [344, 364, -1],
  ];
  return (
    <g>
      {corners.map(([x, y, dir], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${dir} 1)`}>
          <path d="M0,0 L0,-22 C6,-18 10,-12 12,-8 C16,-8 22,-4 26,0 Z" fill="#f4f8fc" opacity="0.32" />
          <path
            d="M0,-3 L14,-12 M5,-6 L6,-12 M9,-9 L13,-14 M0,-9 L7,-17 M3,-12 L3,-17 M2,0 L18,-5 M10,-2 L14,-7 M14,-3 L21,-3"
            fill="none"
            stroke="#f8fbff"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>
      ))}
    </g>
  );
}
