import { imagesInUse } from './decor';
import { parseSave, type GardenState } from './state';

/**
 * A backup is one plain file: the whole garden save, with her pictures written into it as text,
 * so it can be kept in Files, sent to herself, and restored on this phone or another one.
 */
const APP = 'olcias-garden';
const FORMAT = 1;

export type Restored = { garden: GardenState; images: Record<string, Blob>; exportedAt: number | null };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

async function toDataUrl(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:${blob.type || 'image/png'};base64,${btoa(bin)}`;
}

function fromDataUrl(url: string): Blob | null {
  const m = /^data:(image\/[\w.+-]+);base64,([A-Za-z0-9+/]*={0,2})$/.exec(url);
  if (!m) return null;
  try {
    const bin = atob(m[2]!);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: m[1] });
  } catch {
    return null;
  }
}

/** Writes the garden and every picture it uses into one backup file's text. */
export async function makeBackup(garden: GardenState, getImage: (key: string) => Promise<Blob | null>, now: number): Promise<string> {
  const images: Record<string, string> = {};
  for (const key of imagesInUse(garden.decor)) {
    const blob = await getImage(key);
    if (blob) images[key] = await toDataUrl(blob);
  }
  return JSON.stringify({ app: APP, format: FORMAT, exportedAt: now, garden, images });
}

/** Reads a backup file back; null if it isn't one, or its garden can't be read at all. */
export function readBackup(text: string, now: number): Restored | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isObj(raw) || raw.app !== APP) return null;
  const garden = parseSave(raw.garden, now);
  if (!garden) return null;
  const stored = isObj(raw.images) ? raw.images : {};
  const images: Record<string, Blob> = {};
  for (const key of imagesInUse(garden.decor)) {
    const v = stored[key];
    const blob = typeof v === 'string' ? fromDataUrl(v) : null;
    if (blob) images[key] = blob;
  }
  const at = raw.exportedAt;
  return { garden, images, exportedAt: typeof at === 'number' && Number.isFinite(at) && at > 0 ? at : null };
}

export function backupName(now: number): string {
  const d = new Date(now);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `olcias-garden-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
}

/** What's in a backup, to say before restoring it. */
export function backupSummary(r: Restored): string {
  const n = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;
  return [
    n(r.garden.plants.length, 'plant', 'plants'),
    n(Object.keys(r.garden.diary).length, 'diary page', 'diary pages'),
    n(r.garden.pressed.length, 'pressed flower', 'pressed flowers'),
    n(Object.keys(r.images).length, 'picture', 'pictures'),
  ].join(', ');
}
