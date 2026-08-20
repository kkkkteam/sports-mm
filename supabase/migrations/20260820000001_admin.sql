-- Admin system: profiles.is_admin + is_admin() + RLS for games/messages/reviews

-- 1. Mark admins on profiles
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- 2. Admin check helper (SECURITY DEFINER so RLS policies can call it safely)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select p.is_admin
      from public.profiles p
      where p.id = auth.uid()
    ),
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;

-- 3. Admin RLS: UPDATE + DELETE on games / messages / reviews
drop policy if exists games_admin_update on public.games;
create policy games_admin_update on public.games
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists games_admin_delete on public.games;
create policy games_admin_delete on public.games
  for delete
  using (public.is_admin());

drop policy if exists messages_admin_update on public.messages;
create policy messages_admin_update on public.messages
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists messages_admin_delete on public.messages;
create policy messages_admin_delete on public.messages
  for delete
  using (public.is_admin());

drop policy if exists reviews_admin_update on public.reviews;
create policy reviews_admin_update on public.reviews
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists reviews_admin_delete on public.reviews;
create policy reviews_admin_delete on public.reviews
  for delete
  using (public.is_admin());
