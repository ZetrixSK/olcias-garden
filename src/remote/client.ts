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
