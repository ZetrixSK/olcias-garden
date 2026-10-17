export type SkyKind = 'clear' | 'cloudy' | 'rain';
/** What the window shows: the sky's condition, by day or by night. */
export type Weather = { sky: SkyKind; night: boolean };

export const SKY_KINDS: SkyKind[] = ['clear', 'cloudy', 'rain'];

type SkyKey = 'sunny' | 'cloudy' | 'rain' | 'night' | 'night-cloudy' | 'night-rain';
function skyKey(w: Weather): SkyKey {
  if (w.night) return w.sky === 'clear' ? 'night' : w.sky === 'cloudy' ? 'night-cloudy' : 'night-rain';
  return w.sky === 'clear' ? 'sunny' : w.sky;
}
export type Theme = 'cozy' | 'witchy';

type Palette = Record<string, string>;

/** Room colours. Everything indoors reads from these, so a theme swap is a palette swap plus a few decor pieces. */
export const roomPalettes: Record<Theme, Palette> = {
  cozy: {
    ink: '#3d2633',
    wall: '#ecdfc9',
    'wall-shade': '#dcc9ad',
    'wall-motif': '#b98e86',
    frame: '#a7b598',
    'frame-shade': '#86977a',
    'frame-hi': '#c7d2b9',
    curtain: '#dda0a6',
    'curtain-shade': '#c27f88',
    'curtain-hi': '#efc0c2',
    'curtain-lining': '#f3e6d6',
    tie: '#a94c63',
    sill: '#c88e5d',
    'sill-shade': '#a26d41',
    'sill-hi': '#e2ae7f',
    shelf: '#b98352',
    'shelf-shade': '#93633b',
    rope: '#cdb68f',
    floor: '#b98a5f',
    'floor-shade': '#9d6f47',
    'floor-line': '#86593a',
    skirting: '#f2e9da',
    'skirting-shade': '#d9cbb5',
    bed: '#c46d7d',
    'bed-shade': '#a45264',
    'bed-hi': '#dc8f9c',
    'bed-inner': '#f1e0d0',
    'bed-inner-shade': '#dfc5b0',
    'sign-bg': '#f7eedf',
    'sign-shade': '#e4d5bd',
    'sign-ink': '#8a3550',
  },
  witchy: {
    ink: '#1c1219',
    wall: '#3e2c40',
    'wall-shade': '#2f2132',
    'wall-motif': '#b4955f',
    frame: '#2a2029',
    'frame-shade': '#1a1219',
    'frame-hi': '#4a3b48',
    curtain: '#231b26',
    'curtain-shade': '#140f16',
    'curtain-hi': '#3d3142',
    'curtain-lining': '#d88aa6',
    tie: '#c9a45c',
    sill: '#4b3641',
    'sill-shade': '#33242c',
    'sill-hi': '#6a4f5c',
    shelf: '#3d2c33',
    'shelf-shade': '#281c21',
    rope: '#8f7a62',
    floor: '#45322f',
    'floor-shade': '#332422',
    'floor-line': '#231817',
    skirting: '#271c28',
    'skirting-shade': '#1a121b',
    bed: '#2b202d',
    'bed-shade': '#1b141d',
    'bed-hi': '#43354a',
    'bed-inner': '#d88aa6',
    'bed-inner-shade': '#b86b8a',
    'sign-bg': '#2c2b30',
    'sign-shade': '#1f1e22',
    'sign-ink': '#efe6ee',
  },
};

/** Sky and distant landscape colours, seen through the window. */
const skyPalettes: Record<SkyKey, Palette> = {
  sunny: {
    'sky-top': '#86b6d6',
    'sky-mid': '#b9d5e0',
    'sky-low': '#f4e3c4',
    'hill-far': '#a7c0b6',
    'hill-near': '#8cab8a',
    tree: '#6c9273',
    'tree-shade': '#57795e',
    roof: '#b9705a',
    house: '#efe2cc',
    cloud: '#fdf9f1',
    'cloud-shade': '#ddd6e6',
    'cloud-deep': '#c5bfd6',
  },
  cloudy: {
    'sky-top': '#a3abb8',
    'sky-mid': '#c3c6cc',
    'sky-low': '#e0dbd3',
    'hill-far': '#aab3ad',
    'hill-near': '#90a094',
    tree: '#75877b',
    'tree-shade': '#637468',
    roof: '#9c7566',
    house: '#d8d0c4',
    cloud: '#eceaea',
    'cloud-shade': '#cdcbd3',
    'cloud-deep': '#b3b2bf',
  },
  rain: {
    'sky-top': '#66717f',
    'sky-mid': '#86909b',
    'sky-low': '#acb2b6',
    'hill-far': '#8a9595',
    'hill-near': '#71817b',
    tree: '#5c6e67',
    'tree-shade': '#4d5e58',
    roof: '#75605b',
    house: '#aca59d',
    cloud: '#9aa2ac',
    'cloud-shade': '#7f8792',
    'cloud-deep': '#69707c',
  },
  night: {
    'sky-top': '#1d2148',
    'sky-mid': '#353766',
    'sky-low': '#5b4a7a',
    'hill-far': '#33365e',
    'hill-near': '#272a4c',
    tree: '#1f2243',
    'tree-shade': '#191b38',
    roof: '#2f2948',
    house: '#3b3658',
    cloud: '#45476f',
    'cloud-shade': '#363859',
    'cloud-deep': '#2b2c4a',
  },
  'night-cloudy': {
    'sky-top': '#2a2e52',
    'sky-mid': '#3d3f66',
    'sky-low': '#55507a',
    'hill-far': '#353a5e',
    'hill-near': '#2a2e4e',
    tree: '#222645',
    'tree-shade': '#1b1e3a',
    roof: '#302a48',
    house: '#3d3a5a',
    cloud: '#5a5c84',
    'cloud-shade': '#4a4c72',
    'cloud-deep': '#3c3e60',
  },
  'night-rain': {
    'sky-top': '#262b44',
    'sky-mid': '#353b56',
    'sky-low': '#484d66',
    'hill-far': '#343b52',
    'hill-near': '#2a3044',
    tree: '#22283b',
    'tree-shade': '#1c2132',
    roof: '#2e2a3e',
    house: '#3a3a50',
    cloud: '#4c5270',
    'cloud-shade': '#40465f',
    'cloud-deep': '#343a50',
  },
};

/** How the indoor light shifts with the weather: a multiply tint over the whole scene. */
export function roomTint(w: Weather, theme: Theme = 'witchy'): { color: string; opacity: number } | null {
  // the cozy room's pale walls need a deeper, warmer dusk than the already-dark witchy room
  if (w.night && theme === 'cozy') return w.sky === 'rain' ? { color: '#262447', opacity: 0.8 } : { color: '#2b2350', opacity: 0.78 };
  if (w.night) return w.sky === 'rain' ? { color: '#1f2444', opacity: 0.68 } : { color: '#24224f', opacity: 0.64 };
  if (w.sky === 'cloudy') return { color: '#77748a', opacity: 0.16 };
  if (w.sky === 'rain') return { color: '#4a5572', opacity: 0.3 };
  return null;
}

/** Candles are lit whenever the room is dim. */
export const candleLit = (w: Weather) => w.night || w.sky === 'rain';

export function paletteVars(theme: Theme, weather: Weather): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [k, v] of Object.entries({ ...roomPalettes[theme], ...skyPalettes[skyKey(weather)] })) {
    vars[`--${k}`] = v;
  }
  return vars;
}
