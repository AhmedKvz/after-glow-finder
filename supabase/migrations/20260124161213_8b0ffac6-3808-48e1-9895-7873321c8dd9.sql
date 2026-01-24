-- Delete old expired quests
DELETE FROM quests WHERE expires_at < now();

-- Insert fresh daily quests for all real users
INSERT INTO quests (user_id, title, description, quest_type, xp_reward, status, expires_at)
SELECT 
  p.user_id,
  'Attend Your First Event',
  'Purchase a ticket and attend any event tonight!',
  'daily',
  50,
  'in_progress',
  now() + interval '1 day'
FROM profiles p
WHERE (p.is_demo = false OR p.is_demo IS NULL)
ON CONFLICT DO NOTHING;

INSERT INTO quests (user_id, title, description, quest_type, xp_reward, status, expires_at)
SELECT 
  p.user_id,
  'Swipe 10 Events',
  'Browse and swipe through 10 events in the feed',
  'daily',
  30,
  'in_progress',
  now() + interval '1 day'
FROM profiles p
WHERE (p.is_demo = false OR p.is_demo IS NULL)
ON CONFLICT DO NOTHING;

INSERT INTO quests (user_id, title, description, quest_type, xp_reward, status, expires_at)
SELECT 
  p.user_id,
  'Enter the Circle',
  'Join the Circle Swipe for any event and meet new people',
  'daily',
  40,
  'in_progress',
  now() + interval '1 day'
FROM profiles p
WHERE (p.is_demo = false OR p.is_demo IS NULL)
ON CONFLICT DO NOTHING;

-- Insert weekly quests
INSERT INTO quests (user_id, title, description, quest_type, xp_reward, status, expires_at)
SELECT 
  p.user_id,
  'Social Butterfly',
  'Match with 5 people in Circle Swipe this week',
  'weekly',
  150,
  'in_progress',
  now() + interval '7 days'
FROM profiles p
WHERE (p.is_demo = false OR p.is_demo IS NULL)
ON CONFLICT DO NOTHING;

INSERT INTO quests (user_id, title, description, quest_type, xp_reward, status, expires_at)
SELECT 
  p.user_id,
  'Weekend Warrior',
  'Attend 3 events this weekend to earn bonus XP!',
  'weekly',
  200,
  'in_progress',
  now() + interval '7 days'
FROM profiles p
WHERE (p.is_demo = false OR p.is_demo IS NULL)
ON CONFLICT DO NOTHING;

INSERT INTO quests (user_id, title, description, quest_type, xp_reward, status, expires_at)
SELECT 
  p.user_id,
  'Event Explorer',
  'Save 5 events to your Night Plan wishlist',
  'weekly',
  100,
  'in_progress',
  now() + interval '7 days'
FROM profiles p
WHERE (p.is_demo = false OR p.is_demo IS NULL)
ON CONFLICT DO NOTHING;

-- Insert seasonal quests
INSERT INTO quests (user_id, title, description, quest_type, xp_reward, status, expires_at)
SELECT 
  p.user_id,
  'Party Legend',
  'Attend 25 events this season to become a legend!',
  'seasonal',
  1000,
  'in_progress',
  now() + interval '90 days'
FROM profiles p
WHERE (p.is_demo = false OR p.is_demo IS NULL)
ON CONFLICT DO NOTHING;

INSERT INTO quests (user_id, title, description, quest_type, xp_reward, status, expires_at)
SELECT 
  p.user_id,
  'Circle Champion',
  'Get 50 matches in Circle Swipe this season',
  'seasonal',
  750,
  'in_progress',
  now() + interval '90 days'
FROM profiles p
WHERE (p.is_demo = false OR p.is_demo IS NULL)
ON CONFLICT DO NOTHING;

INSERT INTO quests (user_id, title, description, quest_type, xp_reward, status, expires_at)
SELECT 
  p.user_id,
  'Trusted Member',
  'Reach a trust score of 90% through verified attendance',
  'seasonal',
  500,
  'in_progress',
  now() + interval '90 days'
FROM profiles p
WHERE (p.is_demo = false OR p.is_demo IS NULL)
ON CONFLICT DO NOTHING;