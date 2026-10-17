import type { Stage } from '../garden/species';
import { SeedMarker, Seeds, Stem } from './common';

const SAGE = { base: '#91a78e', shade: '#76906f', stem: '#7f9370' };
const BLOOM = ['#8b74b6', '#a690cf', '#6c5697'];
const GREEN_SPIKE = ['#9fb097', '#a99fbf', '#859a7e'];

/** A flower spike: little whorls stacked up the stem, tapering to the tip. */
function Spike({ x, y, rot, n, colors }: { x: number; y: number; rot: number; n: number; colors: string[] }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {Array.from({ length: n }, (_, i) => {
        const yy = -i * 4;
        const k = 1 - (i / n) * 0.45;
        return (
          <g key={i}>
            <ellipse cx={-1.7 * k} cy={yy} rx={2.5 * k} ry={1.9 * k} fill={colors[i % 2]} transform={`rotate(-28 ${-1.7 * k} ${yy})`} className="ink-thin" />
            <ellipse cx={1.7 * k} cy={yy - 1.2} rx={2.5 * k} ry={1.9 * k} fill={colors[(i + 1) % 2]} transform={`rotate(28 ${1.7 * k} ${yy - 1.2})`} className="ink-thin" />
            {i % 2 === 0 && <circle cx={0} cy={yy - 0.6} r={0.8 * k} fill={colors[2]} />}
          </g>
        );
      })}
    </g>
  );
}

/** Narrow grey-green leaves in a tuft. */
function Tuft({ n, len }: { n: number; len: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const a = -70 + (140 * i) / Math.max(1, n - 1) + ((i * 13) % 7) - 3;
        const l = len * (0.75 + ((i * 29) % 10) / 30);
        return (
          <path
            key={i}
            transform={`rotate(${a})`}
            className="ink-thin"
            fill={i % 3 === 0 ? SAGE.shade : SAGE.base}
            d={`M-1.6,0 C-1.8,${-l * 0.4} -1.2,${-l * 0.8} 0,${-l} C1.2,${-l * 0.8} 1.8,${-l * 0.4} 1.6,0 Z`}
          />
        );
      })}
    </g>
  );
}

function Stems({ count, spread, len, n, colors }: { count: number; spread: number; len: number; n: number; colors: string[] }) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const t = count === 1 ? 0.5 : i / (count - 1);
        const a = (-spread / 2 + spread * t) * (Math.PI / 180);
        const l = len * (0.82 + ((i * 41) % 10) / 45);
        const tx = Math.sin(a) * l;
        const ty = -Math.cos(a) * l;
        return (
          <g key={i}>
            <Stem d={`M${(t - 0.5) * 6},-2 Q${tx * 0.3},${ty * 0.6} ${tx.toFixed(1)},${ty.toFixed(1)}`} w={1.3} color={SAGE.stem} />
            <Spike x={tx} y={ty} rot={(a * 180) / Math.PI} n={n} colors={colors} />
          </g>
        );
      })}
    </g>
  );
}

export function LavenderPlant({ stage }: { stage: Stage }) {
  if (stage === 'seed') {
    return (
      <g>
        <Seeds color="#3e3328" />
        <SeedMarker label="lawenda" />
      </g>
    );
  }
  if (stage === 'seedling') return <Tuft n={5} len={14} />;
  if (stage === 'bud') {
    return (
      <g>
        <Stems count={6} spread={50} len={58} n={5} colors={GREEN_SPIKE} />
        <Tuft n={12} len={26} />
      </g>
    );
  }
  return (
    <g>
      <Stems count={9} spread={64} len={84} n={8} colors={BLOOM} />
      <Tuft n={16} len={32} />
    </g>
  );
}
