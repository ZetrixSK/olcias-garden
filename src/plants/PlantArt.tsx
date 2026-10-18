import type { SpeciesId, Stage } from '../garden/species';
import { DaisyPlant } from './Daisy';
import { LavenderPlant } from './Lavender';
import { PansyPlant, type PansyColors } from './Pansy';
import { RosePlant } from './Rose';
import { TulipPlant } from './Tulip';

/** Draws any species at any stage, rooted at (0,0) on the soil. */
export function PlantArt({ species, stage, palette, label }: { species: SpeciesId; stage: Stage; palette?: PansyColors[]; label?: string }) {
  switch (species) {
    case 'pansy':
      return <PansyPlant stage={stage} palette={palette} label={label} />;
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
