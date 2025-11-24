-- Insert user reviews for various users
INSERT INTO user_reviews (reviewer_id, reviewed_user_id, rating, comment, event_id) VALUES
-- Reviews for user Kvz888 (62eed572-fcba-4005-a760-45c2a2d81aa6)
('dc2cb392-809a-4a15-ab48-35a986f8940c', '62eed572-fcba-4005-a760-45c2a2d81aa6', 5, 'Amazing host! The after party was incredible, great music selection and vibe. Would definitely attend again! 🎉', '1a6f72a4-27bb-4af3-8276-682ee2501fe2'),
('e39cf884-f55c-4f7d-bc4a-e35e712f672b', '62eed572-fcba-4005-a760-45c2a2d81aa6', 5, 'Best private event I''ve been to! Super welcoming host and great crowd.', 'de685465-9ed2-46c9-8471-e447fe1ff0d1'),
('4ebcf87d-0098-4dad-967e-14d8fb654858', '62eed572-fcba-4005-a760-45c2a2d81aa6', 4, 'Great party, good music. Only minor issue was it got a bit too crowded later.', 'de685465-9ed2-46c9-8471-e447fe1ff0d1'),
('dc2cb392-809a-4a15-ab48-35a986f8940c', '62eed572-fcba-4005-a760-45c2a2d81aa6', 2, '⚠️ WARNING: Host was 2 hours late revealing the address. Very disorganized. Not recommended.', 'd99998a6-7bad-4e25-89d5-9b93d9b5da34'),

-- Reviews for Jerry (dc2cb392-809a-4a15-ab48-35a986f8940c)
('62eed572-fcba-4005-a760-45c2a2d81aa6', 'dc2cb392-809a-4a15-ab48-35a986f8940c', 5, 'Jerry is an amazing club organizer! Every event is perfectly planned and executed. 10/10 experience!', '4b93aec9-517f-4cc4-9b28-7803e31e3290'),
('e39cf884-f55c-4f7d-bc4a-e35e712f672b', 'dc2cb392-809a-4a15-ab48-35a986f8940c', 5, 'Consistently great events. Jerry knows how to pick the best DJs and create perfect atmospheres.', '599fc2ae-22d1-4123-98b8-fbc9f80dc544'),
('4ebcf87d-0098-4dad-967e-14d8fb654858', 'dc2cb392-809a-4a15-ab48-35a986f8940c', 4, 'Good events, but sometimes a bit pricey. Quality is always there though!', 'dba7cf50-eecb-4336-ab76-f65558d164c5'),

-- Reviews for Bezimenko (e39cf884-f55c-4f7d-bc4a-e35e712f672b)
('62eed572-fcba-4005-a760-45c2a2d81aa6', 'e39cf884-f55c-4f7d-bc4a-e35e712f672b', 5, 'Super chill host! Great vibes and really welcoming atmosphere at their events.', 'ca94cb17-0963-4a19-a633-22f37d8c5f88'),
('dc2cb392-809a-4a15-ab48-35a986f8940c', 'e39cf884-f55c-4f7d-bc4a-e35e712f672b', 4, 'Nice person to party with. Good energy and knows how to have fun!', 'ca94cb17-0963-4a19-a633-22f37d8c5f88'),
('4ebcf87d-0098-4dad-967e-14d8fb654858', 'e39cf884-f55c-4f7d-bc4a-e35e712f672b', 3, 'Decent host but the event was a bit disorganized. Could be better.', 'ca94cb17-0963-4a19-a633-22f37d8c5f88'),

-- Reviews for Ze (4ebcf87d-0098-4dad-967e-14d8fb654858)
('62eed572-fcba-4005-a760-45c2a2d81aa6', '4ebcf87d-0098-4dad-967e-14d8fb654858', 4, 'Good host, nice private event. Location was perfect!', '07d4b894-2384-4219-9ce9-975a351fb213'),
('e39cf884-f55c-4f7d-bc4a-e35e712f672b', '4ebcf87d-0098-4dad-967e-14d8fb654858', 5, 'Ze is an amazing host! Very professional and welcoming.', '07d4b894-2384-4219-9ce9-975a351fb213'),
('dc2cb392-809a-4a15-ab48-35a986f8940c', '4ebcf87d-0098-4dad-967e-14d8fb654858', 1, '⚠️ WARNING: Terrible experience. The location was dirty and host was rude to guests. Avoid!', '07d4b894-2384-4219-9ce9-975a351fb213');