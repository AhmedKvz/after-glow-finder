
-- Add Swing after party private event
INSERT INTO events (
  host_id,
  title,
  description,
  location,
  date,
  start_time,
  end_time,
  capacity,
  dj_name,
  music_tags,
  bring_own_drinks,
  allow_plus_one,
  allow_plus_two
) VALUES
(
  '62eed572-fcba-4005-a760-45c2a2d81aa6',
  'Swing After Party',
  'Ekskluzivni after party samo za pozvanے goste - swing, electro swing i vintage vibes',
  'Private Location',
  '2025-10-30',
  '02:00',
  '08:00',
  40,
  'DJ Parov Stelar Tribute',
  ARRAY['swing', 'electro swing', 'vintage', 'jazz'],
  true,
  false,
  false
);
