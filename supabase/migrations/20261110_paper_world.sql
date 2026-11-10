-- Applied to project bnzwavfiltdemetdmmvg on 2026-11-10 (migration "paper_world").
-- The morning papers' news column ("Ze świata"): written once a day at dawn by the paper-world
-- edge function from public headlines, checked, and kept here. Phones only ever read it through
-- paper_world(), which hands out a day's column once it's approved or the column has been made
-- live for everyone; until then only the admin sees it. Nothing about any garden is stored here.

create table public.paper_world (
  day date primary key,
  -- the checked column (2-3 items), or null if writing it failed
  items jsonb,
  -- the headlines it was written from, and the model's raw answer, for the admin's test page
  headlines jsonb not null default '[]'::jsonb,
  raw text,
  model text,
  error text,
  attempts int not null default 1,
  -- 'new' until the admin approves or drops it
  status text not null default 'new' check (status in ('new', 'approved', 'dropped')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint paper_world_items_size check (items is null or octet_length(items::text) <= 20000),
  constraint paper_world_raw_size check (raw is null or octet_length(raw) <= 40000)
);

alter table public.paper_world enable row level security;

create policy "admins read the news column" on public.paper_world
  for select to authenticated using ((select private.is_admin()));
create policy "admins approve or drop the news column" on public.paper_world
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

-- one switch: whether new columns go to the phones without being approved first
create table private.paper_config (
  id int primary key default 1 check (id = 1),
  live boolean not null default false
);
insert into private.paper_config default values;

-- what a phone may read: a day's column, only once it may be printed
create or replace function public.paper_world(p_day date)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select w.items
  from public.paper_world w
  where w.day = p_day
    and w.items is not null
    and w.status <> 'dropped'
    and (w.status = 'approved' or coalesce((select c.live from private.paper_config c where c.id = 1), false));
$$;
revoke all on function public.paper_world(date) from public;
grant execute on function public.paper_world(date) to anon, authenticated;

-- whether the one asking is the admin (the edge function asks this before writing on demand)
create or replace function public.am_i_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select private.is_admin()), false);
$$;
revoke all on function public.am_i_admin() from public, anon;
grant execute on function public.am_i_admin() to authenticated;

-- the admin's switch, and reading it
create or replace function public.paper_live()
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then raise exception 'not allowed'; end if;
  return (select c.live from private.paper_config c where c.id = 1);
end;
$$;
create or replace function public.set_paper_live(p_live boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then raise exception 'not allowed'; end if;
  update private.paper_config set live = p_live where id = 1;
  return p_live;
end;
$$;
revoke all on function public.paper_live() from public, anon;
revoke all on function public.set_paper_live(boolean) from public, anon;
grant execute on function public.paper_live() to authenticated;
grant execute on function public.set_paper_live(boolean) to authenticated;

-- at dawn, ask the edge function to write today's column; it does nothing if it already has
-- one, so the two later calls are only there in case the first one failed
-- (pg_net went into the public schema; the security advisor flags that. To move it:
--   drop extension pg_net; create extension pg_net with schema extensions;
-- the jobs below keep working, since they call net.http_post by name.)
create extension if not exists pg_net;
create extension if not exists pg_cron;

select cron.schedule('paper-world-dawn', '0 3 * * *',
  $c$ select net.http_post(url := 'https://bnzwavfiltdemetdmmvg.supabase.co/functions/v1/paper-world', headers := '{"Content-Type": "application/json"}'::jsonb, body := '{}'::jsonb) $c$);
select cron.schedule('paper-world-retry-1', '40 3 * * *',
  $c$ select net.http_post(url := 'https://bnzwavfiltdemetdmmvg.supabase.co/functions/v1/paper-world', headers := '{"Content-Type": "application/json"}'::jsonb, body := '{}'::jsonb) $c$);
select cron.schedule('paper-world-retry-2', '20 4 * * *',
  $c$ select net.http_post(url := 'https://bnzwavfiltdemetdmmvg.supabase.co/functions/v1/paper-world', headers := '{"Content-Type": "application/json"}'::jsonb, body := '{}'::jsonb) $c$);
