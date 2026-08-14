-- Direct chat helper + chat member self-update

create or replace function public.get_or_create_direct_chat(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  room uuid;
begin
  if me is null then
    raise exception 'not authenticated';
  end if;

  if other_user_id is null or other_user_id = me then
    raise exception 'invalid user';
  end if;

  if not exists (
    select 1
    from public.friendships f
    where f.status = 'accepted'
      and (
        (f.requester_id = me and f.addressee_id = other_user_id)
        or (f.requester_id = other_user_id and f.addressee_id = me)
      )
  ) then
    raise exception 'not friends';
  end if;

  select cr.id into room
  from public.chat_rooms cr
  where cr.type = 'direct'
    and exists (
      select 1 from public.chat_room_members m
      where m.room_id = cr.id and m.user_id = me
    )
    and exists (
      select 1 from public.chat_room_members m
      where m.room_id = cr.id and m.user_id = other_user_id
    )
    and (
      select count(*)::int from public.chat_room_members m where m.room_id = cr.id
    ) = 2
  limit 1;

  if room is not null then
    return room;
  end if;

  insert into public.chat_rooms (type, title)
  values ('direct', null)
  returning id into room;

  insert into public.chat_room_members (room_id, user_id, role)
  values
    (room, me, 'member'),
    (room, other_user_id, 'member');

  return room;
end;
$$;

revoke all on function public.get_or_create_direct_chat(uuid) from public;
grant execute on function public.get_or_create_direct_chat(uuid) to authenticated;

create policy chat_members_self_update on public.chat_room_members
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy friendships_involved_delete on public.friendships
  for delete using (auth.uid() in (requester_id, addressee_id));

-- Soft-delete own messages (optional update)
create policy messages_sender_update on public.messages
  for update using (auth.uid() = sender_id)
  with check (auth.uid() = sender_id);
