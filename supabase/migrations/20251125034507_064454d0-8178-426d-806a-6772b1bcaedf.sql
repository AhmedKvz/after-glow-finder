-- Add spicy mode tracking to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS spicy_likelihood_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS spicy_state boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS spicy_state_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_circle_activity timestamp with time zone,
ADD COLUMN IF NOT EXISTS circle_swipe_velocity integer DEFAULT 0;

-- Create spicy mode purchases table
CREATE TABLE IF NOT EXISTS public.spicy_mode_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  circle_session_id uuid NOT NULL REFERENCES public.circle_swipe_sessions(id) ON DELETE CASCADE,
  purchased_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '12 hours'),
  payment_intent_id text,
  amount_paid numeric NOT NULL DEFAULT 8.88,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on spicy_mode_purchases
ALTER TABLE public.spicy_mode_purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for spicy_mode_purchases
CREATE POLICY "Users can create their own spicy mode purchases"
  ON public.spicy_mode_purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own spicy mode purchases"
  ON public.spicy_mode_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create spicy prompts table to track who received prompts
CREATE TABLE IF NOT EXISTS public.spicy_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  circle_session_id uuid NOT NULL REFERENCES public.circle_swipe_sessions(id) ON DELETE CASCADE,
  triggered_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spicy_likelihood_score integer NOT NULL,
  response text CHECK (response IN ('yes', 'no', 'pending')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  responded_at timestamp with time zone,
  UNIQUE(user_id, circle_session_id, triggered_by_user_id)
);

-- Enable RLS on spicy_prompts
ALTER TABLE public.spicy_prompts ENABLE ROW LEVEL SECURITY;

-- RLS policies for spicy_prompts
CREATE POLICY "Users can view their own spicy prompts"
  ON public.spicy_prompts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own spicy prompts"
  ON public.spicy_prompts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create spicy prompts"
  ON public.spicy_prompts
  FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_spicy_mode_purchases_user_id ON public.spicy_mode_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_spicy_mode_purchases_session_id ON public.spicy_mode_purchases(circle_session_id);
CREATE INDEX IF NOT EXISTS idx_spicy_prompts_user_id ON public.spicy_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_spicy_prompts_session_id ON public.spicy_prompts(circle_session_id);