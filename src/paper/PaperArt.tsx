import { useId, type ReactNode } from 'react';
import { Milton, PaniCma, PanJezyk, Stall } from '../scene/MarketArt';
import { VisitorArt, type VisitorMood } from '../scene/VisitorArt';
import { Dogs } from '../scene/Dogs';
import { PlantArt } from '../plants/PlantArt';
import { POT_HEIGHT, Potted, RIM } from '../plants/Pots';
import { VISITOR_IDS, type VisitorId } from '../garden/visitors';
import { SPECIES, type SpeciesId } from '../garden/species';

/**
 * The papers' pictures. Each is a little scene, set up like a press photo: a place (the street,
 * the pond, the town hall...), the townsfolk in it, what the story is about, and the small marks
 * cartoonists use (sleep, hearts, a drop of sweat) so it's clear what everyone feels. The
 * townsfolk are the garden's own drawings, held still; the rest is drawn here in the same hand.
 * Printed as the paper prints: faded colour for the Kurier, loud colour for Brzęczyk.
 */

const INK = '#2d2228';
const ink = { stroke: INK, strokeWidth: 1.4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const thin = { stroke: INK, strokeWidth: 0.9, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const CHEEK = '#f2a6bb';

/** The frame: 240 wide, 114 tall; the ground runs at y = 100. */
export const FRAME_W = 240;
export const FRAME_H = 114;
const GROUND = 100;

export type SetKey =
  | 'street' | 'pond' | 'pinkpond' | 'hall' | 'meadow' | 'night' | 'room' | 'sill' | 'roomsill' | 'snow' | 'fog' | 'attic' | 'willow' | 'hive' | 'kitchen' | 'hill' | 'orchard';

export type Actor =
  // the garden's own townsfolk
  | 'jezyk' | 'jezyk-happy' | 'jezyk-asleep' | 'cma' | 'cma-happy' | 'milton' | 'dogs' | 'dogs-out' | 'stall' | 'night-stall'
  | VisitorId | `${VisitorId}:${VisitorMood}`
  | `plant:${SpeciesId}` | `pot:${SpeciesId}`
  // drawn for the papers
  | 'borsuk' | 'borsuk-bee' | 'trzmielina' | 'trzmielina-camera' | 'snail' | 'beetle' | 'mole' | 'owl' | 'owl-hat' | 'owl-asleep' | 'squirrel' | 'wasp' | 'cricket' | 'crow' | 'ants' | 'firefly' | 'ladybird'
  // things
  | 'stone' | 'stone-mayor' | 'clocktower' | 'nest' | 'lamppost' | 'lamppost-jumper' | 'scales' | 'bridge' | 'lettuce' | 'candles' | 'lantern' | 'hat' | 'broom'
  | 'books' | 'flag' | 'socks' | 'letter' | 'leaf' | 'cake' | 'flute' | 'map' | 'newspaper' | 'newspaper-bee' | 'letters' | 'typewriter' | 'honey' | 'barrel' | 'diploma' | 'cauldron'
  | 'kettle' | 'bench' | 'sunflower' | 'nuts' | 'camera' | 'pumpkin' | 'sled' | 'notes' | 'desk' | 'moon' | 'cloud' | 'stars' | 'hole' | 'ribbon' | 'seeds'
  | 'lace' | 'cobweb' | 'teacup' | 'basket' | 'bush' | 'puddle'
  // the marks: what everyone feels
  | 'zzz' | 'hearts' | 'sweat' | 'exclaim' | 'question' | 'motion' | 'sparkle' | 'steam' | 'anger';

/** One thing in a scene: who or what, where along the ground (0 to 240), how high above it, how big, and facing which way. */
export type Part = { a: Actor; x: number; y?: number; s?: number; flip?: boolean };

/** A picture: a place, and what's in it. */
export type Shot = { set?: SetKey; cast: Part[] };

const eyes = (x1: number, x2: number, y: number, r = 1.8) => (
  <g>
    <circle cx={x1} cy={y} r={r} fill={INK} />
    <circle cx={x2} cy={y} r={r} fill={INK} />
    <circle cx={x1 + r * 0.35} cy={y - r * 0.4} r={r * 0.35} fill="#fffaf0" />
    <circle cx={x2 + r * 0.35} cy={y - r * 0.4} r={r * 0.35} fill="#fffaf0" />
  </g>
);

// ---- townsfolk drawn for the papers ----------------------------------------------------------

/** Redaktor Bogdan Borsuk, who came from the big city and started the Kurier: round glasses, a tweed waistcoat, a bow tie, today's paper. */
function Borsuk({ bee = false }: { bee?: boolean }) {
  const fur = '#958f9a';
  return (
    <g>
      <ellipse cx="0" cy="0.5" rx="20" ry="3" fill="#000" opacity="0.12" />
      {/* feet and body */}
      <ellipse cx="-8" cy="-1.5" rx="5.4" ry="2.8" fill="#3a3238" {...thin} />
      <ellipse cx="8" cy="-1.5" rx="5.4" ry="2.8" fill="#3a3238" {...thin} />
      <path d="M-17,-3 C-21,-16 -19,-32 -10,-38 L10,-38 C19,-32 21,-16 17,-3 C10,-1 -10,-1 -17,-3 Z" fill={fur} {...ink} />
      <path d="M-7,-38 L7,-38 L5,-26 L-5,-26 Z" fill="#fffaf0" {...thin} />
      {/* the tweed waistcoat, buttoned */}
      <path d="M-12,-34 C-14,-22 -13,-11 -11,-4 L11,-4 C13,-11 14,-22 12,-34 L5,-26 L0,-15 L-5,-26 Z" fill="#a0714a" {...ink} />
      <path d="M-10,-28 L-7,-10 M10,-28 L7,-10" stroke="#7d5536" strokeWidth="0.7" strokeDasharray="1.2 1.6" />
      <circle cx="0" cy="-11" r="1.1" fill="#f2d16b" {...thin} />
      <circle cx="0" cy="-6.5" r="1.1" fill="#f2d16b" {...thin} />
      <path d="M-5.4,-36.6 L0,-34 L5.4,-36.6 L5.4,-31 L0,-34 L-5.4,-31 Z" fill="#c95d7f" {...thin} />
      {/* an arm at his side */}
      <path d="M-15,-31 C-21,-24 -21,-15 -18,-10 C-16,-8.6 -13.6,-9.4 -13.8,-11.6 C-15.4,-17 -15,-23 -11.6,-28 Z" fill={fur} {...ink} />
      {/* today's paper, and the arm that holds it */}
      <g transform="translate(17 -24) rotate(-10)">
        <path d="M-2,-9 L13,-9 L13,10 L-2,10 Z" fill={bee ? '#f2c94c' : '#fbf4e6'} {...thin} />
        <path d="M0.5,-5.5 L10.5,-5.5" stroke={INK} strokeWidth="1.6" />
        <path d="M0.5,-2 L10.5,-2 M0.5,1 L10.5,1 M0.5,4 L7.5,4 M0.5,7 L9.5,7" stroke={INK} strokeWidth="0.55" />
      </g>
      <path d="M13,-31 C20,-27 22,-20 20,-14 C18.6,-12 15.6,-12.6 15.6,-15 C16.6,-19.6 15.6,-24 12,-27.6 Z" fill={fur} {...ink} />
      {/* ears, tucked into the top of his head */}
      <circle cx="-15.5" cy="-67" r="6.4" fill="#3a3238" {...ink} />
      <circle cx="-15.5" cy="-67" r="2.8" fill="#f4f1ea" />
      <circle cx="15.5" cy="-67" r="6.4" fill="#3a3238" {...ink} />
      <circle cx="15.5" cy="-67" r="2.8" fill="#f4f1ea" />
      {/* his head: white, grey at the cheeks, with the badger's two black stripes from nose to ears */}
      <path d="M-21,-54 C-21,-66 -12,-72 0,-72 C12,-72 21,-66 21,-54 C21,-44 12,-38 0,-37 C-12,-38 -21,-44 -21,-54 Z" fill="#f4f1ea" />
      <path d="M-20.4,-56 C-20,-64 -15.6,-69.4 -10.6,-71 C-13.6,-62 -15.4,-52 -12.4,-40.4 C-17.4,-43 -20.6,-48 -20.4,-56 Z" fill={fur} />
      <path d="M20.4,-56 C20,-64 15.6,-69.4 10.6,-71 C13.6,-62 15.4,-52 12.4,-40.4 C17.4,-43 20.6,-48 20.4,-56 Z" fill={fur} />
      <path d="M-12.6,-70 C-10,-62 -9.4,-52 -6.2,-44.6 L-2.6,-45.4 C-4.2,-53 -5,-62 -6.8,-71.6 Z" fill="#2d2228" />
      <path d="M12.6,-70 C10,-62 9.4,-52 6.2,-44.6 L2.6,-45.4 C4.2,-53 5,-62 6.8,-71.6 Z" fill="#2d2228" />
      <path d="M-21,-54 C-21,-66 -12,-72 0,-72 C12,-72 21,-66 21,-54 C21,-44 12,-38 0,-37 C-12,-38 -21,-44 -21,-54 Z" fill="none" {...ink} />
      {/* eyes behind round gold glasses */}
      <circle cx="-7.6" cy="-56" r="2.3" fill="#fffaf0" />
      <circle cx="-7.4" cy="-55.6" r="1.3" fill={INK} />
      <circle cx="7.6" cy="-56" r="2.3" fill="#fffaf0" />
      <circle cx="7.4" cy="-55.6" r="1.3" fill={INK} />
      <circle cx="-7.6" cy="-56" r="5" fill="none" stroke="#b8893a" strokeWidth="1.2" />
      <circle cx="7.6" cy="-56" r="5" fill="none" stroke="#b8893a" strokeWidth="1.2" />
      <path d="M-2.6,-56.6 C-1,-58 1,-58 2.6,-56.6" fill="none" stroke="#b8893a" strokeWidth="1.1" />
      <ellipse cx="-13.4" cy="-47.6" rx="3" ry="1.8" fill="#f2a6bb" opacity="0.75" />
      <ellipse cx="13.4" cy="-47.6" rx="3" ry="1.8" fill="#f2a6bb" opacity="0.75" />
      <ellipse cx="0" cy="-42" rx="3.4" ry="2.4" fill={INK} />
      <path d="M-2.4,-39.2 C-1,-37.8 1,-37.8 2.4,-39.2" fill="none" {...thin} />
    </g>
  );
}


/**
 * Trzmielina, editor of Brzęczyk: a round bumblebee in a little press hat, with her notebook, or
 * her camera when she's out taking pictures. Her stripes stay inside her.
 */
function Trzmielina({ camera = false }: { camera?: boolean }) {
  const clip = `tz${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <g transform="translate(0 -22)">
      <defs>
        <clipPath id={clip}>
          <ellipse cx="0" cy="2" rx="18" ry="15" />
        </clipPath>
      </defs>
      <path d="M-6,-10 C-20,-32 -38,-26 -30,-12 C-26,-6 -14,-6 -6,-7 Z M6,-10 C20,-32 38,-26 30,-12 C26,-6 14,-6 6,-7 Z" fill="#f6f3ec" {...thin} />
      <ellipse cx="0" cy="2" rx="18" ry="15" fill="#f2bf45" />
      <g clipPath={`url(#${clip})`} fill="#2d2228">
        <path d="M-20,2 C-8,-1 8,-1 20,2 L20,6.4 C8,3.4 -8,3.4 -20,6.4 Z" />
        <path d="M-20,11.4 C-8,8.4 8,8.4 20,11.4 L20,15.4 C8,12.4 -8,12.4 -20,15.4 Z" />
      </g>
      <ellipse cx="0" cy="2" rx="18" ry="15" fill="none" {...ink} />
      {/* her face, on the top band */}
      <circle cx="-6" cy="-7" r="1.9" fill={INK} />
      <circle cx="6" cy="-7" r="1.9" fill={INK} />
      <circle cx="-5.4" cy="-7.6" r="0.6" fill="#fffaf0" />
      <circle cx="6.6" cy="-7.6" r="0.6" fill="#fffaf0" />
      <ellipse cx="-10" cy="-3.4" rx="2.4" ry="1.4" fill="#f2a6bb" opacity="0.8" />
      <ellipse cx="10" cy="-3.4" rx="2.4" ry="1.4" fill="#f2a6bb" opacity="0.8" />
      <path d="M-2.4,-4.6 C-1,-3.2 1,-3.2 2.4,-4.6" fill="none" {...thin} />
      {/* the press hat, with its card */}
      <path d="M-11,-13 L11,-13 L9,-20 L-9,-20 Z" fill="#3b2a33" {...thin} />
      <path d="M-15,-13 C-8,-11 8,-11 15,-13" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3,-19.4 L8.6,-19.4 L8.6,-15.6 L3,-15.6 Z" fill="#fffaf0" {...thin} />
      <path d="M-5,-20 C-7,-26 -9,-28 -12,-28 M5,-20 C7,-26 9,-28 12,-28" fill="none" {...thin} />
      <circle cx="-12.4" cy="-28" r="1.3" fill={INK} />
      <circle cx="12.4" cy="-28" r="1.3" fill={INK} />
      {camera ? (
        <g transform="translate(12 6)">
          <path d="M-2,-5 C-4,-2 -4,2 -2,4" fill="none" {...ink} />
          <path d="M0,-6 L14,-6 L14,5 L0,5 Z" fill="#2b2229" {...thin} />
          <path d="M3,-6 L5,-9 L9,-9 L11,-6" fill="#2b2229" {...thin} />
          <circle cx="7" cy="-0.6" r="3.4" fill="#9aa3b5" {...thin} />
          <circle cx="7" cy="-0.6" r="1.4" fill="#2b2229" />
          <path d="M16,-8 l3,-3 M17,-1 l4,0 M16,5 l3,3" stroke="#f2d16b" strokeWidth="1.3" strokeLinecap="round" />
        </g>
      ) : (
        <g transform="translate(14 4) rotate(8)">
          <path d="M-1,-4 C-3,-1 -3,2 -1,4" fill="none" {...ink} />
          <path d="M0,-6 L10,-6 L10,8 L0,8 Z" fill="#fffaf0" {...thin} />
          <path d="M2,-2 L8,-2 M2,1 L8,1 M2,4 L6,4" stroke={INK} strokeWidth="0.6" />
        </g>
      )}
    </g>
  );
}


/** A snail with a tidy spiral shell, eyes up on their stalks, and a smile. */
function Snail() {
  return (
    <g>
      <path d="M-20,0 C-21,-5 -17,-7 -12,-7 L13,-7 C17,-7 20,-11 20,-15 L22,-15 C23,-8 21,-1 14,0 Z" fill="#ead9b8" {...ink} />
      <path d="M17,-14 C17,-20 15,-24 13,-27 M21,-14 C22,-20 23,-24 25,-27" fill="none" {...thin} />
      {eyes(13, 25, -28, 1.7)}
      <path d="M18,-10 C19.4,-9 21,-9 22,-10.4" fill="none" {...thin} />
      <ellipse cx="17" cy="-12" rx="1.6" ry="1" fill={CHEEK} opacity="0.8" />
      <circle cx="-2" cy="-17" r="12" fill="#d9a77a" {...ink} />
      <path d="M-2,-17 m-8,0 a8,8 0 1,1 16,0 a6,6 0 1,1 -12,0 a4,4 0 1,1 8,0 a2,2 0 1,1 -4,0" fill="none" stroke="#a5703f" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M-10,-24 C-7,-27 -3,-28 0,-28" fill="none" stroke="#f0d2aa" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}

/** A shiny green beetle with a friendly face. */
function Beetle() {
  return (
    <g>
      <path d="M-14,-2 L-18,1 M-6,-1 L-8,2 M6,-1 L8,2 M14,-2 L17,1" {...ink} />
      <path d="M-20,-3 C-21,-16 14,-19 17,-5 C17,-1 -18,0 -20,-3 Z" fill="#3f8a72" {...ink} />
      <path d="M-2,-16 L-1,-2" stroke="#2a5c4c" strokeWidth="1" />
      <path d="M-15,-9 C-12,-14 -6,-15 -3,-15" fill="none" stroke="#a8e0c8" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="20" cy="-7" r="6.4" fill="#2f4a40" {...ink} />
      <circle cx="18.6" cy="-8" r="1.9" fill="#fffaf0" />
      <circle cx="22.6" cy="-8" r="1.9" fill="#fffaf0" />
      <circle cx="19" cy="-7.6" r="1" fill={INK} />
      <circle cx="23" cy="-7.6" r="1" fill={INK} />
      <path d="M19,-4.4 C20,-3.6 21.4,-3.6 22.4,-4.4" fill="none" stroke="#fffaf0" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M18,-13 C16,-17 14,-18 12,-18 M23,-13 C24,-17 26,-18 28,-18" fill="none" {...thin} />
    </g>
  );
}

/** Zenon the mole, up out of his hole: velvet grey, a big pink nose, earth on it, pink spade hands. */
function Mole() {
  return (
    <g>
      <path d="M-16,0 C-18,-16 -11,-27 0,-27 C11,-27 18,-16 16,0 Z" fill="#6f6270" {...ink} />
      <path d="M-9,-20 C-6,-23 -2,-24 1,-24" fill="none" stroke="#9a8d9c" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M-8,-18 C-7,-16.6 -5,-16.6 -4,-18 M4,-18 C5,-16.6 7,-16.6 8,-18" fill="none" stroke="#fffaf0" strokeWidth="1" strokeLinecap="round" />
      <ellipse cx="-9" cy="-12" rx="2.4" ry="1.4" fill={CHEEK} opacity="0.7" />
      <ellipse cx="9" cy="-12" rx="2.4" ry="1.4" fill={CHEEK} opacity="0.7" />
      <ellipse cx="0" cy="-12" rx="4.6" ry="3.4" fill="#f29fb4" {...thin} />
      <circle cx="1.6" cy="-13.6" r="1" fill="#7a5638" />
      <path d="M-4,-10 l-8,1 M-4,-9 l-7,4 M4,-10 l8,1 M4,-9 l7,4" stroke="#fffaf0" strokeWidth="0.7" />
      <path d="M-20,-4 C-24,-6 -26,-2 -24,0 L-14,0 C-14,-2 -16,-4 -20,-4 Z M20,-4 C24,-6 26,-2 24,0 L14,0 C14,-2 16,-4 20,-4 Z" fill="#f4b4c4" {...thin} />
      <path d="M-23,-1 l-1,1.6 M-20,-1 l-0.6,1.8 M23,-1 l1,1.6 M20,-1 l0.6,1.8" {...thin} />
    </g>
  );
}

/** The owl, the town's night watchman: round, feathery, enormous eyes; a bobble hat, or fast asleep. */
function Owl({ hat = false, asleep = false }: { hat?: boolean; asleep?: boolean }) {
  return (
    <g>
      <path d="M-4,0 l-2,2 M0,0 l0,2.4 M4,0 l2,2" stroke="#e2ad3f" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M-16,-2 C-22,-18 -20,-36 -6,-41 L6,-41 C20,-36 22,-18 16,-2 C10,1 -10,1 -16,-2 Z" fill="#a98563" {...ink} />
      <path d="M-9,-4 C-12,-14 -10,-24 0,-25 C10,-24 12,-14 9,-4 Z" fill="#efe1c6" {...thin} />
      <path d="M-5,-18 l2,2 l2,-2 M1,-18 l2,2 l2,-2 M-3,-11 l2,2 l2,-2 M3,-11 l2,2 l2,-2" fill="none" stroke="#b8946c" strokeWidth="0.8" />
      <path d="M-17,-24 C-22,-16 -20,-8 -15,-5 M17,-24 C22,-16 20,-8 15,-5" fill="#94704f" {...thin} />
      <circle cx="-7" cy="-31" r="7.4" fill="#fff6e2" {...ink} />
      <circle cx="7" cy="-31" r="7.4" fill="#fff6e2" {...ink} />
      {asleep ? (
        <path d="M-11,-31 C-9,-29 -5,-29 -3,-31 M3,-31 C5,-29 9,-29 11,-31" fill="none" {...ink} />
      ) : (
        <g>
          <circle cx="-6.4" cy="-31" r="3.8" fill={INK} />
          <circle cx="7.6" cy="-31" r="3.8" fill={INK} />
          <circle cx="-5" cy="-32.6" r="1.3" fill="#fffaf0" />
          <circle cx="9" cy="-32.6" r="1.3" fill="#fffaf0" />
        </g>
      )}
      <path d="M-2,-26 L0,-21.6 L2,-26 Z" fill="#e2ad3f" {...thin} />
      <ellipse cx="-12" cy="-23" rx="2.4" ry="1.4" fill={CHEEK} opacity="0.7" />
      <ellipse cx="12" cy="-23" rx="2.4" ry="1.4" fill={CHEEK} opacity="0.7" />
      {hat ? (
        <g>
          <path d="M-15,-37 C-14,-52 14,-52 15,-37 Z" fill="#e58aa6" {...ink} />
          <path d="M-15.6,-38 C-6,-34 6,-34 15.6,-38" fill="none" stroke="#fffaf0" strokeWidth="3" />
          <path d="M-10,-44 L-8,-40 M-3,-46 L-2,-41 M4,-46 L3,-41 M10,-44 L8,-40" stroke="#c95d7f" strokeWidth="0.8" />
          <circle cx="0" cy="-51" r="4" fill="#fffaf0" {...thin} />
        </g>
      ) : (
        <path d="M-13,-38 L-17,-47 L-7,-40 M13,-38 L17,-47 L7,-40" fill="#a98563" {...ink} />
      )}
    </g>
  );
}

/** Halinka the squirrel: a big curled tail, a nut in her paws, little feet. */
function Squirrel() {
  return (
    <g>
      <path d="M5,-6 C22,-4 30,-20 27,-34 C25,-46 13,-49 9,-41 C15,-41 19,-34 16,-25 C13,-18 8,-16 5,-13 Z" fill="#c9783f" {...ink} />
      <path d="M22,-34 C22,-40 18,-43 14,-43" fill="none" stroke="#e8a46c" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="-7" cy="-1.4" rx="4.6" ry="2" fill="#b56a36" {...thin} />
      <ellipse cx="5" cy="-1.4" rx="4.6" ry="2" fill="#b56a36" {...thin} />
      <path d="M-11,-2 C-15,-12 -12,-24 -2,-26 C8,-26 11,-14 9,-3 C6,0 -8,0 -11,-2 Z" fill="#d98c52" {...ink} />
      <ellipse cx="-1" cy="-12" rx="5.4" ry="7.6" fill="#f6e0c2" />
      {/* the nut, held in both paws */}
      <ellipse cx="-1" cy="-17" rx="3.4" ry="3" fill="#a0703e" {...thin} />
      <path d="M-4.4,-18 C-3,-21.4 1,-21.4 2.4,-18 Z" fill="#7a5230" {...thin} />
      <ellipse cx="-5" cy="-16" rx="2.4" ry="1.8" fill="#d98c52" {...thin} />
      <ellipse cx="3" cy="-16" rx="2.4" ry="1.8" fill="#d98c52" {...thin} />
      {/* her head */}
      <path d="M-11,-41 L-10,-49 L-5,-43 Z M3,-43 L7,-50 L8,-41 Z" fill="#d98c52" {...ink} />
      <path d="M-9.6,-43.6 L-9.4,-46.6 L-7,-44 Z M5,-43 L6.6,-46.6 L6.8,-43 Z" fill={CHEEK} />
      <circle cx="-2" cy="-34" r="10" fill="#d98c52" {...ink} />
      <ellipse cx="-2" cy="-30" rx="5" ry="3.8" fill="#f6e0c2" />
      {eyes(-6, 2, -35, 1.6)}
      <ellipse cx="-8.6" cy="-31" rx="2" ry="1.2" fill={CHEEK} opacity="0.8" />
      <ellipse cx="4.6" cy="-31" rx="2" ry="1.2" fill={CHEEK} opacity="0.8" />
      <ellipse cx="-2" cy="-31.6" rx="1.4" ry="1" fill={INK} />
      <path d="M-3.6,-29.4 C-2.6,-28.4 -1.4,-28.4 -0.4,-29.4" fill="none" {...thin} />
    </g>
  );
}

/** A wasp from the bin gang: stripes, a backwards cap, a scowl. */
function Wasp() {
  const clip = `wp${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <g transform="translate(0 -26)">
      <defs>
        <clipPath id={clip}>
          <ellipse cx="6" cy="2" rx="12" ry="8.4" />
        </clipPath>
      </defs>
      <path d="M-2,-6 C-8,-22 -22,-20 -16,-8 C-13,-4 -6,-4 -2,-5 Z M6,-6 C8,-22 22,-22 18,-8 C15,-4 9,-4 6,-5 Z" fill="#eef4f6" opacity="0.9" {...thin} />
      <ellipse cx="6" cy="2" rx="12" ry="8.4" fill="#f2c13f" />
      <g clipPath={`url(#${clip})`} fill={INK}>
        <path d="M4,-8 L8,-8 L6,12 L2,12 Z M11,-8 L15,-8 L13,12 L9,12 Z" />
      </g>
      <ellipse cx="6" cy="2" rx="12" ry="8.4" fill="none" {...ink} />
      <path d="M18,2 L23,3 L18,4.4" fill={INK} />
      <circle cx="-8" cy="-1" r="7" fill="#f2c13f" {...ink} />
      <path d="M-14,-6 C-12,-11 -4,-11 -2,-7 L-14,-6 Z M-15,-6.4 L-19,-5" fill="#2b2229" {...thin} />
      <path d="M-12,-3.4 L-9,-2 M-6,-2 L-3,-3.4" {...ink} />
      <circle cx="-10" cy="-0.6" r="1.2" fill={INK} />
      <circle cx="-4.6" cy="-0.6" r="1.2" fill={INK} />
      <path d="M-9.6,3 C-8,2.2 -6,2.4 -5,3.2" fill="none" {...thin} />
    </g>
  );
}

/** Ignacy the cricket, conductor of the meadow orchestra: up on his back legs, bow in hand. */
function Cricket() {
  return (
    <g>
      <path d="M-4,-8 C-8,-4 -9,-1 -6,0 M4,-8 C8,-4 9,-1 6,0" fill="none" {...ink} />
      <ellipse cx="0" cy="-14" rx="7" ry="9" fill="#8fb55c" {...ink} />
      <path d="M-6,-18 C-2,-12 -2,-8 -4,-6 M6,-18 C2,-12 2,-8 4,-6" fill="none" stroke="#5f8a3a" strokeWidth="1" />
      <path d="M-5,-20 C-11,-18 -14,-14 -14,-10" fill="none" {...ink} />
      <path d="M5,-20 C10,-22 13,-25 14,-29" fill="none" {...ink} />
      <path d="M10,-38 L18,-20" stroke="#8a5a32" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="0" cy="-28" r="7.4" fill="#9cc466" {...ink} />
      {eyes(-3, 3, -29, 2)}
      <ellipse cx="-5.4" cy="-25.4" rx="1.8" ry="1.1" fill={CHEEK} opacity="0.8" />
      <ellipse cx="5.4" cy="-25.4" rx="1.8" ry="1.1" fill={CHEEK} opacity="0.8" />
      <path d="M-1.6,-24.6 C-0.6,-23.6 0.6,-23.6 1.6,-24.6" fill="none" {...thin} />
      <path d="M-3,-35 C-6,-44 -12,-48 -16,-48 M3,-35 C6,-44 10,-48 14,-50" fill="none" {...thin} />
      <path d="M-4.4,-18 L0,-16 L4.4,-18 L4.4,-14 L0,-16 L-4.4,-14 Z" fill="#2b2229" />
    </g>
  );
}

function Crow() {
  return (
    <g>
      <path d="M-4,-3 L-5,0 M2,-3 L2,0" {...ink} />
      <path d="M-20,-12 C-14,-24 6,-27 13,-20 L24,-18 L14,-14 C11,-6 -3,-2 -12,-6 L-24,-4 Z" fill="#2f2a33" {...ink} />
      <path d="M-8,-12 C-4,-16 2,-16 6,-14" fill="none" stroke="#5a5266" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="9" cy="-20" r="2" fill="#fffaf0" />
      <circle cx="9.6" cy="-20" r="1" fill={INK} />
    </g>
  );
}

function Ants() {
  const one = (x: number, k: number) => (
    <g key={k} transform={`translate(${x} 0)`}>
      <ellipse cx="-4" cy="-3" rx="3" ry="2.4" fill="#5a3a2a" {...thin} />
      <circle cx="1" cy="-3.4" r="1.8" fill="#5a3a2a" {...thin} />
      <circle cx="5" cy="-4" r="2.2" fill="#5a3a2a" {...thin} />
      <circle cx="5.8" cy="-4.6" r="0.6" fill="#fffaf0" />
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

/** The stone from outside the town hall; as mayor, with a crown and the mayoral chain, and very content about it. */
function Stone({ mayor }: { mayor: boolean }) {
  return (
    <g>
      <path d="M-18,0 C-22,-8 -16,-20 -2,-21 C12,-22 22,-12 19,0 Z" fill="#b5ada4" {...ink} />
      <path d="M-12,-15 C-8,-18 -2,-18 2,-17" fill="none" stroke="#d6d0c8" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M-7,-9 C-6,-7.6 -4,-7.6 -3,-9 M3,-9 C4,-7.6 6,-7.6 7,-9" fill="none" {...thin} />
      <path d="M-1.6,-5 C-0.6,-4 0.6,-4 1.6,-5" fill="none" {...thin} />
      <ellipse cx="-8" cy="-5.4" rx="2" ry="1.2" fill={CHEEK} opacity="0.75" />
      <ellipse cx="8" cy="-5.4" rx="2" ry="1.2" fill={CHEEK} opacity="0.75" />
      {mayor && (
        <g>
          {/* the mayoral chain, its medal resting below the smile */}
          <path d="M-13,-9 C-10,-2 10,-2 13,-9" fill="none" stroke="#c9a03a" strokeWidth="1.8" strokeDasharray="1.6 0.8" />
          <circle cx="0" cy="-2.4" r="2.6" fill="#e2b13c" {...thin} />
          <circle cx="0" cy="-2.4" r="1" fill="#c9433f" />
          <path d="M-12,-25 L-8,-21 L-4,-27 L0,-21 L4,-25 L3,-19 L-11,-19 Z" fill="#e2ad3f" {...thin} />
          <circle cx="-4" cy="-26" r="0.9" fill="#c9433f" />
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


const Lace = () => (
  <g>
    <path d="M-22,0 C-22,-3 22,-3 22,0 C14,4 -14,4 -22,0 Z" fill="#fffaf2" {...thin} />
    <path d="M-20,0 C-14,3 14,3 20,0" fill="none" stroke="#d9c7b0" strokeWidth="0.8" strokeDasharray="1 1.6" />
  </g>
);

const Cobweb = () => (
  <g fill="none" stroke="#fffaf0" strokeWidth="0.8" opacity="0.9">
    <path d="M0,0 L28,0 M0,0 L0,28 M0,0 L22,18 M0,0 L12,26 M0,0 L26,10" />
    <path d="M8,0 C8,4 6,6 0,8 M16,0 C16,8 12,12 0,16 M24,0 C24,12 18,20 0,24" />
  </g>
);

const Teacup = () => (
  <g>
    <path d="M-6,-8 L6,-8 C6,-2 4,0 0,0 C-4,0 -6,-2 -6,-8 Z" fill="#fbe4ea" {...thin} />
    <path d="M6,-6 C10,-6 10,-2 6,-2.4" fill="none" {...thin} />
    <path d="M-9,0.6 C-4,2 4,2 9,0.6" fill="none" {...thin} />
  </g>
);

const Basket = () => (
  <g>
    <circle cx="-6" cy="-12" r="3.4" fill="#c9433f" {...thin} />
    <circle cx="1" cy="-13" r="3.4" fill="#d9583f" {...thin} />
    <circle cx="7" cy="-11.6" r="3.2" fill="#c9433f" {...thin} />
    <path d="M-12,-10 L12,-10 L9,0 L-9,0 Z" fill="#c9995c" {...ink} />
    <path d="M-10,-6 L10,-6 M-9,-3 L9,-3" stroke="#9a6f3e" strokeWidth="0.8" />
  </g>
);

const Bush = () => (
  <g>
    <path d="M-18,0 C-24,-6 -18,-16 -10,-14 C-8,-22 4,-24 8,-16 C16,-18 22,-8 16,0 Z" fill="#8fb571" {...ink} />
    <circle cx="-8" cy="-8" r="1.6" fill="#f2a6bb" />
    <circle cx="6" cy="-11" r="1.6" fill="#fffaf0" />
    <circle cx="10" cy="-4" r="1.6" fill="#f2a6bb" />
  </g>
);

const Puddle = () => (
  <g>
    <ellipse cx="0" cy="0" rx="20" ry="3.4" fill="#a9c8d6" {...thin} />
    <path d="M-10,-0.4 l8,0" stroke="#fffaf0" strokeWidth="1" />
  </g>
);

// ---- the marks: what everyone feels ---------------------------------------------------------

const MARKS: Record<string, ReactNode> = {
  zzz: (
    <g fill="none" stroke="#5a5266" strokeWidth="1.3" strokeLinejoin="round">
      <path d="M0,0 l5,0 l-5,5 l5,0" />
      <path d="M7,-8 l4,0 l-4,4 l4,0" />
      <path d="M13,-15 l3,0 l-3,3 l3,0" />
    </g>
  ),
  hearts: (
    <g fill="#e2617f" stroke={INK} strokeWidth="0.6">
      <path d="M0,0 C-3,-2.6 -5,-4.6 -5,-6.6 C-5,-8.4 -3.6,-9.4 -2.4,-9.4 C-1.2,-9.4 -0.4,-8.6 0,-7.8 C0.4,-8.6 1.2,-9.4 2.4,-9.4 C3.6,-9.4 5,-8.4 5,-6.6 C5,-4.6 3,-2.6 0,0 Z" />
      <path transform="translate(9 -8) scale(0.65)" d="M0,0 C-3,-2.6 -5,-4.6 -5,-6.6 C-5,-8.4 -3.6,-9.4 -2.4,-9.4 C-1.2,-9.4 -0.4,-8.6 0,-7.8 C0.4,-8.6 1.2,-9.4 2.4,-9.4 C3.6,-9.4 5,-8.4 5,-6.6 C5,-4.6 3,-2.6 0,0 Z" />
    </g>
  ),
  sweat: <path d="M0,0 C-2.6,-3 -2.6,-5.6 0,-9 C2.6,-5.6 2.6,-3 0,0 Z" fill="#a9d4ec" stroke={INK} strokeWidth="0.7" />,
  exclaim: (
    <g fill="#c9433f" stroke={INK} strokeWidth="0.7">
      <path d="M-2,-16 L2,-16 L1,-5 L-1,-5 Z" />
      <circle cx="0" cy="-1.4" r="1.6" />
    </g>
  ),
  question: <path d="M-3,-12 C-3,-17 4,-17 4,-12 C4,-9 0,-9 0,-5 M0,-1.6 L0,-1" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />,
  motion: <path d="M0,0 L-14,0 M2,-5 L-10,-5 M2,5 L-10,5" stroke={INK} strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />,
  sparkle: (
    <g fill="#f2d16b" stroke={INK} strokeWidth="0.5">
      <path d="M0,-6 L1.4,-1.4 L6,0 L1.4,1.4 L0,6 L-1.4,1.4 L-6,0 L-1.4,-1.4 Z" />
      <path transform="translate(9 -7) scale(0.55)" d="M0,-6 L1.4,-1.4 L6,0 L1.4,1.4 L0,6 L-1.4,1.4 L-6,0 L-1.4,-1.4 Z" />
    </g>
  ),
  steam: <path d="M0,0 C-3,-4 3,-7 0,-11 M5,-1 C2,-5 8,-8 5,-12" fill="none" stroke="#b7aeb4" strokeWidth="1.2" strokeLinecap="round" />,
  anger: <path d="M-4,-4 L-1,-1 M4,-4 L1,-1 M-4,4 L-1,1 M4,4 L1,1" stroke="#c9433f" strokeWidth="1.6" strokeLinecap="round" />,
};

// ---- places ----------------------------------------------------------------------------------

const SKY = '#d9e9ef';
const GRASS = '#bcd59c';
const COBBLE = '#dccdb0';

/** Sky above, ground below: every place outside starts from these. */
function Outdoors({ ground = GRASS, sky = SKY }: { ground?: string; sky?: string }) {
  return (
    <g>
      <rect x="0" y="0" width="240" height="100" fill={sky} />
      <rect x="0" y="100" width="240" height="14" fill={ground} />
      <path d="M-2,100 L242,100" {...ink} />
    </g>
  );
}

const Cloudlet = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0,0 C6,-6 18,-6 22,0 C30,-2 34,6 28,8 L-2,8 C-8,6 -6,-2 0,0 Z"
    fill="#fbfaf6"
    {...thin}
  />
);

/** A little house: walls, a roof, a window with a box of flowers, maybe a chimney with smoke. */
function House({ x, w, h, wall, roof, smoke = false }: { x: number; w: number; h: number; wall: string; roof: string; smoke?: boolean }) {
  const top = 100 - h;
  const wx = x + w * 0.3;
  const ww = w * 0.4;
  const wy = top + h * 0.26;
  return (
    <g>
      {smoke && (
        <g>
          <path d={`M${x + w * 0.72},${top - 6} L${x + w * 0.72},${top - 16} L${x + w * 0.84},${top - 16} L${x + w * 0.84},${top - 2}`} fill="#9c5a4a" {...thin} />
          <path d={`M${x + w * 0.78},${top - 18} C${x + w * 0.72},${top - 24} ${x + w * 0.88},${top - 28} ${x + w * 0.8},${top - 34}`} fill="none" stroke="#c8c2c6" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
      <path d={`M${x},100 L${x},${top} L${x + w},${top} L${x + w},100 Z`} fill={wall} {...thin} />
      <path d={`M${x - 4},${top + 1} L${x + w / 2},${top - w * 0.42} L${x + w + 4},${top + 1} Z`} fill={roof} {...thin} />
      <path d={`M${wx},${wy} L${wx + ww},${wy} L${wx + ww},${wy + h * 0.26} L${wx},${wy + h * 0.26} Z`} fill="#fff1c9" {...thin} />
      <path d={`M${wx + ww / 2},${wy} L${wx + ww / 2},${wy + h * 0.26} M${wx},${wy + h * 0.13} L${wx + ww},${wy + h * 0.13}`} {...thin} />
      {/* a window box of flowers */}
      <path d={`M${wx - 2},${wy + h * 0.26} L${wx + ww + 2},${wy + h * 0.26} L${wx + ww + 1},${wy + h * 0.26 + 4} L${wx - 1},${wy + h * 0.26 + 4} Z`} fill="#8a5a3c" {...thin} />
      {[0.15, 0.4, 0.65, 0.9].map((f, i) => (
        <circle key={f} cx={wx + ww * f} cy={wy + h * 0.26 - 1.4} r="1.7" fill={i % 2 ? '#f2a6bb' : '#c95d7f'} stroke={INK} strokeWidth="0.4" />
      ))}
      <path d={`M${x + w * 0.4},100 L${x + w * 0.4},${100 - h * 0.28} L${x + w * 0.62},${100 - h * 0.28} L${x + w * 0.62},100`} fill="#a87a56" {...thin} />
      <circle cx={x + w * 0.57} cy={100 - h * 0.14} r="0.7" fill={INK} />
    </g>
  );
}

function Street() {
  return (
    <g>
      <Outdoors ground={COBBLE} />
      <Cloudlet x={146} y={20} />
      <Cloudlet x={30} y={10} s={0.7} />
      <House x={8} w={40} h={46} wall="#f3dcc6" roof="#c9705a" />
      <House x={60} w={46} h={56} wall="#efd3da" roof="#9c5a6e" smoke />
      <House x={194} w={38} h={50} wall="#eadfbe" roof="#b0805a" />
      {/* the cobbles */}
      <path d="M6,104 l9,0 M22,108 l10,0 M40,104 l9,0 M58,109 l10,0 M78,105 l9,0 M98,109 l10,0 M118,104 l9,0 M138,108 l10,0 M158,104 l9,0 M178,109 l10,0 M198,105 l9,0 M218,109 l10,0" stroke="#b9a582" strokeWidth="1.1" strokeLinecap="round" />
    </g>
  );
}

/** The window of the room the papers' pictures look into: its sky, its curtains, and its sill. */
function WindowWithSill({ x, w, top, sill }: { x: number; w: number; top: number; sill: number }) {
  return (
    <g>
      <path d={`M${x},${sill} L${x},${top + w / 2} A${w / 2},${w / 2} 0 0 1 ${x + w},${top + w / 2} L${x + w},${sill} Z`} fill={SKY} {...ink} />
      <path d={`M${x},${sill - 10} C${x + w * 0.3},${sill - 22} ${x + w * 0.6},${sill - 18} ${x + w},${sill - 14} L${x + w},${sill} L${x},${sill} Z`} fill="#a9c98c" />
      <Cloudlet x={x + w * 0.5} y={top + w * 0.35} s={0.6} />
      <path d={`M${x + w / 2},${top} L${x + w / 2},${sill} M${x},${top + w * 0.6} L${x + w},${top + w * 0.6}`} stroke="#9fae8a" strokeWidth="2.4" />
      <path d={`M${x},${sill} L${x},${top + w / 2} A${w / 2},${w / 2} 0 0 1 ${x + w},${top + w / 2} L${x + w},${sill}`} fill="none" stroke="#9fae8a" strokeWidth="3" />
      {/* curtains, tied back */}
      <path d={`M${x - 10},${top - 6} C${x - 4},${top + 20} ${x + 8},${sill - 30} ${x + 2},${sill - 16} C${x - 2},${sill - 8} ${x - 6},${sill} ${x - 10},${sill + 2} Z`} fill="#e58aa6" {...thin} />
      <path d={`M${x + w + 10},${top - 6} C${x + w + 4},${top + 20} ${x + w - 8},${sill - 30} ${x + w - 2},${sill - 16} C${x + w + 2},${sill - 8} ${x + w + 6},${sill} ${x + w + 10},${sill + 2} Z`} fill="#e58aa6" {...thin} />
      <path d={`M${x - 14},${top - 6} L${x + w + 14},${top - 6}`} stroke="#8a5a3c" strokeWidth="2.4" strokeLinecap="round" />
      {/* the sill: its top, where the pots stand; its thick front edge; its shadow on the wall; the moulding under it */}
      <path d={`M${x - 8},${sill - 6} L${x + w + 8},${sill - 6} L${x + w + 18},${sill + 1} L${x - 18},${sill + 1} Z`} fill="#dcb284" {...ink} />
      <path d={`M${x - 4},${sill - 4} L${x + w * 0.4},${sill - 4}`} stroke="#ecd0aa" strokeWidth="1.2" strokeLinecap="round" />
      <path d={`M${x - 18},${sill + 1} L${x + w + 18},${sill + 1} L${x + w + 18},${sill + 7} L${x - 18},${sill + 7} Z`} fill="#b07a4a" {...ink} />
      <path d={`M${x - 16},${sill + 7} L${x + w + 16},${sill + 7} L${x + w + 12},${sill + 11} L${x - 12},${sill + 11} Z`} fill="#000" opacity="0.12" />
      <path d={`M${x - 4},${sill + 7} L${x + w + 4},${sill + 7} L${x + w + 2},${sill + 12} L${x - 2},${sill + 12} Z`} fill="#fbf4e6" {...thin} />
      <path d={`M${x + 2},${sill + 12} L${x + w - 2},${sill + 12}`} stroke="#d8c3b4" strokeWidth="1.4" />
    </g>
  );
}

const Wallpaper = ({ h }: { h: number }) => (
  <g>
    <rect x="0" y="0" width="240" height={h} fill="#f3e0d6" />
    <g fill="#e5bfc9">
      {Array.from({ length: 6 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => <circle key={`${r}-${c}`} cx={c * 26 + (r % 2 ? 13 : 0)} cy={r * 18 + 8} r="1.4" />),
      )}
    </g>
  </g>
);

function SetBack({ set }: { set: SetKey }) {
  switch (set) {
    case 'street':
    case 'fog':
      return <Street />;
    case 'pond':
    case 'pinkpond':
      return (
        <g>
          <Outdoors />
          <Cloudlet x={170} y={16} />
          {[20, 52, 200, 226].map((x, i) => (
            <g key={x}>
              <path d={`M${x},80 L${x},70`} stroke="#6e4f30" strokeWidth="2.2" />
              <circle cx={x} cy={64 - (i % 2) * 4} r={10 + (i % 2) * 3} fill="#9cbf7e" {...thin} />
            </g>
          ))}
          <path d="M0,86 C40,76 80,74 120,76 C160,78 200,76 240,84 L240,100 L0,100 Z" fill="#a9c98c" {...thin} />
          <ellipse cx="120" cy="101" rx="110" ry="13" fill={set === 'pinkpond' ? '#f3a6bf' : '#9fc3d3'} {...ink} />
          <path d="M60,99 l18,0 M120,104 l22,0 M170,98 l16,0" stroke="#fffaf0" strokeWidth="1.2" />
          {/* lily pads, one in flower */}
          <path d="M44,104 C38,104 38,99 44,99 C50,99 52,102 46,104 L44,101 Z M190,106 C184,106 184,101 190,101 C196,101 198,104 192,106 L190,103 Z" fill="#7fae6a" {...thin} />
          <circle cx="45" cy="100.6" r="1.8" fill="#f2a6bb" {...thin} />
          {/* reeds and bulrushes */}
          <path d="M14,100 C12,90 14,82 16,76 M20,100 C20,92 22,86 24,82 M226,100 C226,90 224,84 222,78 M232,100 C232,92 234,88 236,84" fill="none" stroke="#5d7a4a" strokeWidth="1.4" />
          <path d="M15,78 l0,-6 M222.6,80 l0,-6" stroke="#8a5a32" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 'hall':
      return (
        <g>
          <Outdoors ground={COBBLE} />
          <Cloudlet x={40} y={14} />
          <path d="M140,100 L140,40 L240,40 L240,100" fill="#efe3cc" {...thin} />
          <path d="M134,40 L190,14 L246,40 Z" fill="#a8564a" {...thin} />
          {/* the town clock on the pediment, stopped at 4:17 */}
          <circle cx="190" cy="31" r="6.4" fill="#fffaf0" {...thin} />
          <path d="M190,31 L193,32.6 M190,31 L191.4,26" stroke={INK} strokeWidth="0.9" strokeLinecap="round" />
          <path d="M156,100 L156,48 M224,100 L224,48" {...thin} />
          <path d="M162,52 L174,52 L174,64 L162,64 Z M206,52 L218,52 L218,64 L206,64 Z" fill="#fff1c9" {...thin} />
          <path d="M183,100 L183,80 C183,73 197,73 197,80 L197,100" fill="#8a5a3c" {...thin} />
          <path d="M176,100 L204,100 L204,97 L176,97 Z" fill="#d6c8ae" {...thin} />
          <path d="M146,60 L146,40" {...thin} />
          <path d="M146,40 C150,39 153,42 157,41 L157,47 C153,48 150,45 146,46 Z" fill="#fffaf0" {...thin} />
          <path d="M146,46 C150,45 153,48 157,47 L157,53 C153,54 150,51 146,52 Z" fill="#c9433f" {...thin} />
        </g>
      );
    case 'meadow':
      return (
        <g>
          <Outdoors />
          <Cloudlet x={30} y={14} />
          <Cloudlet x={180} y={24} s={0.8} />
          <path d="M0,76 C50,62 110,60 160,66 C200,70 220,70 240,68 L240,100 L0,100 Z" fill="#c9dfab" {...thin} />
          {/* a fence along the far side */}
          <path d="M150,80 L240,76 M150,86 L240,82" stroke="#a87a56" strokeWidth="1.2" />
          {[156, 172, 188, 204, 220, 236].map((x) => (
            <path key={x} d={`M${x},${88 - (x - 150) / 22} L${x},${76 - (x - 150) / 22}`} stroke="#8a5a3c" strokeWidth="1.6" />
          ))}
          <path d="M20,100 l2,-6 l2,6 M64,100 l2,-7 l2,7 M140,100 l2,-6 l2,6 M200,100 l2,-7 l2,7 M226,100 l2,-5 l2,5" fill="none" stroke="#5d7a4a" strokeWidth="1.2" />
          {[[44, 90, '#f2a6bb'], [70, 94, '#fffaf0'], [120, 92, '#f2d16b'], [182, 92, '#fffaf0'], [100, 96, '#b9a3e3'], [214, 95, '#f2a6bb']].map(([x, y, c]) => (
            <circle key={`${x}`} cx={x as number} cy={y as number} r="1.8" fill={c as string} stroke={INK} strokeWidth="0.4" />
          ))}
          {/* a butterfly */}
          <path d="M96,40 C92,36 88,38 90,42 C92,44 95,42 96,40 C100,36 104,38 102,42 C100,44 97,42 96,40 Z" fill="#f2d16b" {...thin} />
        </g>
      );
    case 'night':
      return (
        <g>
          <rect x="0" y="0" width="240" height="114" fill="#3a3550" />
          <path d="M30,20 l0,4 M28,22 l4,0 M90,12 l0,4 M88,14 l4,0 M200,24 l0,4 M198,26 l4,0 M160,8 l0,3 M158.5,9.5 l3,0 M60,40 l0,3 M58.5,41.5 l3,0 M224,50 l0,3 M222.5,51.5 l3,0" stroke="#fff6dc" strokeWidth="1" />
          {/* the town asleep, a few windows still lit */}
          <path d="M0,100 L0,78 L14,70 L28,78 L28,100 M150,100 L150,74 L168,64 L186,74 L186,100 M200,100 L200,80 L214,72 L228,80 L228,100" fill="#2a2640" stroke="#4a4466" strokeWidth="0.8" />
          <path d="M10,84 L16,84 L16,90 L10,90 Z M162,80 L170,80 L170,87 L162,87 Z M210,86 L216,86 L216,92 L210,92 Z" fill="#f6d27a" />
          <rect x="0" y="100" width="240" height="14" fill="#2c2840" />
          <path d="M0,100 L240,100" stroke="#fff6dc" strokeWidth="1.2" opacity="0.6" />
        </g>
      );
    case 'room':
      return (
        <g>
          <Wallpaper h={76} />
          <rect x="0" y="76" width="240" height="38" fill="#c79b6d" />
          <path d="M0,71 L240,71 L240,76 L0,76 Z" fill="#fbf4e6" {...thin} />
          <path d="M30,76 L18,114 M90,76 L84,114 M150,76 L156,114 M210,76 L222,114" stroke={INK} strokeWidth="0.6" opacity="0.4" />
          <path d="M170,10 L220,10 L220,52 L170,52 Z" fill={SKY} {...thin} />
          <path d="M195,10 L195,52 M170,31 L220,31" stroke="#9fae8a" strokeWidth="2" />
          {/* a little painting on the wall: a bratek in a garden, under a pale sky */}
          <path d="M22,12 L35,4 L48,12" fill="none" stroke={INK} strokeWidth="0.7" />
          <circle cx="35" cy="4" r="1.2" fill="#8a5a3c" />
          <path d="M18,12 L52,12 L52,42 L18,42 Z" fill="#c9a45c" {...thin} />
          <path d="M22,16 L48,16 L48,38 L22,38 Z" fill="#dcebf0" {...thin} />
          <path d="M22,30 C30,26 40,26 48,29 L48,38 L22,38 Z" fill="#b9d49a" />
          <circle cx="43" cy="21" r="2.6" fill="#f6d27a" />
          <path d="M33,37 C33,33 34,30 35,28" fill="none" stroke="#5d7a4a" strokeWidth="0.9" />
          <path d="M31,32 C29,30 30,28 32,29 Z M37,31 C39,29 38,27 36,28.6 Z" fill="#7fa36a" />
          <circle cx="33" cy="25.6" r="2.2" fill="#2c1733" />
          <circle cx="37" cy="25.6" r="2.2" fill="#2c1733" />
          <circle cx="35" cy="28.4" r="2.4" fill="#f0a8c0" />
          <circle cx="35" cy="27.6" r="0.8" fill="#f2d16b" />
          <path d="M22,16 L48,16 L48,38 L22,38 Z" fill="none" {...thin} />
        </g>
      );
    case 'sill':
      return (
        <g>
          <Wallpaper h={114} />
          <WindowWithSill x={60} w={120} top={6} sill={101} />
        </g>
      );
    case 'roomsill':
      return (
        <g>
          <Wallpaper h={76} />
          <rect x="0" y="76" width="240" height="38" fill="#c79b6d" />
          <path d="M0,71 L240,71 L240,76 L0,76 Z" fill="#fbf4e6" {...thin} />
          <path d="M150,76 L156,114 M210,76 L222,114" stroke={INK} strokeWidth="0.6" opacity="0.4" />
          <WindowWithSill x={22} w={78} top={2} sill={56} />
        </g>
      );
    case 'snow':
      return (
        <g>
          <rect x="0" y="0" width="240" height="114" fill="#cfe1ee" />
          {/* far hills under snow, and the village on them: snowy roofs, lit windows, a chimney smoking */}
          <path d="M0,70 C40,56 80,58 120,64 C160,70 200,56 240,62 L240,100 L0,100 Z" fill="#eef3f8" {...thin} />
          <path d="M0,76 C40,66 70,68 100,74 L100,100 L0,100 Z" fill="#dde8f1" />
          <g>
            <path d="M92,66 L92,58 L100,52 L108,58 L108,66 Z M112,66 L112,60 L119,55 L126,60 L126,66 Z" fill="#efd3da" {...thin} />
            <path d="M89,59 L100,50 L111,59 C104,57 96,57 89,59 Z M109,61 L119,53 L129,61 C123,59 115,59 109,61 Z" fill="#fbfbf8" {...thin} />
            <path d="M98,60 L102,60 L102,64 L98,64 Z M117,61 L121,61 L121,64 L117,64 Z" fill="#f6d27a" />
            <path d="M104,52 L104,47 L106,47 L106,53" fill="#9c5a4a" {...thin} />
            <path d="M105,45 C102,41 108,39 105,35" fill="none" stroke="#c8c2c6" strokeWidth="1.6" strokeLinecap="round" />
          </g>
          {/* snowy pines: snow lies on every layer of branches */}
          {[
            [26, 1],
            [52, 0.75],
            [204, 1.15],
          ].map(([x, k]) => (
            <g key={x} transform={`translate(${x} 96) scale(${k})`}>
              <path d="M-2,0 L-2,-8 L2,-8 L2,0 Z" fill="#6e4f30" {...thin} />
              <path d="M-16,-8 L0,-26 L16,-8 Z" fill="#4f7a5a" {...thin} />
              <path d="M-13,-20 L0,-38 L13,-20 Z" fill="#4f7a5a" {...thin} />
              <path d="M-10,-32 L0,-50 L10,-32 Z" fill="#4f7a5a" {...thin} />
              <path d="M-16,-8 C-12,-12 -8,-9 -5,-12 C-2,-9 2,-12 5,-10 C8,-13 12,-10 16,-8 L10,-15 C6,-13 -6,-13 -10,-15 Z" fill="#fbfbf8" {...thin} />
              <path d="M-13,-20 C-10,-24 -6,-21 -3,-24 C0,-21 3,-24 6,-22 C9,-25 11,-22 13,-20 L8,-27 C4,-25 -4,-25 -8,-27 Z" fill="#fbfbf8" {...thin} />
              <path d="M-10,-32 C-7,-35 -4,-33 -1,-35 C2,-33 5,-35 10,-32 L4,-42 C2,-40 -2,-40 -4,-42 Z" fill="#fbfbf8" {...thin} />
              <path d="M-3,-44 L0,-50 L3,-44 C1,-45 -1,-45 -3,-44 Z" fill="#fbfbf8" {...thin} />
            </g>
          ))}
          {/* the snowman, in a red scarf */}
          <g transform="translate(228 96)">
            <circle cx="0" cy="-7" r="8" fill="#fbfbf8" {...ink} />
            <circle cx="0" cy="-19" r="5.6" fill="#fbfbf8" {...ink} />
            <circle cx="-1.8" cy="-20" r="0.8" fill={INK} />
            <circle cx="1.8" cy="-20" r="0.8" fill={INK} />
            <path d="M0,-18.6 L4,-17.6 L0,-17.2 Z" fill="#e08a3c" />
            <path d="M-5,-14.6 C-2,-13 2,-13 5,-14.6 L5,-12.6 C2,-11 -2,-11 -5,-12.6 Z M3,-13 L5,-7 L2.6,-7 L1.6,-12 Z" fill="#c9433f" {...thin} />
            <path d="M-4,-24 L4,-24 L3,-29 L-3,-29 Z M-5.4,-24 L5.4,-24" fill="#2b2229" {...thin} />
          </g>
          {/* the ground, deep in snow, with a sled left in it */}
          <path d="M0,94 C60,88 180,88 240,94 L240,114 L0,114 Z" fill="#fbfbf8" {...ink} />
          <path d="M20,104 C60,100 100,101 140,104 M150,108 C180,106 210,106 236,108" fill="none" stroke="#d4e2ee" strokeWidth="2" strokeLinecap="round" />
          <g transform="translate(176 104) scale(0.6)">
            <path d="M-24,-8 L20,-8 L20,-12 L-24,-12 Z" fill="#b8433f" {...thin} />
            <path d="M-20,-8 L-20,0 M16,-8 L16,0 M-28,0 C-30,-4 -28,-6 -26,-6 M-28,0 L24,0 C28,0 30,-4 28,-6" fill="none" {...ink} />
          </g>
          {/* paw prints, leading in from the left */}
          <g fill="#c4d4e2">
            {[[8, 106], [16, 103], [24, 107], [32, 104], [40, 108], [48, 105]].map(([x, y]) => (
              <g key={`${x}`} transform={`translate(${x} ${y})`}>
                <ellipse cx="0" cy="0" rx="1.6" ry="1.2" />
                <circle cx="-1.4" cy="-1.6" r="0.6" />
                <circle cx="0" cy="-2" r="0.6" />
                <circle cx="1.4" cy="-1.6" r="0.6" />
              </g>
            ))}
          </g>
          {/* and still falling */}
          <g fill="#ffffff" stroke="#9fb3c4" strokeWidth="0.4">
            {[[20, 14, 2.2], [56, 30, 1.6], [92, 10, 2], [130, 30, 1.4], [168, 18, 2.4], [150, 44, 1.6], [228, 8, 1.8], [40, 48, 1.4], [76, 40, 2], [190, 40, 1.6], [112, 18, 1.2], [214, 28, 1.2]].map(([x, y, r]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
            ))}
          </g>
        </g>
      );
    case 'attic':
      return (
        <g>
          <rect x="0" y="0" width="240" height="114" fill="#e2c9a4" />
          <path d="M0,40 L120,4 L240,40 L240,0 L0,0 Z" fill="#b08a62" {...ink} />
          <path d="M40,28 L40,100 M200,28 L200,100" stroke="#8a5a32" strokeWidth="3" />
          <circle cx="120" cy="44" r="12" fill="#3e3a5c" {...ink} />
          <path d="M124,38 C120,40 119,46 122,49 C117,48 115,42 118,39 C119,37 122,37 124,38 Z" fill="#f6efd9" />
          <path d="M108,44 L132,44 M120,32 L120,56" stroke="#8a5a32" strokeWidth="1.4" />
          {/* boxes in the corner */}
          <path d="M210,100 L210,84 L232,84 L232,100 Z M214,84 L214,72 L232,72 L232,84 Z" fill="#c9a070" {...thin} />
          <path d="M210,90 L232,90" stroke="#9a6f3e" strokeWidth="0.8" />
          <rect x="0" y="100" width="240" height="14" fill="#a77b52" />
          <path d="M0,100 L240,100" {...ink} />
          <path d="M40,106 L240,106" stroke="#8a5a32" strokeWidth="0.6" opacity="0.6" />
        </g>
      );
    case 'willow':
      return (
        <g>
          <Outdoors />
          <Cloudlet x={60} y={18} />
          <path d="M0,82 C40,66 90,64 130,72 C170,80 200,70 240,74 L240,100 L0,100 Z" fill="#c9dfab" {...thin} />
          {/* the pond, off to the left, behind where anyone stands */}
          <ellipse cx="22" cy="95" rx="30" ry="4.4" fill="#9fc3d3" {...thin} />
          <path d="M10,95 l10,0" stroke="#fffaf0" strokeWidth="1" />
          <path d="M44,96 C43,90 44,86 46,82 M48,96 C48,91 50,88 52,86" fill="none" stroke="#5d7a4a" strokeWidth="1.2" />
          {/* the willow: a tall trunk, a rounded crown up high, and long branches hanging from it */}
          <ellipse cx="206" cy="101" rx="30" ry="3" fill="#000" opacity="0.1" />
          <path d="M200,100 C203,84 204,62 207,40 L215,40 C214,62 215,84 220,100 Z" fill="#7a5638" {...ink} />
          <path d="M207,58 C200,52 194,50 188,50 M213,52 C220,46 226,44 232,45" fill="none" stroke="#7a5638" strokeWidth="2.4" strokeLinecap="round" />
          {/* the office sign, nailed to the trunk */}
          <path d="M198,70 L222,68 L222,76 L198,78 Z" fill="#fbf4e6" {...thin} />
          <path d="M202,73 L218,71.6" stroke={INK} strokeWidth="1.4" />
          <path d="M162,44 C160,22 182,6 208,6 C232,6 246,20 246,38 C246,46 240,50 232,50 L172,52 C166,52 162,50 162,44 Z" fill="#9cbf7e" {...ink} />
          <path d="M176,26 C184,16 196,12 206,12" fill="none" stroke="#b6d39a" strokeWidth="2" strokeLinecap="round" />
          <g fill="none" strokeLinecap="round">
            {[166, 174, 182, 190, 198, 226, 234, 242].map((x, k) => (
              <path key={x} d={`M${x},48 C${x - 2},${58 + (k % 3) * 4} ${x - 1},${66 + (k % 2) * 6} ${x + 1},${72 + (k % 3) * 5}`} stroke={k % 2 ? '#7aa25e' : '#8fb571'} strokeWidth="2.6" />
            ))}
          </g>
        </g>
      );
    case 'hive':
      return (
        <g>
          <rect x="0" y="0" width="240" height="100" fill="#f7e2a0" />
          <g opacity="0.7">
            {Array.from({ length: 6 }, (_, r) =>
              Array.from({ length: 12 }, (_, c) => (
                <path key={`${r}-${c}`} d={`M${c * 22 + (r % 2 ? 11 : 0)},${r * 19 + 8} l6,-8 h10 l6,8 l-6,8 h-10 Z`} fill="#f2c94c" stroke="#b07a1e" strokeWidth="0.8" />
              )),
            )}
          </g>
          {/* the first front page, framed on the wall */}
          <path d="M150,18 L190,18 L190,50 L150,50 Z" fill="#8a5a3c" {...thin} />
          <path d="M154,22 L186,22 L186,46 L154,46 Z" fill="#f2c94c" {...thin} />
          <path d="M158,27 L182,27" stroke={INK} strokeWidth="2.4" />
          <path d="M158,33 L182,33 M158,37 L176,37 M158,41 L180,41" stroke={INK} strokeWidth="0.6" />
          {/* a lamp hanging over the desk */}
          <path d="M200,0 L200,20" {...thin} />
          <path d="M192,28 L208,28 L204,20 L196,20 Z" fill="#3b2a33" {...thin} />
          <path d="M190,30 L210,30 L218,52 L182,52 Z" fill="#fff3c4" opacity="0.45" />
          <rect x="0" y="100" width="240" height="14" fill="#c08a4e" />
          <path d="M0,100 L240,100" {...ink} />
          <path d="M40,100 L36,114 M110,100 L108,114 M180,100 L184,114" stroke={INK} strokeWidth="0.6" opacity="0.5" />
        </g>
      );
    case 'kitchen':
      return (
        <g>
          <rect x="0" y="0" width="240" height="100" fill="#f4e6cf" />
          <path d="M0,60 L240,60" stroke="#e6d2b4" strokeWidth="0.8" />
          <rect x="0" y="100" width="240" height="14" fill="#c79b6d" />
          <path d="M20,18 L70,18 L70,58 L20,58 Z" fill={SKY} {...thin} />
          <path d="M45,18 L45,58" stroke="#9fae8a" strokeWidth="2" />
          <path d="M14,16 C22,30 22,46 18,60 M76,16 C68,30 68,46 72,60" fill="none" stroke="#e58aa6" strokeWidth="3" strokeLinecap="round" />
          {/* a shelf of jars, and pans on hooks */}
          <path d="M100,30 L190,30 L190,33 L100,33 Z" fill="#8a5a32" {...thin} />
          {[108, 124, 140, 156].map((x, i) => (
            <g key={x}>
              <path d={`M${x - 5},30 L${x - 5},${20 - (i % 2) * 3} L${x + 5},${20 - (i % 2) * 3} L${x + 5},30 Z`} fill={['#f2c94c', '#e58aa6', '#b9a3e3', '#c9433f'][i]} {...thin} />
              <path d={`M${x - 6},${20 - (i % 2) * 3} L${x + 6},${20 - (i % 2) * 3} L${x + 6},${17 - (i % 2) * 3} L${x - 6},${17 - (i % 2) * 3} Z`} fill="#fbf4e6" {...thin} />
            </g>
          ))}
          <path d="M200,10 L200,20 M216,10 L216,22" {...thin} />
          <circle cx="200" cy="26" r="6" fill="#b5ada4" {...thin} />
          <circle cx="216" cy="29" r="7" fill="#c08a5a" {...thin} />
          {/* the table, with a checked cloth */}
          <path d="M98,72 L222,72 L222,82 L98,82 Z" fill="#fbf4e6" {...thin} />
          <g fill="#e58aa6" opacity="0.8">
            {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${100 + i * 10},72 L${105 + i * 10},72 L${105 + i * 10},77 L${100 + i * 10},77 Z`} />)}
          </g>
          <path d="M110,82 L110,100 M210,82 L210,100" stroke="#8a5a32" strokeWidth="2.4" />
          <path d="M0,100 L240,100" {...ink} />
        </g>
      );
    case 'hill':
      return (
        <g>
          <rect x="0" y="0" width="240" height="114" fill="#3e3a5c" />
          <path d="M40,8 l0,5 M37.5,10.5 l5,0 M120,20 l0,4 M118,22 l4,0 M210,14 l0,5 M207.5,16.5 l5,0 M90,40 l0,3 M88.5,41.5 l3,0" stroke="#fff6dc" strokeWidth="1" />
          <path d="M150,92 L150,84 L156,80 L162,84 L162,92 M170,94 L170,86 L176,82 L182,86 L182,94" fill="#2a2640" stroke="#4a4466" strokeWidth="0.6" />
          <path d="M154,86 L158,86 L158,89 L154,89 Z M174,88 L178,88 L178,91 L174,91 Z" fill="#f6d27a" />
          <path d="M0,96 C60,70 140,62 240,84 L240,114 L0,114 Z" fill="#5b6b4e" {...ink} />
          <path d="M20,96 l2,-5 l2,5 M110,74 l2,-5 l2,5 M200,82 l2,-5 l2,5" fill="none" stroke="#7d9068" strokeWidth="1" />
        </g>
      );
    case 'orchard':
      return (
        <g>
          <Outdoors />
          <Cloudlet x={150} y={10} s={0.8} />
          <path d="M0,86 L240,82 M0,92 L240,88" stroke="#a87a56" strokeWidth="1.2" />
          {[30, 120, 210].map((x) => (
            <g key={x}>
              <path d={`M${x},100 L${x},62`} stroke="#6e4f30" strokeWidth="4" />
              <path d={`M${x},74 L${x - 8},64 M${x},70 L${x + 9},60`} stroke="#6e4f30" strokeWidth="2" />
              <circle cx={x} cy="50" r="22" fill="#9fbf8a" {...thin} />
              <path d={`M${x - 12},40 C${x - 6},32 ${x + 4},32 ${x + 8},36`} fill="none" stroke="#bcd8a8" strokeWidth="2" strokeLinecap="round" />
              <circle cx={x - 8} cy="46" r="2.4" fill="#c9433f" {...thin} />
              <circle cx={x + 9} cy="54" r="2.4" fill="#c9433f" {...thin} />
              <circle cx={x + 2} cy="40" r="2.4" fill="#c9433f" {...thin} />
            </g>
          ))}
          <circle cx="60" cy="102" r="2.4" fill="#c9433f" {...thin} />
          <circle cx="166" cy="104" r="2.4" fill="#c9433f" {...thin} />
        </g>
      );
    default:
      return <Outdoors />;
  }
}

function SetFront({ set }: { set: SetKey }) {
  if (set === 'fog') {
    return (
      <g fill="#f8f4ec">
        <rect x="0" y="0" width="240" height="114" opacity="0.4" />
        <path d="M0,70 C40,62 80,74 120,66 C160,58 200,72 240,64 L240,86 L0,86 Z" opacity="0.55" />
        <path d="M0,96 C50,90 110,100 160,94 C200,90 220,96 240,94 L240,108 L0,108 Z" opacity="0.4" />
      </g>
    );
  }
  return null;
}



// ---- putting a scene together ---------------------------------------------------------------

/** A flower in its own pot, as on her shelves: rooted at the rim, standing on (0,0). */
function PottedPlant({ species }: { species: SpeciesId }) {
  const pot = SPECIES[species].pot;
  return (
    <g transform={`translate(0 ${-POT_HEIGHT[pot]})`}>
      <Potted kind={pot}>
        <PlantArt species={species} stage="bloom" rim={RIM[pot][0]} />
      </Potted>
    </g>
  );
}

/**
 * The two dogs in their basket, as in her room. The basket is the room's own, drawn here without
 * the shadow it has in the room: lying flat on the floor, it casts none.
 */
const DogsInBed = () => (
  <g transform="translate(-210 -858)">
    <ellipse className="ink" cx="210" cy="812" rx="170" ry="44" fill="#d07a8c" />
    <path d="M58,800 C90,776 150,770 210,770 C270,770 330,776 362,800" fill="none" stroke="#dc8f9c" strokeWidth="3" strokeLinecap="round" />
    <ellipse className="ink" cx="210" cy="818" rx="146" ry="26" fill="#f1e0d0" />
    <path d="M76,812 C120,826 300,828 344,812 C330,836 260,844 210,844 C150,844 90,834 76,812 Z" fill="#dfc5b0" opacity="0.6" />
    <Dogs mood="day" />
    <path className="ink" fill="#d07a8c" d="M40,812 A170,44 0 0 0 380,812 L356,818 A146,26 0 0 1 64,818 Z" />
    <path d="M62,832 C110,850 310,850 358,832" fill="none" stroke="#a45264" strokeWidth="1.4" strokeDasharray="4 4" strokeLinecap="round" />
  </g>
);

/** How each thing is drawn, and how big by default, so a scene only says where things stand. */
function base(a: Actor): { node: ReactNode; s: number } {
  const [head, rest] = a.split(':') as [string, string | undefined];
  if ((VISITOR_IDS as readonly string[]).includes(head)) return { node: <VisitorArt id={head as VisitorId} mood={(rest as VisitorMood | undefined) ?? 'waiting'} />, s: 0.52 };
  if (head === 'plant') return { node: <PlantArt species={rest as SpeciesId} stage="bloom" />, s: 0.6 };
  if (head === 'pot') return { node: <PottedPlant species={rest as SpeciesId} />, s: 0.42 };
  if (MARKS[a]) return { node: MARKS[a], s: 1 };
  const things: Record<string, [ReactNode, number]> = {
    jezyk: [<PanJezyk />, 0.55],
    'jezyk-happy': [<PanJezyk mood="happy" />, 0.55],
    'jezyk-asleep': [<PanJezyk mood="asleep" />, 0.55],
    cma: [<PaniCma />, 0.5],
    'cma-happy': [<PaniCma mood="happy" />, 0.5],
    milton: [<Milton />, 0.9],
    dogs: [<DogsInBed />, 0.36],
    'dogs-out': [<g transform="translate(-210 -848)"><Dogs mood="day" /></g>, 0.4],
    stall: [<Stall night={false} keeper={<PanJezyk />} />, 0.34],
    'night-stall': [<Stall night keeper={<PaniCma />} />, 0.34],
    borsuk: [<Borsuk />, 0.95],
    'borsuk-bee': [<Borsuk bee />, 0.95],
    trzmielina: [<Trzmielina />, 0.95],
    'trzmielina-camera': [<Trzmielina camera />, 0.95],
    snail: [<Snail />, 1],
    beetle: [<Beetle />, 1],
    mole: [<Mole />, 1],
    owl: [<Owl />, 1],
    'owl-hat': [<Owl hat />, 1],
    'owl-asleep': [<Owl asleep />, 1],
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
    'newspaper-bee': [
      <g>
        <path d="M-12,0 L12,-2 L13,-16 L-11,-14 Z" fill="#f2c94c" {...thin} />
        <path d="M-8,-11 L6,-12" stroke={INK} strokeWidth="1.6" />
        <path d="M-8,-7.6 L9,-9 M-8,-4.6 L9,-6" stroke={INK} strokeWidth="0.6" />
      </g>,
      1,
    ],
    letters: [
      <g>
        <g transform="rotate(-8)"><Letter /></g>
        <g transform="translate(9 -3) rotate(10)"><Letter /></g>
        <g transform="translate(3 -9) rotate(-2)"><Letter /></g>
      </g>,
      1,
    ],
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
    lace: [<Lace />, 1],
    cobweb: [<Cobweb />, 1],
    teacup: [<Teacup />, 1],
    basket: [<Basket />, 1],
    bush: [<Bush />, 1],
    puddle: [<Puddle />, 1],
  };
  const t = things[a];
  return t ? { node: t[0], s: t[1] } : { node: null, s: 1 };
}

/** Things that cast no shadow of their own on the ground: drawn with one already, or not standing on it. */
const NO_SHADOW = new Set<string>([
  ...VISITOR_IDS, 'borsuk', 'borsuk-bee', 'milton', 'dogs', 'stall', 'night-stall', 'hole', 'moon', 'cloud', 'stars', 'notes', 'bridge', 'ribbon', 'puddle', 'lace', 'cobweb', 'firefly',
  'dogs-out', 'trzmielina', 'trzmielina-camera', 'wasp', 'mole', 'leaf', 'flag', 'lamppost', 'lamppost-jumper', 'clocktower', 'sunflower', 'flute', 'broom',
  // flat on the ground: nothing to cast a shadow
  'socks', 'letter', 'letters', 'map', 'newspaper', 'newspaper-bee', 'nuts', 'lettuce', 'seeds',
]);
/** How wide a shadow each thing casts, before scaling. */
const SHADOW: Record<string, number> = { 'dogs-out': 110, jezyk: 26, 'jezyk-happy': 26, 'jezyk-asleep': 26, cma: 26, 'cma-happy': 26, pumpkin: 40, desk: 34, bench: 30, typewriter: 20, scales: 26, owl: 16, 'owl-hat': 16, 'owl-asleep': 16, squirrel: 14, snail: 20, beetle: 20, cricket: 10, stone: 20, 'stone-mayor': 20, barrel: 12, cauldron: 15, basket: 12, bush: 20, crow: 18, ants: 26 };

/** The scene, drawn in the 240 by 114 frame. */
export function ShotArt({ shot }: { shot: Shot }) {
  const set = shot.set ?? 'meadow';
  return (
    <g>
      <SetBack set={set} />
      {shot.cast.map((p, i) => {
        const { node, s } = base(p.a);
        const k = (p.s ?? 1) * s;
        const shadow = !p.y && !NO_SHADOW.has(p.a.split(':')[0]!) && !MARKS[p.a];
        const w = (SHADOW[p.a] ?? (p.a.startsWith('pot:') ? 34 : p.a.startsWith('plant:') ? 18 : 14)) * k;
        return (
          <g key={i}>
            {shadow && <ellipse cx={p.x} cy={GROUND - (p.y ?? 0) + 0.6} rx={w} ry={Math.max(1.6, w * 0.14)} fill="#000" opacity="0.12" />}
            <g transform={`translate(${p.x} ${GROUND - (p.y ?? 0)}) scale(${p.flip ? -k : k} ${k})`}>{node}</g>
          </g>
        );
      })}
      <SetFront set={set} />
    </g>
  );
}

/**
 * A picture for the paper. Still, like a photograph: nothing in it moves. `tone`: faded colour
 * newsprint for the Kurier, loud colour for Brzęczyk.
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
        <rect x="0" y="0" width={FRAME_W} height={FRAME_H} fill={`url(#${id})`} opacity="0.08" pointerEvents="none" />
      </svg>
    </div>
  );
}
