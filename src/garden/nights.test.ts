import { describe, expect, it } from 'vitest';
import { catchUpNights, parseSave, placeInWindow, starterGarden, trimVine, type GardenState, type Plant, type WindowSpot } from './state';
import { lastNight, nightsBetween, qualifies, ROSE_CREEP, runNights, VINE_STEP } from './vines';
import type { SpeciesId } from './species';

/** Local times, so the tests mean the same thing in any time zone. */
const at = (day: number, hour: number) => new Date(2026, 9, day, hour).getTime();
const LONG_AGO = at(1, 12);

function plant(id: string, species: SpeciesId, display: WindowSpot | null, extra: Partial<Plant> = {}): Plant {
  return { id, species, slot: 'row3-a', pot: 'wide', variety: null, plantedAt: LONG_AGO, waterings: [], display, vine: null, ...extra };
}

/** Watered every afternoon from day `from` to day `to`. */
const daily = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => at(from + i, 15));

describe('3:00 nights', () => {
  it('finds every 3:00 between two moments', () => {
    expect(nightsBetween(at(10, 10), at(13, 8))).toEqual([at(11, 3), at(12, 3), at(13, 3)]);
    expect(lastNight(at(13, 2))).toBe(at(12, 3));
    expect(lastNight(at(13, 3))).toBe(at(13, 3));
    expect(nightsBetween(at(13, 3), at(13, 20))).toEqual([]);
  });
});

describe('which plants may outgrow their pot', () => {
  const night = at(12, 3);
  it('needs a pansy or rose on the sill, in bloom the night before, watered since', () => {
    expect(qualifies(plant('a', 'pansy', 'sill-1', { waterings: [at(11, 15)] }), night)).toBe(true);
    expect(qualifies(plant('b', 'rose', 'sill-3', { waterings: [at(11, 15)] }), night)).toBe(true);
  });
  it('says no without watering since the previous night', () => {
    expect(qualifies(plant('a', 'pansy', 'sill-1'), night)).toBe(false);
    expect(qualifies(plant('a', 'pansy', 'sill-1', { waterings: [at(10, 15)] }), night)).toBe(false);
  });
  it('says no if it was not yet in bloom the night before', () => {
    expect(qualifies(plant('a', 'pansy', 'sill-1', { plantedAt: at(10, 12), waterings: [at(11, 15)] }), night)).toBe(false);
  });
  it('says no for other species and for plants not on the sill', () => {
    expect(qualifies(plant('a', 'tulip', 'sill-1', { waterings: [at(11, 15)] }), night)).toBe(false);
    expect(qualifies(plant('a', 'pansy', 'shelf-1', { waterings: [at(11, 15)] }), night)).toBe(false);
    expect(qualifies(plant('a', 'pansy', null, { waterings: [at(11, 15)] }), night)).toBe(false);
  });
});

describe('growing vines night by night', () => {
  const garden = (): Plant[] => [
    plant('a', 'pansy', 'sill-1', { waterings: daily(1, 60) }),
    plant('b', 'pansy', 'sill-2', { waterings: daily(1, 60) }),
    plant('c', 'rose', 'sill-3', { waterings: daily(1, 60) }),
    plant('d', 'tulip', 'shelf-1', { waterings: daily(1, 60) }),
  ];

  it('is the same however often it is replayed', () => {
    const one = runNights(garden(), at(2, 12), at(30, 12), true);
    const two = runNights(garden(), at(2, 12), at(30, 12), true);
    expect(one).toEqual(two);
    expect(one.checkedAt).toBe(at(30, 3));
  });

  it('gives roughly every other qualifying night a vine, at most two plants a night', () => {
    let plants = garden();
    let nightsWithGrowth = 0;
    for (let day = 3; day <= 42; day++) {
      const before = plants;
      plants = runNights(plants, at(day - 1, 12), at(day, 12), true).plants;
      const grew = plants.filter((p, i) => {
        const prev = before[i]!.vine?.length ?? 0;
        const step = p.species === 'rose' ? ROSE_CREEP : 0;
        return (p.vine?.length ?? 0) > prev + step + 1e-9 || (prev === 0 && p.vine !== null);
      });
      expect(grew.length).toBeLessThanOrEqual(2);
      if (grew.length) nightsWithGrowth++;
    }
    expect(nightsWithGrowth).toBeGreaterThan(10);
    expect(nightsWithGrowth).toBeLessThan(30);
    expect(plants.find((p) => p.id === 'd')?.vine).toBeNull();
  });

  it('settles a direction for a middle vine', () => {
    const { plants } = runNights(garden(), at(2, 12), at(40, 12), true);
    const mid = plants.find((p) => p.id === 'b');
    if (mid?.vine) expect(['left', 'right']).toContain(mid.vine.dir);
  });

  it('lets a climbing rose creep on by itself, but only while it is on the sill', () => {
    const rose = plant('r', 'rose', 'sill-3', { vine: { length: 0.2 } });
    const { plants } = runNights([rose], at(10, 12), at(15, 12), true);
    expect(plants[0]!.vine?.length).toBeCloseTo(0.2 + 5 * ROSE_CREEP);
    const away = runNights([{ ...rose, display: null }], at(10, 12), at(15, 12), true);
    expect(away.plants[0]!.vine?.length).toBe(0.2);
  });

  it('does nothing while vines are switched off, but still marks the nights as checked', () => {
    const { plants, checkedAt } = runNights(garden(), at(2, 12), at(30, 12), false);
    expect(plants.every((p) => p.vine === null)).toBe(true);
    expect(checkedAt).toBe(at(30, 3));
  });

  it('never grows past the end of the window', () => {
    const { plants } = runNights(garden(), at(2, 12), at(60, 12), true);
    for (const p of plants) expect(p.vine?.length ?? 0).toBeLessThanOrEqual(1);
  });
});

describe('vines in the garden state', () => {
  const withPlants = (plants: Plant[]): GardenState => ({ ...starterGarden(at(10, 12)), plants, vinesCheckedAt: at(10, 3) });

  it('catches up on missed nights, and returns the same garden when none are due', () => {
    const g = withPlants([plant('a', 'pansy', 'sill-1', { waterings: daily(1, 40) })]);
    const later = catchUpNights(g, at(25, 9));
    expect(later.vinesCheckedAt).toBe(at(25, 3));
    expect(later.plants[0]!.vine).not.toBeNull();
    expect(catchUpNights(later, at(25, 20))).toBe(later);
  });

  it('trims a step at a time until the vine is gone', () => {
    let g = withPlants([plant('a', 'pansy', 'sill-1', { vine: { length: 0.4 } })]);
    g = trimVine(g, 'a');
    expect(g.plants[0]!.vine?.length).toBeCloseTo(0.25);
    g = trimVine(trimVine(g, 'a'), 'a');
    expect(g.plants[0]!.vine).toBeNull();
  });

  it('gives a vine moved into the middle pot a direction', () => {
    const g = withPlants([
      plant('a', 'pansy', 'sill-1', { vine: { length: 0.9 } }),
      plant('b', 'rose', 'shelf-1', { vine: { length: 0.3 } }),
      plant('c', 'pansy', 'sill-3', { vine: { length: 0.2 } }),
    ]);
    const moved = placeInWindow(g, 'b', 'sill-2');
    // it turns towards the longer side, so the shorter right-hand vine is the one that changes course
    expect(moved.plants.find((p) => p.id === 'b')?.vine?.dir).toBe('left');
  });

  it('migrates a version 3 save with no vines, checking from now on', () => {
    const now = at(20, 12);
    const parsed = parseSave(
      { version: 3, plants: [{ id: 'a', species: 'pansy', slot: 'row2-a', pot: 'wide', plantedAt: LONG_AGO, waterings: [], display: 'sill-1' }], settings: {} },
      now,
    );
    expect(parsed?.version).toBe(4);
    expect(parsed?.plants[0]!.vine).toBeNull();
    expect(parsed?.vinesCheckedAt).toBe(at(20, 3));
    expect(parsed?.settings.vines).toBe(true);
  });

  it('drops vines that are broken or on plants that cannot climb', () => {
    const parsed = parseSave({
      version: 4,
      vinesCheckedAt: at(10, 3),
      plants: [
        { id: 'a', species: 'pansy', slot: 'row2-a', pot: 'wide', plantedAt: LONG_AGO, display: 'sill-1', vine: { length: 7, dir: 'up' } },
        { id: 'b', species: 'tulip', slot: 'row2-b', pot: 'slim', plantedAt: LONG_AGO, display: null, vine: { length: 0.5 } },
        { id: 'c', species: 'rose', slot: 'row2-c', pot: 'round', plantedAt: LONG_AGO, display: null, vine: { length: 'long' } },
      ],
      settings: { vines: false },
    });
    expect(parsed?.plants.map((p) => p.vine)).toEqual([{ length: 1 }, null, null]);
    expect(parsed?.settings.vines).toBe(false);
  });

  it('a vine step is visible but takes several nights to cover the window', () => {
    expect(VINE_STEP.pansy).toBeGreaterThan(0.1);
    expect(1 / VINE_STEP.pansy).toBeGreaterThan(4);
  });
});
