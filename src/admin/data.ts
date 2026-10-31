import { useCallback, useEffect, useState } from 'react';
import { createClient, type Session } from '@supabase/supabase-js';
import type { ActionRow, GardenRow } from './logic';
import { newestFirst } from '../remote/timeKey';

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * The admin signs in with email and password. Its session is kept under its own name: on a
 * computer that also has the garden open, the garden's anonymous sign-in must stay as it is.
 */
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

/** Every garden, newest visit first, kept up to date as phones upload. */
export function useGardens(enabled: boolean): { gardens: GardenRow[]; loading: boolean; error: string | null } {
  const [gardens, setGardens] = useState<GardenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!admin || !enabled) return;
    const sb = admin;
    const load = async () => {
      const { data, error: e } = await sb.from('gardens').select('*').order('last_seen', { ascending: false });
      if (e) setError(e.message);
      else setGardens(data as GardenRow[]);
      setLoading(false);
    };
    void load();
    const channel = sb
      .channel(`admin-gardens-${Math.random().toString(36).slice(2, 8)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gardens' }, (msg) => {
        if (msg.eventType === 'DELETE') {
          const old = msg.old as Partial<GardenRow>;
          setGardens((list) => list.filter((g) => g.id !== old.id));
          return;
        }
        const row = msg.new as GardenRow;
        setGardens((list) => [row, ...list.filter((g) => g.id !== row.id)].sort((a, b) => newestFirst(a.last_seen, b.last_seen)));
      })
      .subscribe((status) => {
        // anything missed while the line was down
        if (status === 'SUBSCRIBED') void load();
      });
    return () => void sb.removeChannel(channel);
  }, [enabled]);
  return { gardens, loading, error };
}

/** The latest actions sent to one garden, with what became of each, kept up to date. */
export function useActions(gardenId: string | null): ActionRow[] {
  const [actions, setActions] = useState<ActionRow[]>([]);
  useEffect(() => {
    setActions([]);
    if (!admin || !gardenId) return;
    const sb = admin;
    const load = async () => {
      const { data } = await sb.from('actions').select('*').eq('garden', gardenId).order('created_at', { ascending: false }).limit(60);
      if (data) setActions(data as ActionRow[]);
    };
    void load();
    const channel = sb
      .channel(`admin-actions-${gardenId}-${Math.random().toString(36).slice(2, 8)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'actions', filter: `garden=eq.${gardenId}` }, (msg) => {
        if (msg.eventType === 'DELETE') return;
        const row = msg.new as ActionRow;
        setActions((list) => {
          const rest = list.filter((a) => a.id !== row.id);
          return [row, ...rest].sort((a, b) => newestFirst(a.created_at, b.created_at)).slice(0, 60);
        });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') void load();
      });
    return () => void sb.removeChannel(channel);
  }, [gardenId]);
  return actions;
}

/** Sends an action to a garden. Resolves with an error message, or null once it's on its way. */
export function useSend(gardenId: string | null): (kind: string, payload: Record<string, unknown>) => Promise<string | null> {
  return useCallback(
    async (kind, payload) => {
      if (!admin || !gardenId) return 'No garden chosen.';
      const { error } = await admin.from('actions').insert({ garden: gardenId, kind, payload });
      return error ? error.message : null;
    },
    [gardenId],
  );
}

export async function relabel(id: string, label: string): Promise<string | null> {
  if (!admin) return 'Not configured.';
  const { error } = await admin.from('gardens').update({ label: label.slice(0, 60) }).eq('id', id);
  return error ? error.message : null;
}
