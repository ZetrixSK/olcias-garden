import { designId, parsePansy, PANSY_PRESETS, type Designs, type PansyDesign } from './designs';
import { SPECIES_IDS, type SpeciesId } from './species';

/** A flower pressed into her book: what it was, when, and its colours as they were that day. */
export type Pressing = {
  id: string;
  /** The plant it came from, so each plant gives at most one flower a day. */
  plantId: string;
  species: SpeciesId;
  at: number;
  /** A built-in bratek variety, or null. */
  variety: string | null;
  /** A copy of her own bratek design, so the page stays as it was even if the design changes or is thrown away. */
  design: PansyDesign | null;
  /** The name she gave the plant, as it was on the day. */
  name: string | null;
  /** What she wrote beside it. */
  note: string;
};

export const MAX_NOTE = 400;
export const MAX_NAME = 24;

/** Far more than years of pressing; past this the book simply stops taking new ones rather than losing old ones. */
export const MAX_PRESSED = 1000;

export const sameDay = (a: number, b: number) => new Date(a).toDateString() === new Date(b).toDateString();

export function pressedToday(pressed: Pressing[], plantId: string, now: number): boolean {
  return pressed.some((p) => p.plantId === plantId && sameDay(p.at, now));
}

export function pressingOf(
  plant: { id: string; species: SpeciesId; variety: string | null; name?: string | null },
  designs: Designs,
  now: number,
  id: string,
): Pressing {
  const own = designId(plant.variety ?? undefined);
  const design = own !== null ? designs.pansies.find((d) => d.id === own) : undefined;
  return {
    id,
    plantId: plant.id,
    species: plant.species,
    at: now,
    variety: own !== null ? null : plant.variety,
    design: design ? { ...design } : null,
    name: plant.name ?? null,
    note: '',
  };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

function parseOne(v: unknown): Pressing | null {
  if (!isObj(v)) return null;
  const { id, plantId, species, at, variety, design, name, note } = v;
  if (typeof id !== 'string' || typeof plantId !== 'string') return null;
  if (!SPECIES_IDS.includes(species as SpeciesId)) return null;
  if (typeof at !== 'number' || !Number.isFinite(at) || at <= 0) return null;
  const pansy = species === 'pansy';
  return {
    id,
    plantId,
    species: species as SpeciesId,
    at,
    variety: pansy && (PANSY_PRESETS as readonly unknown[]).includes(variety) ? (variety as string) : null,
    design: pansy ? parsePansy(design) : null,
    name: typeof name === 'string' && name.trim() ? name.trim().slice(0, MAX_NAME) : null,
    note: typeof note === 'string' ? note.slice(0, MAX_NOTE) : '',
  };
}

/** Reads the book defensively: a damaged page is dropped, the rest are kept. */
export function parsePressed(v: unknown): Pressing[] {
  return (Array.isArray(v) ? v : []).map(parseOne).filter((p): p is Pressing => p !== null).slice(0, MAX_PRESSED);
}
