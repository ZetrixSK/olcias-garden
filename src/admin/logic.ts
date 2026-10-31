import { MOMENTS, type Moment } from '../weather/moments';
import { SPECIES, type SpeciesId } from '../garden/species';
import type { GardenState, SlotId, WindowSpot } from '../garden/state';

export const SLOT_NAMES: Record<SlotId, string> = {
  'hang-l': 'Hanging, left', 'sill-l': 'Top shelf, left', 'sill-r': 'Top shelf, right', 'hang-r': 'Hanging, right',
  'row2-a': 'Middle shelf 1', 'row2-b': 'Middle shelf 2', 'row2-c': 'Middle shelf 3', 'row2-d': 'Middle shelf 4',
  'row3-a': 'Bottom shelf 1', 'row3-b': 'Bottom shelf 2', 'row3-c': 'Bottom shelf 3', 'row3-d': 'Bottom shelf 4',
};

export const SPOT_NAMES: Record<WindowSpot, string> = {
  'shelf-1': 'Window shelf, left', 'shelf-2': 'Window shelf, middle', 'shelf-3': 'Window shelf, right',
  'sill-1': 'Sill, left', 'sill-2': 'Sill, middle', 'sill-3': 'Sill, right',
};

const slotName = (s: unknown) => (typeof s === 'string' && s in SLOT_NAMES ? SLOT_NAMES[s as SlotId].toLowerCase() : String(s));
const spotName = (s: unknown) => (typeof s === 'string' && s in SPOT_NAMES ? SPOT_NAMES[s as WindowSpot].toLowerCase() : String(s));

/** A garden as the admin page reads it from the database. */
export type GardenRow = {
  id: string;
  label: string;
  garden: unknown;
  save_version: number;
  first_seen: string;
  last_seen: string;
  open_count: number;
};

/** An action and what became of it. */
export type ActionRow = {
  id: string;
  garden: string;
  kind: string;
  payload: Record<string, unknown>;
  created_at: string;
  status: 'pending' | 'applied' | 'skipped';
  done_at: string | null;
  reason: string | null;
};

/** "just now", "5 min ago", "3 h ago", "2 days ago". */
export function ago(then: number, now: number): string {
  const s = Math.max(0, Math.round((now - then) / 1000));
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 36) return `${h} h ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

/** Her phone counts as "open now" while it keeps checking in (it does every 5 minutes while open). */
export const isOnline = (lastSeen: number, now: number) => now - lastSeen < 6 * 60_000;

/**
 * Moments still showing in her window: those carried out recently enough that they haven't
 * passed yet. Her phone keeps them only in memory, so this is worked out from the history.
 */
export function activeMoments(actions: ActionRow[], now: number): Moment[] {
  const out = new Set<Moment>();
  for (const a of actions) {
    if (a.kind !== 'moment' || a.status !== 'applied' || !a.done_at) continue;
    const m = a.payload.moment;
    if (!(MOMENTS as readonly unknown[]).includes(m)) continue;
    const minutes = typeof a.payload.minutes === 'number' && a.payload.minutes > 0 ? Math.min(240, a.payload.minutes) : 30;
    if (Date.parse(a.done_at) + minutes * 60_000 > now) out.add(m as Moment);
  }
  return [...out];
}

export const MOMENT_NAMES: Record<Moment, string> = {
  rainbow: 'Rainbow',
  aurora: 'Northern lights',
  fog: 'Morning fog',
  'shooting-stars': 'Shooting stars',
  ducks: 'Ducks',
  heron: 'Heron',
  deer: 'Deer',
  robin: 'Robin',
  skater: 'Skater',
  butterflies: 'Butterflies',
};

/** A plant as she'd know it: its name if it has one, otherwise its kind. */
export function plantName(g: GardenState | null, id: unknown): string {
  const p = g?.plants.find((x) => x.id === id);
  if (!p) return 'a plant';
  const kind = SPECIES[p.species].name.toLowerCase();
  return p.name ? `${p.name} (${kind})` : `the ${kind}`;
}

const speciesName = (s: unknown) => (typeof s === 'string' && s in SPECIES ? SPECIES[s as SpeciesId].name.toLowerCase() : String(s));

/** One line for the history: what was asked for, in words. */
export function describe(a: Pick<ActionRow, 'kind' | 'payload'>, g: GardenState | null): string {
  const p = a.payload;
  const plant = plantName(g, p.plant);
  switch (a.kind) {
    case 'overgrow':
      return `Grow a vine on ${plant}`;
    case 'water':
      return `Water ${plant}`;
    case 'trim':
      return `Trim the vine on ${plant}`;
    case 'stage':
      return `Show ${plant} at the ${String(p.stage)} stage`;
    case 'plant':
      return `Plant a ${speciesName(p.species)}${typeof p.name === 'string' && p.name ? ` called ${p.name}` : ''} on the ${slotName(p.slot)}`;
    case 'remove':
      return `Remove ${plant}`;
    case 'pot':
      return `Re-pot ${plant}`;
    case 'variety':
      return `New colours for ${plant}`;
    case 'name':
      return `Name ${plant} "${String(p.name)}"`;
    case 'move':
      return `Move ${plant} to the ${slotName(p.slot)}`;
    case 'window':
      return p.spot === null ? `Take ${plant} out of the window` : `Put ${plant} in the window (${spotName(p.spot)})`;
    case 'moment': {
      const m = p.moment as Moment;
      return `${MOMENT_NAMES[m] ?? String(m)} for ${typeof p.minutes === 'number' ? p.minutes : 30} min`;
    }
    case 'settings': {
      const patch = typeof p.patch === 'object' && p.patch ? (p.patch as Record<string, unknown>) : {};
      return `Settings: ${Object.entries(patch).map(([k, v]) => `${k} ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`).join(', ')}`;
    }
    case 'design':
      return `A new ${p.type === 'pot' ? 'pot' : 'bratek'} design`;
    case 'note':
      return 'A note in her book';
    default:
      return a.kind;
  }
}
