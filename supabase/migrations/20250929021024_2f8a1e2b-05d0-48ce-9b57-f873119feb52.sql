-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  exact_address TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER NOT NULL,
  dj_name TEXT,
  bring_own_drinks BOOLEAN DEFAULT false,
  allow_plus_one BOOLEAN DEFAULT false,
  allow_plus_two BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create events policies
CREATE POLICY "Events are viewable by everyone" 
ON public.events 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their own events" 
ON public.events 
FOR UPDATE 
USING (auth.uid() = host_id);

-- Create event orders table (for tracking who attended/joined events)
CREATE TABLE public.event_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'declined')),
  plus_guests INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS on event orders
ALTER TABLE public.event_orders ENABLE ROW LEVEL SECURITY;

-- Create event orders policies
CREATE POLICY "Users can view their own orders" 
ON public.event_orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Hosts can view orders for their events" 
ON public.event_orders 
FOR SELECT 
USING (auth.uid() IN (SELECT host_id FROM public.events WHERE id = event_id));

CREATE POLICY "Users can create orders" 
ON public.event_orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hosts can update orders for their events" 
ON public.event_orders 
FOR UPDATE 
USING (auth.uid() IN (SELECT host_id FROM public.events WHERE id = event_id));

-- Create Circle Swipe sessions table
CREATE TABLE public.circle_swipe_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  participant_ids UUID[] NOT NULL DEFAULT '{}',
  entry_price_eur DECIMAL(10,2) NOT NULL DEFAULT 3.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on circle swipe sessions
ALTER TABLE public.circle_swipe_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Circle swipe sessions are viewable by participants" 
ON public.circle_swipe_sessions 
FOR SELECT 
USING (auth.uid() = ANY(participant_ids));

-- Create Circle Swipe entries table
CREATE TABLE public.circle_swipe_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.circle_swipe_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paid BOOLEAN DEFAULT false,
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Enable RLS on circle swipe entries
ALTER TABLE public.circle_swipe_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own entries" 
ON public.circle_swipe_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries" 
ON public.circle_swipe_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create Circle Swipe votes table
CREATE TYPE public.vote_type AS ENUM ('like', 'pass');

CREATE TABLE public.circle_swipe_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.circle_swipe_sessions(id) ON DELETE CASCADE,
  swiper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote public.vote_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, swiper_id, target_id)
);

-- Enable RLS on circle swipe votes
ALTER TABLE public.circle_swipe_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view votes in their sessions" 
ON public.circle_swipe_votes 
FOR SELECT 
USING (
  auth.uid() = swiper_id OR 
  auth.uid() = target_id OR
  auth.uid() IN (
    SELECT UNNEST(participant_ids) 
    FROM public.circle_swipe_sessions 
    WHERE id = session_id
  )
);

CREATE POLICY "Users can create votes" 
ON public.circle_swipe_votes 
FOR INSERT 
WITH CHECK (auth.uid() = swiper_id);

-- Create Circle Swipe matches table
CREATE TABLE public.circle_swipe_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.circle_swipe_sessions(id) ON DELETE CASCADE,
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_id UUID, -- This would reference a chat/inbox table when implemented
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, user1_id, user2_id)
);

-- Enable RLS on circle swipe matches
ALTER TABLE public.circle_swipe_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own matches" 
ON public.circle_swipe_matches 
FOR SELECT 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_orders_updated_at
  BEFORE UPDATE ON public.event_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to create circle swipe session automatically after event ends
CREATE OR REPLACE FUNCTION public.create_circle_swipe_session_after_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create session if event has ended
  IF NEW.date + NEW.end_time <= now() AND (OLD.date + OLD.end_time > now() OR OLD IS NULL) THEN
    INSERT INTO public.circle_swipe_sessions (
      event_id,
      starts_at,
      ends_at,
      participant_ids
    )
    VALUES (
      NEW.id,
      now(),
      now() + INTERVAL '48 hours',
      ARRAY(
        SELECT user_id 
        FROM public.event_orders 
        WHERE event_id = NEW.id AND status = 'approved'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;