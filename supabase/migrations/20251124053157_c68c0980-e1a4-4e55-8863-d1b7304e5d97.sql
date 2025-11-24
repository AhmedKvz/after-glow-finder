-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Chat members can view members list" ON public.event_chat_members;

-- Create a better policy that doesn't cause recursion
-- Allow users to see members of chats they have tickets for
CREATE POLICY "Chat members can view members list"
ON public.event_chat_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.event_chats ec
    JOIN public.tickets t ON t.event_id = ec.event_id
    WHERE ec.id = event_chat_members.chat_id
      AND t.user_id = auth.uid()
      AND t.status = 'valid'
  )
);