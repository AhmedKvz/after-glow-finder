-- Reset votes for user to allow re-swiping
DELETE FROM circle_swipe_votes 
WHERE session_id = 'f5e55cbc-6628-4813-8e8f-9db104952f23' 
AND swiper_id = '62eed572-fcba-4005-a760-45c2a2d81aa6';