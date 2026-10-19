/** Her diary: at most one entry a day, each with an optional mood and whatever she wrote. */

export const MOODS = [
  'happy', 'joy', 'love', 'calm', 'proud', 'excited', 'silly', 'grateful',
  'sleepy', 'tired', 'meh', 'sad', 'teary', 'angry', 'anxious', 'unwell',
] as const;
export type Mood = (typeof MOODS)[number];

export const MOOD_NAMES: Record<Mood, string> = {
  happy: 'Happy', joy: 'Over the moon', love: 'In love', calm: 'Calm', proud: 'Proud', excited: 'Excited',
  silly: 'Silly', grateful: 'Grateful', sleepy: 'Sleepy', tired: 'Tired', meh: 'Meh', sad: 'Sad',
  teary: 'Teary', angry: 'Angry', anxious: 'Anxious', unwell: 'Unwell',
};

export type DiaryEntry = { mood: Mood | null; text: string; savedAt: number };
/** Keyed by the local date, `YYYY-MM-DD`. */
export type Diary = Record<string, DiaryEntry>;

export const MAX_ENTRY = 5000;

const pad = (n: number) => String(n).padStart(2, '0');

/** The diary's key for a day in local time. */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function dateOfKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d);
}

/** Keeps an entry; an entry with no mood and nothing written is the same as none. */
export function withEntry(diary: Diary, key: string, mood: Mood | null, text: string, now: number): Diary {
  const clean = text.slice(0, MAX_ENTRY);
  if (!mood && !clean.trim()) return withoutEntry(diary, key);
  return { ...diary, [key]: { mood, text: clean, savedAt: now } };
}

export function withoutEntry(diary: Diary, key: string): Diary {
  if (!(key in diary)) return diary;
  const { [key]: _, ...rest } = diary;
  return rest;
}

const KEY = /^\d{4}-\d{2}-\d{2}$/;

/** Reads the diary defensively: a damaged day is dropped, every other day is kept. */
export function parseDiary(v: unknown): Diary {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return {};
  const out: Diary = {};
  for (const [key, raw] of Object.entries(v as Record<string, unknown>)) {
    if (!KEY.test(key) || typeof raw !== 'object' || raw === null) continue;
    const e = raw as Record<string, unknown>;
    const mood = MOODS.includes(e.mood as Mood) ? (e.mood as Mood) : null;
    const text = typeof e.text === 'string' ? e.text.slice(0, MAX_ENTRY) : '';
    if (!mood && !text.trim()) continue;
    out[key] = { mood, text, savedAt: typeof e.savedAt === 'number' && Number.isFinite(e.savedAt) ? e.savedAt : 0 };
  }
  return out;
}

export type Memory = { key: string; yearsAgo: number; entry: DiaryEntry };

/** Pages she wrote on this same day in earlier years, the most recent first. */
export function onThisDay(diary: Diary, today: string): Memory[] {
  const year = Number(today.slice(0, 4));
  const day = today.slice(4);
  return Object.keys(diary)
    .filter((k) => k.slice(4) === day && Number(k.slice(0, 4)) < year)
    .sort()
    .reverse()
    .map((key) => ({ key, yearsAgo: year - Number(key.slice(0, 4)), entry: diary[key]! }));
}

/** The weeks of a month for the calendar, Monday first; days outside the month are null. */
export function monthGrid(year: number, month: number): Array<Array<Date | null>> {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(year, month, i + 1))];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}
