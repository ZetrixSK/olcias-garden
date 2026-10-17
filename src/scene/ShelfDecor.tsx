import type { Theme } from '../theme/palettes';
import { fv } from './geometry';

const MOON = 'M0,-5 A5,5 0 1 0 0,5 A3.4,5 0 1 1 0,-5 Z';
const STAR = 'M0,-5 C0.5,-1.4 1.4,-0.5 5,0 C1.4,0.5 0.5,1.4 0,5 C-0.5,1.4 -1.4,0.5 -5,0 C-1.4,-0.5 -0.5,-1.4 0,-5 Z';

/** A point on the sagging string between the two hanging-pot cords. */
function along(t: number) {
  const [x0, y0, cx, cy, x1, y1] = [50, -28, 200, 48, 350, -28];
  const u = 1 - t;
  return { x: u * u * x0 + 2 * u * t * cx + t * t * x1, y: u * u * y0 + 2 * u * t * cy + t * t * y1, slope: 2 * u * (cy - y0) + 2 * t * (y1 - cy) };
}

/** Bunting across the top of the wall: pennants in the cozy room, little moons and stars in the witchy one. */
export function Bunting({ theme }: { theme: Theme }) {
  const cozy = theme === 'cozy';
  const items = Array.from({ length: 11 }, (_, i) => along(0.07 + (i * 0.86) / 10));
  const pennant = ['#e58aa6', '#f3e6d6', '#c95d7f'];
  return (
    <g>
      <path d="M50,-28 Q200,48 350,-28" fill="none" style={{ stroke: 'var(--ink)' }} strokeWidth={cozy ? 1.4 : 1} />
      {items.map((p, i) => {
        const tilt = (Math.atan2(p.slope, 300) * 180) / Math.PI;
        if (cozy) {
          return (
            <g key={i} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${tilt.toFixed(1)})`}>
              <path className="ink" fill={pennant[i % 3]} d="M-8,0 L8,0 L0.6,15 Z" />
              <path d="M-4.6,2.6 L4.6,2.6" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.9" strokeDasharray="1.2 1.6" />
            </g>
          );
        }
        const drop = 6 + (i % 3) * 4;
        return (
          <g key={i} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`}>
            <path d={`M0,0 L0,${drop}`} style={{ stroke: 'var(--ink)' }} strokeWidth="0.8" />
            <path
              className="ink-thin"
              transform={`translate(0 ${drop + 4.5}) scale(${i % 2 ? 0.9 : 1})`}
              d={i % 2 ? STAR : MOON}
              fill={i % 4 === 1 ? '#e58aa6' : '#c9a45c'}
            />
          </g>
        );
      })}
    </g>
  );
}

/** Small things at the two ends of the windowsill (top surface at y = 276). */
export function SillEnds({ theme }: { theme: Theme }) {
  if (theme === 'cozy') {
    return (
      <g>
        {/* two little books and a heart-shaped jar */}
        <g transform="translate(104 276)">
          <path className="ink" fill="#a7b598" d="M-12,0 L12,0 L12,-6 L-12,-6 Z" />
          <path className="ink" fill="#dda0a6" d="M-10,-6 L11,-6 L11,-11 L-10,-11 Z" />
          <path d="M-8,-3 L9,-3 M-7,-8.6 L8,-8.6" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8" />
          <path className="ink" fill="#c95d7f" fillOpacity="0.85" d="M0,-14 C-3,-18 -9,-16 -7,-11.6 L0,-11 L7,-11.6 C9,-16 3,-18 0,-14 Z" transform="translate(0 -2)" />
        </g>
        {/* a small jar of dried flowers */}
        <g transform="translate(296 276)">
          <path className="ink-thin" fill="none" d="M-2,-14 C-4,-20 -6,-24 -8,-27 M0,-14 C0,-21 1,-25 2,-29 M2,-14 C4,-19 7,-22 9,-24" />
          <circle cx="-8" cy="-27.5" r="2.2" fill="#e58aa6" className="ink-thin" />
          <circle cx="2" cy="-29.5" r="2" fill="#f3e6d6" className="ink-thin" />
          <circle cx="9" cy="-24.5" r="2.1" fill="#c95d7f" className="ink-thin" />
          <path className="ink" fill="#e9eef0" fillOpacity="0.7" d="M-6,0 L-7,-11 C-7,-14 7,-14 7,-11 L6,0 Z" />
          <path className="ink" style={fv('rope')} d="M-7.4,-13 L7.4,-13 L7.4,-16 L-7.4,-16 Z" />
        </g>
      </g>
    );
  }
  return (
    <g>
      {/* a rose-quartz crystal cluster */}
      <g transform="translate(104 276)">
        <path className="ink" fill="#d88aa6" d="M-9,0 L-8,-10 L-5,-14 L-3,-6 L-1,0 Z" />
        <path className="ink" fill="#e9a9c0" d="M-3,0 L-2,-15 L1,-20 L4,-15 L4,0 Z" />
        <path className="ink" fill="#c86f92" d="M3,0 L5,-9 L8,-11 L10,-4 L9,0 Z" />
        <path d="M0,-17 L1,-4" stroke="#fbe0ea" strokeWidth="1" strokeLinecap="round" />
      </g>
      {/* a tarot card leaning against the frame */}
      <g transform="translate(298 276) rotate(-10)">
        <path className="ink" fill="#2c2b30" d="M-7,0 L7,0 L7,-22 L-7,-22 Z" />
        <path d="M-5,-2 L5,-2 L5,-20 L-5,-20 Z" fill="none" stroke="#c9a45c" strokeWidth="0.7" />
        <path transform="translate(0 -11) scale(0.8)" d={MOON} fill="#c9a45c" />
      </g>
    </g>
  );
}
