import { MAX_REMOTE_DONE, type GardenState, type RemoteDone } from '../garden/state';
import { isVineSpecies, isVineSpot, settleMiddleDir, VINE_STEP } from '../garden/vines';

/**
 * Changes sent from the admin page. Each is an instruction ("grow the vine on this plant"), never a
 * new copy of her garden, so it is carried out on the garden as it is now on her phone. One that no
 * longer makes sense there is skipped, with the reason sent back.
 */
export type RemoteAction = { id: string; kind: string; payload: unknown };

export type Outcome = { status: 'applied'; reason: null } | { status: 'skipped'; reason: string };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

const skip = (reason: string): { garden: null; outcome: Outcome } => ({ garden: null, outcome: { status: 'skipped', reason } });

/** A plant's vine grows one night's worth (or `by`, 0 to 1 of the whole route), as if it had outgrown its pot overnight. */
function overgrow(g: GardenState, payload: unknown): { garden: GardenState | null; outcome: Outcome } {
  const p = isObj(payload) ? payload : {};
  const plant = g.plants.find((x) => x.id === p.plant);
  if (!plant) return skip('That plant is no longer in her garden.');
  if (!isVineSpecies(plant.species)) return skip('Only pansies and roses can outgrow their pots.');
  if (!isVineSpot(plant.display)) return skip('The plant is not on the windowsill.');
  if (!g.settings.vines) return skip('Vines are switched off in her garden.');
  if ((plant.vine?.length ?? 0) >= 1) return skip('Its vine has already grown all the way round.');
  const by = typeof p.by === 'number' && p.by > 0 && p.by <= 1 ? p.by : VINE_STEP[plant.species];
  const vine = { ...plant.vine, length: Math.min(1, (plant.vine?.length ?? 0) + by) };
  const plants = settleMiddleDir(g.plants.map((x) => (x === plant ? { ...x, vine } : x)));
  return { garden: { ...g, plants }, outcome: { status: 'applied', reason: null } };
}

const KINDS: Record<string, (g: GardenState, payload: unknown) => { garden: GardenState | null; outcome: Outcome }> = {
  overgrow,
};

/** What was already done with this action here, if anything. */
export function handled(g: GardenState, id: string): RemoteDone | undefined {
  return g.remoteDone.find((d) => d.id === id);
}

/**
 * Carries out an action on the garden. The garden that comes back always notes the action as
 * handled, together with the save, so it's never done twice even if telling the server fails.
 */
export function applyAction(g: GardenState, a: RemoteAction): { garden: GardenState; outcome: Outcome } {
  const done = handled(g, a.id);
  if (done) return { garden: g, outcome: done.status === 'applied' ? { status: 'applied', reason: null } : { status: 'skipped', reason: done.reason ?? '' } };
  const run = KINDS[a.kind];
  const { garden, outcome } = run ? run(g, a.payload) : skip(`This version of the garden doesn't know "${a.kind}" yet.`);
  const base = garden ?? g;
  const remoteDone = [...base.remoteDone, { id: a.id, ...outcome }].slice(-MAX_REMOTE_DONE);
  return { garden: { ...base, remoteDone }, outcome };
}
