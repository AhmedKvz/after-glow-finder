-- Create event_swipes table to track user swipes on events
CREATE TABLE public.event_swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  swipe_direction text NOT NULL CHECK (swipe_direction IN ('left', 'right')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS
ALTER TABLE public.event_swipes ENABLE ROW LEVEL SECURITY;

-- Users can insert their own swipes
CREATE POLICY "Users can create their own swipes"
ON public.event_swipes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own swipes
CREATE POLICY "Users can view their own swipes"
ON public.event_swipes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own swipes (change direction)
CREATE POLICY "Users can update their own swipes"
ON public.event_swipes
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_event_swipes_user_event ON public.event_swipes(user_id, event_id);
CREATE INDEX idx_event_swipes_created ON public.event_swipes(created_at DESC);