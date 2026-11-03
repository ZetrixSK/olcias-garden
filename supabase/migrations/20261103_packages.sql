-- Applied to project bnzwavfiltdemetdmmvg on 2026-11-03 (migration "packages").
-- Packages: a parcel with a letter and several things inside (bouquets, seeds). A sender can
-- send one anonymously: then the sender's tag is not stored where the recipient can read it
-- (mail.from_tag is null). The server still knows the sending device (from_device, which phones
-- can't turn into a tag), so blocks and the daily limit still apply to anonymous post.

alter table public.mail alter column from_tag drop not null;
alter table public.mail drop constraint if exists mail_kind_check;
alter table public.mail add constraint mail_kind_check check (kind in ('bouquet', 'package'));
alter table public.mail drop constraint if exists mail_payload_check;
alter table public.mail add constraint mail_payload_check check (octet_length(payload::text) <= 60000);

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
  anonymous boolean := p_kind = 'package' and coalesce((p_payload ->> 'anonymous')::boolean, false);
begin
  if me is null then raise exception 'not signed in'; end if;
  if p_kind not in ('bouquet', 'package') then raise exception 'bad kind'; end if;
  select tag into my_tag from public.mailboxes where device = me;
  if my_tag is null then raise exception 'no tag'; end if;
  select device into target from public.mailboxes where tag = lower(trim(p_to));
  if target is null then raise exception 'no such tag'; end if;
  if target = me then raise exception 'yourself'; end if;
  if (select count(*) from public.mail where from_device = me and created_at > now() - interval '1 day') >= 20 then
    raise exception 'too many today';
  end if;
  -- blocked senders are dropped silently, anonymous or not
  if exists (select 1 from public.mail_blocks where owner = target and tag = my_tag) then
    return gen_random_uuid();
  end if;
  insert into public.mail (to_device, from_device, from_tag, kind, payload)
  values (target, me, case when anonymous then null else my_tag end, p_kind, p_payload)
  returning id into new_id;
  return new_id;
end;
$$;

revoke all on function public.send_mail(text, text, jsonb) from public, anon;
grant execute on function public.send_mail(text, text, jsonb) to authenticated;
