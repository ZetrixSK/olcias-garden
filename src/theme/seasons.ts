import { mix } from '../plants/looks';
import type { Weather } from './palettes';

/** The season outside, from the local date (northern hemisphere, by whole months). */
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export function seasonAt(t: number): Season {
  const m = new Date(t).getMonth();
  if (m === 11 || m <= 1) return 'winter';
  if (m <= 4) return 'spring';
  if (m <= 7) return 'summer';
  return 'autumn';
}

/** Special days that change the room a little. */
export type Occasion = 'halloween' | null;

/**
 * ?season=winter or ?occasion=halloween (or none) shows another time of year, so the seasons can
 * be checked on a phone without waiting for them. Only the look changes; growth keeps real time.
 */
function preview<T extends string>(key: string, allowed: readonly T[]): T | undefined {
  if (typeof location === 'undefined') return undefined;
  const v = new URLSearchParams(location.search).get(key);
  return allowed.find((a) => a === v);
}

export const seasonShown = (t: number): Season =>
  preview('season', ['spring', 'summer', 'autumn', 'winter'] as const) ?? seasonAt(t);

export function occasionShown(t: number): Occasion {
  const v = preview('occasion', ['halloween', 'none'] as const);
  return v === 'none' ? null : (v ?? occasionAt(t));
}

/** Halloween decorations go up in the second half of October and come down after All Saints' Day. */
export function occasionAt(t: number): Occasion {
  const d = new Date(t);
  const m = d.getMonth();
  const day = d.getDate();
  if ((m === 9 && day >= 17) || (m === 10 && day <= 2)) return 'halloween';
  return null;
}

/** The landscape's colours in each season, as they look on a clear day. */
const SEASON_LAND: Record<Season, Record<string, string> | null> = {
  // summer is the garden's own green, so nothing changes
  summer: null,
  spring: { 'hill-far': '#b2cbb3', 'hill-near': '#9fc28c', tree: '#88b277', 'tree-shade': '#6c9760' },
  autumn: { 'hill-far': '#bdb795', 'hill-near': '#a8a46c', tree: '#cf7d43', 'tree-shade': '#a85a34' },
  // winter: snow on the ground and the lake frozen over
  winter: {
    'hill-far': '#dfe5ec', 'hill-near': '#eef1f4', tree: '#6d6266', 'tree-shade': '#574c51', roof: '#e9ecf1',
    lake: '#d5e2ea', 'lake-hi': '#f4f8fb',
  },
};

/**
 * Seasonal colours for the view outside, laid over the weather's own. By day the season shows
 * fully; at night and in rain it is muted by the weather's darkness.
 */
export function seasonVars(season: Season, weather: Weather, base: Record<string, string>): Record<string, string> {
  const land = SEASON_LAND[season];
  if (!land) return {};
  // snow stays pale even at night; leaves and grass go as dark as everything else
  const night = season === 'winter' ? 0.42 : 0.22;
  const k = weather.night ? night : weather.sky === 'rain' ? 0.55 : weather.sky === 'cloudy' ? 0.7 : 1;
  const out: Record<string, string> = {};
  for (const [name, color] of Object.entries(land)) {
    const own = base[name];
    out[`--${name}`] = own ? mix(own, color, k) : color;
  }
  return out;
}
