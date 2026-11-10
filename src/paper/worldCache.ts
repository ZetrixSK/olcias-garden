import { useEffect, useState } from 'react';
import { remote, remoteConfigured, isRobot } from '../remote/client';
import { checkWorld, type WorldItem } from './world';

/**
 * The news column, fetched once per day and kept on the phone, so last week's papers still have
 * theirs and today's opens offline once it has come. If it can't be had, the paper prints its
 * stand-in; nothing here ever shows an error.
 */

const KEY = 'paper-world';
const KEEP = 8;

type Cache = Record<string, WorldItem[] | null>;

function readCache(): Cache {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as unknown) : null;
    if (!v || typeof v !== 'object') return {};
    const out: Cache = {};
    for (const [day, items] of Object.entries(v as Record<string, unknown>)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(day)) out[day] = items === null ? null : checkWorld(items);
    }
    return out;
  } catch {
    return {};
  }
}

function writeCache(day: string, items: WorldItem[] | null) {
  try {
    const all = { ...readCache(), [day]: items };
    const kept = Object.keys(all).sort().slice(-KEEP);
    localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(kept.map((k) => [k, all[k] ?? null]))));
  } catch {
    // storage full or blocked: the column just won't be kept
  }
}

/** The column for a day as kept on this phone: items, null (none that day), or undefined (not asked yet). */
export const cachedWorld = (day: string): WorldItem[] | null | undefined => {
  const c = readCache();
  return day in c ? c[day] : undefined;
};

/** Asks the server for a day's column. Resolves null if there isn't one (yet), or it can't be reached. */
async function fetchWorld(day: string): Promise<WorldItem[] | null | undefined> {
  if (!remoteConfigured || isRobot()) return undefined;
  try {
    const sb = await remote();
    const { data, error } = await sb.rpc('paper_world', { p_day: day });
    if (error) return undefined;
    return data ? checkWorld(data) : null;
  } catch {
    return undefined;
  }
}

/**
 * The column for the day being read. Today's is asked for every time the papers open until it
 * has come (it's written at dawn, so an early reader may be ahead of it); older days use what was kept.
 */
export function useWorld(day: string, today: boolean): WorldItem[] | null {
  const [items, setItems] = useState<WorldItem[] | null>(() => cachedWorld(day) ?? null);
  useEffect(() => {
    const kept = cachedWorld(day);
    setItems(kept ?? null);
    if (!today || (kept && kept.length)) return;
    let live = true;
    void fetchWorld(day).then((got) => {
      if (got === undefined) return;
      if (got) writeCache(day, got);
      if (live && got) setItems(got);
    });
    return () => {
      live = false;
    };
  }, [day, today]);
  return items;
}
