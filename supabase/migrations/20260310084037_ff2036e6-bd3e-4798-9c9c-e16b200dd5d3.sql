
-- Season leaderboard table
CREATE TABLE public.season_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  season_name text NOT NULL DEFAULT 'Winter 2025',
  season_xp integer NOT NULL DEFAULT 0,
  season_events integer NOT NULL DEFAULT 0,
  season_quests integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, season_name)
);

ALTER TABLE public.season_leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Season leaderboard viewable by authenticated"
  ON public.season_leaderboard FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own season entry"
  ON public.season_leaderboard FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own season entry"
  ON public.season_leaderboard FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Season destination votes table
CREATE TABLE public.season_destination_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  season_name text NOT NULL DEFAULT 'Winter 2025',
  destination text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, season_name)
);

ALTER TABLE public.season_destination_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Season votes viewable by authenticated"
  ON public.season_destination_votes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own vote"
  ON public.season_destination_votes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
