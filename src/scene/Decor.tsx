import type { Theme } from '../theme/palettes';
import { PansyFlower, PANSY_OLCIA } from '../plants/Pansy';
import { moonPath } from '../weather/moon';
import { fv } from './geometry';

export const CANDLE_FLAME: Record<Theme, [number, number]> = {
  cozy: [335, 483],
  witchy: [337, 462],
};

/** Candle on the right end of the sill. The flame itself is drawn in the light layer. */
export function SillCandle({ theme }: { theme: Theme }) {
  if (theme === 'cozy') {
    return (
      <g>
        <path className="ink" fill="#9fb08f" d="M316,517 L354,517 L354,509 L316,509 Z" />
        <path d="M318,513 L352,513" stroke="#eee4d2" strokeWidth="1.2" />
        <path className="ink" fill="#d9a0a8" d="M320,509 L350,509 L350,502 L320,502 Z" />
        <path d="M344,503 L344,508" stroke="#b57a85" strokeWidth="2" />
        {/* jar candle */}
        <path className="ink" fill="#efe2cf" fillOpacity="0.55" d="M325,502 L325,484 C325,481 345,481 345,484 L345,502 Z" />
        <path fill="#e7a7b6" d="M326,501 L326,491 C330,492.5 340,492.5 344,491 L344,501 Z" />
        <path d="M326,491 C330,492.5 340,492.5 344,491" fill="none" stroke="#c98597" strokeWidth="1" />
        <path className="ink-thin" fill="#c9a77b" d="M328,494 L342,494 L342,500 L328,500 Z" />
        <path d="M335,491.5 L335,486.5" stroke="#3a2a22" strokeWidth="1" strokeLinecap="round" />
        <path d="M327,486 L327,500" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      <ellipse className="ink" cx="337" cy="514" rx="15" ry="3.6" fill="#b58f4f" />
      <path className="ink" fill="#c9a45c" d="M331,514 L331,506 C331,503 343,503 343,506 L343,514 Z" />
      <path className="ink" fill="#c9a45c" d="M350,511 C356,511 357,505 352,504 L350,506" />
      <path className="ink" fill="#24192a" d="M333.5,505 L333.5,468 C333.5,466.4 340.5,466.4 340.5,468 L340.5,505 Z" />
      <path className="ink-thin" fill="#2f2236" d="M340.5,470 C342,474 341.6,480 340.6,484 C339.6,480 339.8,474 340.5,470 Z M333.5,469 C332.4,473 332.6,476 333.6,478 Z" />
      <path d="M335.6,470 L335.6,502" stroke="#4d3d55" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M337,467 L337,463" stroke="#1a1218" strokeWidth="1" strokeLinecap="round" />
    </g>
  );
}

export function Flame({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="13" fill="#ffd38a" opacity="0.16" />
      <circle r="6" fill="#ffd38a" opacity="0.22" />
      <g className="flicker">
        <path d="M0,-11 C3,-6 4.6,-2 3.6,1.4 C2.8,3.6 -2.8,3.6 -3.6,1.4 C-4.6,-2 -2.4,-6 0,-11 Z" fill="#f7b24e" />
        <path d="M0,-6 C1.6,-3 2.2,-1 1.6,1 C1,2.2 -1,2.2 -1.6,1 C-2.2,-1 -1.2,-3 0,-6 Z" fill="#fff1c4" />
      </g>
    </g>
  );
}

/** Small object at the right end of the hanging shelf. */
export function ShelfTrinket({ theme }: { theme: Theme }) {
  if (theme === 'cozy') {
    return (
      <g transform="translate(290 321)">
        {/* a tiny watering can */}
        <path className="ink" fill="#8fa596" d="M-10,0 L-9,-16 C-9,-18 9,-18 9,-16 L10,0 Z" />
        <path className="ink" fill="#8fa596" d="M9,-6 L22,-20 L24,-18 L11,-2 Z" />
        <path className="ink" fill="#a8bcae" d="M20.5,-22 L26.5,-16 L28,-19 L23.5,-23.5 Z" />
        <path className="ink" fill="none" d="M-9,-14 C-18,-16 -18,-4 -9.5,-4" strokeWidth="2" />
        <path d="M-6,-14 L-5.4,-2" stroke="#c2d3c6" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M-9.4,-9 L9.6,-9" stroke="#e69bb2" strokeWidth="2" />
      </g>
    );
  }
  return (
    <g transform="translate(290 321)">
      {/* a little elixir: round flask, pink, corked, with a paper tag */}
      <path className="ink" fill="#e7dfe6" fillOpacity="0.5" d="M-3.5,-24 L-3.5,-18 C-11,-16 -13,-10 -12,-6 C-11,-1 -6,0 0,0 C6,0 11,-1 12,-6 C13,-10 11,-16 3.5,-18 L3.5,-24 Z" />
      <path fill="#d4709a" d="M-11.6,-8 C-9,-10 9,-10 11.6,-8 C11,-2 6,-0.8 0,-0.8 C-6,-0.8 -11,-2 -11.6,-8 Z" />
      <path d="M-8,-8.6 C-4,-9.6 4,-9.6 8,-8.6" stroke="#f1a9c6" strokeWidth="1" fill="none" />
      <circle cx="-4" cy="-5" r="1" fill="#f9d0e0" />
      <circle cx="2" cy="-3.4" r="0.7" fill="#f9d0e0" />
      <path className="ink" fill="#a07a52" d="M-4.5,-24 L-4,-29 L4,-29 L4.5,-24 Z" />
      <path d="M-6,-12 C-8,-15 -6,-18 -3.5,-18" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path className="ink-thin" fill="none" d="M3.5,-21 C8,-20 10,-18 11,-15" />
      <path className="ink-thin" fill="#efe1c6" transform="rotate(14 13 -13)" d="M9,-16 L17,-16 L17,-10 L9,-10 Z" />
      <path transform="translate(13 -13) rotate(14) scale(0.42)" d="M0,-5 A5,5 0 1 0 0,5 A3.4,5 0 1 1 0,-5 Z" fill="#5a2b4a" />
    </g>
  );
}

/** The witchy print, top to bottom: waxing crescent, first quarter, full, last quarter, waning crescent. */
const PRINT_PHASES = [0.15, 0.25, 0.5, 0.75, 0.85];
function nearestPhase(phase: number): number {
  const gap = (p: number) => Math.min(Math.abs(p - phase), 1 - Math.abs(p - phase));
  return PRINT_PHASES.reduce((best, p, i) => (gap(p) < gap(PRINT_PHASES[best]!) ? i : best), 0);
}

/** Framed picture on the left wall: a pressed pansy, or moon phases for the witchy room with tonight's ringed in gold. */
export function WallPicture({ theme, phase, onBook }: { theme: Theme; phase: number; onBook?: () => void }) {
  const tonight = nearestPhase(phase);
  if (theme === 'cozy') {
    return (
      <g transform="translate(62 652) rotate(-3)" className={onBook ? 'tappable' : undefined} onClick={onBook}>
        <path d="M0,-50 L0,-40" className="ink-thin" />
        <ellipse className="ink" cx="0" cy="0" rx="30" ry="38" fill="#c39a5a" />
        <ellipse className="ink-thin" cx="0" cy="0" rx="24" ry="32" fill="#f5ecda" />
        <path d="M2,26 C0,14 -2,4 -1,-8" fill="none" stroke="#7d9468" strokeWidth="1.4" />
        <path d="M0,16 C-8,14 -12,8 -12,4 C-6,6 -2,10 0,16 Z M1,8 C8,6 12,0 11,-3 C6,0 2,4 1,8 Z" fill="#8aa275" />
        <PansyFlower x={-1} y={-12} s={0.42} rot={-6} c={PANSY_OLCIA} />
      </g>
    );
  }
  return (
    <g transform="translate(62 652) rotate(-2)">
      <rect className="ink" x="-30" y="-40" width="60" height="78" fill="#1a141c" />
      <rect x="-25" y="-35" width="50" height="68" fill="#2c2846" />
      {PRINT_PHASES.map((p, i) => {
        const d = moonPath(4.4, p);
        const dy = -24 + i * 12;
        return (
          <g key={p} transform={`translate(0 ${dy})`}>
            <circle r={4.4} fill="#4a466a" />
            {d && <path d={d} fill="#ece2c4" />}
            {i === tonight && <circle r={6.4} fill="none" stroke="#c9a45c" strokeWidth="1" />}
          </g>
        );
      })}
      <path d="M-18,-30 l0.5,1.6 l1.6,0.5 l-1.6,0.5 l-0.5,1.6 l-0.5,-1.6 l-1.6,-0.5 l1.6,-0.5 Z M17,20 l0.5,1.6 l1.6,0.5 l-1.6,0.5 l-0.5,1.6 l-0.5,-1.6 l-1.6,-0.5 l1.6,-0.5 Z" fill="#c9a45c" />
    </g>
  );
}

/** Leaning against the right wall, behind the dog bed. */
export function CornerPiece({ theme }: { theme: Theme }) {
  if (theme === 'witchy') {
    return (
      <g transform="rotate(8 372 820)">
        <path className="ink" fill="#6b4a33" d="M369,590 L375,590 L376,770 L368,770 Z" />
        <path d="M371,594 L371.5,766" stroke="#8a6646" strokeWidth="1.4" />
        <path className="ink" fill="#c69c5a" d="M366,768 L378,768 C384,790 392,816 396,842 C380,846 364,846 348,842 C352,816 360,790 366,768 Z" />
        <path d="M368,776 C364,800 358,820 354,840 M372,776 L370,842 M376,776 C380,800 386,820 390,840 M370,790 C368,810 364,826 362,842 M374,790 C378,810 382,826 384,842" fill="none" stroke="#9d7740" strokeWidth="1" />
        <path className="ink" fill="#2a1f2c" d="M365,772 L379,772 L380,779 L364,779 Z" />
        <path d="M372,779 C366,786 362,790 362,796 M372,779 C378,786 381,792 380,798" fill="none" stroke="#d88aa6" strokeWidth="2" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      {/* a woven basket with yarn and a throw */}
      <path className="ink" fill="#c9a26e" d="M338,770 L398,770 L394,836 C380,840 356,840 342,836 Z" />
      {[784, 798, 812, 826].map((y) => (
        <path key={y} d={`M340,${y} L396,${y}`} stroke="#a47f4e" strokeWidth="1.2" />
      ))}
      {[350, 362, 374, 386].map((x, i) => (
        <path key={x} d={`M${x},771 L${x - 1 + i * 0.6},838`} stroke="#a47f4e" strokeWidth="1" />
      ))}
      <path className="ink" fill="#dfa0a6" d="M340,772 C340,752 352,744 362,748 C370,738 386,742 388,756 C396,758 400,766 398,772 Z" />
      <path d="M346,768 C350,758 358,752 366,754 M366,754 C372,748 380,750 384,758" fill="none" stroke="#c27f88" strokeWidth="1.3" />
      <circle className="ink" cx="383" cy="764" r="9" fill="#a8b79a" />
      <path d="M376,760 C380,764 386,766 390,764 M376,766 C380,770 386,771 390,768" fill="none" stroke="#86977a" strokeWidth="1" />
      <path d="M379,756 L392,740 M384,757 L398,744" className="ink" />
    </g>
  );
}

export function Ball() {
  return (
    <g transform="translate(46 846)">
      <circle className="ink" r="9" fill="#cfe06a" />
      <path d="M-8,-3 C-3,-1 -1,4 -3,8.5 M8,3 C3,1 1,-4 3,-8.5" fill="none" stroke="#f6f6ea" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M2,7 C5,6 7,4 8,2" fill="none" stroke="#a9b94d" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

/** Wall pieces between sill and floor, centred in whatever wall height the screen leaves. */
export function WallDecor({ theme, cy, scale, phase, onBook }: { theme: Theme; cy: number; scale: number; phase: number; onBook?: () => void }) {
  return (
    <g>
      <g transform={`translate(62 ${cy + 6}) scale(${scale}) translate(-62 -652)`}>
        <WallPicture theme={theme} phase={phase} onBook={onBook} />
      </g>
      {theme === 'witchy' && (
        <g transform={`translate(318 ${cy - 30}) scale(${scale})`}>
          {/* a sprig of dried lavender hanging from a nail */}
          <circle r="1.8" style={fv('ink')} />
          <path className="ink-thin" fill="none" d="M0,0 L0,8" />
          <path className="ink" fill="#c9a45c" d="M-4,8 L4,8 L3,12 L-3,12 Z" />
          {[-6, -2, 2, 6].map((dx, i) => (
            <g key={dx}>
              <path d={`M${dx * 0.4},12 L${dx},${44 + (i % 2) * 4}`} stroke="#7b8a5e" strokeWidth="1.2" />
              {[0, 1, 2, 3, 4].map((k) => (
                <ellipse key={k} cx={dx * (0.55 + k * 0.1)} cy={22 + k * 5 + (i % 2) * 3} rx="1.6" ry="2.4" fill="#9a86b8" />
              ))}
            </g>
          ))}
        </g>
      )}
    </g>
  );
}
