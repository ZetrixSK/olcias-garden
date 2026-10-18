import { describe, expect, it } from 'vitest';
import { skyPhase, sunTimes } from './sun';
import { auroraTonight, fogThisMorning, outsideNow, visitorsToday } from './moments';
import { clockWeather } from './weather';
import { parseSave, starterGarden, addPlant, type GardenState } from '../garden/state';
import { SPECIES_IDS } from '../garden/species';
import { pansyPalette } from '../plants/looks';

const at = (m: number, d: number, h: number, min = 0) => new Date(2026, m - 1, d, h, min);

describe('the sun over Poland', () => {
  it('rises late and sets early in winter, the other way round in summer', () => {
    const dec = sunTimes(at(12, 15, 12));
    const jun = sunTimes(at(6, 15, 12));
    expect(dec.rise).toBeGreaterThan(7.5);
    expect(dec.set).toBeLessThan(16);
    expect(jun.rise).toBeLessThan(5);
    expect(jun.set).toBeGreaterThan(20.5);
  });

  it('glows at dawn and dusk, and is dark in between', () => {
    expect(skyPhase(at(12, 15, 16, 0))).toEqual({ night: false, twilight: 'dusk' });
    expect(skyPhase(at(12, 15, 17, 0))).toEqual({ night: true, twilight: null });
    expect(skyPhase(at(12, 15, 8, 0))).toEqual({ night: false, twilight: 'dawn' });
    expect(skyPhase(at(6, 15, 21, 0))).toEqual({ night: false, twilight: 'dusk' });
    expect(skyPhase(at(6, 15, 13, 0))).toEqual({ night: false, twilight: null });
    expect(clockWeather(at(10, 18, 17, 10))).toEqual({ sky: 'clear', night: false, twilight: 'dusk' });
  });
});

describe('rare moments and visitors', () => {
  it('are the same all day, and differ from day to day', () => {
    const morning = at(10, 20, 9).getTime();
    const evening = at(10, 20, 18).getTime();
    expect(visitorsToday(morning, 'autumn', false, true)).toEqual(visitorsToday(evening, 'autumn', false, true));
    const days = Array.from({ length: 60 }, (_, i) => visitorsToday(at(10, 1 + i, 12).getTime(), 'autumn', false, true).deer);
    expect(days.some(Boolean)).toBe(true);
    expect(days.every(Boolean)).toBe(false);
  });

  it('keeps the northern lights rare, and the same for the whole night', () => {
    const nights = Array.from({ length: 365 }, (_, i) => auroraTonight(new Date(2026, 0, 1 + i, 23).getTime(), 'winter'));
    const count = nights.filter(Boolean).length;
    expect(count).toBeGreaterThan(5);
    expect(count).toBeLessThan(70);
    expect(auroraTonight(at(11, 3, 23).getTime(), 'winter')).toBe(auroraTonight(at(11, 4, 2).getTime(), 'winter'));
  });

  it('sends nobody out at night, keeps fog to autumn mornings, and the robin to winter', () => {
    expect(Object.values(visitorsToday(at(7, 1, 23).getTime(), 'summer', true, true)).some(Boolean)).toBe(false);
    expect(fogThisMorning(at(7, 1, 7).getTime(), 'summer')).toBe(false);
    expect(fogThisMorning(at(10, 1, 15).getTime(), 'autumn')).toBe(false);
    expect(visitorsToday(at(1, 10, 12).getTime(), 'winter', false, true).robin).toBe(true);
    expect(outsideNow(at(1, 10, 12).getTime(), 'winter', false, 'clear', true).rainbow).toBe(true);
  });
});

describe('the new flowers', () => {
  it('can all be planted and survive a save', () => {
    let g: GardenState = { ...starterGarden(Date.UTC(2026, 9, 18)), plants: [] };
    const slots = ['row2-a', 'row2-b', 'row2-c', 'row2-d', 'row3-a', 'row3-b', 'row3-c', 'row3-d', 'hang-l', 'hang-r'] as const;
    SPECIES_IDS.forEach((sp, i) => (g = addPlant(g, slots[i]!, sp, Date.UTC(2026, 9, 18), `p${i}`)));
    expect(g.plants.map((p) => p.species)).toEqual(SPECIES_IDS);
    const back = parseSave(JSON.parse(JSON.stringify(g)), Date.UTC(2026, 9, 18))!;
    expect(back.plants.map((p) => p.species)).toEqual(SPECIES_IDS);
    // only bratki take flower colours
    expect(back.plants.find((p) => p.species === 'pumpkin')!.variety).toBeNull();
    expect(pansyPalette(null, back.designs).length).toBeGreaterThan(0);
  });
});
