-- Add heat score fields to events table
ALTER TABLE public.events
ADD COLUMN watchlist_count integer DEFAULT 0,
ADD COLUMN ticket_sales_count integer DEFAULT 0,
ADD COLUMN private_request_count integer DEFAULT 0,
ADD COLUMN xp_interest_sum integer DEFAULT 0,
ADD COLUMN trust_interest_avg numeric DEFAULT 0,
ADD COLUMN shares_count integer DEFAULT 0,
ADD COLUMN heat_score numeric DEFAULT 0,
ADD COLUMN heat_badge text;

-- Add heat score fields to club_profiles table
ALTER TABLE public.club_profiles
ADD COLUMN heat_average numeric DEFAULT 0,
ADD COLUMN club_heat_rank integer,
ADD COLUMN recent_event_heat_scores jsonb DEFAULT '[]'::jsonb;

-- Create indexes for leaderboard queries
CREATE INDEX idx_events_heat_score ON public.events(heat_score DESC);
CREATE INDEX idx_events_private_request_count ON public.events(private_request_count DESC);
CREATE INDEX idx_club_profiles_heat_average ON public.club_profiles(heat_average DESC);