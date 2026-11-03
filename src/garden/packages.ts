import { parseBouquet, type Bouquet } from './bouquets';
import { parsePansy, type PansyDesign } from './designs';

/**
 * Packages: a parcel sent by tag, with a letter and up to six things inside (bouquets, seeds of a
 * design). Seeds can be sent as a mystery: a plain packet, no picture and no name, so she only finds
 * out what they are when they flower. A package waits in her post box, unopened, until she opens it: the letter first, then what's inside.
 */
export const MAX_ITEMS = 6;
export const MAX_LETTER = 800;
/** Packages kept: the ones still waiting, and opened ones, so their letters can be read again. */
export const MAX_PACKAGES = 40;

export type PackageItem =
  | { kind: 'bouquet'; bouquet: Bouquet }
  /** Seeds of a bratek design: the design travels with them, so they grow into it anywhere. */
  | { kind: 'seeds'; design: PansyDesign; count: number; mystery: boolean };

export type Package = {
  id: string;
  /** Who sent it; null only if the post didn't say. */
  from: string | null;
  letter: string;
  items: PackageItem[];
  at: number;
  /** When she opened it; null while it's still wrapped. */
  opened: number | null;
};

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const TAG = /^[a-z0-9_]{3,20}$/;

function parseItem(v: unknown, id: string, i: number, from: string | null, at: number): PackageItem | null {
  if (!isObj(v)) return null;
  if (v.kind === 'bouquet') {
    const bouquet = parseBouquet({ ...(isObj(v.bouquet) ? v.bouquet : {}), id: `${id}:${i}`, from, at });
    return bouquet ? { kind: 'bouquet', bouquet } : null;
  }
  if (v.kind === 'seeds') {
    const design = parsePansy(v.design);
    const count = typeof v.count === 'number' && Number.isFinite(v.count) ? Math.round(v.count) : 0;
    return design && count >= 1 ? { kind: 'seeds', design, count: Math.min(6, count), mystery: v.mystery === true } : null;
  }
  return null;
}

/**
 * Reads a package, from the post or from her save, without trusting anything in it. Null if
 * there's nothing in it to give (no letter and nothing that could be read).
 */
export function parsePackage(v: unknown): Package | null {
  if (!isObj(v) || typeof v.id !== 'string' || !v.id || v.id.length > 64) return null;
  const at = typeof v.at === 'number' && Number.isFinite(v.at) && v.at > 0 ? v.at : Date.now();
  const from = typeof v.from === 'string' && TAG.test(v.from) ? v.from : null;
  const items = (Array.isArray(v.items) ? v.items : [])
    .slice(0, MAX_ITEMS)
    .map((x, i) => parseItem(x, v.id as string, i, from, at))
    .filter((x): x is PackageItem => x !== null);
  const letter = typeof v.letter === 'string' ? v.letter.slice(0, MAX_LETTER) : '';
  if (items.length === 0 && !letter.trim()) return null;
  const opened = typeof v.opened === 'number' && Number.isFinite(v.opened) && v.opened > 0 ? v.opened : null;
  return { id: v.id, from, letter, items, at, opened };
}

export function parsePackages(v: unknown): Package[] {
  const out: Package[] = [];
  for (const x of Array.isArray(v) ? v : []) {
    const p = parsePackage(x);
    if (p && !out.some((o) => o.id === p.id)) out.push(p);
  }
  return out.slice(-MAX_PACKAGES);
}

/** What travels in the post: what's inside and the letter, without anything only her garden knows. */
export function packagePayload(letter: string, items: PackageItem[]): unknown {
  return {
    letter: letter.slice(0, MAX_LETTER),
    items: items.slice(0, MAX_ITEMS).map((it) =>
      it.kind === 'bouquet'
        ? { kind: 'bouquet', bouquet: { stems: it.bouquet.stems, vase: it.bouquet.vase, ribbon: it.bouquet.ribbon, note: it.bouquet.note, seed: it.bouquet.seed } }
        : { kind: 'seeds', design: it.design, count: it.count, mystery: it.mystery },
    ),
  };
}

/** Keeps the newest packages, never dropping one that's still waiting to be opened. */
export function keepPackages(list: Package[]): Package[] {
  if (list.length <= MAX_PACKAGES) return list;
  const extra = list.length - MAX_PACKAGES;
  let dropped = 0;
  return list.filter((p) => (p.opened !== null && dropped < extra ? (dropped++, false) : true));
}

/** Two bratek designs that would look the same. */
export const sameLook = (a: PansyDesign, b: PansyDesign) =>
  a.top === b.top && a.low === b.low && a.face === b.face && a.faceColor === b.faceColor && (a.edge ?? null) === (b.edge ?? null) && (a.pattern ?? null) === (b.pattern ?? null);
