/**
 * What changed in each version of the garden, newest first, as she reads it in "What's new".
 * Written for her, not for a developer: a few short, warm lines, and no spoilers.
 *
 * Adding a version: put it at the top here, set the same number in package.json, and add the
 * developer's notes to CHANGELOG.md. A line in Polish can be a pair [to her, to him].
 */
export type ChangelogEntry = {
  version: string;
  /** The day it came out, as YYYY-MM-DD. */
  date: string;
  en: string[];
  pl: Array<string | [string, string]>;
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.0.0',
    date: '2026-11-03',
    en: ["The garden's first version. Everything else is yours to discover."],
    pl: [['Pierwsza wersja ogrodu. Wszystko inne odkryj sama.', 'Pierwsza wersja ogrodu. Wszystko inne odkryj sam.']],
  },
];

export const LATEST = CHANGELOG[0]!.version;
