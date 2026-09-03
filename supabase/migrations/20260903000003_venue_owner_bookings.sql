-- Venue owner role, venue ownership, and booking records
-- RLS policies omitted for this phase (apply separately).

-- 1. Profiles: venue owner flag
alter table public.profiles
  add column if not exists is_venue_owner boolean not null default false;

comment on column public.profiles.is_venue_owner is
  'True when this member manages one or more private_venues listings.';

-- 2. Private venues: link to managing owner
alter table public.private_venues
  add column if not exists owner_id uuid references public.profiles(id) on delete set null;

create index if not exists private_venues_owner_id_idx
  on public.private_venues (owner_id);

comment on column public.private_venues.owner_id is
  'Profile id of the venue operator (馆主). Nullable for admin-only listings.';

-- 3. Venue bookings
create table if not exists public.venue_bookings (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.private_venues(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending',
  total_price numeric not null default 0,
  payment_status text not null default 'unpaid',
  contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint venue_bookings_status_check
    check (status in ('pending', 'confirmed', 'rejected', 'cancelled')),
  constraint venue_bookings_payment_status_check
    check (payment_status in ('unpaid', 'paid')),
  constraint venue_bookings_time_order_check
    check (end_time > start_time),
  constraint venue_bookings_total_price_nonneg
    check (total_price >= 0)
);

create index if not exists venue_bookings_venue_id_idx
  on public.venue_bookings (venue_id);

create index if not exists venue_bookings_user_id_idx
  on public.venue_bookings (user_id);

create index if not exists venue_bookings_date_idx
  on public.venue_bookings (booking_date);

create index if not exists venue_bookings_status_idx
  on public.venue_bookings (status);

create index if not exists venue_bookings_venue_date_idx
  on public.venue_bookings (venue_id, booking_date);

drop trigger if exists venue_bookings_updated_at on public.venue_bookings;

create trigger venue_bookings_updated_at
  before update on public.venue_bookings
  for each row execute function public.set_updated_at();

comment on table public.venue_bookings is
  'Private venue slot reservations by members; managed by venue owners.';

comment on column public.venue_bookings.status is
  'pending | confirmed | rejected | cancelled';

comment on column public.venue_bookings.payment_status is
  'unpaid | paid';
