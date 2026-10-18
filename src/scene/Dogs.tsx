import { useState } from 'react';
import type { DogMood } from './dogMood';
import { fv, seeded, sv } from './geometry';

const G = { base: '#e3e0db', shade: '#c0bbb5', hi: '#f6f4f0', muzzle: '#f0ede8', ear: '#23201f', tick: '#4a4648', earIn: '#4d4347' };
const W = { base: '#f4efe6', shade: '#dbd1c3', hi: '#fffaf1', brown: '#a6643b', brownShade: '#7c4627', nose: '#2a1d1c' };

/** Black ticking scattered inside a clip path: what makes a white wire coat read as grey. */
function Ticking({ clip, box, n, seed, big = 0 }: { clip: string; box: [number, number, number, number]; n: number; seed: number; big?: number }) {
  const rnd = seeded(seed);
  const [x, y, w, h] = box;
  return (
    <g clipPath={`url(#${clip})`}>
      {Array.from({ length: n }, (_, i) => {
        const r = i < big ? 1.6 + rnd() * 1.2 : 0.45 + rnd() * 0.85;
        return <ellipse key={i} cx={x + rnd() * w} cy={y + rnd() * h} rx={r} ry={r * (0.7 + rnd() * 0.4)} fill={G.tick} opacity={0.55 + rnd() * 0.4} />;
      })}
    </g>
  );
}

const GREY_BODY = 'M-96,0 C-104,-6 -106,-22 -98,-34 C-90,-46 -70,-50 -54,-48 C-40,-47 -30,-50 -16,-50 C0,-50 12,-42 14,-30 C16,-20 18,-8 22,0 Z';
const GREY_HEAD = 'M10,-26 C8,-40 22,-50 36,-48 C46,-47 52,-41 54,-35 C62,-33 70,-29 73,-24 C75,-19 72,-15 66,-14 C56,-13 42,-11 30,-12 C18,-13 11,-18 10,-26 Z';
const GREY_LEGS = 'M-6,-11 C16,-9 32,-7 42,-6 C50,-6 55,-3 54,0 C53,2 46,2 40,1.5 L-6,1 Z';

/**
 * The older one: white wire coat thick with black ticking, upright black ears. Lying down with his
 * chin on his paws; awake, he lifts his head and yawns now and then.
 */
function GreyDog({ onPet, petted, awake = false }: { onPet: () => void; petted: boolean; awake?: boolean }) {
  return (
    <g onClick={onPet} className="tappable">
      <defs>
        <clipPath id="grey-body-clip"><path d={GREY_BODY} /></clipPath>
        <clipPath id="grey-head-clip"><path d={GREY_HEAD} /></clipPath>
        <clipPath id="grey-legs-clip"><path d={GREY_LEGS} /></clipPath>
      </defs>
      <path className="ink" fill={G.shade} d="M-6,-16 C14,-15 30,-14 42,-12 C50,-12 54,-9 53,-6 C52,-3 46,-3 40,-4 L-6,-6 Z" />
      <path className="ink" fill={G.base} d={GREY_LEGS} />
      <Ticking clip="grey-legs-clip" box={[-6, -12, 60, 14]} n={26} seed={5} />
      <path className="ink-thin" fill="none" d="M47,-5 C48,-3 48,-1 47.4,1.4 M43,-5.6 C44,-3.4 44,-1 43.4,1.4" />
      <g className="breathe">
        <path className="ink" fill={G.base} d="M-97,-32 C-102,-42 -103,-54 -99,-63 C-95,-56 -93,-46 -90,-38 Z" />
        <path d="M-99,-60 C-98,-54 -97,-48 -95,-42" stroke={G.tick} strokeWidth="1.4" strokeDasharray="1 2.4" strokeLinecap="round" fill="none" />
        <path className="ink" fill={G.base} d={GREY_BODY} />
        <path fill={G.shade} d="M-98,-7 C-60,-3 -20,-3 18,-7 L18,0 L-96,0 Z" />
        <path d="M-84,-42 C-70,-48 -50,-46 -40,-46 C-30,-48 -18,-48 -8,-46" fill="none" stroke={G.hi} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        <path fill={G.shade} opacity="0.5" d="M-92,-4 C-98,-20 -86,-36 -68,-34 C-78,-30 -88,-20 -86,-4 Z" />
        <Ticking clip="grey-body-clip" box={[-106, -52, 128, 50]} n={210} seed={11} big={9} />
        <path className="ink-thin" fill="none" d="M-92,-4 C-98,-20 -86,-36 -68,-34 C-56,-32 -52,-20 -56,-6" />
        <path className="ink-thin" fill="none" d="M-62,-48.4 c1,-1.8 2.4,-2.4 3.8,-2.2 M-28,-49.6 c1,-1.8 2.4,-2.4 3.6,-2 M-99,-33 c-1.6,-0.6 -2.6,-1.8 -2.8,-3" />
        <path className="ink" fill={G.base} d="M-60,-2 C-54,-8 -42,-8 -36,-4 C-33,-1 -35,1 -40,1 L-62,1 Z" />
        <path className="ink-thin" fill="none" d="M-41,-5 L-40.4,0 M-45.4,-6 L-45,0" />
      </g>
      <g transform={awake ? 'rotate(-13 14 -28)' : undefined}>
      <g className={petted ? 'nuzzle' : undefined}>
        <path className="ink" fill={G.ear} d="M20,-43 C19,-50 20,-57 22,-63 C26,-58 29,-52 30,-46 Z" />
        <path fill={G.base} d={GREY_HEAD} />
        <path fill={G.muzzle} d="M50,-32 C58,-33 68,-29 72,-24 C73,-18 68,-15 60,-14.6 C54,-14.4 48,-18 47.6,-24 C47.4,-28 48,-31 50,-32 Z" />
        <g clipPath="url(#grey-head-clip)">
          <path fill={G.ear} d="M22,-47 C30,-51 44,-51 50,-45 C53,-41 52,-37 48,-35.6 C43,-35 38,-37 33,-40 C29,-42 25,-44 22,-47 Z" />
        </g>
        <Ticking clip="grey-head-clip" box={[8, -50, 68, 40]} n={70} seed={23} />
        <path fill={G.shade} opacity="0.6" d="M12,-22 C15,-15 22,-13 30,-12.4 C22,-15 17,-19 15,-25 Z" />
        <path className="ink" fill="none" d={GREY_HEAD} />
        <path className="ink-thin" fill={G.muzzle} d="M55,-14.6 L56.6,-9.4 L58.6,-12.2 L60.6,-8 L62.6,-11.6 L64.6,-8.8 L66.4,-12 L68,-14.4 Z" />
        <g className={petted ? 'ear-flick' : undefined} style={{ transformOrigin: '36px -45px' }}>
          <path className="ink" fill={G.ear} d="M27,-45 C28,-53 31,-61 35,-68 C39,-61 43,-53 44,-45 C38,-43 32,-43 27,-45 Z" />
          <path d="M33,-48 C34,-54 35,-59 36,-63" fill="none" stroke={G.earIn} strokeWidth="1.2" strokeLinecap="round" />
        </g>
        {awake ? (
          <>
            <ellipse cx="50.8" cy="-31" rx="2.5" ry="2.8" fill="#1f1719" />
            <circle cx="50" cy="-32" r="0.9" fill="#fff" />
          </>
        ) : (
          <path d="M46.5,-31 Q50.5,-28.4 55,-31" fill="none" style={sv('ink')} strokeWidth="1.5" strokeLinecap="round" />
        )}
        <path className="ink-thin" fill={G.hi} d="M44.6,-36.4 L46.6,-39.8 L48.2,-37.8 L50.6,-41 L51.8,-38.4 L54.6,-40 L55,-36 C51,-35 48,-35.4 44.6,-36.4 Z" />
        <path className="ink-thin" fill="#231b1e" d="M69.4,-29 C73.4,-30.4 76,-27 75,-24 C73,-22.6 70,-23.4 69.4,-26 Z" />
        <path className="ink-thin" fill="none" d="M73.6,-19.6 C69.6,-17.6 64.6,-17.2 60.6,-18" />
        {awake && (
          <g className="yawn">
            <path className="ink-thin" fill="#5a2630" d="M60.6,-18 C62,-11 69,-9 73.6,-19.6 C69.6,-17.6 64.6,-17.2 60.6,-18 Z" />
            <path fill="#e5899a" d="M64,-14.6 C65.6,-11.4 69.4,-11.4 70.6,-15 C68.4,-14.4 66,-14.2 64,-14.6 Z" />
          </g>
        )}
      </g>
      </g>
    </g>
  );
}

const WHITE_EAR = 'M24,-45 C28,-52 38,-54 45,-49 C47,-44 45,-39 41,-37 C38,-40 32,-43 24,-45 Z';

/**
 * The white one asleep: stretched out on his side the same way as the grey one, drawn facing right
 * and turned round where he lies, so the two of them sleep nose to nose.
 */
function WhiteAsleep({ onPet, petted }: { onPet: () => void; petted: boolean }) {
  return (
    <g onClick={onPet} className="tappable">
      <defs>
        <clipPath id="white-sleep-head"><path d={GREY_HEAD} /></clipPath>
      </defs>
      <path className="ink" fill={W.shade} d="M-6,-16 C14,-15 30,-14 42,-12 C50,-12 54,-9 53,-6 C52,-3 46,-3 40,-4 L-6,-6 Z" />
      <path className="ink" fill={W.base} d={GREY_LEGS} />
      <path className="ink-thin" fill="none" d="M47,-5 C48,-3 48,-1 47.4,1.4 M43,-5.6 C44,-3.4 44,-1 43.4,1.4" />
      <g className="breathe" style={{ animationDelay: '-1.8s', animationDuration: '5.2s' }}>
        <path className="ink" fill={W.base} d={GREY_BODY} />
        <path fill={W.shade} d="M-98,-7 C-60,-3 -20,-3 18,-7 L18,0 L-96,0 Z" />
        <path d="M-84,-42 C-70,-48 -50,-46 -40,-46 C-30,-48 -18,-48 -8,-46" fill="none" stroke={W.hi} strokeWidth="3" strokeLinecap="round" />
        <path fill={W.shade} opacity="0.5" d="M-92,-4 C-98,-20 -86,-36 -68,-34 C-78,-30 -88,-20 -86,-4 Z" />
        {/* his haunch and shoulder: the muscle shows even when he's asleep */}
        <path className="ink-thin" fill="none" d="M-92,-4 C-98,-20 -86,-36 -68,-34 C-56,-32 -52,-20 -56,-6" />
        <path className="ink-thin" fill="none" opacity="0.6" d="M-10,-44 C-2,-38 2,-28 0,-16" />
        {/* tail tucked round along the bed */}
        <path className="ink" fill={W.base} d="M-94,-6 C-104,-2 -112,-8 -110,-18 C-106,-12 -100,-10 -92,-12 Z" />
        <path className="ink" fill={W.base} d="M-60,-2 C-54,-8 -42,-8 -36,-4 C-33,-1 -35,1 -40,1 L-62,1 Z" />
        <path className="ink-thin" fill="none" d="M-41,-5 L-40.4,0 M-45.4,-6 L-45,0" />
      </g>
      <g className={petted ? 'nuzzle' : undefined}>
        <path fill={W.base} d={GREY_HEAD} />
        <g clipPath="url(#white-sleep-head)">
          {/* the brown that runs from his ear over his eye */}
          <path fill={W.brown} d="M20,-50 C30,-54 44,-52 52,-44 C57,-39 56,-32 51,-28.6 C46,-26 40,-29 36,-34 C32,-39 26,-43 20,-46 Z" />
          <path fill={W.shade} opacity="0.7" d="M12,-22 C15,-15 22,-13 30,-12.4 C22,-15 17,-19 15,-25 Z" />
        </g>
        <path className="ink" fill="none" d={GREY_HEAD} />
        <path d="M46.5,-31 Q50.5,-28.4 55,-31" fill="none" stroke={W.nose} strokeWidth="1.5" strokeLinecap="round" />
        <path className="ink-thin" fill={W.nose} d="M69.4,-29 C73.4,-30.4 76,-27 75,-24 C73,-22.6 70,-23.4 69.4,-26 Z" />
        <path className="ink-thin" fill="none" d="M73.6,-19.6 C69.6,-17.6 64.6,-17.2 60.6,-18" />
        <g className={petted ? 'ear-flick' : undefined} style={{ transformOrigin: '30px -46px' }}>
          <path className="ink" fill={W.brown} d={WHITE_EAR} />
          <path d="M30,-46 C35,-47.6 40,-46 43,-43" fill="none" stroke={W.brownShade} strokeWidth="1.2" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

/** His face: brown ears, and the brown that runs from his right ear over his right eye. */
function WhiteHead({ petted, tilt = -5, clipId = 'white-dog-skull', eyes = 'open' }: {
  petted: boolean;
  tilt?: number;
  clipId?: string;
  /** 'up' looks up and to the left, out of the window. */
  eyes?: 'open' | 'up' | 'closed';
}) {
  const [ex, ey] = eyes === 'up' ? [-1.2, -1.6] : [0, 0];
  return (
  <g transform={`rotate(${tilt} 0 -84)`}>
      <defs>
        <clipPath id={clipId}>
          <path d="M-24,-84 C-26,-101 -14,-111 0,-111 C14,-111 26,-101 24,-84 C23,-73 15,-65 0,-63 C-15,-65 -23,-73 -24,-84 Z" />
        </clipPath>
      </defs>
      <path fill={W.base} d="M-24,-84 C-26,-101 -14,-111 0,-111 C14,-111 26,-101 24,-84 C23,-73 15,-65 0,-63 C-15,-65 -23,-73 -24,-84 Z" />
      <g clipPath={`url(#${clipId})`}>
        <path fill={W.brown} d="M-30,-98 C-24,-108 -12,-113 -6,-107 C-2,-101 -0.5,-93 -3,-86.5 C-5,-80.5 -11,-77.5 -17,-79.5 C-22,-81 -27,-86 -30,-92 Z" />
        <path fill={W.brownShade} d="M-30,-98 C-26,-104 -18,-108 -12,-108 C-18,-104 -24,-99 -26,-92 Z" />
        <path fill={W.brown} d="M13,-109 C20,-111 28,-105 28,-98 C22,-98 16,-102 13,-109 Z" />
        <path fill={W.shade} d="M14,-70 C20,-74 24,-80 25,-86 L28,-60 L10,-60 Z" />
      </g>
      <path className="ink" fill="none" d="M-24,-84 C-26,-101 -14,-111 0,-111 C14,-111 26,-101 24,-84 C23,-73 15,-65 0,-63 C-15,-65 -23,-73 -24,-84 Z" />
      <path className="ink-thin" fill="none" opacity="0.55" d="M-12,-75 C-12,-68 -7,-63 0,-63 C7,-63 12,-68 12,-75" />
      <path className="ink-thin" fill="none" opacity="0.45" d="M0,-97 L0,-91" />
      {eyes === 'closed' ? (
        <path d="M-13,-88 Q-9.5,-85.4 -6,-88 M6,-88 Q9.5,-85.4 13,-88" fill="none" stroke={W.nose} strokeWidth="1.5" strokeLinecap="round" />
      ) : (
        <>
          <ellipse cx={-9.5 + ex} cy={-88 + ey} rx="3.2" ry="3.6" fill={W.nose} />
          <ellipse cx={9.5 + ex} cy={-88 + ey} rx="3.2" ry="3.6" fill={W.nose} />
          <circle cx={-10.6 + ex} cy={-89.4 + ey} r="1.1" fill="#fff" />
          <circle cx={8.4 + ex} cy={-89.4 + ey} r="1.1" fill="#fff" />
        </>
      )}
      <path className="ink-thin" fill="none" d="M-13.5,-95 C-11,-97.4 -8,-97.2 -6,-95.6 M6,-95.6 C8,-97.2 11,-97.4 13.5,-95" />
      <path className="ink-thin" fill={W.nose} d="M-5.5,-77 C-5.5,-81 5.5,-81 5.5,-77 C5,-73 1.5,-72 0,-72 C-1.5,-72 -5,-73 -5.5,-77 Z" />
      <path d="M-2.5,-79 C-1,-79.8 1,-79.8 2,-79" fill="none" stroke="#6b5655" strokeWidth="1" strokeLinecap="round" />
      <path className="ink-thin" fill="#e5899a" d="M-2.6,-67.6 C-3,-61.5 3,-61.5 2.6,-67.6 C1,-66.8 -1,-66.8 -2.6,-67.6 Z" />
      <path className="ink-thin" fill="none" d="M0,-72 L0,-69 M-7,-68.5 C-4,-65.8 -1.5,-66.2 0,-69 C1.5,-66.2 4,-65.8 7,-68.5" />
      <path className="ink" fill={W.brown} d="M-18,-104 C-27,-108 -36,-103 -36,-95 C-35,-90 -30,-89 -25,-93 C-23,-97 -20,-101 -18,-104 Z" />
      <path d="M-20,-102.6 C-24,-101 -27,-98 -28.5,-94" fill="none" stroke={W.brownShade} strokeWidth="1.2" strokeLinecap="round" />
      <g className={petted ? 'ear-flick' : undefined} style={{ transformOrigin: '18px -104px' }}>
        <path className="ink" fill={W.brown} d="M18,-104 C27,-108 36,-103 36,-95 C35,-90 30,-89 25,-93 C23,-97 20,-101 18,-104 Z" />
        <path d="M20,-102.6 C24,-101 27,-98 28.5,-94" fill="none" stroke={W.brownShade} strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </g>
  );
}

/** The white one: stocky and muscular, brown ears, the brown patch running from his right ear over his right eye. */
function WhiteDog({ onPet, petted, watching = false }: { onPet: () => void; petted: boolean; watching?: boolean }) {
  return (
    <g onClick={onPet} className="tappable">
      <g className={petted ? 'wag-fast' : 'wag'} style={{ transformOrigin: '33px -16px' }}>
        <path className="ink" fill={W.base} d="M28,-14 C40,-18 47,-28 46,-41 C50,-37 53,-25 45,-11 Z" />
      </g>
      {/* hind legs folded either side: a sitting dog's silhouette */}
      <path className="ink" fill={W.base} d="M-16,-2 C-38,-1 -46,-16 -43,-30 C-40,-42 -28,-46 -19,-40 Z" />
      <path className="ink" fill={W.base} d="M16,-2 C39,-1 48,-16 45,-31 C42,-43 29,-47 19,-41 Z" />
      <path fill={W.shade} d="M36,-40 C45,-34 47,-18 38,-6 C44,-16 44,-30 36,-40 Z" />
      <path className="ink" fill={W.base} d="M-46,-1 C-47,-6 -36,-8 -30,-5 C-27,-2 -29,1.4 -33,1.4 L-43,1.4 C-45,1.4 -46,0.4 -46,-1 Z" />
      <path className="ink" fill={W.base} d="M48,-1 C49,-6 38,-8 32,-5 C29,-2 31,1.4 35,1.4 L45,1.4 C47,1.4 48,0.4 48,-1 Z" />
      <path className="ink" fill={W.base} d="M-22,-2 C-27,-24 -27,-46 -18,-60 C-10,-68 10,-68 18,-60 C27,-46 27,-24 22,-2 Z" />
      <path fill={W.shade} d="M17,-58 C24,-46 25,-24 21,-4 L16,-4 C19,-22 19,-42 13,-55 Z" />
      <path d="M-8,-56 C-4,-52 4,-52 8,-56 C5,-49 -5,-49 -8,-56 Z" fill={W.hi} />
      <path className="ink-thin" fill="none" opacity="0.6" d="M-17,-46 C-13,-40 -12,-32 -13,-26 M17,-46 C13,-40 12,-32 13,-26" />
      {/* front legs: only their sides are inked so they grow out of the chest */}
      <path fill={W.base} d="M-17,-30 C-16,-20 -16,-12 -17,-5 L-6,-5 C-5.4,-12 -5.4,-22 -6,-30 Z" />
      <path fill={W.base} d="M17,-30 C16,-20 16,-12 17,-5 L6,-5 C5.4,-12 5.4,-22 6,-30 Z" />
      <path className="ink" fill="none" d="M-17,-28 C-16,-20 -16,-12 -17,-5 M-6,-28 C-5.4,-20 -5.4,-12 -6,-5 M17,-28 C16,-20 16,-12 17,-5 M6,-28 C5.4,-20 5.4,-12 6,-5" />
      <path fill={W.shade} opacity="0.7" d="M-8.6,-26 C-8,-18 -8,-11 -8.4,-5 L-6,-5 C-5.4,-12 -5.4,-20 -6,-26 Z M8.6,-26 C8,-18 8,-11 8.4,-5 L6,-5 C5.4,-12 5.4,-20 6,-26 Z" />
      <path className="ink" fill={W.base} d="M-20,-1 C-21,-7 -4,-8 -3,-2 C-3,1.8 -19,2 -20,-1 Z" />
      <path className="ink" fill={W.base} d="M20,-1 C21,-7 4,-8 3,-2 C3,1.8 19,2 20,-1 Z" />
      <path className="ink-thin" fill="none" d="M-14.6,-3.4 L-14.4,0.8 M-9,-3.6 L-8.8,0.8 M14.6,-3.4 L14.4,0.8 M9,-3.6 L8.8,0.8" />
      {watching ? <WhiteHead petted={petted} tilt={-15} eyes="up" /> : <WhiteHead petted={petted} />}
    </g>
  );
}

export function DogBed({ part }: { part: 'back' | 'front' }) {
  if (part === 'back') {
    return (
      <g>
        <ellipse cx="210" cy="866" rx="190" ry="20" fill="#000" opacity="0.12" />
        <ellipse className="ink" cx="210" cy="812" rx="170" ry="44" style={fv('bed')} />
        <path d="M58,800 C90,776 150,770 210,770 C270,770 330,776 362,800" fill="none" style={sv('bed-hi')} strokeWidth="3" strokeLinecap="round" />
        <ellipse className="ink" cx="210" cy="818" rx="146" ry="26" style={fv('bed-inner')} />
        <path d="M76,812 C120,826 300,828 344,812 C330,836 260,844 210,844 C150,844 90,834 76,812 Z" style={fv('bed-inner-shade')} opacity="0.6" />
      </g>
    );
  }
  return (
    <g>
      <path className="ink" style={fv('bed')} d="M40,812 A170,44 0 0 0 380,812 L356,818 A146,26 0 0 1 64,818 Z" />
      <path d="M62,832 C110,850 310,850 358,832" fill="none" style={sv('bed-shade')} strokeWidth="1.4" strokeDasharray="4 4" strokeLinecap="round" />
    </g>
  );
}

/** Their names, shown for a moment when one of them is petted. */
export const DOG_NAMES = { grey: 'Piorun', white: 'Bajzel' } as const;

function NameTag({ x, y, name }: { x: number; y: number; name: string }) {
  const w = name.length * 7.4 + 14;
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <g className="name-tag">
        <rect className="ink-thin" x={-w / 2} y="-11" width={w} height="20" rx="9" fill="#fbf4e6" />
        <text y="4" textAnchor="middle" fontFamily="Kalam, system-ui, sans-serif" fontSize="13" fontWeight="700" fill="#3d2633">
          {name}
        </text>
      </g>
    </g>
  );
}

export function Dogs({ mood }: { mood: DogMood }) {
  const [petted, setPetted] = useState<'grey' | 'white' | null>(null);
  const pet = (who: 'grey' | 'white') => {
    setPetted(who);
    window.setTimeout(() => setPetted((p) => (p === who ? null : p)), 1400);
  };
  return (
    <g>
      <g transform="translate(152 824)">
        <GreyDog onPet={() => pet('grey')} petted={petted === 'grey'} awake={mood === 'morning'} />
      </g>
      {petted === 'grey' && <NameTag x={196} y={mood === 'morning' ? 748 : 758} name={DOG_NAMES.grey} />}
      {petted === 'white' && <NameTag x={mood === 'asleep' ? 262 : 296} y={mood === 'asleep' ? 770 : 694} name={DOG_NAMES.white} />}
      {mood === 'asleep' ? (
        <g transform="translate(300 826) scale(-0.8 0.8)">
          <WhiteAsleep onPet={() => pet('white')} petted={petted === 'white'} />
        </g>
      ) : (
        <g transform="translate(296 824)">
          <WhiteDog onPet={() => pet('white')} petted={petted === 'white'} watching={mood === 'rain'} />
        </g>
      )}
    </g>
  );
}

const GREY_SKULL = 'M-23,-84 C-25,-100 -13,-109 0,-109 C13,-109 25,-100 23,-84 C22,-74 14,-66 0,-64 C-14,-66 -22,-74 -23,-84 Z';
const GREY_NECK = 'M-21,-74 C-27,-44 -31,-12 -35,34 L35,34 C31,-12 27,-44 21,-74 Z';

/** The grey one facing us, as in the photo: pricked black ears, bushy brows and beard, ticked all over. */
function GreyFace({ petted, sleepy }: { petted: boolean; sleepy: boolean }) {
  return (
    <g>
      <defs>
        <clipPath id="grey-face-clip"><path d={GREY_SKULL} /></clipPath>
        <clipPath id="grey-neck-clip"><path d={GREY_NECK} /></clipPath>
      </defs>
      <path className="ink" fill={G.base} d={GREY_NECK} />
      <Ticking clip="grey-neck-clip" box={[-36, -76, 72, 110]} n={150} seed={31} big={4} />
      <g className={petted ? 'ear-flick' : undefined} style={{ transformOrigin: '-14px -102px' }}>
        <path className="ink" fill={G.ear} d="M-22,-97 C-26,-110 -28,-122 -27,-133 C-18,-127 -11,-117 -7,-105 Z" />
        <path fill={G.earIn} d="M-20,-102 C-22,-111 -23,-118 -23,-125 C-18,-120 -14,-113 -12,-106 Z" />
      </g>
      <path className="ink" fill={G.ear} d="M22,-97 C26,-110 28,-122 27,-133 C18,-127 11,-117 7,-105 Z" />
      <path fill={G.earIn} d="M20,-102 C22,-111 23,-118 23,-125 C18,-120 14,-113 12,-106 Z" />
      <path fill={G.base} d={GREY_SKULL} />
      <g clipPath="url(#grey-face-clip)">
        <path fill={G.ear} d="M-28,-100 C-22,-107 -13,-107 -10,-102 C-12,-97 -19,-95 -27,-95 Z" />
        <path fill={G.ear} d="M28,-101 C22,-108 12,-107 8,-101 C7,-95 11,-91 16,-89 C21,-88 26,-92 28,-96 Z" />
      </g>
      <Ticking clip="grey-face-clip" box={[-24, -108, 48, 46]} n={90} seed={37} />
      <path className="ink" fill="none" d={GREY_SKULL} />
      <path
        className="ink-thin"
        fill={G.muzzle}
        d="M-12,-77 C-15,-69 -12,-61 -7,-57.6 L-5,-60.6 L-3,-55.6 L0,-59.2 L3,-55.6 L5,-60.6 L7,-57.6 C12,-61 15,-69 12,-77 C8,-80.6 -8,-80.6 -12,-77 Z"
      />
      <path d="M-8,-68 l0.8,0.4 M-5,-66 l0.8,0.4 M5,-66 l-0.8,0.4 M8,-68 l-0.8,0.4 M-9,-72 l0.8,0.3 M9,-72 l-0.8,0.3" stroke={G.tick} strokeWidth="1.1" strokeLinecap="round" />
      {sleepy ? (
        <path d="M-13,-87.5 Q-9.5,-85 -6,-87.5 M6,-87.5 Q9.5,-85 13,-87.5" fill="none" stroke="#1f1719" strokeWidth="1.5" strokeLinecap="round" />
      ) : (
        <>
          <ellipse cx="-9.5" cy="-87.5" rx="3" ry="3.3" fill="#1f1719" />
          <ellipse cx="9.5" cy="-87.5" rx="3" ry="3.3" fill="#1f1719" />
          <circle cx="-10.4" cy="-88.8" r="1" fill="#fff" />
          <circle cx="8.6" cy="-88.8" r="1" fill="#fff" />
        </>
      )}
      <path className="ink-thin" fill={G.hi} d="M-15,-93.6 L-13,-97.4 L-11.4,-95.2 L-9,-98.4 L-7.6,-95.6 L-5.4,-97 L-5.2,-93 C-8.4,-92 -11.6,-92.4 -15,-93.6 Z" />
      <path className="ink-thin" fill={G.hi} d="M15,-93.6 L13,-97.4 L11.4,-95.2 L9,-98.4 L7.6,-95.6 L5.4,-97 L5.2,-93 C8.4,-92 11.6,-92.4 15,-93.6 Z" />
      <path className="ink-thin" fill="#1f1719" d="M-5,-76.4 C-5,-80.2 5,-80.2 5,-76.4 C4.6,-73 1.4,-72 0,-72 C-1.4,-72 -4.6,-73 -5,-76.4 Z" />
      <path d="M-2.2,-78.4 C-0.8,-79.2 0.8,-79.2 1.8,-78.4" fill="none" stroke="#6b5f62" strokeWidth="1" strokeLinecap="round" />
      <path className="ink-thin" fill="none" d="M0,-72 L0,-69 M-5,-67.6 C-2.6,-65.8 -1,-66.4 0,-69 C1,-66.4 2.6,-65.8 5,-67.6" />
    </g>
  );
}

function WhiteFace({ petted, eyes }: { petted: boolean; eyes: 'open' | 'up' | 'closed' }) {
  return (
    <g>
      <path className="ink" fill={W.base} d="M-22,-70 C-28,-42 -32,-12 -37,34 L37,34 C32,-12 28,-42 22,-70 Z" />
      <path fill={W.shade} d="M14,-66 C22,-44 26,-14 30,34 L37,34 C32,-12 28,-42 22,-70 Z" />
      <path d="M-8,-60 C-4,-55 4,-55 8,-60 C5,-52 -5,-52 -8,-60 Z" fill={W.hi} />
      <WhiteHead petted={petted} tilt={eyes === 'up' ? -8 : 6} clipId="white-face-skull" eyes={eyes} />
    </g>
  );
}

/** Two front paws resting on the bottom edge of the screen. */
function Paws({ fill, shade, ticked, spread = 24 }: { fill: string; shade: string; ticked?: boolean; spread?: number }) {
  return (
    <g>
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(${side * spread} -4)`}>
          <path className="ink" fill={fill} d="M-12,10 C-13,0 -9,-8 0,-8 C9,-8 13,0 12,10 Z" />
          <path fill={shade} d={side > 0 ? 'M6,-6 C11,-2 12,4 12,10 L7,10 C8,4 8,0 6,-6 Z' : 'M-6,-6 C-11,-2 -12,4 -12,10 L-7,10 C-8,4 -8,0 -6,-6 Z'} />
          <path className="ink-thin" fill="none" d="M-4,-7 L-4.4,-2 M0,-8 L0,-3 M4,-7 L4.4,-2" />
          {ticked && <path d="M-6,2 l0.6,0.4 M5,4 l0.6,0.4 M-2,6 l0.6,0.4 M8,-1 l0.6,0.4" stroke={G.tick} strokeWidth="1.3" strokeLinecap="round" />}
        </g>
      ))}
    </g>
  );
}

/** The back of a sofa along the bottom of the screen, for the dogs to peek over. T is its top edge. */
const sofaTop = (T: number) =>
  `M-400,${T + 2} L-10,${T + 2} C20,${T - 5} 110,${T - 5} 133,${T + 3} C156,${T - 5} 244,${T - 5} 267,${T + 3} C290,${T - 5} 380,${T - 5} 410,${T + 2} L800,${T + 2}`;

function SofaBack({ T, part }: { T: number; part: 'shadow' | 'sofa' }) {
  const top = sofaTop(T);
  if (part === 'shadow') {
    return <path d={`${sofaTop(T - 7)} L800,${T + 40} L-400,${T + 40} Z`} style={fv('wall-shade')} opacity="0.8" />;
  }
  return (
    <g>
      <path className="ink" style={fv('bed')} d={`${top} L800,${T + 200} L-400,${T + 200} Z`} />
      <path d={`M-10,${T + 4} C20,${T - 1} 110,${T - 1} 131,${T + 6} M135,${T + 6} C156,${T - 1} 244,${T - 1} 265,${T + 6} M269,${T + 6} C290,${T - 1} 380,${T - 1} 410,${T + 4}`} fill="none" style={sv('bed-hi')} strokeWidth="3" strokeLinecap="round" />
      <path d={`M133,${T + 3} L133,${T + 200} M267,${T + 3} L267,${T + 200}`} className="ink-thin" fill="none" />
      <path d={`M-400,${T + 34} L800,${T + 34}`} style={sv('bed-shade')} strokeWidth="1.4" strokeDasharray="4 4" />
      {[66, 200, 334].map((x) => (
        <g key={x}>
          <circle cx={x} cy={T + 20} r="2.6" style={fv('bed-shade')} />
          <path d={`M${x - 10},${T + 16} Q${x - 4},${T + 20} ${x - 2.6},${T + 20} M${x + 10},${T + 16} Q${x + 4},${T + 20} ${x + 2.6},${T + 20}`} fill="none" style={sv('bed-shade')} strokeWidth="1" />
        </g>
      ))}
    </g>
  );
}

/** Both dogs peeking up over the sofa back; bottom is where the screen ends. */
export function PeekingDogs({ bottom, mood }: { bottom: number; mood: DogMood }) {
  const sleepy = mood === 'asleep';
  const [petted, setPetted] = useState<'grey' | 'white' | null>(null);
  const pet = (who: 'grey' | 'white') => {
    setPetted(who);
    window.setTimeout(() => setPetted((p) => (p === who ? null : p)), 1400);
  };
  const T = bottom - 48;
  const head = (x: number, dy: number) => `translate(${x} ${bottom - 6 + dy}) scale(0.84)`;
  const grey = (
    <g className={petted === 'grey' ? 'nuzzle' : 'peek'} style={{ animationDelay: '-2s' }}>
      <GreyFace petted={petted === 'grey'} sleepy={sleepy} />
    </g>
  );
  const white = (
    <g className={petted === 'white' ? 'nuzzle' : 'peek'}>
      <WhiteFace petted={petted === 'white'} eyes={sleepy ? 'closed' : mood === 'rain' ? 'up' : 'open'} />
    </g>
  );
  const paws = (spread: number) => (
    <>
      <g transform={head(104, 0)} className="tappable" onClick={() => pet('grey')}>
        <g transform="translate(0 -51)">
          <Paws fill={G.base} shade={G.shade} ticked spread={spread} />
        </g>
      </g>
      <g transform={head(298, 0)} className="tappable" onClick={() => pet('white')}>
        <g transform="translate(0 -51)">
          <Paws fill={W.base} shade={W.shade} spread={spread} />
        </g>
      </g>
    </>
  );
  const tags = (
    <>
      {petted === 'grey' && <NameTag x={104} y={T - (sleepy ? 100 : 112)} name={DOG_NAMES.grey} />}
      {petted === 'white' && <NameTag x={298} y={T - (sleepy ? 80 : 90)} name={DOG_NAMES.white} />}
    </>
  );

  if (sleepy) {
    // asleep: chins sunk onto the sofa back with the paws tucked in front of them. The heads are
    // cut off at the sofa's top edge so their necks stay behind it.
    const restY = 7;
    return (
      <g>
        <defs>
          <clipPath id="above-sofa">
            <rect x="-400" y={T - 2000} width="1200" height={2000 + 3} />
          </clipPath>
        </defs>
        <SofaBack T={T} part="shadow" />
        <SofaBack T={T} part="sofa" />
        <g clipPath="url(#above-sofa)">
          <g transform={head(104, restY)} className="tappable" onClick={() => pet('grey')} aria-label={DOG_NAMES.grey}>
            {grey}
          </g>
          <g transform={head(298, restY + 4)} className="tappable" onClick={() => pet('white')} aria-label={DOG_NAMES.white}>
            {white}
          </g>
        </g>
        {paws(17)}
        {tags}
      </g>
    );
  }

  return (
    <g>
      <SofaBack T={T} part="shadow" />
      <g transform={head(104, 0)} className="tappable" onClick={() => pet('grey')} aria-label={DOG_NAMES.grey}>
        {grey}
      </g>
      <g transform={head(298, 4)} className="tappable" onClick={() => pet('white')} aria-label={DOG_NAMES.white}>
        {white}
      </g>
      <SofaBack T={T} part="sofa" />
      {tags}
      {paws(24)}
    </g>
  );
}
