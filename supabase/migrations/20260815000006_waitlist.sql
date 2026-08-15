-- Step 2/2: waitlist logic (run AFTER 20260815000005_waitlist.sql has committed)

-- ========== APPLICATIONS ==========
alter table public.applications
  add column if not exists waitlisted_at timestamptz;

create index if not exists applications_waitlist_fifo_idx
  on public.applications (game_id, waitlisted_at asc, created_at asc)
  where status = 'waitlisted';

-- ========== NOTIFICATIONS ==========
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists notifications_self_read on public.notifications;
create policy notifications_self_read on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists notifications_self_update on public.notifications;
create policy notifications_self_update on public.notifications
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ========== PROMOTE WAITLIST ==========
create or replace function public.promote_next_waitlisted(p_game_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  app_row public.applications%rowtype;
  game_title text;
begin
  select * into app_row
  from public.applications
  where game_id = p_game_id
    and status = 'waitlisted'
  order by waitlisted_at asc nulls last, created_at asc
  limit 1
  for update skip locked;

  if app_row.id is null then
    return null;
  end if;

  update public.applications
  set
    status = 'pending',
    waitlisted_at = null,
    decided_at = null
  where id = app_row.id;

  select title into game_title from public.games where id = p_game_id;

  insert into public.notifications (user_id, type, title, body, payload)
  values (
    app_row.applicant_id,
    'waitlist_promoted',
    '候補有名額了',
    coalesce(game_title, '場次') || ' 現有空缺，已為你轉成待審批，請等候房主確認。',
    jsonb_build_object(
      'game_id', p_game_id,
      'application_id', app_row.id
    )
  );

  return app_row.id;
end;
$$;

-- ========== INSERT: auto waitlist when full ==========
create or replace function public.on_application_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  game_row public.games%rowtype;
begin
  select * into game_row from public.games where id = new.game_id;
  if game_row.id is null then
    raise exception '場次不存在';
  end if;

  if game_row.status in ('cancelled', 'completed') then
    raise exception '此場次已結束，無法申請';
  end if;

  if game_row.status = 'full' or game_row.current_players >= game_row.max_players then
    new.status := 'waitlisted';
    new.waitlisted_at := coalesce(new.waitlisted_at, now());
  else
    if new.status = 'waitlisted' then
      new.status := 'pending';
    end if;
    new.waitlisted_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists applications_before_insert on public.applications;
create trigger applications_before_insert
  before insert on public.applications
  for each row execute function public.on_application_insert();

-- ========== STATUS CHANGE: accept / leave / waitlist ==========
create or replace function public.on_application_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  game_row public.games%rowtype;
begin
  -- Enter waitlisted
  if new.status = 'waitlisted' and old.status is distinct from 'waitlisted' then
    new.waitlisted_at := coalesce(new.waitlisted_at, now());
  end if;

  -- Leave waitlisted → pending (promotion)
  if old.status = 'waitlisted' and new.status = 'pending' then
    new.waitlisted_at := null;
    return new;
  end if;

  -- Accept
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    select * into game_row from public.games where id = new.game_id for update;

    if game_row.current_players >= game_row.max_players then
      raise exception '場次已滿，無法接受申請';
    end if;

    insert into public.game_participants (game_id, user_id)
    values (new.game_id, new.applicant_id)
    on conflict do nothing;

    insert into public.chat_room_members (room_id, user_id, role)
    select g.chat_room_id, new.applicant_id, 'member'
    from public.games g
    where g.id = new.game_id and g.chat_room_id is not null
    on conflict do nothing;

    update public.games
    set
      current_players = current_players + 1,
      status = case
        when current_players + 1 >= max_players then 'full'::public.game_status
        when status = 'full' then 'open'::public.game_status
        else status
      end
    where id = new.game_id
      and current_players < max_players;

    update public.profiles
    set games_joined_count = games_joined_count + 1
    where id = new.applicant_id;

    new.decided_at := now();
    new.waitlisted_at := null;

  -- Leave roster (applicant withdraw OR host remove)
  elsif old.status = 'accepted' and new.status = 'withdrawn' then
    select * into game_row from public.games where id = new.game_id for update;

    delete from public.game_participants
    where game_id = new.game_id and user_id = new.applicant_id;

    update public.games
    set
      current_players = greatest(1, current_players - 1),
      status = case
        when status = 'full' then 'open'::public.game_status
        else status
      end
    where id = new.game_id;

    update public.profiles
    set games_joined_count = greatest(0, games_joined_count - 1)
    where id = new.applicant_id;

    new.decided_at := now();
    new.waitlisted_at := null;

    perform public.promote_next_waitlisted(new.game_id);

  -- Close pending / waitlisted
  elsif new.status in ('rejected', 'withdrawn')
        and old.status in ('pending', 'waitlisted') then
    new.decided_at := now();
    if new.status <> 'waitlisted' then
      new.waitlisted_at := null;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists applications_status_change on public.applications;
create trigger applications_status_change
  before update of status on public.applications
  for each row execute function public.on_application_status_change();

-- ========== RLS ==========
drop policy if exists applications_host_or_self_update on public.applications;

create policy applications_host_or_self_update on public.applications
  for update using (
    (
      applicant_id = auth.uid()
      and status in ('pending', 'waitlisted', 'accepted')
    )
    or exists (select 1 from public.games g where g.id = game_id and g.host_id = auth.uid())
  )
  with check (
    (
      applicant_id = auth.uid()
      and status in ('pending', 'waitlisted', 'withdrawn')
    )
    or exists (select 1 from public.games g where g.id = game_id and g.host_id = auth.uid())
  );
