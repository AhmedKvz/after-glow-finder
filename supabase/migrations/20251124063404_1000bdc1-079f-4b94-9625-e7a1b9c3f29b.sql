-- Add gamification fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS level text DEFAULT 'Newbie',
ADD COLUMN IF NOT EXISTS trust_score numeric DEFAULT 50.0,
ADD COLUMN IF NOT EXISTS badges jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS events_attended integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS afters_hosted integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS lucky100_wins integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS vip_status boolean DEFAULT false;

-- Add gamification fields to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS xp_reward integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS swipe_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS wishlist_user_ids jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS attendee_user_ids jsonb DEFAULT '[]'::jsonb;

-- Add fields to tickets table
ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS is_lucky100_winner boolean DEFAULT false;

-- Add weight to event_reviews
ALTER TABLE event_reviews
ADD COLUMN IF NOT EXISTS weight numeric DEFAULT 1.0;

-- Add gamification fields to club_profiles
ALTER TABLE club_profiles
ADD COLUMN IF NOT EXISTS club_reputation numeric DEFAULT 50.0,
ADD COLUMN IF NOT EXISTS club_badges jsonb DEFAULT '[]'::jsonb;

-- Create quests table
CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  quest_type text NOT NULL CHECK (quest_type IN ('daily', 'weekly', 'seasonal')),
  xp_reward integer NOT NULL DEFAULT 10,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  completed_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on quests
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

-- Users can view their own quests
CREATE POLICY "Users can view their own quests"
ON quests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own quests
CREATE POLICY "Users can update their own quests"
ON quests
FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quests_user ON quests(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_status ON quests(status);
CREATE INDEX IF NOT EXISTS idx_quests_type ON quests(quest_type);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_afters_hosted ON profiles(afters_hosted DESC);

-- Add trust preview and shared events to after_access_requests
ALTER TABLE after_access_requests
ADD COLUMN IF NOT EXISTS trust_preview text,
ADD COLUMN IF NOT EXISTS shared_events_count integer DEFAULT 0;

-- Create function to auto-update level based on XP
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.xp >= 10000 THEN
    NEW.level := 'Legend';
  ELSIF NEW.xp >= 5000 THEN
    NEW.level := 'VIP';
  ELSIF NEW.xp >= 2000 THEN
    NEW.level := 'Pro';
  ELSIF NEW.xp >= 1000 THEN
    NEW.level := 'Regular';
  ELSIF NEW.xp >= 500 THEN
    NEW.level := 'Rising Star';
  ELSIF NEW.xp >= 100 THEN
    NEW.level := 'Explorer';
  ELSE
    NEW.level := 'Newbie';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for level updates
DROP TRIGGER IF EXISTS trigger_update_user_level ON profiles;
CREATE TRIGGER trigger_update_user_level
BEFORE INSERT OR UPDATE OF xp ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_user_level();