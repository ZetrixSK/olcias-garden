import { testGarden } from './testGarden';
import { describe, expect, it } from 'vitest';
import { parseBouquet, stemOf, stemsLeft, STEMS_PER_PLANT, type Bouquet } from './bouquets';
import { addDrawing, addPlant, bouquetAt, cutStems, freeShelfSlots, moveBouquet, movePlant, parseSave, postSeen, receiveBouquet, receivePost, rememberContact, removeBouquet, setTag, SLOT_IDS, unpackParcel, type GardenState } from './state';

const NOW = new Date(2026, 9, 31, 12).getTime();

const bouquet = (id: string, over: Partial<Bouquet> = {}): Bouquet => ({
  id, stems: [{ species: 'rose', variety: null, design: null }], vase: 'jug', ribbon: '#c95d7f', note: 'for you', from: null, at: NOW, seed: 7, ...over,
});

/** Every shelf place filled with plants, so nothing more fits. */
function fullShelves(): GardenState {
  let g = testGarden(NOW);
  for (const slot of SLOT_IDS) g = addPlant(g, slot, 'daisy', NOW, `fill-${slot}`);
  return g;
}

describe('bouquets on the shelves', () => {
  it('stand in the first free place, never in a hanging pot', () => {
    const g = receiveBouquet(testGarden(NOW), bouquet('b1'));
    expect(g.bouquets).toHaveLength(1);
    const slot = g.bouquets[0]!.slot;
    expect(slot.startsWith('hang')).toBe(false);
    expect(freeShelfSlots(g)).not.toContain(slot);
  });

  it('wait in a box on the floor when there is no room, and come out once there is', () => {
    let g = receiveBouquet(fullShelves(), bouquet('b1'));
    expect(g.bouquets).toHaveLength(0);
    expect(g.parcels.map((b) => b.id)).toEqual(['b1']);
    expect(unpackParcel(g, 'b1')).toBe(g);
    g = { ...g, plants: g.plants.filter((p) => p.slot !== 'row3-d') };
    g = unpackParcel(g, 'b1');
    expect(g.parcels).toHaveLength(0);
    expect(bouquetAt(g, 'row3-d')?.id).toBe('b1');
  });

  it('only ever arrive once', () => {
    const once = receiveBouquet(testGarden(NOW), bouquet('b1'));
    expect(receiveBouquet(once, bouquet('b1'))).toBe(once);
  });

  it('take up their place: nothing else is planted or hung there', () => {
    const g = receiveBouquet(testGarden(NOW), bouquet('b1'));
    const slot = g.bouquets[0]!.slot as (typeof SLOT_IDS)[number];
    expect(addPlant(g, slot, 'rose', NOW)).toBe(g);
    expect(addDrawing(g, { id: 'd', slot, img: 'x', w: 10, h: 10 })).toBe(g);
  });

  it('move and swap along the shelves, but never into a hanging pot', () => {
    let g = receiveBouquet(testGarden(NOW), bouquet('b1'));
    const from = g.bouquets[0]!.slot;
    const lavender = g.plants.find((p) => p.species === 'lavender')!;
    g = moveBouquet(g, 'b1', lavender.slot);
    expect(bouquetAt(g, lavender.slot)?.id).toBe('b1');
    expect(g.plants.find((p) => p.id === lavender.id)!.slot).toBe(from);
    expect(moveBouquet(g, 'b1', 'hang-l')).toBe(g);
    // a plant in a hanging pot can't swap down with a vase either
    const hanging = g.plants.find((p) => p.slot === 'hang-l')!;
    expect(movePlant(g, hanging.id, lavender.slot)).toBe(g);
  });

  it('can be put away', () => {
    const g = removeBouquet(receiveBouquet(testGarden(NOW), bouquet('b1')), 'b1');
    expect(g.bouquets).toHaveLength(0);
  });

  it('are kept with the save, and a damaged one is dropped', () => {
    const g = receiveBouquet(receiveBouquet(testGarden(NOW), bouquet('b1')), bouquet('b2', { from: 'josh' }));
    const raw = JSON.parse(JSON.stringify(g));
    raw.bouquets.push({ id: 'broken', stems: [], slot: 'row3-d' });
    const back = parseSave(raw, NOW)!;
    expect(back.bouquets.map((b) => b.id)).toEqual(['b1', 'b2']);
    expect(back.bouquets[1]!.from).toBe('josh');
    const old = JSON.parse(JSON.stringify(testGarden(NOW)));
    delete old.bouquets;
    expect(parseSave(old, NOW)!.bouquets).toEqual([]);
  });
});

describe('cutting stems', () => {
  it('only from plants in bloom, a few a day each', () => {
    let g = testGarden(NOW);
    const bloom = g.plants.find((p) => p.display === 'sill-2')!;
    const bud = g.plants.find((p) => p.display === 'sill-1')!;
    expect(stemsLeft(bud, g.cuttings, NOW)).toBe(0);
    expect(stemsLeft(bloom, g.cuttings, NOW)).toBe(STEMS_PER_PLANT);
    g = cutStems(g, [bloom.id, bloom.id], NOW);
    expect(stemsLeft(bloom, g.cuttings, NOW)).toBe(STEMS_PER_PLANT - 2);
    expect(stemsLeft(bloom, g.cuttings, NOW + 86_400_000)).toBe(STEMS_PER_PLANT);
  });

  it("copies a bratek's own design into the stem, so it travels with the bouquet", () => {
    const design = { id: 'moon', name: 'Moon', top: '#241326', low: '#b9a3e3', face: 'clear' as const, faceColor: '#241326', edge: null };
    const stem = stemOf({ species: 'pansy', variety: 'd:moon' }, { pansies: [design], pots: [] });
    expect(stem).toEqual({ species: 'pansy', variety: null, design });
  });
});

describe('parseBouquet', () => {
  it('makes whatever arrives safe', () => {
    const b = parseBouquet({
      id: 'x', stems: [{ species: 'rose' }, { species: 'cactus' }, { species: 'pansy', variety: 'nope' }], vase: 'bucket', ribbon: 'red',
      note: 'n'.repeat(500), from: 'NOT A TAG', seed: -3.7,
    })!;
    expect(b.stems.map((s) => s.species)).toEqual(['rose', 'pansy']);
    expect(b.stems[1]!.variety).toBeNull();
    expect(b).toMatchObject({ vase: 'jar', ribbon: null, from: null, seed: 3 });
    expect(b.note).toHaveLength(140);
    expect(parseBouquet({ id: 'y', stems: [] })).toBeNull();
    expect(parseBouquet({ id: 'z', stems: Array.from({ length: 20 }, () => ({ species: 'daisy' })) })!.stems).toHaveLength(7);
  });
});

describe('her post box', () => {
  it('remembers who she sent to, most recent first, a few at most', () => {
    let g = testGarden(NOW);
    for (const t of ['josh', '#Mama', 'josh', 'bad tag!']) g = rememberContact(g, t);
    expect(g.post.contacts).toEqual(['josh', 'mama']);
    for (let i = 0; i < 12; i++) g = rememberContact(g, `friend_${i}`);
    expect(g.post.contacts).toHaveLength(8);
    expect(g.post.contacts[0]).toBe('friend_11');
  });

  it('keeps her tag with the save, and drops one that is not a tag', () => {
    const g = setTag(testGarden(NOW), 'olcia');
    expect(parseSave(JSON.parse(JSON.stringify(g)), NOW)!.post.tag).toBe('olcia');
    const raw = JSON.parse(JSON.stringify(g));
    raw.post = { tag: 'NO WAY', contacts: ['ok_tag', 7, 'x'], unread: -3 };
    expect(parseSave(raw, NOW)!.post).toEqual({ tag: null, contacts: ['ok_tag'], unread: 0 });
  });
});

describe('the letterbox flag', () => {
  it('goes up when a bouquet comes in the post, and down once she has looked', () => {
    let g = receivePost(testGarden(NOW), bouquet('m1', { from: 'josh' }));
    g = receivePost(g, bouquet('m2', { from: 'mama' }));
    expect(g.post.unread).toBe(2);
    // the same post twice counts once
    expect(receivePost(g, bouquet('m1', { from: 'josh' })).post.unread).toBe(2);
    expect(postSeen(g).post.unread).toBe(0);
    // her own bouquets don't raise it
    expect(receiveBouquet(testGarden(NOW), bouquet('own')).post.unread).toBe(0);
  });
});
