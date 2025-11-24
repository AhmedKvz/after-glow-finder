-- Update existing private event with exact address
UPDATE events 
SET exact_address = 'Trg republike 5, Ljubljana 1000, Slovenija - 3rd floor, Apartment 12'
WHERE id = '1a6f72a4-27bb-4af3-8276-682ee2501fe2';

-- Create demo user profile
INSERT INTO profiles (user_id, display_name, bio, city, avatar_url)
VALUES 
  ('99999999-9999-9999-9999-999999999999', 'Marko Petrović', 'Volim dobru muziku i odlične aftere!', 'Ljubljana', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marko')
ON CONFLICT (user_id) DO UPDATE 
SET display_name = EXCLUDED.display_name,
    bio = EXCLUDED.bio,
    city = EXCLUDED.city;

-- Create join request from Marko to your private event
INSERT INTO event_access (event_id, user_id, status, message, created_at)
VALUES (
  '1a6f72a4-27bb-4af3-8276-682ee2501fe2',
  '99999999-9999-9999-9999-999999999999',
  'requested',
  'Cao! Bio sam na vašem prošlom partiju i bilo je odlično. Mogu li da dođem na ovaj after? 🎉',
  now()
)
ON CONFLICT DO NOTHING;