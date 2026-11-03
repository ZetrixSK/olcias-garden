import type { PansyDesign } from './designs';
import { BASE_VASES, VASES, type Bouquet, type Stem, type Vase } from './bouquets';
import { SPECIES_IDS, type SpeciesId } from './species';

/**
 * Visitors: now and then someone knocks at the door with a request for a bouquet. She grows the
 * flowers it needs, makes it in the bouquet studio, and they thank her with petals (how close it
 * came) and a gift: seeds of a flower she couldn't grow before, a ribbon, a vase, their own bratek.
 *
 * Nothing here is ever lost or punished. There is at most one request at a time, it never runs out
 * (after a few days the visitor just goes, and someone else comes later), and every bouquet,
 * however far off, is thanked for and brings them a little closer.
 */

export const VISITOR_IDS = ['jadzia', 'atrament', 'duszek', 'rechotka', 'listonosz', 'wiedzmusia', 'jingleton'] as const;
export type VisitorId = (typeof VISITOR_IDS)[number];

export const COLOURS = ['pink', 'purple', 'dark', 'white', 'yellow', 'red', 'orange', 'blue'] as const;
export type Colour = (typeof COLOURS)[number];

/** One thing a visitor would like in their bouquet. */
export type Wish =
  /** at least `min` stems in this colour */
  | { kind: 'colour'; colour: Colour; min: number }
  /** at least `min` stems of this flower */
  | { kind: 'species'; species: SpeciesId; min: number }
  /** between `min` and `max` stems */
  | { kind: 'size'; min: number; max: number }
  /** this ribbon, any ribbon ('any'), or none at all (null) */
  | { kind: 'ribbon'; ribbon: string | null }
  | { kind: 'vase'; vase: Vase }
  /** cut and given at night */
  | { kind: 'night' };

export type Request = {
  id: string;
  visitor: VisitorId;
  wishes: Wish[];
  /** When they knocked. */
  at: number;
  /** Which of their ways of asking the note is written in. */
  text: number;
  /** Whether she has opened the door to them yet. */
  seen: boolean;
};

/** What she knows of a visitor and how fond of her they are. */
export type Friend = {
  /** Bouquets she has given them. */
  visits: number;
  /** Up to five hearts, one for each bouquet. */
  hearts: number;
  /** How far along their list of gifts they are. */
  gifts: number;
  /** Whether she has found their favourite thing. */
  fav: boolean;
  /** When she first met them. */
  first: number;
  /** The last few bouquets she gave them, for their page in the book. */
  bouquets: Bouquet[];
};

export type Visitors = {
  request: Request | null;
  /** Nobody knocks before this. */
  nextAt: number;
  /** Who came last, so the same one doesn't come twice in a row. */
  last: VisitorId | null;
  friends: Partial<Record<VisitorId, Friend>>;
  /** Flowers she can plant. The first five always; the others come as seeds from visitors. */
  unlocked: SpeciesId[];
  /** Ribbons and vases visitors gave her, besides the ones she always had. */
  ribbons: string[];
  vases: Vase[];
  /** The year her birthday gifts were last left at the door. */
  birthday: number | null;
};

export const STARTER_SPECIES: readonly SpeciesId[] = ['pansy', 'tulip', 'rose', 'daisy', 'lavender'];
export const MAX_HEARTS = 5;
/** A request that has waited this long is let go quietly, and someone else comes later. */
export const REQUEST_WAITS = 3 * 86_400_000;
const HOUR = 3_600_000;
const BOOK_BOUQUETS = 4;

/** Something a visitor gives her. */
export type Gift =
  | { kind: 'species'; species: SpeciesId }
  | { kind: 'ribbon'; color: string }
  | { kind: 'vase'; vase: Vase }
  | { kind: 'design'; design: PansyDesign; count: number };

/** Ribbons only visitors give. */
export const GIFT_RIBBONS = {
  lace: '#f4e6d4',
  ink: '#3b2346',
  mist: '#cdd8e6',
  postbox: '#b8433f',
  plum: '#6b3a66',
  honey: '#e2ad3f',
} as const;

const design = (id: string, name: string, top: string, low: string, face: PansyDesign['face'], faceColor: string, edge: string | null): PansyDesign => ({
  id: `visitor-${id}`,
  name,
  top,
  low,
  face,
  faceColor,
  edge,
});

/** Each visitor's own bratek, which they give once they know her a little. */
export const VISITOR_PANSIES: Record<VisitorId, PansyDesign> = {
  jadzia: design('jadzia', 'Jadzia', '#f3a6c0', '#fbe3ea', 'whiskers', '#8a2f55', '#ffffff'),
  atrament: design('atrament', 'Atrament', '#1c1420', '#3b2346', 'clear', '#e3c34d', null),
  duszek: design('duszek', 'Duszek', '#f4f4fb', '#d8def0', 'clear', '#9aa6c8', null),
  rechotka: design('rechotka', 'Rechotka', '#b9d38a', '#e8efb0', 'whiskers', '#4f6b2e', null),
  listonosz: design('listonosz', 'Znaczek', '#c9473f', '#f6e6c8', 'whiskers', '#5a1f1c', '#f6e6c8'),
  wiedzmusia: design('wiedzmusia', 'Wiedźmusia', '#4a2a5c', '#a07cc0', 'whiskers', '#1c1022', '#e2ad3f'),
  jingleton: design('jingleton', 'Jingleton', '#2a2224', '#e9b43c', 'whiskers', '#2a2224', '#f6dc8a'),
};

/** What each one gives, in order: one thing for each bouquet that pleased them (three petals or more). */
export const GIFTS: Record<VisitorId, Gift[]> = {
  jadzia: [
    { kind: 'species', species: 'hellebore' },
    { kind: 'design', design: VISITOR_PANSIES.jadzia, count: 3 },
    { kind: 'ribbon', color: GIFT_RIBBONS.lace },
  ],
  atrament: [
    { kind: 'species', species: 'hollyhock' },
    { kind: 'ribbon', color: GIFT_RIBBONS.ink },
    { kind: 'design', design: VISITOR_PANSIES.atrament, count: 3 },
  ],
  duszek: [
    { kind: 'species', species: 'moonflower' },
    { kind: 'ribbon', color: GIFT_RIBBONS.mist },
    { kind: 'design', design: VISITOR_PANSIES.duszek, count: 3 },
  ],
  rechotka: [
    { kind: 'species', species: 'cyclamen' },
    { kind: 'vase', vase: 'can' },
    { kind: 'design', design: VISITOR_PANSIES.rechotka, count: 3 },
  ],
  listonosz: [
    { kind: 'species', species: 'snowdrop' },
    { kind: 'ribbon', color: GIFT_RIBBONS.postbox },
    { kind: 'design', design: VISITOR_PANSIES.listonosz, count: 3 },
  ],
  wiedzmusia: [
    { kind: 'species', species: 'batflower' },
    { kind: 'vase', vase: 'cauldron' },
    { kind: 'species', species: 'pumpkin' },
    { kind: 'design', design: VISITOR_PANSIES.wiedzmusia, count: 3 },
  ],
  jingleton: [
    { kind: 'ribbon', color: GIFT_RIBBONS.honey },
    { kind: 'design', design: VISITOR_PANSIES.jingleton, count: 3 },
  ],
};

/** Which visitor carries the seeds of each flower she can't plant yet. */
export function whoHasSeeds(species: SpeciesId): VisitorId | null {
  for (const v of VISITOR_IDS) if (GIFTS[v].some((g) => g.kind === 'species' && g.species === species)) return v;
  return null;
}

// ---- colours of the flowers ---------------------------------------------------------------

/** The colours of the flowers that always look the same. */
const SPECIES_COLOURS: Record<Exclude<SpeciesId, 'pansy'>, Colour[]> = {
  tulip: ['pink'],
  rose: ['pink'],
  daisy: ['pink', 'white'],
  lavender: ['purple'],
  snowdrop: ['white'],
  cyclamen: ['pink', 'red'],
  hellebore: ['white'],
  hollyhock: ['dark'],
  pumpkin: ['orange', 'yellow'],
  batflower: ['dark'],
  moonflower: ['white'],
};

/** The built-in bratek varieties. */
const PRESET_COLOURS: Record<string, Colour[]> = {
  mix: ['dark', 'pink', 'white', 'purple'],
  olcia: ['dark', 'pink'],
  velvet: ['dark', 'purple'],
  rosy: ['pink'],
  cream: ['white', 'yellow'],
};

/** What colour a painted swatch reads as, for a visitor asking for "something pink". */
export function hexColours(hex: string): Colour[] {
  const n = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  if (n.some((x) => Number.isNaN(x))) return [];
  const [r, g, b] = n as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d > 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  const out: Colour[] = [];
  if (l < 0.24) {
    out.push('dark');
    if (s > 0.2 && h >= 250 && h < 335) out.push('purple');
    return out;
  }
  if (l > 0.86 || s < 0.14) {
    if (l > 0.7) out.push('white');
    else if (l < 0.4) out.push('dark');
    if (s > 0.45 && h >= 35 && h < 70) out.push('yellow');
    return out;
  }
  if (h < 15 || h >= 345) out.push(l > 0.68 ? 'pink' : 'red');
  else if (h < 38) out.push('orange');
  else if (h < 75) out.push('yellow');
  // greens aren't a colour anyone asks for
  else if (h < 160) return out;
  else if (h < 250) out.push('blue');
  else if (h < 300) out.push('purple');
  else out.push('pink');
  return out;
}

/** The colours a stem's flower comes in. */
export function stemColours(stem: Stem): Colour[] {
  if (stem.species !== 'pansy') return SPECIES_COLOURS[stem.species];
  if (stem.design) return [...new Set([...hexColours(stem.design.top), ...hexColours(stem.design.low)])];
  return PRESET_COLOURS[stem.variety ?? 'mix'] ?? PRESET_COLOURS.mix!;
}

/** The colours she could pick a stem in: her flowers, the ready-made bratki, and her own designs. */
export function growableColours(unlocked: readonly SpeciesId[], designs: PansyDesign[]): Set<Colour> {
  const out = new Set<Colour>();
  for (const s of unlocked) {
    if (s === 'pansy') {
      for (const cs of Object.values(PRESET_COLOURS)) cs.forEach((c) => out.add(c));
      for (const d of designs) [...hexColours(d.top), ...hexColours(d.low)].forEach((c) => out.add(c));
    } else SPECIES_COLOURS[s].forEach((c) => out.add(c));
  }
  return out;
}

// ---- when each one comes ------------------------------------------------------------------

/** The moment someone might knock: the time of day, the weather and the time of year. */
export type Moment = {
  hour: number;
  /** 0 is Sunday. */
  weekday: number;
  month: number;
  night: boolean;
  sky: 'clear' | 'cloudy' | 'rain';
  halloween: boolean;
};

export function momentAt(now: number, weather: { sky: 'clear' | 'cloudy' | 'rain'; night: boolean }, halloween: boolean): Moment {
  const d = new Date(now);
  return { hour: d.getHours(), weekday: d.getDay(), month: d.getMonth(), night: weather.night, sky: weather.sky, halloween };
}

/** How likely each visitor is to come at a moment; 0 means not now. */
export function visitorWeight(v: VisitorId, m: Moment): number {
  const { hour, night, sky } = m;
  switch (v) {
    case 'jadzia':
      return !night && hour >= 9 && hour < 19 ? 1 : 0;
    case 'atrament':
      return hour >= 17 || hour < 1 ? 1 : 0;
    case 'duszek':
      return night ? (m.halloween ? 3 : 1) : 0;
    case 'rechotka':
      if (sky === 'rain') return 3;
      if (sky === 'cloudy') return 1.2;
      return !night && hour >= 6 && hour < 10 ? 0.6 : 0;
    case 'listonosz':
      return !night && m.weekday !== 0 && hour >= 8 && hour < 14 ? 1.2 : 0;
    case 'wiedzmusia':
      return hour >= 16 && hour < 23 ? (m.halloween ? 3 : 1) : 0;
    case 'jingleton':
      return !night && sky !== 'rain' && hour >= 10 && hour < 18 ? (m.month >= 3 && m.month <= 8 ? 1.5 : 1) : 0;
  }
}

// ---- what they ask for --------------------------------------------------------------------

type Shape = (has: (s: SpeciesId) => boolean, vases: readonly Vase[]) => Wish[] | null;
const colour = (c: Colour, min = 1): Wish => ({ kind: 'colour', colour: c, min });
const species = (s: SpeciesId, min = 1): Wish => ({ kind: 'species', species: s, min });
const size = (min: number, max: number): Wish => ({ kind: 'size', min, max });
const only = (s: SpeciesId, wishes: Wish[]): Shape => (has) => (has(s) ? wishes : null);

/** The kinds of bouquet each visitor asks for. Ones needing a flower she can't plant yet are skipped. */
const SHAPES: Record<VisitorId, Shape[]> = {
  jadzia: [
    () => [colour('pink', 2), { kind: 'ribbon', ribbon: 'any' }],
    () => [species('rose'), { kind: 'ribbon', ribbon: '#f2c4cf' }],
    () => [colour('pink'), size(4, 7)],
    only('hellebore', [species('hellebore'), colour('pink')]),
  ],
  atrament: [
    () => [colour('dark', 2), { kind: 'ribbon', ribbon: null }],
    () => [colour('purple', 2)],
    () => [species('lavender'), colour('dark')],
    () => [colour('dark'), { kind: 'vase', vase: 'bottle' }],
    only('hollyhock', [species('hollyhock'), { kind: 'ribbon', ribbon: null }]),
  ],
  duszek: [
    () => [colour('white', 2), { kind: 'night' }],
    () => [colour('white'), size(1, 3)],
    only('moonflower', [species('moonflower'), { kind: 'night' }]),
    only('snowdrop', [species('snowdrop', 2)]),
  ],
  rechotka: [
    () => [{ kind: 'vase', vase: 'jug' }, colour('purple')],
    () => [size(5, 7)],
    () => [colour('blue')],
    only('cyclamen', [species('cyclamen'), { kind: 'vase', vase: 'jug' }]),
    (_, vases) => (vases.includes('can') ? [{ kind: 'vase', vase: 'can' }, size(4, 7)] : null),
  ],
  listonosz: [
    () => [size(3, 3), colour('yellow')],
    () => [size(1, 3), { kind: 'vase', vase: 'jar' }],
    () => [colour('red'), size(1, 4)],
    () => [species('daisy'), size(1, 3)],
    only('snowdrop', [species('snowdrop'), size(1, 3)]),
  ],
  wiedzmusia: [
    () => [species('lavender', 2)],
    () => [colour('dark'), colour('purple'), { kind: 'vase', vase: 'bottle' }],
    only('batflower', [species('batflower')]),
    only('hollyhock', [species('hollyhock'), colour('purple')]),
    only('pumpkin', [species('pumpkin'), colour('dark')]),
    (_, vases) => (vases.includes('cauldron') ? [{ kind: 'vase', vase: 'cauldron' }, colour('dark', 2)] : null),
  ],
  jingleton: [
    () => [size(5, 7)],
    () => [species('lavender'), colour('yellow')],
    () => [species('daisy', 2)],
    () => [colour('purple', 2)],
  ],
};

/** How many ways each visitor has of writing their note (see the words for them). */
export const NOTE_STYLES = 3;

/**
 * A request from a visitor: one of the kinds of bouquet they like, among those she could make with
 * the flowers she can grow. The first time they come they ask for something simple.
 */
export function makeRequest(v: VisitorId, state: Pick<Visitors, 'unlocked' | 'vases' | 'friends'>, now: number, rand: () => number, id: string, designs: PansyDesign[] = []): Request {
  const has = (s: SpeciesId) => state.unlocked.includes(s);
  const vases = [...BASE_VASES, ...state.vases];
  const colours = growableColours(state.unlocked, designs);
  const possible = SHAPES[v].map((f) => f(has, vases)).filter((w): w is Wish[] => w !== null);
  // only colours she can already grow; failing that, anything (she can always design a bratek)
  const easy = possible.filter((ws) => ws.every((w) => w.kind !== 'colour' || colours.has(w.colour)));
  const shapes = easy.length > 0 ? easy : possible;
  let wishes = shapes[Math.floor(rand() * shapes.length)] ?? [size(1, 7)];
  if (!state.friends[v]) wishes = wishes.slice(0, 1);
  return { id, visitor: v, wishes, at: now, text: Math.floor(rand() * NOTE_STYLES), seen: false };
}

// ---- who knocks, and when -----------------------------------------------------------------

/** Someone comes along this long after the last one left: between 6 and 18 hours. */
export const nextGap = (rand: () => number) => (6 + rand() * 12) * HOUR;

/** Her birthday: nobody comes with a request; the ones she knows leave her gifts instead. */
export const isBirthday = (now: number) => {
  const d = new Date(now);
  return d.getMonth() === 0 && d.getDate() === 1;
};

/**
 * Whether someone knocks now. A request left waiting too long is let go quietly first. Returns the
 * same object when nothing changes.
 */
export function arrive(state: Visitors, now: number, m: Moment, rand: () => number, id: string, designs: PansyDesign[] = []): Visitors {
  let s = state;
  if (s.request && now - s.request.at > REQUEST_WAITS) {
    s = { ...s, request: null, last: s.request.visitor, nextAt: now + (2 + rand() * 4) * HOUR };
  }
  if (s.request || now < s.nextAt || isBirthday(now)) return s;
  const choices = VISITOR_IDS.map((v) => ({ v, w: v === s.last ? 0 : visitorWeight(v, m) })).filter((c) => c.w > 0);
  const total = choices.reduce((n, c) => n + c.w, 0);
  if (total === 0) return s;
  let pick = rand() * total;
  const chosen = choices.find((c) => (pick -= c.w) < 0)?.v ?? choices[choices.length - 1]!.v;
  return { ...s, request: makeRequest(chosen, s, now, rand, id, designs), last: chosen };
}

/** She opened the door: the knocking stops. */
export function seeRequest(state: Visitors): Visitors {
  return state.request && !state.request.seen ? { ...state, request: { ...state.request, seen: true } } : state;
}

/** She sends them away kindly ("not now"); someone comes again later. */
export function notNow(state: Visitors, now: number, rand: () => number): Visitors {
  if (!state.request) return state;
  return { ...state, request: null, last: state.request.visitor, nextAt: now + nextGap(rand) };
}

// ---- how close the bouquet came -----------------------------------------------------------

/** What she hands over: the bouquet, and whether it's night. */
export type Given = Pick<Bouquet, 'stems' | 'vase' | 'ribbon' | 'note'> & { night: boolean };

/** How far a bouquet meets one wish, from 0 to 1. */
export function wishMet(w: Wish, b: Given): number {
  switch (w.kind) {
    case 'colour':
      return Math.min(1, b.stems.filter((s) => stemColours(s).includes(w.colour)).length / w.min);
    case 'species':
      return Math.min(1, b.stems.filter((s) => s.species === w.species).length / w.min);
    case 'size': {
      const n = b.stems.length;
      if (n >= w.min && n <= w.max) return 1;
      return n < w.min ? n / w.min : Math.max(0, 1 - (n - w.max) / 3);
    }
    case 'ribbon':
      if (w.ribbon === null) return b.ribbon === null ? 1 : 0;
      if (w.ribbon === 'any') return b.ribbon !== null ? 1 : 0;
      return b.ribbon === w.ribbon ? 1 : b.ribbon !== null ? 0.5 : 0;
    case 'vase':
      return b.vase === w.vase ? 1 : 0;
    case 'night':
      return b.night ? 1 : 0;
  }
}

/** Each visitor's favourite thing, which she can find out by chance. It's worth a fifth petal. */
export function favourite(v: VisitorId, b: Given): boolean {
  switch (v) {
    case 'jadzia':
      return b.note.trim().length > 0;
    case 'atrament':
      return b.ribbon === '#2b2229';
    case 'duszek':
      return b.stems.some((s) => s.species === 'moonflower');
    case 'rechotka':
      return b.vase === 'jug';
    case 'listonosz':
      return b.stems.some((s) => stemColours(s).includes('yellow'));
    case 'wiedzmusia':
      return b.vase === 'bottle';
    case 'jingleton':
      return b.stems.some((s) => s.species === 'daisy');
  }
}

/**
 * Petals, from one to five. Everything they asked for is four; their favourite thing makes it
 * five. Never none: a bouquet is a bouquet.
 */
export function petals(r: Request, b: Given): { petals: number; met: number[]; fav: boolean } {
  const met = r.wishes.map((w) => wishMet(w, b));
  const avg = met.length ? met.reduce((a, x) => a + x, 0) / met.length : 1;
  const fav = favourite(r.visitor, b);
  return { petals: Math.max(1, Math.min(5, 1 + Math.round(avg * 3) + (fav ? 1 : 0))), met, fav };
}

// ---- thanks -------------------------------------------------------------------------------

export function newFriend(now: number): Friend {
  return { visits: 0, hearts: 0, gifts: 0, fav: false, first: now, bouquets: [] };
}

/** Their next gift she doesn't already have, skipping flowers she can already plant. */
export function nextGift(v: VisitorId, friend: Friend, state: Pick<Visitors, 'unlocked' | 'ribbons' | 'vases'>): { gift: Gift; at: number } | null {
  const list = GIFTS[v];
  for (let i = friend.gifts; i < list.length; i++) {
    const g = list[i]!;
    if (g.kind === 'species' && state.unlocked.includes(g.species)) continue;
    if (g.kind === 'ribbon' && state.ribbons.includes(g.color)) continue;
    if (g.kind === 'vase' && state.vases.includes(g.vase)) continue;
    return { gift: g, at: i };
  }
  // after the list, a few more seeds of their bratek now and then
  return { gift: { kind: 'design', design: VISITOR_PANSIES[v], count: 2 }, at: list.length };
}

/** A gift, kept: flowers to plant, a ribbon, a vase. (Seeds of a bratek go in her tin; see state.) */
export function keepGift(state: Visitors, g: Gift): Visitors {
  if (g.kind === 'species') return state.unlocked.includes(g.species) ? state : { ...state, unlocked: [...state.unlocked, g.species] };
  if (g.kind === 'ribbon') return state.ribbons.includes(g.color) ? state : { ...state, ribbons: [...state.ribbons, g.color] };
  if (g.kind === 'vase') return state.vases.includes(g.vase) ? state : { ...state, vases: [...state.vases, g.vase] };
  return state;
}

export type Thanks = { visitor: VisitorId; petals: number; fav: boolean; firstFav: boolean; gift: Gift | null; hearts: number };

/**
 * She gives the bouquet. They take it, say how close it came, and give something back when it
 * pleased them (three petals or more); in any case they're a heart fonder of her.
 */
export function giveBouquet(state: Visitors, bouquet: Bouquet, night: boolean, now: number, rand: () => number): { visitors: Visitors; thanks: Thanks } | null {
  const r = state.request;
  if (!r) return null;
  const score = petals(r, { ...bouquet, night });
  const before = state.friends[r.visitor] ?? newFriend(now);
  const next = score.petals >= 3 ? nextGift(r.visitor, before, state) : null;
  const friend: Friend = {
    ...before,
    visits: before.visits + 1,
    hearts: Math.min(MAX_HEARTS, before.hearts + 1),
    gifts: next ? next.at + 1 : before.gifts,
    fav: before.fav || score.fav,
    bouquets: [...before.bouquets, { ...bouquet, at: now }].slice(-BOOK_BOUQUETS),
  };
  // the seeds of their bratek only now and then once the list is done
  const gift = next && (next.at < GIFTS[r.visitor].length || score.petals === 5) ? next.gift : null;
  let visitors: Visitors = {
    ...state,
    request: null,
    last: r.visitor,
    nextAt: now + nextGap(rand),
    friends: { ...state.friends, [r.visitor]: friend },
  };
  if (gift) visitors = keepGift(visitors, gift);
  return {
    visitors,
    thanks: { visitor: r.visitor, petals: score.petals, fav: score.fav, firstFav: score.fav && !before.fav, gift, hearts: friend.hearts },
  };
}

/** On her birthday, everyone she knows leaves her something at the door, once a year. */
export function birthdayGifts(state: Visitors, now: number): { visitors: Visitors; gifts: Array<{ visitor: VisitorId; gift: Gift }> } {
  const year = new Date(now).getFullYear();
  if (!isBirthday(now) || state.birthday === year) return { visitors: state, gifts: [] };
  let visitors: Visitors = { ...state, birthday: year };
  const gifts: Array<{ visitor: VisitorId; gift: Gift }> = [];
  for (const v of VISITOR_IDS) {
    const friend = visitors.friends[v];
    if (!friend) continue;
    const next = nextGift(v, friend, visitors);
    if (!next) continue;
    visitors = keepGift(visitors, next.gift);
    visitors = { ...visitors, friends: { ...visitors.friends, [v]: { ...friend, hearts: Math.min(MAX_HEARTS, friend.hearts + 1), gifts: Math.max(friend.gifts, next.at + 1) } } };
    gifts.push({ visitor: v, gift: next.gift });
  }
  return { visitors, gifts };
}

// ---- reading and starting -----------------------------------------------------------------

/** Before anyone has come: the first knock is a little while after the garden starts. */
export function noVisitors(now: number, planted: SpeciesId[] = []): Visitors {
  return {
    request: null,
    nextAt: now + 45 * 60_000,
    last: null,
    friends: {},
    unlocked: [...new Set([...STARTER_SPECIES, ...planted])],
    ribbons: [],
    vases: [],
    birthday: null,
  };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isTime = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0;
const isVisitor = (v: unknown): v is VisitorId => (VISITOR_IDS as readonly unknown[]).includes(v);
const HEX = /^#[0-9a-f]{6}$/i;

function parseWish(v: unknown): Wish | null {
  if (!isObj(v)) return null;
  const n = (x: unknown, lo: number, hi: number) => (typeof x === 'number' && Number.isFinite(x) ? Math.max(lo, Math.min(hi, Math.round(x))) : lo);
  switch (v.kind) {
    case 'colour':
      return (COLOURS as readonly unknown[]).includes(v.colour) ? { kind: 'colour', colour: v.colour as Colour, min: n(v.min, 1, 7) } : null;
    case 'species':
      return SPECIES_IDS.includes(v.species as SpeciesId) ? { kind: 'species', species: v.species as SpeciesId, min: n(v.min, 1, 7) } : null;
    case 'size': {
      const min = n(v.min, 1, 7);
      return { kind: 'size', min, max: Math.max(min, n(v.max, 1, 7)) };
    }
    case 'ribbon':
      return v.ribbon === null || v.ribbon === 'any' || (typeof v.ribbon === 'string' && HEX.test(v.ribbon)) ? { kind: 'ribbon', ribbon: v.ribbon as string | null } : null;
    case 'vase':
      return (VASES as readonly unknown[]).includes(v.vase) ? { kind: 'vase', vase: v.vase as Vase } : null;
    case 'night':
      return { kind: 'night' };
    default:
      return null;
  }
}

function parseRequest(v: unknown): Request | null {
  if (!isObj(v) || typeof v.id !== 'string' || !isVisitor(v.visitor) || !isTime(v.at)) return null;
  const wishes = (Array.isArray(v.wishes) ? v.wishes : []).map(parseWish).filter((w): w is Wish => w !== null).slice(0, 4);
  if (wishes.length === 0) return null;
  const text = typeof v.text === 'number' && Number.isInteger(v.text) && v.text >= 0 && v.text < NOTE_STYLES ? v.text : 0;
  return { id: v.id, visitor: v.visitor, wishes, at: v.at, text, seen: v.seen === true };
}

/**
 * Reads the visitors from a save. A garden from before there were any starts with the five first
 * flowers and whatever she has planted since, so nothing she grows is ever taken from her.
 */
export function parseVisitors(v: unknown, planted: SpeciesId[], now: number, parseBouquet: (x: unknown) => Bouquet | null): Visitors {
  if (!isObj(v)) return noVisitors(now, planted);
  const friends: Partial<Record<VisitorId, Friend>> = {};
  if (isObj(v.friends)) {
    for (const id of VISITOR_IDS) {
      const f = v.friends[id];
      if (!isObj(f)) continue;
      const count = (x: unknown, hi: number) => (typeof x === 'number' && Number.isFinite(x) ? Math.max(0, Math.min(hi, Math.floor(x))) : 0);
      friends[id] = {
        visits: count(f.visits, 1_000_000),
        hearts: count(f.hearts, MAX_HEARTS),
        gifts: count(f.gifts, 100),
        fav: f.fav === true,
        first: isTime(f.first) ? f.first : now,
        bouquets: (Array.isArray(f.bouquets) ? f.bouquets : []).map(parseBouquet).filter((b): b is Bouquet => b !== null).slice(-BOOK_BOUQUETS),
      };
    }
  }
  const unlocked = new Set<SpeciesId>([...STARTER_SPECIES, ...planted]);
  for (const s of Array.isArray(v.unlocked) ? v.unlocked : []) if (SPECIES_IDS.includes(s as SpeciesId)) unlocked.add(s as SpeciesId);
  const gifted = Object.values(GIFT_RIBBONS) as string[];
  return {
    request: parseRequest(v.request),
    nextAt: isTime(v.nextAt) ? Math.min(v.nextAt, now + 2 * 86_400_000) : now + HOUR,
    last: isVisitor(v.last) ? v.last : null,
    friends,
    unlocked: SPECIES_IDS.filter((s) => unlocked.has(s)),
    ribbons: (Array.isArray(v.ribbons) ? v.ribbons : []).filter((r): r is string => typeof r === 'string' && gifted.includes(r)),
    vases: (Array.isArray(v.vases) ? v.vases : []).filter((x): x is Vase => (VASES as readonly unknown[]).includes(x) && !(BASE_VASES as readonly unknown[]).includes(x)),
    birthday: typeof v.birthday === 'number' && Number.isInteger(v.birthday) ? v.birthday : null,
  };
}
