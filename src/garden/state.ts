import { SKY_KINDS, type Theme, type Weather } from '../theme/palettes';
import { plantedAtForStage, stageAt } from './growth';
import { MAX_PRESSED, parsePressed, pressedToday, pressingOf, type Pressing } from './pressed';
import { designId, NO_DESIGNS, PANSY_PRESETS, parseDesigns, upsert, type Designs, type PansyDesign, type PotDesign, type PotRef } from './designs';
import { lastNight, runNights, settleMiddleDir, trimmed, type Vine } from './vines';
import { POT_KINDS, SPECIES, SPECIES_IDS, type GardenPot, type SpeciesId, type Stage } from './species';

export const SLOT_IDS = [
  'hang-l', 'sill-l', 'sill-r', 'hang-r',
  'row2-a', 'row2-b', 'row2-c', 'row2-d',
  'row3-a', 'row3-b', 'row3-c', 'row3-d',
] as const;
export type SlotId = (typeof SLOT_IDS)[number];

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
};

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
};

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
};

export const DEFAULT_SETTINGS: Settings = {
  theme: 'cozy',
  view: 'room',
  weatherMode: 'clock',
  manual: { sky: 'clear', night: false },
  location: null,
  vines: true,
  letter: 'unread',
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
  });
  return {
    version: SAVE_VERSION,
    plants: [
      p('pansy', 'sill-l', 'bloom', 'sill-2'),
      p('tulip', 'sill-r', 'bud', 'sill-1'),
      p('daisy', 'hang-l', 'bloom', 'shelf-3'),
      p('pansy', 'hang-r', 'bud', 'shelf-2'),
      p('lavender', 'row2-a', 'bloom'),
      p('rose', 'row2-c', 'bud', 'sill-3'),
      p('pansy', 'row2-d', 'seed', 'shelf-1'),
    ],
    settings: { ...DEFAULT_SETTINGS },
    vinesCheckedAt: lastNight(now),
    lastSeen: now,
    designs: NO_DESIGNS,
    pressed: [],
  };
}

export function plantAt(state: GardenState, slot: SlotId): Plant | undefined {
  return state.plants.find((p) => p.slot === slot);
}

export function addPlant(state: GardenState, slot: SlotId, species: SpeciesId, now: number, id = newId(), variety: string | null = null): GardenState {
  if (plantAt(state, slot)) return state;
  const plant: Plant = {
    id, species, slot, pot: SPECIES[species].pot, variety: species === 'pansy' ? variety : null,
    plantedAt: now, waterings: [], display: null, vine: null,
  };
  return { ...state, plants: [...state.plants, plant] };
}

export function waterPlant(state: GardenState, id: string, now: number): GardenState {
  return {
    ...state,
    plants: state.plants.map((p) => (p.id === id ? { ...p, waterings: [...p.waterings, now].slice(-20) } : p)),
  };
}

/** Move to another slot; if something already lives there, the two swap places. */
export function movePlant(state: GardenState, id: string, to: SlotId): GardenState {
  const moving = state.plants.find((p) => p.id === id);
  if (!moving || moving.slot === to) return state;
  const from = moving.slot;
  return {
    ...state,
    plants: state.plants.map((p) => (p.id === id ? { ...p, slot: to } : p.slot === to ? { ...p, slot: from } : p)),
  };
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

/** Takes a flower back out of the book. */
export function unpress(state: GardenState, pressId: string): GardenState {
  return { ...state, pressed: state.pressed.filter((p) => p.id !== pressId) };
}

/** Catches up on every 3:00 since the last visit. Returns the same object when nothing is due. */
export function catchUpNights(state: GardenState, now: number): GardenState {
  const { plants, checkedAt } = runNights(state.plants, state.vinesCheckedAt, now, state.settings.vines);
  if (checkedAt === state.vinesCheckedAt) return state;
  return { ...state, plants, vinesCheckedAt: checkedAt };
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
  const { id, species, slot, pot, variety, plantedAt, waterings, display, vine } = v;
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
  };
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

function parseSettings(v: unknown): Settings {
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
  return {
    version: SAVE_VERSION,
    plants,
    settings: parseSettings(raw.settings),
    vinesCheckedAt: checked,
    lastSeen,
    designs,
    pressed: parsePressed(raw.pressed),
  };
}
