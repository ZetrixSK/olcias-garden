import { createContext, useContext, useMemo } from 'react';
import { PANSY_PRESET_NAMES, type PansyPreset } from './garden/designs';
import { SPECIES, type SpeciesId, type Stage } from './garden/species';
import { MOOD_NAMES, MOOD_NAMES_PL, type Mood } from './garden/diary';

/**
 * The garden's languages: Polish, English, and (the first one, kept as it was) English with the
 * flowers called by their Polish names.
 */
export const LANGS = ['pl', 'en', 'mixed'] as const;
export type Lang = (typeof LANGS)[number];

export const parseLang = (v: unknown): Lang => (LANGS.includes(v as Lang) ? (v as Lang) : 'mixed');

/** Polish counts take one of three forms: 1 dzień, 2 dni, 5 dni; 1 roślina, 3 rośliny, 12 roślin. */
export function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  const tens = n % 100;
  const units = n % 10;
  return units >= 2 && units <= 4 && (tens < 12 || tens > 14) ? few : many;
}

const capital = (s: string) => s.charAt(0).toLocaleUpperCase('pl') + s.slice(1);

const STAGE_PL: Record<Stage, string> = { seed: 'Świeżo w ziemi', seedling: 'Kiełkuje', bud: 'Ma pąki', bloom: 'Kwitnie' };
const STAGE_EN: Record<Stage, string> = { seed: 'Just planted', seedling: 'Sprouting', bud: 'Budding', bloom: 'In bloom' };

const PRESETS_PL: Record<PansyPreset, string> = {
  mix: 'Mieszanka Olci',
  olcia: 'Róż i czerń',
  velvet: 'Aksamitna noc',
  rosy: 'Rumieniec',
  cream: 'Kremowy',
};

export type Words = ReturnType<typeof words>;

/** Everything that depends on the language, for code outside the page as well as inside it. */
export function words(lang: Lang) {
  const pl = lang === 'pl';
  return {
    lang,
    pl,
    /** The same words in English and in Polish; the language decides. */
    t: (en: string, polish: string) => (pl ? polish : en),
    /** For dates and month names. */
    locale: pl ? 'pl-PL' : 'en-GB',
    plural,
    /** A flower's name as written on its seed marker, in small letters. */
    marker: (s: SpeciesId) => (lang === 'en' ? SPECIES[s].name.toLowerCase() : SPECIES[s].polish),
    /** A flower's name as a title: "bratek" while the flowers are Polish in an English garden, as before. */
    flower: (s: SpeciesId) => (lang === 'en' ? SPECIES[s].name : pl ? capital(SPECIES[s].polish) : SPECIES[s].polish),
    /** In the mixed language, the English name written small under the Polish one. */
    flowerSub: (s: SpeciesId) => (lang === 'mixed' ? SPECIES[s].name : null),
    stage: (s: Stage) => (pl ? STAGE_PL : STAGE_EN)[s],
    preset: (p: PansyPreset) => (pl ? PRESETS_PL : PANSY_PRESET_NAMES)[p],
    mood: (m: Mood) => (pl ? MOOD_NAMES_PL : MOOD_NAMES)[m],
    /** A date as words, with a capital letter: "Monday 19 October", "Poniedziałek, 19 października". */
    date: (d: Date, opts: Intl.DateTimeFormatOptions) => capital(d.toLocaleDateString(pl ? 'pl-PL' : 'en-GB', opts)),
  };
}

const LangContext = createContext<Lang>('mixed');
export const LangProvider = LangContext.Provider;

/** The garden's words in her chosen language. */
export function useWords(): Words {
  const lang = useContext(LangContext);
  return useMemo(() => words(lang), [lang]);
}
