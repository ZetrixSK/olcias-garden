import { useCallback, useEffect, useState } from 'react';
import { createClient, type Session } from '@supabase/supabase-js';

/**
 * The gardener's sign-in for the test pages: the same storage key as the admin page, so signing in
 * on one signs in on the other, and never the anonymous sign-in of a garden on the same computer.
 * Kept apart from the admin page's code so neither page shares a file with the other.
 */
const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const admin =
  URL && KEY
    ? createClient(URL, KEY, { auth: { storageKey: 'olcias-garden-admin', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } })
    : null;

export function useSession(): { session: Session | null; ready: boolean } {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!admin) return setReady(true);
    void admin.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = admin.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return { session, ready };
}

type WorldRow = { day: string; items: unknown; status: string; error: string | null };

/** The last week's news columns, as the server keeps them. */
export function useWorldRows(): { rows: WorldRow[]; reload: () => void } {
  const [rows, setRows] = useState<WorldRow[]>([]);
  const reload = useCallback(() => {
    if (!admin) return;
    void admin
      .from('paper_world')
      .select('day, items, status, error')
      .order('day', { ascending: false })
      .limit(7)
      .then(({ data }) => setRows((data as WorldRow[] | null) ?? []));
  }, []);
  useEffect(reload, [reload]);
  return { rows, reload };
}
