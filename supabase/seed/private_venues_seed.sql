-- =============================================================================
-- Private venues seed — SportsShare HK venue directory (UAT / demo)
-- Run in Supabase SQL Editor AFTER migration 20260903000001_private_venues.sql
-- Safe to re-run (deletes fixed UUID rows first).
-- =============================================================================

delete from public.private_venues
where id in (
  'e1000000-0000-4000-8000-000000000001',
  'e1000000-0000-4000-8000-000000000002',
  'e1000000-0000-4000-8000-000000000003',
  'e1000000-0000-4000-8000-000000000004',
  'e1000000-0000-4000-8000-000000000005',
  'e1000000-0000-4000-8000-000000000006',
  'e1000000-0000-4000-8000-000000000007',
  'e1000000-0000-4000-8000-000000000008',
  'e1000000-0000-4000-8000-000000000009',
  'e1000000-0000-4000-8000-00000000000a',
  'e1000000-0000-4000-8000-00000000000b',
  'e1000000-0000-4000-8000-00000000000c',
  'e1000000-0000-4000-8000-00000000000d',
  'e1000000-0000-4000-8000-00000000000e',
  'e1000000-0000-4000-8000-00000000000f',
  'e1000000-0000-4000-8000-000000000010',
  'e1000000-0000-4000-8000-000000000011',
  'e1000000-0000-4000-8000-000000000012',
  'e1000000-0000-4000-8000-000000000013',
  'e1000000-0000-4000-8000-000000000014',
  'e1000000-0000-4000-8000-000000000015',
  'e1000000-0000-4000-8000-000000000016',
  'e1000000-0000-4000-8000-000000000017',
  'e1000000-0000-4000-8000-000000000018',
  'e1000000-0000-4000-8000-000000000019',
  'e1000000-0000-4000-8000-00000000001a',
  'e1000000-0000-4000-8000-00000000001b',
  'e1000000-0000-4000-8000-00000000001c',
  'e1000000-0000-4000-8000-00000000001d',
  'e1000000-0000-4000-8000-00000000001e'
);

insert into public.private_venues (
  id, name, description, sport_types, district, address,
  lat, lng, facilities, images, booking_link, status
) values
(
  'e1000000-0000-4000-8000-000000000001',
  '飛羽羽毛球中心（旺角）',
  '12 片標準羽球場，木地板及專業照明。平日早上有學員優惠，適合球會及拼場包場。',
  array['羽毛球'],
  'yau_tsim_mong',
  '旺角奶路臣街 88 號 8 樓',
  22.3194, 114.1703,
  array['冷氣', '更衣室', '淋浴', '飲水機'],
  array['https://picsum.photos/seed/pv-badminton-1/800/500'],
  'https://wa.me/85291234567',
  'active'
),
(
  'e1000000-0000-4000-8000-000000000002',
  'ACE 乒乓球會（觀塘）',
  '港九東區人氣乒乓館，提供球拍及乒乓球租借，可單次租枱或包場。',
  array['乒乓球'],
  'kwun_tong',
  '觀塘成業街 15 號 7 樓',
  22.3105, 114.2262,
  array['冷氣', '器材租借', '飲水機'],
  array['https://picsum.photos/seed/pv-tt-1/800/500'],
  'tel:+85223456789',
  'active'
),
(
  'e1000000-0000-4000-8000-000000000003',
  'Pickle Park 匹克球場（沙田）',
  '新界首間室內匹克球專場，4 個標準球場。新手友善，提供試打體驗。',
  array['匹克球', '網球'],
  'sha_tin',
  '沙田石門安群街 3 號',
  22.3878, 114.2083,
  array['冷氣', '更衣室', '停車場', '觀眾席'],
  array['https://picsum.photos/seed/pv-pickle-1/800/500'],
  'https://picklepark-hk.example/book',
  'active'
),
(
  'e1000000-0000-4000-8000-000000000004',
  '港島籃球館（灣仔）',
  '全港島少數 indoor 硬地籃球場，可租半場／全場。適合 3v3 及 5v5 拼場。',
  array['籃球'],
  'wan_chai',
  '灣仔軒尼詩道 200 號 3 樓',
  22.2778, 114.1730,
  array['冷氣', '更衣室', '淋浴'],
  array['https://picsum.photos/seed/pv-basketball-1/800/500'],
  'https://hkhoops.example/reserve',
  'active'
),
(
  'e1000000-0000-4000-8000-000000000005',
  '東區網球會（柴灣）',
  '2 個室外硬地網球場 + 1 個有蓋練習場。黃昏及週末時段較熱門，建議提早預約。',
  array['網球'],
  'eastern',
  '柴灣祥利街 10 號',
  22.2645, 114.2410,
  array['飲水機', '更衣室', '停車場'],
  array['https://picsum.photos/seed/pv-tennis-1/800/500'],
  'tel:+85229876543',
  'active'
),
(
  'e1000000-0000-4000-8000-000000000006',
  '南區七人足球場（香港仔）',
  '人工草七人足球場，黃昏有 LED 照明。可包場或按小時計，適合公司球隊。',
  array['足球'],
  'southern',
  '香港仔田灣街 33 號',
  22.2480, 114.1565,
  array['更衣室', '淋浴', '停車場', '觀眾席'],
  array['https://picsum.photos/seed/pv-soccer-1/800/500'],
  'https://southside-pitch.example/book',
  'active'
),
(
  'e1000000-0000-4000-8000-000000000007',
  '荃灣排球體育館',
  '3 個標準排球場，可改劃羽毛球場。週末常有女子排球聯賽，歡迎拼場。',
  array['排球', '羽毛球'],
  'tsuen_wan',
  '荃灣青山公路 388 號',
  22.3705, 114.1138,
  array['冷氣', '更衣室', '飲水機', '器材租借'],
  array['https://picsum.photos/seed/pv-volley-1/800/500'],
  'https://tw-volley.example/reserve',
  'active'
),
(
  'e1000000-0000-4000-8000-000000000008',
  '元朗綜合運動中心',
  '多用途運動場：籃球、羽毛球、乒乓球皆有。新裝修，設有家長休息區。',
  array['籃球', '羽毛球', '乒乓球'],
  'yuen_long',
  '元朗鳳翔路 28 號',
  22.4452, 114.0225,
  array['冷氣', '更衣室', '停車場', '飲水機'],
  array['https://picsum.photos/seed/pv-yuenlong-1/800/500'],
  'tel:+85224781234',
  'active'
),
(
  'e1000000-0000-4000-8000-000000000009',
  '大埔羽毛球會',
  '8 片羽球場，鄰近大埔墟站。設有專業穿線服務及運動用品小賣部。',
  array['羽毛球'],
  'tai_po',
  '大埔安慈路 5 號 2 樓',
  22.4510, 114.1745,
  array['冷氣', '更衣室', '淋浴', '器材租借'],
  array['https://picsum.photos/seed/pv-taipo-1/800/500'],
  'https://taipo-badminton.example/book',
  'active'
),
(
  'e1000000-0000-4000-8000-00000000000a',
  '屯門室內足球場',
  '5 人及 7 人足球場各一，人工草皮。冷氣候，夏天亦適合。',
  array['足球'],
  'tuen_mun',
  '屯門震寰路 9 號',
  22.3912, 113.9768,
  array['冷氣', '更衣室', '淋浴', '停車場'],
  array['https://picsum.photos/seed/pv-tuenmun-1/800/500'],
  'https://tm-soccer.example/reserve',
  'active'
),
(
  'e1000000-0000-4000-8000-00000000000b',
  '西貢匹克球及網球場',
  '近西貢市中心，戶外匹克球 2 場 + 網球 1 場。週末家庭客多，景色開揚。',
  array['匹克球', '網球'],
  'sai_kung',
  '西貢親民街 16 號',
  22.3815, 114.2710,
  array['飲水機', '停車場', '觀眾席'],
  array['https://picsum.photos/seed/pv-saikung-1/800/500'],
  'https://sk-courts.example/book',
  'active'
),
(
  'e1000000-0000-4000-8000-00000000000c',
  '深水埗乒乓球中心',
  '24 張球枱，適合訓練及比賽。設有教練駐場，可預約陪打。',
  array['乒乓球'],
  'sham_shui_po',
  '深水埗長沙灣道 201 號 5 樓',
  22.3378, 114.1585,
  array['冷氣', '飲水機', '器材租借'],
  array['https://picsum.photos/seed/pv-ssp-1/800/500'],
  'tel:+85223654321',
  'active'
),
(
  'e1000000-0000-4000-8000-00000000000d',
  '葵青多功能體育館',
  '可租籃球場或排球場，適合公司運動會。平日有學校時段，晚上開放公眾。',
  array['籃球', '排球'],
  'kwai_tsing',
  '葵涌興芳路 223 號',
  22.3575, 114.1352,
  array['冷氣', '更衣室', '停車場', '觀眾席'],
  array['https://picsum.photos/seed/pv-kwaitsing-1/800/500'],
  'https://kc-sports.example/reserve',
  'active'
),
(
  'e1000000-0000-4000-8000-00000000000e',
  '上水運動綜合中心（試業）',
  '新場試業中，暫時只開放羽毛球及乒乓球。正式開幕後會加設匹克球場。',
  array['羽毛球', '乒乓球'],
  'north',
  '上水新成路 38 號',
  22.5010, 114.1265,
  array['冷氣', '更衣室', '飲水機'],
  array['https://picsum.photos/seed/pv-north-1/800/500'],
  null,
  'inactive'
),
(
  'e1000000-0000-4000-8000-00000000000f',
  '長洲海濱運動場',
  '離島特色場地，足球及排球為主。需乘渡輪前往，適合週末一日遊拼場。',
  array['足球', '排球'],
  'islands',
  '長洲東灣道 12 號',
  22.2075, 114.0295,
  array['更衣室', '飲水機', '觀眾席'],
  array['https://picsum.photos/seed/pv-islands-1/800/500'],
  'https://cheung-chau-sports.example/book',
  'active'
),
-- ========== batch 2 (+15) — 每種運動再加 2–3 個場館 ==========
(
  'e1000000-0000-4000-8000-000000000010',
  '中環 Indoor 籃球場',
  '中環商廈上層 indoor 全場，適合收工後 5v5。提供計分板及球價租借。',
  array['籃球'],
  'central_western',
  '中環德輔道中 99 號 16 樓',
  22.2819, 114.1582,
  array['冷氣', '更衣室', '淋浴', '器材租借'],
  array['https://picsum.photos/seed/pv-basketball-2/800/500'],
  'https://central-hoops.example/book',
  'active'
),
(
  'e1000000-0000-4000-8000-000000000011',
  '九龍城 Hoops Lab',
  '3v3 及 half court 訓練為主，牆面有戰術白板。適合青年隊及拼場。',
  array['籃球'],
  'kowloon_city',
  '九龍城賈炳達道 128 號',
  22.3268, 114.1895,
  array['冷氣', '飲水機', '器材租借'],
  array['https://picsum.photos/seed/pv-basketball-3/800/500'],
  'tel:+85227112233',
  'active'
),
(
  'e1000000-0000-4000-8000-000000000012',
  '黃大仙 Sky Court 籃球中心',
  '新裝修硬地全場，週末有 3v3 聯賽。可單次入場或包場。',
  array['籃球'],
  'wong_tai_sin',
  '黃大仙龍翔道 136 號 2 樓',
  22.3402, 114.1938,
  array['冷氣', '更衣室', '停車場'],
  array['https://picsum.photos/seed/pv-basketball-4/800/500'],
  'https://skycourt-hk.example/reserve',
  'active'
),
(
  'e1000000-0000-4000-8000-000000000013',
  '銅鑼灣羽球薈',
  '港島區 10 片羽球場，交通方便。設有運動按摩及用品店。',
  array['羽毛球'],
  'wan_chai',
  '銅鑼灣軒尼詩道 505 號 10 樓',
  22.2805, 114.1828,
  array['冷氣', '更衣室', '淋浴', '器材租借'],
  array['https://picsum.photos/seed/pv-badminton-2/800/500'],
  'https://causeway-badminton.example/book',
  'active'
),
(
  'e1000000-0000-4000-8000-000000000014',
  '將軍澳飛羽館',
  '將軍澳區最大室內羽球場，16 片場。設有親子時段及新手班。',
  array['羽毛球'],
  'sai_kung',
  '將軍澳唐俊街 28 號',
  22.3078, 114.2595,
  array['冷氣', '更衣室', '停車場', '飲水機'],
  array['https://picsum.photos/seed/pv-badminton-3/800/500'],
  'tel:+85227001122',
  'active'
),
(
  'e1000000-0000-4000-8000-000000000015',
  '北角羽毛球訓練中心',
  '以教學及拼場並重，教練可預約場地。平日早上學生優惠。',
  array['羽毛球'],
  'eastern',
  '北角英皇道 633 號 7 樓',
  22.2912, 114.2005,
  array['冷氣', '更衣室', '飲水機'],
  array['https://picsum.photos/seed/pv-badminton-4/800/500'],
  'https://northpoint-badminton.example/book',
  'active'
),
(
  'e1000000-0000-4000-8000-000000000016',
  '尖沙咀 Spin 乒乓球館',
  '九龍核心區乒乓館，鄰近港鐵站。設有 VIP 包廂及比賽用球枱。',
  array['乒乓球'],
  'yau_tsim_mong',
  '尖沙咀加連威老道 38 號 4 樓',
  22.2985, 114.1742,
  array['冷氣', '器材租借', '飲水機'],
  array['https://picsum.photos/seed/pv-tt-2/800/500'],
  'https://tsim-sha-tsui-tt.example/book',
  'active'
),
(
  'e1000000-0000-4000-8000-000000000017',
  '沙田 Table Tennis Club',
  '18 張球枱，週末有業餘聯賽。可預約教練陪練。',
  array['乒乓球'],
  'sha_tin',
  '沙田第一城置富第一城 2 期',
  22.3825, 114.2032,
  array['冷氣', '更衣室', '器材租借'],
  array['https://picsum.photos/seed/pv-tt-3/800/500'],
  'tel:+85226003344',
  'active'
),
(
  'e1000000-0000-4000-8000-000000000018',
  '灣仔 Pickle Hub',
  '港島 indoor 匹克球專場，6 個標準場。提供球拍試用及新手教學。',
  array['匹克球'],
  'wan_chai',
  '灣仔皇后大道東 248 號 5 樓',
  22.2745, 114.1728,
  array['冷氣', '更衣室', '飲水機', '器材租借'],
  array['https://picsum.photos/seed/pv-pickle-2/800/500'],
  'https://picklehub-hk.example/book',
  'active'
),
(
  'e1000000-0000-4000-8000-000000000019',
  '元朗 Dink Zone 匹克球場',
  '新界西首個有蓋匹克球場，黃昏時段有 LED 照明。歡迎拼場包場。',
  array['匹克球'],
  'yuen_long',
  '元朗教育路 88 號',
  22.4428, 114.0285,
  array['冷氣', '停車場', '觀眾席'],
  array['https://picsum.photos/seed/pv-pickle-3/800/500'],
  'https://yl-pickle.example/reserve',
  'active'
),
(
  'e1000000-0000-4000-8000-00000000001a',
  '大角咀 5-a-side 足球場',
  '市區罕有 5 人足球場，人工草 + 圍網。適合快閃波賽。',
  array['足球'],
  'yau_tsim_mong',
  '大角咀橡樹街 12 號',
  22.3215, 114.1628,
  array['更衣室', '淋浴', '飲水機'],
  array['https://picsum.photos/seed/pv-soccer-2/800/500'],
  'tel:+85223998877',
  'active'
),
(
  'e1000000-0000-4000-8000-00000000001b',
  '馬鞍山 Green Pitch 足球場',
  '7 人及 11 人場地皆有，人工草保養良好。設有球迷看台。',
  array['足球'],
  'sha_tin',
  '馬鞍山鞍誠街 18 號',
  22.4258, 114.2312,
  array['更衣室', '淋浴', '停車場', '觀眾席'],
  array['https://picsum.photos/seed/pv-soccer-3/800/500'],
  'https://mos-greenpitch.example/book',
  'active'
),
(
  'e1000000-0000-4000-8000-00000000001c',
  '中環 Tennis Loft',
  '中環 rooftop 硬地網球場 2 個，夜景優美。需預約及穿著非 marking 鞋。',
  array['網球'],
  'central_western',
  '中環士丹利街 45 號 天台',
  22.2835, 114.1548,
  array['飲水機', '更衣室'],
  array['https://picsum.photos/seed/pv-tennis-2/800/500'],
  'https://tennisloft-hk.example/book',
  'active'
),
(
  'e1000000-0000-4000-8000-00000000001d',
  '屯門 Net Club 網球中心',
  '4 個有蓋硬地網球場，夏季首選。設有 Ball machine 出租。',
  array['網球'],
  'tuen_mun',
  '屯門青山坊 2 號',
  22.3945, 113.9735,
  array['冷氣', '更衣室', '停車場', '器材租借'],
  array['https://picsum.photos/seed/pv-tennis-3/800/500'],
  'tel:+85224556677',
  'active'
),
(
  'e1000000-0000-4000-8000-00000000001e',
  '葵芳 Volley Arena',
  '標準 6 人排球場 4 個，可改劃羽毛球。適合女子排球及混合拼場。',
  array['排球'],
  'kwai_tsing',
  '葵芳興芳路 88 號 3 樓',
  22.3558, 114.1275,
  array['冷氣', '更衣室', '飲水機', '觀眾席'],
  array['https://picsum.photos/seed/pv-volley-2/800/500'],
  'https://kwai-volley.example/reserve',
  'active'
);

-- Quick verify
select status, count(*) as cnt
from public.private_venues
where id::text like 'e1000000-%'
group by status
order by status;

-- Sport coverage (venues listing each sport)
select sport, count(*) as venue_count
from public.private_venues pv,
  lateral unnest(pv.sport_types) as sport
where pv.id::text like 'e1000000-%'
group by sport
order by sport;
