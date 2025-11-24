-- Enable RLS on event_access table
ALTER TABLE event_access ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own access requests
CREATE POLICY "Users can view their own access requests"
ON event_access
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can insert their own access requests
CREATE POLICY "Users can create access requests"
ON event_access
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Event hosts can see all access requests for their events
CREATE POLICY "Event hosts can view access requests for their events"
ON event_access
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_access.event_id
    AND events.host_id = auth.uid()
  )
);

-- Policy: Event hosts can update access request statuses for their events
CREATE POLICY "Event hosts can update access requests for their events"
ON event_access
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_access.event_id
    AND events.host_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_access.event_id
    AND events.host_id = auth.uid()
  )
);