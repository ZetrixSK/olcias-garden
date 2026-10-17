export const VIEW_W = 400;
export const VIEW_H = 866;

/** Inner glass opening of the arched window. */
export const WINDOW_OPENING = 'M56,520 L56,212 A144,144 0 0 1 344,212 L344,520 Z';
/** Outer edge of the window frame. */
export const WINDOW_OUTER = 'M42,534 L42,212 A158,158 0 0 1 358,212 L358,534 Z';

export const SILL_Y = 524;
export const FLOOR_Y = 742;

/** Shorthand for a fill driven by a palette variable. */
export const fv = (name: string) => ({ fill: `var(--${name})` });
export const sv = (name: string) => ({ stroke: `var(--${name})` });

/** Small deterministic PRNG so scattered details (rain, stars, grain) stay put between renders. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
