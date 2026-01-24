-- Create function to get event circle profiles (bypasses RLS for reading other users' access)
CREATE OR REPLACE FUNCTION public.event_circle_profiles(_event_id uuid, _limit integer default 20)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_has_access boolean;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if current user has access (ticket or paid)
  v_has_access := EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.user_id = v_user_id AND t.event_id = _event_id AND t.status = 'valid'
  ) OR EXISTS (
    SELECT 1 FROM public.event_circle_access eca
    WHERE eca.user_id = v_user_id AND eca.event_id = _event_id AND eca.valid_until > now()
  );

  IF NOT v_has_access THEN
    RAISE EXCEPTION 'No access';
  END IF;

  -- Return profiles of all participants (excluding current user)
  RETURN QUERY
  SELECT p.*
  FROM public.profiles p
  WHERE p.user_id <> v_user_id
    AND p.user_id IN (
      SELECT user_id FROM public.tickets WHERE event_id = _event_id AND status = 'valid'
      UNION
      SELECT user_id FROM public.event_circle_access WHERE event_id = _event_id AND valid_until > now()
    )
  LIMIT _limit;
END;
$$;