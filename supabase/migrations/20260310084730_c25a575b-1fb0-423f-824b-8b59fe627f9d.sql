
-- Add missing columns to season_leaderboard
ALTER TABLE public.season_leaderboard ADD COLUMN IF NOT EXISTS rank INTEGER;
ALTER TABLE public.season_leaderboard ADD COLUMN IF NOT EXISTS is_winner BOOLEAN DEFAULT false;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_season_leaderboard_xp ON public.season_leaderboard(season_xp DESC);
CREATE INDEX IF NOT EXISTS idx_season_leaderboard_season ON public.season_leaderboard(season_name);
CREATE INDEX IF NOT EXISTS idx_destination_votes_season ON public.season_destination_votes(season_name, destination);

-- Add CHECK constraint on destination
ALTER TABLE public.season_destination_votes ADD CONSTRAINT chk_destination_valid CHECK (destination IN ('south_america', 'tokyo', 'georgia'));

-- Seed current season from existing profiles XP
INSERT INTO public.season_leaderboard (user_id, season_name, season_xp, season_events, season_quests)
SELECT
  p.user_id,
  'Winter 2025',
  COALESCE(p.xp, 0),
  COALESCE(p.events_attended, 0),
  0
FROM public.profiles p
WHERE (p.is_demo = false OR p.is_demo IS NULL)
ON CONFLICT (user_id, season_name) DO NOTHING;
