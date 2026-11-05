import type { SpeciesId, Stage } from '../garden/species';
import type { TraitKind } from '../garden/traits';
import { hash, rng } from '../garden/vines';

/** Roughly how tall a plant stands at each stage, so the trait's touches sit on it rather than above. */
const HEIGHT: Record<Stage, number> = { seed: 0, seedling: 34, bud: 70, bloom: 96 };
const TALL: Partial<Record<SpeciesId, number>> = { hollyhock: 1.45, lavender: 1.1, moonflower: 1.15, pumpkin: 0.8, snowdrop: 0.8, cyclamen: 0.8 };

const SPARKLE = 'M0,-4 C0.4,-1 1,-0.4 4,0 C1,0.4 0.4,1 0,4 C-0.4,1 -1,0.4 -4,0 C-1,-0.4 -0.4,-1 0,-4 Z';
const DROP = 'M0,-2.8 C1.3,-1 2,0.2 2,1.1 C2,2.3 1.1,3 0,3 C-1.1,3 -2,2.3 -2,1.1 C-2,0.2 -1.3,-1 0,-2.8 Z';
const CRYSTAL = 'M0,-3.4 L0,3.4 M-2.9,-1.7 L2.9,1.7 M-2.9,1.7 L2.9,-1.7 M-0.9,-2.6 L0,-1.8 L0.9,-2.6 M-0.9,2.6 L0,1.8 L0.9,2.6';

/** Places on the plant for the little touches: spread over its height, steady for the same plant. */
function spots(seed: string, n: number, h: number): Array<[number, number, number]> {
  const r = rng(hash(seed));
  return Array.from({ length: n }, () => [(r() - 0.5) * 52, -h * (0.22 + r() * 0.78), r()]);
}

/**
 * Where dew and frost settle: on the petals and leaves themselves. A bratek in bloom has its
 * flowers in known places; other plants get places close in, within the plant's own shape.
 */
const ON_PANSY: Array<[number, number]> = [
  [-38, -66], [-23, -50], [-30, -70], [1, -90], [15, -72], [8, -84], [45, -60], [31, -46], [27, -34], [-18, -16], [16, -12], [-6, -26],
];
function onPlant(seed: string, n: number, h: number, species: SpeciesId, stage: Stage): Array<[number, number, number]> {
  const r = rng(hash(seed));
  if (species === 'pansy' && stage === 'bloom') {
    const pool = [...ON_PANSY];
    return Array.from({ length: Math.min(n, pool.length) }, () => {
      const [x, y] = pool.splice(Math.floor(r() * pool.length), 1)[0]!;
      return [x + (r() - 0.5) * 3, y + (r() - 0.5) * 3, r()];
    });
  }
  return Array.from({ length: n }, () => {
    const y = 0.3 + r() * 0.6;
    // narrower towards the top, as a plant is
    return [(r() - 0.5) * 30 * (1.1 - y * 0.5), -h * y, r()];
  });
}

/** Drawn behind the plant: the soft light some traits give off. */
export function TraitGlow({ kind, stage, species }: { kind: TraitKind; stage: Stage; species: SpeciesId }) {
  const h = HEIGHT[stage] * (TALL[species] ?? 1);
  if (!h) return null;
  const tint = kind === 'enchanted' ? '#b9a1ea' : kind === 'sunkissed' ? '#ffd88a' : kind === 'frosted' ? '#d6ecff' : null;
  if (!tint) return null;
  return (
    <g className={`trait-glow trait-${kind}`} pointerEvents="none">
      <ellipse cx="0" cy={-h * 0.55} rx="36" ry={h * 0.64} fill={tint} opacity="0.11" />
      <ellipse cx="0" cy={-h * 0.58} rx="26" ry={h * 0.48} fill={tint} opacity="0.13" />
      <ellipse cx="0" cy={-h * 0.62} rx="15" ry={h * 0.32} fill={tint} opacity="0.15" />
    </g>
  );
}

/** Drawn over the plant: the sparkles, dew, golden motes or frost a trait leaves. */
export function TraitTouches({ kind, stage, species, id }: { kind: TraitKind; stage: Stage; species: SpeciesId; id: string }) {
  const h = HEIGHT[stage] * (TALL[species] ?? 1);
  if (!h || kind === 'willowy') return null;
  // dew and frost sit on the plant itself; sparkles and golden motes float about it
  const on = kind === 'dewy' || kind === 'frosted';
  const at = on ? onPlant(`${id}/${kind}`, kind === 'dewy' ? 7 : 6, h, species, stage) : spots(`${id}/${kind}`, kind === 'sunkissed' ? 3 : 4, h);
  return (
    <g className={`trait-touches trait-${kind}`} pointerEvents="none">
      {at.map(([x, y, k], i) => {
        const pos = `translate(${x.toFixed(1)} ${y.toFixed(1)})`;
        if (kind === 'enchanted') {
          return (
            <g key={i} transform={`${pos} scale(${(0.85 + k * 0.6).toFixed(2)})`}>
              <path className="twinkle" style={{ animationDelay: `${(k * 4).toFixed(2)}s` }} d={SPARKLE} fill="#efe4ff" stroke="#8d72c9" strokeWidth="0.6" />
            </g>
          );
        }
        if (kind === 'dewy') {
          return (
            <g key={i} transform={`${pos} scale(${(0.9 + k * 0.45).toFixed(2)})`}>
              <path d={DROP} fill="#d4ebf8" fillOpacity="0.92" stroke="#4f7391" strokeWidth="0.55" />
              <circle cx="-0.6" cy="0.3" r="0.6" fill="#ffffff" />
            </g>
          );
        }
        if (kind === 'sunkissed') {
          return (
            <g key={i} transform={pos}>
              <circle className="trait-mote" style={{ animationDelay: `${(k * 5).toFixed(2)}s` }} r={(1.3 + k * 1).toFixed(2)} fill="#f7cf62" stroke="#c9952e" strokeWidth="0.4" />
            </g>
          );
        }
        return (
          <g key={i} transform={`${pos} scale(${(0.8 + k * 0.5).toFixed(2)}) rotate(${(k * 60).toFixed(0)})`}>
            <path d={CRYSTAL} fill="none" stroke="#6f95b4" strokeWidth="1.8" strokeLinecap="round" />
            <path d={CRYSTAL} fill="none" stroke="#f1f8ff" strokeWidth="0.9" strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
}

/**
 * What a trait leaves on the pot as well: frost along the rim with little icicles, a golden
 * shine on a sun-kissed one. `rim` is half the rim's width and `depth` the pot's height, rim at y 0.
 */
export function TraitPot({ kind, rim, depth, id }: { kind: TraitKind; rim: number; depth: number; id: string }) {
  const r = rng(hash(`${id}/pot`));
  const ry = 2.8 + rim * 0.035;
  if (kind === 'frosted') {
    const n = Math.max(5, Math.round(rim / 4));
    let icicles = '';
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const x = -rim + t * rim * 2;
      const y = -1 + ry * Math.sqrt(Math.max(0, 1 - (x / rim) ** 2)) + 1;
      const len = 2 + r() * 3.4;
      icicles += `M${(x - 1.4).toFixed(1)},${y.toFixed(1)} L${x.toFixed(1)},${(y + len).toFixed(1)} L${(x + 1.4).toFixed(1)},${y.toFixed(1)} Z `;
    }
    return (
      <g className="trait-pot trait-frosted" pointerEvents="none">
        <path d={`M${-rim},-1 A${rim},${ry} 0 0 0 ${rim},-1`} fill="none" stroke="#7fa3c0" strokeWidth="4.4" strokeLinecap="round" />
        <path d={`M${-rim},-1 A${rim},${ry} 0 0 0 ${rim},-1`} fill="none" stroke="#f1f8ff" strokeWidth="3" strokeLinecap="round" />
        <path d={icicles} fill="#eef7ff" stroke="#6f95b4" strokeWidth="0.6" strokeLinejoin="round" />
      </g>
    );
  }
  if (kind === 'sunkissed') {
    return (
      <g className="trait-pot trait-sunkissed" pointerEvents="none">
        <path d={`M${(-rim * 0.55).toFixed(1)},${(depth * 0.2).toFixed(1)} C${(-rim * 0.62).toFixed(1)},${(depth * 0.45).toFixed(1)} ${(-rim * 0.55).toFixed(1)},${(depth * 0.7).toFixed(1)} ${(-rim * 0.42).toFixed(1)},${(depth * 0.85).toFixed(1)}`} fill="none" stroke="#ffe39a" strokeWidth="2.4" strokeLinecap="round" opacity="0.75" />
        <path d={`M${(-rim * 0.8).toFixed(1)},${(ry - 0.6).toFixed(1)} A${rim},${ry} 0 0 0 ${(-rim * 0.2).toFixed(1)},${(ry + 0.6).toFixed(1)}`} fill="none" stroke="#ffe39a" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
      </g>
    );
  }
  return null;
}
