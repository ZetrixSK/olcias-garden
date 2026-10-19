import { describe, expect, it } from 'vitest';
import { ambientMix } from './mix';

describe('what she hears', () => {
  it('is rain on the glass when it rains, with no birds or crickets', () => {
    const m = ambientMix({ sky: 'rain', night: false }, 'summer', 10, false);
    expect(m.rain).toBe(1);
    expect(m.birds).toBe(0);
    expect(m.crickets).toBe(0);
  });

  it('has birds on a summer morning, and crickets on a summer night', () => {
    expect(ambientMix({ sky: 'clear', night: false }, 'summer', 7, false).birds).toBe(1);
    expect(ambientMix({ sky: 'clear', night: true }, 'summer', 23, false)).toMatchObject({ birds: 0, crickets: 1 });
  });

  it('is only the wind in winter, plus the candle while it burns', () => {
    const m = ambientMix({ sky: 'clear', night: true }, 'winter', 22, true);
    expect(m).toMatchObject({ rain: 0, birds: 0, crickets: 0, crackle: 1 });
    expect(m.wind).toBeGreaterThan(0);
  });
});
