-- Insert sample quests for demo purposes
-- These will be visible to all users (we'll update the RLS policies to allow insertion by system)

-- First, allow system to insert quests
CREATE POLICY "System can insert quests"
ON quests
FOR INSERT
WITH CHECK (true);

-- Insert sample daily quests
INSERT INTO quests (user_id, title, description, quest_type, xp_reward, status, expires_at)
SELECT 
  '62eed572-fcba-4005-a760-45c2a2d81aa6',
  'Attend Your First Event',
  'Purchase a ticket and attend any event tonight!',
  'daily',
  50,
  'in_progress',
  now() + interval '24 hours'
WHERE NOT EXISTS (
  SELECT 1 FROM quests 
  WHERE user_id = '62eed572-fcba-4005-a760-45c2a2d81aa6' 
  AND title = 'Attend Your First Event'
);

INSERT INTO quests (user_id, title, description, quest_type, xp_reward, status, expires_at)
SELECT 
  '62eed572-fcba-4005-a760-45c2a2d81aa6',
  'Swipe 10 Events',
  'Browse and swipe through 10 events in the feed',
  'daily',
  30,
  'in_progress',
  now() + interval '24 hours'
WHERE NOT EXISTS (
  SELECT 1 FROM quests 
  WHERE user_id = '62eed572-fcba-4005-a760-45c2a2d81aa6' 
  AND title = 'Swipe 10 Events'
);

-- Insert weekly quest
INSERT INTO quests (user_id, title, description, quest_type, xp_reward, status, expires_at)
SELECT 
  '62eed572-fcba-4005-a760-45c2a2d81aa6',
  'Weekend Warrior',
  'Attend 3 events this weekend to earn bonus XP!',
  'weekly',
  200,
  'in_progress',
  now() + interval '7 days'
WHERE NOT EXISTS (
  SELECT 1 FROM quests 
  WHERE user_id = '62eed572-fcba-4005-a760-45c2a2d81aa6' 
  AND title = 'Weekend Warrior'
);

INSERT INTO quests (user_id, title, description, quest_type, xp_reward, status, expires_at)
SELECT 
  '62eed572-fcba-4005-a760-45c2a2d81aa6',
  'Social Butterfly',
  'Match with 5 people in Circle Swipe',
  'weekly',
  150,
  'in_progress',
  now() + interval '7 days'
WHERE NOT EXISTS (
  SELECT 1 FROM quests 
  WHERE user_id = '62eed572-fcba-4005-a760-45c2a2d81aa6' 
  AND title = 'Social Butterfly'
);

-- Insert seasonal quest
INSERT INTO quests (user_id, title, description, quest_type, xp_reward, status, expires_at)
SELECT 
  '62eed572-fcba-4005-a760-45c2a2d81aa6',
  'Party Legend',
  'Attend 25 events this season to become a legend!',
  'seasonal',
  1000,
  'in_progress',
  now() + interval '90 days'
WHERE NOT EXISTS (
  SELECT 1 FROM quests 
  WHERE user_id = '62eed572-fcba-4005-a760-45c2a2d81aa6' 
  AND title = 'Party Legend'
);

-- Give the user some starting XP and stats
UPDATE profiles
SET 
  xp = 250,
  level = 'Explorer',
  trust_score = 75.0,
  events_attended = 3,
  badges = '["Early Adopter", "First Timer"]'::jsonb
WHERE user_id = '62eed572-fcba-4005-a760-45c2a2d81aa6';