import { SPECIES, type SpeciesId, type Stage } from './species';

const HOUR = 3_600_000;

/** Each watering adds this much growth, but only once per cooldown window, so tapping repeatedly does nothing extra. */
export const WATER_BONUS_HOURS = 6;
export const WATER_COOLDOWN_HOURS = 6;
/** Soil looks dark and damp for this long after watering. */
export const WET_HOURS = 8;

type Growing = { plantedAt: number; waterings: number[] };

/** Growth so far, in hours. Purely from timestamps, so it keeps going while the app is closed. */
export function growthHours(plant: Growing, now: number): number {
  const elapsed = Math.max(0, now - plant.plantedAt) / HOUR;
  let bonus = 0;
  let lastCounted = -Infinity;
  for (const t of [...plant.waterings].sort((a, b) => a - b)) {
    if (t < plant.plantedAt || t > now) continue;
    if (t - lastCounted >= WATER_COOLDOWN_HOURS * HOUR) {
      bonus += WATER_BONUS_HOURS;
      lastCounted = t;
    }
  }
  return elapsed + bonus;
}

export function stageAt(species: SpeciesId, plant: Growing, now: number): Stage {
  const h = growthHours(plant, now);
  const [seedling, bud, bloom] = SPECIES[species].hours;
  if (h >= bloom) return 'bloom';
  if (h >= bud) return 'bud';
  if (h >= seedling) return 'seedling';
  return 'seed';
}

const NEXT: Record<Stage, Stage | null> = { seed: 'seedling', seedling: 'bud', bud: 'bloom', bloom: null };

/**
 * The next stage and roughly how long until it, if she doesn't water again. Null once in bloom.
 */
export function nextStage(species: SpeciesId, plant: Growing, now: number): { stage: Stage; inMs: number } | null {
  const stage = NEXT[stageAt(species, plant, now)];
  if (!stage) return null;
  const [seedling, bud, bloom] = SPECIES[species].hours;
  const at = { seedling, bud, bloom, seed: 0 }[stage];
  return { stage, inMs: Math.max(0, (at - growthHours(plant, now)) * HOUR) };
}

/** Whether watering now would count: the last watering that helped was long enough ago. */
export function waterWouldHelp(plant: Growing, now: number): boolean {
  let lastCounted = -Infinity;
  for (const t of [...plant.waterings].sort((a, b) => a - b)) {
    if (t < plant.plantedAt || t > now) continue;
    if (t - lastCounted >= WATER_COOLDOWN_HOURS * HOUR) lastCounted = t;
  }
  return now - lastCounted >= WATER_COOLDOWN_HOURS * HOUR;
}

export function isSoilWet(plant: Growing, now: number): boolean {
  const past = plant.waterings.filter((t) => t <= now);
  if (past.length === 0) return false;
  return now - Math.max(...past) < WET_HOURS * HOUR;
}

/** Planting time that makes a plant show a given stage right now: used for the starter garden. */
export function plantedAtForStage(species: SpeciesId, stage: Stage, now: number): number {
  const [seedling, bud, bloom] = SPECIES[species].hours;
  const hours = { seed: 0, seedling: seedling + 1, bud: bud + 1, bloom: bloom + 1 }[stage];
  return now - hours * HOUR;
}
