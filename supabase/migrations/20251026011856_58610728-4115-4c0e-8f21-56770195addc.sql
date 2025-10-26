-- Add is_private field to events table and requires_approval for private events
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS requires_approval boolean DEFAULT true;

-- Update event_orders to support request status workflow
COMMENT ON COLUMN event_orders.status IS 'Status: pending (waiting for approval), approved (can attend), declined (rejected)';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_event_orders_status ON event_orders(status);
CREATE INDEX IF NOT EXISTS idx_event_orders_event_user ON event_orders(event_id, user_id);