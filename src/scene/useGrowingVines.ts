import { useEffect, useRef, useState } from 'react';
import type { VineSpec } from './Vines';

/** How long a vine takes to stretch to its new length on screen. */
export const GROW_MS = 3200;

type Tween = { from: number; to: number; start: number };

const smooth = (x: number) => x * x * (3 - 2 * x);
const prefersStill = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/**
 * A vine that gets longer while she's looking (sent from the admin page, or the 3:00 check with the
 * app open) stretches out to its new length instead of jumping there. Vines already there when the
 * view opens, trims, and anything during a replay (`still`) show as they are.
 */
export function useGrowingVines(vines: VineSpec[], still: boolean): VineSpec[] {
  const shown = useRef<Map<string, number> | null>(null);
  const tweens = useRef(new Map<string, Tween>());
  const [, setFrame] = useState(0);
  const now = performance.now();

  const first = shown.current === null;
  const lengths = (shown.current ??= new Map());
  const out = vines.map((v) => {
    const tw = tweens.current.get(v.id);
    const current = tw ? tw.from + (tw.to - tw.from) * smooth(Math.min(1, (now - tw.start) / GROW_MS)) : (lengths.get(v.id) ?? 0);
    if (first || still || prefersStill() || v.length <= current + 0.001) {
      tweens.current.delete(v.id);
      lengths.set(v.id, v.length);
      return v;
    }
    if (!tw || tw.to !== v.length) tweens.current.set(v.id, { from: current, to: v.length, start: now });
    const t = tweens.current.get(v.id)!;
    const p = Math.min(1, (now - t.start) / GROW_MS);
    if (p >= 1) {
      tweens.current.delete(v.id);
      lengths.set(v.id, v.length);
      return v;
    }
    const length = t.from + (t.to - t.from) * smooth(p);
    lengths.set(v.id, length);
    return { ...v, length };
  });
  // a vine that's gone (switched off, moved off the sill) grows back in from nothing if it returns
  for (const id of lengths.keys()) {
    if (vines.some((v) => v.id === id)) continue;
    lengths.delete(id);
    tweens.current.delete(id);
  }

  const growing = tweens.current.size > 0;
  useEffect(() => {
    if (!growing) return;
    const raf = requestAnimationFrame(() => setFrame((f) => f + 1));
    return () => cancelAnimationFrame(raf);
  });

  return out;
}
