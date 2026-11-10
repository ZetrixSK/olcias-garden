import { stageAt } from '../garden/growth';
import { SPECIES, type SpeciesId } from '../garden/species';
import type { GardenState, Plant } from '../garden/state';
import { plural, words, type Lang, type Me } from '../i18n';
import { moonPhase } from '../weather/moon';
import { sunTimes } from '../weather/sun';
import { VISITOR_NAME, RIBBON_NAMES } from '../ui/visitorWords';
import { TRINKET_NAME } from '../ui/marketWords';
import { designName } from '../ui/designNames';
import { holidaysOn, moonWords, nameDays, nextBigDay, nextMoon, nextShower, type L } from './calendar';
import { dayKeyOf, noteFor, yesterdayWindow, type PaperEvent } from './log';
import type { ArtKey, BeeLead, Headline, Piece, Vox, When } from './types';
import type { Actor, Shot } from './PaperArt';
import { PHOTOS, SHOTS } from './bank/shots';
import { FIRST_GARDEN_LINE, INTRO, LETTERBOX, mentionsBees, mentionsKurier, STRANGERS_DAYS } from './bank/intro';
import type { WorldItem, WorldPlace } from './world';
import { HEADLINES } from './bank/headlines';
import { SERIALS } from './bank/serials';
import { BEE_JABS, BEE_HOROSCOPES, BEE_STORIES, BUZZ, FLOWER_OF_WEEK } from './bank/bee';
import { ADS, GOSSIP, HOROSCOPES, LETTERS, RUMOURS, VOX, WEATHER_LINES } from './bank/small';
import { NO_NEWS, TOWN } from './bank/town';

/**
 * Builds the day's two papers: the Kurier Bratkowski and Brzęczyk. Everything comes from the date
 * (so a day's papers read the same all day, and on every phone), from her garden (what happened
 * yesterday, the flower of the week), and from the few things fetched or sent: the news column
 * and his note. Nothing here is random.
 */

function atNoon(y: number, m: number, d: number) {
  return new Date(y, m, d, 12);
}

const DAY = 86_400_000;

/** Whole days from the reader's first paper to this one. */
export const dayIndex = (day: Date, since: Date) =>
  Math.round((atNoon(day.getFullYear(), day.getMonth(), day.getDate()).getTime() - atNoon(since.getFullYear(), since.getMonth(), since.getDate()).getTime()) / DAY);

/** The day the papers began: issue number one, the founding of the Kurier and of Brzęczyk. Nothing before it. */
export const PAPERS_BEGAN = new Date(2026, 10, 10, 12);

/** The first paper, the same for every reader. (The garden is kept for when a reader might one day start elsewhere.) */
export const sinceOf = (_g: GardenState, _day: Date): Date => PAPERS_BEGAN;

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shuffled(n: number, seed: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  let s = seed || 1;
  const rnd = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/**
 * The item for position `i` of an endless run through the list: every item once in a shuffled
 * order, then again in another order, so nothing comes back until all the others have been.
 */
export function cycled<T>(list: readonly T[], i: number, salt: string): T | undefined {
  const n = list.length;
  if (n === 0) return undefined;
  const cycle = Math.floor(i / n);
  const pos = ((i % n) + n) % n;
  return list[roundOrder(n, salt, cycle)[pos]!];
}

/**
 * One round's order. Its first few are kept clear of the previous round's last few, so the seam
 * between rounds never brings something straight back. Only the middle is swapped from, so the
 * previous round's end is exactly its shuffle's end.
 */
function roundOrder(n: number, salt: string, cycle: number): number[] {
  const a = shuffled(n, hash(`${salt}/${cycle}`));
  const gap = Math.min(5, Math.floor(n / 3));
  if (gap === 0) return a;
  const before = new Set(shuffled(n, hash(`${salt}/${cycle - 1}`)).slice(n - gap));
  for (let i = 0; i < gap; i++) {
    if (!before.has(a[i]!)) continue;
    for (let j = gap; j < n - gap; j++) {
      if (!before.has(a[j]!)) {
        [a[i], a[j]] = [a[j]!, a[i]!];
        break;
      }
    }
  }
  return a;
}

type Ctx = { month: number; season: 'spring' | 'summer' | 'autumn' | 'winter'; sky: 'clear' | 'cloudy' | 'rain' };

/** The weather isn't asked here: a day's stories must stay the same all day, whatever the sky does. */
const fits = (when: When | undefined, c: Ctx) =>
  !when || ((!when.months || when.months.includes(c.month)) && (!when.seasons || when.seasons.includes(c.season)));

/** Only the pieces that suit the day (its month, season and weather). */
const suited = <T extends { when?: When }>(list: readonly T[], c: Ctx) => list.filter((x) => fits(x.when, c));

const seasonOf = (m: number): Ctx['season'] => (m === 11 || m <= 1 ? 'winter' : m <= 4 ? 'spring' : m <= 7 ? 'summer' : 'autumn');

// ---- words ----------------------------------------------------------------------------------

export type PaperLang = 'pl' | 'en';

/** The papers are Polish or English; the garden's mixed language reads them in English. */
export const paperLang = (lang: Lang): PaperLang => (lang === 'pl' ? 'pl' : 'en');

/** The text in the paper's language, said to her or to him: "{a|b}" picks her form or his. */
export function say(text: L, lang: PaperLang, me: Me): string {
  return gendered(text[lang], me);
}

export const gendered = (s: string, me: Me) => s.replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, she: string, he: string) => (me === 'he' ? he : she));

// ---- the issue ------------------------------------------------------------------------------

export type Story = { kicker: string | null; title: string; sub: string | null; body: string[]; shot: Shot | null; caption: string | null };

export type Issue = {
  key: string;
  day: Date;
  lang: PaperLang;
  number: number;
  year: number;
  kurier: {
    date: string;
    weather: { sky: 'clear' | 'cloudy' | 'rain'; night: boolean; line: string; sun: string };
    lead: Story;
    world: { fresh: boolean; items: Array<{ place: string | null; title: string; body: string }>; none: string | null };
    town: Array<{ title: string; body: string }>;
    garden: string[];
    serial: { name: string; part: number; of: number; title: string; recap: string | null; body: string[]; shot: Shot | null };
    retort: string | null;
    gossip: { title: string; body: string };
    vox: { q: string; a: Array<{ who: string; say: string }> };
    soon: Array<{ when: string; text: string; rumour: boolean }>;
    calendar: Array<{ label: string; text: string }>;
    horoscope: string;
    ads: Array<{ kind: string; text: string; sign: string }>;
    /** `invite`: no letters have come yet, so the editors' own words instead of a reader's. */
    letter: { text: string; sign: string; reply: string | null; invite: boolean };
    note: string | null;
  };
  bee: {
    date: string;
    shared: boolean;
    lead: Story;
    /** Brzęczyk's correction of the Kurier, once the papers know of each other. */
    jab: string | null;
    /** Whether the papers know of each other yet (for the jab in Brzęczyk's footer). */
    rivals: boolean;
    buzz: Array<{ title: string; body: string }>;
    flower: { species: SpeciesId; name: string; text: string; barrels: number } | null;
    photo: { shot: Shot; caption: string };
    horoscope: string;
  };
};

export type IssueInput = {
  /** The paper's day (noon, local). */
  day: Date;
  /** The moment it's read: for the flower of the week and what's coming. */
  now: number;
  garden: GardenState;
  lang: Lang;
  me: Me;
  /** The weather in her window now, for today's paper. */
  weather: { sky: 'clear' | 'cloudy' | 'rain'; night: boolean };
  /** The news column for this day, if it came. */
  world: WorldItem[] | null;
};

/** Brzęczyk leads with the Kurier's story on most days when it has its own take, but never on Tuesdays and Thursdays. */
const sharedDay = (day: Date, lead: Headline) => !!lead.bee && day.getDay() !== 2 && day.getDay() !== 4;

/** A front page never comes back within this many days. */
const FRESH_DAYS = 7;

/**
 * The town's lore: things one front page makes true (the stone becomes mayor, Atrament joins the
 * council). Anything else that leans on them waits until that story has been printed, so nothing
 * calls the stone "the mayor" before the election. Read from the Polish, which every piece has.
 */
const LORE: ReadonlyArray<{ id: string; words: RegExp }> = [
  { id: 'mayor-stone', words: /burmistrz/i },
  { id: 'cat-council', words: /kot\w*\s+(jest\s+)?w\s+radzie|nowego radnego|praca radnego|radny atrament/i },
];

/** The lore a piece leans on: the ids of the stories that must come first. */
const leansOn = (...texts: Array<L | undefined>): string[] => LORE.filter((x) => texts.some((t) => t && x.words.test(t.pl))).map((x) => x.id);

const headlineTexts = (h: Headline): Array<L | undefined> => [h.title, h.sub, ...h.body, h.caption, h.jab, h.vox?.q, ...(h.vox?.a.flatMap((a) => [a.who, a.say]) ?? []), ...(h.bee ? [h.bee.title, ...h.bee.body, h.bee.caption, h.bee.retort] : [])];

/** The front page that comes first after the founding days: the election, so the town has its mayor early. */
const FIRST_STORY = 'mayor-stone';

/** One reader's run of papers, from the first one they had; remembered as it's worked out. */
type Run = { since: Date; kurier: Map<number, Headline>; bee: Map<number, { lead: BeeLead; shared: boolean; id: string; key: string }>; town: Map<number, Piece[]> };
const RUNS = new Map<string, Run>();

function runFrom(since: Date): Run {
  const key = dayKeyOf(since);
  let r = RUNS.get(key);
  if (!r) {
    r = { since: atNoon(since.getFullYear(), since.getMonth(), since.getDate()), kurier: new Map(), bee: new Map(), town: new Map() };
    RUNS.set(key, r);
  }
  return r;
}

const dateIn = (r: Run, d: number) => atNoon(r.since.getFullYear(), r.since.getMonth(), r.since.getDate() + d);

/**
 * Works out a run of days in order from the first paper, remembering each: a day's choice may look
 * back at the days before it. A reader's papers are the same however often they're opened.
 */
function memoRun<T>(memo: Map<number, T>, d: number, choose: (k: number) => T): T {
  const target = Math.max(0, d);
  let k = target;
  while (k > 0 && !memo.has(k - 1)) k--;
  for (; k <= target; k++) if (!memo.has(k)) memo.set(k, choose(k));
  return memo.get(target)!;
}

/** "Z Bratkowa": two town items a day, for the season, none of them printed in the last week. */
function townOn(r: Run, d: number): Piece[] {
  return memoRun(r.town, d, (k) => {
    // before the papers know of each other, nothing here names the bees
    const known = new Set(Array.from({ length: k + 1 }, (_, j) => kurierLead(r, j).id));
    const list = suited(TOWN, ctxFor(dateIn(r, k), 'clear')).filter((x) => (k >= STRANGERS_DAYS || !mentionsBees(x.title, x.body)) && leansOn(x.title, x.body).every((id) => known.has(id)));
    const recent = new Set(Array.from({ length: FRESH_DAYS - 1 }, (_, j) => r.town.get(k - 1 - j) ?? []).flat());
    const out: Piece[] = [];
    for (let t = 0; t < list.length && out.length < 2; t++) {
      const x = cycled(list, k * 2 + t, 'town')!;
      if (!recent.has(x) && !out.includes(x)) out.push(x);
    }
    // the rotation's next stretch may all be recent ones: then the first of the season not printed lately
    for (const x of list) if (out.length < 2 && !recent.has(x) && !out.includes(x)) out.push(x);
    for (const x of list) if (out.length < 2 && !out.includes(x)) out.push(x);
    return out;
  });
}

/** The Kurier's front page: first the founding days, then each story in its turn, never one printed in the last week. */
function kurierLead(r: Run, d: number): Headline {
  return memoRun(r.kurier, d, (k) => {
    if (k < INTRO.length) return INTRO[k]!;
    if (k === INTRO.length) return HEADLINES.find((h) => h.id === FIRST_STORY) ?? HEADLINES[0]!;
    // the lore printed so far: a story leaning on one that hasn't run yet waits its turn
    const known = new Set(Array.from({ length: k }, (_, j) => r.kurier.get(j)?.id));
    const list = suited(HEADLINES, ctxFor(dateIn(r, k), 'clear')).filter((h) => leansOn(...headlineTexts(h)).every((id) => id === h.id || known.has(id)));
    const recent = new Set(Array.from({ length: FRESH_DAYS }, (_, j) => r.kurier.get(k - 1 - j)?.id));
    const n = k - INTRO.length;
    for (let t = 0; t < list.length; t++) {
      const h = cycled(list, n + t, 'lead')!;
      if (!recent.has(h.id)) return h;
    }
    return cycled(list, n, 'lead') ?? HEADLINES[0]!;
  });
}

/** Brzęczyk's front page for a day, whether it's the same story as the Kurier's, and its picture's key. */
function beeLead(r: Run, d: number): { lead: BeeLead; shared: boolean; key: string } {
  return memoRun(r.bee, d, (k) => {
    const kl = kurierLead(r, k);
    if (k < INTRO.length) return { lead: kl.bee!, shared: false, id: kl.id, key: `ib:${k}` };
    const day = dateIn(r, k);
    if (sharedDay(day, kl)) return { lead: kl.bee!, shared: true, id: kl.id, key: `hb:${kl.id}` };
    const known = new Set(Array.from({ length: k + 1 }, (_, j) => kurierLead(r, j).id));
    const list = suited(BEE_STORIES, ctxFor(day, 'clear')).filter((b) => leansOn(b.title, ...b.body, b.caption, b.retort).every((id) => known.has(id)));
    const recent = new Set(Array.from({ length: 10 }, (_, j) => r.bee.get(k - 1 - j)?.id));
    for (let t = 0; t < list.length; t++) {
      const b = cycled(list, k + t, 'bee')!;
      if (!recent.has(b.id)) return { lead: b, shared: false, id: b.id, key: `b:${b.id}` };
    }
    const b = cycled(list, k, 'bee') ?? BEE_STORIES[0]!;
    return { lead: b, shared: false, id: b.id, key: `b:${b.id}` };
  });
}

const ctxFor = (day: Date, sky: Ctx['sky']): Ctx => ({ month: day.getMonth(), season: seasonOf(day.getMonth()), sky });

const PLANT_ART: readonly string[] = ['tulip', 'rose', 'pansy', 'daisy', 'lavender', 'pumpkin', 'snowdrop', 'moonflower'];

/** The picture for a story: its own scene, or (for one without) its main character on their own. */
function shotFor(key: string, art: ArtKey | undefined): Shot | null {
  const own = SHOTS[key];
  if (own) return own;
  if (!art) return null;
  const a = (PLANT_ART.includes(art) ? `plant:${art}` : art) as Actor;
  return { set: 'meadow', cast: [{ a, x: 120 }] };
}

function storyOf(h: { kicker?: L; title: L; sub?: L; body: L[]; art: ArtKey; caption: L }, key: string, lang: PaperLang, me: Me): Story {
  return {
    kicker: h.kicker ? say(h.kicker, lang, me) : null,
    title: say(h.title, lang, me),
    sub: h.sub ? say(h.sub, lang, me) : null,
    body: h.body.map((p) => say(p, lang, me)),
    shot: shotFor(key, h.art),
    caption: say(h.caption, lang, me),
  };
}

const EPISODES = SERIALS.flatMap((s) => s.episodes.map((e, i) => ({ serial: s, episode: e, part: i + 1, of: s.episodes.length })));

const PLACE: Record<WorldPlace, L> = {
  szczecin: { pl: 'Szczecin', en: 'Szczecin' },
  polska: { pl: 'Polska', en: 'Poland' },
  swiat: { pl: 'Świat', en: 'The world' },
};

const capital = (s: string) => s.charAt(0).toLocaleUpperCase('pl') + s.slice(1);
const hm = (h: number) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`.replace(/:60$/, ':59');

function shortDate(d: Date, lang: PaperLang): string {
  if (lang === 'pl') {
    const wd = ['niedz.', 'pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.'][d.getDay()]!;
    return `${wd} ${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}


// ---- yesterday in her garden ---------------------------------------------------------------

/** Flowers whose Polish name is feminine: "zakwitła róża", not "zakwitł". */
const FEMININE: readonly SpeciesId[] = ['rose', 'daisy', 'lavender', 'hollyhock', 'pumpkin'];
const fem = (s: SpeciesId) => FEMININE.includes(s);

function flowerName(p: Pick<Plant, 'species' | 'name'>, lang: PaperLang, acc = false): string {
  const sp = SPECIES[p.species];
  let base = lang === 'pl' ? sp.polish : sp.name.toLowerCase();
  if (lang === 'pl' && acc && fem(p.species) && base.endsWith('a')) base = `${base.slice(0, -1)}ę`;
  return p.name ? `${base} ${lang === 'pl' ? `„${p.name}”` : `“${p.name}”`}` : base;
}

const listed = (xs: string[], lang: PaperLang) => (xs.length <= 1 ? (xs[0] ?? '') : `${xs.slice(0, -1).join(', ')} ${lang === 'pl' ? 'i' : 'and'} ${xs[xs.length - 1]}`);

const VISITOR_FEM = ['jadzia', 'rechotka', 'wiedzmusia'];

function eventLine(e: PaperEvent, lang: PaperLang, me: Me): string | null {
  const w = words(lang, me);
  const g = (s: string) => gendered(s, me);
  const visitor = (id: string) => {
    const n = VISITOR_NAME[id as keyof typeof VISITOR_NAME];
    return n ? (lang === 'pl' ? n[1] : n[0]) : id;
  };
  switch (e.kind) {
    case 'visit':
      return lang === 'pl'
        ? `${visitor(e.who)} ${VISITOR_FEM.includes(e.who) ? 'dostała' : 'dostał'} od Ciebie bukiet.`
        : `${visitor(e.who)} got a bouquet from you.`;
    case 'away':
      return lang === 'pl'
        ? g(`${visitor(e.who)} ${VISITOR_FEM.includes(e.who) ? 'zapukała' : 'zapukał'}, ale umówiliście się na inny raz.`)
        : `${visitor(e.who)} knocked, but you agreed on another time.`;
    case 'buy': {
      let what: string;
      if (e.what === 'species') what = SPECIES[e.ref as SpeciesId] ? flowerName({ species: e.ref as SpeciesId, name: null }, lang, true) : e.ref;
      else if (e.what === 'pansy') what = lang === 'pl' ? `bratki „${designName({ id: e.ref, name: e.name ?? '' }, w.t)}”` : `pansies, “${designName({ id: e.ref, name: e.name ?? '' }, w.t)}”`;
      else if (e.what === 'ribbon') {
        const r = RIBBON_NAMES[e.ref.toLowerCase()];
        what = lang === 'pl' ? `wstążkę${r ? ` ${r[1].toLowerCase()}` : ''}` : `a ${r ? `${r[0].toLowerCase()} ` : ''}ribbon`;
      } else what = lang === 'pl' ? 'nowy wazon' : 'a new vase';
      return lang === 'pl' ? g(`U Pana Jeżyka kupił{aś|eś}: ${what}.`) : `At Pan Jeżyk’s stall you bought ${what}.`;
    }
    case 'trinket': {
      if (e.ref === 'milton') return lang === 'pl' ? 'Milton zamieszkał w koszyku między psami.' : 'Milton moved into the basket between the dogs.';
      const n = TRINKET_NAME[e.ref];
      const name = n ? (lang === 'pl' ? n[1] : n[0]) : e.ref;
      return lang === 'pl' ? g(`Na nocnym targu kupił{aś|eś}: ${name.toLowerCase()}.`) : `At the night market you bought: ${name.toLowerCase()}.`;
    }
    case 'post':
      return lang === 'pl' ? `Przyszedł bukiet pocztą${e.from ? ` od #${e.from}` : ''}.` : `A bouquet came in the post${e.from ? ` from #${e.from}` : ''}.`;
    case 'package':
      return lang === 'pl' ? `Przyszła paczka${e.from ? ` od #${e.from}` : ' bez nadawcy'}.` : `A package came${e.from ? ` from #${e.from}` : ', with no name on it'}.`;
  }
}

const TRAIT_LINE: Record<string, (f: string, acc: string, lang: PaperLang) => string> = {
  enchanted: (_f, acc, lang) => (lang === 'pl' ? `Pełnia zaczarowała ${acc}.` : `The full moon enchanted your ${acc}.`),
  dewy: (f, _a, lang) => (lang === 'pl' ? `Deszcz zostawił rosę na liściach: ${f}.` : `The rain left dew on your ${f}.`),
  sunkissed: (_f, acc, lang) => (lang === 'pl' ? `Słońce pocałowało ${acc}.` : `The sun kissed your ${acc}.`),
  frosted: (f, _a, lang) => (lang === 'pl' ? `Szron osiadł na płatkach i już nie stopnieje: ${f}.` : `Frost settled on your ${f}, and it won’t melt.`),
  willowy: (_f, acc, lang) => (lang === 'pl' ? `Wiatr nauczył ${acc} kołysać się jak wierzba.` : `The wind taught your ${acc} to sway like a willow.`),
};

/** What happened in her garden "yesterday" (the day before this paper's), as a few short lines. Always at least one. */
export function gardenLines(g: GardenState, day: Date, lang: PaperLang, me: Me): string[] {
  const { from, to } = yesterdayWindow(day);
  const inside = (t: number) => t >= from && t < to;
  const gs = (s: string) => gendered(s, me);
  const lines: string[] = [];

  const bloomed = g.plants.filter((p) => p.plantedAt < to && stageAt(p.species, p, to) === 'bloom' && stageAt(p.species, p, from) !== 'bloom');
  if (bloomed.length === 1) {
    const p = bloomed[0]!;
    const where = p.display ? (lang === 'pl' ? ' w oknie' : ' in the window') : '';
    lines.push(lang === 'pl' ? `${fem(p.species) && !p.name ? 'Zakwitła' : p.name ? (fem(p.species) ? 'Zakwitła' : 'Zakwitł') : 'Zakwitł'} ${flowerName(p, lang)}${where}. Gratulujemy.` : `Your ${flowerName(p, lang)} came into flower${where}. Congratulations.`);
  } else if (bloomed.length > 1) {
    const names = bloomed.slice(0, 4).map((p) => flowerName(p, lang));
    lines.push(lang === 'pl' ? `Zakwitły: ${listed(names, lang)}. Wielki dzień.` : `Into flower: ${listed(names, lang)}. A big day.`);
  }

  const visits = g.paper.log.filter((e) => inside(e.at));
  for (const e of visits.filter((x) => x.kind === 'visit').slice(0, 3)) {
    const line = eventLine(e, lang, me);
    if (line) lines.push(line);
  }
  const petals = visits.reduce((n, e) => n + (e.kind === 'visit' ? e.petals : 0), 0);
  if (petals > 0) lines.push(lang === 'pl' ? `W słoiku przybyło ${petals} ${plural(petals, 'płatek', 'płatki', 'płatków')}.` : `${petals} ${petals === 1 ? 'petal' : 'petals'} went into the jar.`);

  const planted = g.plants.filter((p) => inside(p.plantedAt));
  if (planted.length > 0) {
    const names = planted.slice(0, 3).map((p) => flowerName(p, lang, true));
    lines.push(lang === 'pl' ? gs(`Posadził{aś|eś}: ${listed(names, lang)}.`) : `You planted: ${listed(names, lang)}.`);
  }
  const sprouted = g.plants.filter((p) => p.plantedAt < from && stageAt(p.species, p, from) === 'seed' && stageAt(p.species, p, to) !== 'seed');
  if (sprouted.length > 0) {
    const names = sprouted.slice(0, 3).map((p) => flowerName(p, lang));
    lines.push(lang === 'pl' ? `${sprouted.length > 1 ? 'Wykiełkowały' : fem(sprouted[0]!.species) ? 'Wykiełkowała' : 'Wykiełkował'}: ${listed(names, lang)}.` : `Sprouted: ${listed(names, lang)}.`);
  }

  for (const e of visits.filter((x) => x.kind !== 'visit').slice(0, 3)) {
    const line = eventLine(e, lang, me);
    if (line) lines.push(line);
  }

  const watered = g.plants.reduce((n, p) => n + p.waterings.filter(inside).length, 0);
  if (watered > 0) lines.push(lang === 'pl' ? gs(`Podlał{aś|eś} kwiaty ${watered === 1 ? 'raz' : `${watered} razy`}. Ziemia mówi dziękuję.`) : `You watered ${watered === 1 ? 'once' : `${watered} times`}. The soil says thank you.`);

  const cut = g.cuttings.filter((c) => inside(c.at)).length;
  if (cut > 0) lines.push(lang === 'pl' ? `Na bukiety poszło ${cut} ${plural(cut, 'kwiat', 'kwiaty', 'kwiatów')}.` : `${cut} ${cut === 1 ? 'flower' : 'flowers'} went into bouquets.`);

  const pressed = g.pressed.filter((p) => inside(p.at)).length;
  if (pressed > 0) lines.push(lang === 'pl' ? `W zielniku przybyło: ${pressed} ${plural(pressed, 'kwiat', 'kwiaty', 'kwiatów')}.` : `${pressed} ${pressed === 1 ? 'flower' : 'flowers'} pressed into the book.`);

  const yesterday = new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1, 12);
  if (g.diary[dayKeyOf(yesterday)]) lines.push(lang === 'pl' ? 'W pamiętniku przybyła kartka.' : 'A new page in the diary.');

  for (const p of g.plants.filter((x) => x.trait && inside(x.trait.at)).slice(0, 2)) {
    const line = TRAIT_LINE[p.trait!.kind];
    if (line) lines.push(capital(line(flowerName(p, lang), flowerName(p, lang, true), lang)));
  }

  if (lines.length === 0) return [lang === 'pl' ? 'Spokojny dzień. Ogród odpoczywał i rósł.' : 'A quiet day. The garden rested, and grew.'];
  return lines.slice(0, 6);
}

// ---- what's coming --------------------------------------------------------------------------

function comingSoon(day: Date, d: number, c: Ctx, lang: PaperLang, me: Me): Issue['kurier']['soon'] {
  const out: Issue['kurier']['soon'] = [];
  const wd = day.getDay();
  // Pani Ćma's night market: Friday dusk to Monday dawn
  if (wd === 5) out.push({ when: lang === 'pl' ? 'dziś' : 'tonight', text: lang === 'pl' ? 'Nocny Targ Pani Ćmy otwiera się po zmroku, na cały weekend.' : 'Pani Ćma’s Night Market opens after dark, for the whole weekend.', rumour: false });
  else if (wd === 6 || wd === 0) out.push({ when: lang === 'pl' ? 'weekend' : 'weekend', text: lang === 'pl' ? 'Nocny Targ Pani Ćmy czynny po zmroku, do niedzieli w nocy.' : 'Pani Ćma’s Night Market is open after dark until Sunday night.', rumour: false });
  else {
    const fri = atNoon(day.getFullYear(), day.getMonth(), day.getDate() + ((5 - wd + 7) % 7));
    out.push({ when: shortDate(fri, lang), text: lang === 'pl' ? 'Nocny Targ Pani Ćmy otwiera się po zmroku, na cały weekend.' : 'Pani Ćma’s Night Market opens after dark, for the whole weekend.', rumour: false });
  }
  // meteor showers: the garden's sky really fills with shooting stars that night
  const sh = nextShower(day, 40);
  if (sh) {
    const next = atNoon(sh.date.getFullYear(), sh.date.getMonth(), sh.date.getDate() + 1);
    const when = lang === 'pl' ? `${sh.date.getDate()}/${next.getDate()}.${String(next.getMonth() + 1).padStart(2, '0')}` : `${sh.date.getDate()}–${next.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
    const days = sh.days === 0 ? (lang === 'pl' ? 'Dziś w nocy!' : 'Tonight!') : sh.days === 1 ? (lang === 'pl' ? 'Już jutro.' : 'Tomorrow.') : lang === 'pl' ? `Za ${sh.days} dni.` : `In ${sh.days} days.`;
    out.push({ when, text: lang === 'pl' ? `Deszcz meteorów nad ogrodem: spadające gwiazdy, jeśli niebo będzie czyste. ${days}` : `A meteor shower over the garden: shooting stars, if the sky is clear. ${days}`, rumour: false });
  }
  // her birthday, when the visitors she knows leave gifts at the door
  const bday = atNoon(day.getMonth() === 0 && day.getDate() === 1 ? day.getFullYear() : day.getFullYear() + 1, 0, 1);
  const toBday = Math.round((bday.getTime() - day.getTime()) / DAY);
  if (toBday === 0) out.push({ when: lang === 'pl' ? 'dziś' : 'today', text: lang === 'pl' ? 'Wielki dzień w ogrodzie. Zajrzyj pod drzwi.' : 'A big day in the garden. Look outside the door.', rumour: false });
  else if (toBday <= 30) out.push({ when: '1.01', text: lang === 'pl' ? 'Wielki dzień w ogrodzie. Goście już szykują prezenty.' : 'A big day in the garden. The visitors are already preparing gifts.', rumour: false });
  // Halloween in the room
  const hall = atNoon(day.getMonth() > 9 || (day.getMonth() === 9 && day.getDate() > 17) ? day.getFullYear() + 1 : day.getFullYear(), 9, 17);
  const toHall = Math.round((hall.getTime() - day.getTime()) / DAY);
  if (toHall >= 0 && toHall <= 21) out.push({ when: shortDate(hall, lang), text: lang === 'pl' ? 'W pokoju pojawią się dynie i nietoperz. Ciii.' : 'Pumpkins and a bat will appear in the room. Shh.', rumour: false });
  // and a rumour, which may or may not come true
  const r = cycled(suited(RUMOURS, c), d, 'rumour');
  if (r) out.push({ when: lang === 'pl' ? 'plotka' : 'rumour', text: say(r.kurier, lang, me), rumour: true });
  return out.slice(0, 4);
}

function calendarLines(day: Date, lang: Lang, pl: PaperLang): Issue['kurier']['calendar'] {
  const out: Issue['kurier']['calendar'] = [];
  if (lang !== 'en') out.push({ label: pl === 'pl' ? 'Imieniny' : 'Imieniny', text: nameDays(day) });
  const hol = holidaysOn(day);
  if (hol.length) out.push({ label: pl === 'pl' ? 'Dziś' : 'Today', text: capital(hol.map((h) => h.name[pl]).join(', ')) });
  const full = nextMoon(day.getTime(), 'full');
  out.push({
    label: pl === 'pl' ? 'Księżyc' : 'Moon',
    text: `${moonWords(day.getTime())[pl]}; ${pl === 'pl' ? `pełnia ${full.getDate()}.${String(full.getMonth() + 1).padStart(2, '0')}` : `full on ${full.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}`,
  });
  const sh = nextShower(day, 45);
  if (sh) {
    const n = atNoon(sh.date.getFullYear(), sh.date.getMonth(), sh.date.getDate() + 1);
    out.push({
      label: pl === 'pl' ? 'Niebo' : 'Sky',
      text: pl === 'pl' ? `${sh.shower.name.pl}, najwięcej w nocy ${sh.date.getDate()}/${n.getDate()}.${String(n.getMonth() + 1).padStart(2, '0')} (do ${sh.shower.perHour} na godzinę)` : `${capital(sh.shower.name.en)}, best on the night of ${sh.date.getDate()}–${n.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} (up to ${sh.shower.perHour} an hour)`,
    });
  }
  const big = nextBigDay(day, 40);
  if (big) out.push({ label: pl === 'pl' ? `Za ${big.days} ${plural(big.days, 'dzień', 'dni', 'dni')}` : `In ${big.days} ${big.days === 1 ? 'day' : 'days'}`, text: capital(big.holiday.name[pl]) });
  return out;
}

// ---- the flower of the week ----------------------------------------------------------------

function flowerOfWeek(g: GardenState, day: Date, now: number, lang: PaperLang, me: Me): Issue['bee']['flower'] {
  const blooming = g.plants.filter((p) => stageAt(p.species, p, Math.max(now, day.getTime())) === 'bloom');
  if (blooming.length === 0) return null;
  // the week starts on Monday
  const monday = atNoon(day.getFullYear(), day.getMonth(), day.getDate() - ((day.getDay() + 6) % 7));
  const week = Math.round(monday.getTime() / (7 * DAY));
  const sorted = [...blooming].sort((a, b) => a.id.localeCompare(b.id));
  const p = sorted[hash(`week/${week}`) % sorted.length]!;
  const group = (['pansy', 'tulip', 'rose', 'daisy', 'lavender'] as const).find((s) => s === p.species) ?? 'other';
  const lines = FLOWER_OF_WEEK[group];
  const text = say(lines[week % lines.length]!, lang, me);
  const species = SPECIES[p.species];
  const base = lang === 'pl' ? capital(species.polish) : species.name;
  const name = p.name ? `${base} ${lang === 'pl' ? `„${p.name}”` : `“${p.name}”`}` : base;
  return { species: p.species, name, text, barrels: 4 + (hash(`barrels/${week}`) % 2) };
}

// ---- putting it together --------------------------------------------------------------------

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
export const roman = (n: number) => ROMAN[n - 1] ?? String(n);

function skyWord(sky: Ctx['sky'], night: boolean, lang: PaperLang): string {
  if (sky === 'rain') return lang === 'pl' ? 'Deszczowo' : 'Rainy';
  if (sky === 'cloudy') return lang === 'pl' ? 'Pochmurno' : 'Cloudy';
  return night ? (lang === 'pl' ? 'Gwiaździście' : 'Starry') : lang === 'pl' ? 'Pogodnie' : 'Fair';
}

export function buildIssue(input: IssueInput): Issue {
  const { day, garden, me, weather } = input;
  const lang = paperLang(input.lang);
  const s = (x: L) => say(x, lang, me);
  const run = runFrom(sinceOf(garden, day));
  // nothing before the first paper: an earlier day reads as the first
  const d = Math.max(0, dayIndex(day, run.since));
  const c = ctxFor(day, weather.sky);
  const key = dayKeyOf(day);

  const lead = kurierLead(run, d);
  const leadKey = d < INTRO.length ? `i:${d}` : `h:${lead.id}`;
  const bee = beeLead(run, d);
  const yBee = d > 0 ? beeLead(run, d - 1) : null;

  const ep = EPISODES[((d % EPISODES.length) + EPISODES.length) % EPISODES.length]!;
  const prev = ep.part > 1 ? EPISODES[(((d - 1) % EPISODES.length) + EPISODES.length) % EPISODES.length] : undefined;

  // for the first two days the papers don't yet know about each other: nothing in either names the other
  const rivals = d >= STRANGERS_DAYS;
  // and nothing leans on lore that hasn't been printed yet (the mayor before the election)
  const known = new Set(Array.from({ length: d + 1 }, (_, j) => kurierLead(run, j).id));
  const inLore = <T,>(list: readonly T[], texts: (x: T) => Array<L | undefined>) => list.filter((x) => leansOn(...texts(x)).every((id) => known.has(id)));
  const forKurier = <T,>(list: readonly T[], texts: (x: T) => Array<L | undefined>) => inLore(rivals ? list : list.filter((x) => !mentionsBees(...texts(x))), texts);
  const forBees = <T,>(list: readonly T[], texts: (x: T) => Array<L | undefined>) => inLore(rivals ? list : list.filter((x) => !mentionsKurier(...texts(x))), texts);

  const note = noteFor(garden.paper, key)?.text ?? null;
  const vox: Vox = lead.vox ?? cycled(inLore(VOX, (v) => [v.q, ...v.a.flatMap((a) => [a.who, a.say])]), d, 'vox')!;
  const letter = cycled(forKurier(LETTERS, (x) => [x.text, x.reply]), d, 'letter')!;
  const adCount = note ? 2 : 3;
  const adList = inLore(ADS, (a) => [a.kind, a.text, { pl: a.sign, en: a.sign }]);
  const ads = Array.from({ length: adCount }, (_, i) => cycled(adList, d * 3 + i, 'ads')!);

  const worldItems = input.world;
  // the real news when it came; when not, a plain word that it didn't, never a made-up story
  const world = worldItems
    ? { fresh: true, items: worldItems.map((w) => ({ place: PLACE[w.place][lang], title: w.title[lang], body: w.body[lang] })), none: null }
    : { fresh: false, items: [], none: s(cycled(NO_NEWS, d, 'nonews')!) };
  // and the town in brief, two a day, for the season
  const town = townOn(run, d).map((x) => ({ title: s(x.title), body: s(x.body) }));

  const sun = sunTimes(day);
  const weatherFlavour = cycled(WEATHER_LINES[weather.night ? 'night' : weather.sky], d, 'wx')!;
  const moon = moonWords(day.getTime())[lang];
  const date = capital(day.toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));

  const buzzList = forBees(suited(BUZZ, c), (x) => [x.title, x.body]);
  const buzz = [
    ...(ep.episode.buzz && (rivals || !mentionsKurier(ep.episode.buzz)) ? [{ title: s(ep.serial.name), body: s(ep.episode.buzz) }] : []),
    ...Array.from({ length: 3 }, (_, i) => cycled(buzzList, d * 3 + i, 'buzz')!).map((b) => ({ title: s(b.title), body: s(b.body) })),
  ].slice(0, 4);

  const retortFrom = yBee?.lead.retort;
  const photo = cycled(inLore(PHOTOS, (x) => [x.caption]), d, 'photo')!;

  return {
    key,
    day,
    lang,
    number: d + 1,
    year: Math.floor(d / 365) + 1,
    kurier: {
      date,
      weather: { sky: weather.sky, night: weather.night, line: `${skyWord(weather.sky, weather.night, lang)}. ${s(weatherFlavour)}`, sun: `${lang === 'pl' ? 'Wschód' : 'Sunrise'} ${hm(sun.rise)} · ${lang === 'pl' ? 'zachód' : 'sunset'} ${hm(sun.set)} · ${moon}` },
      lead: storyOf(lead, leadKey, lang, me),
      world,
      town,
      garden: d === 0 ? [s(FIRST_GARDEN_LINE)] : gardenLines(garden, day, lang, me),
      serial: {
        name: s(ep.serial.name),
        part: ep.part,
        of: ep.of,
        title: s(ep.episode.title),
        recap: prev && prev.serial.id === ep.serial.id ? s(prev.episode.recap) : null,
        body: ep.episode.body.map(s),
        shot: shotFor(`s:${ep.serial.id}:${ep.part}`, ep.episode.art),
      },
      retort: retortFrom ? s(retortFrom) : null,
      gossip: (() => {
        const gp = cycled(forKurier(suited(GOSSIP, c), (x) => [x.title, x.body]), d, 'gossip')!;
        return { title: s(gp.title), body: s(gp.body) };
      })(),
      vox: { q: s(vox.q), a: vox.a.map((a) => ({ who: s(a.who), say: s(a.say) })) },
      soon: comingSoon(day, d, c, lang, me),
      calendar: calendarLines(day, input.lang, lang),
      horoscope: s(cycled(inLore(HOROSCOPES, (x) => [x]), d, 'horo')!),
      ads: ads.map((a) => ({ kind: s(a.kind), text: s(a.text), sign: a.sign })),
      letter: d < LETTERBOX.length
        ? { text: s(LETTERBOX[d]!), sign: lang === 'pl' ? 'Redakcja' : 'The editors', reply: null, invite: true }
        : { text: s(letter.text), sign: s(letter.sign), reply: note ? null : s(letter.reply), invite: false },
      note,
    },
    bee: {
      date: `${capital(day.toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', { weekday: 'long' }))}, ${day.getDate()}.${String(day.getMonth() + 1).padStart(2, '0')}.${day.getFullYear()}`,
      shared: bee.shared,
      lead: storyOf({ ...bee.lead, kicker: d === 0 ? { pl: 'PIERWSZY NUMER!', en: 'FIRST ISSUE!' } : d === STRANGERS_DAYS ? { pl: 'SZOK!', en: 'SHOCK!' } : bee.shared ? { pl: 'SZOK! TYLKO U NAS!', en: 'SHOCK! ONLY HERE!' } : { pl: 'Z OSTATNIEJ CHWILI!', en: 'BREAKING!' } }, bee.key, lang, me),
      photo: { shot: photo.shot, caption: s(photo.caption) },
      jab: rivals ? s(lead.jab ?? cycled(inLore(BEE_JABS, (x) => [x]), d, 'jab')!) : null,
      rivals,
      buzz,
      flower: flowerOfWeek(garden, day, input.now, lang, me),
      horoscope: s(cycled(forBees(BEE_HOROSCOPES, (x) => [x]), d, 'beehoro')!),
    },
  };
}

/** Exposed for the tests and the test page: which story leads on a day, and whether the bees share it. */
export const leadsFor = (day: Date, since: Date) => {
  const run = runFrom(since);
  const d = Math.max(0, dayIndex(day, run.since));
  return { kurier: kurierLead(run, d).id, bee: beeLead(run, d) };
};

export const EPISODE_COUNT = EPISODES.length;
export const moonAt = (t: number) => moonPhase(t);
