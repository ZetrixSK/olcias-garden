-- Olcia's garden: one snapshot per device, and a queue of actions sent to it.
-- Devices sign in anonymously and only ever see their own rows; the admin sees everything.
-- Applied to project bnzwavfiltdemetdmmvg on 2026-10-31 (migration "gardens_and_actions").

create schema if not exists private;

-- who may see and change every garden (added by hand in the SQL editor, never from the app)
create table private.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from private.admins where user_id = (select auth.uid()));
$$;

revoke all on function private.is_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

create table public.gardens (
  id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  label text not null default '' check (char_length(label) <= 60),
  garden jsonb not null check (octet_length(garden::text) <= 1000000),
  save_version int not null,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  open_count int not null default 0
);

create table public.actions (
  id uuid primary key default gen_random_uuid(),
  garden uuid not null references public.gardens (id) on delete cascade,
  kind text not null check (char_length(kind) between 1 and 40),
  payload jsonb not null default '{}'::jsonb check (octet_length(payload::text) <= 100000),
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'applied', 'skipped')),
  done_at timestamptz,
  reason text check (char_length(reason) <= 200)
);

create index actions_pending on public.actions (garden, created_at) where status = 'pending';
create index actions_garden on public.actions (garden, created_at desc);

alter table public.gardens enable row level security;
alter table public.actions enable row level security;

-- gardens: a device reads and writes its own row; the admin reads all, renames and removes
create policy "own garden: read" on public.gardens for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));
create policy "own garden: create" on public.gardens for insert to authenticated
  with check (id = (select auth.uid()));
create policy "own garden: update" on public.gardens for update to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()))
  with check (id = (select auth.uid()) or (select private.is_admin()));
create policy "admin: remove garden" on public.gardens for delete to authenticated
  using ((select private.is_admin()));

-- actions: the admin sends them; a device reads its own and marks them done
create policy "actions: read" on public.actions for select to authenticated
  using (garden = (select auth.uid()) or (select private.is_admin()));
create policy "admin: send action" on public.actions for insert to authenticated
  with check ((select private.is_admin()));
create policy "device: mark done" on public.actions for update to authenticated
  using (garden = (select auth.uid()))
  with check (garden = (select auth.uid()));
create policy "admin: remove action" on public.actions for delete to authenticated
  using ((select private.is_admin()));

-- a device may only change an action's outcome, nothing else about it
revoke all on public.actions from anon, authenticated;
grant select, insert, delete on public.actions to authenticated;
grant update (status, done_at, reason) on public.actions to authenticated;
revoke all on public.gardens from anon;

-- one call per upload: creates the row the first time, counts opens, keeps "last seen" fresh
create or replace function public.sync_garden(p_garden jsonb, p_version int, p_opened boolean, p_label text default '')
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.gardens (id, label, garden, save_version, open_count)
  values ((select auth.uid()), left(coalesce(p_label, ''), 60), p_garden, p_version, case when p_opened then 1 else 0 end)
  on conflict (id) do update set
    garden = excluded.garden,
    save_version = excluded.save_version,
    last_seen = now(),
    open_count = public.gardens.open_count + case when p_opened then 1 else 0 end;
$$;

revoke all on function public.sync_garden(jsonb, int, boolean, text) from public, anon;
grant execute on function public.sync_garden(jsonb, int, boolean, text) to authenticated;
