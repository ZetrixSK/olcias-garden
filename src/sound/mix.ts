import type { Weather } from '../theme/palettes';
import type { Season } from '../theme/seasons';

/** The sounds the room is made of, each from 0 (silent) to 1. */
export type Mix = { rain: number; wind: number; birds: number; crickets: number; crackle: number };
export type Layer = keyof Mix;

/**
 * What she hears, from what the window shows: rain on the glass, a breeze, birds by day except in
 * winter, crickets on warm nights, and the candle's small crackle while it burns.
 */
export function ambientMix(w: Weather, season: Season, hour: number, candle: boolean): Mix {
  const rain = w.sky === 'rain';
  const winter = season === 'winter';
  const morning = hour >= 5 && hour < 11;
  return {
    rain: rain ? 1 : 0,
    wind: rain ? 0.35 : w.sky === 'cloudy' || winter ? 0.75 : 0.4,
    birds: w.night || rain || winter ? 0 : (morning ? 1 : 0.55) * (season === 'autumn' ? 0.6 : 1) * (w.sky === 'cloudy' ? 0.6 : 1),
    crickets: w.night && !rain ? { summer: 1, spring: 0.45, autumn: 0.4, winter: 0 }[season] : 0,
    crackle: candle ? 1 : 0,
  };
}
