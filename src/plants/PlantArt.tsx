import type { SpeciesId, Stage } from '../garden/species';
import { DaisyPlant } from './Daisy';
import { LavenderPlant } from './Lavender';
import { PansyPlant, type PansyColors } from './Pansy';
import { RosePlant } from './Rose';
import { TulipPlant } from './Tulip';
import { ChristmasRosePlant, CyclamenPlant, SnowdropPlant } from './Winter';
import { HollyhockPlant, PumpkinPlant } from './Gothic';
import { BatFlowerPlant, MoonflowerPlant } from './Night';

/** Draws any species at any stage, rooted at (0,0) on the soil. */
export function PlantArt({ species, stage, palette, label, rim }: { species: SpeciesId; stage: Stage; palette?: PansyColors[]; label?: string; rim?: number }) {
  switch (species) {
    case 'pansy':
      return <PansyPlant stage={stage} palette={palette} label={label} rim={rim} />;
    case 'tulip':
      return <TulipPlant stage={stage} label={label} />;
    case 'rose':
      return <RosePlant stage={stage} label={label} />;
    case 'daisy':
      return <DaisyPlant stage={stage} label={label} />;
    case 'lavender':
      return <LavenderPlant stage={stage} label={label} />;
    case 'snowdrop':
      return <SnowdropPlant stage={stage} label={label} />;
    case 'cyclamen':
      return <CyclamenPlant stage={stage} label={label} />;
    case 'hellebore':
      return <ChristmasRosePlant stage={stage} label={label} />;
    case 'hollyhock':
      return <HollyhockPlant stage={stage} label={label} />;
    case 'pumpkin':
      return <PumpkinPlant stage={stage} label={label} />;
    case 'batflower':
      return <BatFlowerPlant stage={stage} label={label} />;
    case 'moonflower':
      return <MoonflowerPlant stage={stage} label={label} />;
  }
}
