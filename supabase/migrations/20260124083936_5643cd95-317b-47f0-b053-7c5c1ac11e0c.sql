-- Shift all events 2 months forward so they appear as upcoming
UPDATE events 
SET date = date + INTERVAL '2 months'
WHERE date < '2026-01-24';