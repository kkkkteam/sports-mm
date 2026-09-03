-- Private venues directory (paid listings managed by admins)
-- Table RLS is intentionally omitted for this phase: public read + admin write
-- will be layered later. Storage policies below limit image uploads to admins.

create table public.private_venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  sport_types text[] not null default '{}',
  district public.hk_district not null,
  address text not null,
  lat numeric,
  lng numeric,
  facilities text[] not null default '{}',
  images text[] not null default '{}',
  booking_link text,
  status text not null default 'inactive',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint private_venues_name_len check (char_length(trim(name)) between 1 and 80),
  constraint private_venues_status_check check (status in ('active', 'inactive'))
);

create index private_venues_district_idx on public.private_venues (district);
create index private_venues_status_idx on public.private_venues (status);
create index private_venues_created_at_idx on public.private_venues (created_at desc);

create trigger private_venues_updated_at
  before update on public.private_venues
  for each row execute function public.set_updated_at();

comment on table public.private_venues is
  'Paid private venue listings. Admins create/update rows after offline payment.';

comment on column public.private_venues.sport_types is
  'Sports offered at the venue, e.g. {羽毛球,乒乓球}.';

comment on column public.private_venues.facilities is
  'Amenities, e.g. {更衣室,冷氣,淋浴}.';

comment on column public.private_venues.images is
  'Public image URLs (Supabase Storage private-venue-images).';

comment on column public.private_venues.status is
  'active = listed publicly; inactive = hidden.';

-- Public images for venue cards / directory
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'private-venue-images',
  'private-venue-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage write: admins only. Public bucket is readable via public URL.
drop policy if exists private_venue_images_admin_insert on storage.objects;
drop policy if exists private_venue_images_admin_update on storage.objects;
drop policy if exists private_venue_images_admin_delete on storage.objects;
drop policy if exists private_venue_images_public_select on storage.objects;

create policy private_venue_images_admin_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'private-venue-images'
    and public.is_admin()
  );

create policy private_venue_images_admin_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'private-venue-images'
    and public.is_admin()
  )
  with check (
    bucket_id = 'private-venue-images'
    and public.is_admin()
  );

create policy private_venue_images_admin_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'private-venue-images'
    and public.is_admin()
  );

create policy private_venue_images_public_select on storage.objects
  for select
  using (bucket_id = 'private-venue-images');
