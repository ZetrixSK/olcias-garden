-- Applied to project bnzwavfiltdemetdmmvg on 2026-10-31 (migration "post_box").
-- The post: each garden can take a tag (like #olcia) and send bouquets to other tags.
-- Phones never see each other's ids; sending goes through send_mail, which looks the tag up.

create table public.mailboxes (
  device uuid primary key references auth.users (id) on delete cascade,
  tag text not null unique check (tag ~ '^[a-z0-9_]{3,20}$'),
  created_at timestamptz not null default now()
);

create table public.mail (
  id uuid primary key default gen_random_uuid(),
  to_device uuid not null references auth.users (id) on delete cascade,
  from_device uuid not null references auth.users (id) on delete cascade,
  from_tag text not null,
  kind text not null check (kind in ('bouquet')),
  payload jsonb not null check (octet_length(payload::text) <= 20000),
  created_at timestamptz not null default now(),
  delivered_at timestamptz
);
create index mail_inbox on public.mail (to_device, created_at) where delivered_at is null;
create index mail_sent on public.mail (from_device, created_at);

create table public.mail_blocks (
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tag text not null check (tag ~ '^[a-z0-9_]{3,20}$'),
  created_at timestamptz not null default now(),
  primary key (owner, tag)
);

alter table public.mailboxes enable row level security;
alter table public.mail enable row level security;
alter table public.mail_blocks enable row level security;

create policy "own mailbox: read" on public.mailboxes for select to authenticated
  using (device = (select auth.uid()) or (select private.is_admin()));
revoke all on public.mailboxes from anon, authenticated;
grant select on public.mailboxes to authenticated;

create policy "inbox: read" on public.mail for select to authenticated
  using (to_device = (select auth.uid()));
create policy "inbox: mark delivered" on public.mail for update to authenticated
  using (to_device = (select auth.uid()))
  with check (to_device = (select auth.uid()));
revoke all on public.mail from anon, authenticated;
grant select on public.mail to authenticated;
grant update (delivered_at) on public.mail to authenticated;

create policy "own blocks" on public.mail_blocks for all to authenticated
  using (owner = (select auth.uid()))
  with check (owner = (select auth.uid()));
revoke all on public.mail_blocks from anon, authenticated;
grant select, insert, delete on public.mail_blocks to authenticated;

-- SECURITY DEFINER on purpose: these two are the only way to take a tag or send mail, and they
-- act only for auth.uid(); they keep phones from seeing each other's ids or forging a sender.
create or replace function public.claim_tag(p_tag text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  t text := lower(trim(p_tag));
begin
  if me is null then raise exception 'not signed in'; end if;
  if t !~ '^[a-z0-9_]{3,20}$' then raise exception 'bad tag'; end if;
  insert into public.mailboxes (device, tag) values (me, t)
  on conflict (device) do update set tag = excluded.tag;
  return t;
exception when unique_violation then
  raise exception 'taken';
end;
$$;

create or replace function public.send_mail(p_to text, p_kind text, p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  my_tag text;
  target uuid;
  new_id uuid;
begin
  if me is null then raise exception 'not signed in'; end if;
  select tag into my_tag from public.mailboxes where device = me;
  if my_tag is null then raise exception 'no tag'; end if;
  select device into target from public.mailboxes where tag = lower(trim(p_to));
  if target is null then raise exception 'no such tag'; end if;
  if (select count(*) from public.mail where from_device = me and created_at > now() - interval '1 day') >= 20 then
    raise exception 'too many today';
  end if;
  if exists (select 1 from public.mail_blocks where owner = target and tag = my_tag) then
    return gen_random_uuid();
  end if;
  insert into public.mail (to_device, from_device, from_tag, kind, payload)
  values (target, me, my_tag, p_kind, p_payload)
  returning id into new_id;
  return new_id;
end;
$$;

revoke all on function public.claim_tag(text) from public, anon;
revoke all on function public.send_mail(text, text, jsonb) from public, anon;
grant execute on function public.claim_tag(text) to authenticated;
grant execute on function public.send_mail(text, text, jsonb) to authenticated;

alter publication supabase_realtime add table public.mail;
