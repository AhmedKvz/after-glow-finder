-- KORAK B: Funkcija za redeem Lucky100 kredita za event ticket

CREATE OR REPLACE FUNCTION public.redeem_lucky100_event_credit(_event_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_gt_id uuid;
  v_ticket_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Event must be eligible (club event with ticketing enabled)
  IF NOT EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = _event_id
      AND e.event_type = 'club'
      AND e.ticketing_enabled = true
  ) THEN
    RAISE EXCEPTION 'Event not eligible';
  END IF;

  -- Lock + fetch one available Lucky100 credit (race-safe with FOR UPDATE)
  SELECT gt.id
    INTO v_gt_id
  FROM public.golden_tickets gt
  WHERE gt.user_id = v_user_id
    AND gt.status = 'active'
    AND gt.used_at IS NULL
    AND (gt.expires_at IS NULL OR gt.expires_at > now())
    AND gt.source IN ('Lucky100', 'Lucky100Demo')
  ORDER BY gt.created_at DESC
  FOR UPDATE
  LIMIT 1;

  IF v_gt_id IS NULL THEN
    RAISE EXCEPTION 'No active Lucky100 credit';
  END IF;

  -- Guard: don't create duplicate valid ticket for same event
  IF EXISTS (
    SELECT 1
    FROM public.tickets t
    WHERE t.user_id = v_user_id
      AND t.event_id = _event_id
      AND t.status = 'valid'
  ) THEN
    RAISE EXCEPTION 'Ticket already exists for this event';
  END IF;

  -- Mark credit as used (tie it to the event)
  UPDATE public.golden_tickets
  SET used_at = now(),
      used_event_id = _event_id,
      status = 'used',
      updated_at = now()
  WHERE id = v_gt_id;

  -- Create the actual event ticket
  INSERT INTO public.tickets (
    user_id,
    event_id,
    ticket_code,
    price_paid,
    status,
    is_lucky100_winner
  )
  VALUES (
    v_user_id,
    _event_id,
    public.generate_ticket_code(),
    0,
    'valid',
    true
  )
  RETURNING id INTO v_ticket_id;

  RETURN v_ticket_id;
END;
$$;

-- Komentar za dokumentaciju
COMMENT ON FUNCTION public.redeem_lucky100_event_credit(uuid) IS 'Atomically redeems a Lucky100 credit for a free event ticket. Race-safe with FOR UPDATE lock.';