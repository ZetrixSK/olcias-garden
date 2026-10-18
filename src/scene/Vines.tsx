import { memo, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { WindowSpot } from '../garden/state';
import type { MiddleDir, RouteKind } from '../garden/vines';
import { Stem } from '../plants/common';
import { PANSY_MIX, PansyBud, PansyFlower, PansyLeaf, type PansyColors } from '../plants/Pansy';
import { LeafCluster, RoseBloom, RoseBud, RoseHalf, Thorns } from '../plants/Rose';
import { seeded } from './geometry';

/**
 * A vine growing out of a pot on the sill. `length` is how far along its route it has got, 0 to 1.
 * A vine from the middle pot also remembers which way it turned at the top.
 */
export type VineSpec = { id: string; species: 'pansy' | 'rose'; from: WindowSpot; length: number; dir?: MiddleDir; palette?: PansyColors[] };

/**
 * Which part of the route a point is on: the runner leaving the pot, the frame it holds on to while
 * climbing, or the arch, where it is high enough to loosen and drape.
 */
type Part = 'runner' | 'frame' | 'arch';
type Raw = { x: number; y: number; kind: Part };
type Pt = Raw & { s: number; ang: number };

// ---- the route: out of the pot, across to the frame, up it, over the arch, down the far side ----

const ARCH = { cx: 200, cy: 212 };
/** The vine holds the inner edge of the frame, just on the glass side, so it reads as clinging to it. */
const HOLD = 138;
const SIDE_L = ARCH.cx - HOLD;
const SIDE_R = ARCH.cx + HOLD;

type Start = { x: number; y: number };

function cubic(a: [number, number], b: [number, number], c: [number, number], d: [number, number], kind: Part): Raw[] {
  return Array.from({ length: 41 }, (_, i) => {
    const t = i / 40;
    const u = 1 - t;
    return {
      x: u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
      y: u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
      kind,
    };
  });
}

function line(a: [number, number], b: [number, number], kind: Part): Raw[] {
  return Array.from({ length: 41 }, (_, i) => ({ x: a[0] + ((b[0] - a[0]) * i) / 40, y: a[1] + ((b[1] - a[1]) * i) / 40, kind }));
}

/** Along the arch between two angles (radians, counter-clockwise from the right; y points down). */
function arc(a0: number, a1: number): Raw[] {
  return Array.from({ length: 121 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / 120;
    return { x: ARCH.cx + HOLD * Math.cos(a), y: ARCH.cy - HOLD * Math.sin(a), kind: 'arch' as Part };
  });
}

/** Resamples to evenly spaced points (every 2 units) so leaves and flowers are placed by distance. */
function resample(raw: Raw[]): Pt[] {
  const out: Pt[] = [];
  let acc = 0;
  let next = 0;
  for (let i = 1; i < raw.length; i++) {
    const a = raw[i - 1]!;
    const b = raw[i]!;
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (seg === 0) continue;
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    while (next <= acc + seg) {
      const t = (next - acc) / seg;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, s: next, ang, kind: t < 0.5 ? a.kind : b.kind });
      next += 2;
    }
    acc += seg;
  }
  return out;
}

const TOP = ARCH.cy - HOLD;

/** The runner from a pot to the left side of the frame. */
function reachLeft(start: Start): Raw[] {
  const reach = start.y - 50;
  return [
    ...cubic([start.x, start.y], [start.x - 10, start.y - 26], [SIDE_L + 16, reach + 10], [SIDE_L, reach], 'runner'),
    ...line([SIDE_L, reach], [SIDE_L, ARCH.cy], 'frame'),
  ];
}

/** Up the left frame, over the left half of the arch, then down the centre glazing bar. */
function leftToMiddle(start: Start): Raw[] {
  return [
    ...reachLeft(start),
    ...arc(Math.PI, Math.acos(-14 / HOLD)),
    ...cubic([ARCH.cx - 14, TOP + 0.7], [ARCH.cx - 5, TOP], [ARCH.cx, TOP + 5], [ARCH.cx, TOP + 16], 'arch'),
    ...line([ARCH.cx, TOP + 16], [ARCH.cx, 410], 'frame'),
  ];
}

/** Up the left frame, over the whole arch, down the right side. */
function leftAcross(start: Start): Raw[] {
  return [...reachLeft(start), ...arc(Math.PI, 0), ...line([SIDE_R, ARCH.cy], [SIDE_R, 430], 'frame')];
}

/** From the middle pot: up the centre glazing bar to the top of the arch, then over and down the right side. */
function middleToRight(start: Start): Raw[] {
  return [
    ...cubic([start.x, start.y], [start.x + 2, start.y - 22], [ARCH.cx, start.y - 26], [ARCH.cx, start.y - 52], 'runner'),
    ...line([ARCH.cx, start.y - 52], [ARCH.cx, TOP + 16], 'frame'),
    ...cubic([ARCH.cx, TOP + 16], [ARCH.cx, TOP + 5], [ARCH.cx + 5, TOP], [ARCH.cx + 14, TOP + 0.7], 'arch'),
    ...arc(Math.acos(14 / HOLD), 0),
    ...line([SIDE_R, ARCH.cy], [SIDE_R, 430], 'frame'),
  ];
}

const mirror = (raw: Raw[]) => raw.map((p) => ({ ...p, x: 400 - p.x }));
/** Draws a right-hand route as the mirror image of its left-hand twin. */
const mirrored = (route: (s: Start) => Raw[], start: Start) => mirror(route({ x: 400 - start.x, y: start.y }));

const ROUTE_SHAPES: Record<RouteKind, (s: Start) => Raw[]> = {
  'left-across': leftAcross,
  'left-middle': leftToMiddle,
  'right-across': (s) => mirrored(leftAcross, s),
  'right-middle': (s) => mirrored(leftToMiddle, s),
  'middle-right': middleToRight,
  'middle-left': (s) => mirrored(middleToRight, s),
};

/** Which way the plant leans when it sends out a runner. */
export function leanFor(kind: RouteKind): number {
  return kind.startsWith('left') ? -6 : kind.startsWith('right') ? 6 : kind === 'middle-right' ? 3 : -3;
}

/** Where the runner leaves the soil: a little off-centre, towards the side it is heading. */
export function runnerStart(kind: RouteKind, x: number, rimY: number): Start {
  return { x: x + leanFor(kind) * 1.4, y: rimY - 1 };
}


// ---- drawing ----

const deg = (r: number) => (r * 180) / Math.PI;

/**
 * The vine's own wander around its route. It hugs the frame tightly while climbing and loosens on the
 * arch. Two vines on the same route use opposite phases, so they braid.
 */
function wander(pts: Pt[], phase: number, rose: boolean): Pt[] {
  const target = pts.map((p) => (p.kind === 'arch' ? (rose ? 6 : 7) : p.kind === 'frame' ? 2.2 : 0.6));
  // smooth the amplitude so the change from clinging to draping is gradual
  const amp = target.map((_, i) => {
    let sum = 0;
    let n = 0;
    for (let j = Math.max(0, i - 15); j <= Math.min(target.length - 1, i + 15); j++) {
      sum += target[j]!;
      n++;
    }
    return sum / n;
  });
  const wave = rose ? 44 : 32;
  return pts.map((p, i) => {
    const off = amp[i]! * Math.sin((p.s / wave) * Math.PI * 2 + phase);
    return { ...p, x: p.x - Math.sin(p.ang) * off, y: p.y + Math.cos(p.ang) * off };
  });
}

const pathOf = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('');

/** A stem tapering from base to growing tip, drawn in chunks with the outline under the colour. */
function TaperedStem({ pts, total, base, tip, color }: { pts: Pt[]; total: number; base: number; tip: number; color: string }) {
  const chunks: { d: string; w: number }[] = [];
  for (let i = 0; i < pts.length - 1; i += 12) {
    const part = pts.slice(i, i + 13);
    chunks.push({ d: pathOf(part), w: base + (tip - base) * (pts[i]!.s / total) });
  }
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {chunks.map((c, i) => (
        <path key={`o${i}`} d={c.d} style={{ stroke: 'var(--ink)' }} strokeWidth={c.w + 1.8} />
      ))}
      {chunks.map((c, i) => (
        <path key={`c${i}`} d={c.d} stroke={color} strokeWidth={c.w} />
      ))}
    </g>
  );
}

function Tendril({ p, color }: { p: Pt; color: string }) {
  return (
    <g transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${deg(p.ang).toFixed(1)})`}>
      <Stem d="M0,0 C5,-0.5 9,-3 9.5,-7 C10,-10.5 6.5,-11.5 5.4,-9 C4.6,-7.2 6.2,-6 7.4,-7" w={1.1} color={color} />
    </g>
  );
}


/**
 * Leaves, flowers and hanging sprigs along the stem, for the stretch from s0 to s1. Everything is
 * placed by distance from the pot, so a piece drawn in two layers lines up exactly.
 */
function Growth({ rose, pts, length, s0, s1, seed, palette }: {
  rose: boolean; pts: Pt[]; length: number; s0: number; s1: number; seed: number; palette: PansyColors[];
}) {
  const hue = (i: number) => palette[i % palette.length]!;
  const rnd = seeded(seed);
  const back: ReactNode[] = [];
  const front: ReactNode[] = [];
  const leafEvery = rose ? 14 : 12;
  const flowerEvery = rose ? 52 : 40;
  let side = 1;
  let flowerN = 0;
  const thorns: Array<[number, number, number]> = [];

  for (let s = 8; s < length - 4; s += 2) {
    const p = pts[s / 2];
    if (!p) break;
    // keep the random sequence the same whichever stretch is being drawn
    const r = [rnd(), rnd(), rnd(), rnd()] as const;
    const isLeaf = s % leafEvery === 0;
    if (isLeaf) side = -side;
    const isFlower = s % flowerEvery === flowerEvery / 2;
    const n = isFlower ? flowerN++ : 0;
    if (s < s0 || s >= s1) continue;

    const age = length - s;
    const nx = -Math.sin(p.ang);
    const ny = Math.cos(p.ang);
    // while clinging to the frame, flowers turn towards the room, away from the curtain
    const towardsGlass = Math.sign(200 - p.x) * Math.sign(nx || 1) || 1;

    if (isLeaf) {
      const grow = Math.min(1, 0.35 + age / 50);
      const dir = deg(p.ang) + side * (58 + r[0] * 26) + 90;
      if (rose) {
        back.push(<LeafCluster key={`l${s}`} x={p.x} y={p.y} rot={dir} len={13 * grow} young={age < 30} />);
      } else {
        back.push(
          <g key={`l${s}`} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${(0.55 * grow).toFixed(2)})`}>
            <PansyLeaf rot={dir} len={5 + r[1] * 5} />
          </g>,
        );
      }
    }
    if (rose && s % 22 === 11 && p.kind !== 'arch') thorns.push([p.x + nx * 2.4 * side, p.y + ny * 2.4 * side, deg(p.ang) + 90 * side]);

    // once it is over the arch it drapes: little sprigs hang into the glass
    if (p.kind === 'arch' && s % (rose ? 40 : 34) === 0 && age > 30 && p.y < 190) {
      const drop = Math.min(1, (age - 30) / 60) * (18 + r[2] * 22);
      const sway = (r[3] - 0.5) * 12;
      const color = rose ? '#6b8049' : '#6b9455';
      const tipX = p.x + sway - (p.x - 200) * 0.06;
      const tipY = p.y + drop;
      back.push(
        <g key={`h${s}`}>
          <Stem
            d={`M${p.x.toFixed(1)},${p.y.toFixed(1)} C${(p.x + 4).toFixed(1)},${(p.y + drop * 0.5).toFixed(1)} ${(tipX - 3).toFixed(1)},${(tipY - drop * 0.3).toFixed(1)} ${tipX.toFixed(1)},${tipY.toFixed(1)}`}
            w={1.2}
            color={color}
          />
          {rose ? (
            <LeafCluster x={p.x + sway * 0.4} y={p.y + drop * 0.5} rot={r[0] > 0.5 ? 120 : -120} len={9} />
          ) : (
            <g transform={`translate(${(p.x + sway * 0.4).toFixed(1)} ${(p.y + drop * 0.45).toFixed(1)}) scale(0.42)`}>
              <PansyLeaf rot={r[0] > 0.5 ? 110 : -110} len={4} />
            </g>
          )}
        </g>,
      );
      if (drop > 14) {
        front.push(
          rose ? (
            <g key={`hf${s}`} transform={`translate(${tipX.toFixed(1)} ${tipY.toFixed(1)}) rotate(180) scale(0.62)`}>
              <RoseBud x={0} y={0} rot={0} />
            </g>
          ) : (
            <PansyFlower key={`hf${s}`} x={tipX} y={tipY + 6} rot={sway} s={0.34} c={hue(s / 2)} />
          ),
        );
      }
    }

    // flowers on the main stem: buds near the tip, open further back
    if (isFlower) {
      const fs = (p.kind === 'frame' ? towardsGlass : n % 2 ? 1 : -1) * 8;
      const fx = p.x + nx * fs;
      const fy = p.y + ny * fs;
      const tilt = (r[0] - 0.5) * 30;
      if (rose) {
        if (age > 110 && n % 4 !== 3) {
          front.push(
            n % 2 === 0 ? (
              <RoseBloom key={`f${s}`} x={fx} y={fy} rot={tilt} s={0.5} />
            ) : (
              <g key={`f${s}`} transform={`translate(${fx.toFixed(1)} ${fy.toFixed(1)}) scale(0.62)`}>
                <RoseHalf x={0} y={0} rot={tilt} />
              </g>
            ),
          );
        } else if (age > 50) {
          front.push(
            <g key={`f${s}`} transform={`translate(${fx.toFixed(1)} ${fy.toFixed(1)}) scale(0.6)`}>
              <RoseBud x={0} y={0} rot={deg(Math.atan2(ny * fs, nx * fs)) + 90} />
            </g>,
          );
        }
      } else if (age > 44) {
        front.push(<PansyFlower key={`f${s}`} x={fx} y={fy} rot={tilt} s={0.4 + r[1] * 0.06} c={hue(n)} />);
      } else if (age > 18) {
        front.push(<PansyBud key={`f${s}`} x={fx} y={fy} rot={tilt * 0.6} c={hue(n)} />);
      }
    }
  }
  return (
    <>
      <g>{back}</g>
      {thorns.length > 0 && <Thorns pts={thorns} />}
      <g>{front}</g>
    </>
  );
}

type Shaped = { pts: Pt[]; length: number; total: number; runnerEnd: number; rose: boolean; seed: number; color: string; palette: PansyColors[] };

function shape(vine: VineSpec, kind: RouteKind, start: Start, phase: number): Shaped | null {
  if (vine.length <= 0) return null;
  const route = resample(ROUTE_SHAPES[kind](start));
  const total = route[route.length - 1]!.s;
  const length = Math.min(1, vine.length) * total;
  const rose = vine.species === 'rose';
  const pts = wander(route, phase, rose).filter((p) => p.s <= length);
  if (pts.length < 2) return null;
  const runnerEnd = route.find((p) => p.kind !== 'runner')?.s ?? total;
  const seed = [...vine.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return { pts, length, total, runnerEnd, rose, seed, color: rose ? '#6b8049' : '#6b9455', palette: vine.palette ?? PANSY_MIX };
}

function PieceArt({ v, from, to }: { v: Shaped; from: number; to: number }) {
  const pts = v.pts.filter((p) => p.s >= from - 2 && p.s <= to + 2);
  if (pts.length < 2) return null;
  const tipHere = v.length <= to;
  return (
    <g>
      <TaperedStem pts={pts} total={v.total} base={v.rose ? 3.2 : 2.6} tip={1.2} color={v.color} />
      {tipHere && <Tendril p={v.pts[v.pts.length - 1]!} color={v.color} />}
      <Growth rose={v.rose} pts={v.pts} length={v.length} s0={from} s1={to} seed={v.seed} palette={v.palette} />
    </g>
  );
}

/** Redrawn only once the vine has visibly grown (or moved), so a replay doesn't redraw every leaf each frame. */
const Piece = memo(
  PieceArt,
  (a, b) =>
    a.from === b.from &&
    a.to === b.to &&
    a.v.seed === b.v.seed &&
    a.v.total === b.v.total &&
    a.v.palette === b.v.palette &&
    Math.round(a.v.length / 3) === Math.round(b.v.length / 3) &&
    a.v.pts[0]!.x === b.v.pts[0]!.x &&
    a.v.pts[0]!.y === b.v.pts[0]!.y,
);

export type PlacedVine = { vine: VineSpec; kind: RouteKind; start: Start; phase: number };

/**
 * Each pot's vine has its own phase, so wherever two share a stretch of the window they cross and
 * braid instead of lying on top of each other.
 */
export const VINE_PHASE: Partial<Record<WindowSpot, number>> = { 'sill-1': 0, 'sill-2': Math.PI / 2, 'sill-3': Math.PI };

/** The runner: from the soil, over the rim, to the frame. Drawn between the plant and its pot front. */
export function VineRunner({ placed }: { placed: PlacedVine }) {
  const v = shape(placed.vine, placed.kind, placed.start, placed.phase);
  return v ? <Piece v={v} from={0} to={v.runnerEnd} /> : null;
}

/** Tells the vines a snip just happened to this plant, so the cut-off part can fall. */
export type Snip = { id: string; n: number };

type Falling = { key: string; x: number; y: number; rose: boolean; dx: number; rot: number; delay: number };

/** Leaves from the cut-off end drift down and fade. */
function FallingLeaves({ bits }: { bits: Falling[] }) {
  return (
    <g pointerEvents="none">
      {bits.map((b) => (
        <g key={b.key} transform={`translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`}>
          <g
            className="snip-leaf"
            style={{ '--dx': `${b.dx}px`, '--rot': `${b.rot}deg`, animationDelay: `${b.delay}s` } as CSSProperties}
          >
            {b.rose ? (
              <LeafCluster x={0} y={0} rot={b.rot / 3} len={9} />
            ) : (
              <g transform="scale(0.5)">
                <PansyLeaf rot={b.rot / 3} len={4} />
              </g>
            )}
          </g>
        </g>
      ))}
    </g>
  );
}

/** Everything past the runner: on the window frame, behind the hanging shelf and the curtains. */
export function Vines({ placed, snip = null }: { placed: PlacedVine[]; snip?: Snip | null }) {
  const shaped = placed.map((p) => ({ id: p.vine.id, v: shape(p.vine, p.kind, p.start, p.phase) }));
  // the shapes as last drawn, so a snip knows where the part that was cut off used to be
  const lastShapes = useRef(new Map<string, Shaped>());
  const [falling, setFalling] = useState<Falling[]>([]);

  useEffect(() => {
    if (!snip) return;
    const before = lastShapes.current.get(snip.id);
    if (!before) return;
    const after = shaped.find((s) => s.id === snip.id)?.v?.length ?? 0;
    const cut = before.pts.filter((p) => p.s > after);
    const count = Math.min(6, Math.max(3, Math.round(cut.length / 10)));
    const bits = Array.from({ length: count }, (_, i) => {
      const p = cut[Math.floor(((i + 0.5) / count) * cut.length)];
      return p
        ? { key: `${snip.n}-${i}`, x: p.x, y: p.y, rose: before.rose, dx: (i % 2 ? 1 : -1) * (6 + i * 3), rot: (i % 2 ? 1 : -1) * (120 + i * 40), delay: i * 0.07 }
        : null;
    }).filter((b): b is Falling => b !== null);
    setFalling(bits);
    const t = window.setTimeout(() => setFalling([]), 1900);
    return () => window.clearTimeout(t);
    // only a new snip should start leaves falling
  }, [snip?.n]);

  useEffect(() => {
    lastShapes.current = new Map(shaped.flatMap((s) => (s.v ? [[s.id, s.v] as const] : [])));
  });

  return (
    <g className="vines">
      {shaped.map(({ id, v }) => (v ? <Piece key={id} v={v} from={v.runnerEnd} to={Infinity} /> : null))}
      <FallingLeaves bits={falling} />
    </g>
  );
}
