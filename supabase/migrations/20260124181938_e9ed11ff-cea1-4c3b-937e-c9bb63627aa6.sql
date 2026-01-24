-- Create a safe discovery view that NEVER exposes sensitive location data
-- This ensures frontend can never accidentally leak addresses

CREATE OR REPLACE VIEW public_events_discovery AS
SELECT 
  id,
  title,
  description,
  date,
  start_time,
  end_time,
  location,  -- coarse location (neighborhood/venue name)
  public_location_label,
  is_location_hidden,
  capacity,
  event_type,
  is_private,
  is_secret,
  host_id,
  dj_name,
  music_tags,
  vibe_tags,
  heat_score,
  heat_badge,
  poster_url,
  ticket_link,
  blog_link,
  bring_own_drinks,
  allow_plus_one,
  swipe_count,
  wishlist_user_ids,
  attendee_user_ids,
  ticketing_enabled,
  created_at,
  updated_at
FROM events
WHERE 
  -- Exclude secret private_host events (invite-only)
  NOT (event_type = 'private_host' AND is_secret = true);

-- Grant read access to the view
GRANT SELECT ON public_events_discovery TO authenticated;
GRANT SELECT ON public_events_discovery TO anon;

-- Add visibility column to events if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'visibility'
  ) THEN
    ALTER TABLE events ADD COLUMN visibility text DEFAULT 'public';
  END IF;
END $$;

COMMENT ON VIEW public_events_discovery IS 'Safe view for discovery - excludes exact_address, full_address, after_instructions';