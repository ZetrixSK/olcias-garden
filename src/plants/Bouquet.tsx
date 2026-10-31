import { designRef, NO_DESIGNS } from '../garden/designs';
import { hash, rng } from '../garden/vines';
import type { Bouquet, Stem, Vase } from '../garden/bouquets';
import { pansyPalette } from './looks';
import { PressedSprig } from './Pressed';

/** The colours a stem's flower is drawn in: its own design if it has one, else its variety. */
export const stemPalette = (s: Stem) => (s.design ? pansyPalette(designRef(s.design.id), { pansies: [s.design], pots: NO_DESIGNS.pots }) : pansyPalette(s.variety, NO_DESIGNS));

/** Where each vase's mouth is, which the stems go into: its height and half its width. */
const MOUTH: Record<Vase, { y: number; w: number }> = { jar: { y: -34, w: 10 }, jug: { y: -38, w: 9 }, bottle: { y: -44, w: 4 } };

/** The back of the vase's mouth, drawn behind the stems. */
function VaseBack({ vase }: { vase: Vase }) {
  const m = MOUTH[vase];
  if (vase === 'jar') return <ellipse cx="0" cy={m.y} rx={m.w} ry="2.6" fill="#c9dcdc" fillOpacity="0.5" className="ink-thin" />;
  if (vase === 'jug') return <ellipse cx="0" cy={m.y} rx={m.w} ry="2.4" fill="#3a2d2a" className="ink-thin" />;
  return <ellipse cx="0" cy={m.y} rx={m.w} ry="1.4" fill="#1d1420" className="ink-thin" />;
}

/** The vase itself, drawn over the stems so they go into it. */
function VaseFront({ vase, ribbon }: { vase: Vase; ribbon: string | null }) {
  const m = MOUTH[vase];
  return (
    <g>
      {vase === 'jar' && (
        <>
          {/* clear glass: the stems show through, with the water standing in it */}
          <path className="ink" fill="#d6e6e4" fillOpacity="0.45" d="M-10,-34 C-12,-30 -13,-26 -13,-20 L-13,-4 C-13,-1 -11,0 -8,0 L8,0 C11,0 13,-1 13,-4 L13,-20 C13,-26 12,-30 10,-34 Z" />
          <path d="M-12.4,-16 C-6,-14.6 6,-14.6 12.4,-16 L12.4,-4 C12.4,-1.4 10.6,-0.6 8,-0.6 L-8,-0.6 C-10.6,-0.6 -12.4,-1.4 -12.4,-4 Z" fill="#b9d3d6" opacity="0.45" />
          <path d="M-9,-28 C-10.4,-22 -10.4,-12 -9.4,-5" fill="none" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
          <path d="M-10.6,-31 C-4,-29.6 4,-29.6 10.6,-31" fill="none" stroke="#a88a62" strokeWidth="1.4" />
          <path d="M-10.6,-29 C-4,-27.6 4,-27.6 10.6,-29" fill="none" stroke="#a88a62" strokeWidth="1.4" />
        </>
      )}
      {vase === 'jug' && (
        <>
          <path className="ink" fill="none" strokeWidth="2.4" d="M10,-30 C20,-30 20,-14 9,-12" />
          <path className="ink" fill="#efe6d6" d="M-9,-38 C-10,-34 -12,-30 -13,-24 C-15,-14 -12,-4 -8,0 L8,0 C12,-4 15,-14 13,-24 C12,-30 10,-34 9,-38 C6,-36.6 -6,-36.6 -9,-38 Z" />
          <path d="M-9,-38 L-13,-41 L-7,-38.4" className="ink-thin" fill="#efe6d6" />
          <path d="M-13.6,-20 C-5,-18 5,-18 13.6,-20 M-13.4,-16 C-5,-14 5,-14 13.4,-16" fill="none" stroke="#c95d7f" strokeWidth="1.3" />
          <path d="M-8,-30 C-10,-24 -10.6,-16 -9,-8" fill="none" stroke="#fbf7f0" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
      {vase === 'bottle' && (
        <>
          {/* an apothecary bottle, dark glass with a little label */}
          <path className="ink" fill="#3b2a3a" d="M-4,-44 L-4,-34 C-4,-31 -13,-28 -13,-20 L-13,-3 C-13,-1 -11,0 -9,0 L9,0 C11,0 13,-1 13,-3 L13,-20 C13,-28 4,-31 4,-34 L4,-44 Z" />
          <path className="ink-thin" fill="#5a4558" d="M-5,-46 L5,-46 L5,-43 L-5,-43 Z" />
          <path className="ink-thin" fill="#efe1c6" d="M-9,-19 L9,-19 L9,-8 L-9,-8 Z" />
          <path d="M-6,-15.6 L6,-15.6 M-5,-12 L4,-12" stroke="#8a7a6a" strokeWidth="0.8" />
          <path d="M-9,-26 C-10.6,-20 -10.6,-12 -10,-5" fill="none" stroke="#7a6478" strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
      {ribbon && (
        <g transform={`translate(${vase === 'bottle' ? 0 : -1} ${m.y + (vase === 'bottle' ? 11 : 6)})`}>
          <path className="ink-thin" fill={ribbon} d="M0,0 C-3,-5 -9,-6 -9,-2 C-9,1.6 -4,2 0,0 Z M0,0 C3,-5 9,-6 9,-2 C9,1.6 4,2 0,0 Z" />
          <path className="ink-thin" fill={ribbon} d="M-1,1 C-2,5 -4,9 -6,11 L-3.6,10.6 L-2.6,12.6 C-0.8,9 0.2,5 0.4,1.4 Z M1,1 C2.4,4.6 4.4,8 6.6,10 L4.2,10 L3.8,12.2 C2,9 0.6,5 0,1.6 Z" />
          <ellipse className="ink-thin" cx="0" cy="0" rx="1.8" ry="2" fill={ribbon} />
        </g>
      )}
    </g>
  );
}

/** A small card on a thread, when the bouquet came with a few words. */
function NoteCard({ vase }: { vase: Vase }) {
  const y = MOUTH[vase].y + 8;
  return (
    <g transform={`translate(12 ${y})`}>
      <path d="M-2,-1 C2,1 4,4 5,7" fill="none" stroke="#8a7a6a" strokeWidth="0.7" />
      <g transform="translate(5 7) rotate(12)">
        <path className="ink-thin" fill="#fbf7f0" d="M0,0 L10,0 L10,7 L0,7 Z" />
        <path d="M2,2.6 L8,2.6 M2,4.6 L6.4,4.6" stroke="#c95d7f" strokeWidth="0.6" />
      </g>
    </g>
  );
}

/**
 * A bouquet in its vase, standing on (0,0). Each stem is one of the pressed-flower sprigs, fanned
 * out of the vase's mouth; the bouquet's seed decides the arrangement, so "shuffle" gives another.
 */
export function BouquetArt({ bouquet, showNote = true }: { bouquet: Pick<Bouquet, 'stems' | 'vase' | 'ribbon' | 'seed' | 'note' | 'id'>; showNote?: boolean }) {
  const { stems, vase, ribbon, seed } = bouquet;
  const r = rng(seed * 7919 + 13);
  const n = stems.length;
  const spread = Math.min(78, 18 + n * 9);
  const m = MOUTH[vase];
  const placed = stems.map((stem, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const angle = (t - 0.5) * spread + (r() - 0.5) * 10;
    const s = 0.6 + r() * 0.12 - Math.abs(t - 0.5) * 0.08;
    const dx = (t - 0.5) * m.w * 0.9;
    return { stem, angle, s, dx, key: i, sprigSeed: hash(`${bouquet.id}/${i}/${seed}`) };
  });
  // the middle stems stand at the back, the outer ones lean forward over them
  const order = [...placed].sort((a, b) => Math.abs(a.angle) - Math.abs(b.angle));
  return (
    <g>
      <VaseBack vase={vase} />
      {order.map((p) => (
        <g key={p.key} transform={`translate(${p.dx.toFixed(1)} ${m.y + 10}) rotate(${p.angle.toFixed(1)}) scale(${p.s.toFixed(2)})`}>
          <PressedSprig species={p.stem.species} palette={stemPalette(p.stem)} seed={p.sprigSeed} />
        </g>
      ))}
      <VaseFront vase={vase} ribbon={ribbon} />
      {showNote && bouquet.note.trim() && <NoteCard vase={vase} />}
    </g>
  );
}

/** A box on the floor holding bouquets that arrived with no room on the shelves, tied with string. */
export function ParcelBox({ count }: { count: number }) {
  return (
    <g>
      {count > 1 && (
        <g transform="translate(10 -4) rotate(4)">
          <path className="ink" fill="#b98f65" d="M-14,0 L14,0 L14,-18 L-14,-18 Z" />
          <path d="M0,0 L0,-18 M-14,-9 L14,-9" stroke="#efe1c6" strokeWidth="1.4" />
        </g>
      )}
      <path className="ink" fill="#c8a074" d="M-17,0 L17,0 L17,-22 L-17,-22 Z" />
      <path className="ink-thin" fill="#d8b488" d="M-17,-22 L17,-22 L14,-27 L-14,-27 Z" />
      <path d="M0,0 L0,-27 M-17,-11 L17,-11" stroke="#efe1c6" strokeWidth="1.6" />
      {/* the bow on top */}
      <path className="ink-thin" fill="none" stroke="#efe1c6" strokeWidth="1.4" d="M0,-27 C-6,-33 -10,-29 -5,-26 M0,-27 C6,-33 10,-29 5,-26" />
      {/* a little label with a flower drawn on it */}
      <g transform="translate(-11 -8) rotate(-8)">
        <path className="ink-thin" fill="#fbf7f0" d="M0,0 L9,0 L9,-6 L0,-6 Z" />
        <circle cx="4.5" cy="-3" r="1.6" fill="#c95d7f" />
      </g>
    </g>
  );
}
