-- Assign roles
INSERT INTO public.user_roles (user_id, role) VALUES 
  ('dc2cb392-809a-4a15-ab48-35a986f8940c', 'admin'),  -- Jerry as admin
  ('62eed572-fcba-4005-a760-45c2a2d81aa6', 'user')    -- Kvz888 as regular user
ON CONFLICT (user_id, role) DO NOTHING;

-- Update all club events to be owned by admin (Jerry)
UPDATE public.events 
SET host_id = 'dc2cb392-809a-4a15-ab48-35a986f8940c'
WHERE event_type = 'club';