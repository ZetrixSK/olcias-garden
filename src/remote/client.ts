import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * The shared copy of the garden lives in Supabase. Each phone signs itself in anonymously (no login
 * for her) and can only reach its own rows. Without the two settings below, or offline, the garden
 * simply stays on the phone as it always has.
 */
const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const remoteConfigured = Boolean(URL && KEY);

let client: Promise<SupabaseClient> | null = null;

/** The client, loaded only when first needed so the garden never waits for it. */
export function remote(): Promise<SupabaseClient> {
  if (!URL || !KEY) return Promise.reject(new Error('not configured'));
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(URL, KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }),
  );
  return client;
}

let signingIn: Promise<string> | null = null;

/** This device's id, signing it in the first time. A failed sign-in is tried again next time. */
export function deviceId(): Promise<string> {
  signingIn ??= (async () => {
    const sb = await remote();
    const { data } = await sb.auth.getSession();
    if (data.session) return data.session.user.id;
    const { data: made, error } = await sb.auth.signInAnonymously();
    if (error || !made.user) throw error ?? new Error('no user');
    return made.user.id;
  })().catch((e: unknown) => {
    signingIn = null;
    throw e;
  });
  return signingIn;
}

/** Puts this device's garden up, creating its row the first time. */
export async function uploadGarden(garden: unknown, version: number, opened: boolean, label: string): Promise<void> {
  await deviceId();
  const sb = await remote();
  const { error } = await sb.rpc('sync_garden', { p_garden: garden, p_version: version, p_opened: opened, p_label: label });
  if (error) throw error;
}

/** `created_at` keeps them in the order they were sent: live messages can overtake one another. */
type ActionRow = { id: string; kind: string; payload: unknown; created_at: string };

/** Actions sent to this garden that haven't been carried out yet, oldest first. */
export async function pendingActions(): Promise<ActionRow[]> {
  const id = await deviceId();
  const sb = await remote();
  const { data, error } = await sb
    .from('actions')
    .select('id, kind, payload, created_at')
    .eq('garden', id)
    .eq('status', 'pending')
    .order('created_at')
    .limit(50);
  if (error) throw error;
  return data;
}

/** Tells the admin page what became of an action. */
export async function reportAction(id: string, status: 'applied' | 'skipped', reason: string | null): Promise<void> {
  const sb = await remote();
  const { error } = await sb.from('actions').update({ status, reason, done_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

/**
 * Listens for new actions as they're sent. `onConnected` runs each time the line opens (again), so
 * anything sent while it was down can be fetched. Returns a function that stops listening.
 */
export async function listenForActions(onAction: (a: ActionRow) => void, onConnected: () => void): Promise<() => void> {
  const id = await deviceId();
  const sb = await remote();
  // a name of its own: the client hands back an existing channel of the same name, and removing that
  // one (a remount tidying up) would silently stop this one too
  const channel = sb
    .channel(`actions:${id}:${Math.random().toString(36).slice(2, 8)}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'actions', filter: `garden=eq.${id}` }, (msg) => {
      const row = msg.new as Partial<ActionRow> & { status?: string };
      if (typeof row.id === 'string' && typeof row.kind === 'string' && typeof row.created_at === 'string' && row.status === 'pending') {
        onAction({ id: row.id, kind: row.kind, payload: row.payload, created_at: row.created_at });
      }
    })
    .subscribe((status, err) => {
      if (import.meta.env.DEV) console.info('[actions]', status, err ?? '');
      if (status === 'SUBSCRIBED') onConnected();
    });
  return () => void sb.removeChannel(channel);
}

/** Robots (link previews, deployment screenshots) load the page too; they shouldn't become gardens. */
export const isRobot = () => typeof navigator !== 'undefined' && navigator.webdriver === true;
