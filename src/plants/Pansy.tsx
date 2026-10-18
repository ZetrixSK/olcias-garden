import type { Stage } from '../garden/species';
import { LEAF, SeedMarker, Seeds, Stem } from './common';

export type PansyColors = {
  top: string;
  topShade: string;
  topHi: string;
  low: string;
  lowShade: string;
  face: string;
  edge?: string;
  whiskers?: boolean;
  /** No markings at all on the lower petals, only the little golden eye. */
  clear?: boolean;
};

/** Pink and near-black, after her favourite colours. */
export const PANSY_OLCIA: PansyColors = {
  top: '#2c1733',
  topShade: '#1d0e22',
  topHi: '#5e3e6a',
  low: '#eaa2bb',
  lowShade: '#d07f9e',
  face: '#2c1733',
};
export const PANSY_ROSY: PansyColors = {
  top: '#f0b5c7',
  topShade: '#dc93ab',
  topHi: '#fadbe4',
  low: '#ea9cb4',
  lowShade: '#d27b98',
  face: '#4a1f3e',
  whiskers: true,
};
export const PANSY_VELVET: PansyColors = {
  top: '#28142d',
  topShade: '#190b1d',
  topHi: '#4e2f58',
  low: '#2e1734',
  lowShade: '#1f0e24',
  face: '#14081a',
  edge: '#e48fae',
};
export const PANSY_CREAM: PansyColors = {
  top: '#f2e7d0',
  topShade: '#e0cfae',
  topHi: '#fdf7ea',
  low: '#f4e4c1',
  lowShade: '#e3cc9e',
  face: '#3d1d42',
};

const P = {
  upperR: 'M2,-2 C6,-15 14,-25 23,-23 C30,-21 32,-13 29,-7 C26,-1 17,2 4,2 Z',
  upperL: 'M-2,-1 C-6,-15 -15,-26 -24,-23 C-31,-20 -32,-11 -28,-5 C-23,0 -14,3 -3,2 Z',
  sideL: 'M-1,2 C-10,-4 -23,-5 -27,3 C-29,11 -22,16 -13,14 C-7,13 -3,9 -1,6 Z',
  sideR: 'M1,2 C10,-3 24,-3 27,5 C29,12 22,17 12,15 C7,14 3,10 1,6 Z',
  low: 'M-11,6 C-19,11 -19,24 -10,28 C-6,30 -3,27 0,29 C3,31 7,30 11,28 C19,23 19,11 11,6 C6,3 -6,3 -11,6 Z',
};

export function PansyFlower({ x, y, rot = 0, s = 1, c }: { x: number; y: number; rot?: number; s?: number; c: PansyColors }) {
  const petal = (d: string, fill: string) => (
    <>
      <path d={d} fill={fill} />
      {c.edge && <path d={d} fill="none" stroke={c.edge} strokeWidth="2.6" />}
      <path d={d} className="ink" fill="none" />
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {petal(P.upperR, c.top)}
      <path d="M3,0 C8,-6 14,-9 19,-8 C15,-4 10,-1 4,1 Z" fill={c.topShade} />
      {petal(P.upperL, c.top)}
      <path d="M-3,0 C-8,-8 -14,-12 -19,-10 C-15,-5 -9,-1 -4,1 Z" fill={c.topShade} />
      <path d="M-22,-19 C-17,-22 -11,-20 -8,-15" fill="none" stroke={c.topHi} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M18,-20 C22,-20 26,-17 26,-13" fill="none" stroke={c.topHi} strokeWidth="1.1" strokeLinecap="round" />
      {petal(P.sideL, c.low)}
      {petal(P.sideR, c.low)}
      {petal(P.low, c.low)}
      <path d="M-9,26 C-4,27.5 4,28.5 10,26.5 C8,29 4,30 0,29 C-3,28 -6,28.5 -9,26 Z" fill={c.lowShade} />
      {c.whiskers ? (
        <g stroke={c.face} strokeWidth="0.9" strokeLinecap="round" fill="none">
          <path d="M0,7 L0,17 M-3,7 L-6,16 M3,7 L6,16 M-5,6 L-10,13 M5,6 L10,13" />
          <path d="M-4,4 L-14,4 M-4,5.5 L-13,8 M4,4 L14,5 M4,5.5 L13,9" />
          <path d="M-5,5 C-3,8 3,8 5,5 C3,4 -3,4 -5,5 Z" fill={c.face} />
        </g>
      ) : c.clear ? null : (
        <>
          <path d="M-10,5 C-15,10 -12,19 -5,22 C-2,24 2,24 5,22 C12,19 15,10 10,5 C5,3 -5,3 -10,5 Z" fill={c.face} />
          <path d="M-2,3 C-8,1 -17,2 -18,8 C-12,10 -6,9 -2,7 Z" fill={c.face} />
          <path d="M2,3 C8,1 17,3 18,9 C12,10 6,9 2,7 Z" fill={c.face} />
          <path d="M-7,20 L-9,24 M-3,22.5 L-3.5,26 M3,22.5 L3.6,26 M7,20 L9.4,24" stroke={c.face} strokeWidth="0.9" strokeLinecap="round" />
        </>
      )}
      {/* the little golden eye and white beard */}
      <path d="M-2.6,2.6 C-1,1.8 1,1.8 2.6,2.6 L0,7.2 Z" fill="#f3c14a" />
      <path d="M-2.6,2.6 L0,7.2 L2.6,2.6" className="ink-thin" fill="none" />
      <path d="M-4.6,3.4 L-3.2,4.8 M4.6,3.4 L3.2,4.8" stroke="#fbf6ee" strokeWidth="1.1" strokeLinecap="round" />
    </g>
  );
}

/** A rounded leaf with a scalloped margin; base at (0,0), pointing up before rotation. */
export function PansyLeaf({ x = 0, y = 0, rot, len, s = 1 }: { x?: number; y?: number; rot: number; len: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <Stem d={`M0,0 L0,${-len}`} w={2} color={LEAF.base} />
      <g transform={`translate(0 ${-len + 2}) scale(${s})`}>
        <path
          className="ink"
          fill={LEAF.base}
          d="M0,0 C-6,-2 -10,-8 -10,-13 C-12,-15 -10,-18 -9,-19 C-10,-21 -8,-24 -5,-24 C-4,-27 -1,-28 1,-27 C4,-28 6,-26 6,-24 C9,-24 10,-21 9,-19 C11,-17 11,-14 10,-12 C10,-7 6,-2 0,0 Z"
        />
        <path d="M0,-1 C3,-4 7,-8 9,-13 C10,-17 8,-21 6,-23 C6,-16 4,-8 0,-1 Z" fill={LEAF.shade} />
        <path d="M0,-1 C0.6,-9 0.4,-17 -0.5,-24" fill="none" stroke={LEAF.vein} strokeWidth="0.9" strokeLinecap="round" />
        <path d="M-6,-17 C-5,-20 -3,-22 -1,-23" fill="none" stroke={LEAF.hi} strokeWidth="1.1" strokeLinecap="round" />
      </g>
    </g>
  );
}

/** A nodding bud: pansy buds hang their heads before they open. */
export function PansyBud({ x, y, rot, c }: { x: number; y: number; rot: number; c: PansyColors }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path className="ink" fill={c.top} d="M0,0 C-5,2 -7,9 -3,14 C-1,16.5 2,16 3.5,13.5 C6.5,9 5.5,2 0,0 Z" />
      <path d="M1,3 C3,6 3.4,10 2,13.6" fill="none" stroke={c.low} strokeWidth="1.6" strokeLinecap="round" />
      <path className="ink-thin" fill={LEAF.base} d="M0,-1 C-4,0 -6,4 -6,8 C-4,5 -2,3 0,2 C2,3 4,5 5,8 C5,4 3,0 0,-1 Z" />
    </g>
  );
}

/** The original bed of four: pink-and-black, blush, cream and velvet. */
export const PANSY_MIX: PansyColors[] = [PANSY_OLCIA, PANSY_ROSY, PANSY_CREAM, PANSY_VELVET];

/** A bratek at any stage; `palette` gives the colours of its four flowers (and its buds). */
export function PansyPlant({ stage, palette = PANSY_MIX, label = 'bratek' }: { stage: Stage; palette?: PansyColors[]; label?: string }) {
  const [c0, c1, c2, c3] = [palette[0]!, palette[1 % palette.length]!, palette[2 % palette.length]!, palette[3 % palette.length]!];
  if (stage === 'seed') {
    return (
      <g>
        <Seeds />
        <SeedMarker label={label} />
      </g>
    );
  }
  if (stage === 'seedling') {
    return (
      <g>
        <Stem d="M0,0 C-1,-6 1,-12 0,-17" w={2.2} color="#86ad68" />
        <g transform="translate(0 -17)">
          <path className="ink" fill="#9cc27f" d="M0,0 C-4,-6 -12,-7 -14,-3 C-15,1 -8,3 0,0 Z" />
          <path className="ink" fill="#92b974" d="M0,0 C4,-7 12,-9 15,-5 C16,-1 9,2 0,0 Z" />
          <path d="M-12,-3.5 C-9,-5 -5,-4.5 -2,-2" fill="none" stroke="#c3dda8" strokeWidth="1" strokeLinecap="round" />
        </g>
        <PansyLeaf x={0} y={-15} rot={-14} len={3} s={0.38} />
      </g>
    );
  }
  if (stage === 'bud') {
    return (
      <g>
        <PansyLeaf rot={-62} len={8} s={0.6} />
        <PansyLeaf rot={58} len={9} s={0.62} />
        <Stem d="M-1,0 C-3,-14 -8,-28 -12,-36 C-13,-38 -12,-40 -10,-40" w={1.8} />
        <Stem d="M1,0 C3,-16 8,-34 14,-44 C16,-46 18,-46 19,-44" w={1.8} />
        <PansyBud x={-10} y={-40} rot={20} c={c0} />
        <PansyBud x={19} y={-44} rot={-28} c={c3} />
        <PansyLeaf rot={-28} len={10} s={0.7} />
        <PansyLeaf rot={14} len={11} s={0.72} />
        <PansyLeaf rot={-92} len={4} s={0.5} />
        <PansyLeaf rot={88} len={4} s={0.52} />
      </g>
    );
  }
  return (
    <g>
      {/* back leaves */}
      <PansyLeaf rot={-70} len={14} s={1.05} />
      <PansyLeaf rot={-42} len={20} s={1.1} />
      <PansyLeaf rot={-12} len={24} s={1.0} />
      <PansyLeaf rot={20} len={22} s={1.12} />
      <PansyLeaf rot={48} len={18} s={1.05} />
      <PansyLeaf rot={74} len={12} s={1.0} />
      {/* flower stems */}
      <Stem d="M-3,-4 C-8,-22 -20,-40 -30,-56" w={2.2} />
      <Stem d="M0,-4 C1,-28 4,-52 8,-76" w={2.2} />
      <Stem d="M3,-4 C12,-20 26,-36 38,-50" w={2.2} />
      <Stem d="M1,-4 C-2,-16 -6,-28 -8,-34 C-9,-37 -7,-40 -4,-40" w={1.8} />
      <Stem d="M2,-4 C10,-14 18,-20 24,-26" w={2} />
      <PansyBud x={-4} y={-40} rot={-24} c={c3} />
      <PansyFlower x={24} y={-28} rot={22} s={0.62} c={c3} />
      <PansyFlower x={-30} y={-58} rot={-14} s={0.86} c={c1} />
      <PansyFlower x={38} y={-52} rot={12} s={0.8} c={c2} />
      <PansyFlower x={8} y={-78} rot={3} s={0.92} c={c0} />
      {/* front leaves spilling over the rim */}
      <PansyLeaf x={-14} y={0} rot={-108} len={6} s={0.95} />
      <PansyLeaf x={16} y={0} rot={112} len={5} s={0.9} />
      <PansyLeaf x={-2} y={0} rot={-160} len={2} s={0.8} />
    </g>
  );
}
