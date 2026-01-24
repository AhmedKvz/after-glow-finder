import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { CreditCard, CheckCircle, Loader2, Ticket, Sparkles } from 'lucide-react';
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
  const [hasLucky100Credit, setHasLucky100Credit] = useState(false);
  const [checkingCredit, setCheckingCredit] = useState(true);
  
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  // Check if user has an active Lucky100 credit
  useEffect(() => {
    const checkLucky100Credit = async () => {
      if (!user || !open) {
        setHasLucky100Credit(false);
        setCheckingCredit(false);
        return;
      }

      setCheckingCredit(true);
      const { data, error } = await supabase
        .from('golden_tickets')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .is('used_at', null)
        .in('source', ['Lucky100', 'Lucky100Demo'])
        .or('expires_at.is.null,expires_at.gt.now()')
        .limit(1);

      if (!error && data && data.length > 0) {
        setHasLucky100Credit(true);
      } else {
        setHasLucky100Credit(false);
      }
      setCheckingCredit(false);
    };

    checkLucky100Credit();
  }, [user, open]);

  const handleUseLucky100Credit = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not logged in",
        description: "Please log in to use your credit"
      });
      return;
    }

    setLoading(true);
    setStep('processing');

    const { data, error } = await supabase.rpc('redeem_lucky100_event_credit', {
      _event_id: event.id
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Could not redeem credit",
        description: error.message
      });
      setStep('payment');
      setLoading(false);
      return;
    }

    setStep('success');
    setLoading(false);
    setHasLucky100Credit(false);

    toast({
      title: "🎉 Lucky 100 Credit Used!",
      description: "Your free ticket has been added to your profile"
    });

    onSuccess?.();
  };

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
          <div className="space-y-4">
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

            {/* Lucky 100 Credit Option */}
            {!checkingCredit && hasLucky100Credit && (
              <Card className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-200">Lucky 100 Credit Available!</h4>
                    <p className="text-xs text-amber-300/70">Use your free event credit</p>
                  </div>
                </div>
                <Button
                  onClick={handleUseLucky100Credit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  Use Lucky 100 Credit
                </Button>
              </Card>
            )}

            {checkingCredit && (
              <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Checking for credits...
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {hasLucky100Credit ? 'Or pay with card' : 'Pay with card'}
                </span>
              </div>
            </div>

            <form onSubmit={handlePurchase} className="space-y-4">
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
          </div>
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
