import { describe, expect, it } from 'vitest';
import { nextStage, waterWouldHelp } from './growth';
import { parseSave, pressFlower, setPlantName, setPressNote, starterGarden, updateSettings, waterPlant, type GardenState, type Plant } from './state';
import { growthText, whenText } from '../ui/Sheets';
import { pressedName } from '../ui/PressedBook';
import { isDarkRoom, ownRoomVars, parseOwnRoom, startingRoom } from '../theme/ownRoom';
import { plantLook } from '../plants/looks';

const H = 3_600_000;
// a Saturday at 10:00 local time
const NOW = new Date(2026, 9, 17, 10, 0).getTime();

function pansy(extra: Partial<Plant> = {}): Plant {
  return { id: 'a', species: 'pansy', slot: 'row3-a', pot: 'wide', variety: null, plantedAt: NOW, waterings: [], display: null, vine: null, name: null, ...extra };
}
const garden = (plants: Plant[]): GardenState => ({ ...starterGarden(NOW), plants });

describe('when it will grow, in words', () => {
  it('reads like a person would say it', () => {
    expect(whenText(60_000, NOW)).toBe('any moment now');
    expect(whenText(9 * 60_000, NOW)).toBe('in a few minutes');
    expect(whenText(40 * 60_000, NOW)).toBe('within the hour');
    expect(whenText(2 * H, NOW)).toBe('in a couple of hours');
    expect(whenText(4 * H, NOW)).toBe('in a few hours');
    expect(whenText(7 * H, NOW)).toBe('later today');
    expect(whenText(10 * H, NOW)).toBe('this evening');
    expect(whenText(16 * H, NOW)).toBe('overnight');
    expect(whenText(24 * H, NOW)).toBe('tomorrow morning');
    expect(whenText(30 * H, NOW)).toBe('tomorrow afternoon');
    expect(whenText(72 * H, NOW)).toBe('in about 3 days');
  });

  it('knows the next stage, and whether water would bring it sooner', () => {
    // a pansy sprouts after 8 hours of growth
    const p = pansy({ plantedAt: NOW - 7.9 * H });
    expect(nextStage('pansy', p, NOW)).toMatchObject({ stage: 'seedling' });
    expect(growthText(p, NOW)).toBe('Sprouts in a few minutes');
    const seed = pansy();
    expect(growthText(seed, NOW)).toBe('Sprouts this evening · sooner with water');
    const watered = waterPlant(garden([seed]), 'a', NOW).plants[0]!;
    expect(waterWouldHelp(watered, NOW + 2 * H)).toBe(false);
    expect(growthText(watered, NOW)).toBe('Sprouts in a couple of hours');
    expect(growthText(pansy({ plantedAt: NOW - 100 * H }), NOW)).toBe('In full bloom');
  });
});

describe('names and notes', () => {
  it('names a plant, shows it on the seed marker, and takes it away when cleared', () => {
    let g = setPlantName(garden([pansy()]), 'a', '  Ola  ');
    expect(g.plants[0]!.name).toBe('Ola');
    expect(plantLook(g.plants[0]!, g.designs).label).toBe('Ola');
    expect(parseSave(JSON.parse(JSON.stringify(g)), NOW)!.plants[0]!.name).toBe('Ola');
    g = setPlantName(g, 'a', '   ');
    expect(g.plants[0]!.name).toBeNull();
  });

  it('keeps the plant’s name and her note with a pressed flower', () => {
    let g = setPlantName(garden([pansy({ plantedAt: NOW - 100 * H })]), 'a', 'Ola');
    g = pressFlower(g, 'a', NOW, 'p1');
    g = setPlantName(g, 'a', 'Renamed later');
    g = setPressNote(g, 'p1', 'From the windowsill, the first warm day.');
    expect(pressedName(g.pressed[0]!)).toBe('Ola');
    const back = parseSave(JSON.parse(JSON.stringify(g)), NOW)!;
    expect(back.pressed[0]).toMatchObject({ name: 'Ola', note: 'From the windowsill, the first warm day.' });
  });
});

describe('her own room', () => {
  it('starts from the room she bases it on, and survives a save', () => {
    const room = { ...startingRoom('cozy'), wall: '#e7d6ec', floor: '#2e2526' };
    const g = updateSettings(garden([]), { own: room, useOwn: true });
    expect(parseSave(JSON.parse(JSON.stringify(g)), NOW)!.settings).toMatchObject({ own: room, useOwn: true });
  });

  it('works out shades from her colours, and knows a dark room from a light one', () => {
    const vars = ownRoomVars(startingRoom('witchy'));
    expect(vars['--wall']).toBe('#4e3954');
    expect(vars['--wall-shade']).not.toBe(vars['--wall']);
    expect(isDarkRoom(startingRoom('witchy'))).toBe(true);
    expect(isDarkRoom(startingRoom('cozy'))).toBe(false);
  });

  it('reads damaged colours as the starting ones', () => {
    expect(parseOwnRoom({ base: 'witchy', wall: 'purple', bed: '#123456' })).toEqual({ ...startingRoom('witchy'), bed: '#123456' });
    expect(parseOwnRoom('junk')).toBeNull();
    const raw = JSON.parse(JSON.stringify(updateSettings(garden([]), { own: null, useOwn: true })));
    expect(parseSave(raw, NOW)!.settings.useOwn).toBe(false);
  });
});
