import type { ReactNode } from 'react';
import type { PotDesign, PotPattern } from '../garden/designs';
import { mix } from './looks';

const shadeOf = (hex: string, t: number) => mix(hex, '#1a0d1c', t);
const lightOf = (hex: string, t: number) => mix(hex, '#ffffff', t);

type ShapeSpec = { body: string; rim: string; shade: string; hi: string; box: [number, number, number, number] };

/** The outlines of each pot shape, in the same hand as the built-in pots. */
const SHAPES: Record<PotDesign['shape'], ShapeSpec> = {
  slim: {
    body: 'M-20,8 L-16,55 C-6,57.5 6,57.5 16,55 L20,8 Z',
    rim: 'M-24,-1 C-8,1.8 8,1.8 24,-1 L23,9 C8,11.5 -8,11.5 -23,9 Z',
    shade: 'M8,9 L19,9 L15.5,54 C13,55 10,55.5 8,55.6 Z',
    hi: 'M-15,14 L-12,50',
    box: [-20, 9, 20, 56],
  },
  wide: {
    body: 'M-42,7 C-40,30 -32,44 -24,47 C-8,50 8,50 24,47 C32,44 40,30 42,7 Z',
    rim: 'M-46,-1 C-16,2.6 16,2.6 46,-1 L45,7 C16,10.6 -16,10.6 -45,7 Z',
    shade: 'M18,8 L42,7 C40,30 32,44 24,47 C20,48 15,48.8 10,49.2 C20,38 22,22 18,8 Z',
    hi: 'M-36,14 C-35,26 -30,36 -24,41',
    box: [-42, 8, 42, 50],
  },
  round: {
    body: 'M-27,6 C-38,18 -36,40 -22,50 C-8,53 8,53 22,50 C36,40 38,18 27,6 Z',
    rim: 'M-30,-1 C-10,2 10,2 30,-1 L29,6 C10,8.6 -10,8.6 -29,6 Z',
    shade: 'M14,8 C30,18 32,38 20,50 C24,40 24,22 14,8 Z',
    hi: 'M-26,14 C-29,20 -29,28 -26,36',
    box: [-36, 6, 36, 53],
  },
  cauldron: {
    body: 'M-30,5 C-37,17 -35,33 -22,41 C-8,46 8,46 22,41 C35,33 37,17 30,5 Z',
    rim: 'M-33,-1 C-12,3 12,3 33,-1 L32,5.4 C12,9 -12,9 -32,5.4 Z',
    shade: 'M14,6 L30,5 C37,17 35,33 22,41 C18,42.6 14,43.6 10,44.2 C20,34 20,18 14,6 Z',
    hi: 'M-27,14 C-30,22 -28,31 -21,37',
    box: [-35, 6, 35, 46],
  },
  teacup: {
    body: 'M-28,3 C-28,22 -18,36 0,36 C18,36 28,22 28,3 Z',
    rim: 'M-30,-1 C-10,2.6 10,2.6 30,-1 L29,4 C10,7.2 -10,7.2 -29,4 Z',
    shade: 'M14,6 C24,14 22,28 10,34 C18,26 19,14 14,6 Z',
    hi: 'M-22,10 C-22,18 -18,26 -12,31',
    box: [-28, 4, 28, 37],
  },
};

const HEART = 'M0,1.6 C-1.6,-0.6 -4.4,0.2 -3.4,2.8 L0,5.6 L3.4,2.8 C4.4,0.2 1.6,-0.6 0,1.6 Z';
const MOON = 'M0,-3.6 A3.6,3.6 0 1 0 0,3.6 A2.4,3.6 0 1 1 0,-3.6 Z';
const SPARK = 'M0,-3 C0.3,-0.8 0.8,-0.3 3,0 C0.8,0.3 0.3,0.8 0,3 C-0.3,0.8 -0.8,0.3 -3,0 C-0.8,-0.3 -0.3,-0.8 0,-3 Z';

/** Positions on a staggered grid inside the box, with the row number. */
function grid([x0, y0, x1, y1]: ShapeSpec['box'], step: number, top = 0): [number, number, number][] {
  const out: [number, number, number][] = [];
  let row = 0;
  for (let y = y0 + top + step * 0.6; y < y1; y += step * 0.86, row++) {
    for (let x = x0 + (row % 2 ? step / 2 : 0); x < x1 + step; x += step) out.push([x, y, row]);
  }
  return out;
}

function zig(x0: number, x1: number, y: number, a: number): string {
  let d = `M${x0 - 4},${y}`;
  let up = true;
  for (let x = x0 - 4; x < x1 + 6; x += 6) {
    d += ` L${x + 6},${y + (up ? -a : a)}`;
    up = !up;
  }
  return d;
}

/** The painted decoration, drawn over the whole body and clipped to it. */
function Pattern({ pattern, color, spec }: { pattern: PotPattern; color: string; spec: ShapeSpec }) {
  const [x0, y0, x1, y1] = spec.box;
  const h = y1 - y0;
  switch (pattern) {
    case 'none':
      return null;
    case 'scallops': {
      const y = y0 + Math.min(8, h * 0.2);
      let d = `M${x0 - 4},${y}`;
      for (let x = x0 - 4; x < x1 + 4; x += 9.5) d += ' q4.75,6 9.5,0';
      return (
        <g>
          <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          {Array.from({ length: Math.ceil((x1 - x0) / 9.5) + 1 }, (_, i) => (
            <circle key={i} cx={x0 + 0.75 + i * 9.5} cy={y + 10 + (i % 2)} r="1.5" fill={color} />
          ))}
        </g>
      );
    }
    case 'dots':
      return (
        <g fill={color}>
          {grid(spec.box, 7.5).map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.5" />
          ))}
        </g>
      );
    case 'stripes':
      return (
        <g fill={color}>
          {Array.from({ length: Math.ceil((x1 - x0) / 8) + 1 }, (_, i) => (
            <rect key={i} x={x0 + 2 + i * 8} y={y0 - 2} width="2.8" height={h + 6} />
          ))}
        </g>
      );
    case 'bands': {
      const wave = (y: number) =>
        `M${x0 - 4},${y} C${x0 + 10},${y + 3} ${x0 + 22},${y - 1} ${x0 + 34},${y + 2} S${x1 - 10},${y - 2} ${x1 + 6},${y + 1}`;
      return (
        <g fill="none" stroke={color} strokeLinecap="round">
          <path d={wave(y0 + h * 0.36)} strokeWidth="2.6" />
          <path d={wave(y0 + h * 0.52)} strokeWidth="1.3" />
        </g>
      );
    }
    case 'hearts':
      return (
        <g fill={color}>
          {grid(spec.box, 12, 1).map(([x, y], i) => (
            <path key={i} transform={`translate(${x} ${y - 3})`} d={HEART} />
          ))}
        </g>
      );
    case 'moons':
      return (
        <g fill={color}>
          {grid(spec.box, 12, 1).map(([x, y, row], i) => (
            <path key={i} transform={`translate(${x} ${y}) scale(${(i + row) % 2 ? 0.9 : 1})`} d={(i + row) % 2 ? SPARK : MOON} />
          ))}
        </g>
      );
    case 'checks': {
      const out: ReactNode[] = [];
      let r = 0;
      for (let y = y0; y < y1; y += 6, r++) {
        for (let x = x0 + (r % 2 ? 6 : 0); x < x1; x += 12) out.push(<rect key={`${x},${y}`} x={x} y={y} width="6" height="6" />);
      }
      return (
        <g fill={color} opacity="0.9">
          {out}
        </g>
      );
    }
    case 'zigzag':
      return (
        <g fill="none" stroke={color} strokeLinejoin="round" strokeLinecap="round">
          <path d={zig(x0, x1, y0 + h * 0.4, 3)} strokeWidth="2.2" />
          <path d={zig(x0, x1, y0 + h * 0.6, 2)} strokeWidth="1.2" />
        </g>
      );
    case 'flowers':
      return (
        <g>
          {grid(spec.box, 13, 1).map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`} fill={color}>
              {[0, 72, 144, 216, 288].map((a) => (
                <circle key={a} cx={2.1 * Math.cos((a * Math.PI) / 180)} cy={2.1 * Math.sin((a * Math.PI) / 180)} r="1.5" />
              ))}
              <circle r="1" fill="#fbf2e6" />
            </g>
          ))}
        </g>
      );
  }
}

/** A pot she painted: her shape, colour, pattern and rim, drawn in the same hand as the rest. */
export function PaintedFront({ d }: { d: PotDesign }) {
  const spec = SHAPES[d.shape];
  const clip = `potclip-${d.shape}`;
  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <path d={spec.body} />
        </clipPath>
      </defs>
      {d.shape === 'cauldron' && (
        <path className="ink" fill={shadeOf(d.body, 0.3)} d="M-20,40 L-23,48 L-14,47 L-12,42 Z M20,40 L23,48 L14,47 L12,42 Z" />
      )}
      {d.shape === 'teacup' && (
        <>
          <ellipse className="ink" cx="0" cy="38" rx="38" ry="5" fill={d.rim} />
          <path className="ink" fill="none" strokeWidth="1.5" d="M26,7 C40,4 43,22 25,25" />
          <path d="M26,7 C40,4 43,22 25,25" stroke={d.body} strokeWidth="3.4" fill="none" />
          <path className="ink" fill="none" strokeWidth="1.5" d="M27.4,10 C36,9 37,20 26.4,21.6" />
        </>
      )}
      <path fill={d.body} d={spec.body} />
      <g clipPath={`url(#${clip})`}>
        <Pattern pattern={d.pattern} color={d.patternColor} spec={spec} />
        <path d={spec.shade} fill="#1a0d1c" opacity="0.2" />
      </g>
      <path d={spec.hi} stroke={lightOf(d.body, 0.4)} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path className="ink" fill="none" d={spec.body} />
      {d.shape === 'cauldron' && (
        <>
          <ellipse className="ink" cx="-33" cy="9" rx="3.4" ry="4.6" fill="none" strokeWidth="2.2" />
          <ellipse className="ink" cx="33" cy="9" rx="3.4" ry="4.6" fill="none" strokeWidth="2.2" />
        </>
      )}
      <path className="ink" fill={d.rim} d={spec.rim} />
    </g>
  );
}

/** The colour seen inside the rim, behind the soil. */
export const openingColor = (d: PotDesign) => shadeOf(d.rim, 0.22);
