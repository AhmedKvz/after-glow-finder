import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BuyTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
  onSuccess?: () => void;
}

export const BuyTicketModal = ({ open, onOpenChange, event, onSuccess }: BuyTicketModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'payment' | 'processing' | 'success'>('payment');
  const [loading, setLoading] = useState(false);
  
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      // Reset form and step when modal closes
      setStep('payment');
      setCardData({ number: '', name: '', expiry: '', cvv: '' });
      setLoading(false);
    }
    onOpenChange(nextOpen);
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard for event type
    if (event.event_type !== 'club' || !event.ticketing_enabled) {
      toast({
        variant: "destructive",
        title: "Tickets not available",
        description: "This event doesn't support ticket purchases"
      });
      return;
    }
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not logged in",
        description: "Please log in to purchase tickets"
      });
      return;
    }

    setLoading(true);
    setStep('processing');

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate ticket code
    const ticketCode = generateTicketCode();
    const qrData = JSON.stringify({
      ticket_code: ticketCode,
      event_id: event.id,
      user_id: user.id,
      event_title: event.title,
      date: event.date
    });

    // Create ticket in database
    const { error: ticketError } = await supabase
      .from('tickets')
      .insert({
        event_id: event.id,
        user_id: user.id,
        ticket_code: ticketCode,
        qr_code_data: qrData,
        price_paid: 0, // Free for MVP, will be event.price later
        status: 'valid'
      });

    if (ticketError) {
      toast({
        variant: "destructive",
        title: "Purchase failed",
        description: ticketError.message
      });
      setStep('payment');
      setLoading(false);
      return;
    }

    // Add user to event chat
    try {
      // Find or create event chat
      let { data: chatData, error: chatFetchError } = await supabase
        .from('event_chats')
        .select('id')
        .eq('event_id', event.id)
        .maybeSingle();

      if (chatFetchError && chatFetchError.code !== 'PGRST116') {
        console.error('Error fetching chat:', chatFetchError);
      }

      if (!chatData) {
        // Create new chat for this event
        const { data: newChat, error: chatCreateError } = await supabase
          .from('event_chats')
          .insert({ event_id: event.id })
          .select('id')
          .single();

        if (chatCreateError) {
          console.error('Error creating chat:', chatCreateError);
        } else {
          chatData = newChat;
        }
      }

      // Add user as chat member if chat exists
      if (chatData) {
        const { error: memberError } = await supabase
          .from('event_chat_members')
          .insert({
            chat_id: chatData.id,
            user_id: user.id
          })
          .select()
          .maybeSingle();

        // Ignore duplicate key errors (user already in chat)
        if (memberError && memberError.code !== '23505') {
          console.error('Error adding chat member:', memberError);
        }
      }
    } catch (chatError) {
      console.error('Error setting up chat:', chatError);
      // Don't fail the ticket purchase if chat setup fails
    }

    setStep('success');
    setLoading(false);

    toast({
      title: "Ticket purchased!",
      description: "Your ticket has been added to your profile"
    });

    // Notify parent to refresh data, but keep modal open until user closes it
    onSuccess?.();
  };

  const generateTicketCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substr(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substr(0, 2) + '/' + cleaned.substr(2, 2);
    }
    return cleaned;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="glass-card max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'payment' && 'Purchase Ticket'}
            {step === 'processing' && 'Processing Payment'}
            {step === 'success' && 'Purchase Complete'}
          </DialogTitle>
        </DialogHeader>

        {step === 'payment' && (
          <form onSubmit={handlePurchase} className="space-y-4">
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10">
              <h3 className="font-semibold mb-1">{event.title}</h3>
              <p className="text-sm text-muted-foreground">{event.location}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(event.date).toLocaleDateString()} • {event.start_time}
              </p>
              <div className="mt-3 pt-3 border-t border-border/20">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="text-2xl font-bold text-primary">FREE</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  MVP Mode: All tickets are free
                </p>
              </div>
            </Card>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                    maxLength={19}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-name">Cardholder Name</Label>
                <Input
                  id="card-name"
                  placeholder="JOHN DOE"
                  value={cardData.name}
                  onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={cardData.expiry}
                    onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                    maxLength={5}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').substr(0, 3) })}
                    maxLength={3}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-accent/10 rounded-lg p-3 text-sm text-accent-foreground">
              💡 This is a mock payment. No real charges will be made.
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 gradient-primary"
                disabled={loading}
              >
                Purchase Ticket
              </Button>
            </div>
          </form>
        )}

        {step === 'processing' && (
          <div className="py-8 text-center">
            <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we process your transaction...
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
            <p className="text-sm text-muted-foreground">
              Your ticket has been added to your profile.
              <br />
              You can access it anytime in the Profile tab.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
