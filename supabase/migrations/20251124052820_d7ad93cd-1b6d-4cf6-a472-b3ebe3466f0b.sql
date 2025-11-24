-- Add INSERT policy for event_chats
-- Allow users with valid tickets to create event chats
CREATE POLICY "Ticket holders can create event chats"
ON public.event_chats
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tickets
    WHERE tickets.event_id = event_chats.event_id
      AND tickets.user_id = auth.uid()
      AND tickets.status = 'valid'
  )
);