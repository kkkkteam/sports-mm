-- =============================================================================
-- UAT seed data for Sports Map & Match
-- Run in Supabase SQL Editor AFTER migrations. Safe to re-run.
--
-- Map testing (2026-08): 18 district venues with Google Places–style coordinates,
-- ~22 future open/full games with lat/lng, 1 centroid-fallback game (no coords).
--
-- Test accounts (password for all: UatTest123!)
--   host.uat@sportsshare.hk … player9.uat@sportsshare.hk  (10 members)
-- =============================================================================

create extension if not exists "pgcrypto";

do $$
declare
  v_host uuid := 'a1111111-1111-4111-8111-111111111111';
  v_p1   uuid := 'a2222222-2222-4222-8222-222222222222';
  v_p2   uuid := 'a3333333-3333-4333-8333-333333333333';
  v_p3   uuid := 'a4444444-4444-4444-8444-444444444444';
  v_p4   uuid := 'a5555555-5555-4555-8555-555555555555';
  v_p5   uuid := 'a6666666-6666-4666-8666-666666666666';
  v_p6   uuid := 'a7777777-7777-4777-8777-777777777777';
  v_p7   uuid := 'a8888888-8888-4888-8888-888888888888';
  v_p8   uuid := 'a9999999-9999-4999-8999-999999999999';
  v_p9   uuid := 'aa101010-1010-4101-8101-101010101010';
  v_ids  uuid[] := array[
    'a1111111-1111-4111-8111-111111111111'::uuid,
    'a2222222-2222-4222-8222-222222222222'::uuid,
    'a3333333-3333-4333-8333-333333333333'::uuid,
    'a4444444-4444-4444-8444-444444444444'::uuid,
    'a5555555-5555-4555-8555-555555555555'::uuid,
    'a6666666-6666-4666-8666-666666666666'::uuid,
    'a7777777-7777-4777-8777-777777777777'::uuid,
    'a8888888-8888-4888-8888-888888888888'::uuid,
    'a9999999-9999-4999-8999-999999999999'::uuid,
    'aa101010-1010-4101-8101-101010101010'::uuid
  ];

  -- scenario games
  v_game_open uuid := 'b1000000-0000-4000-8000-000000000001';
  v_game_full uuid := 'b1000000-0000-4000-8000-000000000002';
  v_game_done uuid := 'b1000000-0000-4000-8000-000000000003';
  v_game_soon uuid := 'b1000000-0000-4000-8000-000000000004';
  v_game_map_cluster uuid := 'b1000000-0000-4000-8000-000000000021';
  v_game_map_centroid uuid := 'b1000000-0000-4000-8000-000000000022';

  -- bulk games b…005 … b…024  (20 extra)
  v_game_ids uuid[] := array[
    'b1000000-0000-4000-8000-000000000005'::uuid,
    'b1000000-0000-4000-8000-000000000006'::uuid,
    'b1000000-0000-4000-8000-000000000007'::uuid,
    'b1000000-0000-4000-8000-000000000008'::uuid,
    'b1000000-0000-4000-8000-000000000009'::uuid,
    'b1000000-0000-4000-8000-00000000000a'::uuid,
    'b1000000-0000-4000-8000-00000000000b'::uuid,
    'b1000000-0000-4000-8000-00000000000c'::uuid,
    'b1000000-0000-4000-8000-00000000000d'::uuid,
    'b1000000-0000-4000-8000-00000000000e'::uuid,
    'b1000000-0000-4000-8000-00000000000f'::uuid,
    'b1000000-0000-4000-8000-000000000010'::uuid,
    'b1000000-0000-4000-8000-000000000011'::uuid,
    'b1000000-0000-4000-8000-000000000012'::uuid,
    'b1000000-0000-4000-8000-000000000013'::uuid,
    'b1000000-0000-4000-8000-000000000014'::uuid,
    'b1000000-0000-4000-8000-000000000015'::uuid,
    'b1000000-0000-4000-8000-000000000016'::uuid,
    'b1000000-0000-4000-8000-000000000017'::uuid,
    'b1000000-0000-4000-8000-000000000018'::uuid
  ];

  v_all_game_ids uuid[];

  -- 18 venues — one per HK district (WGS84, Places-style coords)
  v_venue_ids uuid[] := array[
    'c1000000-0000-4000-8000-000000000001'::uuid, -- central_western
    'c1000000-0000-4000-8000-000000000002'::uuid, -- wan_chai
    'c1000000-0000-4000-8000-000000000003'::uuid, -- eastern
    'c1000000-0000-4000-8000-000000000004'::uuid, -- southern
    'c1000000-0000-4000-8000-000000000005'::uuid, -- yau_tsim_mong
    'c1000000-0000-4000-8000-000000000006'::uuid, -- sham_shui_po
    'c1000000-0000-4000-8000-000000000007'::uuid, -- kowloon_city
    'c1000000-0000-4000-8000-000000000008'::uuid, -- wong_tai_sin
    'c1000000-0000-4000-8000-000000000009'::uuid, -- kwun_tong
    'c1000000-0000-4000-8000-00000000000a'::uuid, -- kwai_tsing
    'c1000000-0000-4000-8000-00000000000b'::uuid, -- tsuen_wan
    'c1000000-0000-4000-8000-00000000000c'::uuid, -- tuen_mun
    'c1000000-0000-4000-8000-00000000000d'::uuid, -- yuen_long
    'c1000000-0000-4000-8000-00000000000e'::uuid, -- north
    'c1000000-0000-4000-8000-00000000000f'::uuid, -- tai_po
    'c1000000-0000-4000-8000-000000000010'::uuid, -- sha_tin
    'c1000000-0000-4000-8000-000000000011'::uuid, -- sai_kung
    'c1000000-0000-4000-8000-000000000012'::uuid  -- islands
  ];

  v_dm_1 uuid := 'd1000000-0000-4000-8000-000000000001';
  v_dm_2 uuid := 'd1000000-0000-4000-8000-000000000002';
  v_dm_3 uuid := 'd1000000-0000-4000-8000-000000000003';
  v_dm_4 uuid := 'd1000000-0000-4000-8000-000000000004';
  v_dm_5 uuid := 'd1000000-0000-4000-8000-000000000005';
  v_dm_ids uuid[] := array[
    'd1000000-0000-4000-8000-000000000001'::uuid,
    'd1000000-0000-4000-8000-000000000002'::uuid,
    'd1000000-0000-4000-8000-000000000003'::uuid,
    'd1000000-0000-4000-8000-000000000004'::uuid,
    'd1000000-0000-4000-8000-000000000005'::uuid
  ];

  v_basketball uuid;
  v_pickle uuid;
  v_badminton uuid;
  v_football uuid;
  v_volleyball uuid;
  v_tennis uuid;
  v_table_tennis uuid;
  v_pwd text := crypt('UatTest123!', gen_salt('bf'));
  r record;
  i int;
  v_gid uuid;
  v_host_u uuid;
  v_sport uuid;
  v_venue uuid;
  v_dist public.hk_district;
  v_lat double precision;
  v_lng double precision;
  v_base_lat double precision;
  v_base_lng double precision;
  v_title text;
  v_label text;
  v_day int;
  v_hour int;
  v_max int;
  v_cost numeric;
  v_room uuid;
  v_applicant uuid;
  v_hk_start timestamptz;
  v_slot int;
begin
  v_all_game_ids := array[
    v_game_open, v_game_full, v_game_done, v_game_soon,
    v_game_map_cluster, v_game_map_centroid
  ] || v_game_ids;

  v_hk_start := date_trunc('day', now() at time zone 'Asia/Hong_Kong')
    at time zone 'Asia/Hong_Kong';

  -- ---------- cleanup previous UAT ----------
  delete from public.reviews
  where game_id = any(v_all_game_ids)
     or reviewer_id = any(v_ids)
     or reviewee_id = any(v_ids);

  delete from public.applications
  where game_id = any(v_all_game_ids) or applicant_id = any(v_ids);

  delete from public.game_participants
  where game_id = any(v_all_game_ids) or user_id = any(v_ids);

  delete from public.messages
  where room_id in (
    select chat_room_id from public.games
    where id = any(v_all_game_ids) and chat_room_id is not null
  )
  or room_id = any(v_dm_ids)
  or sender_id = any(v_ids)
  or room_id in (select id from public.chat_rooms where title like 'UAT｜%');

  delete from public.chat_room_members
  where room_id in (
    select chat_room_id from public.games
    where id = any(v_all_game_ids) and chat_room_id is not null
  )
  or room_id = any(v_dm_ids)
  or user_id = any(v_ids);

  delete from public.chat_rooms
  where id in (
    select chat_room_id from public.games
    where id = any(v_all_game_ids) and chat_room_id is not null
  )
  or id = any(v_dm_ids)
  or title like 'UAT｜%';

  delete from public.games
  where id = any(v_all_game_ids)
     or host_id = any(v_ids)
     or title like 'UAT｜%';

  delete from public.venues where id = any(v_venue_ids);

  delete from public.user_sport_skills where user_id = any(v_ids);

  if to_regclass('public.smart_alerts') is not null then
    execute 'delete from public.smart_alerts where user_id = any($1)' using v_ids;
  end if;
  if to_regclass('public.notifications') is not null then
    execute 'delete from public.notifications where user_id = any($1)' using v_ids;
  end if;

  delete from public.friendships
  where requester_id = any(v_ids) or addressee_id = any(v_ids);

  delete from public.profiles where id = any(v_ids);
  delete from auth.identities where user_id = any(v_ids);
  delete from auth.users where id = any(v_ids);

  select id into v_basketball from public.sports where slug = 'basketball';
  select id into v_pickle from public.sports where slug = 'pickleball';
  select id into v_badminton from public.sports where slug = 'badminton';
  select id into v_football from public.sports where slug = 'football';
  select id into v_volleyball from public.sports where slug = 'volleyball';
  select id into v_tennis from public.sports where slug = 'tennis';
  select id into v_table_tennis from public.sports where slug = 'table_tennis';

  if v_basketball is null or v_pickle is null then
    raise exception 'sports seed missing — run init migration first';
  end if;

  -- ---------- auth users + profiles (10) ----------
  for r in
    select * from (values
      (v_host, 'host.uat@sportsshare.hk',    'UAT Host',  'yau_tsim_mong'::public.hk_district, 'male'::public.gender),
      (v_p1,   'player1.uat@sportsshare.hk', 'UAT 阿明',  'sham_shui_po'::public.hk_district,  'male'::public.gender),
      (v_p2,   'player2.uat@sportsshare.hk', 'UAT 小欣',  'sha_tin'::public.hk_district,       'female'::public.gender),
      (v_p3,   'player3.uat@sportsshare.hk', 'UAT 志強',  'kwun_tong'::public.hk_district,     'male'::public.gender),
      (v_p4,   'player4.uat@sportsshare.hk', 'UAT 佳琪',  'eastern'::public.hk_district,       'female'::public.gender),
      (v_p5,   'player5.uat@sportsshare.hk', 'UAT 詠珊',  'wan_chai'::public.hk_district,      'female'::public.gender),
      (v_p6,   'player6.uat@sportsshare.hk', 'UAT 家豪',  'tsuen_wan'::public.hk_district,     'male'::public.gender),
      (v_p7,   'player7.uat@sportsshare.hk', 'UAT 曉彤',  'tai_po'::public.hk_district,        'female'::public.gender),
      (v_p8,   'player8.uat@sportsshare.hk', 'UAT 俊傑',  'yuen_long'::public.hk_district,     'male'::public.gender),
      (v_p9,   'player9.uat@sportsshare.hk', 'UAT 詩婷',  'sai_kung'::public.hk_district,      'female'::public.gender)
    ) as t(id, email, nickname, district, gender)
  loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      r.id, 'authenticated', 'authenticated', r.email, v_pwd,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('nickname', r.nickname),
      now(), now(), '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) values (
      r.id, r.id,
      jsonb_build_object('sub', r.id::text, 'email', r.email, 'email_verified', true),
      'email', r.id::text, now(), now(), now()
    );

    insert into public.profiles (id, nickname, gender, district, bio)
    values (
      r.id, r.nickname, r.gender, r.district,
      'UAT seed account — password UatTest123!'
    )
    on conflict (id) do update set
      nickname = excluded.nickname,
      gender = excluded.gender,
      district = excluded.district,
      bio = excluded.bio;
  end loop;

  perform set_config('app.updating_reputation', 'true', true);
  update public.profiles set rating = 4.60, rating_count = 5,
    attendance_marked_count = 10, attendance_present_count = 9 where id = v_p1;
  update public.profiles set rating = 4.20, rating_count = 3,
    attendance_marked_count = 6, attendance_present_count = 5 where id = v_p2;
  update public.profiles set rating = 4.85, rating_count = 8,
    attendance_marked_count = 12, attendance_present_count = 12 where id = v_p5;
  update public.profiles set rating = 3.90, rating_count = 4,
    attendance_marked_count = 8, attendance_present_count = 6 where id = v_p6;
  perform set_config('app.updating_reputation', 'false', true);

  insert into public.user_sport_skills (user_id, sport_id, level) values
    (v_host, v_basketball, 'advanced'),
    (v_host, v_pickle, 'intermediate'),
    (v_host, v_football, 'intermediate'),
    (v_p1, v_basketball, 'intermediate'),
    (v_p1, v_badminton, 'beginner'),
    (v_p2, v_pickle, 'advanced'),
    (v_p2, v_volleyball, 'intermediate'),
    (v_p3, v_basketball, 'beginner'),
    (v_p3, v_volleyball, 'intermediate'),
    (v_p4, v_pickle, 'beginner'),
    (v_p4, v_tennis, 'intermediate'),
    (v_p5, v_badminton, 'advanced'),
    (v_p5, v_table_tennis, 'intermediate'),
    (v_p6, v_football, 'advanced'),
    (v_p6, v_basketball, 'intermediate'),
    (v_p7, v_volleyball, 'beginner'),
    (v_p7, v_pickle, 'intermediate'),
    (v_p8, v_tennis, 'advanced'),
    (v_p8, v_badminton, 'intermediate'),
    (v_p9, v_volleyball, 'beginner'),
    (v_p9, v_table_tennis, 'beginner')
  on conflict do nothing;

  -- ---------- venues (18 districts) ----------
  insert into public.venues (id, name_zh, name_en, district, address, lat, lng, venue_type, created_by)
  values
    (v_venue_ids[1],  '中山紀念公園',       'Sun Yat Sen Memorial Park',   'central_western', '西營盤東邊街北',   22.289983, 114.145401, 'public', v_host),
    (v_venue_ids[2],  '修頓球場',           'Southorn Playground',         'wan_chai',        '灣仔莊士敦道',     22.277222, 114.173611, 'public', v_host),
    (v_venue_ids[3],  '柴灣公園',           'Chai Wan Park',               'eastern',         '柴灣道',           22.264722, 114.241944, 'public', v_p4),
    (v_venue_ids[4],  '香港仔運動場',       'Aberdeen Sports Ground',      'southern',        '香港仔黃竹坑道',   22.248611, 114.155833, 'public', v_host),
    (v_venue_ids[5],  '麥花臣場館',         'MacPherson Stadium',          'yau_tsim_mong',   '旺角梭椏道',       22.319986, 114.172562, 'public', v_host),
    (v_venue_ids[6],  '石硤尾公園',         'Shek Kip Mei Park',           'sham_shui_po',    '南昌街',           22.337500, 114.168056, 'public', v_p1),
    (v_venue_ids[7],  '摩士公園',           'Morse Park',                  'kowloon_city',    '衙前圍道',         22.325833, 114.189722, 'public', v_p3),
    (v_venue_ids[8],  '摩士公園(黃大仙)',   'Morse Park (Wong Tai Sin)',   'wong_tai_sin',    '鳳德道',           22.339722, 114.191944, 'public', v_p3),
    (v_venue_ids[9],  '觀塘海濱花園',       'Kwun Tong Promenade',         'kwun_tong',       '觀塘海濱道',       22.307222, 114.215833, 'public', v_p3),
    (v_venue_ids[10], '葵涌運動場',         'Kwai Chung Sports Ground',    'kwai_tsing',      '葵涌興芳路',       22.357222, 114.134722, 'public', v_p6),
    (v_venue_ids[11], '荃灣公園',           'Tsuen Wan Park',              'tsuen_wan',       '荃灣永順街',       22.370278, 114.112778, 'public', v_p6),
    (v_venue_ids[12], '屯門鄧肇堅運動場',   'Tang Shiu Kin Sports Ground', 'tuen_mun',        '屯門海皇路',       22.391667, 113.975833, 'public', v_p6),
    (v_venue_ids[13], '元朗劇院',           'Yuen Long Theatre',           'yuen_long',       '元朗安樂路',       22.445833, 114.022778, 'public', v_p8),
    (v_venue_ids[14], '上水運動場',         'Sheung Shui Sports Ground',   'north',           '上水新成路',       22.501389, 114.126111, 'public', v_p7),
    (v_venue_ids[15], '大埔運動場',         'Tai Po Sports Ground',        'tai_po',          '大埔運動路',       22.451111, 114.175000, 'public', v_p7),
    (v_venue_ids[16], '沙田公園',           'Sha Tin Park',                'sha_tin',         '沙田正街',         22.381389, 114.189722, 'public', v_p2),
    (v_venue_ids[17], '西貢足球場',         'Sai Kung Football Pitch',     'sai_kung',        '西貢宜春街',       22.381111, 114.270833, 'public', v_p9),
    (v_venue_ids[18], '長洲政府綜合大樓',   'Cheung Chau Complex',         'islands',         '長洲興隆後街',     22.207222, 114.029167, 'public', v_p9);

  -- ========== scenario games (4) — map-visible where open/full ==========
  insert into public.games (
    id, host_id, sport_id, venue_id, venue_label, district, lat, lng,
    starts_at, ends_at, max_players, current_players, total_cost_hkd,
    cost_split_mode, min_skill, title, description, status
  ) values (
    v_game_open, v_host, v_basketball, v_venue_ids[5], '麥花臣場館',
    'yau_tsim_mong', 22.319986, 114.172562,
    v_hk_start + interval '1 day' + interval '19 hours',
    v_hk_start + interval '1 day' + interval '21 hours',
    8, 1, 400, 'all_players', 'beginner',
    'UAT｜旺角籃球夜場', 'Map pin: 麥花臣場館 — open，可測申請。', 'open'
  );

  insert into public.games (
    id, host_id, sport_id, venue_id, venue_label, district, lat, lng,
    starts_at, ends_at, max_players, current_players, total_cost_hkd,
    cost_split_mode, title, description, status
  ) values (
    v_game_full, v_host, v_pickle, v_venue_ids[1], '中山紀念公園',
    'central_western', 22.289983, 114.145401,
    v_hk_start + interval '2 days' + interval '10 hours',
    v_hk_start + interval '2 days' + interval '12 hours',
    4, 1, 200, 'all_players',
    'UAT｜港島匹克球（已滿）', 'Map pin: 中山紀念公園 — full + waitlist。', 'open'
  );

  insert into public.applications (game_id, applicant_id, message, status) values
    (v_game_full, v_p1, '想打進階局', 'pending'),
    (v_game_full, v_p2, '準時到', 'pending'),
    (v_game_full, v_p3, '第一次打', 'pending');
  update public.applications set status = 'accepted'
    where game_id = v_game_full and applicant_id in (v_p1, v_p2, v_p3);
  update public.games set status = 'full', current_players = 4 where id = v_game_full;
  insert into public.applications (game_id, applicant_id, message, status, waitlisted_at)
  values (v_game_full, v_p4, '可以候補', 'waitlisted', now());

  insert into public.applications (game_id, applicant_id, message, status)
  values (v_game_open, v_p1, '有球鞋，水平中階', 'pending');

  insert into public.games (
    id, host_id, sport_id, venue_id, venue_label, district, lat, lng,
    starts_at, ends_at, max_players, current_players, total_cost_hkd,
    cost_split_mode, title, description, status
  ) values (
    v_game_done, v_host, v_badminton, v_venue_ids[16], '沙田公園',
    'sha_tin', 22.381389, 114.189722,
    now() - interval '2 days',
    now() - interval '2 days' + interval '2 hours',
    4, 1, 160, 'all_players',
    'UAT｜沙田羽毛球（已完成）', 'Past — 不顯示於地圖。', 'open'
  );
  insert into public.applications (game_id, applicant_id, message, status) values
    (v_game_done, v_p1, null, 'pending'),
    (v_game_done, v_p2, null, 'pending');
  update public.applications set status = 'accepted'
    where game_id = v_game_done and applicant_id in (v_p1, v_p2);
  update public.games set status = 'completed', current_players = 3 where id = v_game_done;

  alter table public.game_participants disable trigger game_participants_validate_attendance;
  update public.game_participants
  set attendance_status = 'present', attendance_marked_by = v_host, attendance_marked_at = now()
  where game_id = v_game_done and user_id = v_p1;
  update public.game_participants
  set attendance_status = 'no_show', attendance_marked_by = v_host, attendance_marked_at = now()
  where game_id = v_game_done and user_id = v_p2;
  alter table public.game_participants enable trigger game_participants_validate_attendance;

  alter table public.reviews disable trigger reviews_validate;
  insert into public.reviews (game_id, reviewer_id, reviewee_id, rating, comment) values
    (v_game_done, v_host, v_p1, 5, '準時又好溝通，UAT 好評。'),
    (v_game_done, v_p1, v_p2, 3, '這場缺席，給中評作示範。')
  on conflict do nothing;
  alter table public.reviews enable trigger reviews_validate;

  insert into public.games (
    id, host_id, sport_id, venue_id, venue_label, district, lat, lng,
    starts_at, ends_at, max_players, total_cost_hkd, cost_split_mode,
    title, description, status
  ) values (
    v_game_soon, v_p2, v_volleyball, v_venue_ids[16], '沙田公園',
    'sha_tin', 22.382200, 114.190500,
    v_hk_start + interval '3 days' + interval '15 hours',
    v_hk_start + interval '3 days' + interval '17 hours',
    10, 0, 'all_players',
    'UAT｜沙田排球新手局', 'Map pin: 沙田公園 — 免費新手局。', 'open'
  );

  -- ========== map-specific scenarios (2) ==========
  insert into public.games (
    id, host_id, sport_id, venue_id, venue_label, district, lat, lng,
    starts_at, ends_at, max_players, total_cost_hkd, cost_split_mode,
    min_skill, title, description, status
  ) values (
    v_game_map_cluster, v_p5, v_tennis, v_venue_ids[2], '修頓球場',
    'wan_chai', 22.277222, 114.173611,
    v_hk_start + interval '1 day' + interval '8 hours',
    v_hk_start + interval '1 day' + interval '10 hours',
    4, 320, 'joiners_only', 'intermediate',
    'UAT｜灣仔網球早場', 'Map: 港島核心 — 場主免夾示範。', 'open'
  );

  insert into public.games (
    id, host_id, sport_id, venue_id, venue_label, district, lat, lng,
    starts_at, ends_at, max_players, total_cost_hkd, cost_split_mode,
    title, description, status
  ) values (
    v_game_map_centroid, v_p1, v_basketball, null, '深水埗體育館（僅地區）',
    'sham_shui_po', null, null,
    v_hk_start + interval '4 days' + interval '18 hours',
    v_hk_start + interval '4 days' + interval '20 hours',
    6, 240, 'all_players',
    'UAT｜深水埗籃球（無座標）', 'Map fallback: 使用地區中心點 sham_shui_po。', 'open'
  );

  -- ========== bulk games (20) — rotate 18 districts + coordinate jitter ==========
  for i in 1..20 loop
    v_gid := v_game_ids[i];
    v_day := 1 + ((i - 1) % 14);
    v_hour := 8 + ((i * 3) % 12);
    v_max := case when i % 5 = 0 then 12 when i % 3 = 0 then 6 else 8 end;
    v_cost := case when i % 4 = 0 then 0 else (80 + (i * 20))::numeric end;
    v_slot := (i - 1) % 18;

    case v_slot
      when 0 then
        v_host_u := v_host; v_sport := v_basketball; v_venue := v_venue_ids[1];
        v_dist := 'central_western'; v_base_lat := 22.289983; v_base_lng := 114.145401;
        v_label := '中山紀念公園'; v_title := 'UAT｜中西區籃球 #' || i;
      when 1 then
        v_host_u := v_p5; v_sport := v_tennis; v_venue := v_venue_ids[2];
        v_dist := 'wan_chai'; v_base_lat := 22.277222; v_base_lng := 114.173611;
        v_label := '修頓球場'; v_title := 'UAT｜灣仔網球 #' || i;
      when 2 then
        v_host_u := v_p4; v_sport := v_football; v_venue := v_venue_ids[3];
        v_dist := 'eastern'; v_base_lat := 22.264722; v_base_lng := 114.241944;
        v_label := '柴灣公園'; v_title := 'UAT｜東區足球 #' || i;
      when 3 then
        v_host_u := v_host; v_sport := v_volleyball; v_venue := v_venue_ids[4];
        v_dist := 'southern'; v_base_lat := 22.248611; v_base_lng := 114.155833;
        v_label := '香港仔運動場'; v_title := 'UAT｜南區排球 #' || i;
      when 4 then
        v_host_u := v_host; v_sport := v_basketball; v_venue := v_venue_ids[5];
        v_dist := 'yau_tsim_mong'; v_base_lat := 22.319986; v_base_lng := 114.172562;
        v_label := '麥花臣場館'; v_title := 'UAT｜油尖旺籃球 #' || i;
      when 5 then
        v_host_u := v_p1; v_sport := v_badminton; v_venue := v_venue_ids[6];
        v_dist := 'sham_shui_po'; v_base_lat := 22.337500; v_base_lng := 114.168056;
        v_label := '石硤尾公園'; v_title := 'UAT｜深水埗羽球 #' || i;
      when 6 then
        v_host_u := v_p3; v_sport := v_football; v_venue := v_venue_ids[7];
        v_dist := 'kowloon_city'; v_base_lat := 22.325833; v_base_lng := 114.189722;
        v_label := '摩士公園'; v_title := 'UAT｜九龍城足球 #' || i;
      when 7 then
        v_host_u := v_p3; v_sport := v_basketball; v_venue := v_venue_ids[8];
        v_dist := 'wong_tai_sin'; v_base_lat := 22.339722; v_base_lng := 114.191944;
        v_label := '摩士公園(黃大仙)'; v_title := 'UAT｜黃大仙籃球 #' || i;
      when 8 then
        v_host_u := v_p3; v_sport := v_volleyball; v_venue := v_venue_ids[9];
        v_dist := 'kwun_tong'; v_base_lat := 22.307222; v_base_lng := 114.215833;
        v_label := '觀塘海濱花園'; v_title := 'UAT｜觀塘排球 #' || i;
      when 9 then
        v_host_u := v_p6; v_sport := v_table_tennis; v_venue := v_venue_ids[10];
        v_dist := 'kwai_tsing'; v_base_lat := 22.357222; v_base_lng := 114.134722;
        v_label := '葵涌運動場'; v_title := 'UAT｜葵青乒乓 #' || i;
      when 10 then
        v_host_u := v_p6; v_sport := v_football; v_venue := v_venue_ids[11];
        v_dist := 'tsuen_wan'; v_base_lat := 22.370278; v_base_lng := 114.112778;
        v_label := '荃灣公園'; v_title := 'UAT｜荃灣足球 #' || i;
      when 11 then
        v_host_u := v_p6; v_sport := v_basketball; v_venue := v_venue_ids[12];
        v_dist := 'tuen_mun'; v_base_lat := 22.391667; v_base_lng := 113.975833;
        v_label := '屯門鄧肇堅運動場'; v_title := 'UAT｜屯門籃球 #' || i;
      when 12 then
        v_host_u := v_p8; v_sport := v_tennis; v_venue := v_venue_ids[13];
        v_dist := 'yuen_long'; v_base_lat := 22.445833; v_base_lng := 114.022778;
        v_label := '元朗劇院'; v_title := 'UAT｜元朗網球 #' || i;
      when 13 then
        v_host_u := v_p7; v_sport := v_volleyball; v_venue := v_venue_ids[14];
        v_dist := 'north'; v_base_lat := 22.501389; v_base_lng := 114.126111;
        v_label := '上水運動場'; v_title := 'UAT｜北區排球 #' || i;
      when 14 then
        v_host_u := v_p7; v_sport := v_table_tennis; v_venue := v_venue_ids[15];
        v_dist := 'tai_po'; v_base_lat := 22.451111; v_base_lng := 114.175000;
        v_label := '大埔運動場'; v_title := 'UAT｜大埔乒乓 #' || i;
      when 15 then
        v_host_u := v_p2; v_sport := v_pickle; v_venue := v_venue_ids[16];
        v_dist := 'sha_tin'; v_base_lat := 22.381389; v_base_lng := 114.189722;
        v_label := '沙田公園'; v_title := 'UAT｜沙田匹克 #' || i;
      when 16 then
        v_host_u := v_p9; v_sport := v_volleyball; v_venue := v_venue_ids[17];
        v_dist := 'sai_kung'; v_base_lat := 22.381111; v_base_lng := 114.270833;
        v_label := '西貢足球場'; v_title := 'UAT｜西貢排球 #' || i;
      else
        v_host_u := v_p9; v_sport := v_football; v_venue := v_venue_ids[18];
        v_dist := 'islands'; v_base_lat := 22.207222; v_base_lng := 114.029167;
        v_label := '長洲政府綜合大樓'; v_title := 'UAT｜離島足球 #' || i;
    end case;

    -- Spread pins near the same venue so map markers don't fully overlap
    v_lat := v_base_lat + ((i % 5) - 2) * 0.0018;
    v_lng := v_base_lng + ((i % 7) - 3) * 0.0018;

    insert into public.games (
      id, host_id, sport_id, venue_id, venue_label, district, lat, lng,
      starts_at, ends_at, max_players, total_cost_hkd, cost_split_mode,
      min_skill, title, description, status
    ) values (
      v_gid, v_host_u, v_sport, v_venue, v_label, v_dist, v_lat, v_lng,
      v_hk_start + (v_day || ' days')::interval + (v_hour || ' hours')::interval,
      v_hk_start + (v_day || ' days')::interval + ((v_hour + 2) || ' hours')::interval,
      v_max, v_cost, case when i % 6 = 0 then 'joiners_only'::public.cost_split_mode else 'all_players'::public.cost_split_mode end,
      case when i % 3 = 0 then 'intermediate'::public.skill_level else 'beginner'::public.skill_level end,
      v_title,
      'UAT bulk #' || i || ' — 18區地圖分佈 + 座標 jitter。',
      case when i = 18 then 'cancelled'::public.game_status when i = 20 then 'full'::public.game_status else 'open'::public.game_status end
    );

    if i = 20 then
      update public.games set current_players = v_max where id = v_gid;
    end if;

    -- Skip cancelled (18) and pre-filled full (20) games — accept trigger rejects when roster is full
    if i % 2 = 0 and i not in (18, 20) then
      v_applicant := v_ids[1 + ((i + 2) % 10)];
      if v_applicant <> v_host_u then
        insert into public.applications (game_id, applicant_id, message, status)
        values (v_gid, v_applicant, 'UAT 想加入 #' || i, 'pending');
        if i % 4 = 0 then
          update public.applications
          set status = 'accepted'
          where game_id = v_gid and applicant_id = v_applicant;
        end if;
      end if;
    end if;
  end loop;

  -- past completed sample (not on map)
  update public.games
  set status = 'completed',
      title = 'UAT｜已完成足球夜場',
      description = 'Past bulk sample — 不顯示於地圖。',
      starts_at = now() - interval '5 days',
      ends_at = now() - interval '5 days' + interval '2 hours'
  where id = v_game_ids[17];

  -- ========== friendships ==========
  insert into public.friendships (requester_id, addressee_id, status) values
    (v_p1, v_p2, 'accepted'),
    (v_p1, v_host, 'accepted'),
    (v_p2, v_p5, 'accepted'),
    (v_p3, v_p6, 'accepted'),
    (v_p4, v_p7, 'accepted'),
    (v_p5, v_p9, 'accepted'),
    (v_p8, v_p1, 'pending'),
    (v_p9, v_p3, 'pending')
  on conflict do nothing;

  -- ========== direct chats + messages ==========
  insert into public.chat_rooms (id, type, title) values
    (v_dm_1, 'direct', null),
    (v_dm_2, 'direct', null),
    (v_dm_3, 'direct', null),
    (v_dm_4, 'direct', null),
    (v_dm_5, 'direct', null);

  insert into public.chat_room_members (room_id, user_id, role) values
    (v_dm_1, v_p1, 'member'), (v_dm_1, v_p2, 'member'),
    (v_dm_2, v_p1, 'member'), (v_dm_2, v_host, 'member'),
    (v_dm_3, v_p2, 'member'), (v_dm_3, v_p5, 'member'),
    (v_dm_4, v_p3, 'member'), (v_dm_4, v_p6, 'member'),
    (v_dm_5, v_p5, 'member'), (v_dm_5, v_p9, 'member');

  insert into public.messages (room_id, sender_id, type, content, created_at) values
    (v_dm_1, v_p1, 'text', '喂，週末有冇空打籃球？', now() - interval '2 days'),
    (v_dm_1, v_p2, 'text', '有呀，你開場我入嚟。', now() - interval '2 days' + interval '5 minutes'),
    (v_dm_1, v_p1, 'text', 'OK，我開咗「旺角籃球夜場」。', now() - interval '1 day'),
    (v_dm_1, v_p2, 'text', '收到，準時到！', now() - interval '1 day' + interval '20 minutes'),
    (v_dm_2, v_p1, 'text', 'Host 你好，匹克那場仲有位嗎？', now() - interval '12 hours'),
    (v_dm_2, v_host, 'text', '已滿，可以候補。', now() - interval '11 hours'),
    (v_dm_2, v_p1, 'text', '好，我叫朋友候補。', now() - interval '10 hours'),
    (v_dm_3, v_p5, 'text', '小欣，羽球想一齊去嗎？', now() - interval '8 hours'),
    (v_dm_3, v_p2, 'text', '想！你開定我入？', now() - interval '7 hours'),
    (v_dm_3, v_p5, 'text', '我開咗灣仔那場，你入嚟啦。', now() - interval '6 hours'),
    (v_dm_4, v_p3, 'text', '家豪，荃灣足球幾點集合？', now() - interval '4 hours'),
    (v_dm_4, v_p6, 'text', '7:45 場外見，記得帶球靴。', now() - interval '3 hours'),
    (v_dm_4, v_p3, 'text', '得，我帶水。', now() - interval '2 hours'),
    (v_dm_5, v_p9, 'text', '詠珊，西貢排球有冇新手友好？', now() - interval '90 minutes'),
    (v_dm_5, v_p5, 'text', '有，教練會帶一開始。', now() - interval '60 minutes'),
    (v_dm_5, v_p9, 'text', '太好了，我申請入。', now() - interval '30 minutes');

  select chat_room_id into v_room from public.games where id = v_game_open;
  if v_room is not null then
    insert into public.messages (room_id, sender_id, type, content, created_at) values
      (v_room, v_host, 'text', '大家好，夜晚 7 點場外集合。', now() - interval '6 hours'),
      (v_room, v_host, 'text', '有波鞋同水就得。', now() - interval '5 hours');
  end if;

  select chat_room_id into v_room from public.games where id = v_game_full;
  if v_room is not null then
    insert into public.messages (room_id, sender_id, type, content, created_at) values
      (v_room, v_host, 'text', '這場已滿，候補請等通知。', now() - interval '1 day'),
      (v_room, v_p1, 'text', '收到，準時到。', now() - interval '20 hours'),
      (v_room, v_p2, 'text', '我會帶球。', now() - interval '18 hours');
  end if;

  select chat_room_id into v_room from public.games where id = v_game_soon;
  if v_room is not null then
    insert into public.messages (room_id, sender_id, type, content, created_at) values
      (v_room, v_p2, 'text', '新手局免費，歡迎第一次玩排球。', now() - interval '3 hours');
  end if;

  select chat_room_id into v_room from public.games where id = v_game_map_cluster;
  if v_room is not null then
    insert into public.messages (room_id, sender_id, type, content, created_at) values
      (v_room, v_p5, 'text', '修頓球場早場，場主免夾。', now() - interval '2 hours');
  end if;

  select chat_room_id into v_room from public.games where id = v_game_ids[3];
  if v_room is not null then
    insert into public.messages (room_id, sender_id, type, content, created_at) values
      (v_room, v_p4, 'text', '柴灣足球，請自備球靴。', now() - interval '2 hours'),
      (v_room, v_p4, 'text', '遲到超過 15 分鐘會讓位。', now() - interval '90 minutes');
  end if;

  if to_regclass('public.smart_alerts') is not null then
    insert into public.smart_alerts (user_id, district, sport_id, is_active) values
      (v_p1, 'yau_tsim_mong', v_basketball, true),
      (v_p4, 'central_western', v_pickle, true),
      (v_p5, 'wan_chai', v_badminton, true),
      (v_p7, 'tai_po', v_table_tennis, true);
  end if;

  raise notice 'UAT seed complete: 10 users, 18 venues, 26 games (~23 map-visible). Login *.uat@sportsshare.hk / UatTest123!';
end $$;
