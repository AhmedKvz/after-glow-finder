-- Add private after columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS is_private_after boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS public_location_label text,
ADD COLUMN IF NOT EXISTS full_address text,
ADD COLUMN IF NOT EXISTS after_instructions text;

-- Create after_access_requests table
CREATE TABLE IF NOT EXISTS after_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  requester_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  decision_at timestamp with time zone,
  decision_by_user_id uuid,
  UNIQUE(event_id, requester_user_id)
);

-- Enable RLS on after_access_requests
ALTER TABLE after_access_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view their own after requests"
ON after_access_requests
FOR SELECT
USING (auth.uid() = requester_user_id);

-- Users can create their own requests
CREATE POLICY "Users can create after requests"
ON after_access_requests
FOR INSERT
WITH CHECK (auth.uid() = requester_user_id);

-- Hosts can view requests for their events
CREATE POLICY "Hosts can view after requests for their events"
ON after_access_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = after_access_requests.event_id
    AND events.host_id = auth.uid()
  )
);

-- Hosts can update requests for their events
CREATE POLICY "Hosts can update after requests for their events"
ON after_access_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = after_access_requests.event_id
    AND events.host_id = auth.uid()
  )
);

-- Admins can view all requests
CREATE POLICY "Admins can view all after requests"
ON after_access_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update all requests
CREATE POLICY "Admins can update all after requests"
ON after_access_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_after_requests_event ON after_access_requests(event_id);
CREATE INDEX IF NOT EXISTS idx_after_requests_user ON after_access_requests(requester_user_id);
CREATE INDEX IF NOT EXISTS idx_after_requests_status ON after_access_requests(status);