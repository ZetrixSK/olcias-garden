import { describe, expect, it } from 'vitest';
import { imagesInUse } from './decor';
import {
  addDrawing,
  addPlant,
  moveDrawing,
  movePlant,
  parseSave,
  removeDrawing,
  setPhoto,
  setWallpaper,
  starterGarden,
  type GardenState,
} from './state';

const NOW = Date.UTC(2026, 9, 18);
const empty = (): GardenState => ({ ...starterGarden(NOW), plants: [] });
const drawing = (id: string, slot: string) => ({ id, slot, img: `img-${id}`, w: 600, h: 800 });

describe('her drawings on the shelves', () => {
  it('stand in an empty spot, but never in a hanging pot or on top of a plant', () => {
    let g = addPlant(empty(), 'row2-a', 'tulip', NOW, 't');
    g = addDrawing(g, drawing('d1', 'row2-b'));
    expect(g.decor.drawings).toHaveLength(1);
    expect(addDrawing(g, drawing('d2', 'hang-l'))).toBe(g);
    expect(addDrawing(g, drawing('d3', 'row2-a'))).toBe(g);
    expect(addDrawing(g, drawing('d4', 'row2-b'))).toBe(g);
    // and nothing can be planted where a drawing stands
    expect(addPlant(g, 'row2-b', 'daisy', NOW)).toBe(g);
  });

  it('swap places with a plant or another drawing when moved', () => {
    let g = addPlant(empty(), 'row2-a', 'tulip', NOW, 't');
    g = addDrawing(addDrawing(g, drawing('d1', 'row2-b')), drawing('d2', 'row3-a'));
    g = moveDrawing(g, 'd1', 'row2-a');
    expect(g.decor.drawings.find((d) => d.id === 'd1')!.slot).toBe('row2-a');
    expect(g.plants[0]!.slot).toBe('row2-b');
    g = moveDrawing(g, 'd1', 'row3-a');
    expect(g.decor.drawings.map((d) => [d.id, d.slot])).toEqual([['d1', 'row3-a'], ['d2', 'row2-a']]);
    // a plant moved onto a drawing swaps with it too
    g = movePlant(g, 't', 'row2-a');
    expect(g.plants[0]!.slot).toBe('row2-a');
    expect(g.decor.drawings.find((d) => d.id === 'd2')!.slot).toBe('row2-b');
  });

  it('never end up in a hanging pot', () => {
    let g = addPlant(empty(), 'hang-l', 'daisy', NOW, 'h');
    g = addDrawing(g, drawing('d1', 'row2-b'));
    expect(moveDrawing(g, 'd1', 'hang-l')).toBe(g);
    expect(movePlant(g, 'h', 'row2-b')).toBe(g);
  });

  it('can be taken down', () => {
    const g = addDrawing(empty(), drawing('d1', 'row2-b'));
    expect(removeDrawing(g, 'd1').decor.drawings).toEqual([]);
  });
});

describe('her wallpaper and photo', () => {
  it('survive a save, and go back to the room’s own when cleared', () => {
    let g = setWallpaper(empty(), { img: 'w', w: 512, h: 512, size: 'l', soft: true });
    g = setPhoto(addDrawing(g, drawing('d1', 'row2-b')), { img: 'p', w: 900, h: 1200 });
    const back = parseSave(JSON.parse(JSON.stringify(g)), NOW)!;
    expect(back.decor).toEqual(g.decor);
    expect([...imagesInUse(back.decor)].sort()).toEqual(['img-d1', 'p', 'w']);
    expect(setPhoto(setWallpaper(g, null), null).decor).toMatchObject({ wallpaper: null, photo: null });
  });

  it('are read defensively from older or damaged saves', () => {
    const g = addPlant(empty(), 'row2-a', 'tulip', NOW, 't');
    const raw = JSON.parse(JSON.stringify(g));
    delete raw.decor;
    expect(parseSave(raw, NOW)!.decor).toEqual({ wallpaper: null, photo: null, drawings: [] });
    raw.decor = {
      wallpaper: { img: 'w', w: -1, h: 5 },
      photo: 'junk',
      drawings: [drawing('a', 'row2-a'), drawing('b', 'hang-r'), drawing('c', 'row3-c'), drawing('d', 'row3-c'), { id: 'e' }],
    };
    const back = parseSave(raw, NOW)!;
    expect(back.decor.wallpaper).toBeNull();
    expect(back.decor.photo).toBeNull();
    // on a plant, in a hanging pot, a second one on the same spot, or broken: all dropped
    expect(back.decor.drawings.map((d) => d.id)).toEqual(['c']);
  });
});
