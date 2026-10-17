import { stageAt } from './growth';
import type { SpeciesId } from './species';
import type { WindowSpot } from './state';

/** The three sill spots a vine can grow from. */
export const VINE_SPOTS = ['sill-1', 'sill-2', 'sill-3'] as const satisfies readonly WindowSpot[];
export type VineSpot = (typeof VINE_SPOTS)[number];

/** Which way a vine from the middle pot turns once it reaches the top of the centre bar. */
export type MiddleDir = 'left' | 'right';

/**
 * The six routes:
 * - side pots arch across the whole window and down the far side ('across'), or climb their side and
 *   come down the centre bar ('middle');
 * - the middle pot climbs the centre bar and turns left or right.
 */
export type RouteKind = 'left-across' | 'left-middle' | 'right-across' | 'right-middle' | 'middle-left' | 'middle-right';

/**
 * Picks every vine's route from which pots have one. Side vines arch across unless all three are
 * growing: then the side the middle vine turns away from comes down the centre bar instead, so every
 * part of the window carries exactly two vines.
 */
export function chooseRoutes(left: boolean, right: boolean, middle: MiddleDir | null): Partial<Record<VineSpot, RouteKind>> {
  const routes: Partial<Record<VineSpot, RouteKind>> = {};
  const all = left && right && middle !== null;
  if (middle) routes['sill-2'] = middle === 'right' ? 'middle-right' : 'middle-left';
  if (left) routes['sill-1'] = all && middle === 'right' ? 'left-middle' : 'left-across';
  if (right) routes['sill-3'] = all && middle === 'left' ? 'right-middle' : 'right-across';
  return routes;
}

/**
 * Direction for a new middle vine. With both sides already growing, it turns towards the longer one,
 * so the shorter one is the vine that changes course. Otherwise it is a coin flip (`coin` in 0..1).
 */
export function pickMiddleDir(leftLength: number | null, rightLength: number | null, coin: number): MiddleDir {
  if (leftLength !== null && rightLength !== null && leftLength !== rightLength) {
    return leftLength > rightLength ? 'left' : 'right';
  }
  return coin < 0.5 ? 'left' : 'right';
}

// ---- growing vines, night by night ----

/** Species that can outgrow their pots. Tulips, daisies and lavender never do. */
export const VINE_SPECIES = ['pansy', 'rose'] as const;
export type VineSpecies = (typeof VINE_SPECIES)[number];

/** A plant's vine: how far along its route it has grown (0 to 1), and for the middle pot, which way it turned. */
export type Vine = { length: number; dir?: MiddleDir };

/** The nightly check happens at this local hour. */
export const NIGHT_HOUR = 3;
/** Chance of anything outgrowing on a night when at least one plant qualifies. */
export const VINE_CHANCE = 0.5;
/** When two or more qualify and something happens, the chance it is two plants instead of one. */
export const TWO_CHANCE = 0.35;
/** How much a vine grows on a night it is picked: pansies leap, roses take their time. */
export const VINE_STEP: Record<VineSpecies, number> = { pansy: 0.18, rose: 0.1 };
/** Once a rose has started climbing it creeps on by itself every night. */
export const ROSE_CREEP = 0.03;
/** One tap of Trim cuts this much off; a vine shorter than MIN_VINE is gone. */
export const TRIM_STEP = 0.15;
export const MIN_VINE = 0.03;
/** Nights further back than this are not replayed after a long absence. */
const MAX_NIGHTS = 90;

export const isVineSpecies = (s: string): s is VineSpecies => (VINE_SPECIES as readonly string[]).includes(s);
export const isVineSpot = (s: string | null): s is VineSpot => s !== null && (VINE_SPOTS as readonly string[]).includes(s);

const nightOf = (y: number, m: number, d: number) => new Date(y, m, d, NIGHT_HOUR).getTime();

/** The most recent 3:00 at or before `now`, in local time. */
export function lastNight(now: number): number {
  const d = new Date(now);
  const today = nightOf(d.getFullYear(), d.getMonth(), d.getDate());
  return today <= now ? today : nightOf(d.getFullYear(), d.getMonth(), d.getDate() - 1);
}

/** The 3:00 before a given 3:00 (by calendar, so daylight-saving days are handled). */
export function nightBefore(night: number): number {
  const d = new Date(night);
  return nightOf(d.getFullYear(), d.getMonth(), d.getDate() - 1);
}

/** Every 3:00 after `after` and up to `upTo`, oldest first; at most the last MAX_NIGHTS. */
export function nightsBetween(after: number, upTo: number): number[] {
  const out: number[] = [];
  for (let t = lastNight(upTo); t > after && out.length < MAX_NIGHTS; t = nightBefore(t)) out.push(t);
  return out.reverse();
}

/** Small seeded generator: the same night always rolls the same dice. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** The parts of a plant the nightly check looks at. */
type VinePlant = {
  id: string;
  species: SpeciesId;
  display: WindowSpot | null;
  plantedAt: number;
  waterings: number[];
  vine: Vine | null;
};

/**
 * Whether a plant may outgrow its pot at the 3:00 `night`: a pansy or rose on the sill, already in
 * bloom at the previous night's check, and watered since then.
 */
export function qualifies(p: VinePlant, night: number): boolean {
  if (!isVineSpecies(p.species) || !isVineSpot(p.display)) return false;
  const prev = nightBefore(night);
  return stageAt(p.species, p, prev) === 'bloom' && p.waterings.some((w) => w > prev && w <= night);
}

/** A middle vine without a direction gets one: towards the longer side vine, or by its own coin. */
export function settleMiddleDir<P extends VinePlant>(plants: P[]): P[] {
  const mid = plants.find((p) => p.display === 'sill-2' && p.vine && !p.vine.dir);
  if (!mid?.vine) return plants;
  const len = (spot: VineSpot) => plants.find((p) => p.display === spot)?.vine?.length ?? null;
  const dir = pickMiddleDir(len('sill-1'), len('sill-3'), rng(hash(mid.id))());
  const vine: Vine = { ...mid.vine, dir };
  return plants.map((p) => (p === mid ? { ...p, vine } : p));
}

const grow = (v: Vine | null, by: number): Vine => ({ ...v, length: Math.min(1, (v?.length ?? 0) + by) });

/**
 * Replays every 3:00 since the last check. Each night climbing roses creep on; then, if any plant
 * qualifies, there is a VINE_CHANCE that one (sometimes two) of them grows a vine or extends theirs.
 * The dice are seeded by the night, so reopening the app never changes what happened. With vines
 * switched off, nights pass without anything growing.
 */
export function runNights<P extends VinePlant>(
  plants: P[],
  checkedAt: number,
  now: number,
  enabled: boolean,
): { plants: P[]; checkedAt: number } {
  const nights = nightsBetween(checkedAt, now);
  if (nights.length === 0) return { plants, checkedAt };
  let out = plants;
  if (enabled) {
    for (const night of nights) {
      out = out.map((p) => (p.vine && p.species === 'rose' && isVineSpot(p.display) ? { ...p, vine: grow(p.vine, ROSE_CREEP) } : p));
      const dice = rng(hash(`night:${night}`));
      const eligible = out.filter((p) => qualifies(p, night)).sort((a, b) => (a.id < b.id ? -1 : 1));
      if (eligible.length > 0 && dice() < VINE_CHANCE) {
        const count = eligible.length >= 2 && dice() < TWO_CHANCE ? 2 : 1;
        const picked = new Set<string>();
        while (picked.size < count) picked.add(eligible[Math.floor(dice() * eligible.length)]!.id);
        out = out.map((p) => (picked.has(p.id) ? { ...p, vine: grow(p.vine, VINE_STEP[p.species as VineSpecies]) } : p));
      }
      out = settleMiddleDir(out);
    }
  }
  return { plants: out, checkedAt: nights[nights.length - 1]! };
}

/** One snip: the vine gets shorter, and is gone once there is hardly any left. */
export function trimmed(v: Vine | null): Vine | null {
  if (!v) return null;
  const length = v.length - TRIM_STEP;
  return length < MIN_VINE ? null : { ...v, length };
}
