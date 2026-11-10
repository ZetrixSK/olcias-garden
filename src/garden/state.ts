import { SKY_KINDS, type Theme, type Weather } from '../theme/palettes';
import { plantedAtForStage, stageAt } from './growth';
import { imagesInUse, MAX_DRAWINGS, NO_DECOR, parseDecor, type Decor, type Drawing, type Photo, type Wallpaper } from './decor';
import { memoryImages, NO_MEMORIES, parseMemories, type Memories } from './memories';
import { noteWeather, parseTrait, parseWeatherSeen, rollTraits, type Trait, type WeatherSeen } from './traits';
import { keepPackages, parsePackages, sameLook, type Package, type PackageItem } from './packages';
import { MAX_NAME, MAX_NOTE, MAX_PRESSED, parsePressed, pressedToday, pressingOf, type Pressing } from './pressed';
import { parseOwnRoom, type OwnRoom } from '../theme/ownRoom';
import { parseLang, parseMe, type Lang, type Me } from '../i18n';
import { parseCandle, parseCandleLit, type CandleLit, type CandleLook } from './candle';
import { parseDiary, withEntry, withoutEntry, type Diary, type Mood } from './diary';
import { designId, designRef, NO_DESIGNS, PANSY_PRESETS, parseDesigns, upsert, type Designs, type PansyDesign, type PotDesign, type PotRef } from './designs';
import { lastNight, nightsBetween, runNights, settleMiddleDir, trimmed, type Vine } from './vines';
import { parseBouquet, parseCuttings, parseParcels, parsePlaced, pruneCuttings, type Bouquet, type Cutting, type PlacedBouquet } from './bouquets';
import { POT_KINDS, SPECIES, SPECIES_IDS, type GardenPot, type SpeciesId, type Stage } from './species';
import { buySeed, buyTrinket, earnPetals, noMarket, openDayStall, openNightStall, parseMarket, placeFigure, type Market, type SeedItem } from './market';
import { arrive, birthdayGifts, giveBouquet, momentAt, noVisitors, notNow, parseVisitors, seeRequest, type Gift, type Thanks, type Visitors } from './visitors';
import { logEvent, NO_PAPER, parsePaper, type PaperEvent, type PaperState } from '../paper/log';

export const SLOT_IDS = [
  'hang-l', 'sill-l', 'sill-r', 'hang-r',
  'row2-a', 'row2-b', 'row2-c', 'row2-d',
  'row3-a', 'row3-b', 'row3-c', 'row3-d',
] as const;
export type SlotId = (typeof SLOT_IDS)[number];
/** The two pots hanging from the ceiling: only plants can hang there, not drawings. */
export const HANGING_SLOTS: readonly SlotId[] = ['hang-l', 'hang-r'];
export const isHanging = (slot: SlotId) => HANGING_SLOTS.includes(slot);

/** Places in the room view's window: three on the hanging shelf, three on the sill. */
export const WINDOW_SPOTS = ['shelf-1', 'shelf-2', 'shelf-3', 'sill-1', 'sill-2', 'sill-3'] as const;
export type WindowSpot = (typeof WINDOW_SPOTS)[number];

export type Plant = {
  id: string;
  species: SpeciesId;
  slot: SlotId;
  pot: PotRef;
  /** For a bratek: which colours it blooms in, a built-in variety or one she designed. */
  variety: string | null;
  plantedAt: number;
  waterings: number[];
  /** Where it is shown in the window, if anywhere. It stays on its shelf as well. */
  display: WindowSpot | null;
  /** Grown out of its pot and around the window; only pansies and roses ever do. */
  vine: Vine | null;
  /** A name she gave it, if any. */
  name: string | null;
  /** Something a night left on it (enchanted, dewy, sun-kissed, frosted, willowy), for good. */
  trait: Trait | null;
  /** Grown from mystery seeds: what it is stays a secret until it flowers. */
  mystery?: true;
  /** One of the first few she planted: it grows faster (see growth). */
  quick?: true;
};

/** Seeds of one of her bratek designs, waiting in the seed tin. */
export type SeedPacket = {
  id: string;
  variety: string;
  count: number;
  made: number;
  /** Mystery seeds from the post: a plain packet, no picture or name, until they flower. */
  mystery?: true;
};
export const MAX_PACKETS = 40;
export const MAX_SEEDS = 6;

export type View = 'room' | 'shelves';
/** The letter: waiting to be read, kept after reading, or thrown away for good. */
export type LetterState = 'unread' | 'kept' | 'deleted';
/** 'clock' follows local time only; 'live' uses Open-Meteo; 'manual' shows the weather she picked. */
export type WeatherMode = 'clock' | 'live' | 'manual';

export type Settings = {
  theme: Theme;
  view: View;
  weatherMode: WeatherMode;
  manual: Weather;
  location: { lat: number; lon: number } | null;
  /** Whether plants may outgrow their pots. Off hides the vines too; they come back when it's on. */
  vines: boolean;
  letter: LetterState;
  /** Her own room colours, kept even while one of the ready-made rooms is showing. */
  own: OwnRoom | null;
  /** Whether her own room is the one showing. */
  useOwn: boolean;
  /** Whether the iPhone "Add to Home Screen" note has been shown and put away. */
  installHint: boolean;
  /** Her own candle on the sill; null for the room's own. */
  candle: CandleLook | null;
  /** Lit or blown out by her; null lights itself whenever the room is dim. */
  candleLit: CandleLit;
  /** Soft sounds of the weather and the room. Off unless she turns them on. */
  sound: boolean;
  /** Polish, English, or English with Polish flower names (the first, and still the default). */
  lang: Lang;
  /** Whether her diary and pressed-flower notes go up with the shared garden. Off unless both agree. */
  shareNotes: boolean;
  /** Who holds this phone, for the Polish words said to them. Her, unless he set it on his. */
  me: Me;
  /** The garden's name on the sign, if she gave it one; otherwise the sign says "Olcia's garden". */
  gardenName: string | null;
  /** Whether she has been asked, once, to choose her tag (after the letter, the first time). */
  tagAsked: boolean;
  /** Whether the curtains are drawn across the window. */
  curtainsClosed: boolean;
  /** The newest version she has seen in "What's new"; null until the garden first opens. */
  seenVersion: string | null;
  /** Whether the garden moves: like the phone says ('phone'), or always. */
  motion: 'phone' | 'always';
  /** How big the round buttons are. */
  hud: 's' | 'm' | 'l';
};

/** Long enough for a real name, short enough to fit on the sign. */
export const MAX_GARDEN_NAME = 24;

export const SAVE_VERSION = 4;

export type GardenState = {
  version: typeof SAVE_VERSION;
  plants: Plant[];
  settings: Settings;
  /** The last 3:00 whose nightly vine check has been done. */
  vinesCheckedAt: number;
  /** When the garden was last open on screen, so the next visit can show what happened since. */
  lastSeen: number;
  /** Bratki and pots she designed herself. */
  designs: Designs;
  /** Her book of pressed flowers, oldest first. */
  pressed: Pressing[];
  /** Her own wallpaper, framed photo and drawings on the shelves. */
  decor: Decor;
  /** Her diary, one page per day. */
  diary: Diary;
  /** Changes sent from the admin page that have been handled here, newest last, so none is ever done twice. */
  remoteDone: RemoteDone[];
  /** Bouquets standing on the shelves. */
  bouquets: PlacedBouquet[];
  /** Bouquets waiting in a box on the floor, until there's room on the shelves. */
  parcels: Bouquet[];
  /** Stems cut today (and yesterday), so each plant only gives a few a day. */
  cuttings: Cutting[];
  /** Her post box: her own tag, and the tags she has sent to, most recent first. */
  post: Post;
  /** Her photos and paintings, and the albums she keeps them in. */
  memories: Memories;
  /** The weather the garden saw on recent days while it was open, so a night can answer to it. */
  weatherSeen: WeatherSeen;
  /** Her seed tin: packets of seeds from her own designs. */
  seeds: SeedPacket[];
  /** Packages that came in the post: the ones still wrapped, and opened ones with their letters. */
  packages: Package[];
  /** Who knocks at the door asking for bouquets, how fond of her they are, and what they gave her. */
  visitors: Visitors;
  /** Her petals to spend, the market stalls, and the trinkets she has collected. */
  market: Market;
  /** Her first days: how many she has planted (the first few grow faster), and the little notes. */
  start: Start;
  /** The morning papers: what happened for them to report, his notes for them, the last day she read them. */
  paper: PaperState;
};

/** The first few plantings that grow faster. */
export const QUICK_PLANTS = 3;
/** The notes that show her round, in order; `tip` is the next one, `off` if she said no thanks. */
export type Start = { planted: number; tip: number; off: boolean };
export const TIPS = ['swipe', 'plant', 'water', 'bouquet', 'market', 'night'] as const;
export type Tip = (typeof TIPS)[number];

/** Her tag, the tags she has sent to, and how many bouquets came since she last opened the post box. */
export type Post = { tag: string | null; contacts: string[]; unread: number };
const TAG = /^[a-z0-9_]{3,20}$/;
export const MAX_CONTACTS = 8;

/** What became of an action sent to this garden: done, or skipped and why. */
export type RemoteDone = { id: string; status: 'applied' | 'skipped'; reason: string | null };
/** Plenty to cover anything still waiting to be reported back; older ones are forgotten. */
export const MAX_REMOTE_DONE = 100;

export const DEFAULT_SETTINGS: Settings = {
  theme: 'cozy',
  view: 'room',
  weatherMode: 'clock',
  manual: { sky: 'clear', night: false },
  location: null,
  vines: true,
  letter: 'unread',
  own: null,
  useOwn: false,
  installHint: false,
  candle: null,
  candleLit: null,
  sound: false,
  lang: 'mixed',
  shareNotes: false,
  me: 'she',
  gardenName: null,
  tagAsked: false,
  curtainsClosed: false,
  seenVersion: null,
  motion: 'always',
  hud: 'm',
};

export function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** First visit: a few plants already growing at different stages; the bottom shelf is left for her. */
export function starterGarden(now: number): GardenState {
  const p = (species: SpeciesId, slot: SlotId, stage: Stage, display: WindowSpot | null = null): Plant => ({
    id: newId(),
    species,
    slot,
    pot: SPECIES[species].pot,
    variety: null,
    plantedAt: plantedAtForStage(species, stage, now),
    waterings: [],
    display,
    vine: null,
    name: null,
    trait: null,
  });
  // a tulip just about to open: it flowers within a few hours of her arriving
  const tulip = { ...p('tulip', 'hang-l', 'bud', 'sill-1'), plantedAt: now - (SPECIES.tulip.hours[2] - 3) * 3_600_000 };
  return {
    version: SAVE_VERSION,
    // three flowers in the window to welcome her; the shelves below are left for her to fill
    plants: [p('pansy', 'sill-l', 'bloom', 'sill-2'), p('rose', 'sill-r', 'bloom', 'sill-3'), tulip],
    settings: { ...DEFAULT_SETTINGS },
    vinesCheckedAt: lastNight(now),
    lastSeen: now,
    designs: NO_DESIGNS,
    pressed: [],
    decor: NO_DECOR,
    diary: {},
    remoteDone: [],
    bouquets: [],
    parcels: [],
    cuttings: [],
    post: { tag: null, contacts: [], unread: 0 },
    memories: NO_MEMORIES,
    weatherSeen: {},
    seeds: [],
    packages: [],
    visitors: noVisitors(now),
    market: noMarket(),
    start: { planted: 0, tip: 0, off: false },
    paper: NO_PAPER,
  };
}

/** Every picture the garden keeps: her decorations and her memories. */
export function gardenImages(state: GardenState): Set<string> {
  const used = imagesInUse(state.decor);
  for (const k of memoryImages(state.memories)) used.add(k);
  return used;
}

export function withMemories(state: GardenState, fn: (m: Memories) => Memories): GardenState {
  return { ...state, memories: fn(state.memories) };
}

export function plantAt(state: GardenState, slot: SlotId): Plant | undefined {
  return state.plants.find((p) => p.slot === slot);
}

export function drawingAt(state: GardenState, slot: SlotId): Drawing | undefined {
  return state.decor.drawings.find((d) => d.slot === slot);
}

/** A figure from the night market (or Milton) standing in a place on the shelves. */
export function figureAt(state: GardenState, slot: SlotId): Market['figures'][number] | undefined {
  return state.market.figures.find((f) => f.slot === slot);
}

export function bouquetAt(state: GardenState, slot: SlotId): PlacedBouquet | undefined {
  return state.bouquets.find((b) => b.slot === slot);
}

/** Places on the shelves where a vase or a drawing could stand: not the hanging pots, and nothing there yet. */
export function freeShelfSlots(state: GardenState): SlotId[] {
  return SLOT_IDS.filter((slot) => !isHanging(slot) && !plantAt(state, slot) && !drawingAt(state, slot) && !bouquetAt(state, slot) && !figureAt(state, slot));
}

/** Moves whatever stands in one place to another (a plant, a drawing or a bouquet), as part of a swap. */
function relocate(state: GardenState, from: SlotId, to: SlotId): Pick<GardenState, 'plants' | 'decor' | 'bouquets' | 'market'> {
  return {
    plants: state.plants.map((p) => (p.slot === from ? { ...p, slot: to } : p)),
    decor: { ...state.decor, drawings: state.decor.drawings.map((d) => (d.slot === from ? { ...d, slot: to } : d)) },
    bouquets: state.bouquets.map((b) => (b.slot === from ? { ...b, slot: to } : b)),
    market: { ...state.market, figures: state.market.figures.map((f) => (f.slot === from ? { ...f, slot: to } : f)) },
  };
}

export function addPlant(state: GardenState, slot: SlotId, species: SpeciesId, now: number, id = newId(), variety: string | null = null): GardenState {
  if (plantAt(state, slot) || drawingAt(state, slot) || bouquetAt(state, slot) || figureAt(state, slot)) return state;
  const plant: Plant = {
    id, species, slot, pot: SPECIES[species].pot, variety: species === 'pansy' ? variety : null,
    plantedAt: now, waterings: [], display: null, vine: null, name: null, trait: null,
  };
  return { ...state, plants: [...state.plants, plant] };
}

export function waterPlant(state: GardenState, id: string, now: number): GardenState {
  return {
    ...state,
    plants: state.plants.map((p) => (p.id === id ? { ...p, waterings: [...p.waterings, now].slice(-20) } : p)),
  };
}

/**
 * Move to another slot; if something already lives there, the two swap places. A drawing can't be
 * swapped up into a hanging pot, so that move simply doesn't happen.
 */
export function movePlant(state: GardenState, id: string, to: SlotId): GardenState {
  const moving = state.plants.find((p) => p.id === id);
  if (!moving || moving.slot === to) return state;
  const from = moving.slot;
  // drawings and vases can't be swapped up into a hanging pot
  if ((drawingAt(state, to) || bouquetAt(state, to) || figureAt(state, to)) && isHanging(from)) return state;
  const swapped = relocate(state, to, from);
  return { ...state, ...swapped, plants: swapped.plants.map((p) => (p.id === id ? { ...p, slot: to } : p)) };
}

/** Stands one of her drawings in an empty spot on the shelves. */
export function addDrawing(state: GardenState, drawing: Drawing): GardenState {
  const slot = drawing.slot as SlotId;
  if (!SLOT_IDS.includes(slot) || isHanging(slot) || plantAt(state, slot) || drawingAt(state, slot) || bouquetAt(state, slot) || figureAt(state, slot)) return state;
  if (state.decor.drawings.length >= MAX_DRAWINGS) return state;
  return { ...state, decor: { ...state.decor, drawings: [...state.decor.drawings, drawing] } };
}

/** Moves a drawing along the shelves, swapping with whatever stands there; never into a hanging pot. */
export function moveDrawing(state: GardenState, id: string, to: SlotId): GardenState {
  const moving = state.decor.drawings.find((d) => d.id === id);
  if (!moving || moving.slot === to || isHanging(to)) return state;
  const swapped = relocate(state, to, moving.slot as SlotId);
  return { ...state, ...swapped, decor: { ...swapped.decor, drawings: swapped.decor.drawings.map((d) => (d.id === id ? { ...d, slot: to } : d)) } };
}

/**
 * A bouquet arrives on the shelves: in the first free place, or, with no room, in a box on the
 * floor so it's never lost. Each bouquet only ever arrives once.
 */
export function receiveBouquet(state: GardenState, bouquet: Bouquet): GardenState {
  if (state.bouquets.some((b) => b.id === bouquet.id) || state.parcels.some((b) => b.id === bouquet.id)) return state;
  const slot = freeShelfSlots(state)[0];
  return slot ? { ...state, bouquets: [...state.bouquets, { ...bouquet, slot }] } : { ...state, parcels: [...state.parcels, bouquet] };
}

/** Notes the stems cut from her plants for a bouquet, so each plant only gives a few a day. */
export function cutStems(state: GardenState, plantIds: string[], now: number): GardenState {
  return { ...state, cuttings: pruneCuttings([...state.cuttings, ...plantIds.map((plant) => ({ plant, at: now }))], now) };
}

/** Takes a bouquet out of its box and stands it on the shelves; nothing happens without a free place. */
export function unpackParcel(state: GardenState, id: string): GardenState {
  const parcel = state.parcels.find((b) => b.id === id);
  const slot = freeShelfSlots(state)[0];
  if (!parcel || !slot) return state;
  return { ...state, parcels: state.parcels.filter((b) => b.id !== id), bouquets: [...state.bouquets, { ...parcel, slot }] };
}

/** Moves a bouquet along the shelves, swapping with whatever stands there; never into a hanging pot. */
export function moveBouquet(state: GardenState, id: string, to: SlotId): GardenState {
  const moving = state.bouquets.find((b) => b.id === id);
  if (!moving || moving.slot === to || isHanging(to)) return state;
  const swapped = relocate(state, to, moving.slot as SlotId);
  return { ...state, ...swapped, bouquets: swapped.bouquets.map((b) => (b.id === id ? { ...b, slot: to } : b)) };
}

/** A bouquet comes in the post: on the shelves or in the box, and the letterbox's flag goes up. */
export function receivePost(state: GardenState, bouquet: Bouquet): GardenState {
  const next = receiveBouquet(state, bouquet);
  return next === state ? state : noted({ ...next, post: { ...next.post, unread: next.post.unread + 1 } }, { at: Date.now(), kind: 'post', from: bouquet.from ?? null });
}

/** She has looked in the post box: the flag comes down. */
export function postSeen(state: GardenState): GardenState {
  return state.post.unread === 0 ? state : { ...state, post: { ...state.post, unread: 0 } };
}

/** Her own tag, as the post box took it. */
export function setTag(state: GardenState, tag: string | null): GardenState {
  return { ...state, post: { ...state.post, tag } };
}

/** Someone she has sent to goes to the front of her list. */
export function rememberContact(state: GardenState, tag: string): GardenState {
  const t = tag.replace(/^#/, '').toLowerCase();
  if (!TAG.test(t)) return state;
  return { ...state, post: { ...state.post, contacts: [t, ...state.post.contacts.filter((c) => c !== t)].slice(0, MAX_CONTACTS) } };
}

/** A bouquet is put away for good. */
export function removeBouquet(state: GardenState, id: string): GardenState {
  return { ...state, bouquets: state.bouquets.filter((b) => b.id !== id), parcels: state.parcels.filter((b) => b.id !== id) };
}

export function removeDrawing(state: GardenState, id: string): GardenState {
  return { ...state, decor: { ...state.decor, drawings: state.decor.drawings.filter((d) => d.id !== id) } };
}

/** Her wallpaper, or null for the room's own. */
export function setWallpaper(state: GardenState, wallpaper: Wallpaper | null): GardenState {
  return { ...state, decor: { ...state.decor, wallpaper } };
}

/** The photo in the frame, or null for the little painting that's there by default. */
export function setPhoto(state: GardenState, photo: Photo | null): GardenState {
  return { ...state, decor: { ...state.decor, photo } };
}

export function windowPlantAt(state: GardenState, spot: WindowSpot): Plant | undefined {
  return state.plants.find((p) => p.display === spot);
}

/**
 * Shows a plant in a window spot. A plant already in the window swaps places with whatever is
 * there; a plant coming from the shelves sends the current one back to just its shelf.
 */
export function placeInWindow(state: GardenState, id: string, spot: WindowSpot): GardenState {
  const plant = state.plants.find((p) => p.id === id);
  if (!plant || plant.display === spot) return state;
  const from = plant.display;
  const plants = state.plants.map((p) => (p.id === id ? { ...p, display: spot } : p.display === spot ? { ...p, display: from } : p));
  return { ...state, plants: settleMiddleDir(plants) };
}

/** Cuts a vine back one step. */
export function trimVine(state: GardenState, id: string): GardenState {
  return { ...state, plants: state.plants.map((p) => (p.id === id ? { ...p, vine: trimmed(p.vine) } : p)) };
}

/** Whether a flower can be pressed from this plant now: it has to be in bloom, and each plant gives one a day. */
export function canPress(state: GardenState, id: string, now: number): boolean {
  const plant = state.plants.find((p) => p.id === id);
  return (
    !!plant &&
    stageAt(plant.species, plant, now) === 'bloom' &&
    !pressedToday(state.pressed, id, now) &&
    state.pressed.length < MAX_PRESSED
  );
}

/** Presses one of the plant's flowers into the book. The plant itself is none the worse for it. */
export function pressFlower(state: GardenState, id: string, now: number, pressId = newId()): GardenState {
  const plant = state.plants.find((p) => p.id === id);
  if (!plant || !canPress(state, id, now)) return state;
  return { ...state, pressed: [...state.pressed, pressingOf(plant, state.designs, now, pressId)] };
}

/** Names a plant; an empty name takes the name away. */
export function setPlantName(state: GardenState, id: string, name: string): GardenState {
  const clean = name.trim().slice(0, MAX_NAME);
  return { ...state, plants: state.plants.map((p) => (p.id === id ? { ...p, name: clean || null } : p)) };
}

/** What she wrote beside a pressed flower. */
export function setPressNote(state: GardenState, pressId: string, note: string): GardenState {
  return { ...state, pressed: state.pressed.map((p) => (p.id === pressId ? { ...p, note: note.slice(0, MAX_NOTE) } : p)) };
}

/** Saves a day's diary page; a page with no mood and nothing written is taken out. */
export function saveDiaryEntry(state: GardenState, key: string, mood: Mood | null, text: string, now: number): GardenState {
  return { ...state, diary: withEntry(state.diary, key, mood, text, now) };
}

export function deleteDiaryEntry(state: GardenState, key: string): GardenState {
  return { ...state, diary: withoutEntry(state.diary, key) };
}

/** Takes a flower back out of the book. */
export function unpress(state: GardenState, pressId: string): GardenState {
  return { ...state, pressed: state.pressed.filter((p) => p.id !== pressId) };
}

/** Catches up on every 3:00 since the last visit. Returns the same object when nothing is due. */
export function catchUpNights(state: GardenState, now: number): GardenState {
  // each night since the last check may leave a trait on a plant that had sprouted by then
  const traited = rollTraits(state.plants, nightsBetween(state.vinesCheckedAt, now), state.weatherSeen, (p, at) => stageAt(p.species, p, at) !== 'seed');
  const { plants, checkedAt } = runNights(traited, state.vinesCheckedAt, now, state.settings.vines);
  if (checkedAt === state.vinesCheckedAt) return state;
  return { ...state, plants, vinesCheckedAt: checkedAt };
}

/** Remembers today's weather, for the night to come. */
export function sawWeather(state: GardenState, now: number, w: { sky: 'clear' | 'cloudy' | 'rain'; night: boolean }): GardenState {
  const weatherSeen = noteWeather(state.weatherSeen, now, w);
  return weatherSeen === state.weatherSeen ? state : { ...state, weatherSeen };
}

/** A package has come in the post: it waits, wrapped, and the letterbox's flag goes up. */
export function receivePackage(state: GardenState, pkg: Package): GardenState {
  if (state.packages.some((p) => p.id === pkg.id)) return state;
  return noted(
    { ...state, packages: keepPackages([...state.packages, { ...pkg, opened: null }]), post: { ...state.post, unread: state.post.unread + 1 } },
    { at: Date.now(), kind: 'package', from: pkg.from ?? null },
  );
}

/**
 * She opens a package and takes what's inside: bouquets go on the shelves (or the box on the
 * floor), seeds into her tin, with their design added to hers unless she has one just like it.
 * The package is kept, opened, so its letter can be read again.
 */
export function openPackage(state: GardenState, id: string, now: number): GardenState {
  const pkg = state.packages.find((p) => p.id === id);
  if (!pkg || pkg.opened !== null) return state;
  let g = state;
  pkg.items.forEach((item, i) => {
    if (item.kind === 'bouquet') {
      g = receiveBouquet(g, item.bouquet);
      return;
    }
    const same = g.designs.pansies.find((d) => sameLook(d, item.design));
    let ref: string;
    if (same) ref = designRef(same.id);
    else {
      const design = { ...item.design, id: `post-${pkg.id.slice(0, 8)}-${i}` };
      g = savePansyDesign(g, design);
      ref = designRef(design.id);
    }
    g = addSeeds(g, ref, item.count, now, `${pkg.id}:${i}`, item.mystery);
  });
  return { ...g, packages: g.packages.map((p) => (p.id === id ? { ...p, opened: now } : p)) };
}

/** What she put in a package she sent leaves her garden: bouquets from the shelves, seeds from the tin. */
export function giveAway(state: GardenState, items: Array<{ bouquetId: string } | { packetId: string; count: number }>): GardenState {
  let g = state;
  for (const it of items) {
    if ('bouquetId' in it) g = removeBouquet(g, it.bouquetId);
    else
      g = {
        ...g,
        seeds: g.seeds.flatMap((s) => (s.id !== it.packetId ? [s] : s.count > it.count ? [{ ...s, count: s.count - it.count }] : [])),
      };
  }
  return g;
}

/**
 * The things in a package, as they travel: copies of the bouquets, and the design for the seeds.
 * Seeds go as a mystery when she asks, and mystery seeds she was sent stay one when passed on.
 */
export function packageItems(state: GardenState, picked: Array<{ bouquetId: string } | { packetId: string; count: number }>, mystery = false): PackageItem[] {
  const out: PackageItem[] = [];
  for (const it of picked) {
    if ('bouquetId' in it) {
      const b = state.bouquets.find((x) => x.id === it.bouquetId) ?? state.parcels.find((x) => x.id === it.bouquetId);
      if (b) out.push({ kind: 'bouquet', bouquet: { id: b.id, stems: b.stems, vase: b.vase, ribbon: b.ribbon, note: b.note, from: b.from, at: b.at, seed: b.seed } });
    } else {
      const packet = state.seeds.find((s) => s.id === it.packetId);
      const design = packet ? state.designs.pansies.find((d) => designRef(d.id) === packet.variety) : undefined;
      if (packet && design) out.push({ kind: 'seeds', design, count: Math.min(packet.count, it.count), mystery: mystery || packet.mystery === true });
    }
  }
  return out;
}

/** A packet of seeds of one of her designs, into the tin. */
export function addSeeds(state: GardenState, variety: string, count: number, now: number, id = newId(), mystery = false): GardenState {
  const n = Math.max(1, Math.min(MAX_SEEDS, Math.round(count)));
  if (state.seeds.length >= MAX_PACKETS) return state;
  return { ...state, seeds: [...state.seeds, { id, variety, count: n, made: now, ...(mystery ? { mystery: true as const } : {}) }] };
}

/** Sows one seed from a packet in an empty place; an empty packet is thrown away. */
export function sowSeed(state: GardenState, packetId: string, slot: SlotId, now: number, id = newId()): GardenState {
  const packet = state.seeds.find((s) => s.id === packetId);
  if (!packet || packet.count < 1) return state;
  let planted = addPlant(state, slot, 'pansy', now, id, packet.variety);
  if (planted === state) return state;
  if (packet.mystery) planted = { ...planted, plants: planted.plants.map((p) => (p.id === id ? { ...p, mystery: true as const } : p)) };
  const seeds = state.seeds.flatMap((s) => (s.id !== packetId ? [s] : s.count > 1 ? [{ ...s, count: s.count - 1 }] : []));
  return { ...planted, seeds };
}

export function takeDown(state: GardenState, id: string): GardenState {
  return { ...state, plants: state.plants.map((p) => (p.id === id ? { ...p, display: null } : p)) };
}

export function removePlant(state: GardenState, id: string): GardenState {
  return { ...state, plants: state.plants.filter((p) => p.id !== id) };
}

export function cyclePot(state: GardenState, id: string): GardenState {
  const next = (pot: PotRef) => POT_KINDS[(POT_KINDS.indexOf(pot as GardenPot) + 1) % POT_KINDS.length]!;
  return { ...state, plants: state.plants.map((p) => (p.id === id ? { ...p, pot: next(p.pot) } : p)) };
}

export function setPot(state: GardenState, id: string, pot: PotRef): GardenState {
  return { ...state, plants: state.plants.map((p) => (p.id === id ? { ...p, pot } : p)) };
}

export function setVariety(state: GardenState, id: string, variety: string): GardenState {
  return { ...state, plants: state.plants.map((p) => (p.id === id && p.species === 'pansy' ? { ...p, variety } : p)) };
}

export function savePansyDesign(state: GardenState, design: PansyDesign): GardenState {
  return { ...state, designs: { ...state.designs, pansies: upsert(state.designs.pansies, design) } };
}

export function savePotDesign(state: GardenState, design: PotDesign): GardenState {
  return { ...state, designs: { ...state.designs, pots: upsert(state.designs.pots, design) } };
}

/** Throws a design away; plants that used it go back to their usual pot or colours. */
export function deleteDesign(state: GardenState, kind: 'pansy' | 'pot', id: string): GardenState {
  const ref = `d:${id}`;
  const designs =
    kind === 'pansy'
      ? { ...state.designs, pansies: state.designs.pansies.filter((d) => d.id !== id) }
      : { ...state.designs, pots: state.designs.pots.filter((d) => d.id !== id) };
  const plants = state.plants.map((p) =>
    kind === 'pot' && p.pot === ref ? { ...p, pot: SPECIES[p.species].pot } : kind === 'pansy' && p.variety === ref ? { ...p, variety: null } : p,
  );
  return { ...state, designs, plants };
}

export function updateSettings(state: GardenState, patch: Partial<Settings>): GardenState {
  return { ...state, settings: { ...state.settings, ...patch } };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isTime = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0;

function parsePost(v: unknown): Post {
  const p = isObj(v) ? v : {};
  const tag = typeof p.tag === 'string' && TAG.test(p.tag) ? p.tag : null;
  const contacts = (Array.isArray(p.contacts) ? p.contacts : []).filter((c): c is string => typeof c === 'string' && TAG.test(c)).slice(0, MAX_CONTACTS);
  const unread = typeof p.unread === 'number' && Number.isFinite(p.unread) ? Math.max(0, Math.min(99, Math.floor(p.unread))) : 0;
  return { tag, contacts, unread };
}

function parseRemoteDone(v: unknown): RemoteDone[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter(isObj)
    .flatMap((d): RemoteDone[] =>
      typeof d.id === 'string' && (d.status === 'applied' || d.status === 'skipped')
        ? [{ id: d.id, status: d.status, reason: typeof d.reason === 'string' ? d.reason : null }]
        : [],
    )
    .slice(-MAX_REMOTE_DONE);
}

function parsePotRef(pot: unknown, species: SpeciesId, designs: Designs): PotRef {
  if (POT_KINDS.includes(pot as GardenPot)) return pot as GardenPot;
  const id = designId(typeof pot === 'string' ? pot : undefined);
  return id !== null && designs.pots.some((d) => d.id === id) ? (pot as PotRef) : SPECIES[species].pot;
}

function parseVariety(v: unknown, species: SpeciesId, designs: Designs): string | null {
  if (species !== 'pansy' || typeof v !== 'string') return null;
  if ((PANSY_PRESETS as readonly string[]).includes(v)) return v;
  const id = designId(v);
  return id !== null && designs.pansies.some((d) => d.id === id) ? v : null;
}

function parsePlant(v: unknown, designs: Designs): Plant | null {
  if (!isObj(v)) return null;
  const { id, species, slot, pot, variety, plantedAt, waterings, display, vine, name } = v;
  if (typeof id !== 'string' || !SPECIES_IDS.includes(species as SpeciesId)) return null;
  if (!SLOT_IDS.includes(slot as SlotId) || !isTime(plantedAt)) return null;
  return {
    id,
    species: species as SpeciesId,
    slot: slot as SlotId,
    pot: parsePotRef(pot, species as SpeciesId, designs),
    variety: parseVariety(variety, species as SpeciesId, designs),
    plantedAt,
    waterings: Array.isArray(waterings) ? waterings.filter(isTime) : [],
    display: WINDOW_SPOTS.includes(display as WindowSpot) ? (display as WindowSpot) : null,
    vine: parseVine(vine, species as SpeciesId),
    name: typeof name === 'string' && name.trim() ? name.trim().slice(0, MAX_NAME) : null,
    trait: parseTrait(v.trait),
    ...(v.mystery === true ? { mystery: true as const } : {}),
    ...(v.quick === true ? { quick: true as const } : {}),
  };
}

/**
 * Designs that are still a secret: the ones in packets of mystery seeds, and the ones mystery seeds
 * are growing into but haven't flowered as yet. They're left out of the lists of her designs.
 */
export function secretDesigns(state: GardenState, now: number): Set<string> {
  const out = new Set<string>();
  for (const s of state.seeds) if (s.mystery) out.add(s.variety);
  for (const p of state.plants) if (p.mystery && p.variety && stageAt(p.species, p, now) !== 'bloom') out.add(p.variety);
  return out;
}

function parseVine(v: unknown, species: SpeciesId): Vine | null {
  if (!isObj(v) || (species !== 'pansy' && species !== 'rose')) return null;
  const { length, dir } = v;
  if (typeof length !== 'number' || !Number.isFinite(length) || length <= 0) return null;
  const vine: Vine = { length: Math.min(1, length) };
  if (dir === 'left' || dir === 'right') vine.dir = dir;
  return vine;
}

function parseWeather(v: unknown): Weather {
  const w = isObj(v) ? v : {};
  return {
    sky: SKY_KINDS.includes(w.sky as Weather['sky']) ? (w.sky as Weather['sky']) : 'clear',
    night: w.night === true,
  };
}

export function parseSettings(v: unknown): Settings {
  const s = isObj(v) ? v : {};
  const modes: WeatherMode[] = ['clock', 'live', 'manual'];
  const loc = s.location;
  return {
    theme: s.theme === 'witchy' ? 'witchy' : 'cozy',
    view: s.view === 'shelves' ? 'shelves' : 'room',
    weatherMode: modes.includes(s.weatherMode as WeatherMode) ? (s.weatherMode as WeatherMode) : 'clock',
    manual: parseWeather(s.manual),
    location:
      isObj(loc) && typeof loc.lat === 'number' && typeof loc.lon === 'number' ? { lat: loc.lat, lon: loc.lon } : null,
    vines: s.vines !== false,
    letter: s.letter === 'kept' || s.letter === 'deleted' ? s.letter : 'unread',
    own: parseOwnRoom(s.own),
    useOwn: s.useOwn === true && parseOwnRoom(s.own) !== null,
    installHint: s.installHint === true,
    candle: parseCandle(s.candle),
    candleLit: parseCandleLit(s.candleLit),
    sound: s.sound === true,
    lang: parseLang(s.lang),
    shareNotes: s.shareNotes === true,
    me: parseMe(s.me),
    gardenName: typeof s.gardenName === 'string' && s.gardenName.trim() ? s.gardenName.slice(0, MAX_GARDEN_NAME) : null,
    tagAsked: s.tagAsked === true,
    curtainsClosed: s.curtainsClosed === true,
    seenVersion: typeof s.seenVersion === 'string' && /^\d+\.\d+\.\d+$/.test(s.seenVersion) ? s.seenVersion : null,
    // the garden moves unless she has asked it to keep still like the phone
    motion: s.motion === 'phone' ? 'phone' : 'always',
    // gardens from before the setting keep the size they had
    hud: s.hud === 'm' || s.hud === 'l' ? s.hud : 's',
  };
}

/**
 * Version 1 had two side shelves next to the window (now gone) and stored a picked weather as a
 * single word. Plants from the removed slots move to the first free places.
 */
function migrateV1(raw: Record<string, unknown>): Record<string, unknown> {
  const plants = (raw.plants as unknown[]).filter(isObj);
  const used = new Set(plants.map((p) => p.slot));
  const free = SLOT_IDS.filter((id) => !used.has(id));
  const moved = plants.map((p) => (p.slot === 'row1-a' || p.slot === 'row1-d' ? { ...p, slot: free.shift() } : p));
  const settings = isObj(raw.settings) ? raw.settings : {};
  const old = settings.weatherMode;
  const pinned: Record<string, Weather> = {
    sunny: { sky: 'clear', night: false },
    cloudy: { sky: 'cloudy', night: false },
    rain: { sky: 'rain', night: false },
    night: { sky: 'clear', night: true },
  };
  const manual = typeof old === 'string' ? pinned[old] : undefined;
  return {
    ...raw,
    version: 2,
    plants: moved,
    settings: manual ? { ...settings, weatherMode: 'manual', manual } : settings,
  };
}

/** Version 2 had no window display; the first plants on the shelves go onto the sill so the window isn't bare. */
function migrateV2(raw: Record<string, unknown>): Record<string, unknown> {
  const plants = (raw.plants as unknown[]).filter(isObj);
  const order = (p: Record<string, unknown>) => SLOT_IDS.indexOf(p.slot as SlotId);
  const first = [...plants].filter((p) => order(p) >= 0).sort((a, b) => order(a) - order(b)).slice(0, 3);
  const sill: WindowSpot[] = ['sill-2', 'sill-1', 'sill-3'];
  return { ...raw, version: 3, plants: plants.map((p) => ({ ...p, display: sill[first.indexOf(p)] ?? null })) };
}

/**
 * Reads a saved garden defensively. Older versions are migrated; broken entries are dropped one by
 * one rather than throwing the whole garden away. Returns null only when the save is unusable.
 */
export function parseSave(input: unknown, now = Date.now()): GardenState | null {
  if (!isObj(input) || !Array.isArray(input.plants)) return null;
  let raw = input;
  if (raw.version === 1) raw = migrateV1(raw);
  if (raw.version === 2) raw = migrateV2(raw);
  // version 3 had no vines: nothing has outgrown yet, and the nightly checks start from now
  if (raw.version === 3) raw = { ...raw, version: 4, vinesCheckedAt: lastNight(now) };
  if (raw.version !== SAVE_VERSION) return null;
  const designs = parseDesigns(raw.designs);
  const taken = new Set<SlotId>();
  const shown = new Set<WindowSpot>();
  const plants: Plant[] = [];
  for (const entry of raw.plants as unknown[]) {
    const plant = parsePlant(entry, designs);
    if (plant && !taken.has(plant.slot)) {
      taken.add(plant.slot);
      if (plant.display && shown.has(plant.display)) plant.display = null;
      if (plant.display) shown.add(plant.display);
      plants.push(plant);
    }
  }
  const checked = isTime(raw.vinesCheckedAt) && raw.vinesCheckedAt <= now ? raw.vinesCheckedAt : lastNight(now);
  const lastSeen = isTime(raw.lastSeen) && raw.lastSeen <= now ? raw.lastSeen : now;
  const shelfFree = (slot: string) => SLOT_IDS.includes(slot as SlotId) && !isHanging(slot as SlotId) && !taken.has(slot as SlotId);
  const decor = parseDecor(raw.decor, shelfFree);
  const bouquets = parsePlaced(raw.bouquets, (slot) => shelfFree(slot) && !decor.drawings.some((d) => d.slot === slot));
  return {
    version: SAVE_VERSION,
    plants,
    settings: parseSettings(raw.settings),
    vinesCheckedAt: checked,
    lastSeen,
    designs,
    pressed: parsePressed(raw.pressed),
    diary: parseDiary(raw.diary),
    remoteDone: parseRemoteDone(raw.remoteDone),
    decor,
    bouquets,
    parcels: parseParcels(raw.parcels),
    cuttings: parseCuttings(raw.cuttings),
    post: parsePost(raw.post),
    memories: parseMemories(raw.memories),
    weatherSeen: parseWeatherSeen(raw.weatherSeen),
    seeds: parseSeeds(raw.seeds, designs),
    packages: parsePackages(raw.packages),
    visitors: parseVisitors(raw.visitors, plants.map((p) => p.species), now, parseBouquet),
    start: parseStart(raw.start),
    paper: parsePaper(raw.paper),
    market: parseMarket(raw.market, (slot) => shelfFree(slot) && !decor.drawings.some((d) => d.slot === slot) && !bouquets.some((b) => b.slot === slot)),
  };
}

function parseSeeds(v: unknown, designs: Designs): SeedPacket[] {
  if (!Array.isArray(v)) return [];
  const out: SeedPacket[] = [];
  for (const x of v) {
    if (!isObj(x) || typeof x.id !== 'string' || typeof x.variety !== 'string' || !isTime(x.made)) continue;
    const count = typeof x.count === 'number' ? Math.round(x.count) : 0;
    // only seeds of a design she still has can grow into it
    if (count < 1 || parseVariety(x.variety, 'pansy', designs) !== x.variety) continue;
    if (out.length < MAX_PACKETS) out.push({ id: x.id, variety: x.variety, count: Math.min(MAX_SEEDS, count), made: x.made, ...(x.mystery === true ? { mystery: true as const } : {}) });
  }
  return out;
}

// ---- visitors at the door -------------------------------------------------------------------

/** Someone may knock, depending on the hour, the weather and the time of year. */
export function knock(state: GardenState, now: number, weather: { sky: 'clear' | 'cloudy' | 'rain'; night: boolean }, halloween: boolean, rand: () => number = Math.random): GardenState {
  const visitors = arrive(state.visitors, now, momentAt(now, weather, halloween), rand, newId(), state.designs.pansies);
  return visitors === state.visitors ? state : { ...state, visitors };
}

/** She opened the door to whoever knocked. */
export function openDoor(state: GardenState): GardenState {
  const visitors = seeRequest(state.visitors);
  return visitors === state.visitors ? state : { ...state, visitors };
}

/** "Not now": they go, kindly, and someone comes another time. */
export function sendAway(state: GardenState, now: number, rand: () => number = Math.random): GardenState {
  const who = state.visitors.request?.visitor;
  const next = { ...state, visitors: notNow(state.visitors, now, rand) };
  return who ? noted(next, { at: now, kind: 'away', who }) : next;
}

/** A visitor's bratek comes as seeds: the design is kept, and a packet goes in her tin. */
function seedsFrom(g: GardenState, gift: Gift, now: number): GardenState {
  if (gift.kind !== 'design') return g;
  const kept = g.designs.pansies.some((d) => d.id === gift.design.id) ? g : savePansyDesign(g, gift.design);
  return addSeeds(kept, designRef(gift.design.id), gift.count, now);
}

/**
 * She hands the visitor the bouquet: its stems are cut from her plants, and their thanks (petals,
 * a heart, perhaps a gift) are kept. Null if nobody is waiting.
 */
export function giveToVisitor(state: GardenState, bouquet: Bouquet, cutFrom: string[], night: boolean, now: number, rand: () => number = Math.random): { garden: GardenState; thanks: Thanks } | null {
  const given = giveBouquet(state.visitors, bouquet, night, now, rand);
  if (!given) return null;
  let garden: GardenState = { ...cutStems(state, cutFrom, now), visitors: given.visitors, market: earnPetals(state.market, given.thanks.petals) };
  if (given.thanks.gift) garden = seedsFrom(garden, given.thanks.gift, now);
  garden = noted(garden, { at: now, kind: 'visit', who: given.thanks.visitor, petals: given.thanks.petals });
  return { garden, thanks: given.thanks };
}

/** On her birthday the visitors she knows leave her gifts at the door, once a year. */
export function birthdayAtDoor(state: GardenState, now: number): { garden: GardenState; gifts: ReturnType<typeof birthdayGifts>['gifts'] } {
  const { visitors, gifts } = birthdayGifts(state.visitors, now);
  if (gifts.length === 0) return { garden: visitors === state.visitors ? state : { ...state, visitors }, gifts };
  let garden: GardenState = { ...state, visitors };
  for (const { gift } of gifts) garden = seedsFrom(garden, gift, now);
  return { garden, gifts };
}

// ---- the market ------------------------------------------------------------------------------

export function withMarket(state: GardenState, fn: (m: Market) => Market): GardenState {
  const market = fn(state.market);
  return market === state.market ? state : { ...state, market };
}

/** Pan Jeżyk's stall for today, set out the first time she comes by. */
export function visitDayStall(state: GardenState, now: number): GardenState {
  return withMarket(state, (m) => openDayStall(m, now, state.visitors, state.designs.pansies));
}

/** Pani Ćma's cards for this weekend, set out the first time she comes by. */
export function visitNightStall(state: GardenState, key: string): GardenState {
  return withMarket(state, (m) => openNightStall(m, key));
}

/**
 * Buys a packet from Pan Jeżyk: a flower she can plant from now on, a bratek (its design, and
 * seeds in her tin), a ribbon or a vase. Null when it can't be bought.
 */
export function buyFromStall(state: GardenState, id: string, now: number): { garden: GardenState; item: SeedItem } | null {
  const bought = buySeed(state.market, id);
  if (!bought) return null;
  const { item } = bought;
  let g: GardenState = { ...state, market: bought.market };
  const v = g.visitors;
  if (item.kind === 'species' && !v.unlocked.includes(item.species)) g = { ...g, visitors: { ...v, unlocked: SPECIES_IDS.filter((s) => s === item.species || v.unlocked.includes(s)) } };
  if (item.kind === 'ribbon' && !v.ribbons.includes(item.color)) g = { ...g, visitors: { ...v, ribbons: [...v.ribbons, item.color] } };
  if (item.kind === 'vase' && !v.vases.includes(item.vase)) g = { ...g, visitors: { ...v, vases: [...v.vases, item.vase] } };
  if (item.kind === 'pansy') {
    const kept = g.designs.pansies.some((d) => d.id === item.design.id) ? g : savePansyDesign(g, item.design);
    g = addSeeds(kept, designRef(item.design.id), 3, now);
  }
  const what: PaperEvent =
    item.kind === 'species'
      ? { at: now, kind: 'buy', what: 'species', ref: item.species, name: null }
      : item.kind === 'pansy'
        ? { at: now, kind: 'buy', what: 'pansy', ref: item.design.id, name: item.design.name }
        : item.kind === 'ribbon'
          ? { at: now, kind: 'buy', what: 'ribbon', ref: item.color, name: null }
          : { at: now, kind: 'buy', what: 'vase', ref: item.vase, name: null };
  return { garden: noted(g, what), item };
}

/** Buys a trinket from Pani Ćma (Milton comes free); a figure stands on the first free shelf. */
export function buyFromNightStall(state: GardenState, id: string, now = Date.now()): GardenState | null {
  const market = buyTrinket(state.market, id, freeShelfSlots(state)[0] ?? null);
  return market ? noted({ ...state, market }, { at: now, kind: 'trinket', ref: id }) : null;
}

/** Stands a figure in a free place on the shelves, or puts it away in her box. */
export function standFigure(state: GardenState, id: string, slot: SlotId | null): GardenState {
  const there = slot ? figureAt(state, slot) : undefined;
  if (slot && (isHanging(slot) || plantAt(state, slot) || drawingAt(state, slot) || bouquetAt(state, slot) || (there && there.id !== id))) return state;
  return withMarket(state, (m) => placeFigure(m, id, slot));
}

/** Moves a figure along the shelves, swapping with whatever stands there; never into a hanging pot. */
export function moveFigure(state: GardenState, id: string, to: SlotId): GardenState {
  const moving = state.market.figures.find((f) => f.id === id);
  if (!moving || moving.slot === to || isHanging(to)) return state;
  const swapped = relocate(state, to, moving.slot as SlotId);
  return { ...state, ...swapped, market: { ...swapped.market, figures: swapped.market.figures.map((f) => (f.id === id ? { ...f, slot: to } : f)) } };
}

// ---- her first days ---------------------------------------------------------------------------

/** A garden from before there was a start is well past it: no fast growing, no notes. */
function parseStart(v: unknown): Start {
  if (!isObj(v)) return { planted: QUICK_PLANTS, tip: TIPS.length, off: false };
  const n = (x: unknown, hi: number) => (typeof x === 'number' && Number.isFinite(x) ? Math.max(0, Math.min(hi, Math.floor(x))) : hi);
  return { planted: n(v.planted, 1000), tip: n(v.tip, TIPS.length), off: v.off === true };
}

/** She planted something: one of her first few grows faster. */
export function plantedByHer(state: GardenState, id: string): GardenState {
  if (!state.plants.some((p) => p.id === id)) return state;
  const quick = state.start.planted < QUICK_PLANTS;
  return {
    ...state,
    plants: quick ? state.plants.map((p) => (p.id === id ? { ...p, quick: true as const } : p)) : state.plants,
    start: { ...state.start, planted: state.start.planted + 1 },
  };
}

/** How many more of her plantings will grow faster. */
export const quickLeft = (state: GardenState) => Math.max(0, QUICK_PLANTS - state.start.planted);

/** The note to show now, if any. */
export const currentTip = (state: GardenState): Tip | null => (state.start.off ? null : (TIPS[state.start.tip] ?? null));

/** That note is done (she did it, or put it away); the next one comes when it's time. */
export function tipDone(state: GardenState, tip: Tip): GardenState {
  return currentTip(state) === tip ? { ...state, start: { ...state.start, tip: state.start.tip + 1 } } : state;
}

/** No more notes. */
export const tipsOff = (state: GardenState): GardenState => ({ ...state, start: { ...state.start, off: true } });

// ---- the morning papers ------------------------------------------------------------------------

/** Notes something for "Yesterday in your garden" in tomorrow's papers. */
export function noted(state: GardenState, e: PaperEvent): GardenState {
  return { ...state, paper: logEvent(state.paper, e) };
}

/** She opened today's papers. */
export function papersRead(state: GardenState, day: string): GardenState {
  return state.paper.read === day ? state : { ...state, paper: { ...state.paper, read: day } };
}
