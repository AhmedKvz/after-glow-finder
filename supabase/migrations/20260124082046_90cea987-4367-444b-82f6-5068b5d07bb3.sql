-- Add is_demo flag to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_profiles_is_demo ON public.profiles(is_demo);

-- Function: Ensure every event has demo ticket-holders for BOTH genders
CREATE OR REPLACE FUNCTION public.ensure_event_demo_crowd(
  _event_id uuid,
  _min_total int DEFAULT 20,
  _male_count int DEFAULT 12,
  _female_count int DEFAULT 12
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_real_count int;
  i int;
  v_user_id uuid;
BEGIN
  SELECT count(*)
    INTO v_real_count
  FROM public.tickets t
  JOIN public.profiles p ON p.user_id = t.user_id
  WHERE t.event_id = _event_id
    AND t.status = 'valid'
    AND COALESCE(p.is_demo, false) = false;

  IF v_real_count >= _min_total THEN
    RETURN;
  END IF;

  -- seed males
  FOR i IN 1.._male_count LOOP
    v_user_id := gen_random_uuid();

    INSERT INTO public.profiles (
      user_id, display_name, gender, city, bio, xp, level, trust_score,
      spicy_state, spicy_state_expires_at, last_circle_activity, is_demo
    ) VALUES (
      v_user_id,
      'Demo • M' || i,
      'male',
      'Belgrade',
      'Investor demo user (event crowd).',
      800 + (random()*1200)::int,
      'L' || (1 + (random()*5)::int),
      0.6 + random()*0.4,
      (random() < 0.25),
      CASE WHEN random() < 0.25 THEN now() + interval '2 hours' ELSE NULL END,
      now() - (floor(random()*10)::int || ' minutes')::interval,
      true
    );

    INSERT INTO public.tickets (user_id, event_id, ticket_code, price_paid, status)
    VALUES (v_user_id, _event_id, public.generate_ticket_code(), 0, 'valid');
  END LOOP;

  -- seed females
  FOR i IN 1.._female_count LOOP
    v_user_id := gen_random_uuid();

    INSERT INTO public.profiles (
      user_id, display_name, gender, city, bio, xp, level, trust_score,
      spicy_state, spicy_state_expires_at, last_circle_activity, is_demo
    ) VALUES (
      v_user_id,
      'Demo • F' || i,
      'female',
      'Belgrade',
      'Investor demo user (event crowd).',
      900 + (random()*1400)::int,
      'L' || (1 + (random()*5)::int),
      0.6 + random()*0.4,
      (random() < 0.30),
      CASE WHEN random() < 0.30 THEN now() + interval '3 hours' ELSE NULL END,
      now() - (floor(random()*10)::int || ' minutes')::interval,
      true
    );

    INSERT INTO public.tickets (user_id, event_id, ticket_code, price_paid, status)
    VALUES (v_user_id, _event_id, public.generate_ticket_code(), 0, 'valid');
  END LOOP;
END;
$$;

-- Function: Ensure global demo users exist (for /circle-swipe global mode)
CREATE OR REPLACE FUNCTION public.ensure_global_demo_users(
  _min_total int DEFAULT 50,
  _male_count int DEFAULT 30,
  _female_count int DEFAULT 30
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_real_count int;
  i int;
  v_user_id uuid;
BEGIN
  SELECT count(*)
    INTO v_real_count
  FROM public.profiles p
  WHERE COALESCE(p.is_demo, false) = false
    AND p.gender IS NOT NULL;

  IF v_real_count >= _min_total THEN
    RETURN;
  END IF;

  FOR i IN 1.._male_count LOOP
    v_user_id := gen_random_uuid();
    INSERT INTO public.profiles (
      user_id, display_name, gender, city, bio, xp, level, trust_score,
      spicy_state, spicy_state_expires_at, last_circle_activity, is_demo
    ) VALUES (
      v_user_id, 'Demo • GM' || i, 'male', 'Belgrade',
      'Investor demo user (global crowd).',
      600 + (random()*1400)::int,
      'L' || (1 + (random()*5)::int),
      0.6 + random()*0.4,
      (random() < 0.20),
      CASE WHEN random() < 0.20 THEN now() + interval '2 hours' ELSE NULL END,
      now() - (floor(random()*10)::int || ' minutes')::interval,
      true
    );
  END LOOP;

  FOR i IN 1.._female_count LOOP
    v_user_id := gen_random_uuid();
    INSERT INTO public.profiles (
      user_id, display_name, gender, city, bio, xp, level, trust_score,
      spicy_state, spicy_state_expires_at, last_circle_activity, is_demo
    ) VALUES (
      v_user_id, 'Demo • GF' || i, 'female', 'Belgrade',
      'Investor demo user (global crowd).',
      650 + (random()*1600)::int,
      'L' || (1 + (random()*5)::int),
      0.6 + random()*0.4,
      (random() < 0.25),
      CASE WHEN random() < 0.25 THEN now() + interval '3 hours' ELSE NULL END,
      now() - (floor(random()*10)::int || ' minutes')::interval,
      true
    );
  END LOOP;
END;
$$;

-- Function: Refresh activity to keep demo users "online"
CREATE OR REPLACE FUNCTION public.bump_demo_activity()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET last_circle_activity = now() - (floor(random()*8)::int || ' minutes')::interval
  WHERE is_demo = true;
END;
$$;