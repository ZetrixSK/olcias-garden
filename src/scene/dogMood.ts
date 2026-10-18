import type { Weather } from '../theme/palettes';

/**
 * What the dogs are up to: both asleep at night, the white one at the window when it rains,
 * the grey one awake and yawning first thing in the morning, otherwise their usual nap and sit.
 */
export type DogMood = 'asleep' | 'rain' | 'morning' | 'day';

export function dogMood(weather: Weather, hour: number): DogMood {
  if (weather.night) return 'asleep';
  if (weather.sky === 'rain') return 'rain';
  if (hour >= 6 && hour < 10) return 'morning';
  return 'day';
}
