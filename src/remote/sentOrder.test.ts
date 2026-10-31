import { describe, expect, it } from 'vitest';
import { sentOrder } from './useRemoteActions';

describe('sentOrder', () => {
  it('puts times in order whichever way the database wrote them', () => {
    const fetched = '2026-10-31T09:34:08.12+00:00';
    const live = '2026-10-31 09:34:08.113456+00';
    const later = '2026-10-31 09:34:08.2+00';
    expect(sentOrder(live) < sentOrder(fetched)).toBe(true);
    expect(sentOrder(fetched) < sentOrder(later)).toBe(true);
    expect(sentOrder('2026-10-31T09:34:08+00:00')).toBe('20261031093408000000');
  });
});
