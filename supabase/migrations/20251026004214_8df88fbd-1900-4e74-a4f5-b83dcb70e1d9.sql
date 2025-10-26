
-- Add some test reviews to showcase the reviews system
INSERT INTO event_reviews (event_id, user_id, rating, comment) 
SELECT 
  e.id,
  '62eed572-fcba-4005-a760-45c2a2d81aa6',
  4,
  'Amazing night! Great music and vibes. The DJ was on fire! 🔥'
FROM events e
WHERE e.title = 'Techno Night at Kult'
LIMIT 1;

INSERT INTO event_reviews (event_id, user_id, rating, comment) 
SELECT 
  e.id,
  '62eed572-fcba-4005-a760-45c2a2d81aa6',
  5,
  'Best house party I''ve been to in Belgrade! Will definitely come again.'
FROM events e
WHERE e.title = 'House Music Session'
LIMIT 1;

INSERT INTO event_reviews (event_id, user_id, rating, comment) 
SELECT 
  e.id,
  '62eed572-fcba-4005-a760-45c2a2d81aa6',
  3,
  'Good event but a bit too crowded for my taste.'
FROM events e
WHERE e.title = 'Electronic Vibes Weekend'
LIMIT 1;
