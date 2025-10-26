-- Add new fields to profiles (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='music_tags') THEN
    ALTER TABLE public.profiles ADD COLUMN music_tags TEXT[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='city') THEN
    ALTER TABLE public.profiles ADD COLUMN city TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='lat') THEN
    ALTER TABLE public.profiles ADD COLUMN lat NUMERIC;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='lng') THEN
    ALTER TABLE public.profiles ADD COLUMN lng NUMERIC;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='gender') THEN
    ALTER TABLE public.profiles ADD COLUMN gender gender_type;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='birthdate') THEN
    ALTER TABLE public.profiles ADD COLUMN birthdate DATE;
  END IF;
END $$;

-- Add music_tags to events if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='music_tags') THEN
    ALTER TABLE public.events ADD COLUMN music_tags TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Create index for events music_tags if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_events_music_tags ON public.events USING GIN(music_tags);

-- Create index for profiles music_tags if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_profiles_music_tags ON public.profiles USING GIN(music_tags);