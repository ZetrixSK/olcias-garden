/**
 * A key that sorts database times in order. They come as `2026-10-31T09:34:08.12+00:00` from a fetch
 * but `2026-10-31 09:34:08.123456+00` over the live line (both UTC), so they're compared digit by
 * digit, fractions padded to microseconds.
 */
export function timeKey(t: string): string {
  const m = /^(\d{4})-(\d\d)-(\d\d)[ T](\d\d):(\d\d):(\d\d)(?:\.(\d+))?/.exec(t);
  return m ? m.slice(1, 7).join('') + (m[7] ?? '').padEnd(6, '0').slice(0, 6) : t;
}

/** Newest first. */
export const newestFirst = (a: string, b: string) => (timeKey(a) < timeKey(b) ? 1 : timeKey(a) > timeKey(b) ? -1 : 0);
