import { TILE_WIDTH, type WallpaperSize } from '../garden/decor';
import type { Theme } from '../theme/palettes';

/** Her wallpaper, ready to draw: the picture's address in memory and how it repeats. */
export type OwnPaper = { url: string; w: number; h: number; size: WallpaperSize; soft: boolean };

/** The pattern her wallpaper repeats in, used by the wall in place of the room's own motif. */
export function OwnWallpaper({ paper }: { paper: OwnPaper }) {
  const tw = TILE_WIDTH[paper.size];
  const th = (tw * paper.h) / paper.w;
  return (
    <defs>
      <pattern id="motif-own" width={tw} height={th.toFixed(2)} patternUnits="userSpaceOnUse">
        <image href={paper.url} width={tw} height={th.toFixed(2)} preserveAspectRatio="none" opacity={paper.soft ? 0.5 : 1} />
      </pattern>
    </defs>
  );
}

export const wallFill = (theme: Theme, paper: OwnPaper | null) => `url(#motif-${paper ? 'own' : theme})`;

/** The photo inside the frame: 3 wide by 4 tall. */
const PHOTO = { x: -18, y: -25, w: 36, h: 48 };

/** Until she adds a photo the frame holds a little painting: hills by day, or a moonlit hill in the witchy room. */
function Painting({ theme }: { theme: Theme }) {
  const { x, y, w, h } = PHOTO;
  if (theme === 'witchy') {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill="#2c2846" />
        <path d={`M${x},${y + h} L${x},${y + 32} C${x + 10},${y + 27} ${x + 22},${y + 33} ${x + w},${y + 29} L${x + w},${y + h} Z`} fill="#3f3a5e" />
        <path transform={`translate(${x + 25} ${y + 11}) scale(0.9)`} d="M0,-5 A5,5 0 1 0 0,5 A3.4,5 0 1 1 0,-5 Z" fill="#ece2c4" />
        <circle cx={x + 8} cy={y + 8} r="0.7" fill="#ece2c4" />
        <circle cx={x + 14} cy={y + 17} r="0.6" fill="#ece2c4" />
      </g>
    );
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#d9e6e6" />
      <circle cx={x + 25} cy={y + 12} r="4.5" fill="#f2cf78" />
      <path d={`M${x},${y + h} L${x},${y + 30} C${x + 10},${y + 25} ${x + 22},${y + 31} ${x + w},${y + 27} L${x + w},${y + h} Z`} fill="#a9c29a" />
      <path d={`M${x},${y + h} L${x},${y + 38} C${x + 14},${y + 34} ${x + 24},${y + 40} ${x + w},${y + 36} L${x + w},${y + h} Z`} fill="#8aa978" />
    </g>
  );
}

/**
 * The frame on the right-hand wall, opposite the pressed pansy. It shows her photo, filling the
 * frame and cut to its shape from the middle, or the little painting until she adds one.
 */
export function PhotoFrame({ theme, url, onTap }: { theme: Theme; url: string | null; onTap?: () => void }) {
  const { x, y, w, h } = PHOTO;
  const witchy = theme === 'witchy';
  return (
    <g transform="translate(332 652) rotate(2)" className={onTap ? 'tappable' : undefined} onClick={onTap}>
      <defs>
        <clipPath id="photo-clip">
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
      </defs>
      <path d="M-13,-34 L0,-46 L13,-34" className="ink-thin" fill="none" />
      <circle cx="0" cy="-46" r="1.6" style={{ fill: 'var(--ink)' }} />
      <rect className="ink" x="-25" y="-33" width="50" height="64" rx={witchy ? 1 : 3} fill={witchy ? '#1a141c' : '#c39a5a'} />
      <rect className="ink-thin" x="-21" y="-29" width="42" height="56" fill={witchy ? '#2a2130' : '#f5ecda'} />
      {url ? (
        <image href={url} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid slice" clipPath="url(#photo-clip)" />
      ) : (
        <Painting theme={theme} />
      )}
      <rect x={x} y={y} width={w} height={h} fill="none" className="ink-thin" />
      {/* a hint of glass */}
      <path d={`M${x + 4},${y + 20} L${x + 14},${y + 4} L${x + 17},${y + 4} L${x + 7},${y + 20} Z`} fill="#fff" opacity="0.14" />
      {witchy && (
        <g fill="#c9a45c">
          <circle cx="-22" cy="-30" r="1.6" />
          <circle cx="22" cy="-30" r="1.6" />
          <circle cx="-22" cy="28" r="1.6" />
          <circle cx="22" cy="28" r="1.6" />
        </g>
      )}
    </g>
  );
}

/**
 * One of her drawings standing on a shelf, fitted into the space a potted plant would take, with
 * its bottom edge on the board and a soft shadow under it.
 */
export function ShelfDrawing({ url, w, h, selected, moving }: { url: string | undefined; w: number; h: number; selected: boolean; moving: boolean }) {
  const s = Math.min(84 / w, 112 / h);
  const dw = w * s;
  const dh = h * s;
  return (
    <g className={moving ? 'moving' : undefined}>
      <ellipse cx="0" cy="0" rx={Math.min(34, dw * 0.42)} ry="4" fill="#000" opacity="0.12" />
      {url ? (
        <image href={url} x={-dw / 2} y={-dh} width={dw} height={dh} preserveAspectRatio="xMidYMax meet" />
      ) : (
        <rect x={-dw / 2} y={-dh} width={dw} height={dh} fill="none" className="ink-thin" strokeDasharray="3 4" />
      )}
      {selected && <rect x={-dw / 2 - 4} y={-dh - 4} width={dw + 8} height={dh + 8} rx="6" fill="none" className="ink-thin" strokeDasharray="4 4" />}
    </g>
  );
}
