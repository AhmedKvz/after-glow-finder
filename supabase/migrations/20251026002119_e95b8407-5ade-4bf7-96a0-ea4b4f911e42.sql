-- Create tickets table for event ticketing system
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_code TEXT NOT NULL UNIQUE,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'expired', 'refunded')),
  qr_code_data TEXT,
  payment_intent_id TEXT,
  price_paid NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS on tickets
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view their own tickets"
ON public.tickets
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own tickets (purchase)
CREATE POLICY "Users can purchase tickets"
ON public.tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Event hosts can view tickets for their events
CREATE POLICY "Hosts can view tickets for their events"
ON public.tickets
FOR SELECT
USING (
  auth.uid() IN (
    SELECT host_id FROM public.events WHERE id = event_id
  )
);

-- Event hosts can update ticket status (for check-in)
CREATE POLICY "Hosts can update ticket status"
ON public.tickets
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT host_id FROM public.events WHERE id = event_id
  )
);

-- Create indexes for tickets
CREATE INDEX idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX idx_tickets_code ON public.tickets(ticket_code);
CREATE INDEX idx_tickets_status ON public.tickets(status);

-- Add trigger for tickets updated_at
CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique ticket code
CREATE OR REPLACE FUNCTION public.generate_ticket_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;