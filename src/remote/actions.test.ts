import { describe, expect, it } from 'vitest';
import { parseSave, starterGarden, type GardenState } from '../garden/state';
import { VINE_STEP } from '../garden/vines';
import { applyAction, handled } from './actions';

const NOW = new Date(2026, 9, 31, 12).getTime();

const garden = () => starterGarden(NOW);
const onSill = (g: GardenState, spot: string) => g.plants.find((p) => p.display === spot)!;
const overgrow = (plant: string, id = 'a1', extra: Record<string, unknown> = {}) => ({ id, kind: 'overgrow', payload: { plant, ...extra } });

describe('overgrow', () => {
  it("grows a sill pansy's vine one night's worth", () => {
    const g = garden();
    const pansy = onSill(g, 'sill-2');
    const { garden: out, outcome } = applyAction(g, overgrow(pansy.id));
    expect(outcome).toEqual({ status: 'applied', reason: null });
    const vine = out.plants.find((p) => p.id === pansy.id)!.vine!;
    expect(vine.length).toBeCloseTo(VINE_STEP.pansy);
    // the middle pot's vine picks which way to turn
    expect(vine.dir === 'left' || vine.dir === 'right').toBe(true);
  });

  it('extends a vine that is already growing, up to the whole way', () => {
    let g = garden();
    const rose = onSill(g, 'sill-3');
    g = applyAction(g, overgrow(rose.id, 'a1', { by: 0.9 })).garden;
    g = applyAction(g, overgrow(rose.id, 'a2')).garden;
    expect(g.plants.find((p) => p.id === rose.id)!.vine!.length).toBe(1);
    const third = applyAction(g, overgrow(rose.id, 'a3'));
    expect(third.outcome.status).toBe('skipped');
  });

  it('skips what makes no sense in her garden, saying why', () => {
    const g = garden();
    const tulip = onSill(g, 'sill-1');
    const shelfPansy = g.plants.find((p) => p.species === 'pansy' && p.display === 'shelf-2')!;
    expect(applyAction(g, overgrow('gone')).outcome).toEqual({ status: 'skipped', reason: 'That plant is no longer in her garden.' });
    expect(applyAction(g, overgrow(tulip.id)).outcome.reason).toMatch(/pansies and roses/);
    expect(applyAction(g, overgrow(shelfPansy.id)).outcome.reason).toMatch(/windowsill/);
    const off = { ...g, settings: { ...g.settings, vines: false } };
    expect(applyAction(off, overgrow(onSill(g, 'sill-2').id)).outcome.reason).toMatch(/switched off/);
  });

  it('leaves the plants alone when skipped', () => {
    const g = garden();
    const { garden: out } = applyAction(g, overgrow(onSill(g, 'sill-1').id));
    expect(out.plants).toBe(g.plants);
  });
});

describe('applyAction', () => {
  it('never does the same action twice', () => {
    const g = garden();
    const pansy = onSill(g, 'sill-2');
    const once = applyAction(g, overgrow(pansy.id)).garden;
    const twice = applyAction(once, overgrow(pansy.id));
    expect(twice.garden).toBe(once);
    expect(twice.outcome.status).toBe('applied');
    expect(twice.garden.plants.find((p) => p.id === pansy.id)!.vine!.length).toBeCloseTo(VINE_STEP.pansy);
  });

  it('notes skipped actions too, with the reason', () => {
    const g = applyAction(garden(), { id: 'x', kind: 'paint-the-moon', payload: {} }).garden;
    expect(handled(g, 'x')).toEqual({ id: 'x', status: 'skipped', reason: `This version of the garden doesn't know "paint-the-moon" yet.` });
  });

  it('keeps the record of handled actions with the save', () => {
    const g = garden();
    const out = applyAction(g, overgrow(onSill(g, 'sill-2').id)).garden;
    const reloaded = parseSave(JSON.parse(JSON.stringify(out)), NOW)!;
    expect(handled(reloaded, 'a1')?.status).toBe('applied');
    const old = JSON.parse(JSON.stringify(g));
    delete old.remoteDone;
    expect(parseSave(old, NOW)!.remoteDone).toEqual([]);
  });
});
