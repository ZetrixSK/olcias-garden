import type { ReactNode } from 'react';
import type { GardenPot } from '../garden/species';

export type PotKind = GardenPot | 'tiny-clay' | 'tiny-speckle' | 'tiny-pink';

const SOIL = '#4b3428';
const WET_SOIL = '#2c1d16';

/** From the rim (y=0) to where the pot stands. */
export const POT_HEIGHT: Record<PotKind, number> = {
  slim: 57,
  wide: 49,
  round: 52,
  cauldron: 48,
  teacup: 42,
  'tiny-clay': 24,
  'tiny-speckle': 24,
  'tiny-pink': 24,
};

/** The back of the rim and the soil inside it, drawn behind the plant. */
function Opening({ rim, color, wet }: { rim: number; color: string; wet: boolean }) {
  const ry = 2.8 + rim * 0.035;
  return (
    <g>
      <ellipse className="ink" cx="0" cy="-1" rx={rim} ry={ry} fill={color} />
      <ellipse cx="0" cy="-0.4" rx={rim - 3} ry={ry - 1} fill={wet ? WET_SOIL : SOIL} style={{ transition: 'fill 1.2s' }} />
      {wet ? (
        <path d={`M${-rim * 0.45},-1 l3,-0.4 M${rim * 0.2},-1.4 l2.4,0.2 M${rim * 0.5},0 l1.6,-0.3`} stroke="#8c7d78" strokeWidth="0.9" strokeLinecap="round" />
      ) : (
        <path d={`M${-rim * 0.5},-1 l2,-0.6 M${rim * 0.15},-1.6 l1.5,0.4 M${rim * 0.45},-0.2 l1.2,-0.5`} stroke="#6b4c3a" strokeWidth="0.9" strokeLinecap="round" />
      )}
    </g>
  );
}

function Front({ kind }: { kind: PotKind }) {
  switch (kind) {
    case 'slim':
      return (
        <g>
          <path className="ink" fill="#c4704e" d="M-20,8 L-16,55 C-6,57.5 6,57.5 16,55 L20,8 Z" />
          <path d="M8,9 L19,9 L15.5,54 C13,55 10,55.5 8,55.6 Z" fill="#a6563a" />
          <path d="M-15,14 L-12,50" stroke="#dc9270" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M-8,30 C-4,27 2,29 4,33 C0,36 -6,35 -8,30 Z M6,42 C9,40 12,42 12,45 C9,46 7,45 6,42 Z" fill="#ead6c4" opacity="0.32" />
          <path className="ink" fill="#cd7a57" d="M-24,-1 C-8,1.8 8,1.8 24,-1 L23,9 C8,11.5 -8,11.5 -23,9 Z" />
          <path d="M12,0 L23,0 L22,8.5 C18,9.2 15,9.6 12,9.8 Z" fill="#ad5d40" />
        </g>
      );
    case 'wide':
      return (
        <g>
          <path className="ink" fill="#2b2229" d="M-42,7 C-40,30 -32,44 -24,47 C-8,50 8,50 24,47 C32,44 40,30 42,7 Z" />
          <path d="M-36,14 C-35,26 -30,36 -24,41" stroke="#5a4a57" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M-31,18 C-30,24 -28,28 -26,31" stroke="#6e5d6b" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          {/* hand-painted pink scallops and dots */}
          <path
            d="M-38,15 q4.75,6 9.5,0 q4.75,6 9.5,0 q4.75,6 9.5,0 q4.75,6 9.5,0 q4.75,6 9.5,0 q4.75,6 9.5,0 q4.75,6 9.5,0 q4.75,6 9.5,0"
            fill="none"
            stroke="#e79ab4"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {[-33, -23.5, -14, -4.5, 5, 14.5, 24, 33.5].map((dx, i) => (
            <circle key={dx} cx={dx} cy={i % 2 ? 26 : 25} r="1.5" fill="#e79ab4" />
          ))}
          <path className="ink" fill="#352a33" d="M-46,-1 C-16,2.6 16,2.6 46,-1 L45,7 C16,10.6 -16,10.6 -45,7 Z" />
          <path d="M-42,3 C-30,4 -16,4.6 -2,4.8" stroke="#66556a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'round':
      return (
        <g>
          <path className="ink" fill="#ece2d1" d="M-27,6 C-38,18 -36,40 -22,50 C-8,53 8,53 22,50 C36,40 38,18 27,6 Z" />
          <path d="M14,8 C30,18 32,38 20,50 C24,40 24,22 14,8 Z" fill="#d3c4aa" />
          <path d="M-31,22 C-18,25 -6,21 6,24 C16,26 26,22 34,24" fill="none" stroke="#6e9692" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M-32,30 C-20,33 -8,29 6,32 C16,34 26,30 34,31" fill="none" stroke="#6e9692" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M-26,14 C-29,20 -29,28 -26,36" stroke="#fbf6ec" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path className="ink" fill="#f2eadc" d="M-30,-1 C-10,2 10,2 30,-1 L29,6 C10,8.6 -10,8.6 -29,6 Z" />
        </g>
      );
    case 'cauldron':
      return (
        <g>
          <path className="ink" fill="#2b2531" d="M-20,40 L-23,48 L-14,47 L-12,42 Z M20,40 L23,48 L14,47 L12,42 Z" />
          <path className="ink" fill="#2b2531" d="M-30,5 C-37,17 -35,33 -22,41 C-8,46 8,46 22,41 C35,33 37,17 30,5 Z" />
          <path d="M-27,14 C-30,22 -28,31 -21,37" stroke="#594d61" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M-2,20 A6,6 0 1 0 -2,32 A4.2,6 0 1 1 -2,20 Z" fill="#e79ab4" />
          <path d="M8,22 l0.6,1.8 l1.8,0.6 l-1.8,0.6 l-0.6,1.8 l-0.6,-1.8 l-1.8,-0.6 l1.8,-0.6 Z" fill="#e79ab4" />
          <ellipse className="ink" cx="-33" cy="9" rx="3.4" ry="4.6" fill="none" strokeWidth="2.2" />
          <ellipse className="ink" cx="33" cy="9" rx="3.4" ry="4.6" fill="none" strokeWidth="2.2" />
          <path className="ink" fill="#3a3341" d="M-33,-1 C-12,3 12,3 33,-1 L32,5.4 C12,9 -12,9 -32,5.4 Z" />
          <path d="M-30,2.4 C-16,4.6 -4,5 6,5" stroke="#6a5c70" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'teacup':
      return (
        <g>
          <ellipse className="ink" cx="0" cy="38" rx="38" ry="5" fill="#ede0cc" />
          <path d="M-30,38 C-16,41 16,41 30,38" stroke="#e79ab4" strokeWidth="1.4" fill="none" />
          <path className="ink" fill="none" strokeWidth="1.5" d="M26,7 C40,4 43,22 25,25" />
          <path d="M26,7 C40,4 43,22 25,25" stroke="#f5ecdf" strokeWidth="3.4" fill="none" />
          <path className="ink" fill="none" strokeWidth="1.5" d="M27.4,10 C36,9 37,20 26.4,21.6" />
          <path className="ink" fill="#f5ecdf" d="M-28,3 C-28,22 -18,36 0,36 C18,36 28,22 28,3 Z" />
          <path d="M14,6 C24,14 22,28 10,34 C18,26 19,14 14,6 Z" fill="#e4d6c2" />
          {[[-16, 16, '#e58fa8'], [-4, 24, '#a7b79a'], [8, 15, '#e58fa8'], [-10, 30, '#e58fa8'], [16, 25, '#a7b79a']].map(([x, y, c]) => (
            <g key={`${x}`} transform={`translate(${x} ${y})`}>
              <circle r="2.4" fill={c as string} />
              <circle r="0.9" fill="#fbf2e6" />
            </g>
          ))}
          <path className="ink" fill="#f9f2e8" d="M-30,-1 C-10,2.6 10,2.6 30,-1 L29,4 C10,7.2 -10,7.2 -29,4 Z" />
          <path d="M-28.6,3.6 C-10,6.6 10,6.6 28.6,3.6" stroke="#e58fa8" strokeWidth="1.2" fill="none" />
        </g>
      );
    case 'tiny-clay':
      return (
        <g>
          <path className="ink" fill="#c4704e" d="M-12,5 L-9,23 C-3,24.5 3,24.5 9,23 L12,5 Z" />
          <path d="M4,6 L11,6 L8.6,22.6 C7,23 5.5,23.2 4,23.3 Z" fill="#a6563a" />
          <path className="ink" fill="#cd7a57" d="M-14.5,-1 C-5,1.4 5,1.4 14.5,-1 L14,6 C5,7 -5,7 -14,6 Z" />
        </g>
      );
    case 'tiny-speckle':
      return (
        <g>
          <path className="ink" fill="#efe6d6" d="M-13,-1 C-4,1.6 4,1.6 13,-1 C14,8 12,18 8,23 C3,24.5 -3,24.5 -8,23 C-12,18 -14,8 -13,-1 Z" />
          <path d="M6,1 C11,8 11,17 7,22 C9,14 9,8 6,1 Z" fill="#d9ccb5" />
          {[[-7, 6], [-2, 12], [4, 7], [-6, 17], [2, 19], [7, 13], [-9, 11]].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r="0.8" fill="#5b4a46" />
          ))}
        </g>
      );
    case 'tiny-pink':
      return (
        <g>
          <path className="ink" fill="#d796a3" d="M-11,5 C-11,14 -9,20 -7,23 C-2,24.5 2,24.5 7,23 C9,20 11,14 11,5 Z" />
          <path d="M4,6 L10.6,6 C10.4,14 9,20 7,22.8 C5.8,23 4.8,23.2 4,23.3 Z" fill="#bd7b8a" />
          <path className="ink" fill="#e3a9b5" d="M-14,-1 C-5,1.6 5,1.6 14,-1 L13.5,6 C5,7.4 -5,7.4 -13.5,6 Z" />
          <path d="M-6,6 C-6,9 -4.6,10 -4,8 C-3.6,7 -3.8,6.4 -3.8,6" fill="#e3a9b5" className="ink-thin" />
        </g>
      );
  }
}

const RIM: Record<PotKind, [number, string]> = {
  slim: [24, '#b5623f'],
  wide: [46, '#2b2229'],
  round: [30, '#e2d7c3'],
  cauldron: [33, '#3a3341'],
  teacup: [30, '#efe4d4'],
  'tiny-clay': [14.5, '#b5623f'],
  'tiny-speckle': [13, '#e3d8c4'],
  'tiny-pink': [14, '#cf95a2'],
};

/** A plant in a pot: rim and soil behind, plant in the middle, pot front over the stem bases. */
export function Potted({ kind, wet = false, children }: { kind: PotKind; wet?: boolean; children: ReactNode }) {
  const [rim, color] = RIM[kind];
  return (
    <g>
      <Opening rim={rim} color={color} wet={wet} />
      {children}
      <Front kind={kind} />
    </g>
  );
}
