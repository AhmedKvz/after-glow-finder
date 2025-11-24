-- Create golden_tickets table
CREATE TABLE public.golden_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  source text NOT NULL DEFAULT 'ManualReward',
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add golden ticket fields to profiles
ALTER TABLE public.profiles
ADD COLUMN has_golden_ticket boolean DEFAULT false,
ADD COLUMN golden_ticket_count integer DEFAULT 0;

-- Add golden_only field to events
ALTER TABLE public.events
ADD COLUMN golden_only boolean DEFAULT false;

-- Enable RLS on golden_tickets
ALTER TABLE public.golden_tickets ENABLE ROW LEVEL SECURITY;

-- RLS policies for golden_tickets
CREATE POLICY "Users can view their own golden tickets"
ON public.golden_tickets
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all golden tickets"
ON public.golden_tickets
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert golden tickets"
ON public.golden_tickets
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update golden tickets"
ON public.golden_tickets
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_golden_tickets_updated_at
BEFORE UPDATE ON public.golden_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to issue golden ticket
CREATE OR REPLACE FUNCTION public.issue_golden_ticket(
  _user_id uuid,
  _source text DEFAULT 'ManualReward',
  _expires_at timestamptz DEFAULT NULL,
  _notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _ticket_id uuid;
BEGIN
  -- Create golden ticket
  INSERT INTO public.golden_tickets (user_id, source, expires_at, notes)
  VALUES (_user_id, _source, _expires_at, _notes)
  RETURNING id INTO _ticket_id;
  
  -- Update user profile
  UPDATE public.profiles
  SET 
    has_golden_ticket = true,
    golden_ticket_count = golden_ticket_count + 1
  WHERE user_id = _user_id;
  
  RETURN _ticket_id;
END;
$$;