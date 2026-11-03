import type { ReactNode } from 'react';
import type { VisitorId } from '../garden/visitors';

/**
 * The visitors, drawn: round, soft and a little silly, in the garden's ink. Each one stands (or
 * hovers) on (0,0) and comes in four moods: waiting at the door, happy, delighted with what they
 * got, and politely puzzled by it.
 */
export type VisitorMood = 'waiting' | 'happy' | 'delighted' | 'puzzled';

const INK = 'var(--visitor-ink, #3d2633)';
const CHEEK = '#f08ea6';

/** A fluffy outline: an ellipse with soft scalloped tufts all round, for fur and fuzz. */
function fuzz(cx: number, cy: number, rx: number, ry: number, tufts: number, puff: number, turn = 0): string {
  const pt = (a: number, k: number) => [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k] as const;
  const step = (Math.PI * 2) / tufts;
  const [x0, y0] = pt(turn, 1);
  let d = `M${x0.toFixed(1)},${y0.toFixed(1)}`;
  for (let i = 0; i < tufts; i++) {
    const a = turn + i * step;
    const [cx1, cy1] = pt(a + step * 0.5, 1 + puff);
    const [x1, y1] = pt(a + step, 1);
    d += ` Q${cx1.toFixed(1)},${cy1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
  }
  return `${d} Z`;
}

/**
 * Eyes: big and glossy with two highlights; shut in happy arcs when delighted; a little smaller,
 * one brow up, when puzzled. `light` draws them for a dark face (the cat's).
 */
function Eyes({ x, y, gap, r, mood, iris = '#2a1d26', light = false, lids = true }: {
  x: number;
  y: number;
  gap: number;
  r: number;
  mood: VisitorMood;
  iris?: string;
  light?: boolean;
  lids?: boolean;
}) {
  const line = light ? '#f6ead8' : INK;
  if (mood === 'delighted') {
    return (
      <g fill="none" stroke={line} strokeWidth={r * 0.36} strokeLinecap="round">
        {[-1, 1].map((s) => (
          <path key={s} d={`M${x + s * gap - r},${y + r * 0.25} Q${x + s * gap},${y - r * 1.15} ${x + s * gap + r},${y + r * 0.25}`} />
        ))}
      </g>
    );
  }
  const k = mood === 'puzzled' ? 0.86 : 1;
  return (
    <g>
      <g className={lids ? 'visitor-blink' : undefined}>
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${x + s * gap} ${y})`}>
            <ellipse rx={r * 0.86 * k} ry={r * k} fill={iris} />
            {light && <ellipse rx={r * 0.34 * k} ry={r * 0.8 * k} fill="#1a1219" />}
            <circle cx={-r * 0.3} cy={-r * 0.36} r={r * 0.36 * k} fill="#ffffff" />
            <circle cx={r * 0.32} cy={r * 0.36} r={r * 0.15 * k} fill="#ffffff" opacity="0.9" />
          </g>
        ))}
      </g>
      {mood === 'puzzled' && (
        <path d={`M${x + gap - r},${y - r * 1.75} Q${x + gap},${y - r * 2.35} ${x + gap + r * 1.05},${y - r * 1.65}`} fill="none" stroke={line} strokeWidth={r * 0.3} strokeLinecap="round" />
      )}
    </g>
  );
}

/** A mouth for each mood: a small smile, an open happy one, a wide delighted one, a wobbly one. */
function Mouth({ x, y, w, mood, light = false, cat = false }: { x: number; y: number; w: number; mood: VisitorMood; light?: boolean; cat?: boolean }) {
  const line = light ? '#f6ead8' : INK;
  const sw = Math.max(1.1, w * 0.16);
  if (mood === 'puzzled') {
    return <path d={`M${x - w * 0.6},${y} q${w * 0.3},${-w * 0.35} ${w * 0.6},0 t${w * 0.6},0`} fill="none" stroke={line} strokeWidth={sw} strokeLinecap="round" />;
  }
  if (mood === 'waiting') {
    return cat ? (
      <path d={`M${x - w * 0.7},${y - w * 0.1} q${w * 0.35},${w * 0.5} ${w * 0.7},0 q${w * 0.35},${w * 0.5} ${w * 0.7},0`} fill="none" stroke={line} strokeWidth={sw} strokeLinecap="round" />
    ) : (
      <path d={`M${x - w * 0.55},${y - w * 0.1} Q${x},${y + w * 0.5} ${x + w * 0.55},${y - w * 0.1}`} fill="none" stroke={line} strokeWidth={sw} strokeLinecap="round" />
    );
  }
  const big = mood === 'delighted' ? 1.25 : 1;
  const hw = w * 0.7 * big;
  const depth = w * 0.95 * big;
  return (
    <g>
      <path d={`M${x - hw},${y - w * 0.15} Q${x},${y - w * 0.3} ${x + hw},${y - w * 0.15} Q${x + hw * 0.8},${y + depth} ${x},${y + depth} Q${x - hw * 0.8},${y + depth} ${x - hw},${y - w * 0.15} Z`} fill="#6b2a3a" stroke={line} strokeWidth={sw * 0.8} strokeLinejoin="round" />
      <path d={`M${x - hw * 0.5},${y + depth * 0.78} Q${x},${y + depth * 0.35} ${x + hw * 0.5},${y + depth * 0.78} Q${x},${y + depth * 1.02} ${x - hw * 0.5},${y + depth * 0.78} Z`} fill="#ec8c9e" />
    </g>
  );
}

function Cheeks({ x, y, gap, r, strong = false }: { x: number; y: number; gap: number; r: number; strong?: boolean }) {
  return (
    <g fill={CHEEK} opacity={strong ? 0.75 : 0.55}>
      <ellipse cx={x - gap} cy={y} rx={r} ry={r * 0.62} />
      <ellipse cx={x + gap} cy={y} rx={r} ry={r * 0.62} />
    </g>
  );
}

/** A couple of little hearts floating up beside a delighted visitor. */
function Joy({ x, y }: { x: number; y: number }) {
  const heart = 'M0,2.6 C-3.4,0 -4.4,-2.6 -2.4,-4 C-1.2,-4.8 0,-4 0,-3 C0,-4 1.2,-4.8 2.4,-4 C4.4,-2.6 3.4,0 0,2.6 Z';
  return (
    <g className="visitor-joy">
      <path d={heart} transform={`translate(${x} ${y}) scale(1.4)`} fill="#e86f8c" stroke={INK} strokeWidth="0.6" />
      <path d={heart} transform={`translate(${x + 12} ${y - 12}) scale(1)`} fill="#f2a3b6" stroke={INK} strokeWidth="0.6" />
    </g>
  );
}

/** A question mark, drawn by hand, for a puzzled one. */
function Wonder({ x, y }: { x: number; y: number }) {
  return (
    <g className="visitor-wonder" transform={`translate(${x} ${y})`}>
      <path d="M-4,-6 C-4,-11 5,-11.6 5,-6 C5,-2.4 0.6,-2 0.6,2" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="0.7" cy="6.4" r="1.5" fill={INK} />
    </g>
  );
}

// ---- Jingleton -------------------------------------------------------------------------------

/**
 * Jingleton: a big, round, very fluffy bumblebee in a little bow tie, with stubby legs, pollen in
 * his baskets and wings far too small for him. He hovers, humming.
 */
function Jingleton({ mood }: { mood: VisitorMood }) {
  const body = fuzz(0, -50, 35, 31, 26, 0.07);
  return (
    <g className="visitor-hover">
      <defs>
        <clipPath id="jingleton-body">
          <path d={body} />
        </clipPath>
      </defs>
      {/* wings, behind: tiny, glassy, always going */}
      <g className="visitor-wing" style={{ transformOrigin: '-14px -70px' }}>
        <path d="M-14,-70 C-30,-92 -50,-88 -48,-76 C-46,-66 -28,-64 -14,-70 Z" fill="#eaf4fa" fillOpacity="0.8" stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
        <path d="M-17,-71 C-28,-78 -38,-80 -44,-77" fill="none" stroke="#b9cfdc" strokeWidth="0.9" />
      </g>
      <g className="visitor-wing right" style={{ transformOrigin: '14px -70px' }}>
        <path d="M14,-70 C30,-92 50,-88 48,-76 C46,-66 28,-64 14,-70 Z" fill="#eaf4fa" fillOpacity="0.8" stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
        <path d="M17,-71 C28,-78 38,-80 44,-77" fill="none" stroke="#b9cfdc" strokeWidth="0.9" />
      </g>
      {/* little legs dangling, two with full pollen baskets */}
      <g stroke={INK} strokeWidth="1.2" strokeLinejoin="round">
        <path d="M-16,-24 C-18,-18 -19,-14 -17,-11" fill="none" strokeWidth="3" strokeLinecap="round" />
        <path d="M-5,-21 C-6,-15 -6,-11 -4,-8" fill="none" strokeWidth="3" strokeLinecap="round" />
        <path d="M5,-21 C6,-15 6,-11 4,-8" fill="none" strokeWidth="3" strokeLinecap="round" />
        <path d="M16,-24 C18,-18 19,-14 17,-11" fill="none" strokeWidth="3" strokeLinecap="round" />
        <circle cx="-18" cy="-15" r="3.6" fill="#f0a23a" />
        <circle cx="18" cy="-15" r="3.6" fill="#f0a23a" />
      </g>
      {/* the round fluffy body: honey on top, a black band, more honey, and a creamy tail */}
      <path d={body} fill="#f3c34c" />
      <g clipPath="url(#jingleton-body)">
        <path d="M-40,-40 Q0,-30 40,-40 L40,-30 Q0,-20 -40,-30 Z" fill="#2c2326" />
        <path d="M-40,-25 Q0,-15 40,-25 L40,-17 Q0,-7 -40,-17 Z" fill="#2c2326" />
        <path d="M-40,-14 Q0,-4 40,-14 L40,0 L-40,0 Z" fill="#f6ecd8" />
        {/* little strokes of fuzz, and soft light from above, shade underneath */}
        <g fill="none" stroke="#d9a23a" strokeWidth="1" strokeLinecap="round" opacity="0.7">
          <path d="M-24,-60 l-2,-3 M-20,-66 l-1,-3.4 M24,-60 l2,-3 M20,-66 l1,-3.4 M-28,-50 l-3,-1 M28,-50 l3,-1" />
        </g>
        <ellipse cx="-12" cy="-70" rx="16" ry="7" fill="#fbe39b" opacity="0.8" />
        <path d="M-36,-46 C-34,-30 -22,-22 -6,-20 C-24,-26 -32,-36 -34,-48 Z" fill="#000" opacity="0.08" />
      </g>
      <path d={body} fill="none" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      {/* a tuft of fluff on top */}
      <path d="M-5,-80 C-6,-86 -1,-88 0,-84 C1,-89 7,-88 5,-81" fill="#f3c34c" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
      {/* antennae with round tips, a bit wobbly */}
      <g fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" className="visitor-antennae">
        <path d="M-9,-78 C-12,-88 -18,-92 -22,-92" />
        <path d="M9,-78 C12,-88 18,-92 22,-92" />
      </g>
      <circle cx="-23" cy="-92" r="3" fill="#2c2326" stroke={INK} strokeWidth="1" />
      <circle cx="23" cy="-92" r="3" fill="#2c2326" stroke={INK} strokeWidth="1" />
      {/* his face */}
      <Eyes x={0} y={-58} gap={11.5} r={5.8} mood={mood} />
      <Cheeks x={0} y={-50} gap={20} r={4.6} strong={mood === 'delighted'} />
      <Mouth x={0} y={-50} w={4.4} mood={mood} />
      {/* the bow tie, a little crooked */}
      <g transform="translate(0 -36) rotate(-6)">
        <path d="M0,0 C-4,-5 -11,-6 -11,0 C-11,6 -4,5 0,0 Z M0,0 C4,-5 11,-6 11,0 C11,6 4,5 0,0 Z" fill="#e7809b" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
        <circle r="2.4" fill="#d1607e" stroke={INK} strokeWidth="0.9" />
        <circle cx="-6" cy="0" r="0.9" fill="#fff" opacity="0.8" />
        <circle cx="6" cy="0" r="0.9" fill="#fff" opacity="0.8" />
      </g>
      {mood === 'delighted' && <Joy x={34} y={-84} />}
      {mood === 'puzzled' && <Wonder x={34} y={-110} />}
    </g>
  );
}

// ---- Duszek ----------------------------------------------------------------------------------

/** Duszek: a small, shy sheet ghost with a pink bow, holding a moonflower; only comes out at night. */
function Duszek({ mood }: { mood: VisitorMood }) {
  const sheet = 'M0,-112 C24,-112 38,-94 38,-68 L38,-26 Q33,-16 27,-24 Q21,-14 14,-23 Q7,-13 0,-22 Q-7,-13 -14,-23 Q-21,-14 -27,-24 Q-33,-16 -38,-26 L-38,-68 C-38,-94 -24,-112 0,-112 Z';
  return (
    <g className="visitor-float">
      {/* a soft shadow on the ground, far below */}
      <ellipse cx="0" cy="-2" rx="22" ry="3.4" fill="#000" opacity="0.1" className="visitor-shadow" />
      <path d={sheet} fill="#f8f7fc" />
      <path d="M38,-68 L38,-26 Q33,-16 27,-24 Q21,-14 14,-23 C24,-40 28,-62 22,-90 C32,-86 38,-78 38,-68 Z" fill="#dfe3f2" />
      <path d="M-24,-100 C-30,-92 -32,-82 -31,-72" fill="none" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" />
      <path d={sheet} fill="none" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      {/* little arms; one holds a moonflower */}
      <path d="M-37,-56 C-46,-54 -48,-46 -42,-44 C-39,-44 -37,-47 -36,-50" fill="#f8f7fc" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
      <g transform="translate(40 -50)">
        <path d="M0,0 C4,-4 6,-14 4,-24" fill="none" stroke="#6f9a6a" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M3,-12 C8,-14 11,-11 10,-8 C7,-8 5,-9 3,-12 Z" fill="#8bb07e" stroke={INK} strokeWidth="0.8" />
        <g transform="translate(4 -27)">
          {[0, 72, 144, 216, 288].map((a) => (
            <path key={a} transform={`rotate(${a})`} d="M0,0 C-3.4,-3 -3,-8 0,-9.4 C3,-8 3.4,-3 0,0 Z" fill="#fbfaf2" stroke={INK} strokeWidth="0.8" />
          ))}
          <circle r="2" fill="#f4e7a8" stroke={INK} strokeWidth="0.6" />
        </g>
        <path d="M-3,2 C-8,4 -9,-3 -4,-4 C-2,-4 0,-2 0,0" fill="#f8f7fc" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
      </g>
      {/* the bow, on the top of its head */}
      <g transform="translate(15 -106) rotate(18)">
        <path d="M0,0 C-4,-6 -11,-6 -10,0 C-9,5 -4,4 0,0 Z M0,0 C4,-6 11,-6 10,0 C9,5 4,4 0,0 Z" fill="#f2a3b8" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
        <circle r="2.2" fill="#e5849f" stroke={INK} strokeWidth="0.8" />
      </g>
      <Eyes x={0} y={-74} gap={12} r={7} mood={mood} />
      <Cheeks x={0} y={-63} gap={20} r={5} strong={mood !== 'waiting'} />
      {mood === 'waiting' ? (
        <ellipse cx="0" cy="-60" rx="2.6" ry="3.2" fill="#6b2a3a" stroke={INK} strokeWidth="0.9" />
      ) : (
        <Mouth x={0} y={-61} w={4.6} mood={mood} />
      )}
      {mood === 'delighted' && <Joy x={-36} y={-104} />}
      {mood === 'puzzled' && <Wonder x={-38} y={-104} />}
    </g>
  );
}

// ---- Atrament --------------------------------------------------------------------------------

const FUR = '#2b2331';
const FUR_HI = '#4a3d54';

/** Atrament: a round black cat with golden eyes and a bell on a pink collar, sitting very properly. */
function Atrament({ mood }: { mood: VisitorMood }) {
  return (
    <g>
      <ellipse cx="2" cy="-1" rx="30" ry="4" fill="#000" opacity="0.12" />
      {/* the tail, curled round, with a swish now and then */}
      <g className="visitor-tail" style={{ transformOrigin: '20px -8px' }}>
        <path d="M18,-6 C34,-4 44,-14 42,-30 C41,-40 34,-44 30,-40 C28,-37 32,-35 34,-31 C36,-22 30,-14 16,-14 Z" fill={FUR} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M31,-39 C29,-42 33,-45 36,-41" fill="none" stroke="#f6ead8" strokeWidth="2.2" strokeLinecap="round" />
      </g>
      {/* body, sat like a loaf with its front paws together */}
      <path d="M-25,-4 C-30,-22 -26,-44 0,-48 C26,-44 30,-22 25,-4 C18,0 -18,0 -25,-4 Z" fill={FUR} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M-20,-36 C-24,-26 -24,-16 -20,-8" fill="none" stroke={FUR_HI} strokeWidth="3" strokeLinecap="round" />
      <path d="M-14,-2 C-15,-9 -5,-10 -4,-3 C-5,0 -13,1 -14,-2 Z M14,-2 C15,-9 5,-10 4,-3 C5,0 13,1 14,-2 Z" fill={FUR} stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M-11,-2.6 L-11,-5.4 M-7.6,-2.4 L-7.6,-5 M11,-2.6 L11,-5.4 M7.6,-2.4 L7.6,-5" stroke={FUR_HI} strokeWidth="1.1" strokeLinecap="round" />
      {/* a white star of a bib, the only bit of him that isn't ink */}
      <path d="M0,-34 L2,-29 L6.6,-28.6 L3,-25.6 L4.2,-21 L0,-23.6 L-4.2,-21 L-3,-25.6 L-6.6,-28.6 L-2,-29 Z" fill="#f6ead8" opacity="0.92" />
      {/* the collar and its bell */}
      <path d="M-18,-44 C-8,-38 8,-38 18,-44 L17,-40 C8,-34 -8,-34 -17,-40 Z" fill="#ec8aa5" stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
      <circle cx="0" cy="-35" r="4" fill="#e9bf4f" stroke={INK} strokeWidth="1.1" />
      <path d="M-2.6,-34.4 L2.6,-34.4" stroke={INK} strokeWidth="0.8" />
      <circle cx="-1.2" cy="-36.4" r="1" fill="#fff6d6" />
      {/* head: wide and round, with big ears */}
      <g className={mood === 'puzzled' ? 'visitor-tilt' : undefined} style={{ transformOrigin: '0px -50px' }}>
        <path d="M-28,-72 L-27,-100 C-26,-103 -24,-103 -22,-101 L-8,-86 Z" fill={FUR} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M28,-72 L27,-100 C26,-103 24,-103 22,-101 L8,-86 Z" fill={FUR} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M-24,-78 L-24,-95 L-14,-85 Z M24,-78 L24,-95 L14,-85 Z" fill="#e98aa4" opacity="0.9" />
        <ellipse cx="0" cy="-66" rx="32" ry="25" fill={FUR} stroke={INK} strokeWidth="1.5" />
        <path d="M-22,-80 C-14,-88 -2,-90 8,-89" fill="none" stroke={FUR_HI} strokeWidth="3" strokeLinecap="round" />
        {/* tufts of cheek fur */}
        <path d="M-31,-62 L-37,-60 L-31,-57 L-36,-53 L-29,-53" fill={FUR} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M31,-62 L37,-60 L31,-57 L36,-53 L29,-53" fill={FUR} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
        <Eyes x={0} y={-68} gap={13} r={7.6} mood={mood} iris="#e8c54a" light />
        <Cheeks x={0} y={-58} gap={20} r={4.6} strong={mood === 'delighted'} />
        <path d="M-2.6,-60.6 L2.6,-60.6 L0,-57.6 Z" fill="#ef9fb4" stroke="#f6ead8" strokeWidth="0.5" strokeLinejoin="round" />
        <Mouth x={0} y={-56} w={3.6} mood={mood} light cat />
        <g stroke="#a99bb3" strokeWidth="0.8" strokeLinecap="round" opacity="0.9">
          <path d="M-12,-58 L-30,-61 M-12,-56 L-30,-54" />
          <path d="M12,-58 L30,-61 M12,-56 L30,-54" />
        </g>
      </g>
      {mood === 'delighted' && <Joy x={32} y={-96} />}
      {mood === 'puzzled' && <Wonder x={36} y={-100} />}
    </g>
  );
}

// ---- Rechotka --------------------------------------------------------------------------------

/** Rechotka: a plump, beaming frog in yellow rain boots, under a big leaf for an umbrella. */
function Rechotka({ mood }: { mood: VisitorMood }) {
  return (
    <g>
      <ellipse cx="0" cy="-1" rx="30" ry="4" fill="#000" opacity="0.12" />
      {/* the leaf umbrella, held up high in her right hand */}
      <g className="visitor-sway" style={{ transformOrigin: '22px -40px' }}>
        <path d="M22,-40 C23,-62 22,-84 18,-100" fill="none" stroke="#5e7d3c" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M-30,-98 C-22,-122 26,-130 54,-104 C46,-100 40,-104 34,-98 C28,-104 18,-104 12,-98 C6,-104 -4,-104 -10,-97 C-16,-103 -26,-102 -30,-98 Z" fill="#7fb35c" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M18,-100 C14,-110 6,-118 -8,-118 M18,-100 C24,-110 34,-114 44,-110 M18,-100 C10,-106 -4,-108 -18,-104" fill="none" stroke="#5e8a42" strokeWidth="1" strokeLinecap="round" />
        <path d="M-18,-108 C-6,-120 10,-122 22,-120" fill="none" stroke="#a9d283" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      </g>
      {/* boots */}
      <g stroke={INK} strokeWidth="1.3" strokeLinejoin="round">
        <path d="M-22,0 L-22,-14 L-8,-14 L-8,-6 C-4,-6 -2,-3 -2,0 Z" fill="#f2c94c" />
        <path d="M22,0 L22,-14 L8,-14 L8,-6 C4,-6 2,-3 2,0 Z" fill="#f2c94c" />
        <path d="M-23,-14 L-7,-14 L-7,-17 L-23,-17 Z M23,-14 L7,-14 L7,-17 L23,-17 Z" fill="#e2b13a" />
      </g>
      <path d="M-19,-12 L-19,-4 M19,-12 L19,-4" stroke="#fbe7a6" strokeWidth="1.6" strokeLinecap="round" />
      {/* plump body */}
      <path d="M-30,-18 C-36,-36 -28,-60 -12,-62 L12,-62 C28,-60 36,-36 30,-18 C22,-12 -22,-12 -30,-18 Z" fill="#8cc068" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <ellipse cx="0" cy="-30" rx="18" ry="14" fill="#e3efb1" />
      <path d="M-24,-46 C-28,-38 -27,-28 -23,-22" fill="none" stroke="#b4d98f" strokeWidth="3" strokeLinecap="round" />
      {/* arms: the left one tucked, the right one up holding the leaf */}
      <path d="M-26,-36 C-32,-30 -28,-22 -20,-24" fill="none" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M24,-38 C30,-40 28,-46 22,-48 C20,-44 20,-40 24,-38 Z" fill="#8cc068" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
      {/* the head and its two big eye bumps */}
      <g className={mood === 'puzzled' ? 'visitor-tilt' : undefined} style={{ transformOrigin: '0px -50px' }}>
        <path d="M-32,-58 C-34,-74 -26,-84 -14,-82 C-8,-88 8,-88 14,-82 C26,-84 34,-74 32,-58 C26,-48 -26,-48 -32,-58 Z" fill="#8cc068" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="-15" cy="-76" r="11" fill="#8cc068" stroke={INK} strokeWidth="1.4" />
        <circle cx="15" cy="-76" r="11" fill="#8cc068" stroke={INK} strokeWidth="1.4" />
        <path d="M-22,-84 C-18,-87 -12,-87 -9,-85" fill="none" stroke="#b4d98f" strokeWidth="2" strokeLinecap="round" />
        {mood === 'delighted' ? (
          <Eyes x={0} y={-75} gap={15} r={6} mood={mood} />
        ) : (
          <>
            <circle cx="-15" cy="-76" r="7.6" fill="#fffdf4" />
            <circle cx="15" cy="-76" r="7.6" fill="#fffdf4" />
            <Eyes x={0} y={-75} gap={15} r={5.6} mood={mood} />
          </>
        )}
        <Cheeks x={0} y={-62} gap={22} r={5} strong />
        {mood === 'waiting' ? (
          <path d="M-14,-62 Q0,-52 14,-62" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
        ) : (
          <Mouth x={0} y={-62} w={6} mood={mood} />
        )}
        <circle cx="-4" cy="-68" r="0.9" fill={INK} />
        <circle cx="4" cy="-68" r="0.9" fill={INK} />
      </g>
      {mood === 'delighted' && <Joy x={-38} y={-90} />}
      {mood === 'puzzled' && <Wonder x={-40} y={-92} />}
    </g>
  );
}

// ---- people: skin, hair and the shared parts of a small round person -------------------------

const SKIN = '#f6d6c4';
const SKIN_SHADE = '#ebbca6';

/** A round head on (x, y), the face drawn by `face`. */
function Head({ y, r, children }: { y: number; r: number; children?: ReactNode }) {
  return (
    <g>
      <circle cx="0" cy={y} r={r} fill={SKIN} stroke={INK} strokeWidth="1.5" />
      <path d={`M${r * 0.55},${y - r * 0.75} C${r * 0.95},${y - r * 0.35} ${r * 0.98},${y + r * 0.3} ${r * 0.6},${y + r * 0.78} C${r * 0.82},${y + r * 0.2} ${r * 0.82},${y - r * 0.3} ${r * 0.55},${y - r * 0.75} Z`} fill={SKIN_SHADE} opacity="0.7" />
      {children}
    </g>
  );
}

// ---- Pani Jadzia -----------------------------------------------------------------------------

/** Pani Jadzia: a tiny, round grandma with a silver bun, big round glasses and a basket of wool. */
function Jadzia({ mood }: { mood: VisitorMood }) {
  return (
    <g>
      <ellipse cx="0" cy="-1" rx="30" ry="4" fill="#000" opacity="0.12" />
      {/* little shoes */}
      <path d="M-14,0 C-16,-4 -12,-7 -6,-6 L-4,0 Z M14,0 C16,-4 12,-7 6,-6 L4,0 Z" fill="#5a3a3a" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
      {/* a full skirt with polka dots */}
      <path d="M-18,-46 C-24,-30 -28,-14 -28,-6 C-14,-2 14,-2 28,-6 C28,-14 24,-30 18,-46 Z" fill="#d989a6" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <g fill="#f8e6ee">
        {[[-20, -12], [-10, -20], [2, -10], [12, -22], [20, -12], [-14, -32], [8, -36], [-4, -26]].map(([x, y]) => (
          <circle key={`${x},${y}`} cx={x} cy={y} r="1.6" />
        ))}
      </g>
      {/* the apron, with a scalloped hem */}
      <path d="M-11,-44 L11,-44 L14,-12 Q10,-8 7,-12 Q3.5,-8 0,-12 Q-3.5,-8 -7,-12 Q-10,-8 -14,-12 Z" fill="#fbf4e8" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M-6,-26 L6,-26 L6,-19 L-6,-19 Z" fill="none" stroke="#d5b9a6" strokeWidth="0.9" />
      {/* cardigan */}
      <path d="M-18,-46 C-20,-58 -12,-66 0,-66 C12,-66 20,-58 18,-46 Z" fill="#a9b99a" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M0,-66 L0,-46" stroke="#86977a" strokeWidth="1" />
      <circle cx="-3" cy="-58" r="1.3" fill="#f2e2c6" stroke={INK} strokeWidth="0.6" />
      <circle cx="-3" cy="-51" r="1.3" fill="#f2e2c6" stroke={INK} strokeWidth="0.6" />
      {/* the basket, with a ball of pink wool and knitting needles */}
      <g transform="translate(16 -34)">
        <path d="M-12,-8 C-12,-22 12,-22 12,-8" fill="none" stroke="#a5743f" strokeWidth="2" strokeLinecap="round" />
        <circle cx="-2" cy="-10" r="7" fill="#f09ab3" stroke={INK} strokeWidth="1.1" />
        <path d="M-7,-12 C-4,-8 1,-8 4,-12 M-6,-7 C-2,-4 2,-5 4,-8" fill="none" stroke="#d9728f" strokeWidth="0.9" />
        <path d="M2,-18 L10,-4 M6,-19 L8,-4" stroke="#c9a45c" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M-13,-8 L13,-8 L10,6 C6,8 -6,8 -10,6 Z" fill="#d6a467" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M-12,-3 L12,-3 M-11,2 L11,2 M-6,-8 L-5,7 M0,-8 L0,7.6 M6,-8 L5,7" stroke="#a5743f" strokeWidth="0.8" />
      </g>
      {/* arms */}
      <path d="M-17,-58 C-24,-48 -22,-38 -14,-36 C-12,-40 -12,-46 -12,-50" fill="#a9b99a" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M17,-58 C22,-50 20,-44 12,-40" fill="none" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="-14" cy="-35" r="3.2" fill={SKIN} stroke={INK} strokeWidth="1" />
      <circle cx="10" cy="-40" r="3.2" fill={SKIN} stroke={INK} strokeWidth="1" />
      {/* head: silver hair with a bun and a pansy pinned in it */}
      <g className={mood === 'puzzled' ? 'visitor-tilt' : undefined} style={{ transformOrigin: '0px -68px' }}>
        <circle cx="0" cy="-114" r="10" fill="#e8e4ec" stroke={INK} strokeWidth="1.4" />
        <path d="M-5,-118 C-2,-121 3,-121 6,-117" fill="none" stroke="#c6c0cc" strokeWidth="1.1" />
        <Head y={-88} r={24} />
        <path d="M-24,-88 C-26,-104 -14,-112 0,-112 C14,-112 26,-104 24,-88 C20,-96 12,-100 4,-98 C-2,-102 -12,-100 -16,-94 C-20,-96 -22,-92 -24,-88 Z" fill="#e8e4ec" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M-14,-104 C-8,-108 2,-108 8,-105" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <path d="M-25,-86 C-30,-84 -30,-76 -25,-75 M25,-86 C30,-84 30,-76 25,-75" fill="#e8e4ec" stroke={INK} strokeWidth="1.2" />
        <g transform="translate(9 -117)">
          {[0, 90, 180, 270].map((a) => (
            <ellipse key={a} transform={`rotate(${a + 45}) translate(0 -3.2)`} rx="2.6" ry="3.4" fill={a === 180 ? '#2c1733' : '#f0a8c0'} stroke={INK} strokeWidth="0.6" />
          ))}
          <circle r="1.2" fill="#f4d35e" />
        </g>
        <Eyes x={0} y={-85} gap={9.4} r={3.8} mood={mood} />
        {/* round glasses, a little too big */}
        <g fill="#ffffff" fillOpacity="0.18" stroke="#b08a3e" strokeWidth="1.3">
          <circle cx="-9.4" cy="-85" r="7.4" />
          <circle cx="9.4" cy="-85" r="7.4" />
          <path d="M-2,-86 Q0,-88 2,-86" fill="none" />
        </g>
        <Cheeks x={0} y={-76} gap={15} r={4.6} strong />
        <Mouth x={0} y={-74} w={3.6} mood={mood} />
        <circle cx="-23.6" cy="-79" r="1.5" fill="#fbf7f0" stroke={INK} strokeWidth="0.5" />
        <circle cx="23.6" cy="-79" r="1.5" fill="#fbf7f0" stroke={INK} strokeWidth="0.5" />
      </g>
      {mood === 'delighted' && <Joy x={30} y={-108} />}
      {mood === 'puzzled' && <Wonder x={32} y={-112} />}
    </g>
  );
}

// ---- the postman -----------------------------------------------------------------------------

/** The postman: round, cheerful, in a peaked cap, with an enormous moustache and a bag of letters. */
function Listonosz({ mood }: { mood: VisitorMood }) {
  return (
    <g>
      <ellipse cx="0" cy="-1" rx="30" ry="4" fill="#000" opacity="0.12" />
      <path d="M-15,0 C-17,-4 -13,-7 -6,-6 L-4,0 Z M15,0 C17,-4 13,-7 6,-6 L4,0 Z" fill="#4a3530" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
      {/* trousers and a round tummy in a blue jacket */}
      <path d="M-14,-24 L-13,-5 L-3,-5 L0,-18 L3,-5 L13,-5 L14,-24 Z" fill="#3b476a" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M-22,-30 C-26,-48 -18,-64 0,-64 C18,-64 26,-48 22,-30 C16,-20 -16,-20 -22,-30 Z" fill="#53679a" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M0,-64 L0,-24" stroke="#3b4b78" strokeWidth="1" />
      {[-56, -46, -36].map((y) => (
        <circle key={y} cx="3.4" cy={y} r="1.6" fill="#e9bf4f" stroke={INK} strokeWidth="0.6" />
      ))}
      <path d="M-18,-52 C-22,-44 -22,-36 -18,-30" fill="none" stroke="#7088be" strokeWidth="2.6" strokeLinecap="round" />
      {/* the bag strap, across, and the bag on his hip with letters peeking out */}
      <path d="M14,-62 L-20,-28" stroke="#8a5a32" strokeWidth="3.2" strokeLinecap="round" />
      <g transform="translate(-22 -30)">
        <path d="M-1,-2 L5,-12 L12,-3 Z" fill="#fbf4e8" stroke={INK} strokeWidth="0.9" strokeLinejoin="round" />
        <path d="M4,-6 L8,-14 L13,-6 Z" fill="#f2c4cf" stroke={INK} strokeWidth="0.9" strokeLinejoin="round" />
        <path d="M-8,-4 L14,-4 L13,14 C8,16 -4,16 -8,14 Z" fill="#a8703f" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M-8,-4 L14,-4 L13,4 C8,7 -4,7 -8,4 Z" fill="#bd8550" stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
        <circle cx="3" cy="4.4" r="1.6" fill="#e9bf4f" stroke={INK} strokeWidth="0.6" />
      </g>
      {/* his left arm waving a letter */}
      <g className="visitor-wave" style={{ transformOrigin: '20px -56px' }}>
        <path d="M18,-58 C26,-64 30,-74 28,-82" fill="none" stroke={INK} strokeWidth="9.6" strokeLinecap="round" />
        <path d="M18,-58 C26,-64 30,-74 28,-82" fill="none" stroke="#53679a" strokeWidth="7" strokeLinecap="round" />
        <g transform="translate(29 -90) rotate(-14)">
          <path d="M-8,-5 L8,-5 L8,6 L-8,6 Z" fill="#fbf4e8" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
          <path d="M-8,-5 L0,1.4 L8,-5" fill="none" stroke={INK} strokeWidth="0.8" />
          <circle cx="0" cy="2" r="2" fill="#c0435f" stroke={INK} strokeWidth="0.5" />
        </g>
        <circle cx="28" cy="-84" r="3.6" fill={SKIN} stroke={INK} strokeWidth="1" />
      </g>
      <path d="M-18,-56 C-24,-50 -24,-42 -20,-38" fill="none" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
      {/* head */}
      <g className={mood === 'puzzled' ? 'visitor-tilt' : undefined} style={{ transformOrigin: '0px -66px' }}>
        <Head y={-86} r={23} />
        <path d="M-23,-82 C-26,-80 -26,-74 -22,-73 M23,-82 C26,-80 26,-74 22,-73" fill="#f0c6b0" stroke={INK} strokeWidth="1.1" />
        {/* the cap */}
        <path d="M-22,-99 C-22,-117 22,-117 22,-99 Z" fill="#3b4b78" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M-24,-99 C-12,-95.6 12,-95.6 24,-99 C22,-94 -22,-94 -24,-99 Z" fill="#2a3456" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M-10,-94.4 C-4,-91.6 8,-91.6 14,-94.4 C8,-93.4 -4,-93.4 -10,-94.4 Z" fill="#1e2640" stroke={INK} strokeWidth="0.9" />
        <g transform="translate(0 -106)">
          <path d="M-4.6,-3 L4.6,-3 L4.6,3 L-4.6,3 Z" fill="#e9bf4f" stroke={INK} strokeWidth="0.7" />
          <path d="M-4.6,-3 L0,0.6 L4.6,-3" fill="none" stroke={INK} strokeWidth="0.6" />
        </g>
        <path d="M-14,-111 C-8,-114 0,-114 6,-113" fill="none" stroke="#5a6ea6" strokeWidth="1.8" strokeLinecap="round" />
        {/* a few hairs showing under the cap */}
        <path d="M-20,-96 C-18,-92 -15,-92 -14,-95 M20,-96 C18,-92 15,-92 14,-95" fill="#8a5a36" stroke={INK} strokeWidth="0.8" />
        <Eyes x={0} y={-83} gap={8.6} r={3.6} mood={mood} />
        <Cheeks x={0} y={-75} gap={14} r={4.4} strong />
        {/* a round pink nose and the moustache, which is most of him */}
        <ellipse cx="0" cy="-77" rx="3.6" ry="3" fill="#f0a5a0" stroke={INK} strokeWidth="0.9" />
        <path d="M0,-73 C-4,-76 -10,-76 -14,-72 C-17,-69 -19,-70 -20,-73 C-20,-67 -12,-64 -6,-68 C-3,-70 -1,-71 0,-71 C1,-71 3,-70 6,-68 C12,-64 20,-67 20,-73 C19,-70 17,-69 14,-72 C10,-76 4,-76 0,-73 Z" fill="#8a5a36" stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
        <path d="M-12,-71 C-9,-73 -5,-73 -3,-71.4 M12,-71 C9,-73 5,-73 3,-71.4" fill="none" stroke="#b07a4c" strokeWidth="0.9" strokeLinecap="round" />
        {mood !== 'waiting' && <Mouth x={0} y={-66} w={3} mood={mood} />}
      </g>
      {mood === 'delighted' && <Joy x={-34} y={-104} />}
      {mood === 'puzzled' && <Wonder x={-36} y={-108} />}
    </g>
  );
}

// ---- Wiedźmusia ------------------------------------------------------------------------------

/** Wiedźmusia: a little witch's apprentice in a hat much too big for her, with a broom and stripy socks. */
function Wiedzmusia({ mood }: { mood: VisitorMood }) {
  return (
    <g>
      <ellipse cx="0" cy="-1" rx="32" ry="4" fill="#000" opacity="0.12" />
      {/* the broom, leant against her */}
      <g transform="rotate(-18 -18 -4)">
        <path d="M-18,-4 L-18,-78" stroke="#8a5a32" strokeWidth="3" strokeLinecap="round" />
        <path d="M-18,-4 L-18,-78" stroke={INK} strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
        <path d="M-26,8 C-26,-4 -22,-12 -18,-14 C-14,-12 -10,-4 -10,8 C-14,10 -22,10 -26,8 Z" fill="#dcb767" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M-22,6 L-21,-8 M-18,7 L-18,-10 M-14,6 L-15,-8" stroke="#b8923f" strokeWidth="0.8" />
        <path d="M-21,-10 L-15,-10" stroke="#e98aa4" strokeWidth="2.6" strokeLinecap="round" />
      </g>
      {/* curly-toed boots and stripy socks */}
      <path d="M-13,0 C-20,0 -24,-2 -24,-6 C-22,-5 -19,-5 -17,-7 L-16,-12 L-7,-12 L-6,0 Z M13,0 C20,0 24,-2 24,-6 C22,-5 19,-5 17,-7 L16,-12 L7,-12 L6,0 Z" fill="#2a1f2e" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
      <g>
        <path d="M-15,-12 L-8,-12 L-8,-24 L-15,-24 Z M15,-12 L8,-12 L8,-24 L15,-24 Z" fill="#f6dbe4" stroke={INK} strokeWidth="1" />
        <path d="M-15,-15 L-8,-15 M-15,-20 L-8,-20 M15,-15 L8,-15 M15,-20 L8,-20" stroke="#2a1f2e" strokeWidth="2.4" />
      </g>
      {/* a cloak, purple, with a moon patch sewn on */}
      <path d="M-14,-56 C-22,-42 -28,-30 -30,-20 C-20,-16 20,-16 30,-20 C28,-30 22,-42 14,-56 Z" fill="#6a4588" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M-30,-20 L-24,-24 L-18,-19 L-10,-23 L0,-18 L10,-23 L18,-19 L24,-24 L30,-20" fill="none" stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M-18,-44 C-22,-36 -24,-28 -24,-22" fill="none" stroke="#8a64aa" strokeWidth="2.6" strokeLinecap="round" />
      <g transform="translate(11 -34) rotate(-12)">
        <path d="M-5,-5 L5,-5 L5,5 L-5,5 Z" fill="#e7c86a" stroke={INK} strokeWidth="0.8" />
        <path d="M1.6,-3 C-2.6,-2.6 -2.6,2.6 1.6,3 C-1.6,4 -4,0 -1.6,-2.4 Z" fill="#6a4588" />
        <path d="M-5,-2 L-6.4,-2 M-5,2 L-6.4,2 M5,-2 L6.4,-2" stroke={INK} strokeWidth="0.6" />
      </g>
      {/* sleeves, one hand holding the broom, the other on her hip */}
      <path d="M-11,-52 C-18,-48 -24,-42 -27,-36 L-22,-33 C-19,-38 -15,-42 -10,-45 Z" fill="#6a4588" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="-26" cy="-34" r="3.4" fill={SKIN} stroke={INK} strokeWidth="1" />
      <path d="M11,-52 C17,-48 20,-42 18,-36 L14,-37 C15,-41 13,-45 10,-46 Z" fill="#6a4588" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="16.4" cy="-35" r="3.2" fill={SKIN} stroke={INK} strokeWidth="1" />
      {/* head, hair and pigtails with bows */}
      <g className={mood === 'puzzled' ? 'visitor-tilt' : undefined} style={{ transformOrigin: '0px -56px' }}>
        <path d="M-20,-70 C-30,-66 -32,-54 -28,-46 C-26,-50 -24,-54 -20,-56 Z M20,-70 C30,-66 32,-54 28,-46 C26,-50 24,-54 20,-56 Z" fill="#2e1f33" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M-27,-60 C-32,-63 -34,-58 -30,-56 C-34,-54 -31,-50 -27,-53 Z M27,-60 C32,-63 34,-58 30,-56 C34,-54 31,-50 27,-53 Z" fill="#ec8aa5" stroke={INK} strokeWidth="0.9" strokeLinejoin="round" />
        <Head y={-74} r={21} />
        {/* her fringe, straight across */}
        <path d="M-21,-74 C-22,-88 -12,-94 0,-94 C12,-94 22,-88 21,-74 C18,-80 14,-82 10,-80 C8,-84 4,-84 2,-81 C-1,-84 -6,-84 -8,-80 C-12,-83 -18,-80 -21,-74 Z" fill="#2e1f33" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
        <Eyes x={0} y={-71} gap={8.4} r={4.4} mood={mood} iris="#3a2450" />
        <Cheeks x={0} y={-63} gap={13} r={4.2} strong />
        <Mouth x={0} y={-63} w={3.2} mood={mood} />
        {/* the hat: far too big, slipping, with a bent tip and a bratek in its band */}
        <g transform="rotate(-8 0 -88)">
          <path d="M-14,-90 C-10,-104 -6,-118 -2,-128 C4,-138 14,-140 20,-134 C14,-134 10,-130 9,-124 C8,-114 10,-102 14,-90 Z" fill="#3a2650" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M-12,-96 C-8,-100 8,-100 12,-96 L13,-91 C8,-94 -8,-94 -13,-91 Z" fill="#ec8aa5" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
          <path d="M-34,-88 C-30,-96 30,-96 34,-88 C30,-82 -30,-82 -34,-88 Z" fill="#3a2650" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M-26,-90 C-14,-93 8,-93 20,-91" fill="none" stroke="#5c4278" strokeWidth="2" strokeLinecap="round" />
          <path d="M-4,-112 C-2,-120 0,-126 4,-130" fill="none" stroke="#5c4278" strokeWidth="1.8" strokeLinecap="round" />
          <g transform="translate(7 -96)">
            {[0, 90, 180, 270].map((a) => (
              <ellipse key={a} transform={`rotate(${a + 45}) translate(0 -3.2)`} rx="2.6" ry="3.4" fill={a >= 180 ? '#e2ad3f' : '#8a5cc0'} stroke={INK} strokeWidth="0.6" />
            ))}
            <circle r="1.2" fill="#2c1733" />
          </g>
          <path d="M18,-132 L19.6,-128.6 L23.2,-128.2 L20.4,-125.8 L21.2,-122.2 L18,-124 L14.8,-122.2 L15.6,-125.8 L12.8,-128.2 L16.4,-128.6 Z" fill="#e2ad3f" stroke={INK} strokeWidth="0.6" strokeLinejoin="round" />
        </g>
      </g>
      {mood === 'delighted' && <Joy x={30} y={-114} />}
      {mood === 'puzzled' && <Wonder x={34} y={-116} />}
    </g>
  );
}

const ART: Record<VisitorId, (p: { mood: VisitorMood }) => JSX.Element> = {
  jadzia: Jadzia,
  atrament: Atrament,
  duszek: Duszek,
  rechotka: Rechotka,
  listonosz: Listonosz,
  wiedzmusia: Wiedzmusia,
  jingleton: Jingleton,
};

/** How tall each one stands, for fitting them in a frame. */
export const VISITOR_HEIGHT: Record<VisitorId, number> = {
  jadzia: 126,
  atrament: 106,
  duszek: 116,
  rechotka: 128,
  listonosz: 116,
  wiedzmusia: 142,
  jingleton: 98,
};

/** Those who hover above the step rather than stand on it. */
export const FLYING: readonly VisitorId[] = ['jingleton', 'duszek'];

export function VisitorArt({ id, mood = 'waiting' }: { id: VisitorId; mood?: VisitorMood }) {
  const Art = ART[id];
  return (
    <g className={`visitor visitor-${id} mood-${mood}`}>
      <Art mood={mood} />
    </g>
  );
}

/** A visitor drawn on its own, fitted into a square: for the book, the menu and the knock. */
export function VisitorPortrait({ id, mood = 'waiting', className }: { id: VisitorId; mood?: VisitorMood; className?: string }) {
  const h = VISITOR_HEIGHT[id] + 14;
  return (
    <svg className={className} viewBox={`${-h / 2} ${-h + 4} ${h} ${h}`} aria-hidden="true">
      <VisitorArt id={id} mood={mood} />
    </svg>
  );
}
