import { testGarden } from '../garden/testGarden';
import { describe, expect, it } from 'vitest';
import { parseSave, type GardenState } from '../garden/state';
import { VINE_STEP } from '../garden/vines';
import { stageAt } from '../garden/growth';
import { STAGES } from '../garden/species';
import { withMoments } from '../weather/moments';
import { applyAction as apply, handled, type RemoteAction } from './actions';

const applyAction = (g: GardenState, a: RemoteAction) => apply(g, a, NOW);

const NOW = new Date(2026, 9, 31, 12).getTime();

const garden = () => testGarden(NOW);
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

const act = (kind: string, payload: Record<string, unknown>, id = `${kind}-1`) => ({ id, kind, payload });
const find = (g: GardenState, id: string) => g.plants.find((p) => p.id === id);

describe('stage', () => {
  it('shows a plant at the stage asked for, forwards or back', () => {
    const g = garden();
    const seed = g.plants.find((p) => stageAt(p.species, p, NOW) === 'seed')!;
    const bloomed = applyAction(g, act('stage', { plant: seed.id, stage: 'bloom' })).garden;
    expect(stageAt(seed.species, find(bloomed, seed.id)!, NOW)).toBe('bloom');
    const back = applyAction(bloomed, act('stage', { plant: seed.id, stage: 'seedling' }, 's2')).garden;
    expect(stageAt(seed.species, find(back, seed.id)!, NOW)).toBe('seedling');
  });

  it('allows for her waterings, which make plants grow faster', () => {
    const g = garden();
    const tulip = onSill(g, 'sill-1');
    const hour = 3_600_000;
    const watered = { ...g, plants: g.plants.map((p) => (p.id === tulip.id ? { ...p, waterings: [NOW - 40 * hour, NOW - 20 * hour, NOW - hour] } : p)) };
    for (const stage of STAGES) {
      const out = applyAction(watered, act('stage', { plant: tulip.id, stage }, stage));
      if (out.outcome.status === 'applied') expect(stageAt('tulip', find(out.garden, tulip.id)!, NOW)).toBe(stage);
    }
  });

  it('skips a stage it is already at, or one that does not exist', () => {
    const g = garden();
    const pansy = onSill(g, 'sill-2');
    expect(applyAction(g, act('stage', { plant: pansy.id, stage: 'bloom' })).outcome.reason).toMatch(/already/);
    expect(applyAction(g, act('stage', { plant: pansy.id, stage: 'tree' })).outcome.status).toBe('skipped');
  });
});

describe('plants', () => {
  it('waters, with the watering shown on screen', () => {
    const g = garden();
    const pansy = onSill(g, 'sill-2');
    const out = applyAction(g, act('water', { plant: pansy.id }));
    expect(find(out.garden, pansy.id)!.waterings).toContain(NOW);
    expect(out.effect).toEqual({ kind: 'water', plant: pansy.id });
  });

  it('plants a new flower in an empty place, already grown, potted and named', () => {
    const g = garden();
    const out = applyAction(g, act('plant', { slot: 'row3-a', species: 'pansy', variety: 'olcia', pot: 'cauldron', stage: 'bud', name: 'Luna', id: 'new-1' }));
    expect(out.outcome.status).toBe('applied');
    const p = find(out.garden, 'new-1')!;
    expect(p).toMatchObject({ slot: 'row3-a', species: 'pansy', variety: 'olcia', pot: 'cauldron', name: 'Luna' });
    expect(stageAt('pansy', p, NOW)).toBe('bud');
  });

  it('will not plant where something stands, or what does not exist', () => {
    const g = garden();
    const taken = g.plants[0]!.slot;
    expect(applyAction(g, act('plant', { slot: taken, species: 'rose' })).outcome.reason).toMatch(/already standing/);
    expect(applyAction(g, act('plant', { slot: 'row3-a', species: 'cactus' })).outcome.status).toBe('skipped');
    expect(applyAction(g, act('plant', { slot: 'row3-a', species: 'rose', variety: 'olcia' })).outcome.status).toBe('skipped');
    expect(applyAction(g, act('plant', { slot: 'row3-a', species: 'rose', pot: 'd:nope' })).outcome.status).toBe('skipped');
  });

  it('removes, re-pots, recolours and names', () => {
    let g = garden();
    const pansy = onSill(g, 'sill-2');
    g = applyAction(g, act('pot', { plant: pansy.id, pot: 'teacup' })).garden;
    g = applyAction(g, act('variety', { plant: pansy.id, variety: 'velvet' })).garden;
    g = applyAction(g, act('name', { plant: pansy.id, name: '  Bratuś  ' })).garden;
    expect(find(g, pansy.id)).toMatchObject({ pot: 'teacup', variety: 'velvet', name: 'Bratuś' });
    expect(applyAction(g, act('variety', { plant: onSill(g, 'sill-1').id, variety: 'velvet' }, 'v2')).outcome.reason).toMatch(/Only bratki/);
    g = applyAction(g, act('remove', { plant: pansy.id })).garden;
    expect(find(g, pansy.id)).toBeUndefined();
  });

  it('moves along the shelves and in and out of the window', () => {
    let g = garden();
    const lavender = g.plants.find((p) => p.species === 'lavender')!;
    const tulip = onSill(g, 'sill-1');
    g = applyAction(g, act('move', { plant: lavender.id, slot: 'row3-d' })).garden;
    expect(find(g, lavender.id)!.slot).toBe('row3-d');
    g = applyAction(g, act('window', { plant: lavender.id, spot: 'sill-1' })).garden;
    expect(find(g, lavender.id)!.display).toBe('sill-1');
    expect(find(g, tulip.id)!.display).toBeNull();
    g = applyAction(g, act('window', { plant: lavender.id, spot: null }, 'w2')).garden;
    expect(find(g, lavender.id)!.display).toBeNull();
  });

  it('trims a vine, with the snip shown on screen', () => {
    const g = garden();
    const pansy = onSill(g, 'sill-2');
    const grown = applyAction(g, overgrow(pansy.id, 'o1', { by: 0.5 })).garden;
    const out = applyAction(grown, act('trim', { plant: pansy.id }));
    expect(find(out.garden, pansy.id)!.vine!.length).toBeCloseTo(0.35);
    expect(out.effect).toEqual({ kind: 'trim', plant: pansy.id });
    expect(applyAction(g, act('trim', { plant: pansy.id })).outcome.reason).toMatch(/no vine/);
  });
});

describe('settings', () => {
  it('changes the room, the weather and the rest', () => {
    const g = garden();
    const out = applyAction(g, act('settings', { patch: { theme: 'witchy', weatherMode: 'manual', manual: { sky: 'rain', night: true } } }));
    expect(out.outcome.status).toBe('applied');
    expect(out.garden.settings).toMatchObject({ theme: 'witchy', weatherMode: 'manual', manual: { sky: 'rain', night: true } });
  });

  it('can send the letter again', () => {
    const g = { ...garden(), settings: { ...garden().settings, letter: 'kept' as const } };
    expect(applyAction(g, act('settings', { patch: { letter: 'unread' } })).garden.settings.letter).toBe('unread');
  });

  it('leaves her private settings alone', () => {
    const out = applyAction(garden(), act('settings', { patch: { shareNotes: true } }));
    expect(out.outcome.reason).toMatch(/Only she can change shareNotes/);
    expect(out.garden.settings.shareNotes).toBe(false);
    expect(applyAction(garden(), act('settings', { patch: { location: { lat: 1, lon: 2 } } })).outcome.status).toBe('skipped');
  });

  it('refuses values the garden cannot show, and settings it does not have', () => {
    expect(applyAction(garden(), act('settings', { patch: { theme: 'disco' } })).outcome.reason).toMatch(/theme/);
    expect(applyAction(garden(), act('settings', { patch: { gravity: 0 } })).outcome.reason).toMatch(/Unknown settings: gravity/);
    expect(applyAction(garden(), act('settings', { patch: { theme: 'cozy' } })).outcome.reason).toMatch(/already/);
  });
});

describe('designs and notes', () => {
  it('adds a bratek design she can then be given', () => {
    let g = garden();
    const pansy = onSill(g, 'sill-2');
    g = applyAction(g, act('design', { type: 'pansy', design: { id: 'moon', name: 'Moonlight', top: '#241326', low: '#b9a3e3', face: 'clear', faceColor: '#241326', edge: null } })).garden;
    expect(g.designs.pansies.map((d) => d.id)).toContain('moon');
    g = applyAction(g, act('variety', { plant: pansy.id, variety: 'd:moon' })).garden;
    expect(find(g, pansy.id)!.variety).toBe('d:moon');
  });

  it('adds a painted pot', () => {
    const g = applyAction(garden(), act('design', { type: 'pot', design: { shape: 'cauldron', body: '#2b2229', pattern: 'moons', patternColor: '#c9a45c', rim: '#2b2229' } })).garden;
    expect(g.designs.pots).toHaveLength(1);
    expect(g.designs.pots[0]).toMatchObject({ shape: 'cauldron', pattern: 'moons' });
  });

  it('writes beside a pressed flower', () => {
    const base = garden();
    const g = { ...base, pressed: [{ id: 'pr1', plantId: 'x', species: 'pansy' as const, at: NOW, variety: null, design: null, name: null, note: '' }] };
    expect(applyAction(g, act('note', { press: 'pr1', note: 'from me' })).garden.pressed[0]!.note).toBe('from me');
    expect(applyAction(g, act('note', { press: 'nope', note: 'x' })).outcome.status).toBe('skipped');
    const hers = { ...g, pressed: [{ ...g.pressed[0]!, note: 'her words' }] };
    const out = applyAction(hers, act('note', { press: 'pr1', note: 'mine' }));
    expect(out.outcome.reason).toMatch(/already written/);
    expect(out.garden.pressed[0]!.note).toBe('her words');
  });
});

describe('moments', () => {
  const day = { night: false, sky: 'clear' as const, season: 'autumn' as const };
  const night = { ...day, night: true };

  it('shows a moment for a while, as an effect, without changing the garden', () => {
    const g = garden();
    const out = apply(g, act('moment', { moment: 'rainbow', minutes: 10 }), NOW, day);
    expect(out.outcome.status).toBe('applied');
    expect(out.effect).toEqual({ kind: 'moment', moment: 'rainbow', until: NOW + 10 * 60_000 });
    expect(out.garden.plants).toBe(g.plants);
  });

  it('lasts half an hour unless told otherwise, and never more than four hours', () => {
    expect(apply(garden(), act('moment', { moment: 'deer' }), NOW, day).effect).toMatchObject({ until: NOW + 30 * 60_000 });
    expect(apply(garden(), act('moment', { moment: 'deer', minutes: 9999 }), NOW, day).effect).toMatchObject({ until: NOW + 240 * 60_000 });
  });

  it('skips what her window cannot show right now, saying why', () => {
    expect(apply(garden(), act('moment', { moment: 'aurora' }), NOW, day).outcome.reason).toMatch(/clear night/);
    expect(apply(garden(), act('moment', { moment: 'aurora' }), NOW, night).outcome.status).toBe('applied');
    expect(apply(garden(), act('moment', { moment: 'rainbow' }), NOW, { ...day, sky: 'rain' }).outcome.reason).toMatch(/no rain/);
    expect(apply(garden(), act('moment', { moment: 'skater' }), NOW, day).outcome.reason).toMatch(/winter/);
    expect(apply(garden(), act('moment', { moment: 'ducks' }), NOW, night).outcome.reason).toMatch(/at night/);
    expect(apply(garden(), act('moment', { moment: 'unicorn' }), NOW, day).outcome.status).toBe('skipped');
  });
});

describe('withMoments', () => {
  it('adds the moments that can be seen, and only those', () => {
    const none = { ducks: false, heron: false, deer: false, robin: false, skater: false, butterflies: false };
    const o = { visitors: none, fog: false, aurora: false, rainbow: false };
    const out = withMoments(o, ['rainbow', 'deer', 'skater', 'aurora'], 'autumn', false, 'clear');
    expect(out).toMatchObject({ rainbow: true, aurora: false, visitors: { deer: true, skater: false } });
    expect(withMoments(o, [], 'autumn', false, 'clear')).toBe(o);
  });
});
