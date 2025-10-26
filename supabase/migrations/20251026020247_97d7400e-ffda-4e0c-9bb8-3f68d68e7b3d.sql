-- Update two events to be Private Host events for testing
UPDATE events 
SET 
  event_type = 'private_host',
  is_location_hidden = true,
  join_request_required = true,
  ticketing_enabled = false
WHERE id IN (
  'de685465-9ed2-46c9-8471-e447fe1ff0d1', -- Noć Veštica kod Bebi Dol na stanu
  '1dcf8b9f-1b85-49b2-a8c5-0e4d68e3d3db'  -- Stefan Birthday Bash 🎂
);