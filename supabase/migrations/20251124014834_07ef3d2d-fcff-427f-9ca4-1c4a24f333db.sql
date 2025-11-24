-- Seed mock event reviews for key clubs and cafes so ratings appear on Discover/Search
-- KPTM Underground Rave (club)
INSERT INTO public.event_reviews (event_id, user_id, rating, comment)
VALUES
  ('6c1a71b6-9284-472d-bc88-22a4e049d684', 'dc2cb392-809a-4a15-ab48-35a986f8940c', 5,
   'Always packed with real ravers, deep techno and a proper underground KPTM vibe.');

-- Open Mic at Smokvica (cafe)
INSERT INTO public.event_reviews (event_id, user_id, rating, comment)
VALUES
  ('8be1daa9-82da-4cff-b26e-ee1c50a67cbd', 'e39cf884-f55c-4f7d-bc4a-e35e712f672b', 4,
   'Always good people and jazz music, Smokvica open mic is perfect for a chill night.'),
  ('8be1daa9-82da-4cff-b26e-ee1c50a67cbd', '4ebcf87d-0098-4dad-967e-14d8fb654858', 5,
   'Love this place – cozy crowd, great cocktails and live sets feel very local.');

-- Jazz Night at Kafeterija (cafe)
INSERT INTO public.event_reviews (event_id, user_id, rating, comment)
VALUES
  ('14647155-1b25-41f7-b3ef-f4b22c75f202', '62eed572-fcba-4005-a760-45c2a2d81aa6', 5,
   'Proper jazz heads, great sound and super friendly staff – must visit for jazz lovers.'),
  ('14647155-1b25-41f7-b3ef-f4b22c75f202', 'dc2cb392-809a-4a15-ab48-35a986f8940c', 4,
   'Nice crowd and live band, sometimes packed but always with good energy.');

-- DJ Set at Bitef Art Cafe (cafe)
INSERT INTO public.event_reviews (event_id, user_id, rating, comment)
VALUES
  ('4d965c20-14c9-42ac-afbb-2c0d0b69ebc9', 'e39cf884-f55c-4f7d-bc4a-e35e712f672b', 5,
   'Top tier sound, mixed crowd and quality bookings – Bitef is a safe bet for a night out.'),
  ('4d965c20-14c9-42ac-afbb-2c0d0b69ebc9', '4ebcf87d-0098-4dad-967e-14d8fb654858', 4,
   'Good vibe and production, a bit pricey but always delivers.');

-- Belgrade Underground Techno Night (club)
INSERT INTO public.event_reviews (event_id, user_id, rating, comment)
VALUES
  ('599fc2ae-22d1-4123-98b8-fbc9f80dc544', '62eed572-fcba-4005-a760-45c2a2d81aa6', 5,
   'Classic Belgrade techno – dark room, strong system and no tourists.');

-- Drugstore Techno Session (club)
INSERT INTO public.event_reviews (event_id, user_id, rating, comment)
VALUES
  ('805652c0-0d64-4682-baf6-bd651e03f6f2', 'dc2cb392-809a-4a15-ab48-35a986f8940c', 5,
   'Warehouse rave feeling, late hours and heavy techno all night.'),
  ('805652c0-0d64-4682-baf6-bd651e03f6f2', 'e39cf884-f55c-4f7d-bc4a-e35e712f672b', 4,
   'Best when big names play, can be intense but unforgettable nights.');

-- Dvorište Open Air Session (club)
INSERT INTO public.event_reviews (event_id, user_id, rating, comment)
VALUES
  ('5f04f2d3-126b-48d1-9bae-edcb559bbb84', '4ebcf87d-0098-4dad-967e-14d8fb654858', 5,
   'Summer open-air gem – friendly crowd, house music and relaxed garden vibes.');

-- Karmakoma Drum & Bass Night (club)
INSERT INTO public.event_reviews (event_id, user_id, rating, comment)
VALUES
  ('285e6168-6285-4d67-9dea-598307891117', '62eed572-fcba-4005-a760-45c2a2d81aa6', 4,
   'Real DnB heads, heavy bass and intimate crowd – proper Karmakoma night.');

-- Rooftop Sunset Session (club)
INSERT INTO public.event_reviews (event_id, user_id, rating, comment)
VALUES
  ('f7d4083d-5586-4478-8b86-2d79da96fbec', 'e39cf884-f55c-4f7d-bc4a-e35e712f672b', 5,
   'Perfect sunset view, melodic house and a mix of locals and visitors.'),
  ('f7d4083d-5586-4478-8b86-2d79da96fbec', '4ebcf87d-0098-4dad-967e-14d8fb654858', 4,
   'Great for warm-up before going deeper into the night.');

-- Live Band at Bajloni (cafe)
INSERT INTO public.event_reviews (event_id, user_id, rating, comment)
VALUES
  ('b91ce499-4ca7-4ca8-b247-011fdee75b85', 'dc2cb392-809a-4a15-ab48-35a986f8940c', 4,
   'Busy but fun, live band and drinks make it a solid start of the night.');

-- Swing After Party (club)
INSERT INTO public.event_reviews (event_id, user_id, rating, comment)
VALUES
  ('1b26213e-1417-4ac1-b8ba-701f8809790b', '62eed572-fcba-4005-a760-45c2a2d81aa6', 5,
   'Late-night destination after main clubs, always someone still dancing.');


-- Seed extra host reputation reviews (user_reviews) for key private hosts
-- Main private host (Kvz888)
INSERT INTO public.user_reviews (reviewer_id, reviewed_user_id, rating, comment)
VALUES
  ('dc2cb392-809a-4a15-ab48-35a986f8940c', '62eed572-fcba-4005-a760-45c2a2d81aa6', 5,
   'Always respectful with neighbors, good music curation and safe after vibes.'),
  ('e39cf884-f55c-4f7d-bc4a-e35e712f672b', '62eed572-fcba-4005-a760-45c2a2d81aa6', 4,
   'Great host for smaller groups, everyone feels welcome and taken care of.');

-- Private host Bezimenko
INSERT INTO public.user_reviews (reviewer_id, reviewed_user_id, rating, comment)
VALUES
  ('62eed572-fcba-4005-a760-45c2a2d81aa6', 'e39cf884-f55c-4f7d-bc4a-e35e712f672b', 5,
   'Knows all good spots in the city and always brings relaxed people together.');

-- Private host Ze
INSERT INTO public.user_reviews (reviewer_id, reviewed_user_id, rating, comment)
VALUES
  ('dc2cb392-809a-4a15-ab48-35a986f8940c', '4ebcf87d-0098-4dad-967e-14d8fb654858', 4,
   'Very reliable host, clean place and honest about capacity every time.');