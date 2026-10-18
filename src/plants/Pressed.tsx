import type { SpeciesId } from '../garden/species';
import { rng } from '../garden/vines';
import { LEAF, Stem } from './common';
import { DAISY_DEEP, DAISY_PINK, DAISY_WHITE, DaisyFlower, SpoonLeaf } from './Daisy';
import { BLOOM, Spike } from './Lavender';
import { PansyBud, PansyFlower, PansyLeaf, type PansyColors } from './Pansy';
import { LeafCluster, RoseBloom, Thorns } from './Rose';
import { BLUE_LEAF, TULIP_NIGHT, TULIP_PINK, TulipFlower } from './Tulip';

type Pt = [number, number];

/** A gently bent stem from (0,0) up to its tip, and a way to find points along it. */
function stemOf(len: number, bend: number, lean: number) {
  const tip: Pt = [lean, -len];
  const ctrl: Pt = [bend, -len / 2];
  const at = (t: number): Pt => {
    const u = 1 - t;
    return [2 * u * t * ctrl[0] + t * t * tip[0], 2 * u * t * ctrl[1] + t * t * tip[1]];
  };
  const d = `M0,0 Q${ctrl[0].toFixed(1)},${ctrl[1].toFixed(1)} ${tip[0].toFixed(1)},${tip[1].toFixed(1)}`;
  // the stem's direction near the tip, so the flower faces the way it grew
  const angle = (Math.atan2(tip[0] - ctrl[0], ctrl[1] - tip[1]) * 180) / Math.PI;
  return { d, tip, at, angle };
}

const pick = <T,>(list: readonly T[], r: number) => list[Math.floor(r * list.length) % list.length]!;

/**
 * One flower as it would be pressed: a single stem with its flower and a leaf or two, rather than
 * the whole plant. The seed varies the stem, the leaves and which colour from the plant was taken,
 * so no two pages are quite alike.
 */
export function PressedSprig({ species, palette, seed }: { species: SpeciesId; palette: PansyColors[]; seed: number }) {
  const r = rng(seed);
  const side = r() < 0.5 ? -1 : 1;

  if (species === 'pansy') {
    const s = stemOf(58 + r() * 14, side * (5 + r() * 8), side * (2 + r() * 6));
    const c = pick(palette, r());
    const [lx, ly] = s.at(0.3);
    const [kx, ky] = s.at(0.58);
    const bud = r() < 0.5;
    return (
      <g>
        <PansyLeaf x={lx} y={ly} rot={-side * (50 + r() * 14)} len={8} s={0.85} />
        <PansyLeaf x={s.at(0.1)[0]} y={s.at(0.1)[1]} rot={side * (42 + r() * 16)} len={6} s={0.72} />
        {bud && (
          <>
            <Stem d={`M${kx.toFixed(1)},${ky.toFixed(1)} q${side * 8},-4 ${side * 14},-2`} w={1.5} color={LEAF.base} />
            <PansyBud x={kx + side * 14} y={ky - 2} rot={side * 150} c={pick(palette, r())} />
          </>
        )}
        <Stem d={s.d} w={1.8} color={LEAF.base} />
        <PansyFlower x={s.tip[0]} y={s.tip[1] - 3} s={0.85} rot={s.angle * 0.6} c={c} />
      </g>
    );
  }

  if (species === 'daisy') {
    const s = stemOf(50 + r() * 14, side * (3 + r() * 7), side * (2 + r() * 5));
    const c = pick([DAISY_WHITE, DAISY_WHITE, DAISY_PINK, DAISY_DEEP], r());
    const second = r() < 0.45;
    const [bx, by] = s.at(0.45);
    return (
      <g>
        <SpoonLeaf rot={-side * (24 + r() * 14)} s={0.62} />
        <SpoonLeaf rot={side * (16 + r() * 14)} s={0.5} />
        {second && (
          <>
            <Stem d={`M${bx.toFixed(1)},${by.toFixed(1)} q${-side * 6},-10 ${-side * 13},-20`} w={1.4} />
            <DaisyFlower x={bx - side * 13} y={by - 21} s={0.8} c={pick([DAISY_WHITE, DAISY_PINK], r())} tilt={-side * 10} />
          </>
        )}
        <Stem d={s.d} w={1.6} />
        <DaisyFlower x={s.tip[0]} y={s.tip[1] - 2} s={1.3} c={c} tilt={s.angle} />
      </g>
    );
  }

  if (species === 'rose') {
    const s = stemOf(64 + r() * 12, side * (5 + r() * 8), side * (2 + r() * 6));
    const [ax, ay] = s.at(0.42);
    const [bx, by] = s.at(0.7);
    const thorns: Array<[number, number, number]> = [0.15, 0.28, 0.55].map((t, i) => {
      const [x, y] = s.at(t);
      return [x + (i % 2 ? 1.2 : -1.2), y, i % 2 ? 70 : -70];
    });
    return (
      <g>
        <Stem d={s.d} w={2.2} color="#5b6f3e" />
        <Thorns pts={thorns} />
        <LeafCluster x={ax} y={ay} rot={side * (52 + r() * 14)} len={18} />
        <LeafCluster x={bx} y={by} rot={-side * (46 + r() * 14)} len={13} young={r() < 0.3} />
        <RoseBloom x={s.tip[0]} y={s.tip[1] - 6} s={0.95} rot={s.angle * 0.5} />
      </g>
    );
  }

  if (species === 'tulip') {
    const s = stemOf(70 + r() * 14, side * (4 + r() * 7), side * (3 + r() * 6));
    const c = r() < 0.65 ? TULIP_PINK : TULIP_NIGHT;
    const leaf = side < 0 ? 1 : -1;
    return (
      <g>
        <g transform={`scale(${leaf} 1)`}>
          <path className="ink" fill={BLUE_LEAF.base} d="M2,0 C-12,-12 -18,-32 -15,-54 C-10,-36 -4,-18 4,-2 Z" />
          <path fill={BLUE_LEAF.shade} d="M2,0 C-8,-14 -13,-32 -15,-54 C-11,-34 -5,-16 4,-2 Z" opacity="0.8" />
        </g>
        <Stem d={s.d} w={2.2} color="#7fa079" />
        <TulipFlower x={s.tip[0]} y={s.tip[1] + 2} rot={s.angle} c={c} s={0.95} />
      </g>
    );
  }

  // lavender: a little bundle of three spikes, tied with thread
  const stems = [-1, 0, 1].map((k) => stemOf(64 + r() * 16, k * 3 + (r() - 0.5) * 4, k * 10 + (r() - 0.5) * 6));
  return (
    <g>
      {stems.map((s, i) => (
        <g key={i}>
          <Stem d={s.d} w={1.3} color="#7f9370" />
          <Spike x={s.tip[0]} y={s.tip[1] + 4} rot={s.angle} n={6 + Math.floor(r() * 3)} colors={BLOOM} />
        </g>
      ))}
      <path d="M-4,-12 C-1,-10.6 2,-10.6 5,-12 M-4,-9 C-1,-7.6 2,-7.6 5,-9" fill="none" stroke="#b5476a" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M5,-10.5 C9,-12 11,-9 8,-7.6 M5,-10.5 C8,-6 6,-3 4,-2" fill="none" stroke="#b5476a" strokeWidth="1.1" strokeLinecap="round" />
    </g>
  );
}
