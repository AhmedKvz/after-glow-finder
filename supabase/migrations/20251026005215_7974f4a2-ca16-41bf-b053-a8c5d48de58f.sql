
-- Drop all foreign keys to auth.users for demo
ALTER TABLE circle_swipe_votes DROP CONSTRAINT IF EXISTS circle_swipe_votes_swiper_id_fkey;
ALTER TABLE circle_swipe_votes DROP CONSTRAINT IF EXISTS circle_swipe_votes_target_id_fkey;
ALTER TABLE circle_swipe_matches DROP CONSTRAINT IF EXISTS circle_swipe_matches_user1_id_fkey;
ALTER TABLE circle_swipe_matches DROP CONSTRAINT IF EXISTS circle_swipe_matches_user2_id_fkey;

-- Now create the data
WITH ev AS (SELECT id FROM events WHERE title = 'Belgrade Underground Techno Night'),
     pids AS (SELECT array_agg(user_id) as ids FROM profiles WHERE gender = 'female' LIMIT 30)
INSERT INTO circle_swipe_sessions (event_id, starts_at, ends_at, participant_ids)
SELECT ev.id, '2025-10-20 07:00:00', '2025-11-20 07:00:00', ARRAY['62eed572-fcba-4005-a760-45c2a2d81aa6'::uuid] || pids.ids
FROM ev, pids;

WITH 
  sess AS (SELECT id FROM circle_swipe_sessions ORDER BY created_at DESC LIMIT 1),
  profiles_list AS (SELECT user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn FROM profiles WHERE gender = 'female' LIMIT 30)
INSERT INTO circle_swipe_votes (session_id, swiper_id, target_id, vote)
SELECT 
  sess.id,
  '62eed572-fcba-4005-a760-45c2a2d81aa6',
  profiles_list.user_id,
  CASE WHEN profiles_list.rn IN (2, 5, 8, 12, 17, 23, 28) THEN 'like'::vote_type ELSE 'pass'::vote_type END
FROM sess, profiles_list;

WITH 
  sess AS (SELECT id FROM circle_swipe_sessions ORDER BY created_at DESC LIMIT 1),
  matched AS (SELECT user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn FROM profiles WHERE gender = 'female' LIMIT 30)
INSERT INTO circle_swipe_votes (session_id, swiper_id, target_id, vote)
SELECT sess.id, matched.user_id, '62eed572-fcba-4005-a760-45c2a2d81aa6', 'like'::vote_type
FROM sess, matched
WHERE matched.rn IN (2, 5, 8, 12, 17, 23, 28);

WITH 
  sess AS (SELECT id FROM circle_swipe_sessions ORDER BY created_at DESC LIMIT 1),
  matched AS (SELECT user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn FROM profiles WHERE gender = 'female' LIMIT 30)
INSERT INTO circle_swipe_matches (session_id, user1_id, user2_id)
SELECT sess.id, '62eed572-fcba-4005-a760-45c2a2d81aa6', matched.user_id
FROM sess, matched
WHERE matched.rn IN (2, 5, 8, 12, 17, 23, 28);
