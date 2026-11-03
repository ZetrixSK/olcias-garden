import { describe, expect, it } from 'vitest';
import { keepPackages, MAX_ITEMS, MAX_PACKAGES, packagePayload, parsePackage, type Package } from './packages';
import { addSeeds, giveAway, openPackage, packageItems, parseSave, receiveBouquet, receivePackage, savePansyDesign, secretDesigns, sowSeed, SLOT_IDS, starterGarden } from './state';
import { plantedAtForStage } from './growth';
import { designRef } from './designs';

const NOW = new Date(2026, 10, 3, 12).getTime();
const moon = { id: 'moon', name: 'Moonlight', top: '#241326', low: '#b9a3e3', face: 'clear' as const, faceColor: '#241326', edge: null };
const bouquet = { stems: [{ species: 'rose', variety: null, design: null }, { species: 'daisy', variety: null, design: null }], vase: 'jug', ribbon: '#c95d7f', note: 'for you', seed: 7 };

/** As it arrives from the post: the payload, with the mail's id, sender and time added. */
const arrived = (payload: unknown, from: string | null = 'daniel') => parsePackage({ ...(payload as object), id: 'mail-1', from, at: NOW });

describe('a package in the post', () => {
  it('carries a letter, bouquets and seeds, and is read back the same', () => {
    const p = arrived({ letter: 'hi', anonymous: false, items: [{ kind: 'bouquet', bouquet }, { kind: 'seeds', design: moon, count: 2 }] })!;
    expect(p.from).toBe('daniel');
    expect(p.letter).toBe('hi');
    expect(p.items.map((i) => i.kind)).toEqual(['bouquet', 'seeds']);
    expect(p.items[0]).toMatchObject({ kind: 'bouquet', bouquet: { id: 'mail-1:0', from: 'daniel', note: 'for you' } });
    expect(p.opened).toBeNull();
    expect(parsePackage(JSON.parse(JSON.stringify(p)))).toEqual(p);
  });

  it('can carry mystery seeds, and seeds are plain ones unless they say so', () => {
    const p = arrived({ letter: 'guess', items: [{ kind: 'seeds', design: moon, count: 2, mystery: true }, { kind: 'seeds', design: moon, count: 1, mystery: 'yes' }] })!;
    expect(p.items.map((i) => i.kind === 'seeds' && i.mystery)).toEqual([true, false]);
  });

  it('reads only what it can: no more than six things, nothing broken, nothing empty', () => {
    const many = Array.from({ length: 10 }, () => ({ kind: 'bouquet', bouquet }));
    expect(arrived({ items: many })!.items).toHaveLength(MAX_ITEMS);
    const odd = arrived({ letter: '', items: [{ kind: 'bomb' }, { kind: 'seeds', design: { nope: 1 }, count: 3 }, { kind: 'seeds', design: moon, count: 0 }, { kind: 'bouquet', bouquet: { stems: [] } }] });
    expect(odd).toBeNull();
    expect(arrived({ letter: 'just a letter', items: [] })!.items).toEqual([]);
    expect(arrived({ letter: 'x'.repeat(5000) })!.letter).toHaveLength(800);
    expect(arrived({ letter: 'x', items: [{ kind: 'seeds', design: moon, count: 99 }] })!.items[0]).toMatchObject({ count: 6 });
  });

  it('travels without anything only the sender has', () => {
    const p = arrived({ letter: 'hi', items: [{ kind: 'bouquet', bouquet }] })!;
    const wire = packagePayload('hi', p.items) as { items: Array<{ bouquet: Record<string, unknown> }> };
    expect(wire.items[0]!.bouquet).not.toHaveProperty('id');
    expect(wire.items[0]!.bouquet).not.toHaveProperty('from');
  });
});

describe('receiving and opening a package', () => {
  const pkg = arrived({ letter: 'hi', items: [{ kind: 'bouquet', bouquet }, { kind: 'seeds', design: moon, count: 3 }] })!;

  it('waits wrapped, once, with the letterbox flag up', () => {
    let g = receivePackage(starterGarden(NOW), pkg);
    expect(g.packages).toHaveLength(1);
    expect(g.post.unread).toBe(1);
    expect(receivePackage(g, pkg)).toBe(g);
    g = parseSave(JSON.parse(JSON.stringify(g)), NOW)!;
    expect(g.packages[0]!.opened).toBeNull();
  });

  it('when opened, puts the bouquet on a shelf and the seeds in her tin, with their design', () => {
    const g = openPackage(receivePackage(starterGarden(NOW), pkg), 'mail-1', NOW + 1000);
    expect(g.bouquets.some((b) => b.id === 'mail-1:0')).toBe(true);
    expect(g.designs.pansies.some((d) => d.name === 'Moonlight')).toBe(true);
    expect(g.seeds).toHaveLength(1);
    expect(g.seeds[0]!.count).toBe(3);
    expect(g.packages[0]!.opened).toBe(NOW + 1000);
    // opening again does nothing more
    expect(openPackage(g, 'mail-1', NOW + 2000)).toBe(g);
    // the seeds' design survives a save, so the seeds do too
    expect(parseSave(JSON.parse(JSON.stringify(g)), NOW + 3000)!.seeds).toHaveLength(1);
  });

  it('reuses her own design when the seeds look just like it', () => {
    const mine = savePansyDesign(starterGarden(NOW), { ...moon, id: 'mine', name: 'Mine' });
    const g = openPackage(receivePackage(mine, pkg), 'mail-1', NOW);
    expect(g.designs.pansies).toHaveLength(1);
    expect(g.seeds[0]!.variety).toBe(designRef('mine'));
  });

  it('puts the bouquet in the box on the floor when the shelves are full', () => {
    let g = starterGarden(NOW);
    for (let i = 0; i < 20; i++) g = receiveBouquet(g, { id: `b${i}`, stems: [{ species: 'rose', variety: null, design: null }], vase: 'jar', ribbon: null, note: '', from: null, at: NOW, seed: i });
    const before = g.parcels.length;
    g = openPackage(receivePackage(g, pkg), 'mail-1', NOW);
    expect(g.parcels.length).toBe(before + 1);
  });
});

describe('sending a package', () => {
  it('takes what was sent out of her garden: the bouquet, and the seeds from the packet', () => {
    let g = savePansyDesign(starterGarden(NOW), moon);
    g = addSeeds(g, designRef('moon'), 4, NOW, 'k1');
    g = receiveBouquet(g, { id: 'mine', stems: [{ species: 'rose', variety: null, design: null }], vase: 'jar', ribbon: null, note: '', from: null, at: NOW, seed: 1 });
    const picked = [{ bouquetId: 'mine' }, { packetId: 'k1', count: 3 }];
    const items = packageItems(g, picked);
    expect(items.map((i) => i.kind)).toEqual(['bouquet', 'seeds']);
    expect(items[1]).toMatchObject({ kind: 'seeds', count: 3, design: { name: 'Moonlight' } });
    const after = giveAway(g, picked);
    expect(after.bouquets.some((b) => b.id === 'mine')).toBe(false);
    expect(after.seeds[0]!.count).toBe(1);
    expect(giveAway(after, [{ packetId: 'k1', count: 1 }]).seeds).toEqual([]);
  });
});

describe('mystery seeds', () => {
  it('stay a plain packet in her tin, and a mystery when she passes them on', () => {
    const pkg = arrived({ items: [{ kind: 'seeds', design: moon, count: 2, mystery: true }] })!;
    let g = openPackage(receivePackage(starterGarden(NOW), pkg), 'mail-1', NOW);
    expect(g.seeds[0]!.mystery).toBe(true);
    g = parseSave(JSON.parse(JSON.stringify(g)), NOW)!;
    expect(g.seeds[0]!.mystery).toBe(true);
    expect(packageItems(g, [{ packetId: g.seeds[0]!.id, count: 1 }])[0]).toMatchObject({ mystery: true });
  });

  it('keep their design out of her lists until the flower they grow into blooms', () => {
    const pkg = arrived({ items: [{ kind: 'seeds', design: moon, count: 1, mystery: true }] })!;
    let g = openPackage(receivePackage(starterGarden(NOW), pkg), 'mail-1', NOW);
    const ref = g.seeds[0]!.variety;
    expect(secretDesigns(g, NOW).has(ref)).toBe(true);
    const slot = SLOT_IDS.find((sl) => !g.plants.some((p) => p.slot === sl))!;
    g = sowSeed(g, g.seeds[0]!.id, slot, NOW, 'sown');
    expect(g.seeds).toEqual([]);
    const plant = g.plants.find((p) => p.id === 'sown')!;
    expect(plant.mystery).toBe(true);
    expect(secretDesigns(g, NOW).has(ref)).toBe(true);
    expect(parseSave(JSON.parse(JSON.stringify(g)), NOW)!.plants.find((p) => p.id === 'sown')!.mystery).toBe(true);
    const bloomed = plantedAtForStage('pansy', 'bloom', NOW);
    g = { ...g, plants: g.plants.map((p) => (p.id === 'sown' ? { ...p, plantedAt: bloomed } : p)) };
    expect(secretDesigns(g, NOW).has(ref)).toBe(false);
  });

  it('are sent as a mystery only when she asks', () => {
    let g = savePansyDesign(starterGarden(NOW), moon);
    g = addSeeds(g, designRef('moon'), 4, NOW, 'k1');
    expect(g.seeds[0]).not.toHaveProperty('mystery');
    expect(packageItems(g, [{ packetId: 'k1', count: 1 }])[0]).toMatchObject({ mystery: false });
    const wire = packagePayload('', packageItems(g, [{ packetId: 'k1', count: 1 }], true)) as { items: Array<{ mystery: boolean }> };
    expect(wire.items[0]!.mystery).toBe(true);
  });
});

describe('the packages she keeps', () => {
  it('drop the oldest opened ones first, never one still wrapped', () => {
    const p = (i: number, opened: number | null): Package => ({ id: `p${i}`, from: null, letter: 'x', items: [], at: i, opened });
    const list = [p(0, null), ...Array.from({ length: MAX_PACKAGES + 5 }, (_, i) => p(i + 1, 5))];
    const kept = keepPackages(list);
    expect(kept).toHaveLength(MAX_PACKAGES);
    expect(kept.some((x) => x.id === 'p0')).toBe(true);
  });
});
