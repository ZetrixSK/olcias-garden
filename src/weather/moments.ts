import { hash } from '../garden/vines';
import type { Season } from '../theme/seasons';

/**
 * The rare and the occasional: which nights have northern lights, which mornings have fog, and
 * which visitors come to the lake today. Each is decided by the date alone, so it stays the same
 * all day (or all night) however often the garden is opened, and differs from one day to the next.
 */

/** The date as a key; a night after midnight still belongs to the evening before. */
function dayKey(t: number, nightOwnsMorning = false): string {
  const d = new Date(t);
  if (nightOwnsMorning && d.getHours() < 12) d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

const roll = (key: string) => (hash(key) % 1000) / 1000;

/** Northern lights: very rare, a little less rare in the long dark nights of autumn and winter. */
export function auroraTonight(t: number, season: Season): boolean {
  const chance = season === 'winter' || season === 'autumn' ? 0.08 : 0.03;
  return roll(`${dayKey(t, true)}/aurora`) < chance;
}

/** Mist lying on the lake: some autumn mornings, until mid-morning. */
export function fogThisMorning(t: number, season: Season): boolean {
  const h = new Date(t).getHours();
  return season === 'autumn' && h >= 5 && h < 11 && roll(`${dayKey(t)}/fog`) < 0.5;
}

/**
 * ?moments=all shows every rare thing at once (northern lights, fog, all the visitors, a rainbow),
 * so they can be seen without waiting for them. Only the look changes.
 */
export const previewAllMoments = () => typeof location !== 'undefined' && new URLSearchParams(location.search).get('moments') === 'all';

/** Everything that might be out there right now. */
export type Outside = { visitors: Visitors; fog: boolean; aurora: boolean; rainbow: boolean };

/** Moments that can be sent from the admin page, to show for a while whatever the day would bring. */
export const MOMENTS = ['rainbow', 'aurora', 'fog', 'shooting-stars', 'ducks', 'heron', 'deer', 'robin', 'skater', 'butterflies'] as const;
export type Moment = (typeof MOMENTS)[number];

/**
 * Whether a moment can be seen in her window right now, and if not, why not: northern lights and
 * shooting stars need a clear night, a rainbow a dry day; the visitors keep to their seasons and
 * nobody visits the lake at night.
 */
export function momentBlocked(m: Moment, season: Season, night: boolean, sky: 'clear' | 'cloudy' | 'rain'): string | null {
  const winter = season === 'winter';
  switch (m) {
    case 'aurora':
    case 'shooting-stars':
      return night && sky === 'clear' ? null : 'That only shows on a clear night, and her sky is not one right now.';
    case 'rainbow':
      return !night && sky !== 'rain' ? null : 'A rainbow needs daylight and no rain falling.';
    case 'fog':
      return night ? 'Fog is only drawn by day.' : null;
    case 'robin':
    case 'skater':
      if (!winter) return 'Only in winter, when the lake is frozen.';
      return night ? 'Nobody visits the lake at night.' : null;
    case 'ducks':
    case 'heron':
    case 'butterflies':
      if (winter) return 'Not in winter.';
      return night ? 'Nobody visits the lake at night.' : null;
    case 'deer':
      return night ? 'Nobody visits the lake at night.' : null;
  }
}

/** What's outside, with the moments sent from the admin page added in (those that can be seen now). */
export function withMoments(o: Outside, moments: readonly Moment[], season: Season, night: boolean, sky: 'clear' | 'cloudy' | 'rain'): Outside {
  const on = moments.filter((m) => momentBlocked(m, season, night, sky) === null);
  if (on.length === 0) return o;
  const has = (m: Moment) => on.includes(m);
  const v = o.visitors;
  return {
    visitors: {
      ducks: v.ducks || has('ducks'), heron: v.heron || has('heron'), deer: v.deer || has('deer'),
      robin: v.robin || has('robin'), skater: v.skater || has('skater'), butterflies: v.butterflies || has('butterflies'),
    },
    fog: o.fog || has('fog'),
    aurora: o.aurora || has('aurora'),
    rainbow: o.rainbow || has('rainbow'),
  };
}

export function outsideNow(t: number, season: Season, night: boolean, sky: 'clear' | 'cloudy' | 'rain', rainbow: boolean): Outside {
  if (previewAllMoments()) {
    const winter = season === 'winter';
    return {
      visitors: { ducks: !winter && !night, heron: !winter && !night, deer: !night, robin: winter && !night, skater: winter && !night, butterflies: !winter && !night },
      fog: !night && !winter,
      aurora: true,
      rainbow: true,
    };
  }
  return {
    visitors: visitorsToday(t, season, night, sky === 'clear'),
    fog: !night && sky !== 'rain' && fogThisMorning(t, season),
    aurora: auroraTonight(t, season),
    rainbow,
  };
}

/** A key that changes only when what's outside could change, for keeping drawings from redrawing every minute. */
export function outsideKey(t: number, season: Season, night: boolean, sky: string, rainbow: boolean): string {
  const d = new Date(t);
  const morning = d.getHours() >= 5 && d.getHours() < 11;
  return `${d.toDateString()}|${d.getHours() < 12}|${morning}|${season}|${night}|${sky}|${rainbow}`;
}

export type Visitors = { ducks: boolean; heron: boolean; deer: boolean; robin: boolean; skater: boolean; butterflies: boolean };

/** Who is out by the lake today. Nobody visits at night. */
export function visitorsToday(t: number, season: Season, night: boolean, sunny: boolean): Visitors {
  const key = dayKey(t);
  const warm = season === 'spring' || season === 'summer';
  if (night) return { ducks: false, heron: false, deer: false, robin: false, skater: false, butterflies: false };
  return {
    ducks: warm || (season === 'autumn' && roll(`${key}/ducks`) < 0.5),
    heron: season !== 'winter' && roll(`${key}/heron`) < 0.4,
    deer: roll(`${key}/deer`) < 0.35,
    robin: season === 'winter',
    skater: season === 'winter' && roll(`${key}/skater`) < 0.6,
    butterflies: warm && sunny,
  };
}
