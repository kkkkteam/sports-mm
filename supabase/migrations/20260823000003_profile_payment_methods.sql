-- Host profile: reusable accepted payment methods for games they organize
alter table public.profiles
  add column if not exists accepted_payment_methods text[] not null default '{}';

comment on column public.profiles.accepted_payment_methods is
  'Payment methods the host accepts. Known slugs: cash_on_site, payme, fps, alipay_hk, wechat_pay_hk. Optional custom entry: other:<free text>.';
