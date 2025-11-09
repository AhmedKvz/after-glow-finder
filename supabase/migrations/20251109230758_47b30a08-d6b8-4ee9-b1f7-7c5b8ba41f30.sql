-- Add Telma-Nixon Jazz Festival club event
INSERT INTO events (
  host_id,
  title,
  description,
  location,
  event_type,
  date,
  start_time,
  end_time,
  capacity,
  music_tags,
  ticketing_enabled,
  join_request_required,
  is_location_hidden
) VALUES (
  'dc2cb392-809a-4a15-ab48-35a986f8940c',
  'Telma-Nixon Jazz Festival',
  'Odlicno mesto za pree clubbing',
  'Telma-Nixon Club, Bulevar Kralja Aleksandra',
  'club',
  '2025-11-01',
  '20:00',
  '02:00',
  200,
  ARRAY['jazz', 'fusion', 'lounge'],
  true,
  false,
  false
);