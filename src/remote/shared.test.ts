import { testGarden } from '../garden/testGarden';
import { describe, expect, it } from 'vitest';
import { parseSave, saveDiaryEntry } from '../garden/state';
import { deviceLabel, sharedGarden } from './shared';

const NOW = new Date(2026, 9, 31, 12).getTime();

function gardenWithNotes(shareNotes: boolean) {
  const g = saveDiaryEntry(testGarden(NOW), '2026-10-31', 'happy', 'a secret', NOW);
  return {
    ...g,
    settings: { ...g.settings, shareNotes, location: { lat: 52.40637, lon: 16.92517 } },
    pressed: [{ id: 'p1', plantId: 'x', species: 'pansy' as const, at: NOW, variety: null, design: null, name: null, note: 'for her' }],
  };
}

describe('sharedGarden', () => {
  it('leaves the diary and pressed-flower notes on the phone by default', () => {
    const s = sharedGarden(gardenWithNotes(false));
    expect(s.diary).toEqual({});
    expect(s.pressed).toHaveLength(1);
    expect(s.pressed[0]!.note).toBe('');
    expect(JSON.stringify(s)).not.toContain('secret');
  });

  it('includes them when sharing is switched on', () => {
    const s = sharedGarden(gardenWithNotes(true));
    expect(s.diary['2026-10-31']?.text).toBe('a secret');
    expect(s.pressed[0]!.note).toBe('for her');
  });

  it('blurs the location to about 10 km', () => {
    expect(sharedGarden(gardenWithNotes(false)).settings.location).toEqual({ lat: 52.4, lon: 16.9 });
  });

  it('never changes the garden itself', () => {
    const g = gardenWithNotes(false);
    sharedGarden(g);
    expect(g.diary['2026-10-31']?.text).toBe('a secret');
  });

  it('is still a garden the app can read', () => {
    expect(parseSave(JSON.parse(JSON.stringify(sharedGarden(gardenWithNotes(false)))), NOW)).not.toBeNull();
  });
});

describe('sharing setting', () => {
  it('is off for older saves', () => {
    const old = JSON.parse(JSON.stringify(testGarden(NOW)));
    delete old.settings.shareNotes;
    expect(parseSave(old, NOW)!.settings.shareNotes).toBe(false);
  });
});

describe('deviceLabel', () => {
  it('names the kind of device', () => {
    expect(deviceLabel('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', true)).toBe('iPhone (home screen)');
    expect(deviceLabel('Mozilla/5.0 (Linux; Android 14; SM-A556B)', false)).toBe('Android');
    expect(deviceLabel('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', false)).toBe('Computer');
  });
});
