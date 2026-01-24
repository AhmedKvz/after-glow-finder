-- Create function to check Circle Swipe access status for authenticated user
CREATE OR REPLACE FUNCTION public.circle_access_status(_event_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_valid_until timestamptz;
BEGIN
  v_user_id := auth.uid();
  
  -- Not authenticated
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'has_access', false,
      'access_type', null,
      'paid_valid_until', null
    );
  END IF;

  -- Priority 1: Check for valid ticket
  IF EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.user_id = v_user_id
      AND t.event_id = _event_id
      AND t.status = 'valid'
  ) THEN
    RETURN jsonb_build_object(
      'has_access', true,
      'access_type', 'ticket',
      'paid_valid_until', null
    );
  END IF;

  -- Priority 2: Check for paid access (not expired)
  SELECT eca.valid_until
    INTO v_valid_until
  FROM public.event_circle_access eca
  WHERE eca.user_id = v_user_id
    AND eca.event_id = _event_id
    AND eca.valid_until > now()
  ORDER BY eca.valid_until DESC
  LIMIT 1;

  IF v_valid_until IS NOT NULL THEN
    RETURN jsonb_build_object(
      'has_access', true,
      'access_type', 'paid',
      'paid_valid_until', v_valid_until
    );
  END IF;

  -- No access
  RETURN jsonb_build_object(
    'has_access', false,
    'access_type', null,
    'paid_valid_until', null
  );
END;
$$;