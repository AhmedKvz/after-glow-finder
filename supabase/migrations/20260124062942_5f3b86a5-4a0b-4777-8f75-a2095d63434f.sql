-- KORAK 3/3: Integracija Lucky100 u handle_new_user() trigger

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_event_id uuid := '599fc2ae-22d1-4123-98b8-fbc9f80dc544';
  v_role app_role;
  -- Lucky100 vars
  v_new_count bigint;
  v_ticket_id uuid;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  
  -- Get role from metadata, default to 'user'
  v_role := COALESCE((new.raw_user_meta_data ->> 'role')::app_role, 'user'::app_role);
  
  -- Insert user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, v_role);
  
  -- Only create demo ticket for regular users, not clubs
  IF v_role = 'user' THEN
    INSERT INTO public.tickets (
      user_id,
      event_id,
      ticket_code,
      price_paid,
      status
    )
    VALUES (
      new.id,
      v_event_id,
      public.generate_ticket_code(),
      0,
      'valid'
    );
  END IF;

  -------------------------------------------------------------------
  -- Lucky100: every 100th registered USER gets a golden ticket
  -------------------------------------------------------------------
  IF v_role = 'user' THEN
    v_new_count := public.increment_registered_users_counter();
    
    IF (v_new_count % 100 = 0) THEN
      v_ticket_id := public.issue_golden_ticket(
        new.id,
        'Lucky100',
        now() + interval '14 days',
        'Every 100th registered user reward'
      );
      
      UPDATE public.profiles
      SET lucky100_wins = COALESCE(lucky100_wins, 0) + 1
      WHERE user_id = new.id;
    END IF;
  END IF;

  RETURN new;
END;
$function$;