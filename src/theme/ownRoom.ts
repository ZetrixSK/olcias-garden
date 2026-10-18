import { mix } from '../plants/looks';
import type { Theme } from './palettes';

/**
 * Her own room: the furniture and decorations of one of the two rooms (cozy or witchy), in colours
 * she picks. Shades and highlights are worked out from each colour, so one swatch per part is enough.
 */
export type OwnRoom = {
  base: Theme;
  wall: string;
  motif: string;
  curtain: string;
  frame: string;
  floor: string;
  bed: string;
};

export const ROOM_PARTS = ['wall', 'motif', 'curtain', 'frame', 'floor', 'bed'] as const;
export type RoomPart = (typeof ROOM_PARTS)[number];

/** Soft wall and fabric colours, from pale to deep, so a light or a dark room both work. */
export const ROOM_SWATCHES = [
  '#f4ece0', '#efdcd2', '#f2d4dc', '#e7d6ec', '#d8e3ec', '#dfe7d5', '#f1e2b8', '#e6c9a8',
  '#d99aaa', '#b98e86', '#a7b598', '#8fa7b8', '#9a86b8', '#c9a45c', '#b5476a', '#6e9692',
  '#5d4a6b', '#4e3954', '#3b4a5c', '#3d4a3c', '#5a3b3f', '#2f2434', '#262a35', '#1f1a1d',
] as const;

/** Floorboards: pale ash to almost-black oak. */
export const FLOOR_SWATCHES = ['#d8b98f', '#c49a6c', '#b98a5f', '#9a6c48', '#7a5038', '#55403b', '#4a3a3e', '#2e2526'] as const;

export const ROOM_SWATCH_NAMES: Record<string, string> = {
  '#f4ece0': 'Linen', '#efdcd2': 'Shell', '#f2d4dc': 'Petal', '#e7d6ec': 'Lavender mist', '#d8e3ec': 'Morning blue',
  '#dfe7d5': 'Pistachio', '#f1e2b8': 'Honey', '#e6c9a8': 'Biscuit', '#d99aaa': 'Old rose', '#b98e86': 'Clay pink',
  '#a7b598': 'Sage', '#8fa7b8': 'Rain blue', '#9a86b8': 'Heather', '#c9a45c': 'Gold', '#b5476a': 'Raspberry',
  '#6e9692': 'Teal', '#5d4a6b': 'Dusk', '#4e3954': 'Plum', '#3b4a5c': 'Slate', '#3d4a3c': 'Forest',
  '#5a3b3f': 'Mulberry', '#2f2434': 'Night plum', '#262a35': 'Ink blue', '#1f1a1d': 'Black',
  '#d8b98f': 'Ash', '#c49a6c': 'Pine', '#b98a5f': 'Oak', '#9a6c48': 'Walnut', '#7a5038': 'Chestnut',
  '#55403b': 'Smoked oak', '#4a3a3e': 'Ebony brown', '#2e2526': 'Charred',
};

/** Where she starts: the colours of the room she picked as a base, so the first look is familiar. */
export function startingRoom(base: Theme): OwnRoom {
  return base === 'witchy'
    ? { base, wall: '#4e3954', motif: '#c9a45c', curtain: '#2f2434', frame: '#2f2434', floor: '#55403b', bed: '#2f2434' }
    : { base, wall: '#f4ece0', motif: '#b98e86', curtain: '#d99aaa', frame: '#a7b598', floor: '#b98a5f', bed: '#d99aaa' };
}

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** A dark wall gets the light-on-dark menus, like the witchy room. */
export const isDarkRoom = (room: OwnRoom) => lum(room.wall) < 0.35;

const darker = (c: string, k: number) => mix(c, '#1a1218', k);
const lighter = (c: string, k: number) => mix(c, '#ffffff', k);

/** The room's colour variables, worked out from her choices. */
export function ownRoomVars(room: OwnRoom): Record<string, string> {
  const dark = isDarkRoom(room);
  const v: Record<string, string> = {
    wall: room.wall,
    'wall-shade': darker(room.wall, 0.12),
    'wall-motif': room.motif,
    curtain: room.curtain,
    'curtain-shade': darker(room.curtain, 0.3),
    'curtain-hi': lighter(room.curtain, 0.28),
    frame: room.frame,
    'frame-shade': darker(room.frame, 0.3),
    'frame-hi': lighter(room.frame, 0.3),
    floor: room.floor,
    'floor-shade': darker(room.floor, 0.18),
    'floor-line': darker(room.floor, 0.4),
    skirting: dark ? darker(room.wall, 0.3) : lighter(room.wall, 0.5),
    'skirting-shade': dark ? darker(room.wall, 0.45) : darker(room.wall, 0.08),
    bed: room.bed,
    'bed-shade': darker(room.bed, 0.22),
    'bed-hi': lighter(room.bed, 0.22),
  };
  const out: Record<string, string> = {};
  for (const [k, c] of Object.entries(v)) out[`--${k}`] = c;
  return out;
}

const HEX = /^#[0-9a-f]{6}$/i;

export function parseOwnRoom(v: unknown): OwnRoom | null {
  if (typeof v !== 'object' || v === null) return null;
  const o = v as Record<string, unknown>;
  const base: Theme = o.base === 'witchy' ? 'witchy' : 'cozy';
  const start = startingRoom(base);
  const pick = (k: RoomPart) => (typeof o[k] === 'string' && HEX.test(o[k] as string) ? (o[k] as string) : start[k]);
  return { base, wall: pick('wall'), motif: pick('motif'), curtain: pick('curtain'), frame: pick('frame'), floor: pick('floor'), bed: pick('bed') };
}
