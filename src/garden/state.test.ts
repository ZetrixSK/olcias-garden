import { describe, expect, it } from 'vitest';
import { addPlant, cyclePot, movePlant, parseSave, removePlant, starterGarden, waterPlant } from './state';

const NOW = Date.UTC(2026, 9, 14);

describe('garden state', () => {
  it('plants only into empty slots', () => {
    const g = starterGarden(NOW);
    expect(addPlant(g, g.plants[0]!.slot, 'rose', NOW)).toBe(g);
    const next = addPlant(g, 'row3-a', 'rose', NOW, 'new');
    expect(next.plants.find((p) => p.id === 'new')?.slot).toBe('row3-a');
  });

  it('moves into an empty slot and swaps with an occupied one', () => {
    let g = addPlant(addPlant(starterGarden(NOW), 'row3-a', 'rose', NOW, 'a'), 'row3-b', 'tulip', NOW, 'b');
    g = movePlant(g, 'a', 'row3-c');
    expect(g.plants.find((p) => p.id === 'a')?.slot).toBe('row3-c');
    g = movePlant(g, 'a', 'row3-b');
    expect(g.plants.find((p) => p.id === 'a')?.slot).toBe('row3-b');
    expect(g.plants.find((p) => p.id === 'b')?.slot).toBe('row3-c');
  });

  it('records waterings, removes plants and cycles pots', () => {
    let g = addPlant(starterGarden(NOW), 'row3-a', 'rose', NOW, 'a');
    g = waterPlant(g, 'a', NOW + 1);
    expect(g.plants.find((p) => p.id === 'a')?.waterings).toEqual([NOW + 1]);
    const before = g.plants.find((p) => p.id === 'a')!.pot;
    expect(cyclePot(g, 'a').plants.find((p) => p.id === 'a')!.pot).not.toBe(before);
    expect(removePlant(g, 'a').plants.some((p) => p.id === 'a')).toBe(false);
  });

  it('round-trips a save', () => {
    const g = starterGarden(NOW);
    expect(parseSave(JSON.parse(JSON.stringify(g)))).toEqual(g);
  });

  it('rejects unusable saves', () => {
    expect(parseSave(null)).toBeNull();
    expect(parseSave('garbage')).toBeNull();
    expect(parseSave({ version: 99, plants: [] })).toBeNull();
    expect(parseSave({ version: 2 })).toBeNull();
  });

  it('drops only the broken parts of a damaged save', () => {
    const parsed = parseSave({
      version: 2,
      plants: [
        { id: 'ok', species: 'pansy', slot: 'row2-a', pot: 'wide', plantedAt: NOW, waterings: [NOW, 'x'] },
        { id: 'dup', species: 'rose', slot: 'row2-a', pot: 'round', plantedAt: NOW, waterings: [] },
        { id: 'bad-species', species: 'cactus', slot: 'row2-b', plantedAt: NOW },
        { id: 'bad-pot', species: 'tulip', slot: 'row2-c', pot: 'bucket', plantedAt: NOW },
      ],
      settings: { theme: 'witchy', view: 'nowhere', weatherMode: 42 },
    });
    expect(parsed?.plants.map((p) => p.id)).toEqual(['ok', 'bad-pot']);
    expect(parsed?.plants[0]!.waterings).toEqual([NOW]);
    expect(parsed?.plants[1]!.pot).toBe('slim');
    expect(parsed?.settings).toEqual({
      theme: 'witchy',
      view: 'room',
      weatherMode: 'clock',
      manual: { sky: 'clear', night: false },
      location: null,
    });
  });

  it('migrates a version 1 save', () => {
    const parsed = parseSave({
      version: 1,
      plants: [
        { id: 'side', species: 'pansy', slot: 'row1-a', pot: 'wide', plantedAt: NOW, waterings: [] },
        { id: 'sill', species: 'rose', slot: 'hang-l', pot: 'round', plantedAt: NOW, waterings: [] },
      ],
      settings: { theme: 'cozy', view: 'shelves', weatherMode: 'night' },
    });
    expect(parsed?.version).toBe(2);
    expect(parsed?.plants.map((p) => [p.id, p.slot])).toEqual([['side', 'sill-l'], ['sill', 'hang-l']]);
    expect(parsed?.settings.weatherMode).toBe('manual');
    expect(parsed?.settings.manual).toEqual({ sky: 'clear', night: true });
  });
});
