import { type ReactNode } from 'react';
import { Milton, PaniCma, PanJezyk, Stall } from '../scene/MarketArt';
import { VisitorArt, VISITOR_HEIGHT } from '../scene/VisitorArt';
import { Dogs } from '../scene/Dogs';
import { PlantArt } from '../plants/PlantArt';
import { VISITOR_IDS, type VisitorId } from '../garden/visitors';
import type { SpeciesId } from '../garden/species';
import type { ArtKey } from './types';

/**
 * The papers' pictures: the garden's own drawings, printed as if photographed for the paper (one
 * ink on cream, a little grain), plus a few townsfolk drawn just for the papers in the same hand.
 */

const INK = '#2d2228';
const ink = { stroke: INK, strokeWidth: 1.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const thin = { stroke: INK, strokeWidth: 1, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

/** A thin crescent rising over the hill, with a few stars. */
function MoonArt() {
  return (
    <g>
      <path d="M44,-118 C26,-112 20,-86 34,-72 C16,-74 8,-98 20,-112 C26,-118 36,-120 44,-118 Z" fill="#f6efd9" {...ink} />
      <path d="M-70,-110 l0,6 M-73,-107 l6,0 M-20,-128 l0,5 M-22.5,-125.5 l5,0 M80,-86 l0,5 M77.5,-83.5 l5,0 M-96,-70 l0,4 M-98,-68 l4,0" {...thin} />
      <path d="M-120,0 C-70,-30 -20,-38 30,-34 C70,-30 100,-20 120,-8 L120,4 L-120,4 Z" fill="#cfc6b0" {...ink} />
      <path d="M-100,-6 l10,-8 M-80,-10 l12,-10 M40,-12 l10,-9 M70,-8 l10,-8" {...thin} />
    </g>
  );
}

/** A snail with a tidy spiral shell. */
function SnailArt() {
  return (
    <g>
      <path d="M-40,0 C-44,-6 -38,-12 -28,-12 L24,-12 C34,-12 40,-18 40,-26 L44,-40 M40,-26 L34,-42" fill="none" {...ink} />
      <path d="M-40,0 C-40,-8 -32,-12 -24,-12 L26,-12 C34,-12 38,-6 36,0 Z" fill="#d9cdb4" {...ink} />
      <circle cx="44" cy="-41" r="2.4" fill={INK} />
      <circle cx="34" cy="-43" r="2.4" fill={INK} />
      <circle cx="-4" cy="-34" r="24" fill="#c8a882" {...ink} />
      <path d="M-4,-34 m0,-16 a16,16 0 1,1 -0.1,0 m0.1,6 a10,10 0 1,0 0.1,0 m-0.1,6 a4,4 0 1,1 -0.1,0" fill="none" {...thin} />
      <path d="M30,-20 C32,-18 33,-16 32,-14" fill="none" {...thin} />
    </g>
  );
}

/** A mole in his doorway, earth on his nose. */
function MoleArt() {
  return (
    <g>
      <path d="M-60,0 C-50,-20 50,-20 60,0 Z" fill="#8a6a4e" {...ink} />
      <path d="M-26,-6 C-30,-40 -16,-58 0,-58 C16,-58 30,-40 26,-6 Z" fill="#4a3b42" {...ink} />
      <path d="M-8,-44 C-6,-40 6,-40 8,-44 C6,-36 -6,-36 -8,-44 Z" fill="#e7a3b4" {...thin} />
      <circle cx="0" cy="-36" r="5" fill="#e7a3b4" {...thin} />
      <circle cx="-2" cy="-37" r="0.9" fill={INK} />
      <circle cx="2" cy="-37" r="0.9" fill={INK} />
      <path d="M-10,-46 l-2,-2 M10,-46 l2,-2" {...thin} />
      <path d="M-6,-30 l-12,2 M-6,-28 l-12,6 M6,-30 l12,2 M6,-28 l12,6" {...thin} />
      <path d="M-30,-10 C-38,-12 -44,-8 -42,-2 L-26,-2 Z M30,-10 C38,-12 44,-8 42,-2 L26,-2 Z" fill="#f0c9a8" {...ink} />
      <circle cx="3" cy="-41" r="2" fill="#8a6a4e" />
    </g>
  );
}

/** The owl, the town's night watchman. */
function OwlArt() {
  return (
    <g>
      <path d="M-40,0 L40,0" {...ink} />
      <path d="M-24,-2 C-34,-30 -28,-62 0,-66 C28,-62 34,-30 24,-2 Z" fill="#a98b6c" {...ink} />
      <path d="M-14,-6 C-18,-26 -14,-38 0,-40 C14,-38 18,-26 14,-6 Z" fill="#e6d7bd" {...thin} />
      <path d="M-8,-30 l3,3 l3,-3 M2,-30 l3,3 l3,-3 M-6,-20 l3,3 l3,-3 M4,-20 l3,3 l3,-3" fill="none" {...thin} />
      <circle cx="-10" cy="-52" r="9" fill="#f6efd9" {...ink} />
      <circle cx="10" cy="-52" r="9" fill="#f6efd9" {...ink} />
      <circle cx="-10" cy="-52" r="3.4" fill={INK} />
      <circle cx="10" cy="-52" r="3.4" fill={INK} />
      <path d="M-3,-46 L0,-40 L3,-46 Z" fill="#e2ad3f" {...thin} />
      <path d="M-22,-62 L-26,-72 L-14,-64 M22,-62 L26,-72 L14,-64" fill="#a98b6c" {...ink} />
      <path d="M-8,0 l-3,4 M-4,0 l0,4 M4,0 l0,4 M8,0 l3,4" {...thin} />
    </g>
  );
}

/** Halinka the squirrel, holding a nut, tail up. */
function SquirrelArt() {
  return (
    <g>
      <path d="M14,-8 C46,-10 56,-40 44,-62 C36,-76 18,-74 20,-58 C30,-60 34,-46 26,-34 C20,-24 12,-22 10,-14 Z" fill="#c07a46" {...ink} />
      <path d="M-18,-4 C-26,-24 -20,-44 -4,-48 C10,-50 16,-36 12,-18 C10,-8 0,-2 -18,-4 Z" fill="#d18c55" {...ink} />
      <path d="M-14,-44 C-20,-58 -12,-70 2,-68 C14,-66 16,-52 8,-44 Z" fill="#d18c55" {...ink} />
      <path d="M-10,-64 L-14,-76 L-4,-68 M4,-68 L6,-80 L10,-66" fill="#d18c55" {...ink} />
      <circle cx="-3" cy="-58" r="1.8" fill={INK} />
      <path d="M-12,-52 l-2,0" {...thin} />
      <ellipse cx="-12" cy="-30" rx="6" ry="7" fill="#8a5a32" {...thin} />
      <path d="M-14,-36 C-12,-40 -8,-38 -8,-35" fill="none" {...thin} />
      <path d="M-20,-2 L-8,-2 M2,-2 L12,-2" {...ink} />
    </g>
  );
}

/** A wasp: stripes, a sharp look. */
function WaspArt() {
  return (
    <g transform="translate(0 -40)">
      <path d="M-6,-10 C-20,-34 -40,-30 -32,-14 C-28,-8 -14,-8 -6,-8 Z M6,-10 C20,-34 40,-30 32,-14 C28,-8 14,-8 6,-8 Z" fill="#f3efe4" {...thin} />
      <ellipse cx="-22" cy="0" rx="12" ry="10" fill="#e2b13c" {...ink} />
      <path d="M-10,0 C-6,-4 -2,-4 2,0 C-2,4 -6,4 -10,0 Z" fill={INK} />
      <path d="M2,0 C2,-12 30,-12 34,0 C30,12 2,12 2,0 Z" fill="#e2b13c" {...ink} />
      <path d="M10,-8 L10,8 M18,-9 L18,9 M26,-7 L26,7" stroke={INK} strokeWidth="3.4" />
      <path d="M34,0 L40,0" {...ink} />
      <path d="M-28,-4 l4,-1 M-20,-4 l4,-1" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <path d="M-30,-8 C-34,-16 -38,-18 -42,-18 M-26,-9 C-28,-18 -30,-20 -34,-22" fill="none" {...thin} />
    </g>
  );
}

/** Ignacy the cricket, conductor. */
function CricketArt() {
  return (
    <g>
      <path d="M-40,0 L44,0" {...ink} />
      <path d="M-30,-16 C-30,-30 20,-34 34,-22 C40,-16 34,-8 20,-8 L-22,-8 C-28,-8 -30,-12 -30,-16 Z" fill="#7d8a52" {...ink} />
      <path d="M-26,-20 C-10,-30 14,-30 30,-22" fill="none" {...thin} />
      <circle cx="28" cy="-20" r="2" fill={INK} />
      <path d="M32,-24 C44,-44 54,-50 62,-52 M30,-26 C38,-46 44,-56 50,-60" fill="none" {...thin} />
      <path d="M-18,-10 L-30,-34 L-36,0 M-6,-8 L-8,0 M10,-8 L12,0" fill="none" {...ink} />
      <path d="M26,-12 L40,-40" stroke="#8a5a32" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

const PLANTS: readonly string[] = ['tulip', 'rose', 'pansy', 'daisy', 'lavender', 'pumpkin', 'snowdrop', 'moonflower'];

function artFor(key: ArtKey): { node: ReactNode; box: string } {
  const wrap = (node: ReactNode, half: number, height: number) => ({ node, box: `${-half} ${-height} ${half * 2} ${height + 6}` });
  switch (key) {
    case 'moon': return wrap(<MoonArt />, 124, 132);
    case 'snail': return wrap(<SnailArt />, 64, 66);
    case 'mole': return wrap(<MoleArt />, 70, 70);
    case 'owl': return wrap(<OwlArt />, 62, 80);
    case 'squirrel': return wrap(<SquirrelArt />, 66, 86);
    case 'wasp': return wrap(<WaspArt />, 60, 76);
    case 'cricket': return wrap(<CricketArt />, 72, 70);
    case 'jezyk': return wrap(<PanJezyk />, 70, 104);
    case 'jezyk-happy': return wrap(<PanJezyk mood="happy" />, 70, 104);
    case 'jezyk-asleep': return wrap(<PanJezyk mood="asleep" />, 70, 104);
    case 'cma': return wrap(<PaniCma />, 92, 114);
    case 'cma-happy': return wrap(<PaniCma mood="happy" />, 92, 114);
    case 'milton': return wrap(<g transform="scale(1.6)"><Milton /></g>, 58, 70);
    case 'stall': return wrap(<g transform="scale(0.5)"><Stall night={false} keeper={<PanJezyk />} /></g>, 80, 112);
    case 'night-stall': return wrap(<g transform="scale(0.5)"><Stall night keeper={<PaniCma />} /></g>, 80, 112);
    case 'dogs':
      return { node: <Dogs mood="day" />, box: '110 752 200 120' };
    default:
      break;
  }
  if ((VISITOR_IDS as readonly string[]).includes(key)) {
    const h = VISITOR_HEIGHT[key as VisitorId] + 16;
    return wrap(<VisitorArt id={key as VisitorId} mood="happy" />, Math.max(60, h * 0.75), h);
  }
  if (PLANTS.includes(key)) return wrap(<PlantArt species={key as SpeciesId} stage="bloom" />, 50, 104);
  return wrap(<MoonArt />, 124, 132);
}

/**
 * A picture for the paper, in a frame of the given shape. The drawing sits on the frame's floor,
 * centred, as big as fits; `tone` is the paper's printing: sepia for the Kurier, loud colour for Brzęczyk.
 */
export function PaperArt({ art, label, tone = 'sepia', wide = 2.1 }: { art: ArtKey; label: string; tone?: 'sepia' | 'black'; wide?: number }) {
  const { node, box } = artFor(art);
  const [x, y, w, h] = box.split(' ').map(Number) as [number, number, number, number];
  // widen the box to the frame's shape, keeping the drawing's feet on the floor
  const fw = Math.max(w, h * wide);
  const fh = fw / wide;
  const vb = `${(x + w / 2 - fw / 2).toFixed(1)} ${(y + h - fh).toFixed(1)} ${fw.toFixed(1)} ${fh.toFixed(1)}`;
  const id = `ht-${art}-${tone}`;
  return (
    <div className={`paper-art ${tone}`}>
    <svg viewBox={vb} role="img" aria-label={label} preserveAspectRatio="xMidYMax meet">
      <defs>
        <pattern id={id} width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx="1.6" cy="1.6" r="0.55" fill="#2d2228" />
        </pattern>
      </defs>
      <g pointerEvents="none">{node}</g>
      <rect x={vb.split(' ')[0]} y={vb.split(' ')[1]} width={fw} height={fh} fill={`url(#${id})`} opacity="0.12" pointerEvents="none" />
    </svg>
    </div>
  );
}

/** Every key the papers may print, for the test page. */
export const ALL_ART: ArtKey[] = [
  'moon', 'snail', 'mole', 'owl', 'squirrel', 'wasp', 'cricket', 'jezyk', 'jezyk-happy', 'jezyk-asleep', 'cma', 'cma-happy', 'stall', 'night-stall', 'milton', 'dogs',
  ...(VISITOR_IDS as readonly ArtKey[]),
  'tulip', 'rose', 'pansy', 'daisy', 'lavender', 'pumpkin', 'snowdrop', 'moonflower',
];
