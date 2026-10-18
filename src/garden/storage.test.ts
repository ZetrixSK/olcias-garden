import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { addPlant, SAVE_VERSION } from './state';
import { deleteImage, getImage, loadGarden, putImage, saveGarden, tidyImages } from './storage';

const NOW = Date.UTC(2026, 9, 14);

function savedKeys(): Promise<IDBValidKey[]> {
  return new Promise((resolve) => {
    const open = indexedDB.open('olcias-garden');
    open.onsuccess = () => {
      const req = open.result.transaction('saves').objectStore('saves').getAllKeys();
      req.onsuccess = () => {
        open.result.close();
        resolve(req.result);
      };
    };
  });
}

describe('storage', () => {
  it('starts with the starter garden, then remembers changes', async () => {
    const first = await loadGarden(NOW);
    expect(first.plants.length).toBeGreaterThan(0);
    await saveGarden(addPlant(first, 'row3-d', 'lavender', NOW, 'lav'));
    const again = await loadGarden(NOW + 1000);
    expect(again.plants.find((p) => p.id === 'lav')?.species).toBe('lavender');
  });

  it('repairs a database that exists without its store', async () => {
    indexedDB.deleteDatabase('olcias-garden');
    await new Promise<void>((resolve) => {
      const r = indexedDB.open('olcias-garden', 1);
      r.onsuccess = () => {
        r.result.close();
        resolve();
      };
    });
    const g = await loadGarden(NOW);
    await saveGarden(addPlant(g, 'row3-a', 'rose', NOW, 'fixed'));
    expect((await loadGarden(NOW)).plants.some((p) => p.id === 'fixed')).toBe(true);
  });

  it('sets a corrupted save aside and starts fresh', async () => {
    await saveGarden({ nonsense: true } as never);
    const g = await loadGarden(NOW);
    expect(g.version).toBe(SAVE_VERSION);
    expect((await savedKeys()).some((k) => String(k).startsWith('corrupt-'))).toBe(true);
  });

  it('keeps her pictures apart from the save, and tidies away the ones nothing uses', async () => {
    await putImage('a', new Blob(['tile'], { type: 'image/png' }));
    await putImage('b', new Blob(['photo'], { type: 'image/jpeg' }));
    expect(await (await getImage('a'))?.text()).toBe('tile');
    await tidyImages(new Set(['a']));
    expect(await getImage('b')).toBeNull();
    expect(await getImage('a')).not.toBeNull();
    await deleteImage('a');
    expect(await getImage('a')).toBeNull();
    // the garden save itself is untouched
    expect(await savedKeys()).toContain('garden');
  });
});
