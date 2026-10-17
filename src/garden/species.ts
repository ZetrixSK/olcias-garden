export type SpeciesId = 'pansy' | 'tulip' | 'rose' | 'daisy' | 'lavender';
export type Stage = 'seed' | 'seedling' | 'bud' | 'bloom';

export const STAGES: Stage[] = ['seed', 'seedling', 'bud', 'bloom'];

/** Pots a garden plant can live in. The tiny ones are only used by the room view's shelf. */
export const POT_KINDS = ['wide', 'slim', 'round', 'cauldron', 'teacup'] as const;
export type GardenPot = (typeof POT_KINDS)[number];

type SpeciesInfo = {
  name: string;
  /** Polish name, written on the seed marker. */
  polish: string;
  /** Hours of growth needed to reach seedling, bud and bloom. */
  hours: [number, number, number];
  pot: GardenPot;
};

export const SPECIES: Record<SpeciesId, SpeciesInfo> = {
  pansy: { name: 'Pansy', polish: 'bratek', hours: [8, 36, 84], pot: 'wide' },
  tulip: { name: 'Tulip', polish: 'tulipan', hours: [12, 48, 96], pot: 'slim' },
  rose: { name: 'Rose', polish: 'róża', hours: [12, 60, 120], pot: 'round' },
  daisy: { name: 'Daisy', polish: 'stokrotka', hours: [6, 30, 72], pot: 'teacup' },
  lavender: { name: 'Lavender', polish: 'lawenda', hours: [10, 48, 108], pot: 'cauldron' },
};

export const SPECIES_IDS = Object.keys(SPECIES) as SpeciesId[];

export const STAGE_LABEL: Record<Stage, string> = {
  seed: 'Just planted',
  seedling: 'Sprouting',
  bud: 'Budding',
  bloom: 'In bloom',
};
