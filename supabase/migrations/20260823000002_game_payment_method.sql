-- Preferred payment method when hosting a game (on-site / transfer receipt / both)

create type public.game_payment_method as enum (
  'on_site',
  'transfer',
  'both'
);

alter table public.games
  add column payment_method public.game_payment_method not null default 'both';

comment on column public.games.payment_method is
  'Host payment preference: on_site (pay at venue), transfer (upload receipt), or both.';
