import { describe, expect, it } from 'vitest';
import { flameOn, parseCandle, parseCandleLit, shade } from './candle';
import { parseSave, starterGarden, updateSettings } from './state';

describe('her candle', () => {
  it('burns when she lit it, not when she blew it out, and by itself when the room is dim', () => {
    expect(flameOn(true, false)).toBe(true);
    expect(flameOn(false, true)).toBe(false);
    expect(flameOn(null, true)).toBe(true);
    expect(flameOn(null, false)).toBe(false);
  });

  it('keeps its shape, wax and flame through a save', () => {
    const g = updateSettings(starterGarden(1e12), { candle: { shape: 'pillar', wax: '#2a1f2e' }, candleLit: false, sound: true });
    const back = parseSave(JSON.parse(JSON.stringify(g)), 1e12)!;
    expect(back.settings.candle).toEqual({ shape: 'pillar', wax: '#2a1f2e' });
    expect(back.settings.candleLit).toBe(false);
    expect(back.settings.sound).toBe(true);
  });

  it('falls back to the room candle when the saved one is damaged', () => {
    expect(parseCandle({ shape: 'bonfire', wax: '#2a1f2e' })).toBeNull();
    expect(parseCandle({ shape: 'jar', wax: 'red' })).toBeNull();
    expect(parseCandle(null)).toBeNull();
    expect(parseCandleLit('yes')).toBeNull();
  });

  it('shades wax darker and lighter', () => {
    expect(shade('#808080', 0.5)).toBe('#404040');
    expect(shade('#808080', -0.5)).toBe('#c0c0c0');
  });
});
