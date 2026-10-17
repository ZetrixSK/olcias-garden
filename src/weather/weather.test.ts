import { describe, expect, it } from 'vitest';
import { clockWeather, codeToWeather, FRESH_MS, pickWeather, roundCoord, STALE_OK_MS } from './weather';

describe('weather', () => {
  it('maps Open-Meteo codes to the four scene states', () => {
    const day = (sky: string) => ({ sky, night: false });
    expect(codeToWeather(0, true)).toEqual(day('clear'));
    expect(codeToWeather(1, true)).toEqual(day('clear'));
    expect(codeToWeather(3, true)).toEqual(day('cloudy'));
    expect(codeToWeather(45, true)).toEqual(day('cloudy'));
    expect(codeToWeather(61, true)).toEqual(day('rain'));
    expect(codeToWeather(81, true)).toEqual(day('rain'));
    expect(codeToWeather(95, true)).toEqual(day('rain'));
    expect(codeToWeather(73, true)).toEqual(day('cloudy'));
  });

  it('keeps rain and clouds at night', () => {
    expect(codeToWeather(0, false)).toEqual({ sky: 'clear', night: true });
    expect(codeToWeather(63, false)).toEqual({ sky: 'rain', night: true });
    expect(codeToWeather(3, false)).toEqual({ sky: 'cloudy', night: true });
  });

  it('uses the clock for night and day', () => {
    expect(clockWeather(new Date(2026, 9, 14, 23))).toEqual({ sky: 'clear', night: true });
    expect(clockWeather(new Date(2026, 9, 14, 5))).toEqual({ sky: 'clear', night: true });
    expect(clockWeather(new Date(2026, 9, 14, 12))).toEqual({ sky: 'clear', night: false });
  });

  it('prefers a fresh reading, tolerates a stale one, then falls back to the clock', () => {
    const at = new Date(2026, 9, 14, 12).getTime();
    const rain = { sky: 'rain' as const, night: false };
    const fair = { sky: 'clear', night: false };
    const cache = { lat: roundCoord(50.06), lon: roundCoord(19.94), weather: rain, at };
    expect(pickWeather(cache, 50.06, 19.94, at + 1000)).toEqual({ weather: rain, needsFetch: false });
    expect(pickWeather(cache, 50.06, 19.94, at + FRESH_MS + 1)).toEqual({ weather: rain, needsFetch: true });
    expect(pickWeather(cache, 50.06, 19.94, at + STALE_OK_MS + 1).weather).toEqual(fair);
    expect(pickWeather(cache, 52.23, 21.01, at + 1000)).toEqual({ weather: fair, needsFetch: true });
    expect(pickWeather(null, 50.06, 19.94, at)).toEqual({ weather: fair, needsFetch: true });
  });
});
