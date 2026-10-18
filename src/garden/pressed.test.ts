import { describe, expect, it } from 'vitest';
import type { PansyDesign } from './designs';
import { canPress, deleteDesign, parseSave, pressFlower, savePansyDesign, starterGarden, unpress, type GardenState, type Plant } from './state';
import { pressedName } from '../ui/PressedBook';
import { moonLit, moonName, moonPath, moonPhase } from '../weather/moon';
import { dogMood } from '../scene/dogMood';

const at = (day: number, hour: number) => new Date(2026, 9, day, hour).getTime();
const LONG_AGO = at(1, 12);
const design: PansyDesign = { id: 'f1', name: 'Słoneczko', top: '#f3d36b', low: '#6b3fa0', face: 'whiskers', faceColor: '#241326', edge: null };

function plant(id: string, extra: Partial<Plant> = {}): Plant {
  return { id, species: 'pansy', slot: 'row3-a', pot: 'wide', variety: null, plantedAt: LONG_AGO, waterings: [], display: null, vine: null, ...extra };
}
const garden = (plants: Plant[]): GardenState => ({ ...starterGarden(at(1, 12)), plants });

describe('the pressed-flower book', () => {
  it('takes one flower a day from a plant in bloom', () => {
    let g = garden([plant('a')]);
    g = pressFlower(g, 'a', at(18, 10), 'p1');
    expect(g.pressed).toHaveLength(1);
    expect(g.pressed[0]).toMatchObject({ id: 'p1', plantId: 'a', species: 'pansy', at: at(18, 10) });
    expect(canPress(g, 'a', at(18, 22))).toBe(false);
    expect(pressFlower(g, 'a', at(18, 22))).toBe(g);
    expect(canPress(g, 'a', at(19, 8))).toBe(true);
  });

  it('only presses flowers that have opened', () => {
    const g = garden([plant('a', { plantedAt: at(18, 9) })]);
    expect(canPress(g, 'a', at(18, 10))).toBe(false);
    expect(pressFlower(g, 'a', at(18, 10)).pressed).toEqual([]);
  });

  it('keeps her own bratek as it was, even after the design is thrown away', () => {
    let g = savePansyDesign(garden([plant('a', { variety: 'd:f1' })]), design);
    g = pressFlower(g, 'a', at(18, 10), 'p1');
    g = deleteDesign(g, 'pansy', 'f1');
    expect(g.pressed[0]!.design).toEqual(design);
    expect(pressedName(g.pressed[0]!)).toBe('Słoneczko');
    const back = parseSave(JSON.parse(JSON.stringify(g)), at(18, 12))!;
    expect(back.pressed).toEqual(g.pressed);
  });

  it('writes the variety or the plant under each flower', () => {
    let g = garden([plant('a', { variety: 'velvet' }), plant('b', { species: 'rose', slot: 'row3-b' }), plant('c', { slot: 'row3-c' })]);
    g = pressFlower(pressFlower(pressFlower(g, 'a', at(18, 10)), 'b', at(18, 10)), 'c', at(18, 10));
    expect(g.pressed.map(pressedName)).toEqual(['Velvet night', 'róża', 'bratek']);
  });

  it('lets a flower be taken back out', () => {
    const g = pressFlower(garden([plant('a')]), 'a', at(18, 10), 'p1');
    expect(unpress(g, 'p1').pressed).toEqual([]);
  });

  it('drops damaged pages and keeps the rest when loading', () => {
    const g = pressFlower(garden([plant('a')]), 'a', at(18, 10), 'p1');
    const raw = JSON.parse(JSON.stringify({ ...g, pressed: [...g.pressed, { id: 'x', species: 'cactus', at: 5 }, 'junk', null] }));
    expect(parseSave(raw, at(18, 12))!.pressed).toEqual(g.pressed);
    const { pressed: _, ...older } = JSON.parse(JSON.stringify(g));
    expect(parseSave(older, at(18, 12))!.pressed).toEqual([]);
  });
});

describe('the moon', () => {
  it('follows the real month', () => {
    // new moon 8 April 2024, 18:21 UTC; full moon 23 April 2024, 23:49 UTC
    expect(moonLit(moonPhase(Date.UTC(2024, 3, 8, 18, 21)))).toBeLessThan(0.01);
    expect(moonLit(moonPhase(Date.UTC(2024, 3, 23, 23, 49)))).toBeGreaterThan(0.99);
    expect(moonName(moonPhase(Date.UTC(2024, 3, 15, 19, 13)))).toBe('First quarter');
  });

  it('draws nothing on a new moon, a whole disc when full, and lights the right side while waxing', () => {
    expect(moonPath(10, 0.001)).toBeNull();
    expect(moonPath(10, 0.5)).toContain('0 1 1');
    // waxing: the outer edge runs clockwise, down the right-hand side
    expect(moonPath(10, 0.2)).toMatch(/^M0,-10\.00 A10\.00,10\.00 0 0 1/);
    expect(moonPath(10, 0.8)).toMatch(/^M0,-10\.00 A10\.00,10\.00 0 0 0/);
  });
});

describe('the dogs', () => {
  it('sleep at night, watch the rain, wake slowly in the morning', () => {
    expect(dogMood({ sky: 'clear', night: true }, 23)).toBe('asleep');
    expect(dogMood({ sky: 'rain', night: true }, 2)).toBe('asleep');
    expect(dogMood({ sky: 'rain', night: false }, 14)).toBe('rain');
    expect(dogMood({ sky: 'cloudy', night: false }, 7)).toBe('morning');
    expect(dogMood({ sky: 'clear', night: false }, 15)).toBe('day');
  });
});
