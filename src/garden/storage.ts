import { parseSave, starterGarden, type GardenState } from './state';

const DB_NAME = 'olcias-garden';
const STORE = 'saves';
const KEY = 'garden';

/** Opens the database; if it somehow exists without its store, bumps the version to create it. */
function openDb(version?: number): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = version ? indexedDB.open(DB_NAME, version) : indexedDB.open(DB_NAME);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => {
      const db = req.result;
      if (db.objectStoreNames.contains(STORE)) return resolve(db);
      const next = db.version + 1;
      db.close();
      openDb(next).then(resolve, reject);
    };
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
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
