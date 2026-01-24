-- KORAK 1/3: Kreiranje global_counters tabele za Lucky 100 feature

-- Kreiranje global_counters tabele
create table if not exists public.global_counters (
  key text primary key,
  value bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- Inicijalni row za brojač registrovanih korisnika
insert into public.global_counters (key, value)
values ('registered_users', 0)
on conflict (key) do nothing;

-- RLS uključen - NEMA public policy, samo trigger/server može pristupiti
alter table public.global_counters enable row level security;