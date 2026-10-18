import type { GardenPot } from './species';

/**
 * Things she designs herself: her own bratek varieties and painted pots. Colours come from curated
 * swatches so whatever she makes still belongs to the same illustrated world.
 */

export const PANSY_SWATCHES = [
  '#241326', '#4a2350', '#7c2141', '#6b3fa0', '#4f6fb5', '#a9c4ec', '#b9a3e3', '#d0567a',
  '#eaa2bb', '#f6c9b4', '#e9806e', '#e8a93a', '#f3d36b', '#f2e7d0', '#f6f1ea', '#2f4a3a',
] as const;

export const POT_SWATCHES = [
  '#2b2229', '#4a2f4a', '#7c2141', '#c95d7f', '#e79ab4', '#f2c4cf', '#f2eadc', '#fbf7f0',
  '#c4704e', '#d9a441', '#a7b598', '#6e9692', '#2f3a5c', '#b9a3e3', '#a9c4ec', '#c9a45c',
] as const;

/** How the lower petals are marked: a dark blotch, fine whiskers, or a clear face. */
export const PANSY_FACES = ['blotch', 'whiskers', 'clear'] as const;
export type PansyFace = (typeof PANSY_FACES)[number];

export type PansyDesign = {
  id: string;
  name: string;
  top: string;
  low: string;
  face: PansyFace;
  faceColor: string;
  /** A thin coloured edge around every petal, or none. */
  edge: string | null;
};

export const POT_PATTERNS = ['none', 'scallops', 'dots', 'stripes', 'bands', 'hearts', 'moons', 'checks', 'zigzag', 'flowers'] as const;
export type PotPattern = (typeof POT_PATTERNS)[number];

export const POT_SHAPES = ['wide', 'slim', 'round', 'cauldron', 'teacup'] as const satisfies readonly GardenPot[];

export type PotDesign = {
  id: string;
  shape: GardenPot;
  body: string;
  pattern: PotPattern;
  patternColor: string;
  rim: string;
};

export type Designs = { pansies: PansyDesign[]; pots: PotDesign[] };

export const NO_DESIGNS: Designs = { pansies: [], pots: [] };

/** Designs are referred to from plants as `d:<id>`, so they can never clash with built-in names. */
export const designRef = (id: string): `d:${string}` => `d:${id}`;
export const designId = (ref: string | undefined) => (ref?.startsWith('d:') ? ref.slice(2) : null);

/** Built-in bratek varieties; 'mix' is the original bed of four. */
export const PANSY_PRESETS = ['mix', 'velvet', 'olcia', 'rosy', 'cream'] as const;
export type PansyPreset = (typeof PANSY_PRESETS)[number];
export const PANSY_PRESET_NAMES: Record<PansyPreset, string> = {
  mix: "Olcia's mix",
  olcia: 'Pink & black',
  velvet: 'Velvet night',
  rosy: 'Blush',
  cream: 'Cream',
};

export const MAX_DESIGNS = 24;

const HEX = /^#[0-9a-f]{6}$/i;
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const color = (v: unknown, fallback: string) => (typeof v === 'string' && HEX.test(v) ? v : fallback);

export function parsePansy(v: unknown): PansyDesign | null {
  if (!isObj(v) || typeof v.id !== 'string' || !v.id) return null;
  return {
    id: v.id,
    name: typeof v.name === 'string' ? v.name.slice(0, 32) : '',
    top: color(v.top, '#241326'),
    low: color(v.low, '#eaa2bb'),
    face: PANSY_FACES.includes(v.face as PansyFace) ? (v.face as PansyFace) : 'blotch',
    faceColor: color(v.faceColor, '#241326'),
    edge: typeof v.edge === 'string' && HEX.test(v.edge) ? v.edge : null,
  };
}

function parsePot(v: unknown): PotDesign | null {
  if (!isObj(v) || typeof v.id !== 'string' || !v.id) return null;
  return {
    id: v.id,
    shape: (POT_SHAPES as readonly string[]).includes(v.shape as string) ? (v.shape as GardenPot) : 'wide',
    body: color(v.body, '#2b2229'),
    pattern: POT_PATTERNS.includes(v.pattern as PotPattern) ? (v.pattern as PotPattern) : 'none',
    patternColor: color(v.patternColor, '#e79ab4'),
    rim: color(v.rim, '#2b2229'),
  };
}

/** Reads saved designs, keeping every one that still makes sense. */
export function parseDesigns(v: unknown): Designs {
  const d = isObj(v) ? v : {};
  const list = <T,>(raw: unknown, parse: (x: unknown) => T | null) =>
    (Array.isArray(raw) ? raw : []).map(parse).filter((x): x is T => x !== null).slice(0, MAX_DESIGNS);
  return { pansies: list(d.pansies, parsePansy), pots: list(d.pots, parsePot) };
}

export function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  const i = list.findIndex((x) => x.id === item.id);
  if (i < 0) return [...list, item].slice(-MAX_DESIGNS);
  return list.map((x) => (x.id === item.id ? item : x));
}

/** A plant's pot: one of the built-in pots, or one she painted. */
export type PotRef = GardenPot | `d:${string}`;

/** The shape a pot has, whichever kind it is; a missing design falls back to `fallback`. */
export function potShape(ref: PotRef, designs: Designs, fallback: GardenPot): GardenPot {
  const id = designId(ref);
  if (id === null) return ref as GardenPot;
  return designs.pots.find((p) => p.id === id)?.shape ?? fallback;
}

/** Names for the swatches, read out by screen readers instead of colour codes. */
export const SWATCH_NAMES: Record<string, string> = {
  '#241326': 'Ink black', '#4a2350': 'Plum', '#7c2141': 'Wine', '#6b3fa0': 'Violet', '#4f6fb5': 'Cornflower',
  '#a9c4ec': 'Sky', '#b9a3e3': 'Lilac', '#d0567a': 'Raspberry', '#eaa2bb': 'Pink', '#f6c9b4': 'Peach',
  '#e9806e': 'Coral', '#e8a93a': 'Marigold', '#f3d36b': 'Butter', '#f2e7d0': 'Cream', '#f6f1ea': 'White',
  '#2f4a3a': 'Fir', '#2b2229': 'Black', '#4a2f4a': 'Aubergine', '#c95d7f': 'Rose', '#e79ab4': 'Candy pink',
  '#f2c4cf': 'Blush', '#f2eadc': 'Ivory', '#fbf7f0': 'Porcelain', '#c4704e': 'Terracotta', '#d9a441': 'Mustard',
  '#a7b598': 'Sage', '#6e9692': 'Teal', '#2f3a5c': 'Navy', '#c9a45c': 'Gold',
};
