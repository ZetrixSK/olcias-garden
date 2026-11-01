import { useEffect, useRef, useState } from 'react';
import type { Theme } from '../theme/palettes';
import { CurtainCover, Curtains } from './Room';

const DRAW_MS = 1200;
const still = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

/**
 * The curtains, drawn or tied back. They glide between the two by themselves, so nothing else in
 * the room has to be redrawn while they move. Behind them the sky is masked: fully for the moon and
 * stars (`curtain-cover`), only partly for the candle and the glowing flowers, whose light shows
 * softly through the cloth (`curtain-cover-soft`).
 */
export function CurtainStage({ theme, closed, onToggle, onOpen }: {
  theme: Theme;
  closed: boolean;
  onToggle?: () => void;
  /** Called once they're fully open again, so what was hidden behind them can stop being masked. */
  onOpen: () => void;
}) {
  const [p, setP] = useState(closed ? 1 : 0);
  const now = useRef(p);
  const opened = useRef(onOpen);
  opened.current = onOpen;
  useEffect(() => {
    const target = closed ? 1 : 0;
    if (now.current === target) return;
    const from = now.current;
    const done = () => {
      now.current = target;
      setP(target);
      if (target === 0) opened.current();
    };
    if (still()) return done();
    const start = performance.now();
    const ms = DRAW_MS * Math.abs(target - from);
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      if (k >= 1) return done();
      now.current = from + (target - from) * ease(k);
      setP(now.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [closed]);
  return (
    <>
      {p > 0 && (
        <defs>
          <mask id="curtain-cover" maskUnits="userSpaceOnUse" x="-50" y="-500" width="500" height="2000">
            <rect x="-50" y="-500" width="500" height="2000" fill="#fff" />
            <CurtainCover p={p} fill="#000" />
          </mask>
          <mask id="curtain-cover-soft" maskUnits="userSpaceOnUse" x="-50" y="-500" width="500" height="2000">
            <rect x="-50" y="-500" width="500" height="2000" fill="#fff" />
            <CurtainCover p={p} fill="#5a5a5a" />
          </mask>
        </defs>
      )}
      <Curtains theme={theme} p={p} onToggle={onToggle} />
    </>
  );
}
