import type { Stage } from '../garden/species';
import { SeedMarker, Seeds, Stem } from './common';

// ---------- przebiśnieg: snowdrop ----------

const SNOW_LEAF = { base: '#86a894', shade: '#6a8c79', hi: '#a9c5b3' };

/** A narrow, blunt-tipped snowdrop leaf rising from the soil. */
function StrapLeaf({ x = 0, h, lean }: { x?: number; h: number; lean: number }) {
  const tx = x + lean;
  return (
    <g>
      <path className="ink-thin" fill={SNOW_LEAF.base} d={`M${x - 2.4},0 C${x - 2.6},${-h * 0.5} ${tx - 2.2},${-h * 0.85} ${tx},${-h} C${tx + 2.2},${-h * 0.85} ${x + 2.6},${-h * 0.5} ${x + 2.4},0 Z`} />
      <path d={`M${x},-1 C${x},${-h * 0.5} ${tx},${-h * 0.8} ${tx},${-h + 2}`} fill="none" stroke={SNOW_LEAF.hi} strokeWidth="0.8" opacity="0.8" />
    </g>
  );
}

/** One nodding bell, hanging down from (0,0): three white outer petals and the green mark on the inner ones. */
export function SnowdropBell({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse className="ink-thin" cx="0" cy="2.2" rx="1.9" ry="2.4" fill="#7fa36b" />
      <path className="ink-thin" fill="#f2f1ea" d="M0,4 C-6,6 -8.6,13 -5.6,19.4 C-3.4,17.4 -1.2,12 0,4 Z" />
      <path className="ink-thin" fill="#f2f1ea" d="M0,4 C6,6 8.6,13 5.6,19.4 C3.4,17.4 1.2,12 0,4 Z" />
      <path d="M-2.6,16.6 C-1.6,15.4 1.6,15.4 2.6,16.6 L2,19 L-2,19 Z" fill="#eef3e6" />
      <path d="M-1.8,17.8 L0,16.4 L1.8,17.8" fill="none" stroke="#6f9a5a" strokeWidth="0.9" strokeLinecap="round" />
      <path className="ink-thin" fill="#fbfaf5" d="M0,4 C-4.2,7 -4.4,15 0,21 C4.4,15 4.2,7 0,4 Z" />
      <path d="M-1.4,8 C-1.8,11 -1.4,15 0,18" fill="none" stroke="#e1e4dc" strokeWidth="0.8" />
    </g>
  );
}

/** A snowdrop's stalk: up, then curving over so the bell hangs at its tip. Returns where the bell hangs. */
function Crook({ x, h, reach }: { x: number; h: number; reach: number }) {
  const d = `M${x},0 C${x - 1},${-h * 0.6} ${x},${-h} ${x + reach * 0.5},${-h - 3} C${x + reach * 0.8},${-h - 3.6} ${x + reach},${-h - 1} ${x + reach},${-h + 2}`;
  return <Stem d={d} w={1.5} color="#7fa36b" />;
}

export function SnowdropPlant({ stage, label = 'przebiśnieg' }: { stage: Stage; label?: string }) {
  if (stage === 'seed') {
    return (
      <g>
        <path className="ink" fill="#ece0c7" d="M-7,0 C-8,-6 -4,-10.6 0,-13 C4,-10.6 8,-6 7,0 Z" />
        <path d="M-3,-1 C-3,-5 -1.6,-9 0,-12 M3,-1 C3,-5 1.6,-9 0,-12" fill="none" stroke="#c7b38e" strokeWidth="0.8" />
        <path className="ink-thin" fill={SNOW_LEAF.base} d="M-1.2,-12.4 C-1,-17 1,-17 1.2,-12.4 Z" />
        <SeedMarker label={label} />
      </g>
    );
  }
  if (stage === 'seedling') {
    return (
      <g>
        <StrapLeaf x={-2} h={24} lean={-4} />
        <StrapLeaf x={2} h={28} lean={3} />
        <StrapLeaf x={0} h={14} lean={1} />
      </g>
    );
  }
  if (stage === 'bud') {
    return (
      <g>
        <StrapLeaf x={-5} h={40} lean={-7} />
        <StrapLeaf x={5} h={36} lean={6} />
        <Crook x={1} h={50} reach={6} />
        {/* the closed bud, still wrapped in its green sheath */}
        <g transform="translate(7 -48)">
          <path className="ink-thin" fill="#9fbf86" d="M-1.4,0 C-2.4,-4 -1,-8 1,-10 C1.6,-6 1.4,-2 0.8,0 Z" />
          <path className="ink-thin" fill="#f4f3ec" d="M0,1 C-3.4,4 -3.6,10 0,15 C3.6,10 3.4,4 0,1 Z" />
        </g>
        <StrapLeaf x={-1} h={44} lean={-2} />
      </g>
    );
  }
  return (
    <g>
      <StrapLeaf x={-8} h={44} lean={-10} />
      <StrapLeaf x={8} h={40} lean={9} />
      <Crook x={-4} h={56} reach={-8} />
      <Crook x={2} h={66} reach={7} />
      <Crook x={7} h={46} reach={9} />
      <SnowdropBell x={-12} y={-54} rot={8} />
      <SnowdropBell x={9} y={-64} rot={-6} s={1.05} />
      <SnowdropBell x={16} y={-44} rot={-10} s={0.9} />
      <StrapLeaf x={-2} h={50} lean={-3} />
      <StrapLeaf x={3} h={34} lean={4} />
    </g>
  );
}

// ---------- cyklamen: cyclamen ----------

const CYC_LEAF = { base: '#3f6b4a', shade: '#2f5439', silver: '#b4c9b4' };
export type CyclamenColors = { petal: string; shade: string; eye: string };
export const CYCLAMEN_COLORS: CyclamenColors[] = [
  { petal: '#d0407a', shade: '#a82a5e', eye: '#6e1438' },
  { petal: '#f3a0bf', shade: '#d77b9e', eye: '#a83a66' },
  { petal: '#f7eff0', shade: '#e2d2d6', eye: '#c0466e' },
];

/** A heart-shaped leaf, dark green marbled with silver, on its own stalk from the middle of the plant. */
function CyclamenLeaf({ rot, len, s = 1 }: { rot: number; len: number; s?: number }) {
  return (
    <g transform={`rotate(${rot})`}>
      <path d={`M0,0 L0,${-len}`} stroke="#7a4652" strokeWidth="1.3" />
      <g transform={`translate(0 ${-len}) scale(${s})`}>
        <path className="ink-thin" fill={CYC_LEAF.base} d="M0,2 C-9,0 -13,-9 -10,-15 C-8,-19.6 -2.4,-19 0,-14.6 C2.4,-19 8,-19.6 10,-15 C13,-9 9,0 0,2 Z" />
        <path d="M0,-2 C-6,-3 -8.4,-8.6 -6.8,-12.4 C-5.4,-14.8 -2,-14.4 0,-11.4 C2,-14.4 5.4,-14.8 6.8,-12.4 C8.4,-8.6 6,-3 0,-2 Z" fill="none" stroke={CYC_LEAF.silver} strokeWidth="1.4" opacity="0.85" />
        <path d="M0,1 L0,-13" stroke={CYC_LEAF.shade} strokeWidth="0.8" />
      </g>
    </g>
  );
}

/** The flower at the top of its stalk: petals swept straight back and up, like a flame. */
export function CyclamenFlower({ x, y, c, rot = 0, s = 1 }: { x: number; y: number; c: CyclamenColors; rot?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path className="ink-thin" fill={c.shade} d="M-1,0 C-7,-4 -11,-13 -10,-21 C-6.6,-15 -3.6,-7 -1,0 Z" />
      <path className="ink-thin" fill={c.shade} d="M1,0 C7,-4 11,-13 10,-21 C6.6,-15 3.6,-7 1,0 Z" />
      <path className="ink-thin" fill={c.petal} d="M-0.6,0 C-5,-5 -6.4,-15 -3.6,-24 C-1.6,-16 -0.4,-8 1,0 Z" />
      <path className="ink-thin" fill={c.petal} d="M0.6,0 C5,-5 6.4,-15 3.6,-24 C1.6,-16 0.4,-8 -1,0 Z" />
      <path d="M-2.4,-3 C-3.4,-9 -3.6,-15 -2.6,-20" fill="none" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="0.9" strokeLinecap="round" />
      <ellipse className="ink-thin" cx="0" cy="1.4" rx="2.6" ry="2" fill={c.eye} />
    </g>
  );
}

/** A flower stalk: up from the middle, bending over at the top where the flower turns down and its petals sweep up. */
function CycStalk({ x, top, lean }: { x: number; top: number; lean: number }) {
  return <Stem d={`M0,-2 C${x * 0.3},${top * 0.5} ${x + lean},${top * 0.9} ${x},${top}`} w={1.4} color="#8a4a5a" />;
}

export function CyclamenPlant({ stage, label = 'cyklamen' }: { stage: Stage; label?: string }) {
  if (stage === 'seed') {
    return (
      <g>
        <ellipse className="ink" cx="0" cy="-2" rx="9" ry="4" fill="#8a6447" />
        <path d="M-5,-3 C-2,-4.6 2,-4.6 5,-3" fill="none" stroke="#6a4a33" strokeWidth="0.8" />
        <SeedMarker label={label} />
      </g>
    );
  }
  if (stage === 'seedling') {
    return (
      <g>
        <ellipse cx="0" cy="-1" rx="6" ry="2.6" fill="#8a6447" className="ink-thin" />
        <CyclamenLeaf rot={-24} len={8} s={0.6} />
        <CyclamenLeaf rot={20} len={10} s={0.7} />
      </g>
    );
  }
  const leaves = (
    <g>
      <CyclamenLeaf rot={-70} len={12} s={0.95} />
      <CyclamenLeaf rot={68} len={12} s={0.95} />
      <CyclamenLeaf rot={-36} len={14} s={1.05} />
      <CyclamenLeaf rot={34} len={15} s={1} />
      <CyclamenLeaf rot={-4} len={10} s={1.1} />
    </g>
  );
  if (stage === 'bud') {
    return (
      <g>
        <CycStalk x={-6} top={-40} lean={-4} />
        <CycStalk x={8} top={-34} lean={6} />
        {/* twisted buds, still hanging their heads */}
        <path className="ink-thin" fill={CYCLAMEN_COLORS[0]!.petal} d="M-6,-40 C-9,-38 -9.6,-33 -7,-30 C-5,-32 -4.6,-37 -6,-40 Z" />
        <path className="ink-thin" fill={CYCLAMEN_COLORS[1]!.petal} d="M8,-34 C11,-32 11.6,-27 9,-24 C7,-26 6.6,-31 8,-34 Z" />
        {leaves}
      </g>
    );
  }
  return (
    <g>
      <CycStalk x={-16} top={-46} lean={-4} />
      <CycStalk x={-3} top={-58} lean={-2} />
      <CycStalk x={9} top={-52} lean={4} />
      <CycStalk x={20} top={-40} lean={6} />
      <CyclamenFlower x={-16} y={-46} c={CYCLAMEN_COLORS[0]!} rot={-12} s={0.95} />
      <CyclamenFlower x={-3} y={-58} c={CYCLAMEN_COLORS[2]!} rot={-4} />
      <CyclamenFlower x={9} y={-52} c={CYCLAMEN_COLORS[0]!} rot={8} />
      <CyclamenFlower x={20} y={-40} c={CYCLAMEN_COLORS[1]!} rot={16} s={0.9} />
      {leaves}
    </g>
  );
}

// ---------- ciemiernik: Christmas rose ----------

const HEL_LEAF = { base: '#3d5f45', shade: '#2e4a35', vein: '#5f8466' };

/** A leathery leaf of five long fingers fanning from its stalk. */
function HelleboreLeaf({ rot, len, s = 1 }: { rot: number; len: number; s?: number }) {
  return (
    <g transform={`rotate(${rot})`}>
      <path d={`M0,0 L0,${-len}`} stroke="#5d7a4e" strokeWidth="1.6" />
      <g transform={`translate(0 ${-len}) scale(${s})`}>
        {[-64, -32, 0, 32, 64].map((a, i) => (
          <g key={a} transform={`rotate(${a})`}>
            <path className="ink-thin" fill={i % 2 ? HEL_LEAF.shade : HEL_LEAF.base} d="M0,0 C-3.4,-5 -3.6,-14 0,-20 C3.6,-14 3.4,-5 0,0 Z" />
            <path d="M0,-1 L0,-17" stroke={HEL_LEAF.vein} strokeWidth="0.6" />
          </g>
        ))}
      </g>
    </g>
  );
}

/** The flower, open and facing out: five broad white petals blushing pink at the base, a ring of gold stamens. */
export function HelleboreFlower({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path className="ink-thin" fill="#f8f4ec" d="M0,-2 C-6.4,-3 -8,-10 -5,-13.4 C-2.6,-15.4 2.6,-15.4 5,-13.4 C8,-10 6.4,-3 0,-2 Z" />
          <path d="M0,-2.4 C-2.6,-4 -3,-7 -2,-9 C-0.4,-7 0.4,-7 2,-9 C3,-7 2.6,-4 0,-2.4 Z" fill="#ecc7d1" opacity="0.8" />
        </g>
      ))}
      <circle r="4.2" fill="#b7cf7a" className="ink-thin" />
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={Math.cos((i / 12) * Math.PI * 2) * 4.6} cy={Math.sin((i / 12) * Math.PI * 2) * 4.6} r="1" fill="#f0cf5a" />
      ))}
      <circle r="1.6" fill="#8fae5c" />
    </g>
  );
}

function HelleboreBud({ x, y, rot }: { x: number; y: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path className="ink-thin" fill="#f6eee8" d="M0,0 C-5,-2 -5.6,-9 0,-12 C5.6,-9 5,-2 0,0 Z" />
      <path d="M-2,-2 C-3,-5 -2.4,-8 0,-10.6" fill="none" stroke="#e7bfcb" strokeWidth="1" />
    </g>
  );
}

export function ChristmasRosePlant({ stage, label = 'ciemiernik' }: { stage: Stage; label?: string }) {
  if (stage === 'seed') {
    return (
      <g>
        <Seeds color="#3d2a22" />
        <SeedMarker label={label} />
      </g>
    );
  }
  if (stage === 'seedling') {
    return (
      <g>
        <Stem d="M-1,0 C-3,-6 -6,-10 -9,-12" w={1.2} />
        <Stem d="M1,0 C3,-6 6,-10 9,-12" w={1.2} />
        <ellipse className="ink-thin" cx="-11" cy="-13" rx="4.4" ry="2.8" fill="#6f9a5a" transform="rotate(-25 -11 -13)" />
        <ellipse className="ink-thin" cx="11" cy="-13" rx="4.4" ry="2.8" fill="#6f9a5a" transform="rotate(25 11 -13)" />
        <HelleboreLeaf rot={4} len={10} s={0.5} />
      </g>
    );
  }
  if (stage === 'bud') {
    return (
      <g>
        <HelleboreLeaf rot={-44} len={18} s={0.85} />
        <HelleboreLeaf rot={40} len={20} s={0.9} />
        <Stem d="M-2,0 C-4,-14 -6,-26 -8,-36" w={1.8} color="#8a7a5a" />
        <Stem d="M3,0 C5,-12 9,-22 12,-30" w={1.8} color="#8a7a5a" />
        <HelleboreBud x={-8} y={-36} rot={-14} />
        <HelleboreBud x={12} y={-30} rot={18} />
        <HelleboreLeaf rot={-6} len={14} s={0.8} />
      </g>
    );
  }
  return (
    <g>
      <HelleboreLeaf rot={-52} len={20} s={0.95} />
      <HelleboreLeaf rot={50} len={22} s={0.95} />
      <Stem d="M-3,0 C-6,-16 -12,-30 -16,-40" w={1.8} color="#8a7a5a" />
      <Stem d="M0,0 C0,-18 2,-36 2,-52" w={1.8} color="#8a7a5a" />
      <Stem d="M3,0 C8,-12 15,-24 19,-32" w={1.8} color="#8a7a5a" />
      <HelleboreFlower x={-16} y={-42} rot={-16} s={0.95} />
      <HelleboreFlower x={2} y={-55} rot={6} s={1.05} />
      <HelleboreFlower x={20} y={-34} rot={22} s={0.9} />
      <HelleboreBud x={-6} y={-30} rot={-30} />
      <HelleboreLeaf rot={-14} len={16} s={0.85} />
      <HelleboreLeaf rot={18} len={14} s={0.8} />
    </g>
  );
}
