import { parseSave, starterGarden, type GardenState } from './state';

const DB_NAME = 'olcias-garden';
const STORE = 'saves';
/** Her own pictures, kept apart from the garden save so the save stays small and quick. */
const IMAGES = 'images';
const STORES = [STORE, IMAGES];
const KEY = 'garden';

/** Opens the database; if it exists without one of its stores (an older version), bumps the version to add it. */
function openDb(version?: number): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = version ? indexedDB.open(DB_NAME, version) : indexedDB.open(DB_NAME);
    req.onupgradeneeded = () => {
      for (const name of STORES) if (!req.result.objectStoreNames.contains(name)) req.result.createObjectStore(name);
    };
    req.onsuccess = () => {
      const db = req.result;
      if (STORES.every((name) => db.objectStoreNames.contains(name))) return resolve(db);
      const next = db.version + 1;
      db.close();
      openDb(next).then(resolve, reject);
    };
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>, store = STORE): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const req = fn(tx.objectStore(store));
    tx.oncomplete = () => {
      db.close();
      resolve(req.result);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

/**
 * Loads the garden. With no save yet, the starter garden opens; an unreadable save is copied aside
 * (never silently deleted) before starting fresh. If IndexedDB is unavailable the garden still
 * opens, it just won't be remembered.
 */
export async function loadGarden(now = Date.now()): Promise<GardenState> {
  try {
    const raw = await run('readonly', (s) => s.get(KEY));
    if (raw === undefined) return starterGarden(now);
    const parsed = parseSave(raw);
    if (parsed) return parsed;
    await run('readwrite', (s) => s.put(raw, `corrupt-${now}`));
    return starterGarden(now);
  } catch {
    return starterGarden(now);
  }
}

/** Asks the browser not to clear the garden when the phone runs low on space. Harmless if refused. */
export async function persistStorage(): Promise<void> {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist();
  } catch {
    // not supported: the garden still saves, just without the extra promise
  }
}

export async function saveGarden(state: GardenState): Promise<void> {
  try {
    await run('readwrite', (s) => s.put(state, KEY));
  } catch {
    // Private browsing or blocked storage: keep going without saving.
  }
}

/** Keeps one of her pictures. Throws if it can't be stored, so she can be told rather than lose it quietly. */
export async function putImage(key: string, blob: Blob): Promise<void> {
  await run('readwrite', (s) => s.put(blob, key), IMAGES);
}

export async function getImage(key: string): Promise<Blob | null> {
  try {
    const v = await run('readonly', (s) => s.get(key), IMAGES);
    return v instanceof Blob ? v : null;
  } catch {
    return null;
  }
}

export async function deleteImage(key: string): Promise<void> {
  try {
    await run('readwrite', (s) => s.delete(key), IMAGES);
  } catch {
    // left behind; it's cleared the next time unused pictures are tidied away
  }
}

/** Removes pictures nothing uses any more, such as a wallpaper she has since replaced. */
export async function tidyImages(inUse: Set<string>): Promise<void> {
  try {
    const keys = await run('readonly', (s) => s.getAllKeys(), IMAGES);
    await Promise.all(keys.filter((k) => typeof k === 'string' && !inUse.has(k)).map((k) => deleteImage(k as string)));
  } catch {
    // nothing to tidy, or storage unavailable
  }
}
