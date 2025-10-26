
-- Create reviews system tables

-- Table for event reviews
CREATE TABLE public.event_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Table for user reviews (peer reviews)
CREATE TABLE public.user_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID NOT NULL,
  reviewed_user_id UUID NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reviewer_id, reviewed_user_id, event_id),
  CHECK (reviewer_id != reviewed_user_id)
);

-- Enable RLS
ALTER TABLE public.event_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_reviews
CREATE POLICY "Event reviews are viewable by everyone"
  ON public.event_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create event reviews"
  ON public.event_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM tickets 
      WHERE tickets.user_id = auth.uid() 
      AND tickets.event_id = event_reviews.event_id
      AND tickets.status = 'valid'
    )
  );

CREATE POLICY "Users can update their own event reviews"
  ON public.event_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own event reviews"
  ON public.event_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_reviews
CREATE POLICY "User reviews are viewable by everyone"
  ON public.user_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create user reviews"
  ON public.user_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND reviewer_id != reviewed_user_id
  );

CREATE POLICY "Users can update their own user reviews"
  ON public.user_reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own user reviews"
  ON public.user_reviews FOR DELETE
  USING (auth.uid() = reviewer_id);

-- Create indexes for better performance
CREATE INDEX idx_event_reviews_event_id ON public.event_reviews(event_id);
CREATE INDEX idx_event_reviews_user_id ON public.event_reviews(user_id);
CREATE INDEX idx_user_reviews_reviewed_user_id ON public.user_reviews(reviewed_user_id);
CREATE INDEX idx_user_reviews_reviewer_id ON public.user_reviews(reviewer_id);

-- Add updated_at trigger for event_reviews
CREATE TRIGGER update_event_reviews_updated_at
  BEFORE UPDATE ON public.event_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for user_reviews
CREATE TRIGGER update_user_reviews_updated_at
  BEFORE UPDATE ON public.user_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
