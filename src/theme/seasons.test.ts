import { describe, expect, it } from 'vitest';
import { paletteVars } from './palettes';
import { occasionAt, seasonAt } from './seasons';

const on = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime();

describe('the time of year', () => {
  it('follows the months', () => {
    expect(seasonAt(on(2026, 10, 18))).toBe('autumn');
    expect(seasonAt(on(2026, 12, 1))).toBe('winter');
    expect(seasonAt(on(2027, 1, 1))).toBe('winter');
    expect(seasonAt(on(2027, 3, 1))).toBe('spring');
    expect(seasonAt(on(2027, 6, 21))).toBe('summer');
  });

  it('decorates for Halloween from mid October to All Souls', () => {
    expect(occasionAt(on(2026, 10, 16, 23))).toBeNull();
    expect(occasionAt(on(2026, 10, 17, 0))).toBe('halloween');
    expect(occasionAt(on(2026, 10, 31, 22))).toBe('halloween');
    expect(occasionAt(on(2026, 11, 2, 23))).toBe('halloween');
    expect(occasionAt(on(2026, 11, 3, 0))).toBeNull();
  });

  it('colours the view outside by season, leaving summer as it is', () => {
    const day = { sky: 'clear', night: false } as const;
    expect(paletteVars('cozy', day, 'summer')['--tree']).toBe(paletteVars('cozy', day)['--tree']);
    expect(paletteVars('cozy', day, 'autumn')['--tree']).toBe('#cf7d43');
    // at night the season shows only faintly through the dark
    const night = paletteVars('cozy', { sky: 'clear', night: true }, 'autumn')['--tree'];
    expect(night).not.toBe('#cf7d43');
    expect(night).not.toBe(paletteVars('cozy', { sky: 'clear', night: true })['--tree']);
  });
});
