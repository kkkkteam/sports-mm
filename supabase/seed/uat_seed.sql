-- =============================================================================
-- UAT seed data for Sports Map & Match
-- Run in Supabase SQL Editor AFTER AFTER AFTER production. Safe to re-run
-- (clears previous UAT rows keyed by fixed UUIDs / emails).
--
-- Test accounts (password for all: UatTest123!)
--   host.uat@sportsshare.hk      → 放場主
--   player1.uat@sportsshare.hk   → 一般球員
--   player2.uat@sportsshare.hk   → 一般球員
--   player3.uat@sportsshare.hk   → 候補／申請人
--   player4.uat@sportsshare.hk   → 候補
-- =============================================================================

create extension if not exists "pgcrypto";

-- Fixed UAT ids
-- host   a1111111-1111-4111-8111-111111111111
-- p1     a2222222-2222-4222-8222-222222222222
-- p2     a3333333-3333-4333-8333-333333333333
-- p3     a4444444-4444-4444-8444-444444444444
-- p4     a5555555-5555-4555-8555-555555555555

do $$
declare
  v_host   uuid := 'a1111111-1111-4111-8111-111111111111';
  v_p1     uuid := 'a2222222-2222-4222-8222-222222222222';
  v_p2     uuid := 'a3333333-3333-4333-8333-333333333333';
  v_p3     uuid := 'a4444444-4444-4444-8444-444444444444';
  v_p4     uuid := 'a5555555-5555-4555-8555-555555555555';
  v_ids    uuid[] := array[
    'a1111111-1111-4111-8111-111111111111'::uuid,
    'a2222222-2222-4222-8222-222222222222'::uuid,
    'a3333333-3333-4333-8333-333333333333'::uuid,
    'a4444444-4444-4444-8444-444444444444'::uuid,
    'a5555555-5555-4555-8555-555555555555'::uuid
  ];
  v_game_open uuid := 'b1000000-0000-4000-8000-000000000001';
  v_game_full uuid := 'b1000000-0000-4000-8000-000000000002';
  v_game_done uuid := 'b1000000-0000-4000-8000-000000000003';
  v_game_soon uuid := 'b1000000-0000-4000-8000-000000000004';
  v_venue_mk  uuid := 'c1000000-0000-4000-8000-000000000001';
  v_venue_st  uuid := 'c1000000-0000-4000-8000-000000000002';
  v_venue_cw  uuid := 'c1000000-0000-4000-8000-000000000003';
  v_basketball uuid;
  v_pickle uuid;
  v_badminton uuid;
  v_dodgebee uuid;
  v_pwd text := crypt('UatTest123!', gen_salt('bf'));
  r record;
begin
  -- ---------- cleanup previous UAT ----------
  delete from public.reviews where game_id in (v_game_open, v_game_full, v_game_done, v_game_soon)
    or reviewer_id = any(v_ids) or reviewee_id = any(v_ids);
  delete from public.applications where game_id in (v_game_open, v_game_full, v_game_done, v_game_soon)
    or applicant_id = any(v_ids);
  delete from public.game_participants where game_id in (v_game_open, v_game_full, v_game_done, v_game_soon)
    or user_id = any(v_ids);

  -- drop UAT game chats
  delete from public.messages
  where room_id in (
    select chat_room_id from public.games
    where id in (v_game_open, v_game_full, v_game_done, v_game_soon) and chat_room_id is not null
  );
  delete from public.chat_room_members
  where room_id in (
    select chat_room_id from public.games
    where id in (v_game_open, v_game_full, v_game_done, v_game_soon) and chat_room_id is not null
  );
  delete from public.chat_rooms
  where id in (
    select chat_room_id from public.games
    where id in (v_game_open, v_game_full, v_game_done, v_game_soon) and chat_room_id is not null
  )
  or title like 'UAT｜%';

  delete from public.games where id in (v_game_open, v_game_full, v_game_done, v_game_soon)
    or host_id = any(v_ids);
  delete from public.venues where id in (v_venue_mk, v_venue_st, v_venue_cw);
  delete from public.user_sport_skills where user_id = any(v_ids);
  if to_regclass('public.smart_alerts') is not null then
    execute 'delete from public.smart_alerts where user_id = any($1)' using v_ids;
  end if;
  if to_regclass('public.notifications') is not null then
    execute 'delete from public.notifications where user_id = any($1)' using v_ids;
  end if;
  delete from public.messages where sender_id = any(v_ids);
  delete from public.chat_room_members where user_id = any(v_ids);
  delete from public.friendships
    where requester_id = any(v_ids) or addressee_id = any(v_ids);
  delete from public.profiles where id = any(v_ids);
  delete from auth.identities where user_id = any(v_ids);
  delete from auth.users where id = any(v_ids);

  select id into v_basketball from public.sports where slug = 'basketball';
  select id into v_pickle from public.sports where slug = 'pickleball';
  select id into v_badminton from public.sports where slug = 'badminton';
  select id into v_dodgebee from public.sports where slug = 'dodgebee';

  if v_basketball is null or v_pickle is null then
    raise exception 'sports seed missing — run init migration first';
  end if;

  -- ---------- auth users + identities ----------
  for r in
    select * from (values
      (v_host, 'host.uat@sportsshare.hk', 'UAT Host', 'yau_tsim_mong'::public.hk_district, 'male'::public.gender),
      (v_p1, 'player1.uat@sportsshare.hk', 'UAT 阿明', 'sham_shui_po'::public.hk_district, 'male'::public.gender),
      (v_p2, 'player2.uat@sportsshare.hk', 'UAT 小欣', 'sha_tin'::public.hk_district, 'female'::public.gender),
      (v_p3, 'player3.uat@sportsshare.hk', 'UAT 志強', 'kwun_tong'::public.hk_district, 'male'::public.gender),
      (v_p4, 'player4.uat@sportsshare.hk', 'UAT 佳琪', 'eastern'::public.hk_district, 'female'::public.gender)
    ) as t(id, email, nickname, district, gender)
  loop
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      r.id,
      'authenticated',
      'authenticated',
      r.email,
      v_pwd,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('nickname', r.nickname),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      r.id,
      r.id,
      jsonb_build_object('sub', r.id::text, 'email', r.email, 'email_verified', true),
      'email',
      r.id::text,
      now(),
      now(),
      now()
    );

    -- trigger may already create profile; upsert details
    insert into public.profiles (id, nickname, gender, district, bio)
    values (
      r.id,
      r.nickname,
      r.gender,
      r.district,
      'UAT seed account — password UatTest123!'
    )
    on conflict (id) do update set
      nickname = excluded.nickname,
      gender = excluded.gender,
      district = excluded.district,
      bio = excluded.bio;
  end loop;

  -- reputation demo on player1 (bypass guard)
  perform set_config('app.updating_reputation', 'true', true);
  update public.profiles
  set
    rating = 4.60,
    rating_count = 5,
    attendance_marked_count = 10,
    attendance_present_count = 9
  where id = v_p1;
  update public.profiles
  set
    rating = 4.20,
    rating_count = 3,
    attendance_marked_count = 6,
    attendance_present_count = 5
  where id = v_p2;
  perform set_config('app.updating_reputation', 'false', true);

  -- skills
  insert into public.user_sport_skills (user_id, sport_id, level) values
    (v_host, v_basketball, 'advanced'),
    (v_host, v_pickle, 'intermediate'),
    (v_p1, v_basketball, 'intermediate'),
    (v_p1, v_badminton, 'beginner'),
    (v_p2, v_pickle, 'advanced'),
    (v_p2, v_dodgebee, 'intermediate'),
    (v_p3, v_basketball, 'beginner'),
    (v_p4, v_pickle, 'beginner')
  on conflict do nothing;

  -- venues (HK coords)
  insert into public.venues (id, name_zh, name_en, district, address, lat, lng, venue_type, created_by)
  values
    (
      v_venue_mk,
      '麥花臣場館',
      'MacPherson Stadium',
      'yau_tsim_mong',
      '旺角梭椏道',
      22.3193,
      114.1694,
      'public',
      v_host
    ),
    (
      v_venue_st,
      '沙田公園籃球場',
      'Sha Tin Park Courts',
      'sha_tin',
      '沙田正街',
      22.3810,
      114.1880,
      'public',
      v_host
    ),
    (
      v_venue_cw,
      '中山紀念公園網球場旁空地',
      'Sun Yat Sen Memorial Park area',
      'central_western',
      '西營盤東邊街北',
      22.2895,
      114.1448,
      'public',
      v_host
    );

  -- ---------- games ----------
  -- 1) Open basketball in Mong Kok (spots left)
  insert into public.games (
    id, host_id, sport_id, venue_id, venue_label, district, lat, lng,
    starts_at, ends_at, max_players, current_players, total_cost_hkd,
    cost_split_mode, min_skill, title, description, status
  ) values (
    v_game_open,
    v_host,
    v_basketball,
    v_venue_mk,
    '旺角麥花臣球場',
    'yau_tsim_mong',
    22.3193,
    114.1694,
    date_trunc('day', now() at time zone 'Asia/Hong_Kong') at time zone 'Asia/Hong_Kong' + interval '2 days' + interval '19 hours',
    date_trunc('day', now() at time zone 'Asia/Hong_Kong') at time zone 'Asia/Hong_Kong' + interval '2 days' + interval '21 hours',
    8,
    1,
    400,
    'all_players',
    'beginner',
    'UAT｜旺角籃球夜場',
    'UAT open game — 尚有空位，可測申請／付款截圖。',
    'open'
  );

  -- 2) Full pickleball (for waitlist)
  insert into public.games (
    id, host_id, sport_id, venue_id, venue_label, district, lat, lng,
    starts_at, ends_at, max_players, current_players, total_cost_hkd,
    cost_split_mode, title, description, status
  ) values (
    v_game_full,
    v_host,
    v_pickle,
    v_venue_cw,
    '西營盤匹克球場',
    'central_western',
    22.2895,
    114.1448,
    date_trunc('day', now() at time zone 'Asia/Hong_Kong') at time zone 'Asia/Hong_Kong' + interval '3 days' + interval '10 hours',
    date_trunc('day', now() at time zone 'Asia/Hong_Kong') at time zone 'Asia/Hong_Kong' + interval '3 days' + interval '12 hours',
    4,
    1,
    200,
    'all_players',
    'UAT｜港島匹克球（已滿）',
    'UAT full game — 申請會進候補；移出名單可測晉升。',
    'open'
  );

  -- Force full: accept p1,p2,p3 then waitlist p4
  -- After host insert, current_players=1. Accept 3 more → 4 = full.
  insert into public.applications (game_id, applicant_id, message, status)
  values
    (v_game_full, v_p1, '想打進階局', 'pending'),
    (v_game_full, v_p2, '準時到', 'pending'),
    (v_game_full, v_p3, '第一次打', 'pending');

  update public.applications set status = 'accepted'
    where game_id = v_game_full and applicant_id in (v_p1, v_p2, v_p3);

  -- ensure status full
  update public.games set status = 'full', current_players = 4 where id = v_game_full;

  insert into public.applications (game_id, applicant_id, message, status, waitlisted_at)
  values (v_game_full, v_p4, '可以候補', 'waitlisted', now());

  -- open game: one pending application
  insert into public.applications (game_id, applicant_id, message, status)
  values (v_game_open, v_p1, '有球鞋，水平中階', 'pending');

  -- 3) Completed game for reviews / attendance
  insert into public.games (
    id, host_id, sport_id, venue_id, venue_label, district, lat, lng,
    starts_at, ends_at, max_players, current_players, total_cost_hkd,
    cost_split_mode, title, description, status
  ) values (
    v_game_done,
    v_host,
    v_badminton,
    v_venue_st,
    '沙田羽毛球館',
    'sha_tin',
    22.3810,
    114.1880,
    now() - interval '2 days',
    now() - interval '2 days' + interval '2 hours',
    4,
    1,
    160,
    'all_players',
    'UAT｜沙田羽毛球（已完成）',
    'UAT completed — 可測出席標記與評分。',
    'open'
  );

  insert into public.applications (game_id, applicant_id, message, status)
  values
    (v_game_done, v_p1, null, 'pending'),
    (v_game_done, v_p2, null, 'pending');

  update public.applications set status = 'accepted'
    where game_id = v_game_done and applicant_id in (v_p1, v_p2);

  update public.games
  set status = 'completed', current_players = 3
  where id = v_game_done;

  -- Seed as service role: bypass auth.uid() checks in attendance/review triggers
  alter table public.game_participants disable trigger game_participants_validate_attendance;
  update public.game_participants
  set attendance_status = 'present',
      attendance_marked_by = v_host,
      attendance_marked_at = now()
  where game_id = v_game_done and user_id = v_p1;

  update public.game_participants
  set attendance_status = 'no_show',
      attendance_marked_by = v_host,
      attendance_marked_at = now()
  where game_id = v_game_done and user_id = v_p2;
  alter table public.game_participants enable trigger game_participants_validate_attendance;

  alter table public.reviews disable trigger reviews_validate;
  insert into public.reviews (game_id, reviewer_id, reviewee_id, rating, comment)
  values
    (v_game_done, v_host, v_p1, 5, '準時又好溝通，UAT 好評。'),
    (v_game_done, v_p1, v_p2, 3, '這場缺席，給中評作示範。')
  on conflict do nothing;
  alter table public.reviews enable trigger reviews_validate;

  -- 4) Upcoming dodgebee for list variety
  insert into public.games (
    id, host_id, sport_id, venue_id, venue_label, district, lat, lng,
    starts_at, ends_at, max_players, total_cost_hkd, cost_split_mode,
    title, description, status
  ) values (
    v_game_soon,
    v_p2,
    v_dodgebee,
    v_venue_st,
    '沙田公園草地',
    'sha_tin',
    22.3825,
    114.1895,
    date_trunc('day', now() at time zone 'Asia/Hong_Kong') at time zone 'Asia/Hong_Kong' + interval '5 days' + interval '15 hours',
    date_trunc('day', now() at time zone 'Asia/Hong_Kong') at time zone 'Asia/Hong_Kong' + interval '5 days' + interval '17 hours',
    10,
    0,
    'all_players',
    'UAT｜沙田健球新手局',
    '免費新手局，測列表／距離顯示。',
    'open'
  );

  -- friendship + smart alert (optional)
  insert into public.friendships (requester_id, addressee_id, status)
  values (v_p1, v_p2, 'accepted')
  on conflict do nothing;

  if to_regclass('public.smart_alerts') is not null then
    insert into public.smart_alerts (user_id, district, sport_id, is_active)
    values
      (v_p1, 'yau_tsim_mong', v_basketball, true),
      (v_p4, 'central_western', v_pickle, true);
  end if;

  raise notice 'UAT seed complete. Login with *.uat@sportsshare.hk / UatTest123!';
end $$;
