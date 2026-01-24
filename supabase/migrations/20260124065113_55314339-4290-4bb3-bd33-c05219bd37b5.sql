-- KORAK A: Proširenje golden_tickets za credit redemption

-- 1. Dodaj kolone za tracking korišćenja kredita
ALTER TABLE public.golden_tickets
  ADD COLUMN IF NOT EXISTS used_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS used_event_id uuid NULL;

-- Komentari za dokumentaciju
COMMENT ON COLUMN public.golden_tickets.used_at IS 'Timestamp when this credit was redeemed for an event';
COMMENT ON COLUMN public.golden_tickets.used_event_id IS 'Event ID for which this credit was used';

-- 2. Partial index za brze upite aktivnih kredita
CREATE INDEX IF NOT EXISTS idx_golden_tickets_user_active
  ON public.golden_tickets (user_id, created_at DESC)
  WHERE used_at IS NULL AND status = 'active';

-- 3. Foreign key constraint
ALTER TABLE public.golden_tickets
  ADD CONSTRAINT fk_golden_tickets_used_event
  FOREIGN KEY (used_event_id) REFERENCES public.events(id)
  ON DELETE SET NULL;

-- 4. Check constraint za konzistentnost (used_at i used_event_id moraju biti oba NULL ili oba NOT NULL)
ALTER TABLE public.golden_tickets
  ADD CONSTRAINT chk_golden_tickets_used_consistency
  CHECK (
    (used_at IS NULL AND used_event_id IS NULL) OR
    (used_at IS NOT NULL AND used_event_id IS NOT NULL)
  );