
-- Add reviews for club events with mix of good and bad ratings
INSERT INTO event_reviews (event_id, user_id, rating, comment) VALUES
-- Belgrade Underground Techno Night
('599fc2ae-22d1-4123-98b8-fbc9f80dc544', '2925e718-527b-4f0e-8631-d1b4698919e7', 5, 'Amazing atmosphere! The DJ was incredible and the crowd was so energetic. Best techno night I''ve been to in Belgrade!'),
('599fc2ae-22d1-4123-98b8-fbc9f80dc544', 'e46bd093-e885-4724-84fd-9fb9b4def117', 4, 'Great music and vibes. Only downside was it got a bit too crowded after midnight.'),
('599fc2ae-22d1-4123-98b8-fbc9f80dc544', '7fd39941-1913-45e7-ad29-28dac052830c', 2, '⚠️ WARNING: Sound system was way too loud, my ears were ringing for 2 days. Security was also very aggressive at the entrance.'),

-- 20/44 Deep House Night
('dba7cf50-eecb-4336-ab76-f65558d164c5', '3aeaa22a-cc03-45e4-9726-e00c5eaf4e1c', 5, 'Perfect deep house selection. The resident DJ knows how to read the room. 20/44 never disappoints!'),
('dba7cf50-eecb-4336-ab76-f65558d164c5', 'f5a88099-1422-4b51-a7c9-c306dd7f939a', 4, 'Loved the music and the intimate setting. Drinks are a bit pricey though.'),

-- Drugstore Techno Session
('805652c0-0d64-4682-baf6-bd651e03f6f2', '7495769d-3fbc-4aa6-aacf-5cb38b126626', 5, 'Drugstore is always a vibe! Great techno, great people, great night overall.'),
('805652c0-0d64-4682-baf6-bd651e03f6f2', 'c43b90c8-ad76-4230-bccd-5a370073710e', 1, '⚠️ AVOID: Found the bartender serving drinks without proper hygiene. Also witnessed drug dealing openly happening near the bathroom. Very unsafe environment.'),
('805652c0-0d64-4682-baf6-bd651e03f6f2', 'd00c559e-2eab-43f6-8cf4-97802d6fd78d', 4, 'Despite some issues, the music was on point. DJ really brought it.'),

-- Karmakoma Drum & Bass Night
('285e6168-6285-4d67-9dea-598307891117', 'b3032600-de51-439d-b475-10563dbd6e08', 5, 'Karmakoma never misses! The drum & bass lineup was absolutely insane. Will definitely be back!'),
('285e6168-6285-4d67-9dea-598307891117', '45993521-16ec-458d-a36b-1a828ea81abe', 5, 'Best D&B night in Belgrade hands down. Energy was off the charts!'),

-- KPTM Underground Rave
('6c1a71b6-9284-472d-bc88-22a4e049d684', '0879f59a-e19c-448a-aa97-e45cfacc99c3', 3, 'Music was okay but the venue was way too hot and stuffy. Ventilation needs serious improvement.'),
('6c1a71b6-9284-472d-bc88-22a4e049d684', 'b4a99ffd-234d-4f56-a217-b290cf70ebbb', 4, 'Raw underground vibes, exactly what you expect from KPTM. Loved it!'),

-- Hangar Techno Marathon
('869ecf04-1f74-4fb8-bec3-25849b2700b7', 'fa826473-ed0c-4772-b07b-dad4f6659546', 5, 'Marathon indeed! 12 hours of non-stop techno. The venue is massive and the production was top-notch.'),
('869ecf04-1f74-4fb8-bec3-25849b2700b7', '9c172490-f93f-4c74-8388-b758900e4a65', 2, '⚠️ WARNING: Security confiscated my sealed water bottle and forced me to buy overpriced water inside. Feels like a scam. Also, emergency exits were blocked.'),

-- Tunnel Warehouse Rave
('f442bfc9-92e4-4875-b285-f09f7a6e5018', 'b50e5ace-58b2-4f97-8e84-abaf04d2744c', 5, 'Raw industrial techno in an actual tunnel! Such a unique experience. Sound system was phenomenal.'),
('f442bfc9-92e4-4875-b285-f09f7a6e5018', '03a5c7cf-8ab4-4ed8-a887-6521f00593ea', 4, 'Great atmosphere but getting there was confusing. Better directions needed.'),

-- Techno Night at Kult
('4b93aec9-517f-4cc4-9b28-7803e31e3290', 'd66889bf-d6c6-4bc0-a779-0d4d9d01ff10', 5, 'Kult is a legendary venue for a reason. Always delivers quality techno nights!'),
('4b93aec9-517f-4cc4-9b28-7803e31e3290', '8923610e-624e-4798-a7b2-45a5aef768fe', 4, 'Solid night out. Music was great, crowd was friendly.'),

-- Dvorište Open Air Session
('5f04f2d3-126b-48d1-9bae-edcb559bbb84', '9d46db8e-a28f-45b0-a09a-78a59da18adf', 5, 'Perfect summer vibes! Open air techno under the stars. Can''t wait for the next one!'),

-- Mladost Cultural Center Party
('3748ded2-e566-4b6d-9960-a28215736aaf', '146e34b4-dbc6-4a2b-b2c7-0f37311f5c9f', 4, 'Great cultural space, interesting crowd mix. Music was eclectic and fun.'),
('3748ded2-e566-4b6d-9960-a28215736aaf', '2925e718-527b-4f0e-8631-d1b4698919e7', 3, 'Expected more from a cultural center event. Sound quality was poor and the space felt cramped.'),

-- Art x Music Gallery Opening
('96fff9a0-181b-48cb-bc6b-0508102a5198', 'e46bd093-e885-4724-84fd-9fb9b4def117', 5, 'Incredible fusion of art and music! The gallery space was beautiful and the DJ set was perfect.'),
('96fff9a0-181b-48cb-bc6b-0508102a5198', '7fd39941-1913-45e7-ad29-28dac052830c', 4, 'Loved the concept. Great networking opportunity with the art crowd.'),

-- Danube Boat Party
('3d88ba51-6f22-445c-9305-67d145583474', '3aeaa22a-cc03-45e4-9726-e00c5eaf4e1c', 5, 'What a unique experience! Dancing on the Danube with sunset views was magical.'),
('3d88ba51-6f22-445c-9305-67d145583474', 'f5a88099-1422-4b51-a7c9-c306dd7f939a', 2, '⚠️ WARNING: Boat was overcrowded beyond safe capacity. Felt very unsafe and claustrophobic. Staff seemed overwhelmed and unprepared.'),

-- Rooftop Sunset Session
('f7d4083d-5586-4478-8b86-2d79da96fbec', '7495769d-3fbc-4aa6-aacf-5cb38b126626', 5, 'Absolutely stunning! Watching the sunset while the DJ played was unforgettable.'),
('f7d4083d-5586-4478-8b86-2d79da96fbec', 'c43b90c8-ad76-4230-bccd-5a370073710e', 4, 'Beautiful location and great music. A bit pricey but worth it for the views.'),

-- Indie Rock Night
('79d95bd0-8942-4c34-b917-58541117b606', 'd00c559e-2eab-43f6-8cf4-97802d6fd78d', 4, 'Great live bands! Refreshing to hear rock music in the Belgrade scene.'),

-- Telma-Nixon Jazz Festival
('9d3f2f99-8935-439a-b685-a7f52b97e998', 'b3032600-de51-439d-b475-10563dbd6e08', 5, 'World-class jazz performances! The festival atmosphere was incredible.'),

-- Electronic Vibes Weekend
('559a7725-7793-4681-af8f-378ee61fbeb3', '45993521-16ec-458d-a36b-1a828ea81abe', 4, 'Two days of electronic music bliss! Great variety of DJs and styles.'),

-- House Music Session
('660f0b4d-7cca-4333-9d69-f3f02239e2e5', '0879f59a-e19c-448a-aa97-e45cfacc99c3', 5, 'Pure house music vibes! The DJ selection was on point all night.'),

-- Cafe events
-- Jazz Night at Kafeterija
('14647155-1b25-41f7-b3ef-f4b22c75f202', 'b4a99ffd-234d-4f56-a217-b290cf70ebbb', 5, 'Intimate jazz session in a cozy cafe setting. The trio was excellent!'),
('14647155-1b25-41f7-b3ef-f4b22c75f202', 'fa826473-ed0c-4772-b07b-dad4f6659546', 4, 'Great atmosphere and talented musicians. Coffee was amazing too!'),

-- Acoustic Vibes at Che
('a8a09a52-68f0-40a4-8fe9-bc0c348198fb', '9c172490-f93f-4c74-8388-b758900e4a65', 5, 'Perfect acoustic night! The artist was incredibly talented and the cafe has such a warm vibe.'),

-- DJ Set at Bitef Art Cafe
('4d965c20-14c9-42ac-afbb-2c0d0b69ebc9', 'b50e5ace-58b2-4f97-8e84-abaf04d2744c', 4, 'Cool art cafe with good music. Free entry is a big plus!'),
('4d965c20-14c9-42ac-afbb-2c0d0b69ebc9', '03a5c7cf-8ab4-4ed8-a887-6521f00593ea', 2, '⚠️ WARNING: DJ was playing way too loud for a cafe setting. Couldn''t have a conversation. Also, service was extremely slow and staff seemed annoyed.'),

-- Live Band at Bajloni
('b91ce499-4ca7-4ca8-b247-011fdee75b85', 'd66889bf-d6c6-4bc0-a779-0d4d9d01ff10', 5, 'Amazing live band! Bajloni always hosts quality acts. Great energy!'),

-- Open Mic at Smokvica
('8be1daa9-82da-4cff-b26e-ee1c50a67cbd', '8923610e-624e-4798-a7b2-45a5aef768fe', 4, 'Fun open mic night with lots of local talent. Supportive crowd!'),

-- Private events
-- Jelena Rooftop After
('23a51268-a370-42cd-9892-69576801f8ac', '9d46db8e-a28f-45b0-a09a-78a59da18adf', 5, 'Best private after party! Jelena knows how to host. The rooftop was beautiful!'),

-- Marija After Session
('99f99b43-8c6a-4e76-8385-5bbbe0cd6e0b', '146e34b4-dbc6-4a2b-b2c7-0f37311f5c9f', 4, 'Great vibes and friendly people. Music was perfect for an after party.'),

-- Katarina Penthouse After
('7dac035f-0f22-426f-9b93-1bb4b50dfcdc', '2925e718-527b-4f0e-8631-d1b4698919e7', 5, 'Luxurious penthouse with amazing views! Katarina is the perfect host.'),

-- After kod Ane
('87c57973-6793-4ff2-8ec7-8b57c054a600', 'e46bd093-e885-4724-84fd-9fb9b4def117', 3, 'Decent party but apartment was too small for the number of people invited.'),

-- Milica Garden Party
('ec654674-6cbb-47e4-aab1-e17dc472e788', '7fd39941-1913-45e7-ad29-28dac052830c', 5, 'Beautiful garden setting! Perfect for summer after party. Milica thought of everything!'),

-- Teodora Art Studio After
('e7737175-b3ac-476d-bf5a-b4b8fe5355f4', '3aeaa22a-cc03-45e4-9726-e00c5eaf4e1c', 4, 'Creative space with interesting art pieces. Great intimate vibe!'),

-- Sara After kod Zemuna
('c26b7236-3888-4edc-81b1-f8d9bcca445a', 'f5a88099-1422-4b51-a7c9-c306dd7f939a', 1, '⚠️ AVOID: Party got way out of hand. Neighbors called police twice. Host was drunk and couldn''t control the crowd. Very uncomfortable situation.')
