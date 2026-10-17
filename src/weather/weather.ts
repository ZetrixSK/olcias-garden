import type { Weather } from '../theme/palettes';

export function isNightAt(date: Date): boolean {
  const h = date.getHours();
  return h >= 20 || h < 6;
}

/** Local time only: a clear sky, at night from 8 pm to 6 am. */
export function clockWeather(date: Date): Weather {
  return { sky: 'clear', night: isNightAt(date) };
}

/** WMO weather codes as returned by Open-Meteo, folded into clear, cloudy or rain, by day or night. */
export function codeToWeather(code: number, isDay: boolean): Weather {
  const night = !isDay;
  if (code <= 1) return { sky: 'clear', night };
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return { sky: 'rain', night };
  return { sky: 'cloudy', night };
}

export type CachedWeather = { lat: number; lon: number; weather: Weather; at: number };

const CACHE_KEY = 'olcias-garden-weather';
/** Don't ask again within this window. */
export const FRESH_MS = 30 * 60_000;
/** A cached reading is still better than guessing for this long, e.g. while offline. */
export const STALE_OK_MS = 3 * 3_600_000;

/** Coordinates are rounded to about a kilometre before they are stored or sent anywhere. */
export function roundCoord(v: number): number {
  return Math.round(v * 100) / 100;
}

export function readCache(): CachedWeather | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as CachedWeather;
    const w = c.weather as Partial<Weather> | undefined;
    return typeof c.at === 'number' && typeof w?.sky === 'string' && typeof w.night === 'boolean' ? c : null;
  } catch {
    return null;
  }
}

function writeCache(c: CachedWeather) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {
    // storage blocked; the next visit simply asks again
  }
}

/**
 * Chooses what to show: a fresh cached reading if there is one for this place, otherwise the cached
 * reading while it is not too old, otherwise the clock.
 */
export function pickWeather(cache: CachedWeather | null, lat: number, lon: number, now: number): { weather: Weather; needsFetch: boolean } {
  const samePlace = cache && cache.lat === roundCoord(lat) && cache.lon === roundCoord(lon);
  if (samePlace && now - cache.at < FRESH_MS) return { weather: cache.weather, needsFetch: false };
  if (samePlace && now - cache.at < STALE_OK_MS) return { weather: cache.weather, needsFetch: true };
  return { weather: clockWeather(new Date(now)), needsFetch: true };
}

export async function fetchWeather(lat: number, lon: number, signal?: AbortSignal): Promise<CachedWeather> {
  const la = roundCoord(lat);
  const lo = roundCoord(lon);
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=weather_code,is_day`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`weather ${res.status}`);
  const data = (await res.json()) as { current?: { weather_code?: number; is_day?: number } };
  const code = data.current?.weather_code;
  if (typeof code !== 'number') throw new Error('weather: no current code');
  const reading = { lat: la, lon: lo, weather: codeToWeather(code, data.current?.is_day !== 0), at: Date.now() };
  writeCache(reading);
  return reading;
}

export function requestLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('no geolocation'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: roundCoord(pos.coords.latitude), lon: roundCoord(pos.coords.longitude) }),
      reject,
      { maximumAge: 6 * 3_600_000, timeout: 15_000 },
    );
  });
}
