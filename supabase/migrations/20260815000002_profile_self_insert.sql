-- Allow a signed-in user to create their own profile row if the auth trigger missed.

create policy profiles_self_insert on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);
