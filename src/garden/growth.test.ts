import { describe, expect, it } from 'vitest';
import { growthHours, isSoilWet, plantedAtForStage, stageAt } from './growth';
import { SPECIES_IDS, STAGES } from './species';

const H = 3_600_000;
const T0 = Date.UTC(2026, 9, 1);

describe('growth', () => {
  it('grows from elapsed time alone, including time the app was closed', () => {
    const plant = { plantedAt: T0, waterings: [] };
    expect(growthHours(plant, T0 + 10 * H)).toBeCloseTo(10);
    expect(stageAt('pansy', plant, T0)).toBe('seed');
    expect(stageAt('pansy', plant, T0 + 9 * H)).toBe('seedling');
    expect(stageAt('pansy', plant, T0 + 40 * H)).toBe('bud');
    expect(stageAt('pansy', plant, T0 + 30 * 24 * H)).toBe('bloom');
  });

  it('never goes backwards or dies after a long absence', () => {
    expect(stageAt('rose', { plantedAt: T0, waterings: [] }, T0 + 365 * 24 * H)).toBe('bloom');
  });

  it('gives a bonus per watering, but only once per cooldown window', () => {
    const plant = { plantedAt: T0, waterings: [T0 + H, T0 + 1.5 * H, T0 + 2 * H, T0 + 8 * H] };
    expect(growthHours(plant, T0 + 10 * H)).toBeCloseTo(10 + 12);
  });

  it('ignores waterings from before planting or from the future', () => {
    expect(growthHours({ plantedAt: T0, waterings: [T0 - H, T0 + 50 * H] }, T0 + 10 * H)).toBeCloseTo(10);
  });

  it('treats a clock set before the planting time as no growth', () => {
    expect(growthHours({ plantedAt: T0, waterings: [] }, T0 - 5 * H)).toBe(0);
  });

  it('keeps soil wet for a while after watering', () => {
    const plant = { plantedAt: T0, waterings: [T0 + H] };
    expect(isSoilWet(plant, T0 + 2 * H)).toBe(true);
    expect(isSoilWet(plant, T0 + 20 * H)).toBe(false);
    expect(isSoilWet({ plantedAt: T0, waterings: [] }, T0)).toBe(false);
  });

  it('can backdate a plant to show any stage', () => {
    for (const species of SPECIES_IDS) {
      for (const stage of STAGES) {
        const plantedAt = plantedAtForStage(species, stage, T0);
        expect(stageAt(species, { plantedAt, waterings: [] }, T0)).toBe(stage);
      }
    }
  });
});
