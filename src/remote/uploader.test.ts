import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CHANGE_DELAY, createUploader, HEARTBEAT } from './uploader';

type Call = { garden: unknown; opened: boolean };

function setup(fail = () => false) {
  const calls: Call[] = [];
  const upload = vi.fn(async (garden: unknown, opened: boolean) => {
    if (fail()) throw new Error('offline');
    calls.push({ garden, opened });
  });
  return { calls, up: createUploader(upload, () => Date.now()), upload };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('uploader', () => {
  it('sends at once on opening, counted as an open', async () => {
    const { calls, up } = setup();
    up.opened({ n: 1 });
    await vi.runAllTimersAsync();
    expect(calls).toEqual([{ garden: { n: 1 }, opened: true }]);
  });

  it('waits a moment after changes and sends only the newest', async () => {
    const { calls, up } = setup();
    up.changed({ n: 1 });
    up.changed({ n: 2 });
    await vi.advanceTimersByTimeAsync(CHANGE_DELAY - 1);
    expect(calls).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(calls).toEqual([{ garden: { n: 2 }, opened: false }]);
  });

  it('skips a garden that is the same as the last one sent', async () => {
    const { calls, up } = setup();
    up.opened({ n: 1 });
    await vi.runAllTimersAsync();
    up.changed({ n: 1 });
    await vi.runAllTimersAsync();
    expect(calls).toHaveLength(1);
  });

  it('sends even an unchanged garden once in a while, to keep "last seen" fresh', async () => {
    const { calls, up } = setup();
    up.opened({ n: 1 });
    await vi.runAllTimersAsync();
    up.heartbeat({ n: 1 });
    await vi.runAllTimersAsync();
    expect(calls).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(HEARTBEAT);
    up.heartbeat({ n: 1 });
    await vi.runAllTimersAsync();
    expect(calls).toHaveLength(2);
  });

  it('keeps the newest garden and the open waiting while offline, then sends them', async () => {
    let offline = true;
    const { calls, up } = setup(() => offline);
    up.opened({ n: 1 });
    up.changed({ n: 2 });
    await vi.runAllTimersAsync();
    expect(calls).toHaveLength(0);
    offline = false;
    await up.flush();
    expect(calls).toEqual([{ garden: { n: 2 }, opened: true }]);
    await up.flush();
    expect(calls).toHaveLength(1);
  });

  it('sends one at a time; a change during an upload follows it', async () => {
    const order: string[] = [];
    let release!: () => void;
    const upload = vi.fn((g: unknown) => {
      order.push(JSON.stringify(g));
      return order.length === 1 ? new Promise<void>((r) => (release = r)) : Promise.resolve();
    });
    const up = createUploader(upload, () => Date.now());
    up.opened({ n: 1 });
    up.changed({ n: 2 });
    const flushing = up.flush();
    expect(upload).toHaveBeenCalledTimes(1);
    release();
    await flushing;
    expect(order).toEqual(['{"n":1}', '{"n":2}']);
  });

  it('stops after being disposed', async () => {
    const { calls, up } = setup();
    up.changed({ n: 1 });
    up.dispose();
    await vi.runAllTimersAsync();
    expect(calls).toHaveLength(0);
  });
});
