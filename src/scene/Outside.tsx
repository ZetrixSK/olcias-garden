import type { Weather } from '../theme/palettes';
import type { Season } from '../theme/seasons';
import type { Visitors } from '../weather/moments';
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

/** A fir: three stacked tiers, shaded on the right, with snow resting on each tier in winter. */
function Pine({ x, y, h, snow }: { x: number; y: number; h: number; snow: boolean }) {
  const w = h * 0.42;
  const tier = (top: number, bottom: number, half: number) =>
    `M0,${top} C${half * 0.3},${top + (bottom - top) * 0.45} ${half * 0.7},${bottom - 2} ${half},${bottom} C${half * 0.4},${bottom - 1.2} ${-half * 0.4},${bottom - 1.2} ${-half},${bottom} C${-half * 0.7},${bottom - 2} ${-half * 0.3},${top + (bottom - top) * 0.45} 0,${top} Z`;
  const tiers: Array<[number, number, number]> = [
    [-h, -h * 0.55, w * 0.6],
    [-h * 0.75, -h * 0.3, w * 0.82],
    [-h * 0.5, -h * 0.08, w],
  ];
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
      <path d={`M0,0 L0,${(-h * 0.12).toFixed(1)}`} stroke="#5a4637" strokeWidth={Math.max(1, h * 0.07)} />
      {tiers.map(([t, bt, half], i) => (
        <g key={i}>
          <path className="ink-thin" style={fv('pine')} d={tier(t, bt, half)} />
          <path style={fv('pine-shade')} d={`M0,${t} C${half * 0.3},${t + (bt - t) * 0.45} ${half * 0.7},${bt - 2} ${half},${bt} C${half * 0.5},${bt - 1} ${half * 0.2},${bt - 1} 0,${bt - 0.6} Z`} />
          {snow && <path d={`M0,${t + 0.6} C${half * 0.25},${t + (bt - t) * 0.4} ${half * 0.5},${bt - 3} ${half * 0.75},${bt - 1.4} C${half * 0.3},${bt - 3.2} ${-half * 0.3},${bt - 3.4} ${-half * 0.75},${bt - 1.4} C${-half * 0.5},${bt - 3} ${-half * 0.25},${t + (bt - t) * 0.4} 0,${t + 0.6} Z`} fill="#eef3f7" />}
        </g>
      ))}
    </g>
  );
}

/** A little log cabin on the far shore; its window is lit at night. */
function Cabin({ x, y, lit, snow }: { x: number; y: number; lit: boolean; snow: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path className="ink-thin" fill="#7a5640" d="M-8,0 L-8,-8 L8,-8 L8,0 Z" />
      <path d="M-8,-5.4 L8,-5.4 M-8,-2.7 L8,-2.7" stroke="#5e4031" strokeWidth="0.5" />
      <path className="ink-thin" fill="#4b3a3f" d="M-10,-7.6 L0,-15 L10,-7.6 Z" />
      {snow && <path d="M-9.4,-8 L0,-14.6 L9.4,-8 L7,-8.6 L0,-13 L-7,-8.6 Z" fill="#eef3f7" />}
      <path className="ink-thin" fill="#6b5a55" d="M4,-12 L4,-16.4 L6.4,-16.4 L6.4,-10.4 Z" />
      <rect x="-4.6" y="-6" width="3.6" height="3.2" fill={lit ? '#f4c66c' : '#3e3438'} />
      <rect x="2" y="-5.6" width="3" height="5.6" fill="#4b3a3f" />
    </g>
  );
}

const forestRnd = seeded(17);
/** The forest around the far shore: firs mixed with leafy trees, two rows deep. */
const FAR_FOREST = Array.from({ length: 34 }, (_, i) => {
  const row = i % 2;
  return {
    x: 40 + (i / 34) * 324 + forestRnd() * 6,
    y: 402 + row * 4 + forestRnd() * 2,
    h: 17 + forestRnd() * 10 - row * 3,
    pine: forestRnd() < 0.55,
  };
});

const distRnd = seeded(29);
/** A row of little fir points along the far hills. */
const DISTANT_TREES = (() => {
  let d = 'M40,392';
  for (let x = 40; x < 360; ) {
    const w = 5 + distRnd() * 4;
    const top = 376 - distRnd() * 9 - Math.sin(x / 50) * 4;
    d += ` L${(x + w / 2).toFixed(1)},${top.toFixed(1)} L${(x + w).toFixed(1)},${(388 + distRnd() * 3).toFixed(1)}`;
    x += w;
  }
  return `${d} L360,400 L40,400 Z`;
})();

const LAKE = 'M60,416 C110,404 290,402 340,414 C352,428 334,448 296,457 C236,469 150,469 104,459 C68,451 50,430 60,416 Z';

/**
 * The view from the window: a lake in a clearing, ringed by forest, with a cabin on the far
 * shore. Firs stay green all year and hold snow in winter; the leafy trees follow the seasons,
 * and in winter the lake freezes over.
 */
export function Landscape({ weather, season = 'summer' }: { weather: Weather; season?: Season }) {
  const winter = season === 'winter';
  return (
    <g>
      <path className="ink-soft" style={fv('hill-far')} d="M40,384 C80,368 120,374 160,366 C210,358 250,370 290,362 C320,358 344,364 360,370 L360,530 L40,530 Z" />
      {/* the far side of the forest, as a soft silhouette on the hills */}
      <path
        style={fv('pine')}
        opacity="0.35"
        d={DISTANT_TREES}
      />
      {FAR_FOREST.filter((t) => t.y < 404).map((t, i) =>
        t.pine ? <Pine key={i} x={t.x} y={t.y} h={t.h} snow={winter} /> : <Tree key={i} season={season} x={t.x} y={t.y} r={t.h * 0.34} />,
      )}
      <path className="ink-soft" style={fv('hill-near')} d="M40,404 C90,398 150,402 200,400 C260,398 310,402 360,398 L360,530 L40,530 Z" />
      {FAR_FOREST.filter((t) => t.y >= 404).map((t, i) =>
        t.pine ? <Pine key={i} x={t.x} y={t.y} h={t.h} snow={winter} /> : <Tree key={i} season={season} x={t.x} y={t.y} r={t.h * 0.34} />,
      )}
      <Cabin x={258} y={410} lit={weather.night} snow={winter} />

      {/* the lake, with the far shore mirrored in it */}
      <path className="ink-soft" style={fv('lake')} d={LAKE} />
      <defs>
        <clipPath id="lake-clip">
          <path d={LAKE} />
        </clipPath>
      </defs>
      <g clipPath="url(#lake-clip)">
        {winter ? (
          <g fill="none" strokeLinecap="round">
            {/* frozen: snow drifted across the ice, and a few cracks */}
            <path d="M70,424 C100,416 130,420 150,416 C140,424 110,428 70,430 Z M250,446 C276,440 300,442 322,434 C312,446 290,452 258,454 Z" fill="#f4f7fa" stroke="none" />
            <path d="M120,440 L140,436 L152,442 L170,438 M210,428 L226,432 L236,428 M168,452 L182,448 L196,452" style={{ stroke: 'var(--lake-hi)' }} strokeWidth="0.9" />
            <path d="M140,436 L136,430 M226,432 L228,438" style={{ stroke: 'var(--lake-hi)' }} strokeWidth="0.7" />
          </g>
        ) : (
          <g>
            {weather.twilight && !weather.night && weather.sky !== 'rain' && (
              <g stroke="#ffd39a" strokeLinecap="round" opacity="0.85">
                {[0, 1, 2, 3, 4].map((i) => {
                  const x = weather.twilight === 'dawn' ? 118 : 286;
                  const w = 26 - i * 4;
                  return <path key={i} d={`M${x - w / 2},${418 + i * 8} L${x + w / 2},${418 + i * 8}`} strokeWidth={2 - i * 0.25} />;
                })}
              </g>
            )}
            <path d="M40,410 C100,412 160,409 200,411 C260,413 320,410 360,412 L360,418 C300,417 240,419 200,417 C150,415 100,419 40,417 Z" style={fv('pine-shade')} opacity="0.35" />
            <g style={{ stroke: 'var(--lake-hi)' }} strokeWidth="1" strokeLinecap="round" opacity="0.8">
              <path d="M96,428 L118,428 M150,436 L164,436 M226,432 L250,432 M276,442 L292,442 M126,448 L140,448 M200,452 L214,452" />
            </g>
          </g>
        )}
      </g>

      {/* the near shore: firs and a leafy tree on either bank, and reeds at the water's edge */}
      <Pine x={58} y={462} h={40} snow={winter} />
      <Pine x={80} y={456} h={30} snow={winter} />
      <Tree season={season} x={100} y={470} r={9} />
      <Pine x={340} y={460} h={42} snow={winter} />
      <Pine x={318} y={452} h={28} snow={winter} />
      <Tree season={season} x={296} y={470} r={8} />
      {!winter && (
        <g stroke="#6f7f4f" strokeWidth="1" strokeLinecap="round" fill="none">
          <path d="M150,470 L148,458 M154,470 L155,455 M158,470 L161,460 M236,472 L234,460 M240,472 L242,457" />
          <path d="M154,456 L155,452 M241,458 L242,454" stroke="#7a5a3a" strokeWidth="2.2" />
        </g>
      )}
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

// ---- life at the lake ----

function Duck({ x, y, drake }: { x: number; y: number; drake: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-7,1.6 C-3,2.6 3,2.6 7,1.4" fill="none" style={{ stroke: 'var(--lake-hi)' }} strokeWidth="0.9" strokeLinecap="round" />
      <path className="ink-thin" fill={drake ? '#b7a99a' : '#8f6f55'} d="M-6,0 C-6,-3.4 -2,-4.4 2,-3.6 C4,-3.2 5,-2 5.4,0 C2,1 -3,1 -6,0 Z" />
      <path fill={drake ? '#6d5444' : '#6f533f'} d="M-6,0 C-5.4,-2 -3.6,-2.8 -2,-2.6 C-3,-1.4 -4,-0.4 -6,0 Z" />
      <circle className="ink-thin" cx="4.6" cy="-4.4" r="2" fill={drake ? '#2f6b4a' : '#8f6f55'} />
      {drake && <path d="M3,-2.6 L6.2,-2.6" stroke="#f7f3ea" strokeWidth="0.8" />}
      <path d="M6.4,-4.6 L8.4,-4 L6.4,-3.6 Z" fill="#e3b04a" />
      <circle cx="5.1" cy="-4.9" r="0.35" fill="#140c10" />
    </g>
  );
}

function Heron({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-1,0 L-0.6,-8 M1.4,0 L1,-8" stroke="#4d4a52" strokeWidth="0.8" />
      <path className="ink-thin" fill="#a7adb8" d="M-4,-8 C-6,-12 -3,-16 2,-15 C5,-14.4 6,-12 4.4,-9 C2,-7.4 -2,-7 -4,-8 Z" />
      <path fill="#7f8692" d="M-5,-9 C-3,-8.4 0,-8.4 3,-9.6 C1,-11 -3,-11 -5,-9 Z" />
      <path d="M3,-14 C6,-16 4,-19 6,-22" fill="none" stroke="#c9cdd5" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3,-14 C6,-16 4,-19 6,-22" fill="none" stroke="#7f8692" strokeWidth="0.5" />
      <circle cx="6.4" cy="-22.4" r="1.4" fill="#d6d9df" className="ink-thin" />
      <path d="M7.4,-22.6 L11.6,-21.8 L7.4,-21.6 Z" fill="#d3a64a" />
      <path d="M5.6,-23.4 L3,-23" stroke="#2d2a30" strokeWidth="0.5" />
    </g>
  );
}

function Deer({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-4,0 L-4.2,-5 M-2.6,0 L-2.8,-5 M3,0 L3.2,-5 M4.4,0 L4.4,-5" stroke="#6b4a36" strokeWidth="0.8" />
      <path className="ink-thin" fill="#9b6a47" d="M-5,-5 C-5.6,-8 -3,-9 0,-8.6 C3,-8.4 5.6,-8 5.6,-5.4 C5,-4.2 -4,-4 -5,-5 Z" />
      <path fill="#f1e2cc" d="M-5.2,-6.8 C-6.4,-6.4 -6.4,-5.2 -5.2,-5.2 Z" />
      <path className="ink-thin" fill="#9b6a47" d="M4,-7.6 C4.6,-10 5.6,-12 6.6,-13 L8.6,-12.4 C8,-11 7,-9 6,-6.6 Z" />
      <path className="ink-thin" fill="#9b6a47" d="M6,-13.6 C7.6,-14.4 9.6,-13.6 10.6,-12.4 L9.6,-11.6 C8.4,-12 7,-12 6.4,-12.4 Z" />
      <path d="M6.6,-14 L5.6,-16 M7.6,-14 L8.4,-16" stroke="#7a5038" strokeWidth="0.8" strokeLinecap="round" />
      <circle cx="10.4" cy="-12.2" r="0.4" fill="#1c1218" />
    </g>
  );
}

function Robin({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-1,0 L-1.4,2.4 M1,0 L1.2,2.4" stroke="#4a3a32" strokeWidth="0.7" />
      <path className="ink-thin" fill="#8a6a52" d="M-6,-3 C-6,-7 -2,-9 1.6,-8.4 C5,-7.6 5.6,-3.6 4,-1 C1,1 -4,0.6 -6,-3 Z" />
      <path fill="#e2773f" d="M0.6,-6.6 C3.6,-6.6 5,-4 4,-1.4 C2,-0.4 0,-1.4 -0.4,-3.6 C-0.6,-5 -0.2,-6.2 0.6,-6.6 Z" />
      <path d="M-6,-3 L-9,-1.4 L-8.6,-3.8 Z" fill="#6f533f" />
      <circle cx="2.4" cy="-6.6" r="0.5" fill="#140c10" />
      <path d="M4.4,-6.8 L6,-6.4 L4.4,-6 Z" fill="#3a2d28" />
    </g>
  );
}

function Skater({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-1.4,-6 L-3,0 M0.6,-6 L2.4,-0.4" stroke="#2f2a36" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M-4.4,0.4 L-1.6,0.2 M1.2,0 L4,-0.6" stroke="#cfd6de" strokeWidth="0.8" strokeLinecap="round" />
      <path className="ink-thin" fill="#3d4a6b" d="M-2.6,-6 C-3,-9 -2,-12 0,-12.4 C2,-12 2.6,-9 2,-6 Z" />
      <path d="M-3,-10 L-6,-7.4 M2.4,-10 L5,-8" stroke="#3d4a6b" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M-1.6,-11.6 C0,-11 1.4,-11.4 2,-12 L3.6,-9.4" fill="none" stroke="#c94a5d" strokeWidth="1.2" strokeLinecap="round" />
      <circle className="ink-thin" cx="0" cy="-14" r="1.8" fill="#f1d3bd" />
      <path d="M-1.9,-14.6 C-1.6,-16.6 1.6,-16.6 1.9,-14.6 Z" fill="#c94a5d" />
      <path d="M-4,1.4 C-1,1.8 3,1.6 6,1" fill="none" stroke="#f7fafc" strokeWidth="0.7" opacity="0.8" />
    </g>
  );
}

function Butterfly({ c }: { c: string }) {
  return (
    <g className="flutter">
      <path className="ink-thin" fill={c} d="M0,0 C-3,-5 -7,-5 -6,-1 C-6,1 -3,1.6 0,0 Z M0,0 C3,-5 7,-5 6,-1 C6,1 3,1.6 0,0 Z" />
      <path className="ink-thin" fill={c} d="M0,0.4 C-2,2 -3.6,4 -2,4.4 C-1,4.6 -0.4,2.6 0,0.4 Z M0,0.4 C2,2 3.6,4 2,4.4 C1,4.6 0.4,2.6 0,0.4 Z" />
      <path d="M0,-1.6 L0,2" stroke="#3a2a30" strokeWidth="0.8" />
    </g>
  );
}

/**
 * Who's out by the lake today, decided by the date: ducks on the water in the warm months, a heron
 * at the reeds, a deer at the forest edge, a robin on the winter branch, someone skating on the ice,
 * butterflies near the window on sunny days.
 */
export function LakeLife({ visitors, fog }: { visitors: Visitors; fog: boolean }) {
  return (
    <g>
      {visitors.deer && <Deer x={124} y={404} />}
      {visitors.ducks && (
        <g className="swim" style={{ animationDuration: '90s' }}>
          <Duck x={232} y={432} drake />
          <Duck x={246} y={436} drake={false} />
        </g>
      )}
      {visitors.heron && <Heron x={126} y={462} />}
      {visitors.skater && (
        <g className="skate">
          <Skater x={200} y={440} />
        </g>
      )}
      {visitors.robin && <Robin x={124} y={147} />}
      {visitors.butterflies && (
        <>
          <g transform="translate(150 372)">
            <g className="flit" style={{ animationDuration: '13s' }}>
              <Butterfly c="#f3b4c6" />
            </g>
          </g>
          <g transform="translate(262 342) scale(0.85)">
            <g className="flit" style={{ animationDuration: '17s', animationDelay: '-6s' }}>
              <Butterfly c="#f3d36b" />
            </g>
          </g>
        </>
      )}
      {fog && (
        <g opacity="0.95">
          <g className="drift" style={{ animationDuration: '70s' }}>
            <path d="M20,402 C80,394 150,400 210,396 C270,392 330,398 380,394 L380,414 C320,418 260,412 200,416 C140,420 80,414 20,418 Z" fill="#f5f3f0" opacity="0.85" />
          </g>
          <g className="drift" style={{ animationDuration: '95s', animationDelay: '-30s' }}>
            <path d="M20,430 C90,424 160,432 220,426 C280,420 340,428 380,424 L380,446 C320,450 260,444 200,448 C140,452 80,444 20,448 Z" fill="#f7f5f2" opacity="0.75" />
          </g>
          <path d="M40,384 L360,384 L360,470 L40,470 Z" fill="#eeebe7" opacity="0.3" />
          <g className="drift" style={{ animationDuration: '120s', animationDelay: '-50s' }}>
            <path d="M20,384 C100,378 170,386 230,380 C290,374 340,382 380,378 L380,396 C320,400 250,394 190,398 C130,402 70,396 20,400 Z" fill="#f5f3f0" opacity="0.7" />
          </g>
        </g>
      )}
    </g>
  );
}
