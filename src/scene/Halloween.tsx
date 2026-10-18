import type { Theme } from '../theme/palettes';

const ORANGE = { base: '#e48a3c', shade: '#c4692b', hi: '#f4b064', stem: '#6f6a3a' };
/** The little one beside it: pale cream in the cozy room, painted near-black in the witchy one. */
const LITTLE: Record<Theme, { base: string; shade: string; hi: string }> = {
  cozy: { base: '#f1e4cc', shade: '#d9c6a4', hi: '#fbf4e6' },
  witchy: { base: '#3b2b40', shade: '#291d2e', hi: '#5a4562' },
};

/** A round, ribbed pumpkin standing on (0,0): side lobes first, the front lobe over them. */
function Pumpkin({ c, stem = ORANGE.stem }: { c: { base: string; shade: string; hi: string }; stem?: string }) {
  return (
    <g>
      <path className="ink" fill={stem} d="M-2.4,-30 C-2.6,-36 -0.6,-40 3.4,-42.6 L5.6,-39.6 C2.8,-37.4 2,-34 2.2,-30 Z" />
      <path d="M3.4,-38 C8,-40 11,-37 9,-34 C7.6,-32 10,-30 12,-31" fill="none" stroke={stem} strokeWidth="1.1" strokeLinecap="round" />
      <ellipse className="ink" cx="-13" cy="-15.5" rx="12.5" ry="15.5" fill={c.shade} />
      <ellipse className="ink" cx="13" cy="-15.5" rx="12.5" ry="15.5" fill={c.shade} />
      <ellipse className="ink" cx="0" cy="-16" rx="12" ry="16.6" fill={c.base} />
      <path d="M-7,-27 C-9.4,-22 -9.6,-12 -7,-5" fill="none" stroke={c.hi} strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
      <path d="M-20,-25 C-23,-19 -23,-11 -20,-6" fill="none" stroke={c.hi} strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
    </g>
  );
}

/** The carved face: wide-eyed and smiling, more friendly than frightening. */
const FACE =
  'M-8.6,-19 L-4,-25.6 L-1.6,-18.6 Z M8.6,-19 L4,-25.6 L1.6,-18.6 Z M-1.4,-15.6 L0,-18 L1.4,-15.6 Z ' +
  'M-9.4,-11.6 C-6,-5.4 6,-5.4 9.4,-11.6 C6.6,-10 4.4,-9.6 3,-9.8 L2,-8 L0.6,-9.8 C-2.6,-9.6 -6.4,-10 -9.4,-11.6 Z';

export function JackOLantern({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Pumpkin c={ORANGE} />
      {/* unlit, the carving shows the dark inside; the light layer fills it when the candle is in */}
      <path d={FACE} fill="#4a2418" className="ink-thin" />
    </g>
  );
}

/** The candle inside the pumpkin, drawn above the night tint so the face really glows. */
export function LanternLight({ x, y, s = 1, glow = 'candle-glow' }: { x: number; y: number; s?: number; glow?: string }) {
  return (
    <g>
      <circle className="glow" cx={x} cy={y - 16 * s} r={70 * s} fill={`url(#${glow})`} />
      <g transform={`translate(${x} ${y}) scale(${s})`} className="flicker">
        <path d={FACE} fill="#ffcf6b" />
        <path d={FACE} fill="#fff1c4" transform="translate(0 -16) scale(0.6) translate(0 16)" opacity="0.7" />
      </g>
    </g>
  );
}

export function LittlePumpkin({ x, y, s = 1, theme }: { x: number; y: number; s?: number; theme: Theme }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Pumpkin c={LITTLE[theme]} stem={theme === 'witchy' ? '#8a6a4a' : ORANGE.stem} />
    </g>
  );
}

/** Where the pumpkins sit in the room: on the floor at the foot of the dog bed. */
export const ROOM_LANTERN = { x: 44, y: 874, s: 1.5 };

/** In the front corner of the room, in front of the dog bed, partly below the edge of the picture. */
export function RoomPumpkins({ theme }: { theme: Theme }) {
  return (
    <g>
      <LittlePumpkin x={98} y={876} s={0.95} theme={theme} />
      <JackOLantern {...ROOM_LANTERN} />
    </g>
  );
}

const BAT =
  'M0,-2 C2,-4 5,-6 9,-5 C8,-3 9,-1 11,0 C8,0 6,1 5,3 C3,1 1.4,1 0,2.4 C-1.4,1 -3,1 -5,3 C-6,1 -8,0 -11,0 C-9,-1 -8,-3 -9,-5 C-5,-6 -2,-4 0,-2 Z';

/** A few bats crossing the night sky, outside the window and behind everything on the sill. */
export function Bats() {
  const bats: Array<[number, number, number, string, string]> = [
    [180, 120, 1.7, '19s', '-12s'],
    [210, 240, 1.25, '24s', '-4s'],
    [160, 290, 1, '29s', '-18s'],
  ];
  return (
    <g>
      {bats.map(([x, y, s, dur, delay], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <g className="bat-fly" style={{ animationDuration: dur, animationDelay: delay }}>
            <g className="bat-flap" style={{ animationDelay: `${i * -0.13}s` }}>
              {/* near-black, with a faint rim of moonlight so they show against the night sky */}
              <path d={BAT} fill="#0b080d" stroke="#8a7fa8" strokeWidth="0.8" strokeLinejoin="round" />
              <path d="M-1.6,-3.4 L-1,-5.4 L0,-3.6 L1,-5.4 L1.6,-3.4 Z" fill="#0b080d" />
            </g>
          </g>
        </g>
      ))}
    </g>
  );
}

/** Bunting colours for the Halloween fortnight. */
export const HALLOWEEN_PENNANTS = ['#e48a3c', '#2f2433', '#a07cc4'];
