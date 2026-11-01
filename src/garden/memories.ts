/**
 * Her memories: photos from her gallery and pictures she painted, gathered into albums she names
 * and marks with a little stamp. The pictures themselves live in the images store (each with a
 * small copy for the album pages); the save only keeps what they are and where they belong.
 * Memories never leave the phone except in her own backup file.
 */
export type MemoryKind = 'photo' | 'painting';
/** What a painting was painted on; null is no paper at all, so it can stand on a shelf. */
export type PaperId = 'cream' | 'white' | 'ink' | 'blush';
export type Memory = {
  id: string;
  kind: MemoryKind;
  img: string;
  thumb: string;
  w: number;
  h: number;
  /** When the photo was taken (or the painting finished), as far as can be told. */
  at: number;
  caption: string;
  /** The albums it is in; it is always in "All memories" too. */
  albums: string[];
  /** Marked with a heart. */
  fav: boolean;
  /** For a painting: the paper under it, so it can be painted on again later. */
  paper: PaperId | null;
};

export const STAMPS = [
  'heart', 'star', 'pansy', 'paw', 'moon', 'sun', 'house', 'cake',
  'gift', 'music', 'leaf', 'snow', 'pumpkin', 'camera', 'bow', 'cup',
] as const;
export type Stamp = (typeof STAMPS)[number];
export const COVERS = ['rose', 'ink', 'sage', 'plum', 'sky', 'linen'] as const;
export type Cover = (typeof COVERS)[number];
export type Album = { id: string; name: string; stamp: Stamp; cover: Cover; created: number };

export type Memories = { albums: Album[]; items: Memory[] };
export const NO_MEMORIES: Memories = { albums: [], items: [] };

export const PAPERS: readonly PaperId[] = ['cream', 'white', 'blush', 'ink'];
export const MAX_MEMORIES = 1000;
export const MAX_ALBUMS = 60;
export const MAX_CAPTION = 400;
export const MAX_ALBUM_NAME = 32;
/** Longest side kept, in pixels: photos sharp enough to fill the phone, and the small copies for the pages. */
export const MEMORY_PIXELS = { photo: 1600, thumb: 360 } as const;

/** The shelves of the album that aren't albums of hers: everything, and the ones with a heart. */
export const ALL = 'all';
export const HEARTS = 'hearts';

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isKey = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length < 100;
const isSize = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0 && v <= 10_000;
const isTime = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0;

function parseAlbum(v: unknown): Album | null {
  if (!isObj(v) || !isKey(v.id) || typeof v.name !== 'string') return null;
  return {
    id: v.id,
    name: v.name.slice(0, MAX_ALBUM_NAME),
    stamp: STAMPS.includes(v.stamp as Stamp) ? (v.stamp as Stamp) : 'heart',
    cover: COVERS.includes(v.cover as Cover) ? (v.cover as Cover) : 'rose',
    created: isTime(v.created) ? v.created : 0,
  };
}

function parseMemory(v: unknown, albums: Set<string>): Memory | null {
  if (!isObj(v) || !isKey(v.id) || !isKey(v.img) || !isSize(v.w) || !isSize(v.h)) return null;
  const kind: MemoryKind = v.kind === 'painting' ? 'painting' : 'photo';
  return {
    id: v.id,
    kind,
    img: v.img,
    thumb: isKey(v.thumb) ? v.thumb : v.img,
    w: v.w,
    h: v.h,
    at: isTime(v.at) ? v.at : 0,
    caption: typeof v.caption === 'string' ? v.caption.slice(0, MAX_CAPTION) : '',
    albums: Array.isArray(v.albums) ? [...new Set(v.albums.filter((a): a is string => typeof a === 'string' && albums.has(a)))] : [],
    fav: v.fav === true,
    paper: kind === 'painting' && PAPERS.includes(v.paper as PaperId) ? (v.paper as PaperId) : null,
  };
}

/** Reads saved memories; anything broken is left out on its own, and albums that are gone are forgotten. */
export function parseMemories(v: unknown): Memories {
  if (!isObj(v)) return NO_MEMORIES;
  const albums: Album[] = [];
  for (const a of Array.isArray(v.albums) ? v.albums : []) {
    const album = parseAlbum(a);
    if (album && !albums.some((x) => x.id === album.id) && albums.length < MAX_ALBUMS) albums.push(album);
  }
  const ids = new Set(albums.map((a) => a.id));
  const items: Memory[] = [];
  const seen = new Set<string>();
  for (const m of Array.isArray(v.items) ? v.items : []) {
    const memory = parseMemory(m, ids);
    if (memory && !seen.has(memory.id) && items.length < MAX_MEMORIES) {
      seen.add(memory.id);
      items.push(memory);
    }
  }
  return { albums, items };
}

/** Every picture the memories use, both sizes. */
export function memoryImages(m: Memories): Set<string> {
  const used = new Set<string>();
  for (const x of m.items) {
    used.add(x.img);
    used.add(x.thumb);
  }
  return used;
}

/** What one shelf of the album holds, newest first. */
export function inAlbum(m: Memories, album: string): Memory[] {
  const items = album === ALL ? m.items : album === HEARTS ? m.items.filter((x) => x.fav) : m.items.filter((x) => x.albums.includes(album));
  return [...items].sort((a, b) => b.at - a.at);
}

export const roomFor = (m: Memories) => MAX_MEMORIES - m.items.length;

/** Adds new memories (as many as there's room for), into an album if they were added from one. */
export function addMemories(m: Memories, items: Memory[]): Memories {
  const fits = items.slice(0, Math.max(0, roomFor(m)));
  return { ...m, items: [...m.items, ...fits] };
}

export function editMemory(m: Memories, id: string, patch: Partial<Pick<Memory, 'caption' | 'fav' | 'img' | 'thumb' | 'w' | 'h' | 'at' | 'paper'>>): Memories {
  const p = patch.caption === undefined ? patch : { ...patch, caption: patch.caption.slice(0, MAX_CAPTION) };
  return { ...m, items: m.items.map((x) => (x.id === id ? { ...x, ...p } : x)) };
}

/** Puts memories into an album, or takes them out of it. */
export function fileMemories(m: Memories, ids: string[], album: string, into: boolean): Memories {
  if (!m.albums.some((a) => a.id === album)) return m;
  const chosen = new Set(ids);
  return {
    ...m,
    items: m.items.map((x) => {
      if (!chosen.has(x.id)) return x;
      const has = x.albums.includes(album);
      if (into === has) return x;
      return { ...x, albums: into ? [...x.albums, album] : x.albums.filter((a) => a !== album) };
    }),
  };
}

/** Takes memories out for good; hands back the pictures nothing else uses, to clear away. */
export function removeMemories(m: Memories, ids: string[]): { memories: Memories; unused: string[] } {
  const gone = new Set(ids);
  const memories = { ...m, items: m.items.filter((x) => !gone.has(x.id)) };
  const still = memoryImages(memories);
  const unused = [...memoryImages({ albums: [], items: m.items.filter((x) => gone.has(x.id)) })].filter((k) => !still.has(k));
  return { memories, unused };
}

export function saveAlbum(m: Memories, album: Album): Memories {
  const clean = { ...album, name: album.name.trim().slice(0, MAX_ALBUM_NAME) };
  if (m.albums.some((a) => a.id === album.id)) return { ...m, albums: m.albums.map((a) => (a.id === album.id ? clean : a)) };
  if (m.albums.length >= MAX_ALBUMS) return m;
  return { ...m, albums: [...m.albums, clean] };
}

/** Takes an album away; the pictures in it stay in "All memories". */
export function removeAlbum(m: Memories, id: string): Memories {
  return {
    albums: m.albums.filter((a) => a.id !== id),
    items: m.items.map((x) => (x.albums.includes(id) ? { ...x, albums: x.albums.filter((a) => a !== id) } : x)),
  };
}

/**
 * When a JPEG photo was taken, read from the camera's own note inside the file (EXIF
 * DateTimeOriginal), as local time. Null if the file doesn't say.
 */
export function photoTakenAt(bytes: Uint8Array): number | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 4 || view.getUint16(0) !== 0xffd8) return null;
  let p = 2;
  while (p + 4 <= bytes.length) {
    if (bytes[p] !== 0xff) return null;
    const marker = bytes[p + 1]!;
    const len = view.getUint16(p + 2);
    if (marker === 0xe1 && p + 10 <= bytes.length && view.getUint32(p + 4) === 0x45786966) return readExif(view, p + 10, Math.min(bytes.length, p + 2 + len));
    if (marker === 0xda) return null;
    p += 2 + len;
  }
  return null;
}

function readExif(view: DataView, tiff: number, end: number): number | null {
  if (tiff + 8 > end) return null;
  const little = view.getUint16(tiff) === 0x4949;
  const u16 = (at: number) => view.getUint16(at, little);
  const u32 = (at: number) => view.getUint32(at, little);
  /** Looks through one directory for a tag, and returns where its value is. */
  const find = (dir: number, tag: number): { type: number; count: number; at: number } | null => {
    if (dir + 2 > end) return null;
    const n = u16(dir);
    for (let i = 0; i < n; i++) {
      const e = dir + 2 + i * 12;
      if (e + 12 > end) return null;
      if (u16(e) !== tag) continue;
      const type = u16(e + 2);
      const count = u32(e + 4);
      return { type, count, at: type === 2 && count > 4 ? tiff + u32(e + 8) : e + 8 };
    }
    return null;
  };
  const text = (entry: { type: number; count: number; at: number } | null): string | null => {
    if (!entry || entry.type !== 2 || entry.at + entry.count > end) return null;
    let s = '';
    for (let i = 0; i < entry.count - 1; i++) s += String.fromCharCode(view.getUint8(entry.at + i));
    return s;
  };
  const ifd0 = tiff + u32(tiff + 4);
  const exifPtr = find(ifd0, 0x8769);
  const fromExif = exifPtr ? text(find(tiff + u32(exifPtr.at), 0x9003)) : null;
  const s = fromExif ?? text(find(ifd0, 0x0132));
  const m = s ? /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/.exec(s) : null;
  if (!m) return null;
  const t = new Date(+m[1]!, +m[2]! - 1, +m[3]!, +m[4]!, +m[5]!, +m[6]!).getTime();
  return Number.isFinite(t) && t > 0 ? t : null;
}
