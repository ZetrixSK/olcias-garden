import { describe, expect, it } from 'vitest';
import { calledFor, noteWeather, parseTrait, rollTraits, SAW, TRAIT_SPEED, type Trait } from './traits';
import { growthHours, plantedAtForStage, stageAt } from './growth';
import { addSeeds, catchUpNights, parseSave, savePansyDesign, sowSeed, starterGarden, type Plant } from './state';
import { nightsBetween } from './vines';
import { designRef } from './designs';
import { dayKey } from './diary';
import { moonPhase } from '../weather/moon';
import { applyAction } from '../remote/actions';

const H = 3_600_000;
const DAY = 24 * H;
/** A 3:00 night check on a given date. */
const night = (y: number, m: number, d: number) => new Date(y, m, d, 3).getTime();
const garden = () => Array.from({ length: 40 }, (_, i) => ({ id: `p${i}`, trait: null as Trait | null }));

describe('traits a night can leave', () => {
  it('answer to the day before: rain, sun, grey, winter, and a full moon', () => {
    const n = night(2026, 5, 10);
    const day = dayKey(new Date(n - 6 * H));
    expect(calledFor(n, { [day]: SAW.rain })).toContain('dewy');
    expect(calledFor(n, { [day]: SAW.clear })).toContain('sunkissed');
    expect(calledFor(n, { [day]: SAW.grey })).toContain('willowy');
    expect(calledFor(n, {})).not.toContain('frosted');
    expect(calledFor(night(2026, 11, 20), {})).toContain('frosted');
    // the first full moon after 1 June 2026
    let t = night(2026, 5, 1);
    while (Math.abs(moonPhase(t) - 0.5) >= 0.035) t += DAY;
    expect(calledFor(t, {})).toContain('enchanted');
    expect(calledFor(t + 5 * DAY, {})).not.toContain('enchanted');
  });

  it('come rarely, always the same for the same nights, never twice, never to a seed', () => {
    const nights = Array.from({ length: 30 }, (_, i) => night(2026, 5, 1 + i));
    const seen: Record<string, number> = {};
    for (const n of nights) seen[dayKey(new Date(n - 6 * H))] = SAW.rain;
    const a = rollTraits(garden(), nights, seen, () => true);
    const b = rollTraits(garden(), nights, seen, () => true);
    expect(a).toEqual(b);
    const got = a.filter((p) => p.trait);
    // 40 plants over 30 rainy nights at a few percent a night: most, not all
    expect(got.length).toBeGreaterThan(10);
    expect(got.length).toBeLessThan(40);
    expect(got.every((p) => p.trait!.kind !== 'enchanted' || Math.abs(moonPhase(p.trait!.at) - 0.5) < 0.035)).toBe(true);
    // a plant keeps the trait it has
    const again = rollTraits(a, nights.map((n) => n + 40 * DAY), seen, () => true);
    for (const p of got) expect(again.find((x) => x.id === p.id)!.trait).toEqual(p.trait);
    // seeds are left alone
    expect(rollTraits(garden(), nights, seen, () => false).every((p) => !p.trait)).toBe(true);
  });

  it('almost never come on an ordinary night, and are never enchanted then', () => {
    const nights = Array.from({ length: 60 }, (_, i) => night(2026, 3, 1) + i * DAY).filter((n) => Math.abs(moonPhase(n) - 0.5) >= 0.035);
    const got = rollTraits(garden(), nights, {}, () => true).filter((p) => p.trait);
    expect(got.length).toBeLessThan(25);
    expect(got.some((p) => p.trait!.kind === 'enchanted')).toBe(false);
  });

  it('are read back carefully', () => {
    expect(parseTrait({ kind: 'dewy', at: 5 })).toEqual({ kind: 'dewy', at: 5 });
    expect(parseTrait({ kind: 'cursed', at: 5 })).toBeNull();
    expect(parseTrait({ kind: 'dewy' })).toBeNull();
    expect(parseTrait('dewy')).toBeNull();
  });
});

describe('the weather the garden remembers', () => {
  it('notes rain, a clear day and a grey day, not a clear night, and only the last two weeks', () => {
    const t = new Date(2026, 5, 10, 14).getTime();
    let seen = noteWeather({}, t, { sky: 'rain', night: false });
    seen = noteWeather(seen, t + H, { sky: 'clear', night: false });
    expect(seen[dayKey(new Date(t))]).toBe(SAW.rain | SAW.clear);
    expect(noteWeather(seen, t + H, { sky: 'clear', night: false })).toBe(seen);
    expect(noteWeather({}, new Date(2026, 5, 10, 23).getTime(), { sky: 'clear', night: true })).toEqual({});
    let many = {};
    for (let d = 0; d < 20; d++) many = noteWeather(many, t + d * DAY, { sky: 'cloudy', night: false });
    expect(Object.keys(many)).toHaveLength(14);
  });
});

describe('a trait that hurries growth', () => {
  it('counts only from the night it came', () => {
    const planted = new Date(2026, 5, 1, 12).getTime();
    const plant = { plantedAt: planted, waterings: [] as number[] };
    const came = planted + 10 * H;
    const later = planted + 30 * H;
    const sunny = { ...plant, trait: { kind: 'sunkissed' as const, at: came } };
    expect(growthHours(sunny, came)).toBeCloseTo(growthHours(plant, came));
    expect(growthHours(sunny, later)).toBeCloseTo(30 + (TRAIT_SPEED.sunkissed - 1) * 20);
    expect(growthHours({ ...plant, trait: { kind: 'frosted' as const, at: came } }, later)).toBeCloseTo(30);
  });
});

describe('the garden', () => {
  it('rolls each night only once, and keeps traits through a save', () => {
    const now = new Date(2026, 5, 20, 12).getTime();
    let g = starterGarden(now - 30 * DAY);
    g = { ...g, weatherSeen: {} };
    for (let d = 1; d <= 30; d++) g.weatherSeen[dayKey(new Date(now - d * DAY))] = SAW.rain | SAW.grey;
    const once = catchUpNights(g, now);
    expect(catchUpNights(once, now)).toBe(once);
    const back = parseSave(JSON.parse(JSON.stringify(once)), now)!;
    expect(back.plants.map((p) => p.trait)).toEqual(once.plants.map((p) => p.trait));
    expect(back.weatherSeen).toEqual(once.weatherSeen);
    expect(nightsBetween(once.vinesCheckedAt, now)).toEqual([]);
  });

  it('opens an older save with no traits, no weather noted and an empty seed tin', () => {
    const g = starterGarden(Date.now());
    const older = JSON.parse(JSON.stringify(g));
    delete older.weatherSeen;
    delete older.seeds;
    for (const p of older.plants) delete p.trait;
    const back = parseSave(older)!;
    expect(back.plants.every((p: Plant) => p.trait === null)).toBe(true);
    expect(back.weatherSeen).toEqual({});
    expect(back.seeds).toEqual([]);
  });
});

describe('the seed tin', () => {
  const now = new Date(2026, 5, 1, 12).getTime();
  const design = { id: 'moon', name: 'Moonlight', top: '#241326', low: '#b9a3e3', face: 'clear' as const, faceColor: '#241326', edge: null };
  const withDesign = () => savePansyDesign(starterGarden(now), design);

  it('holds packets of her designs, one seed sown at a time, the empty packet thrown away', () => {
    let g = addSeeds(withDesign(), designRef('moon'), 2, now, 'k1');
    expect(g.seeds).toEqual([{ id: 'k1', variety: 'd:moon', count: 2, made: now }]);
    g = sowSeed(g, 'k1', 'row3-a', now, 'n1');
    expect(g.plants.find((p) => p.id === 'n1')).toMatchObject({ species: 'pansy', variety: 'd:moon', slot: 'row3-a' });
    expect(g.seeds[0]!.count).toBe(1);
    g = sowSeed(g, 'k1', 'row3-b', now, 'n2');
    expect(g.seeds).toEqual([]);
    expect(stageAt('pansy', g.plants.find((p) => p.id === 'n2')!, now)).toBe('seed');
  });

  it('only sows into an empty place, and makes between one and six seeds', () => {
    let g = addSeeds(withDesign(), designRef('moon'), 99, now, 'k1');
    expect(g.seeds[0]!.count).toBe(6);
    const taken = g.plants[0]!.slot;
    expect(sowSeed(g, 'k1', taken, now)).toBe(g);
    g = addSeeds(withDesign(), designRef('moon'), 0, now, 'k2');
    expect(g.seeds[0]!.count).toBe(1);
  });

  it('forgets seeds of a design that has been thrown away', () => {
    const g = addSeeds(withDesign(), designRef('moon'), 3, now, 'k1');
    const saved = JSON.parse(JSON.stringify(g));
    saved.designs.pansies = [];
    expect(parseSave(saved, now)!.seeds).toEqual([]);
    expect(parseSave(JSON.parse(JSON.stringify(g)), now)!.seeds).toHaveLength(1);
  });
});

describe('a trait from the admin page', () => {
  it('can be given and taken away', () => {
    const now = new Date(2026, 5, 1, 12).getTime();
    const g = starterGarden(now);
    const id = g.plants.find((p) => p.plantedAt <= plantedAtForStage(p.species, 'seedling', now))!.id;
    const given = applyAction(g, { id: 'a1', kind: 'trait', payload: { plant: id, kind: 'enchanted' } }, now);
    expect(given.outcome.status).toBe('applied');
    expect(given.garden.plants.find((p) => p.id === id)!.trait).toEqual({ kind: 'enchanted', at: now });
    const taken = applyAction(given.garden, { id: 'a2', kind: 'trait', payload: { plant: id, kind: null } }, now);
    expect(taken.garden.plants.find((p) => p.id === id)!.trait).toBeNull();
    expect(applyAction(g, { id: 'a3', kind: 'trait', payload: { plant: id, kind: 'cursed' } }, now).outcome.status).toBe('skipped');
  });
});
