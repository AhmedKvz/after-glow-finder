-- Add new event types to enum
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'secret';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'after';

-- Add secret mode fields to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS is_secret boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS secret_access_level integer,
ADD COLUMN IF NOT EXISTS secret_preview_text text,
ADD COLUMN IF NOT EXISTS secret_cover_blurred text;