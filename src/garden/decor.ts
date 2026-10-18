/**
 * Her own pictures in the room: a wallpaper she drew, a photo in the frame on the wall, and
 * drawings standing on the shelves. The images themselves live in their own store (see images.ts);
 * the garden save only keeps which image goes where and its size in pixels.
 */
export type WallpaperSize = 's' | 'm' | 'l';
export type Wallpaper = { img: string; w: number; h: number; size: WallpaperSize; soft: boolean };
export type Photo = { img: string; w: number; h: number };
export type Drawing = { id: string; slot: string; img: string; w: number; h: number };

export type Decor = { wallpaper: Wallpaper | null; photo: Photo | null; drawings: Drawing[] };

export const NO_DECOR: Decor = { wallpaper: null, photo: null, drawings: [] };

/** How wide one repeat of her wallpaper is, in scene units (the screen is about 400 wide). */
export const TILE_WIDTH: Record<WallpaperSize, number> = { s: 60, m: 100, l: 160 };

/** The largest image kept, longest side in pixels. Anything bigger is scaled down when it's added. */
export const MAX_PIXELS = { wallpaper: 1024, photo: 1200, drawing: 900 } as const;

export const MAX_DRAWINGS = 12;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isSize = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0 && v <= 10_000;
const isImg = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length < 100;

function parseWallpaper(v: unknown): Wallpaper | null {
  if (!isObj(v) || !isImg(v.img) || !isSize(v.w) || !isSize(v.h)) return null;
  const size = v.size === 's' || v.size === 'l' ? v.size : 'm';
  return { img: v.img, w: v.w, h: v.h, size, soft: v.soft === true };
}

function parsePhoto(v: unknown): Photo | null {
  if (!isObj(v) || !isImg(v.img) || !isSize(v.w) || !isSize(v.h)) return null;
  return { img: v.img, w: v.w, h: v.h };
}

/** Reads saved decorations; drawings on a slot that's taken (or unknown) are dropped. */
export function parseDecor(v: unknown, freeSlot: (slot: string) => boolean): Decor {
  const d = isObj(v) ? v : {};
  const taken = new Set<string>();
  const drawings: Drawing[] = [];
  for (const x of Array.isArray(d.drawings) ? d.drawings : []) {
    if (!isObj(x) || typeof x.id !== 'string' || typeof x.slot !== 'string' || !isImg(x.img) || !isSize(x.w) || !isSize(x.h)) continue;
    if (!freeSlot(x.slot) || taken.has(x.slot) || drawings.length >= MAX_DRAWINGS) continue;
    taken.add(x.slot);
    drawings.push({ id: x.id, slot: x.slot, img: x.img, w: x.w, h: x.h });
  }
  return { wallpaper: parseWallpaper(d.wallpaper), photo: parsePhoto(d.photo), drawings };
}

/** Every image the decorations still use, so images nothing points to can be cleared away. */
export function imagesInUse(decor: Decor): Set<string> {
  const used = new Set(decor.drawings.map((d) => d.img));
  if (decor.wallpaper) used.add(decor.wallpaper.img);
  if (decor.photo) used.add(decor.photo.img);
  return used;
}
