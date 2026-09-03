-- Public read for active private venues; admin full access
-- Required for Supabase PostgREST / anon client on /venues page

alter table public.private_venues enable row level security;

drop policy if exists private_venues_select on public.private_venues;
drop policy if exists private_venues_admin_write on public.private_venues;

create policy private_venues_select on public.private_venues
  for select
  using (status = 'active' or public.is_admin());

create policy private_venues_admin_write on public.private_venues
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.private_venues to anon, authenticated;
grant insert, update, delete on public.private_venues to authenticated;
