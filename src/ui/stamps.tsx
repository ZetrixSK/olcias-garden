import type { Stamp } from '../garden/memories';

/**
 * The little marks an album can carry, drawn as if pressed with an ink stamp: line drawings in
 * the same hand as the menu's icons, with one soft fill each so they read at a glance.
 */
const ART: Record<Stamp, JSX.Element> = {
  heart: (
    <>
      <path className="fill" d="M0,8 C-7,3 -9,-1 -9,-4 C-9,-7 -6.5,-9 -4,-9 C-2,-9 -0.6,-7.8 0,-6.4 C0.6,-7.8 2,-9 4,-9 C6.5,-9 9,-7 9,-4 C9,-1 7,3 0,8 Z" />
      <path d="M-5.5,-5.5 C-6.4,-4.8 -6.6,-3.6 -6.2,-2.6" />
    </>
  ),
  star: (
    <path className="fill" d="M0,-9.5 L2.6,-3.4 L9.2,-2.9 L4.2,1.5 L5.7,8 L0,4.6 L-5.7,8 L-4.2,1.5 L-9.2,-2.9 L-2.6,-3.4 Z" />
  ),
  pansy: (
    <>
      <path d="M0,-1 C-2,-9 -9,-8 -7.5,-3 C-6.8,-1 -3.5,-0.5 0,-1 C3.5,-0.5 6.8,-1 7.5,-3 C9,-8 2,-9 0,-1 Z" />
      <path className="fill" d="M0,-1 C-5,0 -9,3 -6,7 C-4,9.5 -1,8 0,5 C1,8 4,9.5 6,7 C9,3 5,0 0,-1 Z" />
      <path d="M0,-1 L0,2.5 M-1.6,0.3 L-3,2.4 M1.6,0.3 L3,2.4" />
    </>
  ),
  paw: (
    <>
      <path className="fill" d="M0,1.5 C-3.5,1.5 -6,5 -5,7.5 C-4,9.5 -1.5,8.4 0,8.4 C1.5,8.4 4,9.5 5,7.5 C6,5 3.5,1.5 0,1.5 Z" />
      <ellipse cx="-6.8" cy="-1.8" rx="1.9" ry="2.5" transform="rotate(-25 -6.8 -1.8)" />
      <ellipse cx="-2.6" cy="-6" rx="1.9" ry="2.6" transform="rotate(-8 -2.6 -6)" />
      <ellipse cx="2.6" cy="-6" rx="1.9" ry="2.6" transform="rotate(8 2.6 -6)" />
      <ellipse cx="6.8" cy="-1.8" rx="1.9" ry="2.5" transform="rotate(25 6.8 -1.8)" />
    </>
  ),
  moon: (
    <>
      <path className="fill" d="M3,-9 C-3.5,-8.5 -8,-3.5 -8,1.5 C-8,6 -4,9.5 1,9.5 C4.5,9.5 7.5,7.5 9,4.5 C3,6 -2.5,1.5 -1.5,-4.5 C-1,-6.5 0.8,-8.2 3,-9 Z" />
      <path d="M6,-7 L6,-4 M4.5,-5.5 L7.5,-5.5" />
    </>
  ),
  sun: (
    <>
      <circle className="fill" r="4.6" />
      <path d="M0,-9.5 L0,-7 M0,7 L0,9.5 M-9.5,0 L-7,0 M7,0 L9.5,0 M-6.7,-6.7 L-5,-5 M5,5 L6.7,6.7 M-6.7,6.7 L-5,5 M5,-5 L6.7,-6.7" />
    </>
  ),
  house: (
    <>
      <path d="M-9,-0.5 L0,-8.5 L9,-0.5 M-6.5,-2.5 L-6.5,8.5 L6.5,8.5 L6.5,-2.5" />
      <path className="fill" d="M-2,8.5 L-2,3 C-2,1.6 2,1.6 2,3 L2,8.5 Z" />
      <path d="M3.5,-6.6 L3.5,-9 L5.6,-9 L5.6,-4.8" />
    </>
  ),
  cake: (
    <>
      <path className="fill" d="M-8,1 L8,1 L8,8.5 L-8,8.5 Z" />
      <path d="M-8,1 C-6,3.5 -4,3.5 -2.7,1.5 C-1.3,3.5 1.3,3.5 2.7,1.5 C4,3.5 6,3.5 8,1 M-6,1 L-6,-2.5 L6,-2.5 L6,1" />
      <path d="M0,-2.5 L0,-6 M0,-8.5 C-1.2,-7.4 -1,-6.4 0,-6 C1,-6.4 1.2,-7.4 0,-8.5" />
    </>
  ),
  gift: (
    <>
      <path className="fill" d="M-7.5,-1.5 L7.5,-1.5 L7.5,8.5 L-7.5,8.5 Z" />
      <path d="M-8.5,-4.5 L8.5,-4.5 L8.5,-1.5 L-8.5,-1.5 Z M0,-4.5 L0,8.5 M0,-4.5 C-2,-9 -6.5,-8.5 -5.5,-6 C-4.8,-4.6 -2,-4.5 0,-4.5 C2,-4.5 4.8,-4.6 5.5,-6 C6.5,-8.5 2,-9 0,-4.5" />
    </>
  ),
  music: (
    <>
      <path d="M-3,5.5 L-3,-6.5 L7,-9 L7,3" />
      <ellipse className="fill" cx="-5.4" cy="6" rx="3" ry="2.3" transform="rotate(-18 -5.4 6)" />
      <ellipse className="fill" cx="4.6" cy="3.5" rx="3" ry="2.3" transform="rotate(-18 4.6 3.5)" />
      <path d="M-3,-3 L7,-5.6" />
    </>
  ),
  leaf: (
    <>
      <path className="fill" d="M-7,8 C-9,-2 -3,-9 8.5,-9 C8.5,1 2.5,8 -7,8 Z" />
      <path d="M-7,8 C-3,3 1,-1 5,-5.5 M-2.5,2.6 L-2.8,-1.6 M0.8,-0.8 L1,-4.4 M-2.5,2.6 L1.6,2.8 M0.8,-0.8 L4.4,-0.6" />
    </>
  ),
  snow: (
    <path d="M0,-9.5 L0,9.5 M-8.2,-4.75 L8.2,4.75 M-8.2,4.75 L8.2,-4.75 M-2.2,-7.6 L0,-5.6 L2.2,-7.6 M-2.2,7.6 L0,5.6 L2.2,7.6 M-7.7,-1.9 L-4.9,-2.8 L-5.5,-5.7 M7.7,1.9 L4.9,2.8 L5.5,5.7 M-7.7,1.9 L-4.9,2.8 L-5.5,5.7 M7.7,-1.9 L4.9,-2.8 L5.5,-5.7" />
  ),
  pumpkin: (
    <>
      <path className="fill" d="M0,-4.5 C-3,-6 -9,-5 -9,1.5 C-9,7 -4,9 0,8 C4,9 9,7 9,1.5 C9,-5 3,-6 0,-4.5 Z" />
      <path d="M-3,-5 C-5.5,-1 -5.5,5 -3,8.4 M3,-5 C5.5,-1 5.5,5 3,8.4 M0,-4.5 C0.2,-6.5 1,-8 2.6,-9" />
    </>
  ),
  camera: (
    <>
      <path d="M-9,-4.5 L-4,-4.5 L-2.5,-7.5 L2.5,-7.5 L4,-4.5 L9,-4.5 L9,7.5 L-9,7.5 Z" />
      <circle className="fill" cy="1.5" r="4" />
      <path d="M5.8,-2 L7,-2" />
    </>
  ),
  bow: (
    <>
      <path className="fill" d="M0,0 C-3,-4.5 -9,-7 -9,-2 C-9,3 -3,3.5 0,0 C3,3.5 9,3 9,-2 C9,-7 3,-4.5 0,0 Z" />
      <path d="M-1,0.5 C-2.5,4 -4.5,7 -6.5,9 M1,0.5 C2.5,4 4.5,7 6.5,9" />
      <circle r="1.6" />
    </>
  ),
  cup: (
    <>
      <path className="fill" d="M-8,-1.5 L5,-1.5 L4,6 C3.6,8 2,9 0,9 L-3,9 C-5,9 -6.6,8 -7,6 Z" />
      <path d="M5,0.5 C8.5,0 9.2,4.4 4.4,5.2 M-4.5,-4 C-5.5,-5.6 -3.5,-6.6 -4.5,-8.6 M-0.5,-4 C-1.5,-5.6 0.5,-6.6 -0.5,-8.6" />
    </>
  ),
};

export function StampArt({ stamp }: { stamp: Stamp }) {
  return (
    <svg className="stamp" viewBox="-12 -12 24 24" aria-hidden="true">
      {ART[stamp]}
    </svg>
  );
}

export const STAMP_NAMES: Record<Stamp, [string, string]> = {
  heart: ['Heart', 'Serce'],
  star: ['Star', 'Gwiazdka'],
  pansy: ['Pansy', 'Bratek'],
  paw: ['Paw', 'Łapka'],
  moon: ['Moon', 'Księżyc'],
  sun: ['Sun', 'Słońce'],
  house: ['Home', 'Dom'],
  cake: ['Cake', 'Tort'],
  gift: ['Present', 'Prezent'],
  music: ['Music', 'Muzyka'],
  leaf: ['Leaf', 'Liść'],
  snow: ['Snowflake', 'Śnieżynka'],
  pumpkin: ['Pumpkin', 'Dynia'],
  camera: ['Camera', 'Aparat'],
  bow: ['Bow', 'Kokardka'],
  cup: ['Cup of tea', 'Herbata'],
};
