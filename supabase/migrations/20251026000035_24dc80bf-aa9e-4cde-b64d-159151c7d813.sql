-- Create gender enum for profiles
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'hidden');

-- Create venues table
CREATE TABLE public.venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  lat NUMERIC,
  lng NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on venues
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Venues are viewable by everyone
CREATE POLICY "Venues are viewable by everyone"
ON public.venues
FOR SELECT
USING (true);

-- Add new fields to profiles
ALTER TABLE public.profiles
ADD COLUMN music_tags TEXT[] DEFAULT '{}',
ADD COLUMN city TEXT,
ADD COLUMN lat NUMERIC,
ADD COLUMN lng NUMERIC,
ADD COLUMN gender gender_type,
ADD COLUMN birthdate DATE;

-- Add music_tags and venue_id to events
ALTER TABLE public.events
ADD COLUMN music_tags TEXT[] DEFAULT '{}',
ADD COLUMN venue_id UUID REFERENCES public.venues(id);

-- Create index for events music_tags (GIN for array searches)
CREATE INDEX idx_events_music_tags ON public.events USING GIN(music_tags);

-- Create index for profiles music_tags
CREATE INDEX idx_profiles_music_tags ON public.profiles USING GIN(music_tags);

-- Create checkins table (for QR code check-in system)
CREATE TABLE public.checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS on checkins
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- Users can view their own checkins
CREATE POLICY "Users can view their own checkins"
ON public.checkins
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own checkins
CREATE POLICY "Users can create checkins"
ON public.checkins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Event hosts can view checkins for their events
CREATE POLICY "Hosts can view checkins for their events"
ON public.checkins
FOR SELECT
USING (
  auth.uid() IN (
    SELECT host_id FROM public.events WHERE id = event_id
  )
);

-- Create index for checkins queries
CREATE INDEX idx_checkins_user_event ON public.checkins(user_id, event_id);
CREATE INDEX idx_checkins_event_time ON public.checkins(event_id, checked_in_at DESC);

-- Add trigger for venues updated_at
CREATE TRIGGER update_venues_updated_at
BEFORE UPDATE ON public.venues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();