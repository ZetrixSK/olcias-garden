import { plantedAtForStage } from './growth';
import { SPECIES, type SpeciesId, type Stage } from './species';
import { newId, starterGarden, type GardenState, type Plant, type SlotId, type WindowSpot } from './state';

/**
 * For tests only: a garden well into its life, with plants on the shelves and in the window at
 * different stages, an empty seed tin and the first days behind it. Many tests count on this layout.
 */
export function testGarden(now: number): GardenState {
  const p = (species: SpeciesId, slot: SlotId, stage: Stage, display: WindowSpot | null = null): Plant => ({
    id: newId(),
    species,
    slot,
    pot: SPECIES[species].pot,
    variety: null,
    plantedAt: plantedAtForStage(species, stage, now),
    waterings: [],
    display,
    vine: null,
    name: null,
    trait: null,
  });
  return {
    ...starterGarden(now),
    plants: [
      p('pansy', 'sill-l', 'bloom', 'sill-2'),
      p('tulip', 'sill-r', 'bud', 'sill-1'),
      p('daisy', 'hang-l', 'bloom', 'shelf-3'),
      p('pansy', 'hang-r', 'bud', 'shelf-2'),
      p('lavender', 'row2-a', 'bloom'),
      p('rose', 'row2-c', 'bud', 'sill-3'),
      p('pansy', 'row2-d', 'seed', 'shelf-1'),
    ],
    seeds: [],
    start: { planted: 3, tip: 6, off: false },
  };
}
