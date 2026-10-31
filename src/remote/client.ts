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
type ActionRow = { id: string; kind: string; payload: unknown; created_at: string; from_tag: string | null };

/** Actions sent to this garden that haven't been carried out yet, oldest first. */
export async function pendingActions(): Promise<ActionRow[]> {
  const id = await deviceId();
  const sb = await remote();
  const { data, error } = await sb
    .from('actions')
    .select('id, kind, payload, created_at, from_tag')
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
        onAction({ id: row.id, kind: row.kind, payload: row.payload, created_at: row.created_at, from_tag: typeof row.from_tag === 'string' ? row.from_tag : null });
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

// ---- the post: tags, sending bouquets, and the inbox ----

/** Why sending or taking a tag didn't work, in a form the garden can explain. */
export type PostError = 'offline' | 'taken' | 'bad tag' | 'no tag' | 'no such tag' | 'too many today' | 'not allowed' | 'no garden' | 'yourself';

function postError(e: unknown): PostError {
  const msg = typeof e === 'object' && e !== null && 'message' in e ? String((e as { message: unknown }).message) : '';
  for (const known of ['taken', 'bad tag', 'no tag', 'no such tag', 'too many today', 'not allowed', 'no garden', 'yourself'] as const) if (msg.includes(known)) return known;
  return 'offline';
}

/** Takes a tag for this garden (or changes it). Resolves with the tag as stored, or why not. */
export async function claimTag(tag: string): Promise<{ tag: string } | { error: PostError }> {
  try {
    await deviceId();
    const sb = await remote();
    const { data, error } = await sb.rpc('claim_tag', { p_tag: tag });
    if (error) return { error: postError(error) };
    return { tag: String(data) };
  } catch (e) {
    return { error: postError(e) };
  }
}

/** Sends something to a tag. Null once it's on its way. */
export async function sendMail(to: string, kind: 'bouquet', payload: unknown): Promise<PostError | null> {
  try {
    await deviceId();
    const sb = await remote();
    const { error } = await sb.rpc('send_mail', { p_to: to.replace(/^#/, ''), p_kind: kind, p_payload: payload });
    return error ? postError(error) : null;
  } catch (e) {
    return postError(e);
  }
}

export type Mail = { id: string; from_tag: string; kind: string; payload: unknown; created_at: string };

/** Post that has arrived and not yet been taken in, oldest first. */
export async function inbox(): Promise<Mail[]> {
  const id = await deviceId();
  const sb = await remote();
  const { data, error } = await sb
    .from('mail')
    .select('id, from_tag, kind, payload, created_at')
    .eq('to_device', id)
    .is('delivered_at', null)
    .order('created_at')
    .limit(50);
  if (error) throw error;
  return data as Mail[];
}

export async function markDelivered(id: string): Promise<void> {
  const sb = await remote();
  const { error } = await sb.from('mail').update({ delivered_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

/** Listens for post as it arrives; `onConnected` runs each time the line opens, to fetch anything missed. */
export async function listenForMail(onMail: (m: Mail) => void, onConnected: () => void): Promise<() => void> {
  const id = await deviceId();
  const sb = await remote();
  const channel = sb
    .channel(`mail:${id}:${Math.random().toString(36).slice(2, 8)}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mail', filter: `to_device=eq.${id}` }, (msg) => {
      const row = msg.new as Partial<Mail> & { delivered_at?: string | null };
      if (typeof row.id === 'string' && typeof row.from_tag === 'string' && !row.delivered_at) {
        onMail({ id: row.id, from_tag: row.from_tag, kind: String(row.kind), payload: row.payload, created_at: String(row.created_at) });
      }
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') onConnected();
    });
  return () => void sb.removeChannel(channel);
}

/** The tags this garden doesn't want post from. */
export async function blockedTags(): Promise<string[]> {
  await deviceId();
  const sb = await remote();
  const { data, error } = await sb.from('mail_blocks').select('tag').order('created_at');
  if (error) throw error;
  return (data as { tag: string }[]).map((b) => b.tag);
}

export async function setBlocked(tag: string, blocked: boolean): Promise<boolean> {
  try {
    const id = await deviceId();
    const sb = await remote();
    const t = tag.replace(/^#/, '').toLowerCase();
    // adding one that's already there is fine: no overwrite, so only adding is ever needed
    const { error } = blocked
      ? await sb.from('mail_blocks').upsert({ owner: id, tag: t }, { onConflict: 'owner,tag', ignoreDuplicates: true })
      : await sb.from('mail_blocks').delete().eq('tag', t);
    return !error;
  } catch {
    return false;
  }
}

// ---- visiting each other's gardens ----

/** What a visitor may do: 0 can't visit, 1 look, 2 water, 3 tend (plant, trim), 4 everything (also remove). */
export type VisitLevel = 0 | 1 | 2 | 3 | 4;
export const asLevel = (v: unknown): VisitLevel => (v === 1 || v === 2 || v === 3 || v === 4 ? v : 0);

export type Visit = {
  tag: string;
  level: VisitLevel;
  lastSeen: number;
  garden: unknown;
  /** What this visitor did that the owner's phone hasn't carried out yet. */
  pending: { id: string; kind: string; payload: unknown; created_at: string }[];
};

/** Looks at someone's garden by their tag, if they let this visitor in. */
export async function visitGarden(tag: string): Promise<Visit | { error: PostError }> {
  try {
    await deviceId();
    const sb = await remote();
    const { data, error } = await sb.rpc('visit_garden', { p_tag: tag.replace(/^#/, '') });
    if (error) return { error: postError(error) };
    const d = data as { tag: string; level: number; last_seen: string; garden: unknown; pending: Visit['pending'] };
    return { tag: d.tag, level: asLevel(d.level), lastSeen: Date.parse(d.last_seen), garden: d.garden, pending: Array.isArray(d.pending) ? d.pending : [] };
  } catch (e) {
    return { error: postError(e) };
  }
}

/** Does something in a garden being visited. Resolves with the action's id, or why not. */
export async function visitAction(tag: string, kind: 'water' | 'plant' | 'trim' | 'remove', payload: Record<string, unknown>): Promise<{ id: string } | { error: PostError }> {
  try {
    await deviceId();
    const sb = await remote();
    const { data, error } = await sb.rpc('visit_action', { p_tag: tag.replace(/^#/, ''), p_kind: kind, p_payload: payload });
    return error ? { error: postError(error) } : { id: String(data) };
  } catch (e) {
    return { error: postError(e) };
  }
}

/** Her rules for visitors: '*' for anyone who knows her tag, or a particular tag. */
export type AccessRule = { who: string; level: VisitLevel };

export async function accessRules(): Promise<AccessRule[] | null> {
  try {
    await deviceId();
    const sb = await remote();
    const { data, error } = await sb.from('garden_access').select('who, level').order('who');
    if (error) return null;
    return (data as { who: string; level: number }[]).map((r) => ({ who: r.who, level: asLevel(r.level) }));
  } catch {
    return null;
  }
}

export async function setAccess(who: string, level: VisitLevel | null): Promise<boolean> {
  try {
    const id = await deviceId();
    const sb = await remote();
    const { error } =
      level === null
        ? await sb.from('garden_access').delete().eq('who', who)
        : await sb.from('garden_access').upsert({ owner: id, who, level }, { onConflict: 'owner,who' });
    return !error;
  } catch {
    return false;
  }
}
