import { memo, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

export type View = 'room' | 'shelves';

/** The window is on the left, the shelves on the right: swiping left goes to the shelves. */
const ORDER: View[] = ['room', 'shelves'];
/** How far (as a share of the width) or how fast (px per ms) a swipe has to go to change the view. */
const COMMIT = 0.22;
const FLICK = 0.5;
/** A drag only starts once the finger has clearly moved sideways; anything less is a tap. */
const SLOP = 10;
const GLIDE = 'transform 360ms cubic-bezier(0.22, 0.9, 0.3, 1)';

const prefersStill = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const at = (index: number, px = 0) => `translate3d(calc(${-index * 100}% + ${px}px), 0, 0)`;

type Idle = (cb: () => void, o?: { timeout: number }) => number;
/** Runs when the phone has a quiet moment (or soon, where there's no way to ask). */
const whenIdle = (cb: () => void, timeout: number) => {
  const idle = (window as Window & { requestIdleCallback?: Idle }).requestIdleCallback;
  if (idle) idle(cb, { timeout });
  else window.setTimeout(cb, Math.min(timeout, 600));
};

type Drag = { id: number; x: number; y: number; t: number; dx: number; active: boolean };

/**
 * The view out of sight keeps what it last drew. It catches up with any change in a quiet moment
 * soon after (`version`), never in the middle of a swipe; only the view in sight follows every change.
 */
const Frozen = memo(
  function Frozen({ children }: { live: boolean; version: number; children: ReactNode }) {
    return <>{children}</>;
  },
  (prev, next) => !next.live && prev.version === next.version,
);

/**
 * The garden's two views side by side, as if on one long wall. Once both are drawn they stay
 * drawn, so a swipe only moves them: the other view comes into sight under the finger, then the
 * wall glides on (or springs back). Changing the view any other way glides there too.
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
  const shown = useRef(view);

  // the other view is drawn once the garden has settled after opening, so opening stays quick
  const [both, setBoth] = useState(false);
  useEffect(() => whenIdle(() => setBoth(true), 1500), []);

  // the view out of sight catches up with changes in a quiet moment, not while she's swiping
  const [version, setVersion] = useState(0);
  const stale = useRef(false);
  const lastProps = useRef({ room, shelves });
  if (lastProps.current.room !== room || lastProps.current.shelves !== shelves) {
    lastProps.current = { room, shelves };
    stale.current = true;
  }
  useEffect(() => {
    if (!both || !stale.current) return;
    let cancelled = false;
    const t = window.setTimeout(
      () =>
        whenIdle(() => {
          if (cancelled || !stale.current) return;
          stale.current = false;
          setVersion((v) => v + 1);
        }, 2000),
      700,
    );
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  });

  const place = (transform: string, transition: string) => {
    const el = track.current;
    if (!el) return;
    el.style.transition = transition;
    el.style.transform = transform;
  };

  // the track's place is only ever set here, so a change of view can glide rather than jump
  useLayoutEffect(() => place(at(index), 'none'), []); // eslint-disable-line react-hooks/exhaustive-deps

  // a change of view however it came (a swipe, or the button in the corner) glides there
  useLayoutEffect(() => {
    if (shown.current === view) return;
    shown.current = view;
    if (!both) setBoth(true);
    place(at(index), prefersStill() ? 'none' : GLIDE);
  }, [view, index, both]);

  const target = (dx: number): View | null => ORDER[index + (dx < 0 ? 1 : -1)] ?? null;

  const onPointerDown = (e: React.PointerEvent) => {
    if (!enabled || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), dx: 0, active: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.active) {
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (Math.abs(dx) < SLOP || Math.abs(dx) < Math.abs(dy) * 1.2) {
        // mostly up and down, or barely moved: not a swipe
        if (Math.abs(dy) > SLOP * 2) drag.current = null;
        return;
      }
      d.active = true;
      // start from here, so the wall doesn't jump by the distance it took to tell it was a swipe
      d.x = e.clientX;
      d.t = performance.now();
      track.current?.setPointerCapture(e.pointerId);
      // only if the other view missed a change (or isn't drawn yet) is there anything to do now
      if (!both) setBoth(true);
      else if (stale.current) {
        stale.current = false;
        setVersion((v) => v + 1);
      }
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
      place(at(index), prefersStill() ? 'none' : GLIDE);
    }
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
      <div ref={track} className={`pager-track${both ? ' ready' : ''}`}>
        {ORDER.map((v, i) =>
          v === view || both ? (
            <div key={v} className={`view${v === view ? ' current' : ''}`} style={{ left: `${i * 100}%` }} aria-hidden={v !== view || undefined}>
              <Frozen live={v === view} version={version}>
                {v === 'room' ? room : shelves}
              </Frozen>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
