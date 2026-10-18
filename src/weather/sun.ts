/**
 * Roughly when the sun rises and sets in Poland through the year, in local clock hours (summer
 * time included), mid-month. Good to a quarter of an hour, which is all a painted sky needs.
 */
const SUN_BY_MONTH: Array<[number, number]> = [
  [7.7, 15.9], [7.1, 16.8], [6.1, 17.7], [6.1, 19.5], [5.0, 20.3], [4.5, 21.0],
  [4.8, 20.9], [5.6, 20.1], [6.4, 19.0], [7.0, 17.6], [7.0, 16.0], [7.7, 15.6],
];

/** How long dawn and dusk glow on either side of sunrise and sunset, in hours. */
const BEFORE = 0.45;
const AFTER = 0.75;

export type Twilight = 'dawn' | 'dusk';

/** Sunrise and sunset on this date, eased between the mid-month values. */
export function sunTimes(date: Date): { rise: number; set: number } {
  const m = date.getMonth();
  const t = (date.getDate() - 15) / 30;
  const [a, b] = t >= 0 ? [m, (m + 1) % 12] : [(m + 11) % 12, m];
  const k = t >= 0 ? t : 1 + t;
  const [r0, s0] = SUN_BY_MONTH[a]!;
  const [r1, s1] = SUN_BY_MONTH[b]!;
  return { rise: r0 + (r1 - r0) * k, set: s0 + (s1 - s0) * k };
}

/**
 * Day or night, and whether the sky is glowing with dawn or dusk. Night begins a little after
 * sunset, once the glow has gone, and ends a little before sunrise, when it starts.
 */
export function skyPhase(date: Date): { night: boolean; twilight: Twilight | null } {
  const h = date.getHours() + date.getMinutes() / 60;
  const { rise, set } = sunTimes(date);
  if (h >= rise - BEFORE && h < rise + AFTER) return { night: false, twilight: 'dawn' };
  if (h >= set - AFTER && h < set + BEFORE) return { night: false, twilight: 'dusk' };
  return { night: h < rise || h >= set, twilight: null };
}
