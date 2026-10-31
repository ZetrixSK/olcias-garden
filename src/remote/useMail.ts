import { useEffect, useRef, type MutableRefObject } from 'react';
import { parseBouquet } from '../garden/bouquets';
import { freeShelfSlots, receiveBouquet, type GardenState } from '../garden/state';
import { inbox, isRobot, listenForMail, markDelivered, remoteConfigured, type Mail } from './client';

/** The garden saves a moment after each change; post is only marked taken in once that has happened. */
const SAVE_FIRST = 1200;

export type Arrival = { from: string; inBox: boolean };

/**
 * Takes in post sent to her tag: bouquets go on the shelves, or into the box on the floor if
 * they're full. Waits while `ready` is false and while she's offline; nothing sent is ever lost,
 * and each bouquet arrives once (it keeps the id of the post it came in).
 */
export function useMail(
  enabled: boolean,
  ready: boolean,
  gardenRef: MutableRefObject<GardenState | null>,
  setGarden: (fn: (g: GardenState | null) => GardenState | null) => void,
  onArrive: (a: Arrival) => void,
): void {
  const on = enabled && remoteConfigured && !isRobot();
  const readyRef = useRef(ready);
  readyRef.current = ready;
  const arriveRef = useRef(onArrive);
  arriveRef.current = onArrive;
  const kick = useRef<() => void>(() => {});

  useEffect(() => {
    if (!on) return;
    let stopped = false;
    let running = false;
    let listening = false;
    let stopListening: (() => void) | null = null;
    const queue: Mail[] = [];
    const taken = new Set<string>();

    async function work() {
      if (running || stopped) return;
      running = true;
      try {
        while (!stopped && readyRef.current && gardenRef.current && queue.length > 0) {
          const m = queue.shift()!;
          const bouquet = m.kind === 'bouquet' && typeof m.payload === 'object' && m.payload !== null
            ? parseBouquet({ ...(m.payload as object), id: m.id, from: m.from_tag, at: Date.parse(m.created_at) || Date.now() })
            : null;
          if (bouquet) {
            const g = gardenRef.current;
            const already = g.bouquets.some((b) => b.id === m.id) || g.parcels.some((b) => b.id === m.id);
            if (!already) {
              const inBox = freeShelfSlots(g).length === 0;
              setGarden((x) => (x ? receiveBouquet(x, bouquet) : x));
              arriveRef.current({ from: m.from_tag, inBox });
              await new Promise((r) => setTimeout(r, SAVE_FIRST));
            }
          }
          // something that can't be read is let go, so it doesn't come back every time
          try {
            await markDelivered(m.id);
            taken.add(m.id);
          } catch {
            // offline: it comes again on the next fetch, and is recognised by its id
          }
        }
      } finally {
        running = false;
      }
    }

    const enqueue = (m: Mail) => {
      if (taken.has(m.id) || queue.some((q) => q.id === m.id)) return;
      queue.push(m);
      void work();
    };
    const fetchWaiting = async () => {
      try {
        for (const m of await inbox()) enqueue(m);
      } catch {
        // offline or not signed in yet: tried again later
      }
    };
    const listen = () => {
      if (listening || stopped) return;
      listening = true;
      listenForMail(enqueue, () => void fetchWaiting()).then(
        (stop) => (stopped ? stop() : (stopListening = stop)),
        () => (listening = false),
      );
    };
    kick.current = () => void work();
    listen();
    const onBack = () => {
      if (document.visibilityState !== 'visible') return;
      listen();
      void fetchWaiting();
    };
    document.addEventListener('visibilitychange', onBack);
    window.addEventListener('online', onBack);
    return () => {
      stopped = true;
      stopListening?.();
      document.removeEventListener('visibilitychange', onBack);
      window.removeEventListener('online', onBack);
      kick.current = () => {};
    };
  }, [on, gardenRef, setGarden]);

  useEffect(() => {
    if (ready) kick.current();
  }, [ready]);
}
