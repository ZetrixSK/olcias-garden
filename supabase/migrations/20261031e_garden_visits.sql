-- Applied to project bnzwavfiltdemetdmmvg on 2026-10-31 (migration "garden_visits").
-- Visiting each other's gardens. The owner decides who may visit and what they may do, as a
-- level: 0 can't visit, 1 look, 2 water, 3 tend (plant, trim), 4 everything (also remove).
-- '*' is anyone who knows the owner's tag; a particular tag's own level wins over it.

create table public.garden_access (
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  who text not null check (who = '*' or who ~ '^[a-z0-9_]{3,20}$'),
  level smallint not null check (level between 0 and 4),
  primary key (owner, who)
);
alter table public.garden_access enable row level security;
create policy "own access rules" on public.garden_access for all to authenticated
  using (owner = (select auth.uid()))
  with check (owner = (select auth.uid()));
revoke all on public.garden_access from anon, authenticated;
grant select, insert, update, delete on public.garden_access to authenticated;

alter table public.actions add column from_tag text, add column from_device uuid references auth.users (id) on delete set null;
create index actions_from_device on public.actions (from_device, created_at) where from_device is not null;

create or replace function private.visit_level(p_owner uuid, p_visitor_tag text)
returns smallint
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select level from public.garden_access where owner = p_owner and who = p_visitor_tag),
    (select level from public.garden_access where owner = p_owner and who = '*'),
    0::smallint
  );
$$;
revoke all on function private.visit_level(uuid, text) from public;

-- SECURITY DEFINER on purpose: the only way to see or touch someone else's garden, checked
-- against the owner's rules each time; never returns the owner's id, diary, notes, post or location.
create or replace function public.visit_garden(p_tag text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  my_tag text;
  target uuid;
  lvl smallint;
  g record;
begin
  if me is null then raise exception 'not signed in'; end if;
  select tag into my_tag from public.mailboxes where device = me;
  if my_tag is null then raise exception 'no tag'; end if;
  select device into target from public.mailboxes where tag = lower(trim(p_tag));
  if target is null then raise exception 'no such tag'; end if;
  if target = me then raise exception 'yourself'; end if;
  lvl := private.visit_level(target, my_tag);
  if lvl < 1 then raise exception 'not allowed'; end if;
  select garden, last_seen into g from public.gardens where id = target;
  if not found then raise exception 'no garden'; end if;
  return jsonb_build_object(
    'tag', lower(trim(p_tag)),
    'level', lvl,
    'last_seen', g.last_seen,
    'garden', (g.garden - array['diary', 'pressed', 'remoteDone', 'post', 'cuttings']) #- '{settings,location}',
    'pending', coalesce((
      select jsonb_agg(jsonb_build_object('id', a.id, 'kind', a.kind, 'payload', a.payload, 'created_at', a.created_at) order by a.created_at)
      from public.actions a where a.garden = target and a.from_device = me and a.status = 'pending'
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.visit_action(p_tag text, p_kind text, p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  my_tag text;
  target uuid;
  needed smallint;
  new_id uuid;
begin
  if me is null then raise exception 'not signed in'; end if;
  select tag into my_tag from public.mailboxes where device = me;
  if my_tag is null then raise exception 'no tag'; end if;
  select device into target from public.mailboxes where tag = lower(trim(p_tag));
  if target is null then raise exception 'no such tag'; end if;
  if target = me then raise exception 'yourself'; end if;
  needed := case p_kind when 'water' then 2 when 'plant' then 3 when 'trim' then 3 when 'remove' then 4 else 99 end;
  if private.visit_level(target, my_tag) < needed then raise exception 'not allowed'; end if;
  if octet_length(p_payload::text) > 2000 then raise exception 'too big'; end if;
  if not exists (select 1 from public.gardens where id = target) then raise exception 'no garden'; end if;
  if (select count(*) from public.actions where from_device = me and created_at > now() - interval '1 day') >= 40 then
    raise exception 'too many today';
  end if;
  insert into public.actions (garden, kind, payload, from_tag, from_device)
  values (target, p_kind, p_payload, my_tag, me)
  returning id into new_id;
  return new_id;
end;
$$;

revoke all on function public.visit_garden(text) from public, anon;
revoke all on function public.visit_action(text, text, jsonb) from public, anon;
grant execute on function public.visit_garden(text) to authenticated;
grant execute on function public.visit_action(text, text, jsonb) to authenticated;
