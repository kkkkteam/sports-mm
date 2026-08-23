-- Remove Dodgebee (健球) — low adoption in Hong Kong

do $$
declare
  v_dodgebee uuid;
  v_volleyball uuid;
begin
  select id into v_dodgebee from public.sports where slug = 'dodgebee';
  if v_dodgebee is null then
    return;
  end if;

  select id into v_volleyball from public.sports where slug = 'volleyball' limit 1;

  if v_volleyball is not null then
    update public.games set sport_id = v_volleyball where sport_id = v_dodgebee;
  end if;

  delete from public.user_sport_skills where sport_id = v_dodgebee;

  if to_regclass('public.smart_alerts') is not null then
    delete from public.smart_alerts where sport_id = v_dodgebee;
  end if;

  delete from public.sports where id = v_dodgebee;
end $$;
