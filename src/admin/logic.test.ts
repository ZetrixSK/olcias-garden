import { describe as group, expect, it } from 'vitest';
import { starterGarden } from '../garden/state';
import { activeMoments, ago, describe, isOnline, plantName, withPending, type ActionRow } from './logic';
import { applyAction } from '../remote/actions';

const NOW = new Date(2026, 9, 31, 12).getTime();
const MIN = 60_000;

const row = (over: Partial<ActionRow>): ActionRow => ({
  id: 'a', garden: 'g', kind: 'moment', payload: {}, created_at: new Date(NOW).toISOString(),
  status: 'applied', done_at: new Date(NOW).toISOString(), reason: null, ...over,
});

group('ago', () => {
  it('says how long ago, roughly', () => {
    expect(ago(NOW - 10_000, NOW)).toBe('just now');
    expect(ago(NOW - 5 * MIN, NOW)).toBe('5 min ago');
    expect(ago(NOW - 3 * 60 * MIN, NOW)).toBe('3 h ago');
    expect(ago(NOW - 49 * 60 * MIN, NOW)).toBe('2 days ago');
  });

  it('counts a phone as open while it keeps checking in', () => {
    expect(isOnline(NOW - 4 * MIN, NOW)).toBe(true);
    expect(isOnline(NOW - 20 * MIN, NOW)).toBe(false);
  });
});

group('activeMoments', () => {
  it('keeps the moments that have not passed yet', () => {
    const done = (min: number) => new Date(NOW - min * MIN).toISOString();
    const list = [
      row({ payload: { moment: 'rainbow', minutes: 10 }, done_at: done(5) }),
      row({ payload: { moment: 'deer', minutes: 10 }, done_at: done(15) }),
      row({ payload: { moment: 'fog' }, done_at: done(20) }),
      row({ payload: { moment: 'aurora' }, status: 'skipped' }),
      row({ kind: 'water', payload: { plant: 'x' } }),
    ];
    expect(activeMoments(list, NOW).sort()).toEqual(['fog', 'rainbow']);
  });
});

group('describe', () => {
  it('puts an action into words, naming her plants as she does', () => {
    const g = starterGarden(NOW);
    const pansy = g.plants.find((p) => p.display === 'sill-2')!;
    const named = { ...g, plants: g.plants.map((p) => (p === pansy ? { ...p, name: 'Luna' } : p)) };
    expect(plantName(named, pansy.id)).toBe('Luna (pansy)');
    expect(describe({ kind: 'overgrow', payload: { plant: pansy.id } }, named)).toBe('Grow a vine on Luna (pansy)');
    expect(describe({ kind: 'water', payload: { plant: 'gone' } }, g)).toBe('Water a plant');
    expect(describe({ kind: 'moment', payload: { moment: 'aurora', minutes: 15 } }, g)).toBe('Northern lights for 15 min');
    expect(describe({ kind: 'settings', payload: { patch: { theme: 'witchy' } } }, g)).toBe('Settings: theme witchy');
    expect(describe({ kind: 'plant', payload: { species: 'rose', slot: 'row3-a', name: 'Ruby' } }, g)).toBe('Plant a rose called Ruby on the bottom shelf 1');
  });
});

group('withPending', () => {
  const world = { night: false, sky: 'clear' as const, season: 'autumn' as const };
  const at = (s: number) => new Date(NOW + s * 1000).toISOString();

  it('shows what was sent before her phone has caught up, in the order sent', () => {
    const g = starterGarden(NOW);
    const list = [
      row({ id: 'b', kind: 'settings', payload: { patch: { lang: 'pl' } }, status: 'pending', created_at: at(2) }),
      row({ id: 'a', kind: 'settings', payload: { patch: { lang: 'en' } }, status: 'pending', created_at: at(1) }),
    ];
    expect(withPending(g, list, NOW, world).settings.lang).toBe('pl');
  });

  it('leaves out what her upload already includes, what was skipped, and moments', () => {
    const g = starterGarden(NOW);
    const pansy = g.plants.find((p) => p.display === 'sill-2')!;
    const grow = row({ id: 'g1', kind: 'overgrow', payload: { plant: pansy.id }, status: 'applied' });
    const uploaded = applyAction(g, grow, NOW, world).garden;
    const list = [
      grow,
      row({ id: 's1', kind: 'settings', payload: { patch: { theme: 'witchy' } }, status: 'skipped' }),
      row({ id: 'm1', kind: 'moment', payload: { moment: 'rainbow' }, status: 'applied' }),
    ];
    const shown = withPending(uploaded, list, NOW, world);
    expect(shown.plants.find((p) => p.id === pansy.id)!.vine!.length).toBeCloseTo(0.22);
    expect(shown.settings.theme).toBe('cozy');
  });
});
