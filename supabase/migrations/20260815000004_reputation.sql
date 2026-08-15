-- Reputation / anti no-show: attendance, reviews, payment proofs

-- ========== ENUMS ==========
create type public.attendance_status as enum ('pending', 'present', 'no_show');

-- ========== PROFILES ==========
alter table public.profiles
  add column rating numeric(3,2),
  add column rating_count int not null default 0,
  add column attendance_marked_count int not null default 0,
  add column attendance_present_count int not null default 0;

alter table public.profiles
  add column attendance_rate numeric(5,2)
    generated always as (
      case
        when attendance_marked_count = 0 then null
        else round(
          (attendance_present_count::numeric / attendance_marked_count::numeric) * 100,
          2
        )
      end
    ) stored;

alter table public.profiles
  add constraint profiles_rating_range
    check (rating is null or (rating >= 1 and rating <= 5)),
  add constraint profiles_rating_count_nonneg
    check (rating_count >= 0),
  add constraint profiles_attendance_counts
    check (
      attendance_marked_count >= 0
      and attendance_present_count >= 0
      and attendance_present_count <= attendance_marked_count
    );

-- Block client-side tampering of reputation columns (bypass via set_config in definer fns)
create or replace function public.protect_profile_reputation()
returns trigger
language plpgsql
as $$
begin
  if current_setting('app.updating_reputation', true) is distinct from 'true' then
    new.rating := old.rating;
    new.rating_count := old.rating_count;
    new.attendance_marked_count := old.attendance_marked_count;
    new.attendance_present_count := old.attendance_present_count;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_reputation
  before update on public.profiles
  for each row execute function public.protect_profile_reputation();

-- ========== APPLICATIONS: payment proof ==========
alter table public.applications
  add column payment_proof_url text;

drop policy if exists applications_host_or_self_update on public.applications;

create policy applications_host_or_self_update on public.applications
  for update using (
    (
      applicant_id = auth.uid()
      and status = 'pending'
    )
    or exists (select 1 from public.games g where g.id = game_id and g.host_id = auth.uid())
  )
  with check (
    (
      applicant_id = auth.uid()
      and status in ('pending', 'withdrawn')
    )
    or exists (select 1 from public.games g where g.id = game_id and g.host_id = auth.uid())
  );

-- ========== GAME PARTICIPANTS: attendance ==========
alter table public.game_participants
  add column attendance_status public.attendance_status not null default 'pending',
  add column attendance_marked_by uuid references public.profiles(id) on delete set null,
  add column attendance_marked_at timestamptz;

create or replace function public.sync_attendance_counters()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_present int := 0;
  old_marked int := 0;
  new_present int := 0;
  new_marked int := 0;
  host uuid;
begin
  select host_id into host from public.games where id = coalesce(new.game_id, old.game_id);

  -- Host attendance does not affect reputation
  if coalesce(new.user_id, old.user_id) = host then
    return coalesce(new, old);
  end if;

  if tg_op in ('UPDATE', 'DELETE') then
    if old.attendance_status in ('present', 'no_show') then
      old_marked := 1;
      if old.attendance_status = 'present' then
        old_present := 1;
      end if;
    end if;
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    if new.attendance_status in ('present', 'no_show') then
      new_marked := 1;
      if new.attendance_status = 'present' then
        new_present := 1;
      end if;
    end if;
  end if;

  if old_marked = new_marked and old_present = new_present then
    return coalesce(new, old);
  end if;

  perform set_config('app.updating_reputation', 'true', true);

  update public.profiles
  set
    attendance_marked_count = greatest(0, attendance_marked_count - old_marked + new_marked),
    attendance_present_count = greatest(0, attendance_present_count - old_present + new_present)
  where id = coalesce(new.user_id, old.user_id);

  return coalesce(new, old);
end;
$$;

create trigger game_participants_attendance_counters
  after insert or update of attendance_status or delete
  on public.game_participants
  for each row execute function public.sync_attendance_counters();

create or replace function public.validate_attendance_mark()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  game_row public.games%rowtype;
begin
  if new.attendance_status is not distinct from old.attendance_status
     and new.attendance_marked_by is not distinct from old.attendance_marked_by
     and new.attendance_marked_at is not distinct from old.attendance_marked_at then
    return new;
  end if;

  select * into game_row from public.games where id = new.game_id;
  if game_row.status is distinct from 'completed' then
    raise exception '只能在活動完成後標記出席';
  end if;

  if auth.uid() is distinct from game_row.host_id then
    raise exception '只有場主可以標記出席';
  end if;

  if new.user_id = game_row.host_id then
    raise exception '不標記場主的出席狀態';
  end if;

  if new.attendance_status = 'pending' then
    new.attendance_marked_by := null;
    new.attendance_marked_at := null;
  else
    new.attendance_marked_by := auth.uid();
    new.attendance_marked_at := now();
  end if;

  return new;
end;
$$;

create trigger game_participants_validate_attendance
  before update of attendance_status, attendance_marked_by, attendance_marked_at
  on public.game_participants
  for each row execute function public.validate_attendance_mark();

drop policy if exists participants_host_attendance_update on public.game_participants;

create policy participants_host_attendance_update on public.game_participants
  for update using (
    exists (
      select 1 from public.games g
      where g.id = game_id
        and g.host_id = auth.uid()
        and g.status = 'completed'
        and game_participants.user_id <> g.host_id
    )
  )
  with check (
    exists (
      select 1 from public.games g
      where g.id = game_id
        and g.host_id = auth.uid()
        and g.status = 'completed'
        and game_participants.user_id <> g.host_id
    )
  );

-- ========== REVIEWS ==========
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_no_self check (reviewer_id <> reviewee_id),
  constraint reviews_comment_len check (comment is null or char_length(comment) <= 500),
  unique (game_id, reviewer_id, reviewee_id)
);

create index reviews_reviewee_idx on public.reviews (reviewee_id);
create index reviews_game_idx on public.reviews (game_id);

create trigger reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

create or replace function public.validate_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  game_row public.games%rowtype;
  reviewer_ok boolean;
  reviewee_ok boolean;
begin
  select * into game_row from public.games where id = new.game_id;

  if game_row.status is distinct from 'completed' then
    raise exception '只能在活動完成後評分';
  end if;

  if new.reviewee_id = game_row.host_id then
    raise exception '場主不接受評分';
  end if;

  if new.reviewer_id = game_row.host_id then
    reviewer_ok := true;
  else
    select exists (
      select 1 from public.game_participants gp
      where gp.game_id = new.game_id and gp.user_id = new.reviewer_id
    ) into reviewer_ok;
  end if;

  select exists (
    select 1 from public.game_participants gp
    where gp.game_id = new.game_id
      and gp.user_id = new.reviewee_id
      and gp.user_id <> game_row.host_id
  ) into reviewee_ok;

  if not reviewer_ok or not reviewee_ok then
    raise exception '評分雙方必須為該場參與者（且被評者不可為場主）';
  end if;

  if auth.uid() is distinct from new.reviewer_id then
    raise exception '只能以自己的身分發表評分';
  end if;

  return new;
end;
$$;

create trigger reviews_validate
  before insert or update on public.reviews
  for each row execute function public.validate_review();

create or replace function public.recompute_profile_rating(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  avg_rating numeric(3,2);
  cnt int;
begin
  select round(avg(rating)::numeric, 2), count(*)::int
    into avg_rating, cnt
  from public.reviews
  where reviewee_id = target;

  perform set_config('app.updating_reputation', 'true', true);

  update public.profiles
  set
    rating = case when cnt = 0 then null else avg_rating end,
    rating_count = cnt
  where id = target;
end;
$$;

create or replace function public.sync_review_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recompute_profile_rating(old.reviewee_id);
    return old;
  end if;

  perform public.recompute_profile_rating(new.reviewee_id);
  if tg_op = 'UPDATE' and old.reviewee_id is distinct from new.reviewee_id then
    perform public.recompute_profile_rating(old.reviewee_id);
  end if;
  return new;
end;
$$;

create trigger reviews_sync_rating
  after insert or update or delete on public.reviews
  for each row execute function public.sync_review_rating();

alter table public.reviews enable row level security;

create policy reviews_public_read on public.reviews
  for select using (true);

create policy reviews_participant_insert on public.reviews
  for insert to authenticated
  with check (
    reviewer_id = auth.uid()
    and exists (
      select 1 from public.games g
      where g.id = game_id
        and g.status = 'completed'
        and reviewee_id <> g.host_id
        and (
          g.host_id = auth.uid()
          or exists (
            select 1 from public.game_participants gp
            where gp.game_id = g.id and gp.user_id = auth.uid()
          )
        )
    )
  );

create policy reviews_author_update on public.reviews
  for update using (reviewer_id = auth.uid())
  with check (reviewer_id = auth.uid());

create policy reviews_author_delete on public.reviews
  for delete using (reviewer_id = auth.uid());

-- ========== STORAGE: payment proofs ==========
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Path: {applicant_id}/{application_id}.{ext}
create policy payment_proofs_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy payment_proofs_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy payment_proofs_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy payment_proofs_select_involved on storage.objects
  for select to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1
        from public.applications a
        join public.games g on g.id = a.game_id
        where g.host_id = auth.uid()
          and a.applicant_id::text = (storage.foldername(name))[1]
          and a.id::text = split_part((storage.filename(name)), '.', 1)
      )
    )
  );
