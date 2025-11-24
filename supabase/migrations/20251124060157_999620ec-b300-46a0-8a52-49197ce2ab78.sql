-- Insert mock user profile for testing join requests
INSERT INTO public.profiles (user_id, display_name, bio, city, music_tags, avatar_url)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Alex Thompson', 'Love techno and house parties!', 'Ljubljana', ARRAY['Techno', 'House'], 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'),
  ('22222222-2222-2222-2222-222222222222', 'Maria Garcia', 'Weekend warrior seeking good vibes', 'Ljubljana', ARRAY['EDM', 'Bass'], 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria')
ON CONFLICT (user_id) DO NOTHING;

-- Insert mock join requests for private events (using 'requested' status)
INSERT INTO public.event_access (event_id, user_id, status, message, created_at)
SELECT 
  e.id,
  '11111111-1111-1111-1111-111111111111',
  'requested',
  'Hey! Would love to join this event. Heard great things about your parties from friends!',
  now() - interval '2 hours'
FROM events e
WHERE e.event_type = 'private_host'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.event_access (event_id, user_id, status, message, created_at)
SELECT 
  e.id,
  '22222222-2222-2222-2222-222222222222',
  'requested',
  'This sounds amazing! I''m new to Ljubljana and looking for cool after-parties to meet people.',
  now() - interval '30 minutes'
FROM events e
WHERE e.event_type = 'private_host'
LIMIT 1
ON CONFLICT DO NOTHING;