import type { Stage } from '../garden/species';
import { LEAF, SeedMarker, Stem } from './common';

// ---------- malwa: black hollyhock ----------

const HOLLY = { petal: '#2a0f1f', vein: '#5a2238', hi: '#6e3048', eye: '#e8d9a0' };

/** A big round leaf, softly lobed, on a stalk from the base. */
function RoundLeaf({ rot, len, s = 1 }: { rot: number; len: number; s?: number }) {
  return (
    <g transform={`rotate(${rot})`}>
      <path d={`M0,0 L0,${-len}`} stroke="#5f7d45" strokeWidth="1.6" />
      <g transform={`translate(0 ${-len}) scale(${s})`}>
        <path
          className="ink-thin"
          fill="#5f8a55"
          d="M0,2 C-6,2 -11,-1 -12,-6 C-14,-8 -13,-12 -11,-13 C-12,-16 -9,-19 -6,-18 C-4,-21 4,-21 6,-18 C9,-19 12,-16 11,-13 C13,-12 14,-8 12,-6 C11,-1 6,2 0,2 Z"
        />
        <path d="M0,1 L0,-17 M0,-6 L-8,-12 M0,-6 L8,-12 M0,-11 L-4,-17 M0,-11 L4,-17" fill="none" stroke="#47703f" strokeWidth="0.7" />
      </g>
    </g>
  );
}

/** One open flower seen face on: five broad near-black petals with wine-coloured veins and a pale eye. */
export function HollyhockFlower({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <g key={a} transform={`rotate(${a + 18})`}>
          <path className="ink-thin" fill={HOLLY.petal} d="M0,-1 C-6,-2 -8.4,-7 -6.6,-10.6 C-4,-12.6 4,-12.6 6.6,-10.6 C8.4,-7 6,-2 0,-1 Z" />
          <path d="M0,-2 L0,-10 M-2.4,-2.6 L-4,-9 M2.4,-2.6 L4,-9" stroke={HOLLY.vein} strokeWidth="0.7" />
        </g>
      ))}
      <path d="M-5,-6 C-3,-8 0,-8.6 2,-8" fill="none" stroke={HOLLY.hi} strokeWidth="1" strokeLinecap="round" />
      <circle r="2.4" fill={HOLLY.eye} className="ink-thin" />
      <circle r="0.9" fill="#c9b46a" />
    </g>
  );
}

function HollyBud({ x, y, s = 1, dark = false }: { x: number; y: number; s?: number; dark?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse className="ink-thin" cx="0" cy="0" rx="3" ry="4" fill="#8fae6c" />
      {dark && <path d="M-1.6,-3.2 C-0.6,-5 0.6,-5 1.6,-3.2 C0.6,-3.8 -0.6,-3.8 -1.6,-3.2 Z" fill={HOLLY.petal} />}
    </g>
  );
}

export function HollyhockPlant({ stage, label = 'malwa' }: { stage: Stage; label?: string }) {
  if (stage === 'seed') {
    return (
      <g>
        <path d="M-12,0 C-8,-3 6,-3.5 12,-0.5" fill="none" stroke="#3a281f" strokeWidth="1.2" />
        {[-5, 0, 4].map((x, i) => (
          <circle key={x} cx={x} cy={-1.8 - (i % 2)} r="1.8" fill="#7a5a3e" className="ink-thin" />
        ))}
        <SeedMarker label={label} />
      </g>
    );
  }
  if (stage === 'seedling') {
    return (
      <g>
        <Stem d="M0,0 C0,-5 -2,-9 -5,-11" w={1.2} />
        <Stem d="M0,0 C0,-5 2,-9 5,-11" w={1.2} />
        <ellipse className="ink-thin" cx="-7" cy="-12" rx="3.8" ry="3.2" fill={LEAF.base} />
        <ellipse className="ink-thin" cx="7" cy="-12" rx="3.8" ry="3.2" fill={LEAF.base} />
        <RoundLeaf rot={0} len={14} s={0.45} />
      </g>
    );
  }
  if (stage === 'bud') {
    return (
      <g>
        <RoundLeaf rot={-58} len={12} s={0.95} />
        <RoundLeaf rot={56} len={14} s={0.9} />
        <Stem d="M0,0 C1,-30 1,-60 0,-88" w={2.6} color="#6b8a50" />
        {[-48, -58, -68, -76, -84].map((y, i) => (
          <HollyBud key={y} x={i % 2 ? 3.4 : -3.4} y={y} s={1 - i * 0.1} dark={i < 2} />
        ))}
        <RoundLeaf rot={-24} len={20} s={0.75} />
        <RoundLeaf rot={26} len={24} s={0.7} />
      </g>
    );
  }
  return (
    <g>
      <RoundLeaf rot={-62} len={12} s={1} />
      <RoundLeaf rot={60} len={14} s={0.95} />
      <Stem d="M0,0 C1,-50 1,-100 -1,-150" w={2.8} color="#6b8a50" />
      <Stem d="M2,-20 C10,-40 14,-60 16,-80" w={2} color="#6b8a50" />
      {/* flowers open from the bottom of the spire up; the top is still in bud */}
      <HollyhockFlower x={-6} y={-50} s={1.15} />
      <HollyhockFlower x={6} y={-68} s={1.1} />
      <HollyhockFlower x={-5} y={-86} s={1.05} />
      <HollyhockFlower x={5} y={-102} s={0.95} />
      <HollyhockFlower x={16} y={-74} s={0.9} />
      <HollyBud x={-3} y={-116} s={0.95} dark />
      <HollyBud x={3} y={-126} s={0.85} dark />
      <HollyBud x={-1.6} y={-136} s={0.75} />
      <HollyBud x={0.6} y={-145} s={0.6} />
      <HollyBud x={17} y={-86} s={0.7} dark />
      <RoundLeaf rot={-26} len={22} s={0.8} />
      <RoundLeaf rot={28} len={26} s={0.75} />
      <RoundLeaf rot={-4} len={34} s={0.6} />
    </g>
  );
}

// ---------- dynia: pumpkin ----------

const PUMPKIN_LEAF = { base: '#5f8e57', shade: '#4b7546', vein: '#3f6339' };

/** A broad pumpkin leaf with five rounded lobes, on its stalk. */
function PumpkinLeaf({ rot, len, s = 1 }: { rot: number; len: number; s?: number }) {
  return (
    <g transform={`rotate(${rot})`}>
      <path d={`M0,0 L0,${-len}`} stroke="#6f8f4a" strokeWidth="1.6" />
      <g transform={`translate(0 ${-len}) scale(${s})`}>
        <path
          className="ink-thin"
          fill={PUMPKIN_LEAF.base}
          d="M0,1 C-5,1 -10,-1 -13,-4 C-15,-6 -14,-9 -11,-9 C-14,-12 -13,-16 -9,-16 C-9,-20 -5,-22 -2,-19 C-1,-23 1,-23 2,-19 C5,-22 9,-20 9,-16 C13,-16 14,-12 11,-9 C14,-9 15,-6 13,-4 C10,-1 5,1 0,1 Z"
        />
        <path d="M0,0 L0,-19 M0,-4 L-11,-8 M0,-4 L11,-8 M0,-8 L-8,-15 M0,-8 L8,-15" fill="none" stroke={PUMPKIN_LEAF.vein} strokeWidth="0.8" />
        <path d="M0,0 C4,-2 9,-3 12,-5 C10,-1 5,1 0,1 Z" fill={PUMPKIN_LEAF.shade} opacity="0.6" />
      </g>
    </g>
  );
}

/** The golden trumpet flower: five pointed petals opening into a star. */
export function PumpkinFlower({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} transform={`rotate(${a})`} className="ink-thin" fill="#f2b13a" d="M0,0 C-3.4,-3 -4,-7 -1.6,-11 L0,-12.6 L1.6,-11 C4,-7 3.4,-3 0,0 Z" />
      ))}
      {[36, 108, 180, 252, 324].map((a) => (
        <path key={a} transform={`rotate(${a})`} d="M0,-1 L0,-7" stroke="#e08f22" strokeWidth="0.8" />
      ))}
      <circle r="2.6" fill="#e8a02a" className="ink-thin" />
    </g>
  );
}

/** A little orange pumpkin with its curled stalk. */
export function MiniPumpkin({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path className="ink-thin" fill="#6f6a3a" d="M-0.8,-9 C-1,-11.6 0.4,-13 2,-14 L2.8,-12.8 C1.6,-12 1,-10.6 1,-9 Z" />
      <ellipse className="ink-thin" cx="-4.6" cy="-4.6" rx="4.6" ry="4.6" fill="#c4692b" />
      <ellipse className="ink-thin" cx="4.6" cy="-4.6" rx="4.6" ry="4.6" fill="#c4692b" />
      <ellipse className="ink-thin" cx="0" cy="-4.8" rx="4.4" ry="5" fill="#e48a3c" />
      <path d="M-2,-8 C-3,-6 -3,-3 -2,-1.4" fill="none" stroke="#f4b064" strokeWidth="1" strokeLinecap="round" />
    </g>
  );
}

function Tendril({ d }: { d: string }) {
  return <path d={d} fill="none" stroke="#7a9a4e" strokeWidth="0.9" strokeLinecap="round" />;
}

export function PumpkinPlant({ stage, label = 'dynia' }: { stage: Stage; label?: string }) {
  if (stage === 'seed') {
    return (
      <g>
        <path d="M-12,0 C-8,-3 6,-3.5 12,-0.5" fill="none" stroke="#3a281f" strokeWidth="1.2" />
        <ellipse className="ink-thin" cx="-4" cy="-2.4" rx="3.2" ry="1.8" fill="#f1e6c8" transform="rotate(-18 -4 -2.4)" />
        <ellipse className="ink-thin" cx="3" cy="-2" rx="3" ry="1.7" fill="#f1e6c8" transform="rotate(12 3 -2)" />
        <SeedMarker label={label} />
      </g>
    );
  }
  if (stage === 'seedling') {
    return (
      <g>
        <Stem d="M0,0 C0,-6 -1,-10 -4,-13" w={1.4} />
        <Stem d="M0,0 C0,-6 1,-10 4,-13" w={1.4} />
        <ellipse className="ink-thin" cx="-8" cy="-14" rx="6" ry="3.4" fill="#7fa86a" transform="rotate(-14 -8 -14)" />
        <ellipse className="ink-thin" cx="8" cy="-14" rx="6" ry="3.4" fill="#7fa86a" transform="rotate(14 8 -14)" />
        <PumpkinLeaf rot={4} len={14} s={0.5} />
      </g>
    );
  }
  if (stage === 'bud') {
    return (
      <g>
        <PumpkinLeaf rot={-62} len={14} s={1} />
        <PumpkinLeaf rot={58} len={16} s={0.95} />
        <Stem d="M2,0 C4,-12 8,-22 12,-30" w={1.6} color="#6f8f4a" />
        <g transform="translate(12 -30) rotate(20)">
          <path className="ink-thin" fill="#b7c86a" d="M0,0 C-3,-3 -3,-9 0,-13 C3,-9 3,-3 0,0 Z" />
          <path d="M0,-6 L0,-12.4" stroke="#e8a02a" strokeWidth="1.6" />
        </g>
        <Tendril d="M-6,-10 C-14,-14 -12,-22 -18,-22 C-22,-22 -21,-17 -18,-18" />
        <PumpkinLeaf rot={-14} len={22} s={0.9} />
      </g>
    );
  }
  return (
    <g>
      <PumpkinLeaf rot={-70} len={16} s={1.05} />
      <PumpkinLeaf rot={66} len={18} s={1} />
      <Tendril d="M-8,-14 C-18,-18 -16,-28 -24,-28 C-29,-28 -28,-22 -24,-23" />
      <Tendril d="M10,-20 C20,-26 18,-36 26,-36 C30,-36 30,-31 27,-31" />
      <Stem d="M0,0 C2,-14 6,-26 10,-38" w={1.6} color="#6f8f4a" />
      <PumpkinFlower x={10} y={-42} rot={10} s={1.1} />
      <PumpkinLeaf rot={-28} len={24} s={0.95} />
      <PumpkinLeaf rot={22} len={26} s={0.85} />
      {/* the little pumpkins sit in the soil at the front, heavy on their stalks */}
      <MiniPumpkin x={-16} y={-1} s={1.5} />
      <MiniPumpkin x={15} y={-1} s={1.2} />
    </g>
  );
}
