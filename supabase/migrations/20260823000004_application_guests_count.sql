-- Guest applications: applicant may bring additional guests (companions)
alter table public.applications
  add column if not exists guests_count integer not null default 0;

alter table public.applications
  add column if not exists total_spots_requested integer
  generated always as (1 + guests_count) stored;

alter table public.applications
  drop constraint if exists applications_guests_count_nonneg;

alter table public.applications
  add constraint applications_guests_count_nonneg
  check (guests_count >= 0);

comment on column public.applications.guests_count is
  'Number of additional guests (companions) beyond the applicant. 0 = applicant only (1 spot).';

comment on column public.applications.total_spots_requested is
  'Computed total spots: 1 (applicant) + guests_count.';
