-- Applied to project bnzwavfiltdemetdmmvg on 2026-10-31 (migration "gardens_realtime").
-- the admin page sees each garden change as its phone uploads it; devices only ever receive their own row
alter publication supabase_realtime add table public.gardens;
