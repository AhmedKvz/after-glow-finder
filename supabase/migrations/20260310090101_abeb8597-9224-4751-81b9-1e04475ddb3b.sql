
-- Add period_label column
ALTER TABLE public.season_leaderboard ADD COLUMN IF NOT EXISTS period_label TEXT NOT NULL DEFAULT 'Winter 2025';

-- Update existing seasonal rows
UPDATE public.season_leaderboard SET period_label = season_name WHERE period = 'seasonal';

-- Make destination votes publicly readable (drop old restrictive policy, add public one)
DROP POLICY IF EXISTS "Season votes viewable by authenticated" ON public.season_destination_votes;
CREATE POLICY "Votes are public read" ON public.season_destination_votes FOR SELECT USING (true);
