-- Update handle_new_user function to create ticket for Belgrade Underground Techno Night event
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_event_id uuid := '599fc2ae-22d1-4123-98b8-fbc9f80dc544'; -- Belgrade Underground Techno Night
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  
  -- Create ticket for the demo event
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
    0, -- Free ticket for demo
    'valid'
  );
  
  RETURN new;
END;
$function$;