-- Create event_type enum
CREATE TYPE public.event_type AS ENUM ('club', 'private_host');

-- Create event_access table for private host join requests
CREATE TABLE public.event_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('requested', 'approved', 'rejected', 'blocked')),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create indexes for event_access
CREATE INDEX idx_event_access_user_status ON public.event_access(user_id, status);
CREATE INDEX idx_event_access_event ON public.event_access(event_id);

-- Enable RLS on event_access
ALTER TABLE public.event_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_access
CREATE POLICY "Users can create join requests"
  ON public.event_access FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own requests"
  ON public.event_access FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Hosts can view requests for their events"
  ON public.event_access FOR SELECT
  USING (
    auth.uid() IN (
      SELECT host_id FROM public.events WHERE id = event_access.event_id
    )
  );

CREATE POLICY "Hosts can update requests for their events"
  ON public.event_access FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT host_id FROM public.events WHERE id = event_access.event_id
    )
  );

-- Add new columns to events table
ALTER TABLE public.events 
  ADD COLUMN event_type public.event_type NOT NULL DEFAULT 'club',
  ADD COLUMN is_location_hidden BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN ticketing_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN join_request_required BOOLEAN NOT NULL DEFAULT false;

-- Create trigger function to validate event type settings
CREATE OR REPLACE FUNCTION public.validate_event_type_settings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_type = 'club' THEN
    NEW.ticketing_enabled := true;
    NEW.join_request_required := false;
    NEW.is_location_hidden := false;
  ELSIF NEW.event_type = 'private_host' THEN
    NEW.ticketing_enabled := false;
    NEW.join_request_required := true;
    NEW.is_location_hidden := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to ensure event type consistency
CREATE TRIGGER ensure_event_type_consistency
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_event_type_settings();

-- Add trigger for updated_at on event_access
CREATE TRIGGER update_event_access_updated_at
  BEFORE UPDATE ON public.event_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();