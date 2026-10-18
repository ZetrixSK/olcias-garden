import type { Weather } from '../theme/palettes';
import { moonLit, moonPath } from '../weather/moon';
import { fv, seeded } from './geometry';

/** A scalloped storybook cloud bank: a row of soft bumps along the top, flat underneath. */
function cloudBank(x0: number, x1: number, top: number, base: number, seed: number, bumpW = 34) {
  const rnd = seeded(seed);
  let x = x0;
  let y = top + rnd() * 8;
  let d = `M${x0},${base} L${x0},${y.toFixed(1)}`;
  while (x < x1) {
    const w = bumpW * (0.45 + rnd() * 1.2);
    const nx = Math.min(x1, x + w);
    const ny = top + rnd() * 14;
    const h = (6 + rnd() * 16) * Math.min(1.3, w / bumpW);
    d += ` C${(x + w * 0.05).toFixed(1)},${(y - h).toFixed(1)} ${(nx - w * 0.05).toFixed(1)},${(ny - h).toFixed(1)} ${nx.toFixed(1)},${ny.toFixed(1)}`;
    x = nx;
    y = ny;
  }
  return `${d} L${x1},${base} Z`;
}

/** A single puffy cumulus with a lilac underside, drawn around (0,0). */
function Puff({ x, y, s, drift }: { x: number; y: number; s: number; drift: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="drift" style={{ animationDuration: drift }}>
        <path
          className="ink"
          style={fv('cloud')}
          d="M-4,10 C-16,10 -18,-2 -6,-4 C-6,-16 8,-22 18,-14 C22,-28 44,-30 50,-14 C58,-22 74,-16 72,-4 C84,-4 86,10 74,10 Z"
        />
        <path
          style={fv('cloud-shade')}
          d="M-10,6 C2,7 20,3 30,6 C44,2 62,7 79,5 C78,9 76,10 74,10 L-4,10 C-8,10 -10,8 -10,6 Z"
        />
        <path className="ink-thin" fill="none" d="M18,-14 C17,-10 18,-6 20,-4 M50,-14 C52,-10 52,-7 50,-4" />
      </g>
    </g>
  );
}

function Sun() {
  const rays = Array.from({ length: 14 }, (_, i) => (i * 360) / 14);
  return (
    <g transform="translate(272 168)">
      <circle r="40" fill="#fbefc9" opacity="0.45" />
      <g className="spin-slow">
        {rays.map((a, i) => (
          <path
            key={a}
            transform={`rotate(${a}) translate(0 ${i % 2 ? -33 : -35})`}
            d={i % 2 ? 'M-1.6,0 L0,-6 L1.6,0 Z' : 'M-2,0 L0,-10 L2,0 Z'}
            fill="#f0bf62"
          />
        ))}
      </g>
      <circle r="23" className="ink" fill="#f5cd6c" />
      <path d="M-15,-6 C-12,-15 -3,-19 6,-17 C-2,-14 -9,-10 -12,-2 Z" fill="#fbe3a2" />
      <path d="M8,17 C15,13 19,7 20,0" fill="none" stroke="#e2a54c" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

/** Today's moon: the lit part follows the real phase, the dark part is only a faint ghost of the disc. */
function Moon({ phase }: { phase: number }) {
  const lit = moonLit(phase);
  const d = moonPath(24, phase);
  // the halo grows with the moon, so a thin crescent doesn't glow like a full one
  const halo = 0.3 + 0.7 * lit;
  return (
    <g transform="translate(266 164) rotate(-18)">
      <defs>
        <clipPath id="moon-lit">{d && <path d={d} />}</clipPath>
      </defs>
      <circle r="44" fill="#f5ecd2" opacity={0.06 * halo} />
      <circle r="31" fill="#f5ecd2" opacity={0.07 * halo} />
      <circle r="24" fill="#f5ecd2" opacity={0.06} />
      <circle r="24" fill="none" stroke="#f5ecd2" strokeWidth="0.8" opacity="0.14" />
      {d && (
        <>
          <path className="ink" fill="#f3e8cb" d={d} />
          <g clipPath="url(#moon-lit)">
            <circle cx="-13" cy="-6" r="3" fill="#e0d1aa" />
            <circle cx="-8" cy="9" r="1.8" fill="#e0d1aa" />
            <circle cx="-17" cy="6" r="1.2" fill="#e0d1aa" />
            <circle cx="9" cy="-11" r="2.4" fill="#e0d1aa" />
            <circle cx="12" cy="5" r="3.4" fill="#e0d1aa" />
            <circle cx="4" cy="14" r="1.3" fill="#e0d1aa" />
            <circle cx="2" cy="-2" r="1.6" fill="#e0d1aa" />
          </g>
        </>
      )}
    </g>
  );
}

const STARS: Array<[number, number, number, boolean]> = [
  [112, 118, 1, true],
  [140, 96, 0.7, false],
  [180, 140, 1.2, true],
  [120, 176, 0.6, false],
  [210, 90, 0.8, false],
  [318, 214, 0.9, true],
  [228, 206, 0.6, false],
  [80, 236, 0.7, false],
  [160, 228, 0.9, true],
  [300, 104, 0.6, false],
  [330, 168, 0.5, false],
  [104, 146, 0.45, false],
  [150, 252, 0.5, false],
  [196, 182, 0.45, false],
  [70, 196, 0.5, false],
];

function Stars() {
  return (
    <g>
      {STARS.map(([x, y, s, sparkle], i) =>
        sparkle ? (
          <path
            key={i}
            className="twinkle"
            style={{ animationDelay: `${i * 0.7}s` }}
            transform={`translate(${x} ${y}) scale(${s})`}
            fill="#f6eed6"
            d="M0,-6 C0.6,-1.4 1.4,-0.6 6,0 C1.4,0.6 0.6,1.4 0,6 C-0.6,1.4 -1.4,0.6 -6,0 C-1.4,-0.6 -0.6,-1.4 0,-6 Z"
          />
        ) : (
          <circle key={i} cx={x} cy={y} r={s * 1.5} fill="#efe6cf" opacity={0.8} />
        ),
      )}
    </g>
  );
}

function CloudLayers({ heavy }: { heavy: boolean }) {
  const o = heavy ? -26 : 0;
  return (
    <g>
      <g className="drift" style={{ animationDuration: '90s' }}>
        <path style={fv('cloud-shade')} d={cloudBank(20, 380, 118 + o, 520, 3, 58)} />
      </g>
      <Puff x={70} y={150 + o} s={1.1} drift="70s" />
      <Puff x={238} y={128 + o} s={0.9} drift="95s" />
      <g className="drift" style={{ animationDuration: '70s', animationDelay: '-20s' }}>
        <path style={fv('cloud')} d={cloudBank(10, 390, 196 + o, 520, 11, 52)} />
        <path style={fv('cloud-shade')} opacity={0.55} d={cloudBank(10, 390, 236 + o, 520, 19, 40)} />
      </g>
      <Puff x={180} y={226 + o} s={0.8} drift="110s" />
      <g className="drift" style={{ animationDuration: '60s', animationDelay: '-35s' }}>
        <path style={fv('cloud-deep')} d={cloudBank(0, 400, 282 + o, 520, 27, 60)} />
      </g>
    </g>
  );
}

export function Sky({ weather }: { weather: Weather }) {
  return (
    <g>
      <defs>
        <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--sky-top)' }} />
          <stop offset="0.55" style={{ stopColor: 'var(--sky-mid)' }} />
          <stop offset="1" style={{ stopColor: 'var(--sky-low)' }} />
        </linearGradient>
      </defs>
      <rect x="40" y="60" width="320" height="470" fill="url(#sky-grad)" />
      {weather.sky === 'clear' && !weather.night && (
        <>
          <Sun />
          <Puff x={78} y={118} s={0.85} drift="80s" />
          <Puff x={150} y={226} s={0.6} drift="110s" />
        </>
      )}
      {weather.sky === 'clear' && weather.night && <Puff x={92} y={210} s={0.7} drift="120s" />}
      {weather.sky !== 'clear' && <CloudLayers heavy={weather.sky === 'rain'} />}
    </g>
  );
}

/** Things that should stay luminous above the room's night tint. */
export function SkyLights({ weather, phase }: { weather: Weather; phase: number }) {
  if (!weather.night || weather.sky === 'rain') return null;
  if (weather.sky === 'cloudy') {
    // the moon glows through a thin patch of cloud
    return (
      <g opacity={0.6}>
        <Moon phase={phase} />
      </g>
    );
  }
  return (
    <g>
      <Stars />
      <Moon phase={phase} />
    </g>
  );
}
