import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { backupName, backupSummary, makeBackup, readBackup } from './backup';
import { onThisDay } from './diary';
import { addPlant, saveDiaryEntry, setPhoto, starterGarden } from './state';
import { getImage, loadGarden, restoreGarden, saveGarden } from './storage';

const NOW = new Date(2026, 9, 19, 20, 0).getTime();
const PIXELS = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 255, 128, 7]);

function herGarden() {
  let g = setPhoto(starterGarden(NOW), { img: 'photo-1', w: 300, h: 400 });
  g = saveDiaryEntry(g, '2026-10-19', 'love', 'Piorun stole a sock.', NOW);
  return addPlant(g, 'row3-d', 'daisy', NOW, 'sun');
}

describe('backups', () => {
  it('carry the whole garden and its pictures in one file, and come back the same', async () => {
    const g = herGarden();
    const text = await makeBackup(g, async (key) => (key === 'photo-1' ? new Blob([PIXELS], { type: 'image/png' }) : null), NOW);
    const r = readBackup(text, NOW + 60_000)!;
    expect(r.garden.plants).toEqual(g.plants);
    expect(r.garden.diary).toEqual(g.diary);
    expect(r.garden.decor).toEqual(g.decor);
    expect(r.exportedAt).toBe(NOW);
    expect(r.images['photo-1']!.type).toBe('image/png');
    expect(new Uint8Array(await r.images['photo-1']!.arrayBuffer())).toEqual(PIXELS);
    expect(backupSummary(r)).toBe('8 plants, 1 diary page, 0 pressed flowers, 1 picture');
  });

  it('turn away files that are not a garden backup', () => {
    expect(readBackup('not json', NOW)).toBeNull();
    expect(readBackup(JSON.stringify({ plants: [] }), NOW)).toBeNull();
    expect(readBackup(JSON.stringify({ app: 'olcias-garden', garden: { version: 99, plants: [] } }), NOW)).toBeNull();
  });

  it('keep the garden even when a picture inside is damaged', async () => {
    const text = await makeBackup(herGarden(), async () => new Blob([PIXELS], { type: 'image/png' }), NOW);
    const broken = JSON.parse(text);
    broken.images['photo-1'] = 'data:text/html;base64,PHNjcmlwdD4=';
    const r = readBackup(JSON.stringify(broken), NOW)!;
    expect(r.garden.plants.some((p) => p.id === 'sun')).toBe(true);
    expect(r.images).toEqual({});
  });

  it('are named by the day they were made', () => {
    expect(backupName(NOW)).toBe('olcias-garden-2026-10-19.json');
  });

  it('restore over the garden on the phone, keeping the old one aside', async () => {
    const before = await loadGarden(NOW);
    await saveGarden(before);
    const r = readBackup(await makeBackup(herGarden(), async () => new Blob([PIXELS], { type: 'image/png' }), NOW), NOW)!;
    await restoreGarden(r.garden, r.images, NOW);
    const after = await loadGarden(NOW);
    expect(after.plants.some((p) => p.id === 'sun')).toBe(true);
    expect(after.diary['2026-10-19']?.text).toBe('Piorun stole a sock.');
    expect(await getImage('photo-1')).not.toBeNull();
    const kept = await new Promise<unknown>((resolve) => {
      const open = indexedDB.open('olcias-garden');
      open.onsuccess = () => {
        const req = open.result.transaction('saves').objectStore('saves').get(`before-restore-${NOW}`);
        req.onsuccess = () => {
          open.result.close();
          resolve(req.result);
        };
      };
    });
    expect((kept as { plants: unknown[] }).plants).toHaveLength(before.plants.length);
  });
});

describe('on this day', () => {
  it('finds pages from the same day in earlier years, newest first', () => {
    let g = starterGarden(NOW);
    g = saveDiaryEntry(g, '2024-10-19', 'calm', 'two years ago', NOW);
    g = saveDiaryEntry(g, '2025-10-19', 'happy', 'a year ago', NOW);
    g = saveDiaryEntry(g, '2025-10-18', 'sad', 'not today', NOW);
    g = saveDiaryEntry(g, '2026-10-19', 'love', 'today itself', NOW);
    const found = onThisDay(g.diary, '2026-10-19');
    expect(found.map((m) => [m.key, m.yearsAgo])).toEqual([
      ['2025-10-19', 1],
      ['2024-10-19', 2],
    ]);
    expect(onThisDay(g.diary, '2026-10-20')).toEqual([]);
  });
});
