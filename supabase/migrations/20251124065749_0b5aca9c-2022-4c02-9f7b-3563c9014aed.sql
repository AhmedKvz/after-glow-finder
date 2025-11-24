-- Add preferred guest filtering fields to events table
ALTER TABLE public.events
ADD COLUMN preferred_levels text[] DEFAULT '{}',
ADD COLUMN min_trust_score numeric DEFAULT 0,
ADD COLUMN vibe_tags text[] DEFAULT '{}';

-- Add preference matching fields to after_access_requests table
ALTER TABLE public.after_access_requests
ADD COLUMN is_within_preference boolean DEFAULT true,
ADD COLUMN reason_flag text;