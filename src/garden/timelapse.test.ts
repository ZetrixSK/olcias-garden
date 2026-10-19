import { describe, expect, it } from 'vitest';
import { stageAt } from './growth';
import { catchUpNights, starterGarden, type GardenState, type Plant } from './state';
import { awayDemo, buildTimelapse, gardenAt, parseAway, somethingGrew } from './timelapse';

const at = (day: number, hour: number) => new Date(2026, 9, day, hour).getTime();

function garden(): GardenState {
  const waterings = Array.from({ length: 30 }, (_, i) => at(1 + i, 15));
  const p = (id: string, display: Plant['display']): Plant => ({
    id, species: 'pansy', slot: 'row3-a', pot: 'wide', variety: null, plantedAt: at(1, 9), waterings, display, vine: null, name: null,
  });
  return { ...starterGarden(at(10, 12)), plants: [p('a', 'sill-1'), p('b', 'sill-3')], vinesCheckedAt: at(10, 3), lastSeen: at(10, 20) };
}

describe('the replay of what happened while she was away', () => {
  it('ends exactly where catching up ends', () => {
    const g = garden();
    const lapse = buildTimelapse(g, g.lastSeen, at(20, 9));
    expect(gardenAt(lapse, at(20, 9)).plants).toEqual(catchUpNights(g, at(20, 9)).plants);
  });

  it('starts exactly as she left it', () => {
    const g = garden();
    const lapse = buildTimelapse(g, g.lastSeen, at(20, 9));
    expect(gardenAt(lapse, g.lastSeen).plants.map((p) => p.vine)).toEqual([null, null]);
  });

  it('never shrinks a vine on the way', () => {
    const g = garden();
    const lapse = buildTimelapse(g, g.lastSeen, at(25, 9));
    let prev = [0, 0];
    for (let t = g.lastSeen; t <= at(25, 9); t += 3_600_000) {
      const now = gardenAt(lapse, t).plants.map((p) => p.vine?.length ?? 0);
      now.forEach((l, i) => expect(l).toBeGreaterThanOrEqual(prev[i]! - 1e-9));
      prev = now;
    }
  });

  it('knows whether anything grew', () => {
    const g = garden();
    const stage = (p: Plant, t: number) => stageAt(p.species, p, t);
    expect(somethingGrew(buildTimelapse(g, g.lastSeen, at(10, 23)), stage)).toBe(false);
    const young = { ...g, plants: g.plants.map((p) => ({ ...p, plantedAt: at(10, 12) })) };
    expect(somethingGrew(buildTimelapse(young, at(10, 20), at(14, 9)), stage)).toBe(true);
  });

  it('does not replay nights that happened before it starts', () => {
    // last checked long ago, but the replay only covers a quiet hour today
    const g = { ...garden(), vinesCheckedAt: at(10, 3) };
    const lapse = buildTimelapse(g, at(20, 10), at(20, 11));
    const settled = catchUpNights(g, at(20, 10)).plants;
    expect(gardenAt(lapse, at(20, 10)).plants).toEqual(settled);
    expect(somethingGrew(lapse, (p, t) => stageAt(p.species, p, t))).toBe(false);
  });
});

describe('the ?away preview', () => {
  const T = new Date(2026, 9, 19, 20, 0).getTime();
  const H = 3_600_000;

  it('reads 30m, 8h, 2d and 1w, and nothing else', () => {
    expect(parseAway('30m')).toBe(30 * 60_000);
    expect(parseAway('8h')).toBe(8 * H);
    expect(parseAway('2d')).toBe(48 * H);
    expect(parseAway('1w')).toBe(168 * H);
    expect(parseAway('8')).toBeNull();
    expect(parseAway('-2d')).toBeNull();
    expect(parseAway(null)).toBeNull();
  });

  it('rewinds every plant so it grows during the time away, ending where it is now', () => {
    const g = starterGarden(T);
    for (const away of [1 * H, 8 * H, 48 * H]) {
      const demo = awayDemo(g, away, T);
      for (const p of demo.plants) {
        const real = g.plants.find((q) => q.id === p.id)!;
        const now = stageAt(p.species, p, T);
        expect(now === stageAt(real.species, real, T) || stageAt(real.species, real, T) === 'seed').toBe(true);
        expect(stageAt(p.species, p, T - away)).not.toBe(now);
      }
      expect(somethingGrew(buildTimelapse(demo, T - away, T), (p, t) => stageAt(p.species, p, t))).toBe(true);
    }
  });
});
