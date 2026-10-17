import { useEffect, useState } from 'react';
import type { Settings } from '../garden/state';
import type { Weather } from '../theme/palettes';
import { clockWeather, fetchWeather, FRESH_MS, pickWeather, readCache } from './weather';

export type WeatherStatus = 'clock' | 'live' | 'offline' | 'manual';

/**
 * The weather the scene should show. Live weather is fetched at most every 30 minutes and only
 * while the app is visible; any failure quietly falls back to a cached reading or the clock.
 */
export function useWeather(settings: Settings, now: number): { weather: Weather; status: WeatherStatus } {
  const { weatherMode, location, manual } = settings;
  const [live, setLive] = useState<{ weather: Weather; ok: boolean } | null>(null);

  useEffect(() => {
    if (weatherMode !== 'live' || !location) return;
    let controller: AbortController | null = null;
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      const { weather, needsFetch } = pickWeather(readCache(), location.lat, location.lon, Date.now());
      setLive((prev) => ({ weather, ok: prev?.ok ?? !needsFetch }));
      if (!needsFetch) return;
      controller?.abort();
      controller = new AbortController();
      fetchWeather(location.lat, location.lon, controller.signal)
        .then((r) => setLive({ weather: r.weather, ok: true }))
        .catch((e: unknown) => {
          if ((e as Error).name !== 'AbortError') setLive({ weather, ok: false });
        });
    };
    refresh();
    const timer = window.setInterval(refresh, FRESH_MS);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller?.abort();
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [weatherMode, location?.lat, location?.lon]);

  if (weatherMode === 'clock') return { weather: clockWeather(new Date(now)), status: 'clock' };
  if (weatherMode === 'live') {
    if (live) return { weather: live.weather, status: live.ok ? 'live' : 'offline' };
    return { weather: clockWeather(new Date(now)), status: 'offline' };
  }
  return { weather: manual, status: 'manual' };
}
