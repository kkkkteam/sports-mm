-- Allow admins to read all messages (for moderation / dashboard stats)
drop policy if exists messages_admin_select on public.messages;
create policy messages_admin_select on public.messages
  for select
  using (public.is_admin());

-- Allow admins to read all games regardless of status
drop policy if exists games_admin_select on public.games;
create policy games_admin_select on public.games
  for select
  using (public.is_admin());
