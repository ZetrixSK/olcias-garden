import type { Stage } from '../garden/species';
import { SeedMarker, Stem } from './common';

const R = { petal: '#f3baa3', shade: '#df9583', deep: '#bd6b68', hi: '#fcdccb' };
const RL = { base: '#5c8553', shade: '#466b40', vein: '#3b5935', young: '#8e6352' };

export function RoseBloom({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path
        className="ink"
        fill={R.petal}
        d="M-22,2 C-26,-10 -18,-22 -6,-22 C-2,-26 8,-25 13,-20 C22,-18 26,-8 23,1 C26,10 18,20 8,20 C3,24 -8,23 -12,18 C-20,17 -25,10 -22,2 Z"
      />
      <path fill={R.shade} d="M-12,18 C-4,21 4,22 8,20 C12,18 18,16 20,12 C14,14 4,16 -2,16 C-6,16 -10,17 -12,18 Z" />
      <path
        className="ink-thin"
        fill="none"
        d="M-6,-22 C-8,-16 -14,-12 -20,-10 M13,-20 C12,-14 16,-8 22,-6 M8,20 C6,14 12,10 20,10 M-12,18 C-10,12 -16,8 -22,6"
      />
      <path d="M-18,-12 C-14,-18 -10,-20 -6,-21 M15,-17 C19,-14 21,-10 22,-6" fill="none" stroke={R.hi} strokeWidth="1.5" strokeLinecap="round" />
      <path className="ink-thin" fill={R.shade} d="M-14,-2 C-16,-12 -8,-17 0,-16 C8,-17 15,-11 14,-2 C14,7 7,12 0,12 C-8,12 -14,7 -14,-2 Z" />
      <path fill={R.deep} d="M-9,-4 C-10,-10 -4,-12 1,-11 C7,-11 10,-6 9,-2 C6,2 -6,2 -9,-4 Z" />
      <path className="ink-thin" fill="none" d="M-2,-6 C-6,-4 -4,1 1,0 C5,-1 4,-6 0,-7 C-5,-8 -8,-4 -7,0" />
      <path className="ink-thin" fill={R.hi} d="M-14,-1 C-9,8 9,8 14,-1 C11,11 -10,12 -14,-1 Z" />
      <path className="ink-thin" fill={R.petal} d="M-13,-6 C-15,-12 -10,-15 -6,-14 C-9,-11 -11,-8 -11,-3 Z" />
    </g>
  );
}

export function RoseHalf({ x, y, rot }: { x: number; y: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path className="ink-thin" fill={RL.base} d="M-1,0 C-6,1 -11,4 -14,9 C-9,6 -5,4 -1,3 Z M1,0 C6,1 11,4 13,9 C9,6 5,4 1,3 Z" />
      <path className="ink" fill={R.petal} d="M-11,-2 C-14,-12 -9,-22 0,-24 C9,-22 14,-12 11,-2 C6,2 -6,2 -11,-2 Z" />
      <path fill={R.deep} d="M-6,-21 C-3,-23 3,-23 6,-21 C3,-18 -3,-18 -6,-21 Z" />
      <path className="ink-thin" fill={R.hi} d="M-11,-4 C-6,-13 5,-15 11,-6 C9,0 -8,1 -11,-4 Z" />
      <path className="ink-thin" fill="none" d="M-7,-20 C-4,-16 2,-15 7,-19" />
      <path className="ink-thin" fill={RL.base} d="M-2,1 C-4,-4 -9,-8 -12,-9 C-8,-4 -5,-1 -2,2 Z" />
    </g>
  );
}

export function RoseBud({ x, y, rot }: { x: number; y: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path className="ink" fill="#d98a86" d="M-5,0 C-7,-6 -4,-13 0,-16 C4,-13 7,-6 5,0 Z" />
      <path d="M-1,-14 C1,-10 2,-5 1,-1" fill="none" stroke={R.hi} strokeWidth="1" strokeLinecap="round" />
      <path className="ink-thin" fill={RL.base} d="M-5,1 C-8,-4 -6,-10 -4,-14 C-3,-9 -2,-4 0,1 Z" />
      <path className="ink-thin" fill={RL.shade} d="M5,1 C8,-3 7,-8 6,-11 C4,-6 2,-3 0,1 Z" />
      <path d="M-1,2 C-6,3 -10,1 -12,-2 M1,2 C6,3 10,1 12,-3" className="ink-thin" fill="none" />
    </g>
  );
}

const LEAFLET =
  'M0,0 C-3,-1 -5,-4 -5,-7 L-5.8,-7.6 L-4.6,-8.4 C-4,-10.5 -2,-12.5 0,-14 C2,-12.5 4,-10.5 4.6,-8.4 L5.8,-7.6 L5,-7 C5,-4 3,-1 0,0 Z';

export function LeafCluster({ x, y, rot, len, young }: { x: number; y: number; rot: number; len: number; young?: boolean }) {
  const fill = young ? RL.young : RL.base;
  const leaflet = (lx: number, ly: number, r: number, s: number) => (
    <g transform={`translate(${lx} ${ly}) rotate(${r}) scale(${s})`}>
      <path className="ink-thin" fill={fill} d={LEAFLET} />
      <path d="M0,-1 L0,-12" stroke={RL.vein} strokeWidth="0.8" />
      <path d="M0.5,-1 C3,-3 4.5,-6 4.6,-8.4 L0.5,-12 Z" fill={RL.shade} opacity="0.55" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M0,0 L0,${-len}`} stroke="#5b6f3e" strokeWidth="1.3" />
      {leaflet(0, -len * 0.18, -72, 0.8)}
      {leaflet(0, -len * 0.18, 72, 0.8)}
      {leaflet(0, -len * 0.58, -55, 0.95)}
      {leaflet(0, -len * 0.58, 55, 0.95)}
      {leaflet(0, -len, 0, 1.1)}
    </g>
  );
}

export function Thorns({ pts }: { pts: Array<[number, number, number]> }) {
  return (
    <g>
      {pts.map(([x, y, r], i) => (
        <path key={i} transform={`translate(${x} ${y}) rotate(${r})`} d="M-1.6,0 L0,-4 L1.6,0 Z" fill="#7d4d3e" className="ink-thin" />
      ))}
    </g>
  );
}

export function RosePlant({ stage = 'bloom', label = 'róża' }: { stage?: Stage; label?: string }) {
  if (stage === 'seed') {
    return (
      <g>
        {/* roses start from a cutting: a bare cane with one leaf left on */}
        <Stem d="M-1,0 L-2,-28" w={2.6} color="#6b8049" />
        <ellipse className="ink-thin" cx="-2" cy="-28.4" rx="1.6" ry="0.9" fill="#c9b98f" />
        <LeafCluster x={-1.6} y={-20} rot={55} len={9} young />
        <SeedMarker label={label} />
      </g>
    );
  }
  if (stage === 'seedling') {
    return (
      <g>
        <Stem d="M-1,0 C-2,-14 -2,-28 0,-42" w={2.4} color="#6b8049" />
        <Thorns pts={[[-2.4, -16, -80], [0.4, -30, 80]]} />
        <LeafCluster x={-1.6} y={-18} rot={-58} len={14} />
        <LeafCluster x={-0.6} y={-30} rot={54} len={14} />
        <LeafCluster x={0} y={-41} rot={6} len={12} young />
      </g>
    );
  }
  if (stage === 'bud') {
    return (
      <g>
        <LeafCluster x={-1} y={-10} rot={-100} len={16} />
        <Stem d="M-2,0 C-3,-28 -2,-56 2,-84" w={2.6} color="#6b8049" />
        <Stem d="M-2,-30 C6,-40 14,-50 20,-60" w={2.2} color="#6b8049" />
        <Thorns pts={[[-3.6, -20, -80], [-2.6, -46, -75], [10, -46, 40]]} />
        <LeafCluster x={-2.6} y={-36} rot={-64} len={20} />
        <LeafCluster x={4} y={-36} rot={60} len={18} />
        <LeafCluster x={-1} y={-62} rot={-50} len={17} young />
        <LeafCluster x={14} y={-52} rot={40} len={14} />
        <RoseBud x={2} y={-84} rot={4} />
        <RoseBud x={20} y={-60} rot={30} />
      </g>
    );
  }
  return (
    <g>
      <LeafCluster x={-1} y={-10} rot={-100} len={18} />
      <LeafCluster x={4} y={-16} rot={96} len={17} />
      <Stem d="M-4,0 C-6,-30 -14,-60 -20,-94" w={2.6} color="#6b8049" />
      <Stem d="M3,0 C6,-40 12,-80 16,-116" w={2.4} color="#6b8049" />
      <Stem d="M4,-34 C12,-46 21,-58 28,-70" w={2.2} color="#6b8049" />
      <Thorns pts={[[-7, -24, -80], [-11, -52, -70], [8, -62, 80], [12, -84, 85], [15, -48, 30]]} />
      <LeafCluster x={-8} y={-38} rot={-62} len={22} />
      <LeafCluster x={6} y={-56} rot={48} len={22} />
      <LeafCluster x={-14} y={-66} rot={-78} len={19} />
      <LeafCluster x={13} y={-92} rot={36} len={17} young />
      <RoseBud x={16} y={-116} rot={8} />
      <RoseHalf x={28} y={-70} rot={26} />
      <RoseBloom x={-20} y={-100} rot={-8} />
    </g>
  );
}
