-- App settings tabela za globalne konfiguracije

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value)
values ('gamification', jsonb_build_object('demo_mode', true))
on conflict (key) do nothing;

alter table public.app_settings enable row level security;