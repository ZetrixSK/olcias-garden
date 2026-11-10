import { type ReactNode } from 'react';
import { Milton, PaniCma, PanJezyk, Stall } from '../scene/MarketArt';
import { VisitorArt, type VisitorMood } from '../scene/VisitorArt';
import { Dogs } from '../scene/Dogs';
import { PlantArt } from '../plants/PlantArt';
import { VISITOR_IDS, type VisitorId } from '../garden/visitors';
import type { SpeciesId } from '../garden/species';

/**
 * The papers' pictures. Each is a little scene, set up like a press photo: a place (the street,
 * the pond, the town hall...), the townsfolk in it, and the things the story is about. The
 * townsfolk are the garden's own drawings, held still; the rest is drawn here in the same hand.
 * Printed as the paper prints: sepia newsprint for the Kurier, loud colour for Brzęczyk.
 */

const INK = '#2d2228';
const ink = { stroke: INK, strokeWidth: 1.4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const thin = { stroke: INK, strokeWidth: 0.9, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

/** The frame: 240 wide, 114 tall; the ground runs at y = 100. */
export const FRAME_W = 240;
export const FRAME_H = 114;
const GROUND = 100;

export type SetKey = 'street' | 'pond' | 'pinkpond' | 'hall' | 'meadow' | 'night' | 'room' | 'snow' | 'fog' | 'attic' | 'willow' | 'hive' | 'kitchen' | 'hill' | 'orchard';

export type Actor =
  // the garden's own townsfolk
  | 'jezyk' | 'jezyk-happy' | 'jezyk-asleep' | 'cma' | 'cma-happy' | 'milton' | 'dogs' | 'stall' | 'night-stall'
  | VisitorId | `${VisitorId}:${VisitorMood}`
  | `plant:${SpeciesId}`
  // drawn for the papers
  | 'borsuk' | 'trzmielina' | 'snail' | 'beetle' | 'mole' | 'owl' | 'owl-hat' | 'squirrel' | 'wasp' | 'cricket' | 'crow' | 'ants' | 'firefly' | 'ladybird'
  // things
  | 'stone' | 'stone-mayor' | 'clocktower' | 'nest' | 'lamppost' | 'lamppost-jumper' | 'scales' | 'bridge' | 'lettuce' | 'candles' | 'lantern' | 'hat' | 'broom'
  | 'books' | 'flag' | 'socks' | 'letter' | 'leaf' | 'cake' | 'flute' | 'map' | 'newspaper' | 'typewriter' | 'honey' | 'barrel' | 'diploma' | 'cauldron'
  | 'kettle' | 'bench' | 'sunflower' | 'nuts' | 'camera' | 'pumpkin' | 'sled' | 'notes' | 'desk' | 'moon' | 'cloud' | 'stars' | 'hole' | 'ribbon' | 'seeds';

/** One thing in a scene: who or what, where along the ground (0 to 240), how high above it, how big, and facing which way. */
export type Part = { a: Actor; x: number; y?: number; s?: number; flip?: boolean };

/** A picture: a place, and what's in it. */
export type Shot = { set?: SetKey; cast: Part[] };

// ---- townsfolk drawn for the papers ----------------------------------------------------------

/** Redaktor Bogdan Borsuk, who came from the big city and started the Kurier: glasses, a bow tie, a paper under his arm. */
function Borsuk() {
  return (
    <g>
      <ellipse cx="0" cy="0" rx="20" ry="3" fill="#000" opacity="0.12" />
      <path d="M-18,-2 C-22,-22 -18,-40 0,-42 C18,-40 22,-22 18,-2 Z" fill="#8d8792" {...ink} />
      <path d="M-10,-4 L-10,-26 L10,-26 L10,-4 Z" fill="#5a4f63" {...thin} />
      <path d="M-4,-26 L0,-20 L4,-26" fill="#f4ecdc" {...thin} />
      <path d="M-5,-27 L0,-24 L5,-27 L5,-22 L0,-24.6 L-5,-22 Z" fill="#9c3d5a" {...thin} />
      <path d="M-14,-6 L-14,0 M-6,-4 L-6,0 M6,-4 L6,0 M14,-6 L14,0" {...ink} />
      <path d="M-22,-62 C-26,-48 -18,-36 0,-36 C18,-36 26,-48 22,-62 C18,-74 -18,-74 -22,-62 Z" fill="#f2ede6" {...ink} />
      <path d="M-14,-72 C-12,-60 -9,-50 -6,-42 L-2,-42 C-4,-52 -7,-62 -8,-73 Z M14,-72 C12,-60 9,-50 6,-42 L2,-42 C4,-52 7,-62 8,-73 Z" fill="#2d2228" />
      <path d="M-20,-66 C-26,-74 -22,-80 -16,-76 M20,-66 C26,-74 22,-80 16,-76" fill="#8d8792" {...thin} />
      <circle cx="-8" cy="-56" r="5" fill="#fffaf0" {...thin} />
      <circle cx="8" cy="-56" r="5" fill="#fffaf0" {...thin} />
      <path d="M-3,-56 L3,-56" {...thin} />
      <circle cx="-8" cy="-56" r="1.6" fill={INK} />
      <circle cx="8" cy="-56" r="1.6" fill={INK} />
      <ellipse cx="0" cy="-46" rx="3.2" ry="2.4" fill={INK} />
      <path d="M-3,-41 C-1,-40 1,-40 3,-41" fill="none" {...thin} />
      {/* the paper under his arm */}
      <g transform="translate(14 -20) rotate(-14)">
        <path d="M-3,-10 L12,-10 L12,8 L-3,8 Z" fill="#f4ecdc" {...thin} />
        <path d="M0,-6 L9,-6 M0,-3 L9,-3 M0,0 L6,0 M0,3 L8,3" stroke={INK} strokeWidth="0.6" />
      </g>
      <path d="M10,-30 C16,-26 18,-20 16,-14" fill="none" {...ink} />
    </g>
  );
}

/** Trzmielina, editor of Brzęczyk: a stout bumblebee with a press card in her hat and a notebook. */
function Trzmielina() {
  return (
    <g transform="translate(0 -22)">
      <path d="M-6,-12 C-22,-34 -40,-26 -30,-12 C-26,-6 -14,-6 -6,-8 Z M6,-12 C22,-34 40,-26 30,-12 C26,-6 14,-6 6,-8 Z" fill="#f6f3ec" {...thin} />
      <ellipse cx="0" cy="2" rx="18" ry="15" fill="#e2ad3f" {...ink} />
      <path d="M-14,-6 C-6,-10 6,-10 14,-6 M-17,4 C-6,0 6,0 17,4 M-14,13 C-6,10 6,10 14,13" fill="none" stroke={INK} strokeWidth="3.6" />
      <circle cx="-6" cy="-4" r="2" fill={INK} />
      <circle cx="6" cy="-4" r="2" fill={INK} />
      <path d="M-3,2 C-1,4 1,4 3,2" fill="none" {...thin} />
      <path d="M-12,-14 L12,-14 L10,-22 L-10,-22 Z M-16,-14 L16,-14" fill="#3b2a33" {...thin} />
      <path d="M4,-21 L10,-21 L10,-17 L4,-17 Z" fill="#fffaf0" {...thin} />
      <path d="M-6,-22 C-8,-28 -10,-30 -13,-30 M6,-22 C8,-28 10,-30 13,-30" fill="none" {...thin} />
      <g transform="translate(16 6) rotate(10)">
        <path d="M0,-6 L10,-6 L10,8 L0,8 Z" fill="#fffaf0" {...thin} />
        <path d="M2,-2 L8,-2 M2,1 L8,1 M2,4 L6,4" stroke={INK} strokeWidth="0.6" />
      </g>
    </g>
  );
}

function Snail() {
  return (
    <g transform="scale(0.55)">
      <path d="M-40,0 C-40,-8 -32,-12 -24,-12 L26,-12 C34,-12 38,-6 36,0 Z" fill="#e6d6b8" {...ink} />
      <path d="M30,-12 L36,-38 M34,-12 L44,-36" fill="none" {...ink} />
      <circle cx="36" cy="-40" r="2.6" fill={INK} />
      <circle cx="45" cy="-38" r="2.6" fill={INK} />
      <circle cx="-4" cy="-32" r="22" fill="#c8a07a" {...ink} />
      <path d="M-4,-32 m-15,0 a15,15 0 1,1 30,0 a11,11 0 1,1 -22,0 a7,7 0 1,1 14,0 a3,3 0 1,1 -6,0" fill="none" {...thin} />
    </g>
  );
}

function Beetle() {
  return (
    <g transform="scale(0.6)">
      <path d="M-30,-4 L-36,4 M-12,-2 L-14,6 M12,-2 L14,6 M30,-4 L36,4" {...ink} />
      <path d="M-34,-10 C-34,-34 30,-38 36,-12 C38,-2 -32,0 -34,-10 Z" fill="#3e4a3a" {...ink} />
      <path d="M2,-36 L0,-4" {...thin} />
      <path d="M36,-14 C44,-16 48,-12 46,-6 C42,-2 38,-6 36,-10 Z" fill="#3e4a3a" {...ink} />
      <circle cx="42" cy="-11" r="1.4" fill="#fffaf0" />
      <path d="M-24,-26 C-14,-32 -4,-32 -2,-30" fill="none" stroke="#7f9070" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

function Mole() {
  return (
    <g transform="scale(0.62)">
      <path d="M-50,0 C-42,-14 42,-14 50,0 Z" fill="#8a6a4e" {...ink} />
      <path d="M-24,-6 C-28,-38 -14,-54 0,-54 C14,-54 28,-38 24,-6 Z" fill="#4a3b42" {...ink} />
      <circle cx="0" cy="-34" r="5" fill="#e7a3b4" {...thin} />
      <circle cx="3" cy="-39" r="2" fill="#8a6a4e" />
      <path d="M-6,-28 l-12,2 M-6,-26 l-12,6 M6,-28 l12,2 M6,-26 l12,6" {...thin} />
      <path d="M-9,-42 l-2,-2 M9,-42 l2,-2" {...thin} />
      <path d="M-28,-8 C-36,-10 -42,-6 -40,0 L-24,0 Z M28,-8 C36,-10 42,-6 40,0 L24,0 Z" fill="#f0c9a8" {...ink} />
    </g>
  );
}

function Owl({ hat = false }: { hat?: boolean }) {
  return (
    <g transform="scale(0.62)">
      <path d="M-24,-2 C-34,-30 -28,-62 0,-66 C28,-62 34,-30 24,-2 Z" fill="#a98b6c" {...ink} />
      <path d="M-14,-6 C-18,-26 -14,-38 0,-40 C14,-38 18,-26 14,-6 Z" fill="#e6d7bd" {...thin} />
      <path d="M-8,-30 l3,3 l3,-3 M2,-30 l3,3 l3,-3 M-6,-20 l3,3 l3,-3 M4,-20 l3,3 l3,-3" fill="none" {...thin} />
      <circle cx="-10" cy="-52" r="9" fill="#f6efd9" {...ink} />
      <circle cx="10" cy="-52" r="9" fill="#f6efd9" {...ink} />
      <circle cx="-10" cy="-52" r="3.4" fill={INK} />
      <circle cx="10" cy="-52" r="3.4" fill={INK} />
      <path d="M-3,-46 L0,-40 L3,-46 Z" fill="#e2ad3f" {...thin} />
      {hat ? (
        <g>
          <path d="M-22,-62 C-20,-80 20,-80 22,-62 Z" fill="#e58aa6" {...ink} />
          <path d="M-22,-64 L22,-64" stroke="#fffaf0" strokeWidth="3" />
          <circle cx="0" cy="-80" r="5" fill="#fffaf0" {...thin} />
        </g>
      ) : (
        <path d="M-22,-62 L-26,-72 L-14,-64 M22,-62 L26,-72 L14,-64" fill="#a98b6c" {...ink} />
      )}
    </g>
  );
}

function Squirrel() {
  return (
    <g transform="scale(0.6)">
      <path d="M14,-8 C46,-10 56,-40 44,-62 C36,-76 18,-74 20,-58 C30,-60 34,-46 26,-34 C20,-24 12,-22 10,-14 Z" fill="#c07a46" {...ink} />
      <path d="M-18,-4 C-26,-24 -20,-44 -4,-48 C10,-50 16,-36 12,-18 C10,-8 0,-2 -18,-4 Z" fill="#d18c55" {...ink} />
      <path d="M-14,-44 C-20,-58 -12,-70 2,-68 C14,-66 16,-52 8,-44 Z" fill="#d18c55" {...ink} />
      <path d="M-10,-64 L-14,-76 L-4,-68 M4,-68 L6,-80 L10,-66" fill="#d18c55" {...ink} />
      <circle cx="-3" cy="-58" r="1.8" fill={INK} />
      <ellipse cx="-12" cy="-30" rx="6" ry="7" fill="#8a5a32" {...thin} />
    </g>
  );
}

function Wasp() {
  return (
    <g transform="translate(0 -30) scale(0.6)">
      <path d="M-6,-10 C-20,-34 -40,-30 -32,-14 C-28,-8 -14,-8 -6,-8 Z M6,-10 C20,-34 40,-30 32,-14 C28,-8 14,-8 6,-8 Z" fill="#f3efe4" {...thin} />
      <ellipse cx="-22" cy="0" rx="12" ry="10" fill="#e2b13c" {...ink} />
      <path d="M2,0 C2,-12 30,-12 34,0 C30,12 2,12 2,0 Z" fill="#e2b13c" {...ink} />
      <path d="M10,-8 L10,8 M18,-9 L18,9 M26,-7 L26,7" stroke={INK} strokeWidth="3.4" />
      <path d="M-10,0 C-6,-4 -2,-4 2,0 C-2,4 -6,4 -10,0 Z" fill={INK} />
      <path d="M-28,-4 l4,-1 M-20,-4 l4,-1" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <path d="M34,0 L40,0" {...ink} />
    </g>
  );
}

function Cricket() {
  return (
    <g transform="scale(0.6)">
      <path d="M-30,-16 C-30,-30 20,-34 34,-22 C40,-16 34,-8 20,-8 L-22,-8 C-28,-8 -30,-12 -30,-16 Z" fill="#7d8a52" {...ink} />
      <circle cx="28" cy="-20" r="2" fill={INK} />
      <path d="M32,-24 C44,-44 54,-50 62,-52 M30,-26 C38,-46 44,-56 50,-60" fill="none" {...thin} />
      <path d="M-18,-10 L-30,-34 L-36,0 M-6,-8 L-8,0 M10,-8 L12,0" fill="none" {...ink} />
      <path d="M26,-12 L40,-40" stroke="#8a5a32" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Crow() {
  return (
    <g transform="scale(0.6)">
      <path d="M-30,-20 C-20,-40 10,-44 22,-34 L40,-30 L24,-24 C20,-10 -4,-4 -20,-10 L-40,-6 Z" fill="#2f2a33" {...ink} />
      <circle cx="16" cy="-34" r="2" fill="#fffaf0" />
      <path d="M-4,-8 L-6,0 M4,-8 L4,0" {...ink} />
    </g>
  );
}

function Ants() {
  const one = (x: number, k: number) => (
    <g key={k} transform={`translate(${x} 0)`}>
      <ellipse cx="-4" cy="-3" rx="3" ry="2.4" fill="#5a3a2a" {...thin} />
      <circle cx="1" cy="-3.4" r="1.8" fill="#5a3a2a" {...thin} />
      <circle cx="5" cy="-4" r="2" fill="#5a3a2a" {...thin} />
      <path d="M-4,-1 l-2,2 M0,-1.6 l0,2 M3,-2 l2,2" {...thin} />
      <path d="M-6,-8 L8,-11" stroke="#c9a070" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
  return <g>{[-20, -6, 8, 22].map(one)}</g>;
}

function Firefly() {
  return (
    <g transform="translate(0 -30)">
      <circle r="9" fill="#fff3b0" opacity="0.6" />
      <ellipse cx="0" cy="0" rx="4" ry="3" fill="#f6d55c" {...thin} />
      <circle cx="-4" cy="-1" r="1.8" fill={INK} />
      <path d="M-1,-2 C-4,-8 2,-8 1,-2" fill="#fffaf0" {...thin} />
    </g>
  );
}

function Ladybird() {
  return (
    <g>
      <path d="M-6,0 C-6,-8 6,-8 6,0 Z" fill="#c9433f" {...thin} />
      <path d="M0,-6 L0,0" {...thin} />
      <circle cx="-3" cy="-3" r="0.9" fill={INK} />
      <circle cx="3" cy="-2.6" r="0.9" fill={INK} />
      <path d="M6,-2 C8,-3 9,-2 8,0 L6,0 Z" fill={INK} />
    </g>
  );
}

// ---- things --------------------------------------------------------------------------------

function Stone({ mayor }: { mayor: boolean }) {
  return (
    <g>
      <path d="M-18,0 C-22,-8 -16,-20 -2,-21 C12,-22 22,-12 19,0 Z" fill="#b5ada4" {...ink} />
      <path d="M-10,-14 C-6,-17 0,-17 4,-16 M8,-8 C10,-10 12,-10 13,-8" fill="none" {...thin} />
      {mayor && (
        <g>
          <path d="M-16,-6 L12,-20 L16,-14 L-12,0 Z" fill="#b8302a" {...thin} />
          <path d="M-12,-25 L-8,-21 L-4,-27 L0,-21 L4,-25 L3,-19 L-11,-19 Z" fill="#e2ad3f" {...thin} />
        </g>
      )}
    </g>
  );
}

function ClockTower() {
  return (
    <g>
      <path d="M-20,0 L-20,-70 L20,-70 L20,0 Z" fill="#e6dccb" {...ink} />
      <path d="M-24,-70 L0,-92 L24,-70 Z" fill="#9c6a5a" {...ink} />
      <circle cx="0" cy="-52" r="12" fill="#fffaf0" {...ink} />
      <path d="M0,-52 L0,-61 M0,-52 L4,-48" {...ink} />
      <path d="M-8,0 L-8,-18 C-8,-24 8,-24 8,-18 L8,0" fill="#7a5a48" {...thin} />
      <path d="M-14,-30 L-6,-30 M6,-30 L14,-30" {...thin} />
      {/* the nest, in the works */}
      <path d="M-16,-73 C-12,-79 -4,-79 0,-74" fill="none" stroke="#8a6a3e" strokeWidth="2.6" strokeLinecap="round" />
    </g>
  );
}

function Nest() {
  return (
    <g>
      <path d="M-14,0 C-16,-8 16,-8 14,0 C10,4 -10,4 -14,0 Z" fill="#a57c4e" {...ink} />
      <path d="M-12,-3 L12,-1 M-10,0 L10,-4 M-8,2 L8,2" stroke="#6e4f30" strokeWidth="0.8" />
    </g>
  );
}

function Lamppost({ jumper }: { jumper: boolean }) {
  return (
    <g>
      <path d="M-6,0 L6,0 L4,-6 L-4,-6 Z" fill="#3b3a40" {...thin} />
      <path d="M-2,-6 L-2,-74 L2,-74 L2,-6 Z" fill="#3b3a40" {...thin} />
      <path d="M-8,-74 L8,-74 L6,-86 L-6,-86 Z" fill="#fff3c4" {...ink} />
      <path d="M-9,-86 L9,-86 L0,-92 Z" fill="#3b3a40" {...thin} />
      {jumper && (
        <g>
          <path d="M-6,-14 L6,-14 L6,-66 L-6,-66 Z" fill="#e58aa6" {...thin} />
          {[-60, -50, -40, -30, -20].map((y) => (
            <path key={y} d={`M-6,${y} L6,${y}`} stroke="#2b2229" strokeWidth="2.4" />
          ))}
          <path d="M-7,-66 L7,-66 L7,-72 L-7,-72 Z" fill="#e58aa6" {...thin} />
        </g>
      )}
    </g>
  );
}

function Scales() {
  return (
    <g>
      <path d="M-4,0 L4,0 L2,-30 L-2,-30 Z" fill="#8a6a4e" {...thin} />
      <path d="M-34,-24 L34,-34" {...ink} />
      <path d="M-34,-24 L-40,-14 L-28,-14 Z M34,-34 L28,-24 L40,-24 Z" fill="none" {...thin} />
      <path d="M-46,-14 C-46,-8 -22,-8 -22,-14 Z M22,-24 C22,-18 46,-18 46,-24 Z" fill="#d9c9a6" {...ink} />
    </g>
  );
}

function Bridge() {
  return (
    <g>
      <path d="M-60,0 C-30,-26 30,-26 60,0" fill="none" stroke="#8a5a32" strokeWidth="5" />
      <path d="M-60,0 C-30,-26 30,-26 60,0" fill="none" {...thin} />
      {[-48, -32, -16, 0, 16, 32, 48].map((x) => (
        <path key={x} d={`M${x},${-Math.round(26 * (1 - (x / 60) ** 2)) + 2} l0,-12`} {...thin} />
      ))}
      <path d="M-56,-10 C-30,-34 30,-34 56,-10" fill="none" {...thin} />
    </g>
  );
}

function Candles() {
  return (
    <g>
      {[-14, -6, 2, 10, 18].map((x, i) => {
        const h = 10 + (i % 3) * 4;
        return (
          <g key={x} transform={`translate(${x} 0)`}>
            <path d={`M-2.4,0 L-2.4,${-h} L2.4,${-h} L2.4,0 Z`} fill="#fbf4e8" {...thin} />
            <path d={`M0,${-h - 1} C-2.6,${-h - 4} -1,${-h - 8} 0,${-h - 9} C1,${-h - 8} 2.6,${-h - 4} 0,${-h - 1} Z`} fill="#f6c25a" {...thin} />
          </g>
        );
      })}
    </g>
  );
}

function Lantern() {
  return (
    <g>
      <circle cx="0" cy="-14" r="14" fill="#fff3c4" opacity="0.5" />
      <path d="M-6,0 L6,0 L6,-20 L-6,-20 Z" fill="#fff3c4" {...ink} />
      <path d="M-8,-20 L8,-20 L0,-27 Z" fill="#3b3a40" {...thin} />
      <path d="M0,-27 L0,-31" {...thin} />
      <path d="M0,-5 C-2,-8 -2,-11 0,-13 C2,-11 2,-8 0,-5 Z" fill="#f6c25a" />
    </g>
  );
}

const WitchHat = () => <path d="M-16,0 C-8,-2 8,-2 16,0 C10,2 -10,2 -16,0 Z M-8,-1 C-4,-14 0,-26 6,-32 C4,-22 4,-10 8,-1 Z" fill="#2b2229" {...ink} />;

const Broom = () => (
  <g>
    <path d="M-30,-4 L18,-22" stroke="#8a5a32" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M18,-22 L34,-34 L38,-20 L24,-14 Z" fill="#d9b56a" {...thin} />
  </g>
);

const Books = () => (
  <g>
    <path d="M-14,0 L14,0 L14,-6 L-14,-6 Z" fill="#9c3d5a" {...thin} />
    <path d="M-12,-6 L12,-6 L12,-12 L-12,-12 Z" fill="#6b7c5a" {...thin} />
    <path d="M-13,-12 L11,-12 L11,-18 L-13,-18 Z" fill="#c9a45c" {...thin} />
  </g>
);

const Flag = () => (
  <g>
    <path d="M0,0 L0,-44" {...ink} />
    <path d="M0,-44 C8,-46 14,-42 22,-44 L22,-34 C14,-32 8,-36 0,-34 Z" fill="#fffaf0" {...thin} />
    <path d="M0,-34 C8,-36 14,-32 22,-34 L22,-24 C14,-22 8,-26 0,-24 Z" fill="#c9433f" {...thin} />
  </g>
);

const Socks = () => (
  <g>
    <path d="M-14,0 L-14,-12 L-8,-12 L-8,-4 L-2,-4 L-2,0 Z" fill="#e58aa6" {...thin} />
    <path d="M0,0 L2,-12 L8,-11 L7,-4 L14,-3 L13,1 Z" fill="#b9a3e3" {...thin} />
    <path d="M-8,-1 L-6,-9 L0,-8 L-2,-2 L4,-1 Z" fill="#f2d16b" {...thin} />
  </g>
);

const Letter = () => (
  <g>
    <path d="M-10,0 L10,0 L10,-13 L-10,-13 Z" fill="#fffaf0" {...thin} />
    <path d="M-10,-13 L0,-5 L10,-13" fill="none" {...thin} />
    <path d="M2,-3 C0,-5 -2,-4 0,-1 C2,-4 4,-5 2,-3 Z" fill="#c95d7f" />
  </g>
);

const Leaf = () => (
  <g>
    <path d="M0,0 L0,-30" stroke="#5d7a4a" strokeWidth="1.6" />
    <path d="M-22,-28 C-18,-42 18,-42 22,-28 C12,-32 -12,-32 -22,-28 Z" fill="#7fa36a" {...ink} />
  </g>
);

const Cake = () => (
  <g>
    <path d="M-14,0 L14,0 L14,-9 L-14,-9 Z" fill="#f6e2c6" {...ink} />
    <path d="M-15,-9 C-15,-13 15,-13 15,-9 Z" fill="#fff6e6" {...thin} />
    <path d="M-18,1 C-10,4 10,4 18,1" fill="none" {...thin} />
  </g>
);

const Flute = () => <path d="M-16,-10 L16,-22" stroke="#c9a45c" strokeWidth="2.6" strokeLinecap="round" />;

const MapPaper = () => (
  <g>
    <path d="M-14,0 L-4,-3 L4,0 L14,-3 L14,-20 L4,-17 L-4,-20 L-14,-17 Z" fill="#efe1c0" {...thin} />
    <path d="M-10,-12 C-4,-8 2,-14 8,-8" fill="none" stroke="#9c3d5a" strokeWidth="0.8" strokeDasharray="2 1.4" />
    <path d="M6,-10 l3,3 m0,-3 l-3,3" stroke="#9c3d5a" strokeWidth="0.9" />
  </g>
);

const Newspaper = () => (
  <g>
    <path d="M-12,0 L12,-2 L13,-16 L-11,-14 Z" fill="#f4ecdc" {...thin} />
    <path d="M-8,-11 L6,-12 M-8,-8 L9,-9.4 M-8,-5 L9,-6.4" stroke={INK} strokeWidth="0.6" />
  </g>
);

const Typewriter = () => (
  <g>
    <path d="M-18,0 L18,0 L14,-12 L-14,-12 Z" fill="#3b3a40" {...ink} />
    <path d="M-12,-12 L-12,-22 L12,-22 L12,-12" fill="#fffaf0" {...thin} />
    <path d="M-8,-18 L8,-18 M-8,-15 L4,-15" stroke={INK} strokeWidth="0.6" />
    <path d="M-12,-5 L12,-5" stroke="#fffaf0" strokeWidth="1" strokeDasharray="1.6 1.6" />
  </g>
);

const Honey = () => (
  <g>
    <path d="M-8,0 C-10,-6 -10,-12 -8,-14 L8,-14 C10,-12 10,-6 8,0 Z" fill="#e2ad3f" {...ink} />
    <path d="M-9,-14 L9,-14 L9,-18 L-9,-18 Z" fill="#c95d7f" {...thin} />
  </g>
);

const Barrel = () => (
  <g>
    <path d="M-10,0 C-13,-8 -13,-18 -10,-26 L10,-26 C13,-18 13,-8 10,0 Z" fill="#c08a4e" {...ink} />
    <path d="M-12,-7 L12,-7 M-12,-19 L12,-19" stroke={INK} strokeWidth="1.2" />
  </g>
);

const Diploma = () => (
  <g>
    <path d="M-16,0 L16,0 L16,-22 L-16,-22 Z" fill="#c9a45c" {...ink} />
    <path d="M-12,-4 L12,-4 L12,-18 L-12,-18 Z" fill="#fffaf0" {...thin} />
    <path d="M-8,-14 L8,-14 M-6,-10 L6,-10" stroke={INK} strokeWidth="0.7" />
    <circle cx="6" cy="-6" r="2" fill="#c9433f" />
  </g>
);

const Cauldron = () => (
  <g>
    <path d="M-14,-16 C-18,-4 -10,2 0,2 C10,2 18,-4 14,-16 Z" fill="#2b2229" {...ink} />
    <ellipse cx="0" cy="-16" rx="14" ry="3" fill="#f3a6bf" {...thin} />
    <circle cx="-4" cy="-22" r="2.4" fill="#f3a6bf" {...thin} />
    <circle cx="4" cy="-26" r="1.6" fill="#f3a6bf" {...thin} />
  </g>
);

const Kettle = () => (
  <g>
    <path d="M-10,0 C-14,-8 -10,-16 0,-16 C10,-16 14,-8 10,0 Z" fill="#b5ada4" {...ink} />
    <path d="M10,-8 L18,-14" {...ink} />
    <path d="M-6,-16 C-6,-22 6,-22 6,-16" fill="none" {...thin} />
  </g>
);

const Bench = () => (
  <g>
    <path d="M-26,-12 L26,-12 L26,-16 L-26,-16 Z M-26,-24 L26,-24 L26,-28 L-26,-28 Z" fill="#8a5a32" {...thin} />
    <path d="M-22,0 L-22,-28 M22,0 L22,-28" {...ink} />
  </g>
);

const Sunflower = () => (
  <g transform="rotate(-8)">
    <path d="M0,0 L0,-64" stroke="#5d7a4a" strokeWidth="2.2" />
    <path d="M0,-30 C-10,-34 -14,-28 -14,-24 C-8,-24 -2,-26 0,-30 Z" fill="#7fa36a" {...thin} />
    <g transform="translate(0 -70)">
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse key={i} cx="0" cy="-11" rx="3.4" ry="7" fill="#f2c94c" {...thin} transform={`rotate(${i * 30})`} />
      ))}
      <circle r="7" fill="#7a4a2a" {...thin} />
    </g>
  </g>
);

const Nuts = () => (
  <g>
    {[-10, -2, 6, 13].map((x, i) => (
      <path key={x} transform={`translate(${x} ${i % 2 ? -1 : 0})`} d="M-3,0 C-5,-4 -3,-7 0,-7 C3,-7 5,-4 3,0 Z" fill="#a57c4e" {...thin} />
    ))}
  </g>
);

const Camera = () => (
  <g>
    <path d="M-10,0 L10,0 L10,-12 L-10,-12 Z" fill="#2b2229" {...thin} />
    <circle cx="0" cy="-6" r="4" fill="#9aa3b5" {...thin} />
    <path d="M-6,-12 L-4,-15 L2,-15 L4,-12" fill="#2b2229" {...thin} />
    <path d="M12,-14 l4,-4 M13,-8 l6,0 M12,-2 l4,4" stroke="#f2d16b" strokeWidth="1.4" strokeLinecap="round" />
  </g>
);

const BigPumpkin = () => (
  <g>
    <path d="M-34,-2 C-44,-18 -34,-40 -12,-40 C0,-44 12,-44 22,-40 C42,-38 46,-14 34,-2 C20,4 -20,4 -34,-2 Z" fill="#e08a3c" {...ink} />
    <path d="M-12,-40 C-18,-26 -18,-10 -12,0 M10,-42 C16,-28 16,-12 10,0" fill="none" {...thin} />
    {/* her knitted hat for cold nights */}
    <path d="M-12,-40 C-10,-56 12,-56 14,-40 Z" fill="#e58aa6" {...ink} />
    <circle cx="1" cy="-57" r="4" fill="#fffaf0" {...thin} />
  </g>
);

const Sled = () => (
  <g>
    <path d="M-24,-8 L20,-8 L20,-12 L-24,-12 Z" fill="#b8433f" {...thin} />
    <path d="M-20,-8 L-20,0 M16,-8 L16,0 M-28,0 C-30,-4 -28,-6 -26,-6 M-28,0 L24,0 C28,0 30,-4 28,-6" fill="none" {...ink} />
  </g>
);

const Notes = () => (
  <g fill={INK}>
    <path d="M0,-10 L0,-24 L8,-26 L8,-12" fill="none" {...thin} />
    <ellipse cx="-2" cy="-10" rx="2.6" ry="2" />
    <ellipse cx="6" cy="-12" rx="2.6" ry="2" />
    <path d="M16,-16 L16,-28" fill="none" {...thin} />
    <ellipse cx="14" cy="-16" rx="2.6" ry="2" />
  </g>
);

const Desk = () => (
  <g>
    <path d="M-30,-22 L30,-22 L30,-26 L-30,-26 Z" fill="#8a5a32" {...ink} />
    <path d="M-26,-22 L-26,0 M26,-22 L26,0" {...ink} />
  </g>
);

const MoonArt = () => <path d="M10,-20 C-2,-16 -6,0 4,10 C-10,8 -16,-8 -8,-18 C-4,-22 4,-23 10,-20 Z" fill="#f6efd9" {...ink} />;

const Cloud = () => <path d="M-26,0 C-34,0 -34,-12 -24,-12 C-24,-22 -8,-24 -4,-16 C0,-24 16,-22 16,-12 C26,-12 26,0 18,0 Z" fill="#f4f1ea" {...ink} />;

const Stars = () => <path d="M-30,-6 l0,5 M-32.5,-3.5 l5,0 M0,-14 l0,4 M-2,-12 l4,0 M28,-4 l0,5 M25.5,-1.5 l5,0" {...thin} />;

const Hole = () => <ellipse cx="0" cy="0" rx="18" ry="4" fill="#3a2a22" {...thin} />;

const Ribbon = () => (
  <g>
    <path d="M-40,-20 L40,-20" stroke="#c9433f" strokeWidth="2.4" />
    <path d="M-40,-30 L-40,0 M40,-30 L40,0" {...ink} />
  </g>
);

const Seeds = () => (
  <g>
    <path d="M-8,0 L8,0 L8,-18 L-8,-18 Z" fill="#f2a6bb" {...thin} />
    <path d="M-8,-18 L-6,-22 L6,-22 L8,-18" fill="#e58aa6" {...thin} />
    <circle cx="0" cy="-9" r="3.4" fill="#fffaf0" {...thin} />
  </g>
);

// ---- places ----------------------------------------------------------------------------------

function SetBack({ set }: { set: SetKey }) {
  switch (set) {
    case 'street':
      return (
        <g>
          <path d="M8,100 L8,58 L28,44 L48,58 L48,100 M60,100 L60,50 L84,34 L108,50 L108,100 M196,100 L196,54 L214,42 L232,54 L232,100" fill="#efe6d4" {...thin} />
          <path d="M20,70 L36,70 L36,82 L20,82 Z M74,62 L92,62 L92,76 L74,76 Z M206,66 L222,66 L222,78 L206,78 Z" fill="#fffaf0" {...thin} />
          <path d="M0,100 L240,100" {...ink} />
          <path d="M14,106 l10,0 M44,108 l12,0 M90,106 l10,0 M150,108 l12,0 M196,106 l10,0" {...thin} />
        </g>
      );
    case 'pond':
    case 'pinkpond':
      return (
        <g>
          <path d="M0,86 C40,80 80,78 120,78 C160,78 200,80 240,86" fill="none" {...thin} />
          <ellipse cx="120" cy="100" rx="110" ry="14" fill={set === 'pinkpond' ? '#f3a6bf' : '#b9cfd9'} {...ink} />
          <path d="M60,98 l18,0 M120,104 l22,0 M170,97 l16,0" stroke="#fffaf0" strokeWidth="1.2" />
          <path d="M14,100 C12,90 14,82 16,76 M20,100 C20,92 22,86 24,82 M226,100 C226,90 224,84 222,78" fill="none" stroke="#5d7a4a" strokeWidth="1.4" />
        </g>
      );
    case 'hall':
      return (
        <g>
          <path d="M140,100 L140,40 L240,40 L240,100" fill="#e6dccb" {...thin} />
          <path d="M134,40 L190,16 L246,40 Z" fill="#9c6a5a" {...thin} />
          <path d="M156,100 L156,48 M176,100 L176,48 M204,100 L204,48 M224,100 L224,48" {...thin} />
          <path d="M0,100 L240,100" {...ink} />
        </g>
      );
    case 'meadow':
      return (
        <g>
          <path d="M0,74 C50,62 110,60 160,66 C200,70 220,72 240,70" fill="none" {...thin} />
          <path d="M0,100 L240,100" {...ink} />
          <path d="M20,100 l2,-6 l2,6 M64,100 l2,-7 l2,7 M140,100 l2,-6 l2,6 M200,100 l2,-7 l2,7 M226,100 l2,-5 l2,5" fill="none" stroke="#5d7a4a" strokeWidth="1.2" />
        </g>
      );
    case 'night':
      return (
        <g>
          <rect x="0" y="0" width="240" height="114" fill="#3a3550" />
          <path d="M30,20 l0,4 M28,22 l4,0 M90,12 l0,4 M88,14 l4,0 M200,24 l0,4 M198,26 l4,0 M160,8 l0,3 M158.5,9.5 l3,0" stroke="#fff6dc" strokeWidth="1" />
          <path d="M0,100 L240,100" stroke="#fff6dc" strokeWidth="1.2" opacity="0.6" />
        </g>
      );
    case 'room':
      return (
        <g>
          <path d="M0,84 L240,84" {...thin} />
          <path d="M0,100 L240,100" {...ink} />
          <path d="M30,84 L20,114 M90,84 L84,114 M150,84 L156,114 M210,84 L220,114" stroke={INK} strokeWidth="0.6" opacity="0.5" />
          <path d="M170,20 L220,20 L220,64 L170,64 Z M195,20 L195,64 M170,42 L220,42" fill="#dfe8ee" {...thin} />
        </g>
      );
    case 'snow':
      return <path d="M0,96 C60,90 180,90 240,96 L240,114 L0,114 Z" fill="#fbfbf8" {...ink} />;
    case 'attic':
      return (
        <g>
          <path d="M0,40 L120,4 L240,40" fill="none" {...ink} />
          <path d="M40,28 L40,100 M200,28 L200,100" stroke="#8a5a32" strokeWidth="2" />
          <path d="M0,100 L240,100" {...ink} />
          <path d="M108,36 L132,36 L132,56 L108,56 Z" fill="#cfd9e6" {...thin} />
        </g>
      );
    case 'willow':
      return (
        <g>
          <path d="M210,100 C206,80 208,60 214,44" stroke="#6e4f30" strokeWidth="5" fill="none" />
          <path d="M214,44 C180,30 160,40 150,80 M214,44 C200,36 182,50 176,90 M214,44 C228,40 240,50 240,80 M214,44 C206,46 196,64 196,92" fill="none" stroke="#6f8f5a" strokeWidth="1.6" />
          <path d="M0,100 L240,100" {...ink} />
          <ellipse cx="60" cy="104" rx="56" ry="6" fill="#b9cfd9" {...thin} />
        </g>
      );
    case 'hive':
      return (
        <g opacity="0.55">
          {Array.from({ length: 6 }, (_, r) =>
            Array.from({ length: 12 }, (_, c) => (
              <path key={`${r}-${c}`} d={`M${c * 22 + (r % 2 ? 11 : 0)},${r * 19 + 8} l6,-8 h10 l6,8 l-6,8 h-10 Z`} fill="#f2c94c" stroke="#b07a1e" strokeWidth="0.8" />
            )),
          )}
        </g>
      );
    case 'kitchen':
      return (
        <g>
          <path d="M20,18 L70,18 L70,58 L20,58 Z M45,18 L45,58" fill="#dfe8ee" {...thin} />
          <path d="M100,72 L220,72 L220,76 L100,76 Z M110,76 L110,100 M210,76 L210,100" fill="#8a5a32" {...thin} />
          <path d="M0,100 L240,100" {...ink} />
        </g>
      );
    case 'hill':
      return (
        <g>
          <path d="M0,96 C60,70 140,62 240,84 L240,114 L0,114 Z" fill="#d6ccb4" {...ink} />
          <path d="M40,8 l0,5 M37.5,10.5 l5,0 M120,20 l0,4 M118,22 l4,0 M210,14 l0,5 M207.5,16.5 l5,0" {...thin} />
        </g>
      );
    case 'orchard':
      return (
        <g>
          {[30, 120, 210].map((x) => (
            <g key={x}>
              <path d={`M${x},100 L${x},62`} stroke="#6e4f30" strokeWidth="4" />
              <circle cx={x} cy="50" r="22" fill="#9fbf8a" {...thin} />
              <circle cx={x - 8} cy="46" r="2.4" fill="#c9433f" />
              <circle cx={x + 9} cy="54" r="2.4" fill="#c9433f" />
            </g>
          ))}
          <path d="M0,100 L240,100" {...ink} />
        </g>
      );
    default:
      return <path d="M0,100 L240,100" {...ink} />;
  }
}

function SetFront({ set }: { set: SetKey }) {
  if (set === 'fog') {
    return (
      <g fill="#f8f4ec">
        <rect x="0" y="0" width="240" height="114" opacity="0.45" />
        <path d="M0,70 C40,62 80,74 120,66 C160,58 200,72 240,64 L240,86 L0,86 Z" opacity="0.6" />
      </g>
    );
  }
  if (set === 'snow') {
    return (
      <g fill="#fffaf0" stroke={INK} strokeWidth="0.4">
        {[[20, 14], [56, 30], [92, 10], [130, 40], [168, 18], [204, 34], [228, 8], [40, 58], [150, 64], [190, 60]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" />
        ))}
      </g>
    );
  }
  return null;
}

// ---- putting a scene together ---------------------------------------------------------------

/** How each thing is drawn, and how big by default, so a scene only says where things stand. */
function base(a: Actor): { node: ReactNode; s: number } {
  const [head, mood] = a.split(':') as [string, string | undefined];
  if ((VISITOR_IDS as readonly string[]).includes(head)) return { node: <VisitorArt id={head as VisitorId} mood={(mood as VisitorMood | undefined) ?? 'waiting'} />, s: 0.52 };
  if (head === 'plant') return { node: <PlantArt species={mood as SpeciesId} stage="bloom" />, s: 0.6 };
  const things: Record<string, [ReactNode, number]> = {
    jezyk: [<PanJezyk />, 0.55],
    'jezyk-happy': [<PanJezyk mood="happy" />, 0.55],
    'jezyk-asleep': [<PanJezyk mood="asleep" />, 0.55],
    cma: [<PaniCma />, 0.5],
    'cma-happy': [<PaniCma mood="happy" />, 0.5],
    milton: [<Milton />, 0.9],
    dogs: [<g transform="translate(-210 -868)"><Dogs mood="day" /></g>, 0.42],
    stall: [<Stall night={false} keeper={<PanJezyk />} />, 0.34],
    'night-stall': [<Stall night keeper={<PaniCma />} />, 0.34],
    borsuk: [<Borsuk />, 0.95],
    trzmielina: [<Trzmielina />, 0.95],
    snail: [<Snail />, 1],
    beetle: [<Beetle />, 1],
    mole: [<Mole />, 1],
    owl: [<Owl />, 1],
    'owl-hat': [<Owl hat />, 1],
    squirrel: [<Squirrel />, 1],
    wasp: [<Wasp />, 1],
    cricket: [<Cricket />, 1],
    crow: [<Crow />, 1],
    ants: [<Ants />, 1],
    firefly: [<Firefly />, 1],
    ladybird: [<Ladybird />, 1],
    stone: [<Stone mayor={false} />, 1],
    'stone-mayor': [<Stone mayor />, 1],
    clocktower: [<ClockTower />, 1],
    nest: [<Nest />, 1],
    lamppost: [<Lamppost jumper={false} />, 1],
    'lamppost-jumper': [<Lamppost jumper />, 1],
    scales: [<Scales />, 1],
    bridge: [<Bridge />, 1],
    lettuce: [<path d="M-12,0 C-16,-8 -8,-14 0,-12 C8,-14 16,-8 12,0 Z" fill="#9fbf6a" {...ink} />, 1],
    candles: [<Candles />, 1],
    lantern: [<Lantern />, 1],
    hat: [<WitchHat />, 1],
    broom: [<Broom />, 1],
    books: [<Books />, 1],
    flag: [<Flag />, 1],
    socks: [<Socks />, 1],
    letter: [<Letter />, 1],
    leaf: [<Leaf />, 1],
    cake: [<Cake />, 1],
    flute: [<Flute />, 1],
    map: [<MapPaper />, 1],
    newspaper: [<Newspaper />, 1],
    typewriter: [<Typewriter />, 1],
    honey: [<Honey />, 1],
    barrel: [<Barrel />, 1],
    diploma: [<Diploma />, 1],
    cauldron: [<Cauldron />, 1],
    kettle: [<Kettle />, 1],
    bench: [<Bench />, 1],
    sunflower: [<Sunflower />, 1],
    nuts: [<Nuts />, 1],
    camera: [<Camera />, 1],
    pumpkin: [<BigPumpkin />, 1],
    sled: [<Sled />, 1],
    notes: [<Notes />, 1],
    desk: [<Desk />, 1],
    moon: [<MoonArt />, 1],
    cloud: [<Cloud />, 1],
    stars: [<Stars />, 1],
    hole: [<Hole />, 1],
    ribbon: [<Ribbon />, 1],
    seeds: [<Seeds />, 1],
  };
  const t = things[a];
  return t ? { node: t[0], s: t[1] } : { node: null, s: 1 };
}

/** The scene, drawn in the 240 by 114 frame. */
export function ShotArt({ shot }: { shot: Shot }) {
  const set = shot.set ?? 'meadow';
  return (
    <g>
      <SetBack set={set} />
      {shot.cast.map((p, i) => {
        const { node, s } = base(p.a);
        const k = (p.s ?? 1) * s;
        return (
          <g key={i} transform={`translate(${p.x} ${GROUND - (p.y ?? 0)}) scale(${p.flip ? -k : k} ${k})`}>
            {node}
          </g>
        );
      })}
      <SetFront set={set} />
    </g>
  );
}

/**
 * A picture for the paper. Still, like a photograph: nothing in it moves. `tone`: sepia newsprint
 * for the Kurier, loud colour for Brzęczyk.
 */
export function PaperArt({ shot, label, tone = 'sepia' }: { shot: Shot; label: string; tone?: 'sepia' | 'black' }) {
  const id = `ht-${tone}`;
  return (
    <div className={`paper-art ${tone}`}>
      <svg viewBox={`0 0 ${FRAME_W} ${FRAME_H}`} role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id={id} width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <circle cx="1.6" cy="1.6" r="0.5" fill="#2d2228" />
          </pattern>
        </defs>
        <g pointerEvents="none">
          <ShotArt shot={shot} />
        </g>
        <rect x="0" y="0" width={FRAME_W} height={FRAME_H} fill={`url(#${id})`} opacity="0.1" pointerEvents="none" />
      </svg>
    </div>
  );
}
