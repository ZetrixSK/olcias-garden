import { NO_MEMORIES } from '../garden/memories';
import type { GardenState } from '../garden/state';

/**
 * The garden as it goes up to the shared copy. Her diary and the notes beside pressed flowers stay
 * on the phone unless sharing them is switched on; her location is blurred to about 10 km, which
 * is all the weather needs. Her memories (photos, paintings, albums) never go up at all.
 */
export function sharedGarden(g: GardenState): GardenState {
  const loc = g.settings.location;
  const blurred = loc ? { lat: Math.round(loc.lat * 10) / 10, lon: Math.round(loc.lon * 10) / 10 } : null;
  const settings = { ...g.settings, location: blurred };
  if (g.settings.shareNotes) return { ...g, settings, memories: NO_MEMORIES };
  return { ...g, settings, memories: NO_MEMORIES, diary: {}, pressed: g.pressed.map((p) => ({ ...p, note: '' })) };
}

/** A first name for a new device on the admin page, until it's given a proper one there. */
export function deviceLabel(userAgent: string, standalone: boolean): string {
  const kind = /iPhone/.test(userAgent)
    ? 'iPhone'
    : /iPad/.test(userAgent)
      ? 'iPad'
      : /Android/.test(userAgent)
        ? 'Android'
        : 'Computer';
  return standalone ? `${kind} (home screen)` : kind;
}
