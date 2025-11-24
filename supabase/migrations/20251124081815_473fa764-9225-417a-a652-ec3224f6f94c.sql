-- Create entrance_notifications table
CREATE TABLE IF NOT EXISTS public.entrance_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER DEFAULT 3,
  emoji TEXT DEFAULT '🔥',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.entrance_notifications ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active notifications
CREATE POLICY "Active entrance notifications are viewable by everyone"
  ON public.entrance_notifications
  FOR SELECT
  USING (active = true);

-- Seed with 20 pre-written messages
INSERT INTO public.entrance_notifications (message, active, priority, emoji) VALUES
  ('Someone just checked in 🎉', true, 3, '🎉'),
  ('New secret event unlocked nearby', true, 5, '🔥'),
  ('Your XP just went up +10', true, 2, '⭐'),
  ('3 people added you to their Circle', true, 4, '💜'),
  ('Hot event selling out fast', true, 5, '🔥'),
  ('You''re on fire this week', true, 2, '🔥'),
  ('Someone reviewed your vibe', true, 3, '👀'),
  ('New Golden Ticket winner revealed', true, 4, '✨'),
  ('Club near you is heating up', true, 4, '🌡️'),
  ('Trust score update available', true, 2, '📊'),
  ('After-party location just dropped', true, 5, '🗺️'),
  ('Someone voted you in Circle Swipe', true, 4, '💕'),
  ('Your match is waiting for you', true, 4, '😈'),
  ('Quest completed — claim your reward', true, 3, '🎯'),
  ('You unlocked a new badge', true, 3, '🏆'),
  ('Lucky 100 winner announced', true, 5, '🤑'),
  ('New event review posted', true, 2, '📝'),
  ('Your wishlist event starts in 2h', true, 4, '⏰'),
  ('Hot club just opened bookings', true, 4, '🔓'),
  ('Someone sent you a private request', true, 5, '📬');

-- Create index for faster random selection
CREATE INDEX idx_entrance_notifications_active ON public.entrance_notifications(active) WHERE active = true;