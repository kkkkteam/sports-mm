-- Sports Map & Match — Phase 1 schema

create extension if not exists "pgcrypto";

-- ========== ENUMS ==========
create type public.gender as enum ('male', 'female', 'non_binary', 'prefer_not_to_say');
create type public.skill_level as enum ('beginner', 'intermediate', 'advanced', 'competitive');
create type public.hk_district as enum (
  'central_western', 'wan_chai', 'eastern', 'southern',
  'yau_tsim_mong', 'sham_shui_po', 'kowloon_city', 'wong_tai_sin', 'kwun_tong',
  'kwai_tsing', 'tsuen_wan', 'tuen_mun', 'yuen_long', 'north', 'tai_po',
  'sha_tin', 'sai_kung', 'islands'
);
create type public.venue_type as enum ('public', 'private', 'school', 'club', 'other');
create type public.game_status as enum ('open', 'full', 'cancelled', 'completed');
create type public.cost_split_mode as enum ('all_players', 'joiners_only');
create type public.application_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');
create type public.friendship_status as enum ('pending', 'accepted', 'blocked');
create type public.chat_room_type as enum ('direct', 'group', 'game');
create type public.message_type as enum ('text', 'system');
create type public.member_role as enum ('owner', 'admin', 'member');

-- ========== UPDATED_AT ==========
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ========== SPORTS ==========
create table public.sports (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_zh text not null,
  min_players int not null default 2,
  is_active boolean not null default true
);

insert into public.sports (slug, name_en, name_zh, min_players) values
  ('basketball', 'Basketball', '籃球', 4),
  ('dodgebee', 'Dodgebee', '健球', 6),
  ('pickleball', 'Pickleball', '匹克球', 2),
  ('football', 'Football', '足球', 8),
  ('badminton', 'Badminton', '羽毛球', 2),
  ('volleyball', 'Volleyball', '排球', 6),
  ('tennis', 'Tennis', '網球', 2),
  ('table_tennis', 'Table Tennis', '乒乓球', 2);

-- ========== PROFILES ==========
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  gender public.gender,
  avatar_url text,
  bio text,
  district public.hk_district,
  phone_visible_after_join boolean not null default false,
  games_hosted_count int not null default 0,
  games_joined_count int not null default 0,
  games_completed_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nickname_len check (char_length(nickname) between 1 and 24)
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_name text;
begin
  raw_name := coalesce(
    new.raw_user_meta_data->>'nickname',
    new.raw_user_meta_data->>'full_name',
    split_part(coalesce(new.email, new.phone, 'player'), '@', 1)
  );

  insert into public.profiles (id, nickname)
  values (
    new.id,
    left(coalesce(nullif(trim(raw_name), ''), '球員'), 24)
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========== USER SPORT SKILLS ==========
create table public.user_sport_skills (
  user_id uuid not null references public.profiles(id) on delete cascade,
  sport_id uuid not null references public.sports(id) on delete cascade,
  level public.skill_level not null default 'beginner',
  updated_at timestamptz not null default now(),
  primary key (user_id, sport_id)
);

-- ========== VENUES ==========
create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name_zh text not null,
  name_en text,
  district public.hk_district not null,
  address text,
  lat double precision,
  lng double precision,
  venue_type public.venue_type not null default 'public',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index venues_district_idx on public.venues (district);
create index venues_geo_idx on public.venues (lat, lng);

-- ========== CHAT (created before games FK) ==========
create table public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  type public.chat_room_type not null,
  title text,
  created_at timestamptz not null default now()
);

create table public.chat_room_members (
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null default 'member',
  last_read_at timestamptz,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  type public.message_type not null default 'text',
  content text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index messages_room_time_idx on public.messages (room_id, created_at desc);

-- ========== GAMES ==========
create table public.games (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  sport_id uuid not null references public.sports(id),
  venue_id uuid references public.venues(id) on delete set null,
  venue_label text not null,
  district public.hk_district not null,
  lat double precision,
  lng double precision,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  max_players int not null,
  current_players int not null default 1,
  spots_needed int generated always as (max_players - current_players) stored,
  total_cost_hkd numeric(10,2) not null default 0,
  cost_split_mode public.cost_split_mode not null default 'all_players',
  min_skill public.skill_level,
  title text not null,
  description text,
  status public.game_status not null default 'open',
  chat_room_id uuid references public.chat_rooms(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint time_range check (ends_at > starts_at),
  constraint player_count check (
    max_players >= 2
    and current_players >= 1
    and current_players <= max_players
  )
);

create index games_search_idx on public.games (status, sport_id, district, starts_at);
create index games_host_idx on public.games (host_id);

create trigger games_updated_at
  before update on public.games
  for each row execute function public.set_updated_at();

create table public.game_participants (
  game_id uuid not null references public.games(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (game_id, user_id)
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  status public.application_status not null default 'pending',
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (game_id, applicant_id)
);

create index applications_game_status_idx on public.applications (game_id, status);
create index applications_applicant_idx on public.applications (applicant_id);

-- ========== FRIENDS ==========
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status public.friendship_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint no_self_friend check (requester_id <> addressee_id)
);

create unique index friendships_unique_pair_idx
  on public.friendships (
    least(requester_id, addressee_id),
    greatest(requester_id, addressee_id)
  );

create trigger friendships_updated_at
  before update on public.friendships
  for each row execute function public.set_updated_at();

-- ========== GROUPS ==========
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  avatar_url text,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  chat_room_id uuid references public.chat_rooms(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- ========== TRIGGERS ==========
create or replace function public.on_game_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.chat_rooms (type, title)
  values ('game', new.title)
  returning id into new.chat_room_id;
  return new;
end;
$$;

create trigger games_create_chat_room
  before insert on public.games
  for each row execute function public.on_game_created();

create or replace function public.on_game_created_members()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.game_participants (game_id, user_id)
  values (new.id, new.host_id);

  insert into public.chat_room_members (room_id, user_id, role)
  values (new.chat_room_id, new.host_id, 'owner');

  update public.profiles
  set games_hosted_count = games_hosted_count + 1
  where id = new.host_id;

  return new;
end;
$$;

create trigger games_create_host_member
  after insert on public.games
  for each row execute function public.on_game_created_members();

create or replace function public.on_group_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.chat_rooms (type, title)
  values ('group', new.name)
  returning id into new.chat_room_id;
  return new;
end;
$$;

create trigger groups_create_chat_room
  before insert on public.groups
  for each row execute function public.on_group_created();

create or replace function public.on_group_created_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.group_members (group_id, user_id, role)
  values (new.id, new.owner_id, 'owner');

  insert into public.chat_room_members (room_id, user_id, role)
  values (new.chat_room_id, new.owner_id, 'owner');

  return new;
end;
$$;

create trigger groups_create_owner_member
  after insert on public.groups
  for each row execute function public.on_group_created_owner();

create or replace function public.on_application_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
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
        else status
      end
    where id = new.game_id
      and current_players < max_players;

    update public.profiles
    set games_joined_count = games_joined_count + 1
    where id = new.applicant_id;

    new.decided_at = now();
  elsif new.status in ('rejected', 'withdrawn') and old.status = 'pending' then
    new.decided_at = now();
  end if;

  return new;
end;
$$;

create trigger applications_status_change
  before update of status on public.applications
  for each row execute function public.on_application_status_change();

-- ========== RLS HELPERS ==========
create or replace function public.is_group_member(_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = _group_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_chat_member(_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.chat_room_members
    where room_id = _room_id and user_id = auth.uid()
  );
$$;

-- ========== RLS ==========
alter table public.sports enable row level security;
alter table public.profiles enable row level security;
alter table public.user_sport_skills enable row level security;
alter table public.venues enable row level security;
alter table public.games enable row level security;
alter table public.game_participants enable row level security;
alter table public.applications enable row level security;
alter table public.friendships enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_room_members enable row level security;
alter table public.messages enable row level security;

create policy sports_public_read on public.sports
  for select using (true);

create policy profiles_public_read on public.profiles
  for select using (true);

create policy profiles_self_update on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

create policy skills_public_read on public.user_sport_skills
  for select using (true);

create policy skills_self_write on public.user_sport_skills
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy venues_public_read on public.venues
  for select using (true);

create policy venues_auth_insert on public.venues
  for insert to authenticated
  with check (auth.uid() = created_by);

create policy games_listed_read on public.games
  for select using (status in ('open', 'full', 'completed') or host_id = auth.uid());

create policy games_host_insert on public.games
  for insert to authenticated
  with check (auth.uid() = host_id);

create policy games_host_update on public.games
  for update using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

create policy participants_read on public.game_participants
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.games g
      where g.id = game_id
        and (g.status in ('open', 'full', 'completed') or g.host_id = auth.uid())
    )
  );

create policy applications_involved_read on public.applications
  for select using (
    applicant_id = auth.uid()
    or exists (select 1 from public.games g where g.id = game_id and g.host_id = auth.uid())
  );

create policy applications_self_insert on public.applications
  for insert to authenticated
  with check (
    auth.uid() = applicant_id
    and not exists (select 1 from public.games g where g.id = game_id and g.host_id = auth.uid())
  );

create policy applications_host_or_self_update on public.applications
  for update using (
    applicant_id = auth.uid()
    or exists (select 1 from public.games g where g.id = game_id and g.host_id = auth.uid())
  )
  with check (
    (
      applicant_id = auth.uid()
      and status = 'withdrawn'
    )
    or exists (select 1 from public.games g where g.id = game_id and g.host_id = auth.uid())
  );

create policy friendships_involved_read on public.friendships
  for select using (auth.uid() in (requester_id, addressee_id));

create policy friendships_self_insert on public.friendships
  for insert to authenticated
  with check (auth.uid() = requester_id);

create policy friendships_involved_update on public.friendships
  for update using (auth.uid() in (requester_id, addressee_id));

create policy groups_member_read on public.groups
  for select using (public.is_group_member(id));

create policy groups_owner_insert on public.groups
  for insert to authenticated
  with check (auth.uid() = owner_id);

create policy groups_owner_update on public.groups
  for update using (auth.uid() = owner_id);

create policy group_members_read on public.group_members
  for select using (public.is_group_member(group_id));

create policy group_members_owner_insert on public.group_members
  for insert to authenticated
  with check (
    exists (select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid())
  );

create policy chat_rooms_member_read on public.chat_rooms
  for select using (public.is_chat_member(id));

create policy chat_members_self_read on public.chat_room_members
  for select using (public.is_chat_member(room_id));

create policy messages_member_read on public.messages
  for select using (deleted_at is null and public.is_chat_member(room_id));

create policy messages_member_insert on public.messages
  for insert to authenticated
  with check (sender_id = auth.uid() and public.is_chat_member(room_id));

-- ========== REALTIME ==========
alter table public.messages replica identity full;
alter table public.applications replica identity full;

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.applications;
alter publication supabase_realtime add table public.games;
