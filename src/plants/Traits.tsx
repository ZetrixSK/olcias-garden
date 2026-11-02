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
  const at = spots(`${id}/${kind}`, kind === 'dewy' ? 7 : 6, h);
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
            <g key={i} transform={`${pos} scale(${(1.1 + k * 0.5).toFixed(2)})`}>
              <path d={DROP} fill="#dceef8" stroke="#5f7f99" strokeWidth="0.5" opacity="0.9" />
              <circle cx="-0.6" cy="0.4" r="0.6" fill="#ffffff" />
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
          <g key={i} transform={`${pos} scale(${(1 + k * 0.6).toFixed(2)}) rotate(${(k * 60).toFixed(0)})`}>
            <path d={CRYSTAL} fill="none" stroke="#f4faff" strokeWidth="1.3" strokeLinecap="round" />
            <path d={CRYSTAL} fill="none" stroke="#8fb2cf" strokeWidth="0.5" strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
}
