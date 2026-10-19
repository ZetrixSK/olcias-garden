/** Her own candle on the sill: its shape and wax, and whether she lit it or blew it out. */

export const CANDLE_SHAPES = ['jar', 'pillar', 'taper'] as const;
export type CandleShape = (typeof CANDLE_SHAPES)[number];

export const CANDLE_SHAPE_NAMES: Record<CandleShape, string> = { jar: 'In a jar', pillar: 'Pillar', taper: 'Tall taper' };

export const WAX_COLORS = ['#e7a7b6', '#2a1f2e', '#efe6d4', '#bfa6d8', '#a9bf9a', '#a8324a', '#e4b55e'] as const;
export const WAX_NAMES: Record<string, string> = {
  '#e7a7b6': 'Rose',
  '#2a1f2e': 'Black',
  '#efe6d4': 'Ivory',
  '#bfa6d8': 'Lavender',
  '#a9bf9a': 'Sage',
  '#a8324a': 'Red',
  '#e4b55e': 'Honey',
};

export type CandleLook = { shape: CandleShape; wax: string };

/** Lit by her, blown out by her, or (null) lit by itself whenever the room is dim. */
export type CandleLit = boolean | null;

export function parseCandle(v: unknown): CandleLook | null {
  if (typeof v !== 'object' || v === null) return null;
  const { shape, wax } = v as Record<string, unknown>;
  if (!CANDLE_SHAPES.includes(shape as CandleShape) || !WAX_COLORS.includes(wax as (typeof WAX_COLORS)[number])) return null;
  return { shape: shape as CandleShape, wax: wax as string };
}

export const parseCandleLit = (v: unknown): CandleLit => (typeof v === 'boolean' ? v : null);

/** Whether the flame is burning: her choice if she made one, otherwise whenever the room is dim. */
export const flameOn = (lit: CandleLit, dim: boolean) => lit ?? dim;

/** A colour darker (amount > 0) or lighter (amount < 0), for the wax's shading. */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const to = amount > 0 ? 0 : 255;
  const a = Math.abs(amount);
  const ch = (s: number) => Math.round(((n >> s) & 255) * (1 - a) + to * a);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
}
