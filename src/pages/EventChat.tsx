import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

const EventChat = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);
  const [eventTitle, setEventTitle] = useState<string>('');

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check access and load chat
  useEffect(() => {
    const checkAccessAndLoadChat = async () => {
      if (!user || !eventId) return;

      try {
        // Check if user has valid ticket
        const { data: ticketData } = await supabase
          .from('tickets')
          .select('status')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .eq('status', 'valid')
          .maybeSingle();

        if (!ticketData) {
          toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'Chat is only for ticket holders'
          });
          navigate(`/discover`);
          return;
        }

        // Get event title
        const { data: eventData } = await supabase
          .from('events')
          .select('title')
          .eq('id', eventId)
          .single();

        if (eventData) {
          setEventTitle(eventData.title);
        }

        // Get or create chat
        let { data: chatData } = await supabase
          .from('event_chats')
          .select('id')
          .eq('event_id', eventId)
          .maybeSingle();

        if (!chatData) {
          // Create chat if it doesn't exist
          const { data: newChat, error: createError } = await supabase
            .from('event_chats')
            .insert({ event_id: eventId })
            .select('id')
            .single();

          if (createError) {
            console.error('Error creating chat:', createError);
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Failed to load chat'
            });
            navigate(`/discover`);
            return;
          }

          chatData = newChat;
        }

        setChatId(chatData.id);

        // Check if user is already a member
        const { data: memberData } = await supabase
          .from('event_chat_members')
          .select('id')
          .eq('chat_id', chatData.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!memberData) {
          // Add user as member
          const { error: memberError } = await supabase
            .from('event_chat_members')
            .insert({
              chat_id: chatData.id,
              user_id: user.id
            });

          if (memberError && memberError.code !== '23505') {
            console.error('Error adding member:', memberError);
          }
        }

        // Load messages
        loadMessages(chatData.id);
      } catch (error) {
        console.error('Error loading chat:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load chat'
        });
        navigate(`/discover`);
      } finally {
        setLoading(false);
      }
    };

    checkAccessAndLoadChat();
  }, [user, eventId, navigate, toast]);

  // Load messages
  const loadMessages = async (chatId: string) => {
    const { data, error } = await supabase
      .from('event_chat_messages')
      .select(`
        id,
        user_id,
        message,
        created_at
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    if (!data) {
      setMessages([]);
      return;
    }

    // Fetch profiles separately
    const userIds = [...new Set(data.map(msg => msg.user_id))];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', userIds);

    const profilesMap = new Map(
      profilesData?.map(p => [p.user_id, p]) || []
    );

    const messagesWithProfiles = data.map(msg => ({
      ...msg,
      profiles: profilesMap.get(msg.user_id) || null
    }));

    // Add demo messages for MVP showcase
    const demoMessages: ChatMessage[] = [
      {
        id: 'demo-1',
        user_id: 'demo-user-1',
        message: 'Please be safe, police is in front of the door in civil clothes 👮‍♂️',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        profiles: {
          display_name: 'Marko',
          avatar_url: null
        }
      },
      {
        id: 'demo-2',
        user_id: 'demo-user-2',
        message: 'Thanks for the heads up! Anyone seen the coat check?',
        created_at: new Date(Date.now() - 3300000).toISOString(),
        profiles: {
          display_name: 'Ana',
          avatar_url: null
        }
      },
      {
        id: 'demo-3',
        user_id: 'demo-user-3',
        message: 'Coat check is on the left when you enter. Line is moving fast 👍',
        created_at: new Date(Date.now() - 3000000).toISOString(),
        profiles: {
          display_name: 'Stefan',
          avatar_url: null
        }
      },
      {
        id: 'demo-4',
        user_id: 'demo-user-4',
        message: 'DJ is absolutely killing it tonight! 🔥🔥🔥',
        created_at: new Date(Date.now() - 2700000).toISOString(),
        profiles: {
          display_name: 'Jelena',
          avatar_url: null
        }
      },
      {
        id: 'demo-5',
        user_id: 'demo-user-5',
        message: 'Meeting outside for a smoke in 5 min if anyone wants to join',
        created_at: new Date(Date.now() - 1800000).toISOString(),
        profiles: {
          display_name: 'Nikola',
          avatar_url: null
        }
      }
    ];

    setMessages([...demoMessages, ...messagesWithProfiles]);
  };

  // Subscribe to new messages
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel('event-chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_chat_messages',
          filter: `chat_id=eq.${chatId}`
        },
        async (payload) => {
          // Fetch the profile data for the new message
          const { data: profileData } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', payload.new.user_id)
            .single();

          const newMessage: ChatMessage = {
            id: payload.new.id,
            user_id: payload.new.user_id,
            message: payload.new.message,
            created_at: payload.new.created_at,
            profiles: profileData
          };

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId || !user) return;

    // Rate limiting: 30 seconds between messages
    const now = Date.now();
    if (now - lastMessageTime < 30000) {
      toast({
        variant: 'destructive',
        title: 'Polako!',
        description: 'Sačekaj malo pre nove poruke.'
      });
      return;
    }

    setSending(true);

    try {
      const { error } = await supabase
        .from('event_chat_messages')
        .insert({
          chat_id: chatId,
          user_id: user.id,
          message: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      setLastMessageTime(now);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message'
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/discover')}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-lg">{eventTitle || 'Event Chat'}</h1>
            <p className="text-sm text-muted-foreground">Ticket holders only</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.length === 0 ? (
            <Card className="glass-card p-8 text-center">
              <p className="text-muted-foreground">
                No messages yet. Be the first to say hello!
              </p>
            </Card>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.user_id === user?.id;
              const displayName = msg.profiles?.display_name || 'Anonymous';
              const avatarUrl = msg.profiles?.avatar_url;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'text-right' : ''}`}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-medium">{displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <Card
                      className={`inline-block p-3 ${
                        isOwnMessage
                          ? 'gradient-primary text-white'
                          : 'glass-card'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.message}
                      </p>
                    </Card>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={sending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="gradient-primary"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventChat;
