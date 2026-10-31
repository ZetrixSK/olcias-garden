import { memo, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

export type View = 'room' | 'shelves';

/** The window is on the left, the shelves on the right: swiping left goes to the shelves. */
const ORDER: View[] = ['room', 'shelves'];
/** How far (as a share of the width) or how fast (px per ms) a swipe has to go to change the view. */
const COMMIT = 0.22;
const FLICK = 0.5;
/** A drag only starts once the finger has clearly moved sideways; anything less is a tap. */
const SLOP = 10;
const GLIDE = 'transform 340ms cubic-bezier(0.2, 0.8, 0.3, 1)';

const prefersStill = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const at = (index: number, px = 0) => `translate3d(calc(${-index * 100}% + ${px}px), 0, 0)`;

type Drag = { id: number; x: number; y: number; t: number; dx: number; active: boolean };

/**
 * The view out of sight keeps what it last drew and skips every update (a replay, a watering, the
 * clock) until it's about to be seen; then it catches up once. Only the view in sight does any work.
 */
const Frozen = memo(
  function Frozen({ children }: { live: boolean; children: ReactNode }) {
    return <>{children}</>;
  },
  (_prev, next) => !next.live,
);

/**
 * The garden's two views side by side, as if on one long wall, both already drawn: a sideways swipe
 * pulls the other one into sight under the finger, then glides on (or springs back). Changing the
 * view any other way glides there too. The view out of sight isn't painted until it's needed.
 */
export function ViewSwiper({ view, enabled, onChange, room, shelves }: {
  view: View;
  enabled: boolean;
  onChange: (v: View) => void;
  room: ReactNode;
  shelves: ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const swallowClick = useRef(false);
  const index = ORDER.indexOf(view);
  // both views show while one is sliding over the other; otherwise only the one in sight
  const [moving, setMoving] = useState(false);
  const shown = useRef(view);
  // the other view is drawn once the garden has settled after opening, so opening stays quick;
  // a swipe before then draws it there and then
  const [both, setBoth] = useState(false);
  useEffect(() => {
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (idle) {
      idle(() => setBoth(true), { timeout: 1500 });
      return;
    }
    const t = window.setTimeout(() => setBoth(true), 900);
    return () => window.clearTimeout(t);
  }, []);

  const place = (transform: string, transition: string) => {
    const el = track.current;
    if (!el) return;
    el.style.transition = transition;
    el.style.transform = transform;
  };

  // the track's place is only ever set here, so a change of view can glide rather than jump
  useLayoutEffect(() => place(at(index), 'none'), []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Both views stay drawn while sliding; once it's settled (or if no slide comes), only one. */
  const settle = () => window.setTimeout(() => setMoving(false), 420);

  // a change of view however it came (a swipe, or the button in the corner) glides there
  useLayoutEffect(() => {
    if (shown.current === view) return;
    shown.current = view;
    if (prefersStill()) return place(at(index), 'none');
    setMoving(true);
    place(at(index), GLIDE);
    settle();
  }, [view, index]);

  const target = (dx: number): View | null => ORDER[index + (dx < 0 ? 1 : -1)] ?? null;

  const onPointerDown = (e: React.PointerEvent) => {
    if (!enabled || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), dx: 0, active: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.active) {
      if (Math.abs(dx) < SLOP || Math.abs(dx) < Math.abs(dy) * 1.2) {
        // mostly up and down, or barely moved: not a swipe
        if (Math.abs(dy) > SLOP * 2) drag.current = null;
        return;
      }
      d.active = true;
      d.x = e.clientX - Math.sign(dx) * SLOP;
      track.current?.setPointerCapture(e.pointerId);
      setMoving(true);
    }
    const w = track.current?.clientWidth ?? 400;
    const raw = e.clientX - d.x;
    // going nowhere: it only gives a little, like pushing on a wall
    d.dx = target(raw) ? raw : Math.sign(raw) * Math.min(w * 0.08, Math.abs(raw) * 0.25);
    place(at(index, d.dx), 'none');
  };

  const end = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId || !d.active) return;
    // the click that may follow this drag isn't a tap; if none comes, the next real tap still counts
    swallowClick.current = true;
    window.setTimeout(() => (swallowClick.current = false), 80);
    const w = track.current?.clientWidth ?? 400;
    const speed = Math.abs(d.dx) / Math.max(1, performance.now() - d.t);
    const next = target(d.dx);
    if (next && (Math.abs(d.dx) > w * COMMIT || speed > FLICK)) {
      shown.current = next;
      place(at(ORDER.indexOf(next)), prefersStill() ? 'none' : GLIDE);
      onChange(next);
    } else {
      place(at(index), GLIDE);
    }
    settle();
  };

  return (
    <div
      className="pager"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      // a swipe that ends over a plant isn't a tap on it
      onClickCapture={(e) => {
        if (!swallowClick.current) return;
        swallowClick.current = false;
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <div
        ref={track}
        className={`pager-track${moving ? ' moving' : ''}`}
      >
        {ORDER.map((v, i) => (
          <div key={v} className={`view${v === view ? ' current' : ''}`} style={{ left: `${i * 100}%` }} aria-hidden={v !== view || undefined}>
            {(v === view || both || moving) && <Frozen live={v === view || moving}>{v === 'room' ? room : shelves}</Frozen>}
          </div>
        ))}
      </div>
    </div>
  );
}
