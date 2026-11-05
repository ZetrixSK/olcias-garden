import { useId, type ReactNode } from 'react';
import { mix } from './looks';

/**
 * Ribbons. The six she starts with are plain satin. The six visitors give (or Pan Jeżyk sells)
 * each have a look of their own: lace, airmail stripes, glossy honey, velvety plum, inky with
 * gold stars, and misty gauze.
 */
export type RibbonLook = 'plain' | 'lace' | 'stripe' | 'gloss' | 'velvet' | 'stars' | 'gauze';

const LOOKS: Record<string, RibbonLook> = {
  '#f4e6d4': 'lace',
  '#b8433f': 'stripe',
  '#e2ad3f': 'gloss',
  '#6b3a66': 'velvet',
  '#3b2346': 'stars',
  '#cdd8e6': 'gauze',
};
export const ribbonLook = (color: string): RibbonLook => LOOKS[color.toLowerCase()] ?? 'plain';

const LOOPS = 'M0,0 C-3,-5 -9,-6 -9,-2 C-9,1.6 -4,2 0,0 Z M0,0 C3,-5 9,-6 9,-2 C9,1.6 4,2 0,0 Z';
const TAILS = 'M-1,1 C-2,5 -4,9 -6,11 L-3.6,10.6 L-2.6,12.6 C-0.8,9 0.2,5 0.4,1.4 Z M1,1 C2.4,4.6 4.4,8 6.6,10 L4.2,10 L3.8,12.2 C2,9 0.6,5 0,1.6 Z';

/** What makes a ribbon special, drawn over its colour and kept inside its shape by `clip`. */
function Texture({ look, color, clip, area, bow = true }: { look: RibbonLook; color: string; clip: string; area: [number, number, number, number]; bow?: boolean }) {
  const [x0, y0, x1, y1] = area;
  if (look === 'plain') return null;
  const inside = (children: ReactNode) => <g clipPath={`url(#${clip})`}>{children}</g>;
  if (look === 'stripe') {
    const lines: string[] = [];
    for (let x = x0 - (y1 - y0); x < x1; x += 2.6) lines.push(`M${x.toFixed(1)},${y1} L${(x + (y1 - y0)).toFixed(1)},${y0}`);
    return inside(<path d={lines.join(' ')} stroke="#f7efe4" strokeWidth="0.95" />);
  }
  if (look === 'lace') {
    const holes: Array<[number, number]> = [];
    for (let y = y0 + 1.2; y < y1; y += 2.2) for (let x = x0 + ((y * 7) % 2.2); x < x1; x += 2.2) holes.push([x, y]);
    return inside(
      <g>
        {holes.map(([x, y], i) => (
          <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="0.42" fill="#cdb79a" />
        ))}
      </g>,
    );
  }
  if (look === 'stars') {
    const dots: Array<[number, number]> = [];
    for (let y = y0 + 1.4; y < y1; y += 3.4) for (let x = x0 + ((y * 5) % 3.4); x < x1; x += 3.4) dots.push([x, y]);
    return inside(
      <g fill="#e2ad3f">
        {dots.map(([x, y], i) => (
          <path key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`} d="M0,-0.9 L0.25,-0.25 L0.9,0 L0.25,0.25 L0,0.9 L-0.25,0.25 L-0.9,0 L-0.25,-0.25 Z" />
        ))}
      </g>,
    );
  }
  if (look === 'gauze') {
    const dots: Array<[number, number]> = [];
    for (let y = y0 + 1; y < y1; y += 2.8) for (let x = x0 + ((y * 3) % 2.8); x < x1; x += 2.8) dots.push([x, y]);
    return inside(
      <g fill="#ffffff" opacity="0.85">
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={i % 3 ? 0.28 : 0.45} />
        ))}
      </g>,
    );
  }
  if (look === 'velvet') {
    return inside(
      <g>
        {/* velvet: deep in the folds, a soft pale sheen where it catches the light */}
        <rect x={x0} y={y0 + (y1 - y0) * 0.3} width={x1 - x0} height={(y1 - y0) * 0.7} fill={mix(color, '#120814', 0.4)} opacity="0.5" />
        {bow ? (
          <>
            <path d="M-8,-2.4 C-6.4,-4.8 -3.4,-4.6 -1.6,-2.2 M8,-2.4 C6.4,-4.8 3.4,-4.6 1.6,-2.2" fill="none" stroke={mix(color, '#ffffff', 0.55)} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
            <path d="M-2,3 C-2.6,6 -3.6,8.6 -4.6,10 M2,3 C2.8,5.6 4,8 5.2,9.4" fill="none" stroke={mix(color, '#ffffff', 0.45)} strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
          </>
        ) : (
          <path d="M-4.4,-2.6 C-2,-4.6 2,-4.6 4.4,-2.6" fill="none" stroke={mix(color, '#ffffff', 0.55)} strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
        )}
      </g>,
    );
  }
  // gloss: honey satin catching the light
  return null;
}

/** A shine along each loop, for the glossy ones. */
function Gloss() {
  return (
    <g fill="none" stroke="#fff7dc" strokeLinecap="round" opacity="0.85">
      <path d="M-7.6,-3 C-6.4,-4.6 -4,-4.6 -2.6,-3.2" strokeWidth="1" />
      <path d="M7.6,-3 C6.4,-4.6 4,-4.6 2.6,-3.2" strokeWidth="1" />
      <path d="M-2.4,4 L-3.6,8" strokeWidth="0.7" />
    </g>
  );
}

/** A ribbon tied in a bow, its knot at (0,0): the loops about 18 wide, the tails hanging 12 down. */
export function RibbonBow({ color }: { color: string }) {
  const id = `rb${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const look = ribbonLook(color);
  const fillOpacity = look === 'gauze' ? 0.8 : 1;
  return (
    <g>
      {look !== 'plain' && (
        <defs>
          <clipPath id={id}>
            <path d={LOOPS} />
            <path d={TAILS} />
          </clipPath>
        </defs>
      )}
      {look === 'lace' && (
        <g fill="none" stroke="#3d2633" strokeWidth="2.9" strokeLinecap="round" strokeDasharray="0.01 1.7" opacity="0.75">
          <path d={LOOPS} />
          <path d={TAILS} />
        </g>
      )}
      {look === 'lace' && (
        <g fill="none" stroke="#fffaf2" strokeWidth="2.1" strokeLinecap="round" strokeDasharray="0.01 1.7">
          <path d={LOOPS} />
          <path d={TAILS} />
        </g>
      )}
      <path fill={color} fillOpacity={fillOpacity} d={LOOPS} />
      <path fill={color} fillOpacity={fillOpacity} d={TAILS} />
      <Texture look={look} color={color} clip={id} area={[-10, -7, 10, 13]} />
      {look === 'gloss' && <Gloss />}
      <path className="ink-thin" fill="none" d={LOOPS} />
      <path className="ink-thin" fill="none" d={TAILS} />
      <ellipse className="ink-thin" cx="0" cy="0" rx="1.8" ry="2" fill={look === 'velvet' ? mix(color, '#120814', 0.2) : color} />
    </g>
  );
}

/** A round swatch of a ribbon, for choosing one: its colour and, for the special ones, its look. */
export function RibbonSwatch({ color }: { color: string }) {
  const id = `rs${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const look = ribbonLook(color);
  return (
    <svg viewBox="-10 -10 20 20" aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <circle r="10" />
        </clipPath>
      </defs>
      <circle r="10" fill={color} fillOpacity={look === 'gauze' ? 0.8 : 1} />
      <g transform="scale(1.6)">
        <Texture look={look} color={color} clip={id} area={[-7, -7, 7, 7]} bow={false} />
      </g>
      {look === 'gloss' && <path d="M-6,-3.6 C-4,-6.6 1,-7.4 4.4,-5.4" fill="none" stroke="#fff7dc" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />}
      {look === 'lace' && <circle r="8.6" fill="none" stroke="#fffaf2" strokeWidth="2" strokeLinecap="round" strokeDasharray="0.01 2.4" />}
    </svg>
  );
}
