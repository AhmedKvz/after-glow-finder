
-- Add period column to season_leaderboard for weekly/monthly/seasonal separation
ALTER TABLE public.season_leaderboard ADD COLUMN IF NOT EXISTS period text NOT NULL DEFAULT 'seasonal';

-- Drop old unique constraint and add new one with period
ALTER TABLE public.season_leaderboard DROP CONSTRAINT IF EXISTS season_leaderboard_user_id_season_name_key;
ALTER TABLE public.season_leaderboard ADD CONSTRAINT season_leaderboard_user_id_season_period_key UNIQUE (user_id, season_name, period);

-- Create index on period
CREATE INDEX IF NOT EXISTS idx_season_leaderboard_period ON public.season_leaderboard(period);
