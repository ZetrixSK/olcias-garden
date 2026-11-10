/**
 * "Ze świata": the Kurier's column of real news, written at dawn on the server from the day's
 * headlines and told through the town. This file has no imports so the server can use the very
 * same check before anything is kept: whatever comes back from the model is only data, and only
 * what passes here is ever printed.
 */

export type WorldPlace = 'szczecin' | 'polska' | 'swiat';
export type WorldItem = { place: WorldPlace; title: { pl: string; en: string }; body: { pl: string; en: string } };

const PLACES: WorldPlace[] = ['szczecin', 'polska', 'swiat'];

/** Words that mean the news is not for a morning garden paper. Checked in both languages. */
const GRIM = [
  'zgin', 'zabit', 'zabój', 'śmier', 'zmarł', 'nie żyje', 'wojn', 'zamach', 'ofiar', 'katastrof', 'wypadk', 'wypadek', 'pożar', 'morder', 'terror', 'strzelan', 'bomb', 'gwałt', 'samobój', 'pogrzeb', 'żałob',
  'killed', 'dead', 'death', 'died', 'war ', 'warfare', 'attack', 'victim', 'murder', 'crash', 'terror', 'shooting', 'bomb', 'funeral', 'suicide', 'mourning',
];

const LIMITS = { title: [6, 110], body: [50, 480] } as const;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

function cleanText(v: unknown, [lo, hi]: readonly [number, number]): string | null {
  if (typeof v !== 'string') return null;
  const s = v.replace(/\s+/g, ' ').trim();
  if (s.length < lo || s.length > hi) return null;
  // no links, no markup, no instructions sneaking through
  if (/https?:|www\.|<[a-z/]|```|\{|\}/i.test(s)) return null;
  return s;
}

const grim = (s: string) => {
  const low = s.toLowerCase();
  return GRIM.some((g) => low.includes(g));
};

/** One item if it's usable as it is, or null. */
export function checkItem(v: unknown): WorldItem | null {
  if (!isObj(v) || !isObj(v.title) || !isObj(v.body)) return null;
  const place = PLACES.includes(v.place as WorldPlace) ? (v.place as WorldPlace) : null;
  const t = { pl: cleanText(v.title.pl, LIMITS.title), en: cleanText(v.title.en, LIMITS.title) };
  const b = { pl: cleanText(v.body.pl, LIMITS.body), en: cleanText(v.body.en, LIMITS.body) };
  if (!place || !t.pl || !t.en || !b.pl || !b.en) return null;
  if ([t.pl, t.en, b.pl, b.en].some(grim)) return null;
  return { place, title: { pl: t.pl, en: t.en }, body: { pl: b.pl, en: b.en } };
}

/**
 * The column as it may be printed: two or three good items, at most one from Szczecin first.
 * Null if fewer than two pass, so the paper uses its stand-in instead.
 */
export function checkWorld(v: unknown): WorldItem[] | null {
  const raw = isObj(v) && Array.isArray(v.items) ? v.items : Array.isArray(v) ? v : null;
  if (!raw) return null;
  const ok = raw.map(checkItem).filter((x): x is WorldItem => x !== null);
  const local = ok.filter((x) => x.place === 'szczecin').slice(0, 1);
  const rest = ok.filter((x) => x.place !== 'szczecin');
  const items = [...local, ...rest].slice(0, 3);
  return items.length >= 2 ? items : null;
}
