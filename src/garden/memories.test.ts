import { testGarden } from './testGarden';
import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import {
  addMemories,
  ALL,
  editMemory,
  fileMemories,
  HEARTS,
  inAlbum,
  MAX_CAPTION,
  MAX_MEMORIES,
  memoryImages,
  memoriesOnThisDay,
  NO_MEMORIES,
  parseMemories,
  photoTakenAt,
  removeAlbum,
  removeMemories,
  saveAlbum,
  type Album,
  type Memory,
} from './memories';
import { makeBackup, readBackup } from './backup';
import { gardenImages, parseSave, withMemories } from './state';
import { sharedGarden } from '../remote/shared';

const NOW = new Date(2026, 10, 1, 18, 0).getTime();

const memory = (id: string, at: number, patch: Partial<Memory> = {}): Memory => ({
  id,
  kind: 'photo',
  img: `${id}-img`,
  thumb: `${id}-thumb`,
  w: 1200,
  h: 1600,
  at,
  caption: '',
  albums: [],
  fav: false,
  paper: null,
  ...patch,
});
const album = (id: string, name = 'Lake'): Album => ({ id, name, stamp: 'leaf', cover: 'sage', created: NOW });

describe('memories', () => {
  it('keep albums, captions and hearts through a save, newest first in every album', () => {
    let m = saveAlbum(NO_MEMORIES, album('a1', '  Summer by the lake  '));
    m = addMemories(m, [memory('old', NOW - 9e8), memory('new', NOW, { albums: ['a1'] })]);
    m = editMemory(m, 'old', { caption: 'Piorun in the snow', fav: true });
    const back = parseMemories(JSON.parse(JSON.stringify(m)));
    expect(back).toEqual(m);
    expect(back.albums[0]!.name).toBe('Summer by the lake');
    expect(inAlbum(back, ALL).map((x) => x.id)).toEqual(['new', 'old']);
    expect(inAlbum(back, HEARTS).map((x) => x.id)).toEqual(['old']);
    expect(inAlbum(back, 'a1').map((x) => x.id)).toEqual(['new']);
  });

  it('go into albums and come out again, in one go for several', () => {
    let m = saveAlbum(saveAlbum(NO_MEMORIES, album('a1')), album('a2'));
    m = addMemories(m, [memory('x', 1), memory('y', 2), memory('z', 3)]);
    m = fileMemories(m, ['x', 'y'], 'a1', true);
    m = fileMemories(m, ['x', 'y'], 'a1', true);
    m = fileMemories(m, ['y'], 'a2', true);
    expect(m.items.map((x) => x.albums)).toEqual([['a1'], ['a1', 'a2'], []]);
    m = fileMemories(m, ['y'], 'a1', false);
    expect(m.items[1]!.albums).toEqual(['a2']);
    // an album that doesn't exist changes nothing
    expect(fileMemories(m, ['z'], 'nope', true)).toBe(m);
  });

  it('keep their pictures when an album is taken away', () => {
    let m = saveAlbum(NO_MEMORIES, album('a1'));
    m = addMemories(m, [memory('x', 1, { albums: ['a1'] })]);
    m = removeAlbum(m, 'a1');
    expect(m.albums).toEqual([]);
    expect(m.items).toHaveLength(1);
    expect(m.items[0]!.albums).toEqual([]);
  });

  it('hand back exactly the pictures to clear away when deleted', () => {
    let m = addMemories(NO_MEMORIES, [memory('x', 1), memory('y', 2)]);
    const { memories, unused } = removeMemories(m, ['x']);
    expect(memories.items.map((x) => x.id)).toEqual(['y']);
    expect(unused.sort()).toEqual(['x-img', 'x-thumb']);
    m = memories;
    expect([...memoryImages(m)].sort()).toEqual(['y-img', 'y-thumb']);
  });

  it('read a damaged save one entry at a time, forgetting albums that are gone', () => {
    const m = parseMemories({
      albums: [album('a1'), { id: 'bad' }, album('a1'), { ...album('a2'), stamp: 'dragon', cover: 'gold' }],
      items: [
        memory('ok', 5, { albums: ['a1', 'gone', 'a1'], caption: 'x'.repeat(MAX_CAPTION + 50) }),
        { id: 'no-picture' },
        memory('ok', 6),
        { ...memory('p', 7), kind: 'painting', paper: 'cream' },
        { ...memory('q', 8), paper: 'cream' },
      ],
    });
    expect(m.albums.map((a) => a.id)).toEqual(['a1', 'a2']);
    expect(m.albums[1]).toMatchObject({ stamp: 'heart', cover: 'rose' });
    expect(m.items.map((x) => x.id)).toEqual(['ok', 'p', 'q']);
    expect(m.items[0]!.albums).toEqual(['a1']);
    expect(m.items[0]!.caption).toHaveLength(MAX_CAPTION);
    expect(m.items[1]!.paper).toBe('cream');
    // only a painting has paper
    expect(m.items[2]!.paper).toBeNull();
    expect(parseMemories('nonsense')).toEqual(NO_MEMORIES);
  });

  it('stop adding once the album is full', () => {
    const many = Array.from({ length: MAX_MEMORIES - 1 }, (_, i) => memory(`m${i}`, i));
    const m = addMemories(addMemories(NO_MEMORIES, many), [memory('a', 1), memory('b', 2)]);
    expect(m.items).toHaveLength(MAX_MEMORIES);
    expect(m.items.at(-1)!.id).toBe('a');
  });
});

describe('the garden with memories', () => {
  const g = withMemories(testGarden(NOW), (m) => addMemories(saveAlbum(m, album('a1')), [memory('x', NOW, { albums: ['a1'], caption: 'our walk' })]));

  it('opens older saves with an empty album, and keeps the album through a save', () => {
    const { memories: _, ...older } = testGarden(NOW);
    expect(parseSave(older, NOW)!.memories).toEqual(NO_MEMORIES);
    expect(parseSave(JSON.parse(JSON.stringify(g)), NOW)!.memories).toEqual(g.memories);
  });

  it('counts memory pictures as in use, so tidying never clears them', () => {
    expect(gardenImages(g)).toEqual(new Set(['x-img', 'x-thumb']));
  });

  it('never sends memories up with the shared garden, notes shared or not', () => {
    expect(sharedGarden(g).memories).toEqual(NO_MEMORIES);
    const sharing = { ...g, settings: { ...g.settings, shareNotes: true } };
    expect(sharedGarden(sharing).memories).toEqual(NO_MEMORIES);
  });

  it('carries memories and both sizes of their pictures in a backup', async () => {
    const blob = () => new Blob([new Uint8Array([255, 216, 255, 217])], { type: 'image/jpeg' });
    const text = await makeBackup(g, async () => blob(), NOW);
    const r = readBackup(text, NOW)!;
    expect(r.garden.memories).toEqual(g.memories);
    expect(Object.keys(r.images).sort()).toEqual(['x-img', 'x-thumb']);
  });
});

/** A tiny JPEG holding only a camera note: when it was taken, in the Exif directory or the main one. */
function jpegWithDate(date: string, little: boolean, inExif: boolean): Uint8Array {
  const tiff: number[] = [];
  const u16 = (v: number) => (little ? [v & 255, v >> 8] : [v >> 8, v & 255]);
  const u32 = (v: number) => (little ? [v & 255, (v >> 8) & 255, (v >> 16) & 255, v >>> 24] : [v >>> 24, (v >> 16) & 255, (v >> 8) & 255, v & 255]);
  const text = [...date].map((c) => c.charCodeAt(0)).concat(0);
  if (inExif) {
    // header (8), IFD0 with one pointer at 8 (2 + 12 + 4 = 18), Exif IFD at 26 (18), text at 44
    tiff.push(...(little ? [0x49, 0x49] : [0x4d, 0x4d]), ...u16(42), ...u32(8));
    tiff.push(...u16(1), ...u16(0x8769), ...u16(4), ...u32(1), ...u32(26), ...u32(0));
    tiff.push(...u16(1), ...u16(0x9003), ...u16(2), ...u32(text.length), ...u32(44), ...u32(0));
  } else {
    tiff.push(...(little ? [0x49, 0x49] : [0x4d, 0x4d]), ...u16(42), ...u32(8));
    tiff.push(...u16(1), ...u16(0x0132), ...u16(2), ...u32(text.length), ...u32(26), ...u32(0));
  }
  tiff.push(...text);
  const app1 = [0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff];
  const len = app1.length + 2;
  return new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 4, 0, 0, 0xff, 0xe1, len >> 8, len & 255, ...app1, 0xff, 0xd9]);
}

describe('when a photo was taken', () => {
  const july = new Date(2025, 6, 14, 17, 3, 9).getTime();
  it('is read from the camera note, either byte order', () => {
    expect(photoTakenAt(jpegWithDate('2025:07:14 17:03:09', true, true))).toBe(july);
    expect(photoTakenAt(jpegWithDate('2025:07:14 17:03:09', false, true))).toBe(july);
    expect(photoTakenAt(jpegWithDate('2025:07:14 17:03:09', true, false))).toBe(july);
  });
  it("is unknown for files that don't say, or aren't JPEGs", () => {
    expect(photoTakenAt(new Uint8Array([0xff, 0xd8, 0xff, 0xda, 0, 2]))).toBeNull();
    expect(photoTakenAt(new Uint8Array([137, 80, 78, 71]))).toBeNull();
    expect(photoTakenAt(jpegWithDate('0000:00:00 00:00:00', true, true))).toBeNull();
    expect(photoTakenAt(jpegWithDate('2025:07:14 17:03:09', true, true).slice(0, 40))).toBeNull();
  });
});

describe('on this day', () => {
  it('finds the pictures from this date in earlier years, by year, newest year first', () => {
    const at = (y: number, mo: number, d: number, h = 12) => new Date(y, mo, d, h).getTime();
    const m = addMemories(NO_MEMORIES, [
      memory('a', at(2025, 10, 1, 9)),
      memory('b', at(2025, 10, 1, 8)),
      memory('c', at(2023, 10, 1)),
      memory('today', at(2026, 10, 1)),
      memory('other-day', at(2025, 10, 2)),
      memory('undated', 0),
    ]);
    const days = memoriesOnThisDay(m, new Date(2026, 10, 1, 18));
    expect(days.map((d) => [d.yearsAgo, d.items.map((x) => x.id)])).toEqual([
      [1, ['b', 'a']],
      [3, ['c']],
    ]);
    expect(memoriesOnThisDay(m, new Date(2026, 10, 3))).toEqual([]);
  });
});
