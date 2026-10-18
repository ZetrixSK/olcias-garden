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
