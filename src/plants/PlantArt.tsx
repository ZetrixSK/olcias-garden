import type { SpeciesId, Stage } from '../garden/species';
import { DaisyPlant } from './Daisy';
import { LavenderPlant } from './Lavender';
import { PansyPlant } from './Pansy';
import { RosePlant } from './Rose';
import { TulipPlant } from './Tulip';

/** Draws any species at any stage, rooted at (0,0) on the soil. */
export function PlantArt({ species, stage }: { species: SpeciesId; stage: Stage }) {
  switch (species) {
    case 'pansy':
      return <PansyPlant stage={stage} />;
    case 'tulip':
      return <TulipPlant stage={stage} />;
    case 'rose':
      return <RosePlant stage={stage} />;
    case 'daisy':
      return <DaisyPlant stage={stage} />;
    case 'lavender':
      return <LavenderPlant stage={stage} />;
  }
}
