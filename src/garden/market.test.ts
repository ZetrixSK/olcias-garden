import { describe, expect, it } from 'vitest';
import {
  buySeed,
  buyTrinket,
  MAX_GARLAND,
  MILTON,
  nightMarketKey,
  noMarket,
  openDayStall,
  openNightStall,
  parseMarket,
  seedPool,
  START_PETALS,
  toggleCharm,
  TRINKETS,
  turnCard,
  type Market,
} from './market';
import { noVisitors } from './visitors';
import { buyFromNightStall, buyFromStall, freeShelfSlots, giveToVisitor, moveFigure, parseSave, starterGarden, visitDayStall } from './state';
import { designRef } from './designs';

const at = (y: number, mo: number, d: number, h: number) => new Date(y, mo, d, h).getTime();
// Friday 6 November 2026
const FRI = (h: number) => at(2026, 10, 6, h);
const v = noVisitors(0);

describe('when the night market is open', () => {
  it('from Friday dusk until dawn on Monday, only while it is dark', () => {
    expect(nightMarketKey(FRI(21), true)).toBe('2026-11-06');
    expect(nightMarketKey(at(2026, 10, 7, 2), true)).toBe('2026-11-06');
    expect(nightMarketKey(at(2026, 10, 8, 22), true)).toBe('2026-11-06');
    expect(nightMarketKey(at(2026, 10, 9, 4), true)).toBe('2026-11-06');
    expect(nightMarketKey(FRI(14), false)).toBeNull();
    expect(nightMarketKey(at(2026, 10, 5, 22), true)).toBeNull();
    expect(nightMarketKey(at(2026, 10, 9, 21), true)).toBeNull();
  });

  it('the admin page can open it any time, for a while', () => {
    expect(nightMarketKey(at(2026, 10, 4, 12), false, { nightUntil: at(2026, 10, 4, 18) })).not.toBeNull();
  });
});

describe('the day stall', () => {
  it('sets out four packets, the same all day, and something new the next', () => {
    const a = openDayStall(noMarket(), FRI(9), v, []);
    expect(a.day!.items).toHaveLength(4);
    expect(openDayStall(a, FRI(17), v, [])).toBe(a);
    const b = openDayStall(a, FRI(9) + 86_400_000, v, []);
    expect(b.day!.key).not.toBe(a.day!.key);
  });

  it('never sells a flower she can already plant', () => {
    const all = { ...v, unlocked: [...v.unlocked, 'moonflower' as const] };
    expect(seedPool(all, []).some((x) => x.kind === 'species' && x.species === 'moonflower')).toBe(false);
    expect(seedPool(v, []).some((x) => x.kind === 'species' && x.species === 'moonflower')).toBe(true);
  });

  it('takes petals, once, and only if she has enough', () => {
    const m = openDayStall({ ...noMarket(), petals: 100 }, FRI(9), v, []);
    const item = m.day!.items[0]!;
    const r = buySeed(m, item.id)!;
    expect(r.market.petals).toBeLessThan(100);
    expect(buySeed(r.market, item.id)).toBeNull();
    expect(buySeed({ ...m, petals: 0 }, item.id)).toBeNull();
  });

  it('in the garden: a flower is unlocked, a bratek goes in her tin with its design', () => {
    let g = starterGarden(FRI(9));
    g = { ...g, market: { ...g.market, petals: 200 }, visitors: { ...g.visitors, unlocked: ['pansy', 'tulip', 'rose', 'daisy', 'lavender'] } };
    g = visitDayStall(g, FRI(9));
    const species = { id: 'species:batflower', kind: 'species' as const, species: 'batflower' as const, rarity: 'rare' as const };
    const pansy = { id: 'pansy:market-piegi', kind: 'pansy' as const, design: { id: 'market-piegi', name: 'Piegusek', top: '#f2b8cb', low: '#fbe6ee', face: 'clear' as const, faceColor: '#8a2f55', edge: null, pattern: 'speckle' as const }, rarity: 'veryrare' as const };
    g = { ...g, market: { ...g.market, day: { ...g.market.day!, items: [species, pansy] } } };
    g = buyFromStall(g, species.id, FRI(10))!.garden;
    expect(g.visitors.unlocked).toContain('batflower');
    g = buyFromStall(g, pansy.id, FRI(10))!.garden;
    expect(g.designs.pansies.find((d) => d.id === 'market-piegi')?.pattern).toBe('speckle');
    expect(g.seeds.some((s) => s.variety === designRef('market-piegi'))).toBe(true);
    // the pattern survives a save
    expect(parseSave(JSON.parse(JSON.stringify(g)), FRI(11))!.designs.pansies.find((d) => d.id === 'market-piegi')?.pattern).toBe('speckle');
  });
});

describe('the night stall', () => {
  it('lays out four cards of things she has not got, and Milton the first time', () => {
    const m = openNightStall(noMarket(), '2026-11-06');
    expect(m.night!.cards).toHaveLength(5);
    expect(m.night!.cards[4]).toBe(MILTON);
    expect(openNightStall(m, '2026-11-06')).toBe(m);
    const owned: Market = { ...noMarket(), milton: true, owned: TRINKETS.slice(0, 20).map((t) => t.id) };
    const later = openNightStall(owned, '2026-11-13');
    expect(later.night!.cards).toHaveLength(4);
    for (const c of later.night!.cards) expect(owned.owned).not.toContain(c);
  });

  it('a card must be turned over before it can be bought; Milton is free', () => {
    let m = openNightStall({ ...noMarket(), petals: 0 }, '2026-11-06');
    expect(buyTrinket(m, MILTON, 'row2-b')).toBeNull();
    m = turnCard(m, 4);
    m = buyTrinket(m, MILTON, 'row2-b')!;
    expect(m.milton).toBe(true);
    // he lives in the dogs' bed, not on a shelf
    expect(m.figures).toEqual([]);
  });

  it('a charm goes on the string while there is room', () => {
    let m: Market = { ...noMarket(), owned: ['moon', 'key'] };
    m = toggleCharm(m, 'moon');
    expect(m.garland).toEqual(['moon']);
    m = toggleCharm(m, 'moon');
    expect(m.garland).toEqual([]);
    const full: Market = { ...noMarket(), owned: ['moon', 'key', 'star', 'cherries', 'mushroom', 'bat', 'padlock', 'pansy'], garland: ['moon', 'key', 'star', 'cherries', 'mushroom', 'bat', 'padlock'] };
    expect(toggleCharm(full, 'pansy').garland).toHaveLength(MAX_GARLAND);
  });

  it('in the garden: a figure stands on a free shelf, and moves like anything else there', () => {
    let g = starterGarden(FRI(21));
    g = { ...g, market: { ...g.market, petals: 50, night: { key: '2026-11-06', cards: ['snail'], turned: [true], bought: [] } } };
    const free = freeShelfSlots(g)[0]!;
    g = buyFromNightStall(g, 'snail')!;
    expect(g.market.figures[0]).toEqual({ id: 'snail', slot: free });
    expect(freeShelfSlots(g)).not.toContain(free);
    const other = freeShelfSlots(g)[0]!;
    g = moveFigure(g, 'snail', other);
    expect(g.market.figures[0]!.slot).toBe(other);
    expect(parseSave(JSON.parse(JSON.stringify(g)), FRI(22))!.market.figures[0]).toEqual({ id: 'snail', slot: other });
  });
});

describe('petals', () => {
  it('she starts with a few, and earns what visitors give', () => {
    let g = starterGarden(FRI(12));
    expect(g.market.petals).toBe(START_PETALS);
    g = { ...g, visitors: { ...g.visitors, request: { id: 'r', visitor: 'jadzia', wishes: [{ kind: 'colour', colour: 'pink', min: 1 }], at: FRI(12), text: 0, seen: true } } };
    const r = giveToVisitor(g, { id: 'b', stems: [{ species: 'rose', variety: null, design: null }], vase: 'jar', ribbon: null, note: '', from: null, at: FRI(12), seed: 1 }, [], false, FRI(12))!;
    expect(r.garden.market.petals).toBe(START_PETALS + r.thanks.petals);
  });

  it('a broken or missing market reads back as a fresh one', () => {
    expect(parseMarket(null, () => true)).toEqual(noMarket());
    const odd = parseMarket({ petals: -5, owned: ['moon', 'nope'], garland: ['moon', 'key'], figures: [{ id: 'snail', slot: 'row2-a' }], milton: 'yes' }, () => true);
    expect(odd.petals).toBe(0);
    expect(odd.owned).toEqual(['moon']);
    expect(odd.garland).toEqual(['moon']);
    expect(odd.figures).toEqual([]);
    expect(odd.milton).toBe(false);
  });
});
