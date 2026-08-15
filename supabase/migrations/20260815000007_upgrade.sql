-- ========== 1. POSTGIS (地理位置擴充) ==========
-- 啟用 PostGIS 擴充以支援複雜的地理空間查詢
create extension if not exists postgis;

-- 為場地與活動新增 geography 欄位
alter table public.venues
  add column if not exists location geography(point, 4326);

alter table public.games
  add column if not exists location geography(point, 4326);

-- 建立函數：當 lat/lng 更新時，自動同步更新 location (geography) 欄位
create or replace function public.sync_location_geography()
returns trigger
language plpgsql
as $$
begin
  if new.lat is not null and new.lng is not null then
    new.location := st_setSRID(st_makepoint(new.lng, new.lat), 4326)::geography;
  else
    new.location := null;
  end if;
  return new;
end;
$$;

-- 為 Venues 加入觸發器
create trigger venues_sync_location
  before insert or update of lat, lng on public.venues
  for each row execute function public.sync_location_geography();

-- 為 Games 加入觸發器
create trigger games_sync_location
  before insert or update of lat, lng on public.games
  for each row execute function public.sync_location_geography();


-- ========== 2. SMART ALERTS (智能訂閱) ==========
create table public.smart_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  district public.hk_district,
  sport_id uuid references public.sports(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index smart_alerts_user_idx on public.smart_alerts (user_id);

alter table public.smart_alerts enable row level security;

create policy smart_alerts_self_select on public.smart_alerts
  for select using (auth.uid() = user_id);

create policy smart_alerts_self_insert on public.smart_alerts
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy smart_alerts_self_update on public.smart_alerts
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy smart_alerts_self_delete on public.smart_alerts
  for delete using (auth.uid() = user_id);


-- ========== 3. PUSH TOKENS (推播通知設備) ==========
create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('ios', 'android', 'web')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index push_tokens_user_idx on public.push_tokens (user_id);

create trigger push_tokens_updated_at
  before update on public.push_tokens
  for each row execute function public.set_updated_at();

alter table public.push_tokens enable row level security;

create policy push_tokens_self_select on public.push_tokens
  for select using (auth.uid() = user_id);

create policy push_tokens_self_insert on public.push_tokens
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy push_tokens_self_update on public.push_tokens
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy push_tokens_self_delete on public.push_tokens
  for delete using (auth.uid() = user_id);