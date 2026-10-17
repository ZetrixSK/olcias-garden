import type { GardenState, Plant } from './state';
import { nightsBetween, runNights } from './vines';

/**
 * What happened while she was away, as keyframes: the garden as she left it, then after each 3:00.
 * Growth stages need no keyframes; they follow from timestamps at any moment.
 */
export type Timelapse = { from: number; to: number; frames: { t: number; plants: Plant[] }[]; base: GardenState };

/** Only gaps at least this long are worth replaying when she comes back. */
export const LAPSE_MIN_GAP = 30 * 60_000;

export function buildTimelapse(start: GardenState, from: number, to: number): Timelapse {
  const frames = [{ t: from, plants: start.plants }];
  let plants = start.plants;
  let checked = start.vinesCheckedAt;
  for (const night of nightsBetween(checked, to)) {
    plants = runNights(plants, checked, night, start.settings.vines).plants;
    checked = night;
    frames.push({ t: Math.max(night, from), plants });
  }
  return { from, to, frames, base: start };
}

const smooth = (x: number) => x * x * (3 - 2 * x);

/**
 * The garden at moment `t` of the replay. Between two nights a vine grows smoothly from one night's
 * length to the next, so on screen it stretches rather than jumps.
 */
export function gardenAt(lapse: Timelapse, t: number): GardenState {
  const { frames } = lapse;
  const last = frames[frames.length - 1]!;
  if (t >= last.t) return { ...lapse.base, plants: last.plants };
  let i = 0;
  while (i < frames.length - 2 && frames[i + 1]!.t <= t) i++;
  const a = frames[i]!;
  const b = frames[i + 1]!;
  const f = smooth(Math.min(1, Math.max(0, (t - a.t) / Math.max(1, b.t - a.t))));
  const before = new Map(a.plants.map((p) => [p.id, p.vine?.length ?? 0]));
  const plants = b.plants.map((p) => {
    if (!p.vine) return p;
    const from = before.get(p.id) ?? 0;
    const length = from + (p.vine.length - from) * f;
    return { ...p, vine: length > 0.005 ? { ...p.vine, length } : null };
  });
  return { ...lapse.base, plants };
}

/** True when anything visibly changed between the two ends of the replay. */
export function somethingGrew(lapse: Timelapse, stageAt: (p: Plant, t: number) => string): boolean {
  const end = lapse.frames[lapse.frames.length - 1]!.plants;
  return lapse.base.plants.some((p, i) => {
    const q = end[i];
    return stageAt(p, lapse.from) !== stageAt(p, lapse.to) || (q && (q.vine?.length ?? 0) !== (p.vine?.length ?? 0));
  });
}
