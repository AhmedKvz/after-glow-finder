-- KORAK 2/3: Kreiranje increment_registered_users_counter() funkcije

create or replace function public.increment_registered_users_counter()
returns bigint
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_new_count bigint;
begin
  update public.global_counters
  set value = value + 1,
      updated_at = now()
  where key = 'registered_users'
  returning value into v_new_count;

  return v_new_count;
end;
$$;