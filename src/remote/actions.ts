import { growthHours, plantedAtForStage, stageAt } from '../garden/growth';
import { designId, PANSY_PRESETS, parsePansy, parsePot, type PotRef } from '../garden/designs';
import { POT_KINDS, SPECIES_IDS, STAGES, type SpeciesId, type Stage } from '../garden/species';
import {
  addPlant, drawingAt, isHanging, MAX_REMOTE_DONE, movePlant, newId, parseSettings, placeInWindow, plantAt, removePlant,
  savePansyDesign, savePotDesign, setPlantName, setPot, setPressNote, setVariety, SLOT_IDS, takeDown, trimVine, waterPlant,
  WINDOW_SPOTS, type GardenState, type Plant, type RemoteDone, type Settings, type SlotId, type WindowSpot,
} from '../garden/state';
import { isVineSpecies, isVineSpot, settleMiddleDir, VINE_STEP } from '../garden/vines';
import { MOMENTS, momentBlocked, type Moment } from '../weather/moments';
import type { SkyKind } from '../theme/palettes';
import type { Season } from '../theme/seasons';

/**
 * Changes sent from the admin page. Each is an instruction ("grow the vine on this plant"), never a
 * new copy of her garden, so it is carried out on the garden as it is now on her phone. One that no
 * longer makes sense there is skipped, with the reason sent back.
 */
export type RemoteAction = { id: string; kind: string; payload: unknown };

export type Outcome = { status: 'applied'; reason: null } | { status: 'skipped'; reason: string };

/** Something to show on screen as it happens, the same as when she does it herself. */
export type Effect = { kind: 'water' | 'trim'; plant: string } | { kind: 'moment'; moment: Moment; until: number };

/** What her window shows right now, for actions that depend on it. */
export type World = { night: boolean; sky: SkyKind; season: Season };

type Result = { garden: GardenState | null; outcome: Outcome; effect?: Effect };
type Payload = Record<string, unknown>;

const isObj = (v: unknown): v is Payload => typeof v === 'object' && v !== null && !Array.isArray(v);
const skip = (reason: string): Result => ({ garden: null, outcome: { status: 'skipped', reason } });
const done = (garden: GardenState, effect?: Effect): Result => ({ garden, outcome: { status: 'applied', reason: null }, ...(effect ? { effect } : {}) });

const GONE = 'That plant is no longer in her garden.';
const findPlant = (g: GardenState, p: Payload) => g.plants.find((x) => x.id === p.plant);
const isSlot = (v: unknown): v is SlotId => (SLOT_IDS as readonly unknown[]).includes(v);
const isSpot = (v: unknown): v is WindowSpot => (WINDOW_SPOTS as readonly unknown[]).includes(v);
const isStage = (v: unknown): v is Stage => (STAGES as unknown[]).includes(v);
const isSpecies = (v: unknown): v is SpeciesId => (SPECIES_IDS as unknown[]).includes(v);

/** A built-in variety or one of her own designs, for a bratek. */
function validVariety(g: GardenState, v: unknown): v is string {
  if (typeof v !== 'string') return false;
  const id = designId(v);
  return id === null ? (PANSY_PRESETS as readonly string[]).includes(v) : g.designs.pansies.some((d) => d.id === id);
}

function validPot(g: GardenState, v: unknown): v is PotRef {
  if (typeof v !== 'string') return false;
  const id = designId(v);
  return id === null ? (POT_KINDS as readonly string[]).includes(v) : g.designs.pots.some((d) => d.id === id);
}

/**
 * The planting time that shows `stage` now, allowing for the boost her waterings give. Waterings
 * from before planting don't count, so moving the planting time changes the boost; a few rounds
 * settle it. Null if it can't be reached.
 */
export function plantedAtShowing(plant: Pick<Plant, 'species' | 'waterings'>, stage: Stage, now: number): number | null {
  const want = (now - plantedAtForStage(plant.species, stage, now)) / 3_600_000;
  let at = plantedAtForStage(plant.species, stage, now);
  for (let i = 0; i < 4 && stageAt(plant.species, { plantedAt: at, waterings: plant.waterings }, now) !== stage; i++) {
    const extra = growthHours({ plantedAt: at, waterings: plant.waterings }, now) - (now - at) / 3_600_000;
    at = Math.min(now, now - (want - extra) * 3_600_000);
  }
  return stageAt(plant.species, { plantedAt: at, waterings: plant.waterings }, now) === stage ? at : null;
}

const withPlant = (g: GardenState, id: string, fn: (p: Plant) => Plant): GardenState => ({
  ...g,
  plants: g.plants.map((p) => (p.id === id ? fn(p) : p)),
});

/** A plant's vine grows one night's worth (or `by`, 0 to 1 of the whole route), as if it had outgrown its pot overnight. */
function overgrow(g: GardenState, p: Payload): Result {
  const plant = findPlant(g, p);
  if (!plant) return skip(GONE);
  if (!isVineSpecies(plant.species)) return skip('Only pansies and roses can outgrow their pots.');
  if (!isVineSpot(plant.display)) return skip('The plant is not on the windowsill.');
  if (!g.settings.vines) return skip('Vines are switched off in her garden.');
  if ((plant.vine?.length ?? 0) >= 1) return skip('Its vine has already grown all the way round.');
  const by = typeof p.by === 'number' && p.by > 0 && p.by <= 1 ? p.by : VINE_STEP[plant.species];
  const vine = { ...plant.vine, length: Math.min(1, (plant.vine?.length ?? 0) + by) };
  return done({ ...g, plants: settleMiddleDir(g.plants.map((x) => (x === plant ? { ...x, vine } : x))) });
}

/** Shows the plant at a stage of its growth (seed, seedling, bud, bloom), forwards or back. */
function setStage(g: GardenState, p: Payload, now: number): Result {
  const plant = findPlant(g, p);
  if (!plant) return skip(GONE);
  if (!isStage(p.stage)) return skip('That is not a stage of growth.');
  if (stageAt(plant.species, plant, now) === p.stage) return skip(`It is already at the ${p.stage} stage.`);
  const at = plantedAtShowing(plant, p.stage, now);
  if (at === null) return skip('Its waterings keep it from going back that far.');
  return done(withPlant(g, plant.id, (x) => ({ ...x, plantedAt: at })));
}

function water(g: GardenState, p: Payload, now: number): Result {
  const plant = findPlant(g, p);
  if (!plant) return skip(GONE);
  return done(waterPlant(g, plant.id, now), { kind: 'water', plant: plant.id });
}

/** A new plant in an empty place on the shelves, optionally already grown, potted, coloured and named. */
function plantNew(g: GardenState, p: Payload, now: number): Result {
  if (!isSlot(p.slot)) return skip('That is not a place on the shelves.');
  if (!isSpecies(p.species)) return skip('That is not a flower the garden knows.');
  if (plantAt(g, p.slot) || drawingAt(g, p.slot)) return skip('Something is already standing there.');
  if (p.variety !== undefined && (p.species !== 'pansy' || !validVariety(g, p.variety))) return skip('Those colours are not available for it.');
  if (p.pot !== undefined && !validPot(g, p.pot)) return skip('That pot does not exist in her garden.');
  if (p.stage !== undefined && !isStage(p.stage)) return skip('That is not a stage of growth.');
  const id = typeof p.id === 'string' && p.id && !g.plants.some((x) => x.id === p.id) ? p.id : newId();
  let out = addPlant(g, p.slot, p.species, now, id, typeof p.variety === 'string' ? p.variety : null);
  if (validPot(out, p.pot)) out = setPot(out, id, p.pot);
  if (typeof p.name === 'string') out = setPlantName(out, id, p.name);
  if (isStage(p.stage)) {
    const at = plantedAtForStage(p.species, p.stage, now);
    out = withPlant(out, id, (x) => ({ ...x, plantedAt: at }));
  }
  return done(out);
}

function remove(g: GardenState, p: Payload): Result {
  const plant = findPlant(g, p);
  if (!plant) return skip(GONE);
  return done(removePlant(g, plant.id));
}

function pot(g: GardenState, p: Payload): Result {
  const plant = findPlant(g, p);
  if (!plant) return skip(GONE);
  if (!validPot(g, p.pot)) return skip('That pot does not exist in her garden.');
  if (plant.pot === p.pot) return skip('It is already in that pot.');
  return done(setPot(g, plant.id, p.pot));
}

/** A bratek's colours: one of the built-in varieties, or one of her own designs (`d:<id>`). */
function variety(g: GardenState, p: Payload): Result {
  const plant = findPlant(g, p);
  if (!plant) return skip(GONE);
  if (plant.species !== 'pansy') return skip('Only bratki come in different colours.');
  if (!validVariety(g, p.variety)) return skip('Those colours are not available.');
  if (plant.variety === p.variety) return skip('It already has those colours.');
  return done(setVariety(g, plant.id, p.variety));
}

function name(g: GardenState, p: Payload): Result {
  const plant = findPlant(g, p);
  if (!plant) return skip(GONE);
  if (typeof p.name !== 'string') return skip('No name was given.');
  return done(setPlantName(g, plant.id, p.name));
}

/** Moves a plant to another place on the shelves, swapping with whatever stands there. */
function move(g: GardenState, p: Payload): Result {
  const plant = findPlant(g, p);
  if (!plant) return skip(GONE);
  if (!isSlot(p.slot)) return skip('That is not a place on the shelves.');
  if (plant.slot === p.slot) return skip('It is already there.');
  if (isHanging(plant.slot) && drawingAt(g, p.slot)) return skip('A drawing stands there, and drawings cannot hang.');
  return done(movePlant(g, plant.id, p.slot));
}

/** Shows a plant in the window (`spot`), or takes it back to just its shelf (`spot: null`). */
function windowSpot(g: GardenState, p: Payload): Result {
  const plant = findPlant(g, p);
  if (!plant) return skip(GONE);
  if (p.spot === null) return plant.display ? done(takeDown(g, plant.id)) : skip('It is not in the window.');
  if (!isSpot(p.spot)) return skip('That is not a place in the window.');
  if (plant.display === p.spot) return skip('It is already there.');
  return done(placeInWindow(g, plant.id, p.spot));
}

function trim(g: GardenState, p: Payload): Result {
  const plant = findPlant(g, p);
  if (!plant) return skip(GONE);
  if (!plant.vine) return skip('It has no vine to trim.');
  return done(trimVine(g, plant.id), { kind: 'trim', plant: plant.id });
}

/** Settings that stay hers alone: whether her notes are shared, where she is, and the one-time install note. */
const PRIVATE_SETTINGS: readonly string[] = ['shareNotes', 'location', 'installHint'];

/**
 * Changes any of her settings: the room and its colours, the view, the weather, vines, the candle,
 * sounds, the language, or the letter (back to 'unread' to send it again). `patch` holds only what changes.
 */
function settings(g: GardenState, p: Payload): Result {
  const patch = p.patch;
  if (!isObj(patch)) return skip('No settings were given.');
  const keys = Object.keys(patch);
  const mine = keys.filter((k) => PRIVATE_SETTINGS.includes(k));
  if (mine.length > 0) return skip(`Only she can change ${mine.join(', ')}.`);
  const unknown = keys.filter((k) => !(k in g.settings));
  if (unknown.length > 0) return skip(`Unknown settings: ${unknown.join(', ')}.`);
  if (keys.length === 0) return skip('No settings were given.');
  const next = parseSettings({ ...g.settings, ...patch });
  const refused = keys.filter((k) => JSON.stringify(next[k as keyof Settings]) !== JSON.stringify(patch[k]));
  if (refused.length > 0) return skip(`Not a value the garden can show: ${refused.join(', ')}.`);
  if (JSON.stringify(next) === JSON.stringify(g.settings)) return skip('Her garden is already like that.');
  return done({ ...g, settings: next });
}

/** Adds or changes one of her designs: a bratek (`type: 'pansy'`) or a painted pot (`type: 'pot'`). */
function design(g: GardenState, p: Payload): Result {
  const raw = isObj(p.design) ? { ...p.design, id: typeof p.design.id === 'string' && p.design.id ? p.design.id : newId() } : null;
  if (p.type === 'pansy') {
    const d = parsePansy(raw);
    return d ? done(savePansyDesign(g, d)) : skip('That bratek design could not be read.');
  }
  if (p.type === 'pot') {
    const d = parsePot(raw);
    return d ? done(savePotDesign(g, d)) : skip('That pot design could not be read.');
  }
  return skip("A design is either a 'pansy' or a 'pot'.");
}

/** Writes beside one of the flowers pressed in her book. */
function note(g: GardenState, p: Payload): Result {
  const pressing = g.pressed.find((x) => x.id === p.press);
  if (!pressing) return skip('That pressed flower is no longer in her book.');
  if (typeof p.note !== 'string') return skip('No note was given.');
  return done(setPressNote(g, pressing.id, p.note));
}

/** Longest a moment can be asked to last, in minutes. */
export const MAX_MOMENT_MINUTES = 240;

/**
 * Something outside the window for a while (`minutes`, 30 if not given): a rainbow, northern lights,
 * fog, a shower of shooting stars, or a visitor at the lake. Nothing is saved; it just passes.
 */
function moment(g: GardenState, p: Payload, now: number, world: World | null): Result {
  if (!(MOMENTS as readonly unknown[]).includes(p.moment)) return skip('That is not a moment the window can show.');
  const m = p.moment as Moment;
  const minutes = typeof p.minutes === 'number' && p.minutes > 0 ? Math.min(MAX_MOMENT_MINUTES, p.minutes) : 30;
  if (!world) return skip('Her garden was not on screen.');
  const blocked = momentBlocked(m, world.season, world.night, world.sky);
  if (blocked) return skip(blocked);
  return done(g, { kind: 'moment', moment: m, until: now + minutes * 60_000 });
}

const KINDS: Record<string, (g: GardenState, p: Payload, now: number, world: World | null) => Result> = {
  moment,
  settings,
  design,
  note,
  overgrow,
  stage: setStage,
  water,
  plant: plantNew,
  remove,
  pot,
  variety,
  name,
  move,
  window: windowSpot,
  trim,
};

/** What was already done with this action here, if anything. */
export function handled(g: GardenState, id: string): RemoteDone | undefined {
  return g.remoteDone.find((d) => d.id === id);
}

/**
 * Carries out an action on the garden. The garden that comes back always notes the action as
 * handled, together with the save, so it's never done twice even if telling the server fails.
 */
export function applyAction(g: GardenState, a: RemoteAction, now: number, world: World | null = null): { garden: GardenState; outcome: Outcome; effect?: Effect } {
  const prior = handled(g, a.id);
  if (prior) return { garden: g, outcome: prior.status === 'applied' ? { status: 'applied', reason: null } : { status: 'skipped', reason: prior.reason ?? '' } };
  const run = KINDS[a.kind];
  const { garden, outcome, effect } = run ? run(g, isObj(a.payload) ? a.payload : {}, now, world) : skip(`This version of the garden doesn't know "${a.kind}" yet.`);
  const base = garden ?? g;
  const remoteDone = [...base.remoteDone, { id: a.id, ...outcome }].slice(-MAX_REMOTE_DONE);
  return { garden: { ...base, remoteDone }, outcome, ...(effect ? { effect } : {}) };
}
