import type { Stage } from '../garden/species';
import { LEAF, SeedMarker, Seeds, Stem } from './common';

/** Stokrotka, the small Polish lawn daisy: two rows of fine rays, often tipped pink. */
export type DaisyColors = { ray: string; tip: string; inner: string };

export const DAISY_WHITE: DaisyColors = { ray: '#fbf6ee', tip: '#e992ab', inner: '#f3e6e4' };
export const DAISY_PINK: DaisyColors = { ray: '#f3b4c6', tip: '#d8708f', inner: '#eea0b6' };
export const DAISY_DEEP: DaisyColors = { ray: '#e486a2', tip: '#b9507a', inner: '#d9748f' };

const RAY = 'M0,-3.2 C1.15,-6 1.15,-10 0,-12 C-1.15,-10 -1.15,-6 0,-3.2 Z';
const TIP = 'M0,-9 C0.9,-10 0.8,-11.4 0,-12 C-0.8,-11.4 -0.9,-10 0,-9 Z';

export function DaisyFlower({ x, y, s = 1, c, tilt = 0 }: { x: number; y: number; s?: number; c: DaisyColors; tilt?: number }) {
  const outer = Array.from({ length: 22 }, (_, i) => (i * 360) / 22);
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s} ${s * 0.92})`}>
      {outer.map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d={RAY} fill={c.ray} style={{ stroke: 'var(--ink)' }} strokeWidth="0.55" />
          <path d={TIP} fill={c.tip} />
        </g>
      ))}
      {outer.map((a) => (
        <path key={`i${a}`} transform={`rotate(${a + 8}) scale(0.72)`} d={RAY} fill={c.inner} style={{ stroke: 'var(--ink)' }} strokeWidth="0.5" />
      ))}
      <circle r="3.8" fill="#f2bf48" className="ink-thin" />
      <circle cx="-1" cy="-1" r="1.6" fill="#f8da84" />
      {[[1.4, 0.8], [-0.6, 1.8], [1.8, -1.2], [0.2, -0.2]].map(([dx, dy]) => (
        <circle key={`${dx}${dy}`} cx={dx} cy={dy} r="0.45" fill="#c98a24" />
      ))}
    </g>
  );
}

export function SpoonLeaf({ rot, s }: { rot: number; s: number }) {
  return (
    <g transform={`rotate(${rot}) scale(${s})`}>
      <path className="ink" fill={LEAF.base} d="M0,0 C-2.6,-4 -3.4,-9 -4.6,-14 C-5.8,-20 -3,-24 0,-24 C3,-24 5.8,-20 4.6,-14 C3.4,-9 2.6,-4 0,0 Z" />
      <path fill={LEAF.shade} d="M0,0 C2.6,-4 3.4,-9 4.6,-14 C5.4,-18 4,-22 2,-23.4 C2.6,-15 1.6,-7 0,0 Z" />
      <path d="M0,-1 L0,-20" stroke={LEAF.vein} strokeWidth="0.8" />
    </g>
  );
}

function Rosette({ n, s }: { n: number; s: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const a = -78 + (156 * i) / Math.max(1, n - 1);
        return <SpoonLeaf key={i} rot={a} s={s * (0.85 + ((i * 37) % 10) / 40)} />;
      })}
    </g>
  );
}

function DaisyBud({ x, y, pink }: { x: number; y: number; pink?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="3.4" className="ink-thin" fill="#93b47c" />
      {pink && <path d="M-2.4,-1.8 C-1,-3.6 1,-3.6 2.4,-1.8 C1,-2.6 -1,-2.6 -2.4,-1.8 Z" fill="#e58fa8" />}
      <path d="M-3,1 L-1,-1 M3,1 L1,-1 M0,3 L0,0.6" stroke="#6f9258" strokeWidth="0.7" />
    </g>
  );
}

export function DaisyPlant({ stage }: { stage: Stage }) {
  if (stage === 'seed') {
    return (
      <g>
        <Seeds color="#7a5a3a" />
        <SeedMarker label="stokrotka" />
      </g>
    );
  }
  if (stage === 'seedling') {
    return (
      <g>
        <SpoonLeaf rot={-50} s={0.42} />
        <SpoonLeaf rot={8} s={0.5} />
        <SpoonLeaf rot={56} s={0.4} />
      </g>
    );
  }
  if (stage === 'bud') {
    return (
      <g>
        <Stem d="M-3,-2 C-6,-12 -10,-22 -12,-30" w={1.6} />
        <Stem d="M1,-2 C1,-14 2,-26 3,-38" w={1.6} />
        <Stem d="M4,-2 C8,-10 12,-18 15,-24" w={1.6} />
        <DaisyBud x={-12} y={-31} />
        <DaisyBud x={3} y={-39} pink />
        <DaisyBud x={15} y={-25} />
        <Rosette n={6} s={0.72} />
      </g>
    );
  }
  return (
    <g>
      <Stem d="M-4,-2 C-10,-16 -18,-30 -22,-40" w={1.7} />
      <Stem d="M-1,-2 C-3,-18 -5,-36 -6,-54" w={1.7} />
      <Stem d="M2,-2 C4,-14 8,-28 11,-44" w={1.7} />
      <Stem d="M4,-2 C10,-10 18,-20 24,-28" w={1.7} />
      <Stem d="M0,-2 C0,-10 -1,-20 -1,-28" w={1.5} />
      <DaisyBud x={-1} y={-29} pink />
      <DaisyFlower x={-22} y={-42} s={1.15} c={DAISY_PINK} tilt={-10} />
      <DaisyFlower x={24} y={-30} s={1.1} c={DAISY_DEEP} tilt={12} />
      <DaisyFlower x={11} y={-46} s={1.25} c={DAISY_WHITE} tilt={6} />
      <DaisyFlower x={-6} y={-58} s={1.3} c={DAISY_WHITE} tilt={-4} />
      <Rosette n={9} s={0.95} />
    </g>
  );
}
