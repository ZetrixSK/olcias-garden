import type { GardenState, Plant } from '../garden/state';
import { isVineSpecies, isVineSpot } from '../garden/vines';
import { pansyPalette } from '../plants/looks';
import type { VineSpec } from './Vines';

/** The vines to draw: those of plants standing on the sill, while vines are switched on. */
export function vineSpecs(garden: GardenState, plants: Plant[] = garden.plants): VineSpec[] {
  if (!garden.settings.vines) return [];
  return plants.flatMap((p) =>
    p.vine && isVineSpot(p.display) && isVineSpecies(p.species)
      ? [
          {
            id: p.id,
            species: p.species,
            from: p.display,
            length: p.vine.length,
            palette: pansyPalette(p.variety, garden.designs),
            ...(p.vine.dir ? { dir: p.vine.dir } : {}),
          },
        ]
      : [],
  );
}
