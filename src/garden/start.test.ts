import { describe, expect, it } from 'vitest';
import { stageAt } from './growth';
import { addPlant, currentTip, parseSave, plantedByHer, quickLeft, sowSeed, starterGarden, tipDone, tipsOff, TIPS } from './state';

const NOW = new Date(2026, 10, 5, 18).getTime();
const HOUR = 3_600_000;

describe('her first day', () => {
  it('opens with three flowers in the window, empty shelves and a packet of seeds', () => {
    const g = starterGarden(NOW);
    expect(g.plants.map((p) => p.species).sort()).toEqual(['pansy', 'rose', 'tulip']);
    expect(g.plants.every((p) => p.display !== null)).toBe(true);
    expect(g.plants.some((p) => p.slot.startsWith('row'))).toBe(false);
    expect(g.plants.filter((p) => stageAt(p.species, p, NOW) === 'bloom').map((p) => p.species).sort()).toEqual(['pansy', 'rose']);
    // the tulip opens within a few hours
    const tulip = g.plants.find((p) => p.species === 'tulip')!;
    expect(stageAt('tulip', tulip, NOW)).toBe('bud');
    expect(stageAt('tulip', tulip, NOW + 4 * HOUR)).toBe('bloom');
    expect(g.seeds).toEqual([{ id: 'first-seeds', variety: 'olcia', count: 3, made: NOW }]);
    expect(parseSave(JSON.parse(JSON.stringify(g)), NOW)!.seeds).toHaveLength(1);
  });

  it('her first three plantings grow four times as fast, and then it is as usual', () => {
    let g = starterGarden(NOW);
    const slots = ['row2-a', 'row2-b', 'row2-c', 'row2-d'] as const;
    slots.forEach((slot, i) => {
      g = plantedByHer(addPlant(g, slot, 'daisy', NOW, `d${i}`), `d${i}`);
    });
    expect(g.plants.filter((p) => p.quick).map((p) => p.id)).toEqual(['d0', 'd1', 'd2']);
    expect(quickLeft(g)).toBe(0);
    // a daisy blooms after 72 hours; a quick one after 18
    const at = NOW + 19 * HOUR;
    expect(stageAt('daisy', g.plants.find((p) => p.id === 'd0')!, at)).toBe('bloom');
    expect(stageAt('daisy', g.plants.find((p) => p.id === 'd3')!, at)).not.toBe('bloom');
    expect(parseSave(JSON.parse(JSON.stringify(g)), at)!.plants.find((p) => p.id === 'd1')!.quick).toBe(true);
  });

  it('sowing from the seed tin counts too', () => {
    const g = plantedByHer(sowSeed(starterGarden(NOW), 'first-seeds', 'row2-a', NOW, 's1'), 's1');
    expect(g.plants.find((p) => p.id === 's1')).toMatchObject({ species: 'pansy', variety: 'olcia', quick: true });
    expect(g.seeds[0]!.count).toBe(2);
  });

  it('the notes come one at a time, in order, and can be put away for good', () => {
    let g = starterGarden(NOW);
    expect(currentTip(g)).toBe('swipe');
    expect(tipDone(g, 'water')).toBe(g);
    for (const tip of TIPS) g = tipDone(g, tip);
    expect(currentTip(g)).toBeNull();
    expect(currentTip(tipsOff(starterGarden(NOW)))).toBeNull();
  });

  it('a garden from before all this is well past its first days', () => {
    const raw = JSON.parse(JSON.stringify(starterGarden(NOW)));
    delete raw.start;
    const g = parseSave(raw, NOW)!;
    expect(currentTip(g)).toBeNull();
    expect(quickLeft(g)).toBe(0);
  });
});
