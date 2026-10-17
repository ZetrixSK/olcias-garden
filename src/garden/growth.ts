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
