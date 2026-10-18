import { designId, potShape, type Designs, type PansyDesign, type PansyPreset, type PotDesign, type PotRef } from '../garden/designs';
import { SPECIES, type GardenPot, type SpeciesId } from '../garden/species';
import { PANSY_CREAM, PANSY_MIX, PANSY_OLCIA, PANSY_ROSY, PANSY_VELVET, type PansyColors } from './Pansy';

/** Mixes two hex colours; t = 0 gives a, t = 1 gives b. */
export function mix(a: string, b: string, t: number): string {
  const n = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [n(a), n(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i]! - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

const PRESETS: Record<PansyPreset, PansyColors[]> = {
  mix: PANSY_MIX,
  olcia: [PANSY_OLCIA],
  velvet: [PANSY_VELVET],
  rosy: [PANSY_ROSY],
  cream: [PANSY_CREAM],
};

/** Her design as flower colours: shade and highlight are derived, so a single swatch per part is enough. */
export function designColors(d: PansyDesign): PansyColors {
  return {
    top: d.top,
    topShade: mix(d.top, '#1a0d1c', 0.28),
    topHi: mix(d.top, '#ffffff', 0.35),
    low: d.low,
    lowShade: mix(d.low, '#1a0d1c', 0.2),
    face: d.faceColor,
    ...(d.edge ? { edge: d.edge } : {}),
    ...(d.face === 'whiskers' ? { whiskers: true } : {}),
    ...(d.face === 'clear' ? { clear: true } : {}),
  };
}

const cache = new WeakMap<PansyDesign, PansyColors[]>();

/**
 * The colours a bratek blooms in. Results are cached per design, so the same design always gives
 * the same array and drawings that depend on it aren't redrawn needlessly.
 */
export function pansyPalette(variety: string | null, designs: Designs): PansyColors[] {
  if (!variety) return PANSY_MIX;
  const id = designId(variety);
  if (id === null) return PRESETS[variety as PansyPreset] ?? PANSY_MIX;
  const design = designs.pansies.find((d) => d.id === id);
  if (!design) return PANSY_MIX;
  let palette = cache.get(design);
  if (!palette) {
    palette = [designColors(design)];
    cache.set(design, palette);
  }
  return palette;
}

/** The painted pot a plant stands in, if it is one of hers. */
export function potDesignFor(pot: PotRef, designs: Designs): PotDesign | undefined {
  const id = designId(pot);
  return id === null ? undefined : designs.pots.find((d) => d.id === id);
}

/** Everything needed to draw a plant the way she has styled it. */
export type PlantLook = { shape: GardenPot; pot: PotDesign | undefined; palette: PansyColors[]; label: string | undefined };

export function plantLook(plant: { species: SpeciesId; pot: PotRef; variety: string | null; name?: string | null }, designs: Designs): PlantLook {
  return {
    shape: potShape(plant.pot, designs, SPECIES[plant.species].pot),
    pot: potDesignFor(plant.pot, designs),
    palette: plant.species === 'pansy' ? pansyPalette(plant.variety, designs) : PANSY_MIX,
    // a bratek of her own design carries its name on the seed marker
    // her name for the plant first, then her bratek variety's name
    label: plant.name || (plant.species === 'pansy' ? designs.pansies.find((d) => `d:${d.id}` === plant.variety)?.name || undefined : undefined),
  };
}
