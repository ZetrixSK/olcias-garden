import { moonPhase } from '../weather/moon';
import { hash, rng } from './vines';
import { dayKey } from './diary';

/**
 * Now and then a plant changes overnight and keeps something of the day it lived through: a full
 * moon leaves it enchanted, rain leaves dew on it, a sunny day a golden glow, a winter night frost,
 * a grey breezy day a willow's sway. Rare, never asked for, never lost; at most one per plant.
 */
export const TRAITS = ['enchanted', 'dewy', 'sunkissed', 'frosted', 'willowy'] as const;
export type TraitKind = (typeof TRAITS)[number];
export type Trait = { kind: TraitKind; at: number };

/** How much faster a plant grows once it has the trait (1 is no change). */
export const TRAIT_SPEED: Record<TraitKind, number> = { enchanted: 1, dewy: 1.15, sunkissed: 1.35, frosted: 1, willowy: 1 };

/** The chance, each night, that a plant takes on a trait the day called for, and the small chance of one anyway. */
export const LIKELY = 0.035;
export const NOW_AND_THEN = 0.004;

/** What the garden saw on a day while it was open: bits for rain, a clear day, a grey day. */
export const SAW = { rain: 1, clear: 2, grey: 4 } as const;
export type WeatherSeen = Record<string, number>;
/** Days remembered; older ones are forgotten. */
const REMEMBER_DAYS = 14;

export function parseTrait(v: unknown): Trait | null {
  if (typeof v !== 'object' || v === null) return null;
  const { kind, at } = v as Record<string, unknown>;
  if (!TRAITS.includes(kind as TraitKind) || typeof at !== 'number' || !Number.isFinite(at) || at <= 0) return null;
  return { kind: kind as TraitKind, at };
}

export function parseWeatherSeen(v: unknown): WeatherSeen {
  if (typeof v !== 'object' || v === null) return {};
  const out: WeatherSeen = {};
  for (const [k, bits] of Object.entries(v as Record<string, unknown>)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(k) && typeof bits === 'number' && bits > 0 && bits < 8) out[k] = bits;
  }
  return out;
}

/** Notes what the sky is doing today (rain, a clear day, a grey day); the same if it was already noted. */
export function noteWeather(seen: WeatherSeen, now: number, w: { sky: 'clear' | 'cloudy' | 'rain'; night: boolean }): WeatherSeen {
  const bit = w.sky === 'rain' ? SAW.rain : w.night ? 0 : w.sky === 'clear' ? SAW.clear : SAW.grey;
  if (!bit) return seen;
  const key = dayKey(new Date(now));
  if (((seen[key] ?? 0) & bit) === bit) return seen;
  const keep = Object.keys(seen)
    .sort()
    .slice(-(REMEMBER_DAYS - 1));
  const out: WeatherSeen = {};
  for (const k of keep) out[k] = seen[k]!;
  out[key] = (out[key] ?? 0) | bit;
  return out;
}

/** The day a 3:00 night check looks back on: the evening before it. */
const dayBefore = (night: number) => dayKey(new Date(night - 6 * 3_600_000));
const isWinter = (night: number) => [11, 0, 1].includes(new Date(night - 6 * 3_600_000).getMonth());
const isFullMoon = (night: number) => Math.abs(moonPhase(night) - 0.5) < 0.035;

/** What a night could leave on a plant, given the day before it. */
export function calledFor(night: number, seen: WeatherSeen): TraitKind[] {
  const bits = seen[dayBefore(night)] ?? 0;
  const out: TraitKind[] = [];
  if (isFullMoon(night)) out.push('enchanted');
  if (bits & SAW.rain) out.push('dewy');
  if (bits & SAW.clear) out.push('sunkissed');
  if (isWinter(night)) out.push('frosted');
  if (bits & SAW.grey) out.push('willowy');
  return out;
}

type Traited = { id: string; trait: Trait | null };

/**
 * Rolls the nights since the last check, oldest first. The same night always rolls the same dice
 * for the same plant. `grown` says whether a plant had sprouted by then (seeds aren't touched).
 */
export function rollTraits<P extends Traited>(plants: P[], nights: number[], seen: WeatherSeen, grown: (p: P, at: number) => boolean): P[] {
  let out = plants;
  for (const night of nights) {
    const called = calledFor(night, seen);
    out = out.map((p) => {
      if (p.trait || !grown(p, night)) return p;
      const dice = rng(hash(`trait:${night}:${p.id}`));
      for (const kind of called) if (dice() < LIKELY) return { ...p, trait: { kind, at: night } };
      // now and then, something anyway (enchantment only ever comes with a full moon)
      if (dice() < NOW_AND_THEN) {
        const others = TRAITS.filter((k) => k !== 'enchanted' && (k !== 'frosted' || isWinter(night)));
        return { ...p, trait: { kind: others[Math.floor(dice() * others.length)]!, at: night } };
      }
      return p;
    });
  }
  return out;
}
