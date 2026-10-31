import { useEffect, useRef, type MutableRefObject } from 'react';
import type { GardenState } from '../garden/state';
import { applyAction, handled, type Effect, type RemoteAction, type World } from './actions';
import { isRobot, listenForActions, pendingActions, remoteConfigured, reportAction } from './client';

/** The garden saves a moment after each change; an action is only reported done once that has happened. */
const REPORT_AFTER = 1200;
/** Several actions arriving together play out one after another rather than all at once. */
const BETWEEN = 900;

/**
 * A sortable key for when an action was sent. The database's times come as `2026-10-31T09:34:08.12+00:00`
 * from a fetch but `2026-10-31 09:34:08.123456+00` over the live line (both UTC), so they're compared
 * digit by digit, fractions padded to microseconds.
 */
export function sentOrder(createdAt: string): string {
  const m = /^(\d{4})-(\d\d)-(\d\d)[ T](\d\d):(\d\d):(\d\d)(?:\.(\d+))?/.exec(createdAt);
  return m ? m.slice(1, 7).join('') + (m[7] ?? '').padEnd(6, '0').slice(0, 6) : createdAt;
}

/**
 * Carries out changes sent from the admin page: those already waiting when the garden opens, and
 * new ones within a second of being sent. They wait while `ready` is false (the garden still
 * loading, or a replay playing) and while she's offline; nothing is lost, they're just later.
 */
export function useRemoteActions(
  enabled: boolean,
  ready: boolean,
  gardenRef: MutableRefObject<GardenState | null>,
  setGarden: (fn: (g: GardenState | null) => GardenState | null) => void,
  onEffect: (e: Effect) => void,
  world: World,
): void {
  const on = enabled && remoteConfigured && !isRobot();
  const queue = useRef<(RemoteAction & { created_at: string })[]>([]);
  const readyRef = useRef(ready);
  readyRef.current = ready;
  const kick = useRef<() => void>(() => {});
  const effectRef = useRef(onEffect);
  effectRef.current = onEffect;
  const worldRef = useRef(world);
  worldRef.current = world;

  useEffect(() => {
    if (!on) return;
    let stopped = false;
    let running = false;
    let stopListening: (() => void) | null = null;
    let listening = false;
    // reports that failed (offline) are sent again on the next chance
    const unreported = new Map<string, { status: 'applied' | 'skipped'; reason: string | null }>();

    const enqueue = (a: RemoteAction & { created_at: string }) => {
      if (!queue.current.some((q) => q.id === a.id)) {
        queue.current.push(a);
        // in the order they were sent, however they arrived
        queue.current.sort((x, y) => (sentOrder(x.created_at) < sentOrder(y.created_at) ? -1 : 1));
      }
      void work();
    };

    const report = async (id: string, status: 'applied' | 'skipped', reason: string | null) => {
      try {
        await reportAction(id, status, reason);
        unreported.delete(id);
      } catch {
        unreported.set(id, { status, reason });
      }
    };

    async function work() {
      if (running || stopped) return;
      running = true;
      try {
        while (!stopped && readyRef.current && gardenRef.current && queue.current.length > 0) {
          const a = queue.current.shift()!;
          const before = gardenRef.current;
          const already = handled(before, a.id);
          if (already) {
            // carried out before (perhaps offline); only the report is missing
            await report(a.id, already.status, already.reason);
            continue;
          }
          const now = Date.now();
          const { outcome, effect } = applyAction(before, a, now, worldRef.current);
          setGarden((g) => (g ? applyAction(g, a, now, worldRef.current).garden : g));
          if (effect) effectRef.current(effect);
          await new Promise((r) => setTimeout(r, REPORT_AFTER));
          await report(a.id, outcome.status, outcome.reason);
          if (outcome.status === 'applied' && queue.current.length > 0) await new Promise((r) => setTimeout(r, BETWEEN));
        }
      } finally {
        running = false;
      }
    }

    const fetchWaiting = async () => {
      for (const [id, r] of unreported) await report(id, r.status, r.reason);
      try {
        for (const a of await pendingActions()) enqueue(a);
      } catch {
        // offline or not signed in yet: tried again on reconnecting or coming back to the app
      }
    };
    kick.current = () => void work();

    // the line reconnects by itself once open; opening it is retried if it never could be
    const listen = () => {
      if (listening || stopped) return;
      listening = true;
      listenForActions(enqueue, () => void fetchWaiting()).then(
        (stop) => (stopped ? stop() : (stopListening = stop)),
        () => (listening = false),
      );
    };
    listen();
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      listen();
      void fetchWaiting();
    };
    const onOnline = () => {
      listen();
      void fetchWaiting();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onOnline);
    return () => {
      stopped = true;
      stopListening?.();
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onOnline);
      kick.current = () => {};
    };
  }, [on, gardenRef, setGarden]);

  // whatever waited for the garden to be ready goes ahead now
  useEffect(() => {
    if (ready) kick.current();
  }, [ready]);
}
