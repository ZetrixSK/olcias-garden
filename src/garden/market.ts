import { dayKey } from './diary';
import type { PansyDesign } from './designs';
import { VASES, type Vase } from './bouquets';
import { SPECIES_IDS, type SpeciesId } from './species';
import { GIFT_RIBBONS, type Visitors } from './visitors';

/**
 * The market. Petals, which visitors give for bouquets, are what she pays with; they never run
 * out or expire, and nothing here needs doing on any particular day.
 *
 * By day Pan Jeżyk keeps a seed stall: four packets each morning, the same all day. On weekend
 * nights (Friday dusk to Monday dawn) Pani Ćma sets out four face-down cards with trinkets to
 * collect; she only ever shows ones not owned yet, so the collection fills up over the weeks.
 * At the first night market there's a fifth card that isn't for sale: Milton, who goes to live in
 * the dogs' bed.
 */

export const RARITIES = ['common', 'uncommon', 'rare', 'veryrare', 'legendary'] as const;
export type Rarity = (typeof RARITIES)[number];

/** She starts with a few, to try the market. */
export const START_PETALS = 10;
export const MAX_PETALS = 9999;

// ---- the day stall: seeds -----------------------------------------------------------------

/** The bratki only the market sells; the rarest have patterns the designer doesn't have. */
const pansy = (id: string, name: string, top: string, low: string, face: PansyDesign['face'], faceColor: string, edge: string | null, pattern?: PansyDesign['pattern']): PansyDesign => ({
  id: `market-${id}`,
  name,
  top,
  low,
  face,
  faceColor,
  edge,
  ...(pattern ? { pattern } : {}),
});

export const MARKET_PANSIES: Array<{ design: PansyDesign; rarity: Rarity }> = [
  { design: pansy('malina', 'Malinowa mgła', '#c94d79', '#f4c2d3', 'blotch', '#5a1730', null), rarity: 'common' },
  { design: pansy('maslo', 'Masełko', '#f7e3a0', '#fff4cf', 'whiskers', '#8a5a2a', null), rarity: 'common' },
  { design: pansy('morze', 'Morska pianka', '#7fa3d6', '#dbe7f6', 'whiskers', '#2a3a6a', '#ffffff'), rarity: 'common' },
  { design: pansy('polnoc', 'Północ', '#1b1530', '#3a2c5c', 'clear', '#1b1530', '#c9a45c'), rarity: 'uncommon' },
  { design: pansy('brzoskwinia', 'Brzoskwinka', '#f3a27c', '#fbd7bf', 'blotch', '#7a2f2a', null), rarity: 'uncommon' },
  { design: pansy('zloty', 'Złoty brzeg', '#5b2a6e', '#8f5bb0', 'whiskers', '#1c0f24', '#e9c24a'), rarity: 'rare' },
  { design: pansy('piegi', 'Piegusek', '#f2b8cb', '#fbe6ee', 'clear', '#8a2f55', null, 'speckle'), rarity: 'veryrare' },
  { design: pansy('paski', 'Cukierek', '#fbf2f5', '#f6d3e0', 'whiskers', '#c0435f', null, 'stripe'), rarity: 'veryrare' },
  { design: pansy('gwiazda', 'Gwiaździsta noc', '#1f1a3a', '#2f2a56', 'clear', '#1f1a3a', null, 'star'), rarity: 'veryrare' },
];

/** Flowers she can't plant yet, by how hard they are to come by. */
const SPECIES_RARITY: Partial<Record<SpeciesId, Rarity>> = {
  snowdrop: 'uncommon',
  cyclamen: 'uncommon',
  hellebore: 'uncommon',
  pumpkin: 'uncommon',
  hollyhock: 'rare',
  batflower: 'rare',
  moonflower: 'rare',
};

export type SeedItem =
  | { id: string; kind: 'species'; species: SpeciesId; rarity: Rarity }
  | { id: string; kind: 'pansy'; design: PansyDesign; rarity: Rarity }
  | { id: string; kind: 'ribbon'; color: string; rarity: Rarity }
  | { id: string; kind: 'vase'; vase: Vase; rarity: Rarity };

export const DAY_PRICE: Record<Rarity, number> = { common: 3, uncommon: 6, rare: 12, veryrare: 20, legendary: 30 };
export const NIGHT_PRICE: Record<Rarity, number> = { common: 5, uncommon: 8, rare: 12, veryrare: 16, legendary: 25 };
/** How often each rarity turns up, compared to the others. */
const WEIGHT: Record<Rarity, number> = { common: 10, uncommon: 6, rare: 3, veryrare: 1.2, legendary: 0.7 };

/** Everything the stall could sell her now: flowers she can't plant yet, its bratki, gift ribbons and vases she hasn't got. */
export function seedPool(v: Pick<Visitors, 'unlocked' | 'ribbons' | 'vases'>, designs: PansyDesign[]): SeedItem[] {
  const out: SeedItem[] = [];
  for (const s of SPECIES_IDS) {
    const rarity = SPECIES_RARITY[s];
    if (rarity && !v.unlocked.includes(s)) out.push({ id: `species:${s}`, kind: 'species', species: s, rarity });
  }
  for (const p of MARKET_PANSIES) out.push({ id: `pansy:${p.design.id}`, kind: 'pansy', design: p.design, rarity: p.rarity });
  for (const color of Object.values(GIFT_RIBBONS)) if (!v.ribbons.includes(color)) out.push({ id: `ribbon:${color}`, kind: 'ribbon', color, rarity: 'common' });
  for (const vase of VASES) if (!['jar', 'jug', 'bottle'].includes(vase) && !v.vases.includes(vase)) out.push({ id: `vase:${vase}`, kind: 'vase', vase, rarity: 'uncommon' });
  // a bratek she already grows from the market is still for sale, but a little less often
  return out.filter((x) => x.kind !== 'pansy' || !designs.some((d) => d.id === x.design.id) || x.rarity !== 'common');
}

// ---- the night stall: trinkets ------------------------------------------------------------

/** Charms hang on the string across the window; figures stand on the shelves. */
export type TrinketKind = 'charm' | 'figure';
export type Trinket = { id: string; kind: TrinketKind; rarity: Rarity };

export const TRINKETS: Trinket[] = [
  { id: 'mushroom', kind: 'charm', rarity: 'common' },
  { id: 'moon', kind: 'charm', rarity: 'common' },
  { id: 'cherries', kind: 'charm', rarity: 'common' },
  { id: 'key', kind: 'charm', rarity: 'common' },
  { id: 'star', kind: 'charm', rarity: 'common' },
  { id: 'padlock', kind: 'charm', rarity: 'uncommon' },
  { id: 'bat', kind: 'charm', rarity: 'uncommon' },
  { id: 'cauldron', kind: 'charm', rarity: 'uncommon' },
  { id: 'pansy', kind: 'charm', rarity: 'uncommon' },
  { id: 'bee', kind: 'charm', rarity: 'rare' },
  { id: 'hat', kind: 'charm', rarity: 'rare' },
  { id: 'crystal', kind: 'charm', rarity: 'rare' },
  { id: 'snail', kind: 'figure', rarity: 'common' },
  { id: 'candles', kind: 'figure', rarity: 'common' },
  { id: 'teapot', kind: 'figure', rarity: 'common' },
  { id: 'toadstool', kind: 'figure', rarity: 'uncommon' },
  { id: 'geode', kind: 'figure', rarity: 'uncommon' },
  { id: 'sleepybat', kind: 'figure', rarity: 'rare' },
  { id: 'hourglass', kind: 'figure', rarity: 'rare' },
  { id: 'piorun', kind: 'figure', rarity: 'veryrare' },
  { id: 'bajzel', kind: 'figure', rarity: 'veryrare' },
  { id: 'musicbox', kind: 'figure', rarity: 'legendary' },
  { id: 'snowglobe', kind: 'figure', rarity: 'legendary' },
  { id: 'moonlamp', kind: 'figure', rarity: 'legendary' },
];
export const trinket = (id: string) => TRINKETS.find((t) => t.id === id);
export const MILTON = 'milton';
/** Up to this many charms hang on the string at once. */
export const MAX_GARLAND = 7;
const CARDS = 4;

// ---- state --------------------------------------------------------------------------------

export type Market = {
  petals: number;
  /** Today's stall, written down the first time she looks, so it's the same all day. */
  day: { key: string; items: SeedItem[]; bought: string[] } | null;
  /** This weekend's cards: which, which she has turned over, which she has bought. */
  night: { key: string; cards: string[]; turned: boolean[]; bought: string[] } | null;
  /** Trinkets she owns. */
  owned: string[];
  /** The charms hanging on the string, left to right. */
  garland: string[];
  /** Figures standing on the shelves, and where. */
  figures: Array<{ id: string; slot: string }>;
  /** Whether Milton has come to her; he lives in the dogs' bed. */
  milton: boolean;
  /** The admin page can open the night market for a while, to try it. */
  nightUntil: number;
};

export function noMarket(): Market {
  return { petals: START_PETALS, day: null, night: null, owned: [], garland: [], figures: [], milton: false, nightUntil: 0 };
}

/** A small seeded dice, so a day's stall or a weekend's cards come out the same each time. */
function dice(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  let s = h >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function draw<T extends { rarity: Rarity }>(pool: T[], n: number, rand: () => number): T[] {
  const left = [...pool];
  const out: T[] = [];
  while (out.length < n && left.length > 0) {
    const total = left.reduce((a, x) => a + WEIGHT[x.rarity], 0);
    let r = rand() * total;
    const i = Math.max(0, left.findIndex((x) => (r -= WEIGHT[x.rarity]) < 0));
    out.push(left.splice(i === -1 ? 0 : i, 1)[0]!);
  }
  return out;
}

/** Whether the day stall is open: while it's light. */
export const dayOpen = (night: boolean) => !night;

/**
 * The weekend a night market belongs to (its Friday, as a date), if one is open now: from dusk on
 * Friday until dawn on Monday, whenever it's dark. Null when it isn't.
 */
export function nightMarketKey(now: number, night: boolean, m?: Pick<Market, 'nightUntil'>): string | null {
  const d = new Date(now);
  const evening = new Date(d);
  if (d.getHours() < 12) evening.setDate(evening.getDate() - 1);
  const wd = evening.getDay();
  const friday = new Date(evening);
  friday.setDate(friday.getDate() - ((wd + 2) % 7));
  if (m && m.nightUntil > now) return dayKey(friday);
  if (!night || ![5, 6, 0].includes(wd)) return null;
  return dayKey(friday);
}

/** Today's stall, made the first time she looks today. */
export function openDayStall(m: Market, now: number, v: Pick<Visitors, 'unlocked' | 'ribbons' | 'vases'>, designs: PansyDesign[]): Market {
  const key = dayKey(new Date(now));
  if (m.day?.key === key) return m;
  return { ...m, day: { key, items: draw(seedPool(v, designs), 4, dice(`day:${key}`)), bought: [] } };
}

/** This weekend's cards, laid out the first time she comes; Milton's waits beside them the first time of all. */
export function openNightStall(m: Market, key: string): Market {
  if (m.night?.key === key) return m;
  const pool = TRINKETS.filter((t) => !m.owned.includes(t.id));
  const cards = draw(pool, CARDS, dice(`night:${key}:${m.owned.length}`)).map((t) => t.id);
  if (!m.milton) cards.push(MILTON);
  return { ...m, night: { key, cards, turned: cards.map(() => false), bought: [] } };
}

export function turnCard(m: Market, i: number): Market {
  if (!m.night || i < 0 || i >= m.night.cards.length || m.night.turned[i]) return m;
  return { ...m, night: { ...m.night, turned: m.night.turned.map((t, k) => t || k === i) } };
}

export const priceOf = (item: SeedItem) => DAY_PRICE[item.rarity];
export const trinketPrice = (id: string) => (id === MILTON ? 0 : NIGHT_PRICE[trinket(id)?.rarity ?? 'common']);

/** Buys a packet from the day stall; null if it's sold, gone, or there aren't enough petals. */
export function buySeed(m: Market, id: string): { market: Market; item: SeedItem } | null {
  const item = m.day?.items.find((x) => x.id === id);
  if (!m.day || !item || m.day.bought.includes(id) || m.petals < priceOf(item)) return null;
  return { market: { ...m, petals: m.petals - priceOf(item), day: { ...m.day, bought: [...m.day.bought, id] } }, item };
}

/** Buys a turned-over card's trinket (Milton is free, and goes to the dogs' bed); a figure stands on a free shelf if there is one. */
export function buyTrinket(m: Market, id: string, freeSlot: string | null): Market | null {
  if (!m.night) return null;
  const i = m.night.cards.indexOf(id);
  if (i < 0 || !m.night.turned[i] || m.night.bought.includes(id)) return null;
  const price = trinketPrice(id);
  if (m.petals < price) return null;
  const isMilton = id === MILTON;
  const t = trinket(id);
  let next: Market = { ...m, petals: m.petals - price, night: { ...m.night, bought: [...m.night.bought, id] } };
  if (isMilton) next = { ...next, milton: true };
  else next = { ...next, owned: next.owned.includes(id) ? next.owned : [...next.owned, id] };
  // a new charm goes straight on the string if there's room; a figure onto a free shelf
  if (t?.kind === 'charm' && next.garland.length < MAX_GARLAND) next = { ...next, garland: [...next.garland, id] };
  if (t?.kind === 'figure' && freeSlot) next = { ...next, figures: [...next.figures, { id, slot: freeSlot }] };
  return next;
}

export function earnPetals(m: Market, n: number): Market {
  return { ...m, petals: Math.min(MAX_PETALS, m.petals + Math.max(0, Math.round(n))) };
}

/** Hangs a charm on the string, or takes it off. */
export function toggleCharm(m: Market, id: string): Market {
  if (m.garland.includes(id)) return { ...m, garland: m.garland.filter((x) => x !== id) };
  if (!m.owned.includes(id) || trinket(id)?.kind !== 'charm' || m.garland.length >= MAX_GARLAND) return m;
  return { ...m, garland: [...m.garland, id] };
}

/** Stands a figure on a shelf, or puts it back in the box (`slot: null`). */
export function placeFigure(m: Market, id: string, slot: string | null): Market {
  const others = m.figures.filter((f) => f.id !== id);
  if (slot === null) return { ...m, figures: others };
  if (!m.owned.includes(id) || trinket(id)?.kind !== 'figure') return m;
  return { ...m, figures: [...others, { id, slot }] };
}

// ---- reading ------------------------------------------------------------------------------

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const KEY = /^\d{4}-\d{2}-\d{2}$/;

function parseSeedItem(v: unknown): SeedItem | null {
  if (!isObj(v) || typeof v.id !== 'string' || !(RARITIES as readonly unknown[]).includes(v.rarity)) return null;
  const rarity = v.rarity as Rarity;
  if (v.kind === 'species' && SPECIES_IDS.includes(v.species as SpeciesId)) return { id: v.id, kind: 'species', species: v.species as SpeciesId, rarity };
  if (v.kind === 'pansy') {
    const known = MARKET_PANSIES.find((p) => isObj(v.design) && p.design.id === v.design.id);
    return known ? { id: v.id, kind: 'pansy', design: known.design, rarity } : null;
  }
  if (v.kind === 'ribbon' && (Object.values(GIFT_RIBBONS) as unknown[]).includes(v.color)) return { id: v.id, kind: 'ribbon', color: v.color as string, rarity };
  if (v.kind === 'vase' && (VASES as readonly unknown[]).includes(v.vase)) return { id: v.id, kind: 'vase', vase: v.vase as Vase, rarity };
  return null;
}

const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

/** Reads the market from a save; anything odd is let go. `shelfFree` says whether a figure may stand in a place. */
export function parseMarket(v: unknown, shelfFree: (slot: string) => boolean): Market {
  if (!isObj(v)) return noMarket();
  const owned = [...new Set(strings(v.owned).filter((id) => trinket(id)))];
  const milton = v.milton === true;
  const day = isObj(v.day) && typeof v.day.key === 'string' && KEY.test(v.day.key)
    ? { key: v.day.key, items: (Array.isArray(v.day.items) ? v.day.items : []).map(parseSeedItem).filter((x): x is SeedItem => x !== null).slice(0, 6), bought: strings(v.day.bought) }
    : null;
  let night: Market['night'] = null;
  if (isObj(v.night) && typeof v.night.key === 'string' && KEY.test(v.night.key)) {
    const cards = strings(v.night.cards).filter((id) => id === MILTON || trinket(id)).slice(0, 6);
    const turned = Array.isArray(v.night.turned) ? v.night.turned : [];
    night = { key: v.night.key, cards, turned: cards.map((_, i) => turned[i] === true), bought: strings(v.night.bought).filter((id) => cards.includes(id)) };
  }
  const taken = new Set<string>();
  const figures: Market['figures'] = [];
  for (const f of Array.isArray(v.figures) ? v.figures : []) {
    if (!isObj(f) || typeof f.id !== 'string' || typeof f.slot !== 'string') continue;
    const mine = owned.includes(f.id) && trinket(f.id)?.kind === 'figure';
    if (!mine || taken.has(f.slot) || figures.some((x) => x.id === f.id) || !shelfFree(f.slot)) continue;
    taken.add(f.slot);
    figures.push({ id: f.id, slot: f.slot });
  }
  const petals = typeof v.petals === 'number' && Number.isFinite(v.petals) ? Math.max(0, Math.min(MAX_PETALS, Math.floor(v.petals))) : START_PETALS;
  return {
    petals,
    day,
    night,
    owned,
    garland: [...new Set(strings(v.garland))].filter((id) => owned.includes(id) && trinket(id)?.kind === 'charm').slice(0, MAX_GARLAND),
    figures,
    milton,
    nightUntil: typeof v.nightUntil === 'number' && Number.isFinite(v.nightUntil) ? v.nightUntil : 0,
  };
}

