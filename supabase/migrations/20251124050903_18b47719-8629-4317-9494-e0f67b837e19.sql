-- Create club_profiles table
CREATE TABLE public.club_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  logo_image_url TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT club_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.club_profiles ENABLE ROW LEVEL SECURITY;

-- Clubs can view all club profiles
CREATE POLICY "Club profiles are viewable by everyone"
ON public.club_profiles
FOR SELECT
USING (true);

-- Clubs can create their own profile
CREATE POLICY "Clubs can create their own profile"
ON public.club_profiles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'club'
  )
);

-- Clubs can update their own profile
CREATE POLICY "Clubs can update their own profile"
ON public.club_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_club_profiles_updated_at
BEFORE UPDATE ON public.club_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add owner_club_id to events table
ALTER TABLE public.events
ADD COLUMN owner_club_id UUID,
ADD CONSTRAINT events_owner_club_id_fkey FOREIGN KEY (owner_club_id) REFERENCES public.club_profiles(id) ON DELETE SET NULL;

-- Update RLS policy for event creation to require club role
DROP POLICY IF EXISTS "Users can create events" ON public.events;

CREATE POLICY "Clubs can create events"
ON public.events
FOR INSERT
WITH CHECK (
  auth.uid() = host_id AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'club'
  )
);