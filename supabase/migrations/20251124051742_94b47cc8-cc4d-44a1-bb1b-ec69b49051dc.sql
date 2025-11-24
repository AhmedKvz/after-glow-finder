-- Create event_chats table
CREATE TABLE public.event_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT event_chats_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE
);

-- Create event_chat_members table
CREATE TABLE public.event_chat_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT event_chat_members_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.event_chats(id) ON DELETE CASCADE,
  CONSTRAINT event_chat_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT event_chat_members_chat_user_unique UNIQUE (chat_id, user_id)
);

-- Create event_chat_messages table
CREATE TABLE public.event_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT event_chat_messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.event_chats(id) ON DELETE CASCADE,
  CONSTRAINT event_chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.event_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_chats
CREATE POLICY "Event chats are viewable by ticket holders"
ON public.event_chats
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tickets
    WHERE tickets.event_id = event_chats.event_id
      AND tickets.user_id = auth.uid()
      AND tickets.status = 'valid'
  )
);

-- RLS Policies for event_chat_members
CREATE POLICY "Chat members can view members list"
ON public.event_chat_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.event_chat_members ecm
    WHERE ecm.chat_id = event_chat_members.chat_id
      AND ecm.user_id = auth.uid()
  )
);

CREATE POLICY "Ticket holders can join chat"
ON public.event_chat_members
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.event_chats ec
    JOIN public.tickets t ON t.event_id = ec.event_id
    WHERE ec.id = event_chat_members.chat_id
      AND t.user_id = auth.uid()
      AND t.status = 'valid'
  )
);

-- RLS Policies for event_chat_messages
CREATE POLICY "Chat members can view messages"
ON public.event_chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.event_chat_members
    WHERE event_chat_members.chat_id = event_chat_messages.chat_id
      AND event_chat_members.user_id = auth.uid()
  )
);

CREATE POLICY "Chat members can send messages"
ON public.event_chat_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.event_chat_members
    WHERE event_chat_members.chat_id = event_chat_messages.chat_id
      AND event_chat_members.user_id = auth.uid()
  )
);

-- Add indexes for performance
CREATE INDEX idx_event_chats_event_id ON public.event_chats(event_id);
CREATE INDEX idx_event_chat_members_chat_id ON public.event_chat_members(chat_id);
CREATE INDEX idx_event_chat_members_user_id ON public.event_chat_members(user_id);
CREATE INDEX idx_event_chat_messages_chat_id ON public.event_chat_messages(chat_id);
CREATE INDEX idx_event_chat_messages_created_at ON public.event_chat_messages(created_at);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE event_chat_messages;