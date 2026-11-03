import { describe, expect, it } from 'vitest';
import {
  arrive,
  birthdayGifts,
  giveBouquet,
  hexColours,
  makeRequest,
  noVisitors,
  notNow,
  parseVisitors,
  petals,
  REQUEST_WAITS,
  stemColours,
  visitorWeight,
  whoHasSeeds,
  type Moment,
  type Request,
  type Visitors,
} from './visitors';
import { parseBouquet, type Bouquet, type Stem } from './bouquets';
import { giveToVisitor, knock, parseSave, starterGarden } from './state';

const NOW = new Date(2026, 10, 3, 12).getTime();
const HOUR = 3_600_000;
const noon: Moment = { hour: 12, weekday: 2, month: 10, night: false, sky: 'clear', halloween: false };
const midnight: Moment = { ...noon, hour: 0, night: true };
/** A dice that always rolls the same. */
const always = (x: number) => () => x;
const stem = (species: Stem['species'], variety: string | null = null): Stem => ({ species, variety, design: null });
const bouquet = (stems: Stem[], more: Partial<Bouquet> = {}): Bouquet => ({ id: 'b1', stems, vase: 'jar', ribbon: null, note: '', from: null, at: NOW, seed: 1, ...more });

describe('who comes, and when', () => {
  it('only the ghost by night, never the bumblebee', () => {
    expect(visitorWeight('duszek', midnight)).toBeGreaterThan(0);
    expect(visitorWeight('jingleton', midnight)).toBe(0);
    expect(visitorWeight('duszek', noon)).toBe(0);
    expect(visitorWeight('jingleton', noon)).toBeGreaterThan(0);
  });

  it('the frog likes the rain best, the postman has Sundays off', () => {
    expect(visitorWeight('rechotka', { ...noon, sky: 'rain' })).toBeGreaterThan(visitorWeight('rechotka', { ...noon, sky: 'cloudy' }));
    expect(visitorWeight('listonosz', { ...noon, weekday: 0 })).toBe(0);
    expect(visitorWeight('listonosz', noon)).toBeGreaterThan(0);
  });

  it('nobody knocks before it is time, or while someone is already waiting', () => {
    const v = noVisitors(NOW);
    expect(arrive(v, NOW, noon, always(0.3), 'r1')).toBe(v);
    const later = arrive(v, NOW + HOUR, noon, always(0.3), 'r1');
    expect(later.request).not.toBeNull();
    expect(later.request!.seen).toBe(false);
    expect(arrive(later, NOW + 2 * HOUR, noon, always(0.3), 'r2')).toBe(later);
  });

  it('a request left too long is let go quietly, and the same one does not come straight back', () => {
    const waiting = arrive(noVisitors(NOW), NOW + HOUR, noon, always(0.1), 'r1');
    const who = waiting.request!.visitor;
    const gone = arrive(waiting, NOW + HOUR + REQUEST_WAITS + 1, noon, always(0.1), 'r2');
    expect(gone.request).toBeNull();
    expect(gone.last).toBe(who);
    const next = arrive(gone, gone.nextAt, noon, always(0.1), 'r3');
    expect(next.request?.visitor).not.toBe(who);
  });

  it('"not now" sends them off kindly, and someone comes again later', () => {
    const waiting = arrive(noVisitors(NOW), NOW + HOUR, noon, always(0.5), 'r1');
    const after = notNow(waiting, NOW + 2 * HOUR, always(0.5));
    expect(after.request).toBeNull();
    expect(after.nextAt).toBeGreaterThan(NOW + 2 * HOUR + 5 * HOUR);
  });

  it('nobody comes on her birthday', () => {
    const v = { ...noVisitors(NOW), nextAt: 0 };
    expect(arrive(v, new Date(2027, 0, 1, 12).getTime(), noon, always(0.5), 'r').request).toBeNull();
  });
});

describe('what they ask for', () => {
  it('only colours she can grow, unless she has none of them', () => {
    const v = noVisitors(NOW);
    for (let i = 0; i < 20; i++) {
      const r = makeRequest('listonosz', { ...v, friends: { listonosz: { visits: 1, hearts: 1, gifts: 1, fav: false, first: NOW, bouquets: [] } } }, NOW, always(i / 20), 'r');
      for (const w of r.wishes) if (w.kind === 'colour') expect(w.colour).not.toBe('red');
    }
    const red = { id: 'red', name: 'Red', top: '#c9473f', low: '#c9473f', face: 'clear' as const, faceColor: '#000000', edge: null };
    const asks = Array.from({ length: 20 }, (_, i) => makeRequest('listonosz', { ...v, friends: { listonosz: { visits: 1, hearts: 1, gifts: 1, fav: false, first: NOW, bouquets: [] } } }, NOW, always(i / 20), 'r', [red]));
    expect(asks.some((r) => r.wishes.some((w) => w.kind === 'colour' && w.colour === 'red'))).toBe(true);
  });

  it('only flowers she can grow, and something simple the first time', () => {
    const v = noVisitors(NOW);
    for (let i = 0; i < 20; i++) {
      const r = makeRequest('wiedzmusia', v, NOW, always(i / 20), `r${i}`);
      expect(r.wishes.length).toBe(1);
      for (const w of r.wishes) if (w.kind === 'species') expect(v.unlocked).toContain(w.species);
    }
    const known: Visitors = { ...v, friends: { wiedzmusia: { visits: 2, hearts: 2, gifts: 1, fav: false, first: NOW, bouquets: [] } } };
    expect(Math.max(...Array.from({ length: 20 }, (_, i) => makeRequest('wiedzmusia', known, NOW, always(i / 20), 'x').wishes.length))).toBeGreaterThan(1);
  });
});

describe('colours', () => {
  it('reads painted swatches the way you would name them', () => {
    expect(hexColours('#f3a6c0')).toContain('pink');
    expect(hexColours('#1c1420')).toContain('dark');
    expect(hexColours('#e9b43c')).toContain('yellow');
    expect(hexColours('#f4f4fb')).toContain('white');
    expect(hexColours('#7a5ac0')).toContain('purple');
    expect(hexColours('#4a7ac8')).toContain('blue');
    expect(hexColours('#c9473f')).toContain('red');
  });

  it('knows the colours of each flower and bratek', () => {
    expect(stemColours(stem('lavender'))).toEqual(['purple']);
    expect(stemColours(stem('pansy', 'rosy'))).toEqual(['pink']);
    expect(stemColours({ species: 'pansy', variety: null, design: { id: 'd', name: '', top: '#e9b43c', low: '#e9b43c', face: 'clear', faceColor: '#000000', edge: null } })).toContain('yellow');
  });
});

describe('petals', () => {
  const request = (visitor: Request['visitor'], wishes: Request['wishes']): Request => ({ id: 'r', visitor, wishes, at: NOW, text: 0, seen: true });

  it('four for everything asked, five with their favourite, never fewer than one', () => {
    const r = request('atrament', [{ kind: 'colour', colour: 'purple', min: 2 }]);
    expect(petals(r, { ...bouquet([stem('lavender'), stem('lavender')]), night: false }).petals).toBe(4);
    expect(petals(r, { ...bouquet([stem('lavender'), stem('lavender')], { ribbon: '#2b2229' }), night: false }).petals).toBe(5);
    expect(petals(r, { ...bouquet([stem('tulip')]), night: false }).petals).toBe(1);
    expect(petals(r, { ...bouquet([stem('lavender'), stem('tulip')]), night: false }).petals).toBe(3);
  });

  it('counts a bouquet that is too big as a little off, not wrong', () => {
    const r = request('listonosz', [{ kind: 'size', min: 3, max: 3 }]);
    const four = petals(r, { ...bouquet([stem('tulip'), stem('tulip'), stem('tulip'), stem('tulip')]), night: false });
    expect(four.petals).toBeGreaterThanOrEqual(3);
  });
});

describe('thanks and gifts', () => {
  const waiting = (visitor: Request['visitor']): Visitors => ({
    ...noVisitors(NOW),
    request: { id: 'r', visitor, wishes: [{ kind: 'colour', colour: 'purple', min: 1 }], at: NOW, text: 0, seen: true },
  });

  it('a good bouquet brings their first gift: seeds of a flower she could not grow', () => {
    const r = giveBouquet(waiting('wiedzmusia'), bouquet([stem('lavender')]), false, NOW, always(0.5))!;
    expect(r.thanks.gift).toEqual({ kind: 'species', species: 'batflower' });
    expect(r.visitors.unlocked).toContain('batflower');
    expect(r.visitors.request).toBeNull();
    expect(r.visitors.friends.wiedzmusia).toMatchObject({ visits: 1, hearts: 1, gifts: 1 });
  });

  it('a bouquet far off still earns a heart, but no gift', () => {
    const r = giveBouquet(waiting('wiedzmusia'), bouquet([stem('tulip')]), false, NOW, always(0.5))!;
    expect(r.thanks.petals).toBeLessThan(3);
    expect(r.thanks.gift).toBeNull();
    expect(r.visitors.friends.wiedzmusia!.hearts).toBe(1);
  });

  it('skips a flower she can already grow', () => {
    const v = { ...waiting('wiedzmusia'), unlocked: [...noVisitors(NOW).unlocked, 'batflower' as const] };
    const r = giveBouquet(v, bouquet([stem('lavender')]), false, NOW, always(0.5))!;
    expect(r.thanks.gift).toEqual({ kind: 'vase', vase: 'cauldron' });
    expect(r.visitors.vases).toEqual(['cauldron']);
  });

  it('each flower has someone who carries its seeds', () => {
    for (const s of ['snowdrop', 'cyclamen', 'hellebore', 'hollyhock', 'pumpkin', 'batflower', 'moonflower'] as const) expect(whoHasSeeds(s)).not.toBeNull();
  });

  it('in the garden: the stems are cut, and a bratek gift goes into her tin', () => {
    let g = starterGarden(NOW);
    const friend = { visits: 3, hearts: 3, gifts: 1, fav: false, first: NOW, bouquets: [] };
    g = { ...g, visitors: { ...waiting('jadzia'), friends: { jadzia: friend } } };
    g = { ...g, visitors: { ...g.visitors, request: { ...g.visitors.request!, wishes: [{ kind: 'colour', colour: 'pink', min: 1 }] } } };
    const r = giveToVisitor(g, bouquet([stem('rose')]), ['p1'], false, NOW)!;
    expect(r.thanks.gift?.kind).toBe('design');
    expect(r.garden.designs.pansies.some((d) => d.id === 'visitor-jadzia')).toBe(true);
    expect(r.garden.seeds[0]).toMatchObject({ variety: 'd:visitor-jadzia', count: 3 });
    expect(r.garden.cuttings).toEqual([{ plant: 'p1', at: NOW }]);
  });

  it('on her birthday, the ones she knows leave gifts, once a year', () => {
    const bday = new Date(2027, 0, 1, 10).getTime();
    const v: Visitors = { ...noVisitors(NOW), friends: { duszek: { visits: 1, hearts: 1, gifts: 0, fav: false, first: NOW, bouquets: [] } } };
    const first = birthdayGifts(v, bday);
    expect(first.gifts).toEqual([{ visitor: 'duszek', gift: { kind: 'species', species: 'moonflower' } }]);
    expect(birthdayGifts(first.visitors, bday + HOUR).gifts).toEqual([]);
  });
});

describe('saving', () => {
  it('a garden from before visitors keeps every flower she had planted', () => {
    const g = starterGarden(NOW);
    const raw = JSON.parse(JSON.stringify({ ...g, plants: [...g.plants, { ...g.plants[0]!, id: 'x', slot: 'row3-a', species: 'batflower' }] }));
    delete raw.visitors;
    const back = parseSave(raw, NOW)!;
    expect(back.visitors.unlocked).toContain('batflower');
    expect(back.visitors.unlocked).toContain('pansy');
    expect(back.visitors.request).toBeNull();
  });

  it('reads back what it wrote, and nothing it did not', () => {
    let g = knock(starterGarden(NOW), NOW + HOUR, { sky: 'clear', night: false }, false, always(0.4));
    expect(g.visitors.request).not.toBeNull();
    g = parseSave(JSON.parse(JSON.stringify(g)), NOW + HOUR)!;
    expect(g.visitors.request).not.toBeNull();
    const odd = parseVisitors({ unlocked: ['nope', 'moonflower'], ribbons: ['#123456', '#e2ad3f'], vases: ['jar', 'can', 'bin'], request: { id: 'x', visitor: 'nobody' } }, [], NOW, parseBouquet);
    expect(odd.unlocked).toContain('moonflower');
    expect(odd.ribbons).toEqual(['#e2ad3f']);
    expect(odd.vases).toEqual(['can']);
    expect(odd.request).toBeNull();
  });
});
