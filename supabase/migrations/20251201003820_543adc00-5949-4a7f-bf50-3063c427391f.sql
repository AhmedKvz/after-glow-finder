-- Create blog_posts table for event articles and blog content
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  preview_text TEXT,
  thumbnail_url TEXT,
  content_url TEXT NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  active BOOLEAN DEFAULT true
);

-- Enable RLS on blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Active blog posts are viewable by everyone
CREATE POLICY "Active blog posts are viewable by everyone"
  ON public.blog_posts
  FOR SELECT
  USING (active = true);

-- Admins can manage blog posts
CREATE POLICY "Admins can manage blog posts"
  ON public.blog_posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add new columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS ticket_link TEXT,
ADD COLUMN IF NOT EXISTS blog_link TEXT,
ADD COLUMN IF NOT EXISTS poster_url TEXT;

-- Create index for blog post queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_active ON public.blog_posts(active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_event ON public.blog_posts(event_id) WHERE event_id IS NOT NULL;

-- Seed demo blog posts
INSERT INTO public.blog_posts (title, preview_text, thumbnail_url, content_url, active) VALUES
('5 Rules for Surviving Belgrade Afterparties', 'From underground raves to exclusive rooftop sessions, learn how to navigate the wild Belgrade nightlife scene like a pro.', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400', 'https://example.com/blog/surviving-belgrade-afterparties', true),
('Techno Scene Guide: Best Clubs 2024', 'Deep dive into Belgrade''s thriving techno underground, featuring the hottest venues and resident DJs you need to know.', 'https://images.unsplash.com/photo-1571266028243-d220c8f1df90?w=400', 'https://example.com/blog/techno-scene-guide', true),
('Secret Locations: Hidden Gems of Belgrade Nightlife', 'Discover the city''s most exclusive and hard-to-find party spots that only locals know about.', 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=400', 'https://example.com/blog/secret-locations', true),
('After-Party Etiquette: Do''s and Don''ts', 'Essential guide to behaving at private afterparties—respect the host, know the vibe, and always bring good energy.', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', 'https://example.com/blog/afterparty-etiquette', true),
('Interview: DJ Marko on Belgrade Underground', 'Exclusive conversation with one of the city''s most influential underground DJs about the evolution of the local scene.', 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?w=400', 'https://example.com/blog/dj-marko-interview', true)
ON CONFLICT DO NOTHING;