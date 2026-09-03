-- Allow admins to update any profile (e.g. is_venue_owner flag)

drop policy if exists profiles_admin_update on public.profiles;

create policy profiles_admin_update on public.profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
