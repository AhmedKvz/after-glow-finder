-- 1. Create table for paid Circle Swipe access
CREATE TABLE public.event_circle_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  access_type text NOT NULL DEFAULT 'paid',
  paid_amount_rsd integer NOT NULL DEFAULT 200,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Add unique constraint (user can only have one access record per event)
ALTER TABLE public.event_circle_access 
  ADD CONSTRAINT event_circle_access_user_event_unique 
  UNIQUE (user_id, event_id);

-- 3. Add indexes for performance
CREATE INDEX idx_event_circle_access_event_valid 
  ON public.event_circle_access(event_id, valid_until);
CREATE INDEX idx_event_circle_access_user_event 
  ON public.event_circle_access(user_id, event_id);

-- 4. Enable RLS
ALTER TABLE public.event_circle_access ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policy: Users can only SELECT their own rows
CREATE POLICY "Users can view their own circle access"
  ON public.event_circle_access
  FOR SELECT
  USING (auth.uid() = user_id);

-- 6. RLS Policy: Users can only INSERT their own rows
CREATE POLICY "Users can insert their own circle access"
  ON public.event_circle_access
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 7. Security trigger function - PREVENTS CLIENT MANIPULATION
CREATE OR REPLACE FUNCTION public.enforce_circle_access_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Force server-side values - client cannot override these
  NEW.valid_from := now();
  NEW.valid_until := now() + interval '5 hours';
  NEW.paid_amount_rsd := 200;
  NEW.access_type := 'paid';
  
  RETURN NEW;
END;
$$;

-- 8. Attach trigger to table
CREATE TRIGGER trg_enforce_circle_access_rules
  BEFORE INSERT ON public.event_circle_access
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_circle_access_rules();