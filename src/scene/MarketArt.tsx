import type { ReactNode } from 'react';
import type { Rarity } from '../garden/market';
import { PansyFlower } from '../plants/Pansy';
import { designColors } from '../plants/looks';

/**
 * The market, drawn: Pan Jeżyk and Pani Ćma, their stalls, and every trinket she can collect,
 * with Milton. Same ink, same soft round shapes as the visitors.
 */

const INK = 'var(--visitor-ink, #3d2633)';
const CHEEK = '#f08ea6';
const ink = { stroke: INK, strokeWidth: 1.4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const thin = { stroke: INK, strokeWidth: 0.9, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

export const RARITY_COLOUR: Record<Rarity, string> = {
  common: '#a7b598',
  uncommon: '#7fa3d6',
  rare: '#b48ad6',
  veryrare: '#e48aa8',
  legendary: '#e2ad3f',
};

function Eye({ x, y, r, shut = false, sleepy = false }: { x: number; y: number; r: number; shut?: boolean; sleepy?: boolean }) {
  if (shut) return <path d={`M${x - r},${y} Q${x},${y + r * 0.9} ${x + r},${y}`} fill="none" stroke={INK} strokeWidth={r * 0.45} strokeLinecap="round" />;
  return (
    <g className={sleepy ? undefined : 'visitor-blink'}>
      <ellipse cx={x} cy={y} rx={r * 0.86} ry={r} fill="#2a1d26" />
      <circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.36} fill="#fff" />
      {sleepy && (
        <>
          <path d={`M${x - r * 1.1},${y - r * 0.45} Q${x},${y - r * 0.2} ${x + r * 1.1},${y - r * 0.45} L${x + r * 1.1},${y - r * 1.3} L${x - r * 1.1},${y - r * 1.3} Z`} fill="var(--lid, #e6d3e4)" />
          <path d={`M${x - r * 1.0},${y - r * 0.4} Q${x},${y - r * 0.2} ${x + r * 1.0},${y - r * 0.4}`} fill="none" stroke={INK} strokeWidth={r * 0.28} strokeLinecap="round" />
        </>
      )}
    </g>
  );
}

// ---- Pan Jeżyk ------------------------------------------------------------------------------

/** A spiky ring: an ellipse with little points all round, for the hedgehog's coat. */
function spikes(cx: number, cy: number, rx: number, ry: number, n: number, out: number, from = 0, to = Math.PI * 2): string {
  const step = (to - from) / n;
  const pt = (a: number, k: number) => `${(cx + Math.cos(a) * rx * k).toFixed(1)},${(cy + Math.sin(a) * ry * k).toFixed(1)}`;
  let d = `M${pt(from, 1)}`;
  for (let i = 0; i < n; i++) {
    const a = from + i * step;
    d += ` L${pt(a + step * 0.5, 1 + out)} L${pt(a + step, 1)}`;
  }
  return `${d} Z`;
}

export type KeeperMood = 'waiting' | 'happy' | 'asleep';

/** A small flower, the shape the petals are counted in: five round petals and a golden middle. */
export function Blossom({ fill = '#ef93ad', empty = false }: { fill?: string; empty?: boolean }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle
          key={a}
          cx={(Math.sin((a * Math.PI) / 180) * 4.6).toFixed(2)}
          cy={(-Math.cos((a * Math.PI) / 180) * 4.6).toFixed(2)}
          r="3.9"
          fill={empty ? '#ece0d2' : fill}
          stroke={INK}
          strokeWidth="1"
          strokeOpacity={empty ? 0.3 : 1}
        />
      ))}
      {[0, 72, 144, 216, 288].map((a) => <circle key={`f${a}`} cx={(Math.sin((a * Math.PI) / 180) * 4.6).toFixed(2)} cy={(-Math.cos((a * Math.PI) / 180) * 4.6).toFixed(2)} r="2.9" fill={empty ? '#ece0d2' : fill} />)}
      <circle r="2.4" fill={empty ? '#e2d4c3' : '#f4cf5e'} stroke={INK} strokeWidth="0.9" strokeOpacity={empty ? 0.3 : 1} />
    </g>
  );
}

/**
 * Pan Jeżyk: a small round hedgehog with a big soft face, shiny eyes, round ears and a button nose,
 * in a pink apron, with a pencil tucked into his spines.
 */
export function PanJezyk({ mood = 'waiting' }: { mood?: KeeperMood }) {
  const asleep = mood === 'asleep';
  const shut = asleep || mood === 'happy';
  return (
    <g className={asleep ? 'keeper-sleep' : 'keeper-bob'}>
      {/* soft spines, in two layers, all round the back of him */}
      <path d={spikes(0, -54, 42, 40, 16, 0.15, Math.PI * 0.92, Math.PI * 2.08)} fill="#7d5536" {...ink} />
      <path d={spikes(0, -55, 34, 32, 13, 0.14, Math.PI * 1.0, Math.PI * 2.0)} fill="#9a6a42" stroke="none" />
      <path d="M-24,-78 l2,-4 M-12,-86 l1,-4.6 M2,-89 l0,-4.6 M15,-85 l-1,-4.6 M26,-77 l-2,-4" stroke="#c9a070" strokeWidth="1.3" strokeLinecap="round" />
      {/* the pencil, tucked behind his ear: its end hidden by his head, its tip poking out of his spines */}
      <g transform="translate(12 -70) rotate(-48)">
        <path d="M0,-1.9 L20,-1.9 L20,1.9 L0,1.9 Z" fill="#f2c94c" {...thin} />
        <path d="M20,-1.9 L24.6,0 L20,1.9 Z" fill="#f1d7b0" {...thin} />
        <circle cx="24.2" cy="0" r="0.7" fill={INK} />
        <path d="M2,0 L18,0" stroke="#e2b23a" strokeWidth="0.8" />
      </g>
      {/* round little body and his apron */}
      <path d="M-30,-36 C-34,-16 -26,-2 0,-2 C26,-2 34,-16 30,-36 C22,-46 -22,-46 -30,-36 Z" fill="#a37549" {...ink} />
      <path d="M-18,-36 L18,-36 L21,-6 C12,-2 -12,-2 -21,-6 Z" fill="#f2a6bb" {...ink} />
      <path d="M-18,-36 C-14,-43 14,-43 18,-36" fill="none" stroke="#f2a6bb" strokeWidth="2.2" />
      <path d="M-21,-6 Q-17.5,-2.6 -14,-6 Q-10.5,-2.6 -7,-6 Q-3.5,-2.6 0,-6 Q3.5,-2.6 7,-6 Q10.5,-2.6 14,-6 Q17.5,-2.6 21,-6" fill="none" stroke="#fde6ee" strokeWidth="1.3" />
      {/* a pocket with a bratek sewn on */}
      <path d="M-7,-24 L7,-24 L7,-14 C4,-12 -4,-12 -7,-14 Z" fill="#f8c7d5" {...thin} />
      <g transform="translate(0 -19) scale(0.42)">
        <Blossom fill="#b48ad6" />
      </g>
      {/* little paws on the counter */}
      <ellipse cx="-22" cy="-12" rx="5.6" ry="4.4" fill="#ecd2b2" {...ink} />
      <ellipse cx="22" cy="-12" rx="5.6" ry="4.4" fill="#ecd2b2" {...ink} />
      {/* round ears */}
      <circle cx="-21" cy="-74" r="6" fill="#ecd2b2" {...ink} />
      <circle cx="21" cy="-74" r="6" fill="#ecd2b2" {...ink} />
      <circle cx="-21" cy="-74" r="3" fill="#f2a6bb" />
      <circle cx="21" cy="-74" r="3" fill="#f2a6bb" />
      {/* a big, soft, round face with a little snout */}
      <path d="M-26,-58 C-27,-76 -14,-84 0,-84 C14,-84 27,-76 26,-58 C25,-46 14,-40 0,-39 C-14,-40 -25,-46 -26,-58 Z" fill="#f6e3cb" {...ink} />
      <path d="M-9,-49 C-8,-41 8,-41 9,-49 C5,-46 -5,-46 -9,-49 Z" fill="#ecd2b2" />
      {/* a tuft on top */}
      <path d="M-6,-83 C-5,-89 0,-90 1,-85 C3,-90 8,-88 6,-82" fill="#7d5536" {...thin} />
      {shut ? (
        <g fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round">
          <path d={asleep ? 'M-15,-60 Q-11,-57 -7,-60' : 'M-15,-59 Q-11,-64 -7,-59'} />
          <path d={asleep ? 'M7,-60 Q11,-57 15,-60' : 'M7,-59 Q11,-64 15,-59'} />
        </g>
      ) : (
        <g className="visitor-blink">
          <ellipse cx="-11" cy="-60" rx="4.4" ry="5.2" fill="#2a1d26" />
          <ellipse cx="11" cy="-60" rx="4.4" ry="5.2" fill="#2a1d26" />
          <circle cx="-12.6" cy="-62" r="1.9" fill="#fff" />
          <circle cx="9.4" cy="-62" r="1.9" fill="#fff" />
          <circle cx="-9.6" cy="-57.8" r="0.8" fill="#fff" />
          <circle cx="12.4" cy="-57.8" r="0.8" fill="#fff" />
        </g>
      )}
      <ellipse cx="-19" cy="-51" rx="4.6" ry="3" fill={CHEEK} opacity="0.65" />
      <ellipse cx="19" cy="-51" rx="4.6" ry="3" fill={CHEEK} opacity="0.65" />
      {/* button nose, shiny */}
      <ellipse cx="0" cy="-51" rx="3.6" ry="3" fill="#2a1d26" />
      <circle cx="-1.2" cy="-52" r="1" fill="#fff" />
      {mood === 'happy' ? (
        <path d="M-4,-46.6 Q0,-41.6 4,-46.6 Z" fill="#6b2a3a" {...thin} />
      ) : (
        <path d="M-3.4,-46.4 Q-1.7,-44.4 0,-46.4 Q1.7,-44.4 3.4,-46.4" fill="none" stroke={INK} strokeWidth="1" strokeLinecap="round" />
      )}
      {asleep && (
        <g className="keeper-z" fill="none" stroke={INK} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M30,-90 L37,-90 L30,-83 L37,-83" />
          <path d="M40,-102 L45,-102 L40,-97 L45,-97" />
        </g>
      )}
    </g>
  );
}

// ---- Pani Ćma -------------------------------------------------------------------------------

/** Pani Ćma: a soft, sleepy moth in a knitted shawl, with feathery antennae and a lantern. */
export function PaniCma({ mood = 'waiting' }: { mood?: KeeperMood }) {
  return (
    <g className="keeper-bob">
      {/* wings, behind: dusty lilac, with eye spots */}
      <g className="moth-wings">
        <path d="M-10,-70 C-40,-104 -78,-92 -70,-62 C-66,-48 -40,-46 -14,-56 Z" fill="#cdb8e0" {...ink} />
        <path d="M-12,-50 C-44,-48 -62,-28 -48,-14 C-36,-4 -18,-20 -10,-40 Z" fill="#bca3d6" {...ink} />
        <path d="M10,-70 C40,-104 78,-92 70,-62 C66,-48 40,-46 14,-56 Z" fill="#cdb8e0" {...ink} />
        <path d="M12,-50 C44,-48 62,-28 48,-14 C36,-4 18,-20 10,-40 Z" fill="#bca3d6" {...ink} />
        <circle cx="-48" cy="-72" r="7" fill="#f3e2ee" {...thin} />
        <circle cx="-48" cy="-72" r="3" fill="#7a5c9a" />
        <circle cx="48" cy="-72" r="7" fill="#f3e2ee" {...thin} />
        <circle cx="48" cy="-72" r="3" fill="#7a5c9a" />
        <path d="M-60,-84 C-50,-90 -36,-88 -26,-80 M60,-84 C50,-90 36,-88 26,-80" fill="none" stroke="#e6d8f0" strokeWidth="1.6" strokeLinecap="round" />
      </g>
      {/* fluffy body */}
      <path d="M-20,-46 C-26,-26 -22,-4 0,-2 C22,-4 26,-26 20,-46 C14,-56 -14,-56 -20,-46 Z" fill="#f4ecf4" {...ink} />
      <path d="M-18,-26 C-10,-22 10,-22 18,-26 M-19,-14 C-10,-10 10,-10 19,-14" fill="none" stroke="#dccbe2" strokeWidth="2" strokeLinecap="round" />
      {/* the shawl, knitted, dusty pink */}
      <path d="M-24,-52 C-14,-40 14,-40 24,-52 L20,-36 C8,-28 -8,-28 -20,-36 Z" fill="#d98aa6" {...ink} />
      <path d="M-14,-34 L-16,-24 M-8,-31 L-9,-22 M8,-31 L9,-22 M14,-34 L16,-24" stroke="#d98aa6" strokeWidth="2" strokeLinecap="round" />
      <path d="M-18,-44 L-14,-40 M-10,-41 L-6,-37 M2,-40 L6,-36 M10,-42 L14,-38" stroke="#f3c6d4" strokeWidth="1" strokeLinecap="round" />
      {/* head: a fuzzy round, sleepy eyes */}
      <path d="M-20,-66 C-22,-84 -10,-92 0,-92 C10,-92 22,-84 20,-66 C18,-54 -18,-54 -20,-66 Z" fill="#f4ecf4" {...ink} />
      <path d="M-14,-86 C-8,-90 4,-90 10,-87" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" />
      {/* feathery antennae */}
      <g fill="none" stroke={INK} strokeWidth="1.2" strokeLinecap="round">
        <path d="M-6,-90 C-10,-102 -18,-108 -26,-108" />
        <path d="M6,-90 C10,-102 18,-108 26,-108" />
        <path d="M-12,-99 l-3,-4 M-16,-103 l-2,-5 M-20,-106 l-1,-5 M-12,-99 l2,-4 M-16,-103 l1,-5 M12,-99 l3,-4 M16,-103 l2,-5 M20,-106 l1,-5 M12,-99 l-2,-4 M16,-103 l-1,-5" strokeWidth="0.8" />
      </g>
      <g style={{ ['--lid' as string]: '#f4ecf4' }}>
        <Eye x={-8} y={-72} r={4.6} shut />
        <Eye x={8} y={-72} r={4.6} shut />
      </g>
      <ellipse cx="-14" cy="-64" rx="3.8" ry="2.4" fill={CHEEK} opacity="0.6" />
      <ellipse cx="14" cy="-64" rx="3.8" ry="2.4" fill={CHEEK} opacity="0.6" />
      <path d={mood === 'happy' ? 'M-4,-63 Q0,-58 4,-63 Z' : 'M-3,-63 Q0,-61 3,-63'} fill={mood === 'happy' ? '#6b2a3a' : 'none'} stroke={INK} strokeWidth="1.1" strokeLinecap="round" />
      {/* the lantern she carries */}
      <g transform="translate(30 -26)">
        <path d="M-6,-4 C-8,-10 -2,-14 0,-14" fill="none" stroke={INK} strokeWidth="1.1" />
        <path d="M0,-16 L0,-10" stroke={INK} strokeWidth="1.1" />
        <path d="M-6,-10 L6,-10 L7,-7 L-7,-7 Z" fill="#3a2d3b" {...thin} />
        <path d="M-6,-7 L6,-7 L5,8 L-5,8 Z" fill="#f6d48a" {...thin} />
        <path d="M-7,8 L7,8 L5,11 L-5,11 Z" fill="#3a2d3b" {...thin} />
        <ellipse cx="0" cy="1" rx="2" ry="3.2" fill="#fff3c8" />
      </g>
      <ellipse cx="22" cy="-26" rx="5" ry="4" fill="#f4ecf4" {...ink} />
    </g>
  );
}

// ---- the stall ------------------------------------------------------------------------------

/**
 * The stall: a striped awning on two posts and a wooden counter. By day Pan Jeżyk's, pink and
 * cream; at night Pani Ćma's, plum and lilac, with two lanterns. The keeper stands behind it.
 */
export function Stall({ night, closed = false, keeper }: { night: boolean; closed?: boolean; keeper: ReactNode }) {
  const a = night ? '#5a3a6e' : '#ef9db3';
  const b = night ? '#a98bc4' : '#fbf2e6';
  const stripes = Array.from({ length: 8 }, (_, i) => i);
  return (
    <g>
      {/* the posts */}
      <path d="M-128,-170 L-128,40 M128,-170 L128,40" stroke="#8a5a32" strokeWidth="7" />
      <path d="M-128,-170 L-128,40 M128,-170 L128,40" stroke={INK} strokeWidth="1" opacity="0.6" />
      {/* the keeper, behind the counter */}
      <g transform="translate(0 -2) scale(1.15)">{keeper}</g>
      {/* awning: stripes and a scalloped edge */}
      <g>
        {stripes.map((i) => (
          <path key={i} d={`M${-140 + i * 35},-200 L${-105 + i * 35},-200 L${-105 + i * 35},-160 L${-140 + i * 35},-160 Z`} fill={i % 2 ? b : a} />
        ))}
        {stripes.map((i) => (
          <path
            key={`s${i}`}
            d={`M${-140 + i * 35},-160 Q${-122.5 + i * 35},-140 ${-105 + i * 35},-160 Z`}
            fill={i % 2 ? b : a}
            {...thin}
          />
        ))}
        <path d="M-140,-200 L140,-200 L140,-160 L-140,-160 Z" fill="none" {...ink} />
        <path d="M-146,-206 L146,-206 L140,-200 L-140,-200 Z" fill={night ? '#3a2650' : '#c95d7f'} {...ink} />
      </g>
      {night && (
        <>
          {[-110, 110].map((x) => (
            <g key={x} transform={`translate(${x} -146)`}>
              <circle r="30" fill="url(#stall-glow)" />
              <path d="M0,-14 L0,-8" stroke={INK} strokeWidth="1" />
              <path d="M-5,-8 L5,-8 L4,8 L-4,8 Z" fill="#f6d48a" {...thin} />
              <path d="M-6,-10 L6,-10 L5,-8 L-5,-8 Z M-5,8 L5,8 L4,10 L-4,10 Z" fill="#3a2d3b" {...thin} />
            </g>
          ))}
        </>
      )}
      {/* the counter */}
      <path d="M-136,-6 L136,-6 L136,40 L-136,40 Z" fill={night ? '#6a4a52' : '#c88e5d'} {...ink} />
      <path d="M-142,-14 L142,-14 L136,-6 L-136,-6 Z" fill={night ? '#87636c' : '#e2ae7f'} {...ink} />
      <path d="M-136,10 L136,10 M-136,26 L136,26" stroke={night ? '#563b42' : '#a26d41'} strokeWidth="1.2" />
      {/* a sign hung on the front */}
      <g transform="translate(0 18)">
        <path d="M-40,-11 L40,-11 L40,11 L-40,11 Z" fill="#fbf4e8" {...ink} />
        {closed ? (
          <path d="M-26,0 L26,0" stroke="#c0435f" strokeWidth="2.2" strokeLinecap="round" />
        ) : night ? (
          <g transform="translate(0 0)">
            <path d="M-4,-6 C-11,-4 -11,6 -4,7 C-8,3 -8,-3 -4,-6 Z" fill="#7a5c9a" />
            <circle cx="8" cy="-2" r="1.2" fill="#e2ad3f" />
            <circle cx="14" cy="3" r="0.9" fill="#e2ad3f" />
            <circle cx="-16" cy="2" r="1" fill="#e2ad3f" />
          </g>
        ) : (
          <g>
            <PansyFlower x={-20} y={0} s={0.26} c={designColors({ id: 's', name: '', top: '#2c1733', low: '#f0a8c0', face: 'whiskers', faceColor: '#2c1733', edge: null })} />
            <path d="M-8,0 L22,0" stroke="#c9a6a0" strokeWidth="1.4" strokeDasharray="3 3" />
          </g>
        )}
      </g>
      {closed && (
        <path d="M-136,-12 C-90,-30 -40,-8 0,-22 C40,-8 90,-30 136,-12 L136,-4 L-136,-4 Z" fill={night ? '#3a2650' : '#d98aa6'} opacity="0.95" {...ink} />
      )}
    </g>
  );
}

// ---- trinkets -------------------------------------------------------------------------------

/** A ring at the top that charms hang from. */
const Ring = () => <circle cx="0" cy="1.6" r="1.6" fill="none" stroke="#c9a45c" strokeWidth="1" />;

const CHARMS: Record<string, () => JSX.Element> = {
  mushroom: () => (
    <g>
      <Ring />
      <path d="M-3,12 L3,12 L3.6,20 C2,21.4 -2,21.4 -3.6,20 Z" fill="#fbf2e6" {...thin} />
      <path d="M-10,12 C-10,2 10,2 10,12 Z" fill="#d9534f" {...thin} />
      <circle cx="-4" cy="7" r="1.5" fill="#fff" />
      <circle cx="3.6" cy="6" r="1.2" fill="#fff" />
      <circle cx="6.6" cy="10" r="0.9" fill="#fff" />
    </g>
  ),
  moon: () => (
    <g>
      <Ring />
      <path d="M2,3.4 C-7,4 -10,16 -2,21 C-12,19 -14,6 2,3.4 Z" fill="#f2d16b" {...thin} />
      <circle cx="-5.4" cy="12" r="0.7" fill={INK} />
      <path d="M-6.6,15 Q-5.6,16 -4.4,15.4" fill="none" stroke={INK} strokeWidth="0.6" />
    </g>
  ),
  cherries: () => (
    <g>
      <Ring />
      <path d="M0,3 C-2,8 -4,11 -5,15 M0,3 C2,8 4,11 5,14" fill="none" stroke="#5e7d3c" strokeWidth="1" />
      <path d="M0,4 C3,2 7,3 8,5 C5,6 2,6 0,4 Z" fill="#8bb07e" {...thin} />
      <circle cx="-5" cy="17" r="4" fill="#c9304a" {...thin} />
      <circle cx="5" cy="16" r="4" fill="#d9404f" {...thin} />
      <circle cx="-6.2" cy="15.6" r="1" fill="#fff" opacity="0.8" />
      <circle cx="3.8" cy="14.6" r="1" fill="#fff" opacity="0.8" />
    </g>
  ),
  key: () => (
    <g>
      <Ring />
      <circle cx="0" cy="8" r="4.4" fill="none" stroke="#c9a45c" strokeWidth="2.2" />
      <circle cx="0" cy="8" r="4.4" fill="none" {...thin} strokeWidth="0.5" />
      <path d="M-1.2,12 L1.2,12 L1.2,22 L-1.2,22 Z M1.2,17 L4,17 L4,19 L1.2,19 Z M1.2,20 L3.2,20 L3.2,22 L1.2,22 Z" fill="#c9a45c" {...thin} strokeWidth="0.5" />
    </g>
  ),
  star: () => (
    <g>
      <Ring />
      <path d="M0,3.4 L2.6,9.6 L9.4,10 L4.2,14.4 L5.8,21 L0,17.4 L-5.8,21 L-4.2,14.4 L-9.4,10 L-2.6,9.6 Z" fill="#f2d16b" {...thin} />
      <circle cx="-1.8" cy="12.6" r="0.6" fill={INK} />
      <circle cx="1.8" cy="12.6" r="0.6" fill={INK} />
      <path d="M-1,14.6 Q0,15.6 1,14.6" fill="none" stroke={INK} strokeWidth="0.5" />
    </g>
  ),
  padlock: () => (
    <g>
      <Ring />
      <path d="M-4,10 L-4,7 C-4,2 4,2 4,7 L4,10" fill="none" stroke="#c9a45c" strokeWidth="1.6" />
      <path d="M0,22 C-9,16 -10,10 -6,8.6 C-3.6,7.8 -1,9 0,11 C1,9 3.6,7.8 6,8.6 C10,10 9,16 0,22 Z" fill="#ef8aa8" {...thin} />
      <circle cx="0" cy="14" r="1.2" fill={INK} />
      <path d="M0,14 L0,17" stroke={INK} strokeWidth="0.8" />
    </g>
  ),
  bat: () => (
    <g>
      <Ring />
      <path d="M0,8 C-4,6 -8,6 -12,9 C-10,10 -10,13 -11,15 C-8,13 -6,14 -5,16 C-3,14 -2,14 0,15 C2,14 3,14 5,16 C6,14 8,13 11,15 C10,13 10,10 12,9 C8,6 4,6 0,8 Z" fill="#2b2331" {...thin} />
      <path d="M-3,6 L-2,3.4 L-0.6,6 M3,6 L2,3.4 L0.6,6" fill="#2b2331" {...thin} />
      <circle cx="-1.6" cy="9" r="0.9" fill="#f2d16b" />
      <circle cx="1.6" cy="9" r="0.9" fill="#f2d16b" />
    </g>
  ),
  cauldron: () => (
    <g>
      <Ring />
      <path d="M-6,6 C-4,3 4,3 6,6" fill="none" stroke="#c9a45c" strokeWidth="0.9" />
      <circle cx="-2" cy="7" r="1.6" fill="#9be08a" {...thin} strokeWidth="0.4" />
      <circle cx="2.4" cy="5.6" r="1.1" fill="#9be08a" {...thin} strokeWidth="0.4" />
      <path d="M-8,9 C-10,14 -8,19 0,20 C8,19 10,14 8,9 Z" fill="#2a2030" {...thin} />
      <path d="M-9,8 L9,8 L9,10 L-9,10 Z" fill="#3a2d40" {...thin} />
    </g>
  ),
  pansy: () => (
    <g>
      <Ring />
      <PansyFlower x={0} y={12} s={0.3} c={designColors({ id: 'c', name: '', top: '#2c1733', low: '#f0a8c0', face: 'whiskers', faceColor: '#2c1733', edge: null })} />
    </g>
  ),
  bee: () => (
    <g>
      <Ring />
      <ellipse cx="-6" cy="7" rx="4" ry="2.6" fill="#eaf4fa" {...thin} />
      <ellipse cx="6" cy="7" rx="4" ry="2.6" fill="#eaf4fa" {...thin} />
      <circle cx="0" cy="13" r="7.4" fill="#f3c34c" {...thin} />
      <path d="M-7,15 Q0,17 7,15 L6.4,17.4 Q0,19.4 -6.4,17.4 Z" fill="#2c2326" />
      <circle cx="-2.4" cy="11.6" r="1" fill="#2a1d26" />
      <circle cx="2.4" cy="11.6" r="1" fill="#2a1d26" />
      <path d="M-1,13.6 Q0,14.6 1,13.6" fill="none" stroke={INK} strokeWidth="0.5" />
      <ellipse cx="-4.6" cy="13.4" rx="1.2" ry="0.8" fill={CHEEK} opacity="0.7" />
      <ellipse cx="4.6" cy="13.4" rx="1.2" ry="0.8" fill={CHEEK} opacity="0.7" />
    </g>
  ),
  hat: () => (
    <g>
      <Ring />
      <path d="M-4,15 C-2,10 0,6 1,3.6 C4,3 6,4 6.4,6 C4.6,6 3.4,8 3.4,10 L4,15 Z" fill="#3a2650" {...thin} />
      <path d="M-4,14 L4,14 L4.2,16 L-4.2,16 Z" fill="#ec8aa5" />
      <path d="M-11,17 C-8,14.6 8,14.6 11,17 C8,19.4 -8,19.4 -11,17 Z" fill="#3a2650" {...thin} />
    </g>
  ),
  crystal: () => (
    <g>
      <Ring />
      <path d="M0,4 L6,10 L0,22 L-6,10 Z" fill="#c9b2ea" {...thin} />
      <path d="M0,4 L2,10 L0,22 M-6,10 L6,10" fill="none" stroke="#9a80c6" strokeWidth="0.7" />
      <path d="M-3,9 L-1,6.4" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
    </g>
  ),
};

/** Figures stand on (0,0); about 30–40 tall. */
const FIGURES: Record<string, () => JSX.Element> = {
  snail: () => (
    <g>
      <path d="M-18,0 C-18,-6 -10,-6 0,-6 L12,-6 C16,-6 18,-10 17,-16 L19,-16 C21,-8 18,0 12,0 Z" fill="#f2dcc0" {...ink} />
      <path d="M15,-15 L13,-24 M18,-15 L19,-24" stroke={INK} strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="13" cy="-25" r="1.6" fill="#2a1d26" />
      <circle cx="19" cy="-25" r="1.6" fill="#2a1d26" />
      <circle cx="-4" cy="-16" r="12" fill="#ef9db3" {...ink} />
      <path d="M-4,-16 m-1,0 a2,2 0 1 1 3,2 a5,5 0 1 1 -7,-6 a8,8 0 1 1 12,8" fill="none" stroke="#c95d7f" strokeWidth="1.3" strokeLinecap="round" />
      <ellipse cx="16" cy="-11" rx="1.6" ry="1" fill={CHEEK} />
    </g>
  ),
  candles: () => (
    <g>
      <path d="M-14,0 L-14,-14 L-6,-14 L-6,0 Z" fill="#f6dbe4" {...ink} />
      <path d="M-4,0 L-4,-26 L4,-26 L4,0 Z" fill="#fbf2e6" {...ink} />
      <path d="M6,0 L6,-19 L14,-19 L14,0 Z" fill="#cdb8e0" {...ink} />
      <path d="M-4,-24 C-2,-21 0,-23 1,-21" fill="none" stroke="#efe3d0" strokeWidth="1.2" />
      {[-10, 0, 10].map((x, i) => (
        <g key={x} className="candle-flicker" style={{ animationDelay: `${-i * 0.4}s` }}>
          <path d={`M${x},${[-14, -26, -19][i]! - 2} C${x - 2.4},${[-14, -26, -19][i]! - 6} ${x},${[-14, -26, -19][i]! - 9} ${x},${[-14, -26, -19][i]! - 10} C${x + 0.6},${[-14, -26, -19][i]! - 8} ${x + 2.4},${[-14, -26, -19][i]! - 6} ${x},${[-14, -26, -19][i]! - 2} Z`} fill="#f6c25a" {...thin} strokeWidth="0.6" />
        </g>
      ))}
    </g>
  ),
  teapot: () => (
    <g>
      <path d="M14,-16 C22,-18 24,-26 20,-28" fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M14,-16 C22,-18 24,-26 20,-28" fill="none" stroke="#f3b3c6" strokeWidth="2" strokeLinecap="round" />
      <path d="M-16,-10 C-24,-12 -26,-20 -30,-22 L-27,-24 C-22,-20 -20,-16 -14,-16 Z" fill="#f3b3c6" {...ink} />
      <path d="M-16,0 C-20,-8 -18,-22 0,-24 C18,-22 20,-8 16,0 Z" fill="#f3b3c6" {...ink} />
      <path d="M-8,-24 C-6,-30 6,-30 8,-24 Z" fill="#f3b3c6" {...ink} />
      <circle cx="0" cy="-31" r="2.4" fill="#f3b3c6" {...ink} />
      {[[-8, -12], [0, -16], [8, -10], [-2, -6], [6, -19]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="1.5" fill="#fff" />
      ))}
    </g>
  ),
  toadstool: () => (
    <g>
      <path d="M-11,0 L-10,-22 L10,-22 L11,0 Z" fill="#fbf2e6" {...ink} />
      <path d="M-4,0 L-4,-9 C-4,-13 4,-13 4,-9 L4,0 Z" fill="#a26d41" {...ink} />
      <circle cx="2" cy="-5" r="0.8" fill="#e2ad3f" />
      <circle cx="-6" cy="-16" r="2.6" fill="#f6d48a" {...thin} />
      <path d="M-24,-22 C-24,-44 24,-44 24,-22 C14,-18 -14,-18 -24,-22 Z" fill="#d9534f" {...ink} />
      {[[-12, -32, 2.6], [2, -37, 2], [12, -28, 2.4], [-2, -26, 1.6]].map(([x, y, r]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#fff" />
      ))}
    </g>
  ),
  geode: () => (
    <g>
      <path d="M-18,0 C-22,-12 -14,-26 0,-26 C14,-26 22,-12 18,0 Z" fill="#9c8f8a" {...ink} />
      <path d="M-13,-2 C-15,-10 -9,-20 0,-20 C9,-20 15,-10 13,-2 Z" fill="#5b3a7a" {...thin} />
      {[[-8, -4, -12], [-3, -4, -16], [3, -4, -15], [8, -4, -11], [0, -4, -10]].map(([x, b, t], i) => (
        <path key={i} d={`M${x! - 2.6},${b} L${x},${t} L${x! + 2.6},${b} Z`} fill={i % 2 ? '#c9b2ea' : '#a98bd6'} {...thin} strokeWidth="0.5" />
      ))}
      <path d="M-6,-14 L-4,-17" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
    </g>
  ),
  sleepybat: () => (
    <g>
      <path d="M-12,0 C-16,-10 -14,-24 0,-26 C14,-24 16,-10 12,0 Z" fill="#2b2331" {...ink} />
      <path d="M-12,-2 C-18,-8 -18,-18 -12,-22 C-8,-14 -8,-6 -12,-2 Z M12,-2 C18,-8 18,-18 12,-22 C8,-14 8,-6 12,-2 Z" fill="#3a2f40" {...ink} />
      <path d="M-7,-24 L-8,-31 L-3,-26 M7,-24 L8,-31 L3,-26" fill="#2b2331" {...ink} />
      <path d="M-6,-16 Q-4,-14 -2,-16 M2,-16 Q4,-14 6,-16" fill="none" stroke="#f6ead8" strokeWidth="1" strokeLinecap="round" />
      <ellipse cx="-6" cy="-12" rx="1.8" ry="1.1" fill={CHEEK} opacity="0.8" />
      <ellipse cx="6" cy="-12" rx="1.8" ry="1.1" fill={CHEEK} opacity="0.8" />
      <g className="keeper-z" fill="none" stroke={INK} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12,-30 L17,-30 L12,-25 L17,-25" />
      </g>
    </g>
  ),
  hourglass: () => (
    <g>
      <path d="M-11,-30 L11,-30 L11,-27 L-11,-27 Z M-11,0 L11,0 L11,-3 L-11,-3 Z" fill="#a26d41" {...ink} />
      <path d="M-9,-27 L-9,-3 M9,-27 L9,-3" stroke="#8a5a32" strokeWidth="1.8" />
      <path d="M-7,-27 C-7,-20 -1,-17 -1,-15 C-1,-13 -7,-10 -7,-3 L7,-3 C7,-10 1,-13 1,-15 C1,-17 7,-20 7,-27 Z" fill="#e8f1f4" fillOpacity="0.7" {...thin} />
      <path d="M-5,-23 C-3,-20 3,-20 5,-23 C3,-19 1,-17 0,-15 C-1,-17 -3,-19 -5,-23 Z M-6,-3 C-4,-8 4,-8 6,-3 Z" fill="#f3b3c6" />
      <path d="M0,-15 L0,-6" stroke="#f3b3c6" strokeWidth="0.8" className="sand-fall" />
    </g>
  ),
  piorun: () => (
    <g>
      <path d="M-12,0 C-14,-8 -12,-16 -6,-18 L6,-18 C12,-16 14,-8 12,0 Z" fill="#e3e0db" {...ink} />
      <path d="M-6,-20 L-9,-36 L-1,-26 Z M6,-20 L9,-36 L1,-26 Z" fill="#23201f" {...ink} />
      <ellipse cx="0" cy="-22" rx="10" ry="9" fill="#e3e0db" {...ink} />
      {[[-6, -10], [5, -7], [-3, -4], [8, -13], [-9, -14], [4, -26], [-5, -27]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="0.8" fill="#4a4648" />
      ))}
      <ellipse cx="0" cy="-17" rx="5" ry="3.6" fill="#f0ede8" />
      <circle cx="-4" cy="-23" r="1.4" fill="#1f1719" />
      <circle cx="4" cy="-23" r="1.4" fill="#1f1719" />
      <ellipse cx="0" cy="-19" rx="1.8" ry="1.3" fill="#231b1e" />
      <path d="M-3,-14 L-2,-11 L-1,-13 L0,-10.6 L1,-13 L2,-11 L3,-14" fill="#f0ede8" {...thin} strokeWidth="0.5" />
    </g>
  ),
  bajzel: () => (
    <g>
      <path d="M-12,0 C-14,-8 -12,-16 -6,-18 L6,-18 C12,-16 14,-8 12,0 Z" fill="#f4efe6" {...ink} />
      <ellipse cx="0" cy="-22" rx="10" ry="9" fill="#f4efe6" {...ink} />
      <path d="M-3,-30 C1,-31 6,-28 8,-24 C6,-22 3,-23 1,-26 Z" fill="#a6643b" />
      <path d="M-9,-26 C-14,-26 -15,-20 -11,-18 C-10,-21 -9,-24 -7,-25 Z M9,-26 C14,-26 15,-20 11,-18 C10,-21 9,-24 7,-25 Z" fill="#a6643b" {...ink} />
      <circle cx="-4" cy="-22" r="1.4" fill="#1f1719" />
      <circle cx="4" cy="-22" r="1.4" fill="#1f1719" />
      <ellipse cx="0" cy="-18" rx="1.8" ry="1.3" fill="#2a1d1c" />
      <path d="M-1.6,-15.6 Q0,-13 1.6,-15.6 Z" fill="#e5899a" />
    </g>
  ),
  musicbox: () => (
    <g>
      <path d="M-16,0 L16,0 L16,-14 L-16,-14 Z" fill="#c88e5d" {...ink} />
      <path d="M-16,-14 L16,-14 L20,-30 L-12,-30 Z" fill="#e2ae7f" {...ink} />
      <path d="M-12,-8 L12,-8" stroke="#e2ad3f" strokeWidth="1.4" />
      <circle cx="0" cy="-8" r="1.6" fill="#e2ad3f" {...thin} strokeWidth="0.5" />
      {/* a little pansy that turns while it plays */}
      <path d="M0,-14 L0,-20" stroke="#5e7d3c" strokeWidth="1.2" />
      <g className="musicbox-turn">
        <PansyFlower x={0} y={-23} s={0.22} c={designColors({ id: 'm', name: '', top: '#2c1733', low: '#f0a8c0', face: 'whiskers', faceColor: '#2c1733', edge: null })} />
      </g>
    </g>
  ),
  snowglobe: () => (
    <g>
      <path d="M-14,0 L14,0 L11,-7 L-11,-7 Z" fill="#8a5a32" {...ink} />
      <circle cx="0" cy="-20" r="14" fill="#dfeef6" fillOpacity="0.7" {...ink} />
      <path d="M-5,-9 L-5,-15 L0,-19 L5,-15 L5,-9 Z" fill="#ef9db3" {...thin} />
      <path d="M-1.4,-9 L-1.4,-12.6 L1.4,-12.6 L1.4,-9 Z" fill="#8a5a32" />
      <path d="M-9,-9 L-7,-14 L-5,-9 Z" fill="#7fa36a" {...thin} strokeWidth="0.5" />
      <g className="snow-swirl" fill="#fff">
        {[[-6, -27], [4, -29], [8, -22], [-9, -19], [1, -24], [6, -15], [-3, -31]].map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r="0.9" />
        ))}
      </g>
      <path d="M-8,-29 C-6,-32 -2,-33 1,-33" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  ),
  moonlamp: () => (
    <g>
      <circle className="moonlamp-glow" cx="0" cy="-20" r="22" fill="url(#moonlamp-glow)" />
      <path d="M-8,0 L8,0 L6,-5 L-6,-5 Z" fill="#3a2d3b" {...ink} />
      <circle cx="0" cy="-19" r="13" fill="#f6efd2" {...ink} />
      <circle cx="-4" cy="-23" r="2.6" fill="#e8dfb8" />
      <circle cx="4" cy="-15" r="1.8" fill="#e8dfb8" />
      <circle cx="5" cy="-24" r="1.2" fill="#e8dfb8" />
    </g>
  ),
};

/**
 * Milton: an egg, round and smooth and very slightly pink, sitting in a little knitted nest. He
 * never hatches. He doesn't need to: he keeps watch.
 */
/**
 * Milton: an egg, round and smooth and very slightly pink, in a little bed of his own, made just
 * like the dogs' one, only tiny. He keeps watch.
 */
export function Milton({ talking = false }: { talking?: boolean }) {
  const pansy = designColors({ id: 'mn', name: '', top: '#2c1733', low: '#f0a8c0', face: 'whiskers', faceColor: '#2c1733', edge: null });
  return (
    <g>
      <ellipse cx="0" cy="3" rx="26" ry="4.6" fill="#000" opacity="0.13" />
      {/* the far side of the rim, and the inside of the basket */}
      <ellipse cx="0" cy="-15" rx="23" ry="7.4" fill="#9a6a3c" />
      <path d="M-20,-14 C-12,-20.4 12,-20.4 20,-14" fill="none" stroke="#86592f" strokeWidth="2" />
      <path d="M-23,-15 A23,7.4 0 0 1 23,-15" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M-23,-15 A23,7.4 0 0 1 23,-15" fill="none" stroke="#c48d52" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M-23,-15 A23,7.4 0 0 1 23,-15" fill="none" stroke="#a5743f" strokeWidth="1" strokeDasharray="2.4 2" />
      {/* a soft pink blanket lining it */}
      <path d="M-19,-14 C-14,-19 14,-19 19,-14 C14,-10 -14,-10 -19,-14 Z" fill="#efb3c4" />
      <path d="M-12,-16.6 C-6,-18.4 4,-18.4 10,-17" fill="none" stroke="#f7d3dd" strokeWidth="1.4" strokeLinecap="round" />
      {/* Milton, sat down in it */}
      <g className={`milton${talking ? ' talking' : ''}`}>
        <path d="M0,-41 C9,-41 13.6,-29 13.6,-21 C13.6,-13 7.4,-8 0,-8 C-7.4,-8 -13.6,-13 -13.6,-21 C-13.6,-29 -9,-41 0,-41 Z" fill="#f4dccb" {...ink} />
        <path d="M5.6,-36 C10,-31 10.8,-23 9,-16.4 C11.8,-20.4 11.8,-30 5.6,-36 Z" fill="#e8c4ae" />
        <ellipse cx="-5.2" cy="-32" rx="2.6" ry="4.6" fill="#fff" opacity="0.75" transform="rotate(-18 -5.2 -32)" />
        <circle cx="-6.4" cy="-25.6" r="0.9" fill="#fff" opacity="0.6" />
      </g>
      {/* a plump little cushion he sinks into, puffing up around him */}
      <g transform="translate(0 -4.4)">
        <path d="M-20,-8 C-21.4,-14 -17,-18.6 -12.4,-16.6 C-10,-14.4 -9,-13.2 -7,-12.6 C-4,-11.8 4,-11.8 7,-12.6 C9,-13.2 10,-14.4 12.4,-16.6 C17,-18.6 21.4,-14 20,-8 L20,0 L-20,0 Z" fill="#f6c3d1" {...thin} />
        <path d="M-17.6,-12.8 C-16.6,-15.4 -14.4,-16.4 -12.8,-15.6 M17.6,-12.8 C16.6,-15.4 14.4,-16.4 12.8,-15.6" fill="none" stroke="#fde3ea" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M-7,-11.6 C-3,-9.6 3,-9.6 7,-11.6" fill="none" stroke="#e59bb0" strokeWidth="1" strokeLinecap="round" />
        <circle cx="-14" cy="-11.6" r="1" fill="#e59bb0" />
        <circle cx="14" cy="-11.6" r="1" fill="#e59bb0" />
      </g>
      {/* the near side of the basket, in front of him, woven round */}
      <path d="M-23,-15 A23,7.4 0 0 0 23,-15 L20,-2.4 C14,1.6 -14,1.6 -20,-2.4 Z" fill="#d6a467" {...ink} />
      <path d="M-22.2,-10.6 C-12,-5.8 12,-5.8 22.2,-10.6 M-21.2,-6.4 C-11.4,-2 11.4,-2 21.2,-6.4" fill="none" stroke="#a5743f" strokeWidth="0.9" />
      {[-17, -10.4, -3.6, 3.2, 10, 16.6].map((x, i) => (
        <path
          key={x}
          d={`M${x},${-9.6 + Math.abs(x) * 0.12} l${x * 0.03},${3.4} M${x + 3.3},${-5.6 + Math.abs(x) * 0.1} l${x * 0.03},${3.2}`}
          stroke="#a5743f"
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity={i % 2 ? 0.9 : 0.7}
        />
      ))}
      {/* the braided rim along the near edge */}
      <path d="M-23,-15 A23,7.4 0 0 0 23,-15" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M-23,-15 A23,7.4 0 0 0 23,-15" fill="none" stroke="#c48d52" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M-23,-15 A23,7.4 0 0 0 23,-15" fill="none" stroke="#a5743f" strokeWidth="1" strokeDasharray="2.4 2" />
      {/* a corner of the blanket hanging over the edge */}
      <path d="M-15,-11.4 C-12,-9.4 -7,-8.6 -4,-8.6 C-4.6,-5 -6.6,-1.6 -9.4,-0.6 C-10.4,-3.6 -12.6,-6.4 -15.4,-7.6 Z" fill="#efb3c4" {...thin} />
      {/* a bratek tucked in at the side */}
      <g transform="translate(17 -13) rotate(16)">
        <PansyFlower x={0} y={0} s={0.2} c={pansy} />
      </g>
      {/* and a little heart tag with his initial */}
      <g transform="translate(9 -5) rotate(6)">
        <path d="M0,-3 L0,0" stroke="#c9a45c" strokeWidth="0.8" />
        <path d="M0,7 C-5,3.6 -6,0.6 -3.8,-0.6 C-2.4,-1.4 -0.8,-0.8 0,0.4 C0.8,-0.8 2.4,-1.4 3.8,-0.6 C6,0.6 5,3.6 0,7 Z" fill="#fbf4e8" {...thin} />
        <path d="M-1.8,4 L-1.8,1.4 L0,3 L1.8,1.4 L1.8,4" fill="none" stroke="#c0435f" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
}

export function TrinketArt({ id }: { id: string }) {
  if (id === 'milton') return <Milton />;
  const Charm = CHARMS[id];
  if (Charm) return <Charm />;
  const Figure = FIGURES[id];
  return Figure ? <Figure /> : null;
}

/** A trinket on its own, fitted into a square: for cards and the box. */
export function TrinketPortrait({ id, className }: { id: string; className?: string }) {
  const charm = !!CHARMS[id];
  return (
    <svg className={className} viewBox={charm ? '-14 -2 28 28' : id === 'milton' ? '-28 -44 56 50' : '-22 -40 44 44'} aria-hidden="true">
      <defs>
        <radialGradient id="moonlamp-glow">
          <stop offset="0" stopColor="#fff3c8" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff3c8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <TrinketArt id={id} />
    </svg>
  );
}

export const isCharmArt = (id: string) => !!CHARMS[id];

/** The back of a night-market card: a moon and stars, edged in its rarity once it's known. */
export function CardBack() {
  return (
    <svg viewBox="0 0 60 84" aria-hidden="true">
      <rect x="1" y="1" width="58" height="82" rx="7" fill="#2f2447" stroke={INK} strokeWidth="1.4" />
      <rect x="5" y="5" width="50" height="74" rx="5" fill="none" stroke="#c9a45c" strokeWidth="0.9" strokeDasharray="2 2" />
      <path d="M34,30 C24,30 20,44 28,52 C16,50 14,32 34,30 Z" fill="#f2d16b" />
      {[[16, 20], [44, 18], [46, 60], [14, 64], [40, 46]].map(([x, y]) => (
        <path key={`${x}${y}`} d={`M${x},${y! - 3} L${x! + 0.9},${y! - 0.9} L${x! + 3},${y} L${x! + 0.9},${y! + 0.9} L${x},${y! + 3} L${x! - 0.9},${y! + 0.9} L${x! - 3},${y} L${x! - 0.9},${y! - 0.9} Z`} fill="#f6efd2" />
      ))}
    </svg>
  );
}

/**
 * The string across the window, with her charms hanging from it, each swaying a little on its own.
 * It hangs from either side of the frame and dips in the middle.
 */
export function Garland({ charms, from = [62, 228], to = [338, 228], sag = 14 }: { charms: string[]; from?: [number, number]; to?: [number, number]; sag?: number }) {
  if (charms.length === 0) return null;
  const [x0, y0] = from;
  const [x1, y1] = to;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2 + sag * 2;
  const at = (t: number) => [(1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1, (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1] as const;
  return (
    <g className="garland" pointerEvents="none">
      <path d={`M${x0},${y0} Q${cx},${cy} ${x1},${y1}`} fill="none" stroke={INK} strokeWidth="2.6" opacity="0.55" />
      <path d={`M${x0},${y0} Q${cx},${cy} ${x1},${y1}`} fill="none" stroke="#e9d8b8" strokeWidth="1.4" />
      <circle cx={x0} cy={y0} r="2.2" fill="#c9a45c" stroke={INK} strokeWidth="0.8" />
      <circle cx={x1} cy={y1} r="2.2" fill="#c9a45c" stroke={INK} strokeWidth="0.8" />
      {charms.map((id, i) => {
        const [x, y] = at((i + 1) / (charms.length + 1));
        const Charm = CHARMS[id];
        if (!Charm) return null;
        return (
          <g key={id} transform={`translate(${x.toFixed(1)} ${(y - 2).toFixed(1)}) scale(1.6)`}>
            <g className="charm-sway" style={{ animationDelay: `${-i * 0.7}s`, animationDuration: `${3.4 + (i % 3) * 0.6}s` }}>
              <Charm />
            </g>
          </g>
        );
      })}
    </g>
  );
}
