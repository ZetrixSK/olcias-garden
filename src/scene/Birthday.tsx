import { PansyFlower } from '../plants/Pansy';
import { designColors } from '../plants/looks';

const INK = 'var(--ink)';
const FLAGS = ['#e58aa6', '#f6e7c8', '#b9a3e3', '#c95d7f', '#f2d16b'];
const pansy = designColors({ id: 'bd', name: '', top: '#2c1733', low: '#f0a8c0', face: 'whiskers', faceColor: '#2c1733', edge: null });

/**
 * Her birthday banner: a string of flags across the top of the window, a letter on each, saying
 * "Sto lat" (or happy birthday), with a bratek at each end.
 */
export function BirthdayBanner({ words, from = [60, 118], to = [340, 118], sag = 26 }: { words: string; from?: [number, number]; to?: [number, number]; sag?: number }) {
  const letters = [...words];
  const [x0, y0] = from;
  const [x1, y1] = to;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2 + sag * 2;
  const at = (t: number) => {
    const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1;
    const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1;
    const dx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx);
    const dy = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy);
    return { x, y, tilt: (Math.atan2(dy, dx) * 180) / Math.PI };
  };
  const n = letters.length;
  return (
    <g className="birthday-banner" pointerEvents="none">
      <path d={`M${x0},${y0} Q${cx},${cy} ${x1},${y1}`} fill="none" stroke={INK} strokeWidth="1.2" />
      {letters.map((ch, i) => {
        const p = at((i + 0.5) / n);
        if (ch === ' ') return null;
        return (
          <g key={i} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.tilt.toFixed(1)})`}>
            <g className="flag-sway" style={{ animationDelay: `${-i * 0.3}s` }}>
              <path d="M-11,0 L11,0 L11,17 L0,23 L-11,17 Z" fill={FLAGS[i % FLAGS.length]} stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
              <text x="0" y="14.6" textAnchor="middle" fontFamily="Kalam" fontWeight="700" fontSize="14" fill="#3d2633">
                {ch}
              </text>
            </g>
          </g>
        );
      })}
      <PansyFlower x={x0} y={y0} s={0.34} c={pansy} />
      <PansyFlower x={x1} y={y1} s={0.34} c={pansy} />
    </g>
  );
}

/** A balloon on a curly string, tied at (0,0) and floating up, bobbing gently. */
export function Balloon({ x, y, color, delay = 0 }: { x: number; y: number; color: string; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <g className="balloon-bob" style={{ animationDelay: `${-delay}s` }}>
        <path d="M0,0 C-4,-8 4,-14 0,-22 C-4,-30 3,-36 0,-44" fill="none" stroke={INK} strokeWidth="0.9" />
        <path d="M0,-44 L-2.4,-47.6 L2.4,-47.6 Z" fill={color} stroke={INK} strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M0,-47.6 C-11,-48 -15,-60 -14,-68 C-13,-78 -6,-84 0,-84 C6,-84 13,-78 14,-68 C15,-60 11,-48 0,-47.6 Z" fill={color} stroke={INK} strokeWidth="1.2" />
        <path d="M-7,-75 C-8.6,-71 -8.6,-67 -7.6,-64" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      </g>
    </g>
  );
}
