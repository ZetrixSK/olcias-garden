/**
 * What the papers keep in her garden: a short diary of what happened (who came to the door, what
 * she bought, what came in the post) for "Yesterday in your garden", the notes he wrote for her
 * papers, and the last day she opened them. Everything else in the papers is worked out from the
 * date, so it never needs saving.
 */

export type PaperEvent =
  | { at: number; kind: 'visit'; who: string; petals: number }
  | { at: number; kind: 'away'; who: string }
  | { at: number; kind: 'buy'; what: 'species' | 'pansy' | 'ribbon' | 'vase'; ref: string; name: string | null }
  | { at: number; kind: 'trinket'; ref: string }
  | { at: number; kind: 'post'; from: string | null }
  | { at: number; kind: 'package'; from: string | null };

/** A note he wrote for the papers of one day (`day` as YYYY-MM-DD). */
export type PaperNote = { id: string; day: string; text: string };

export type PaperState = {
  log: PaperEvent[];
  notes: PaperNote[];
  /** The last day whose papers she opened (YYYY-MM-DD), so a new one can look new. */
  read: string | null;
};

export const NO_PAPER: PaperState = { log: [], notes: [], read: null };

const DAY = 86_400_000;
/** The log keeps a little over a week, so last week's papers can still say what happened. */
const KEEP_MS = 9 * DAY;
const MAX_EVENTS = 120;
const MAX_NOTES = 30;
export const MAX_NOTE_TEXT = 400;
const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

/** Something happened worth a line in tomorrow's papers. */
export function logEvent(p: PaperState, e: PaperEvent): PaperState {
  const log = [...p.log.filter((x) => x.at > e.at - KEEP_MS), e].slice(-MAX_EVENTS);
  return { ...p, log };
}

/** His note for one day's papers; a new note for the same day replaces the old one. */
export function withNote(p: PaperState, note: PaperNote): PaperState {
  const text = note.text.trim().slice(0, MAX_NOTE_TEXT);
  const others = p.notes.filter((n) => n.day !== note.day);
  if (!text) return { ...p, notes: others };
  const notes = [...others, { ...note, text }].sort((a, b) => a.day.localeCompare(b.day)).slice(-MAX_NOTES);
  return { ...p, notes };
}

export const noteFor = (p: PaperState, day: string) => p.notes.find((n) => n.day === day) ?? null;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isTime = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0;
const str = (v: unknown, max = 80): string | null => (typeof v === 'string' && v.length > 0 ? v.slice(0, max) : null);

function parseEvent(v: unknown): PaperEvent | null {
  if (!isObj(v) || !isTime(v.at)) return null;
  const at = v.at;
  switch (v.kind) {
    case 'visit': {
      const who = str(v.who);
      const petals = typeof v.petals === 'number' && Number.isFinite(v.petals) ? Math.max(0, Math.min(999, Math.round(v.petals))) : 0;
      return who ? { at, kind: 'visit', who, petals } : null;
    }
    case 'away': {
      const who = str(v.who);
      return who ? { at, kind: 'away', who } : null;
    }
    case 'buy': {
      const ref = str(v.ref, 120);
      const what = v.what === 'species' || v.what === 'pansy' || v.what === 'ribbon' || v.what === 'vase' ? v.what : null;
      return ref && what ? { at, kind: 'buy', what, ref, name: str(v.name, 60) } : null;
    }
    case 'trinket': {
      const ref = str(v.ref);
      return ref ? { at, kind: 'trinket', ref } : null;
    }
    case 'post':
    case 'package':
      return { at, kind: v.kind, from: str(v.from, 24) };
    default:
      return null;
  }
}

/** Reads the papers' part of a save; anything odd is dropped, and an old save starts empty. */
export function parsePaper(v: unknown): PaperState {
  if (!isObj(v)) return NO_PAPER;
  const log = (Array.isArray(v.log) ? v.log : []).map(parseEvent).filter((e): e is PaperEvent => e !== null).slice(-MAX_EVENTS);
  const notes = (Array.isArray(v.notes) ? v.notes : [])
    .filter(isObj)
    .flatMap((n): PaperNote[] => {
      const id = str(n.id);
      const day = typeof n.day === 'string' && DAY_KEY.test(n.day) ? n.day : null;
      const text = typeof n.text === 'string' ? n.text.trim().slice(0, MAX_NOTE_TEXT) : '';
      return id && day && text ? [{ id, day, text }] : [];
    })
    .slice(-MAX_NOTES);
  const read = typeof v.read === 'string' && DAY_KEY.test(v.read) ? v.read : null;
  return { log, notes, read };
}

/** The papers come out at five in the morning: before then, it's still yesterday's paper. */
export const PAPER_HOUR = 5;

/** The day whose papers are out at this moment, as a local date at noon. */
export function paperDate(t: number): Date {
  const d = new Date(t - PAPER_HOUR * 3_600_000);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
}

export const dayKeyOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** The stretch of time "yesterday" covers for this day's papers: from 5:00 the day before to 5:00 on the day. */
export function yesterdayWindow(day: Date): { from: number; to: number } {
  const to = new Date(day.getFullYear(), day.getMonth(), day.getDate(), PAPER_HOUR).getTime();
  const from = new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1, PAPER_HOUR).getTime();
  return { from, to };
}
