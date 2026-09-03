-- Venue owner portal: RLS for private_venues (owner read/update) and venue_bookings

create or replace function public.owns_private_venue(p_venue_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.private_venues v
    where v.id = p_venue_id
      and v.owner_id = auth.uid()
  );
$$;

revoke all on function public.owns_private_venue(uuid) from public;
grant execute on function public.owns_private_venue(uuid) to authenticated;

-- Owners can read their venues (including inactive listings)
drop policy if exists private_venues_owner_select on public.private_venues;
create policy private_venues_owner_select on public.private_venues
  for select
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists private_venues_owner_update on public.private_venues;
create policy private_venues_owner_update on public.private_venues
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Venue bookings
alter table public.venue_bookings enable row level security;

drop policy if exists venue_bookings_owner_select on public.venue_bookings;
create policy venue_bookings_owner_select on public.venue_bookings
  for select
  to authenticated
  using (public.owns_private_venue(venue_id) or public.is_admin());

drop policy if exists venue_bookings_user_select on public.venue_bookings;
create policy venue_bookings_user_select on public.venue_bookings
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists venue_bookings_owner_update on public.venue_bookings;
create policy venue_bookings_owner_update on public.venue_bookings
  for update
  to authenticated
  using (public.owns_private_venue(venue_id) or public.is_admin())
  with check (public.owns_private_venue(venue_id) or public.is_admin());

drop policy if exists venue_bookings_user_insert on public.venue_bookings;
create policy venue_bookings_user_insert on public.venue_bookings
  for insert
  to authenticated
  with check (user_id = auth.uid());

grant select, insert, update on public.venue_bookings to authenticated;
