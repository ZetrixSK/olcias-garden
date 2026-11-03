import { designId, parsePansy, PANSY_PRESETS, type Designs, type PansyDesign } from './designs';
import { stageAt } from './growth';
import { sameDay } from './pressed';
import { SPECIES_IDS, type SpeciesId } from './species';

/**
 * Bouquets: stems cut from her flowers in bloom, arranged in a vase. A bouquet carries copies of
 * its colours (like a pressed flower does), so it looks the same in anyone's garden it's sent to.
 */

export const VASES = ['jar', 'jug', 'bottle', 'can', 'cauldron'] as const;
export type Vase = (typeof VASES)[number];
/** The vases she always has; the others are gifts from visitors. */
export const BASE_VASES: readonly Vase[] = ['jar', 'jug', 'bottle'];

/** Ribbons tied round the vase; null for none. The same curated colours as her pots. */
export const RIBBONS = ['#c95d7f', '#2b2229', '#f2c4cf', '#b9a3e3', '#c9a45c', '#a7b598'] as const;

export type Stem = {
  species: SpeciesId;
  /** A built-in bratek variety, or null. */
  variety: string | null;
  /** A copy of her own bratek design, so it travels with the bouquet. */
  design: PansyDesign | null;
};

export type Bouquet = {
  id: string;
  stems: Stem[];
  vase: Vase;
  ribbon: string | null;
  /** A few words on the little card tied to it. */
  note: string;
  /** The tag of whoever sent it, or null for one she made herself. */
  from: string | null;
  at: number;
  /** Varies how the stems are arranged; "shuffle" picks another. */
  seed: number;
};

/** A bouquet standing on one of the shelves. */
export type PlacedBouquet = Bouquet & { slot: string };

/** One stem cut from a plant, remembered for a day so each plant only gives a few. */
export type Cutting = { plant: string; at: number };

export const MAX_STEMS = 7;
export const STEMS_PER_PLANT = 3;
export const MAX_NOTE = 140;
export const MAX_BOUQUETS = 12;
export const MAX_PARCELS = 30;

/** How many more stems a plant can give today: only in bloom, and a few a day. */
export function stemsLeft(plant: { id: string; species: SpeciesId; plantedAt: number; waterings: number[] }, cuttings: Cutting[], now: number): number {
  if (stageAt(plant.species, plant, now) !== 'bloom') return 0;
  const cut = cuttings.filter((c) => c.plant === plant.id && sameDay(c.at, now)).length;
  return Math.max(0, STEMS_PER_PLANT - cut);
}

/** A stem from one of her plants, with its colours copied. */
export function stemOf(plant: { species: SpeciesId; variety: string | null }, designs: Designs): Stem {
  if (plant.species !== 'pansy') return { species: plant.species, variety: null, design: null };
  const own = designId(plant.variety ?? undefined);
  const design = own !== null ? designs.pansies.find((d) => d.id === own) : undefined;
  return { species: 'pansy', variety: own !== null ? null : plant.variety, design: design ? { ...design } : null };
}

/** Only today's and yesterday's cuttings matter; older ones are let go. */
export function pruneCuttings(cuttings: Cutting[], now: number): Cutting[] {
  return cuttings.filter((c) => now - c.at < 2 * 86_400_000).slice(-200);
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const HEX = /^#[0-9a-f]{6}$/i;

function parseStem(v: unknown): Stem | null {
  if (!isObj(v) || !SPECIES_IDS.includes(v.species as SpeciesId)) return null;
  const pansy = v.species === 'pansy';
  return {
    species: v.species as SpeciesId,
    variety: pansy && (PANSY_PRESETS as readonly unknown[]).includes(v.variety) ? (v.variety as string) : null,
    design: pansy ? parsePansy(v.design) : null,
  };
}

/**
 * Reads a bouquet defensively, whether from her save or arriving from someone else: anything that
 * doesn't make sense is dropped or set to something safe. Null if there's nothing left of it.
 */
export function parseBouquet(v: unknown): Bouquet | null {
  if (!isObj(v) || typeof v.id !== 'string' || !v.id || v.id.length > 64) return null;
  const stems = (Array.isArray(v.stems) ? v.stems : []).map(parseStem).filter((s): s is Stem => s !== null).slice(0, MAX_STEMS);
  if (stems.length === 0) return null;
  const at = typeof v.at === 'number' && Number.isFinite(v.at) && v.at > 0 ? v.at : Date.now();
  return {
    id: v.id,
    stems,
    vase: (VASES as readonly unknown[]).includes(v.vase) ? (v.vase as Vase) : 'jar',
    ribbon: typeof v.ribbon === 'string' && HEX.test(v.ribbon) ? v.ribbon : null,
    note: typeof v.note === 'string' ? v.note.slice(0, MAX_NOTE) : '',
    from: typeof v.from === 'string' && /^[a-z0-9_]{3,20}$/.test(v.from) ? v.from : null,
    at,
    seed: typeof v.seed === 'number' && Number.isFinite(v.seed) ? Math.floor(Math.abs(v.seed)) % 1_000_000 : 1,
  };
}

/** Bouquets on the shelves: each needs a place that's free (not a hanging pot, not taken). */
export function parsePlaced(v: unknown, freeSlot: (slot: string) => boolean): PlacedBouquet[] {
  const taken = new Set<string>();
  const out: PlacedBouquet[] = [];
  for (const x of Array.isArray(v) ? v : []) {
    const b = parseBouquet(x);
    const slot = isObj(x) ? x.slot : null;
    if (!b || typeof slot !== 'string' || !freeSlot(slot) || taken.has(slot) || out.length >= MAX_BOUQUETS) continue;
    taken.add(slot);
    out.push({ ...b, slot });
  }
  return out;
}

export function parseParcels(v: unknown): Bouquet[] {
  return (Array.isArray(v) ? v : []).map(parseBouquet).filter((b): b is Bouquet => b !== null).slice(0, MAX_PARCELS);
}

export function parseCuttings(v: unknown): Cutting[] {
  return (Array.isArray(v) ? v : [])
    .filter((c): c is Cutting => isObj(c) && typeof c.plant === 'string' && typeof c.at === 'number' && Number.isFinite(c.at))
    .map((c) => ({ plant: c.plant, at: c.at }))
    .slice(-200);
}
