import { useState, useEffect } from 'react';
import { Ticket, QrCode, Calendar, MapPin, Clock, Check, Star, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2 } from 'lucide-react';
import { ReviewEventModal } from '@/components/ReviewEventModal';
import { useNavigate } from 'react-router-dom';

export const MyTickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [selectedEventForReview, setSelectedEventForReview] = useState<any | null>(null);
  const [reviews, setReviews] = useState<Record<string, any>>({});

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user]);

  const loadTickets = async () => {
    if (!user) return;

    const { data: ticketsData, error } = await supabase
      .from('tickets')
      .select(`
        *,
        events (*)
      `)
      .eq('user_id', user.id)
      .order('purchase_date', { ascending: false });

    if (ticketsData) {
      setTickets(ticketsData);
      
      // Load reviews for these events
      const eventIds = ticketsData.map(t => t.event_id);
      const { data: reviewsData } = await supabase
        .from('event_reviews')
        .select('*')
        .in('event_id', eventIds)
        .eq('user_id', user.id);
      
      if (reviewsData) {
        const reviewsMap = reviewsData.reduce((acc, review) => {
          acc[review.event_id] = review;
          return acc;
        }, {} as Record<string, any>);
        setReviews(reviewsMap);
      }
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-500/20 text-green-500';
      case 'used': return 'bg-blue-500/20 text-blue-500';
      case 'expired': return 'bg-gray-500/20 text-gray-500';
      case 'refunded': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card className="glass-card p-8 text-center">
        <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold mb-2">No tickets yet</h3>
        <p className="text-sm text-muted-foreground">
          Purchase tickets for events to see them here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => {
        const event = ticket.events;
        const isPast = new Date(event?.date) < new Date();
        const hasReview = reviews[event?.id];
        
        return (
          <Card key={ticket.id} className="glass-card p-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                <Ticket className="w-8 h-8 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg truncate">{event?.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin size={14} />
                      <span className="truncate">{event?.location}</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {event?.date && new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {event?.start_time}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border/20">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Ticket Code</p>
                      <p className="font-mono font-semibold">{ticket.ticket_code}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedTicket(ticket)}
                      className="glass-card"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Show QR
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {event?.event_type === 'club' && ticket.status === 'valid' && (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/event/${event.id}/chat`)}
                        className="w-full gradient-primary"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Open Event Chat
                      </Button>
                    )}
                    
                    {isPast && (
                      <Button
                        size="sm"
                        variant={hasReview ? "outline" : "default"}
                        onClick={() => setSelectedEventForReview(event)}
                        className={hasReview ? "w-full glass-card" : "w-full gradient-primary"}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        {hasReview ? 'Edit Review' : 'Leave Review'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      {/* QR Code Modal */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="glass-card max-w-sm">
            <DialogHeader>
              <DialogTitle>Ticket QR Code</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg">
                <QRCodeSVG
                  value={selectedTicket.qr_code_data || selectedTicket.ticket_code}
                  size={256}
                  level="H"
                  includeMargin={true}
                  className="w-full h-auto"
                />
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Ticket Code</p>
                <p className="font-mono text-xl font-bold">{selectedTicket.ticket_code}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Event</span>
                  <span className="font-medium">{selectedTicket.events?.title}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(selectedTicket.status)}>
                    {selectedTicket.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Purchased</span>
                  <span className="font-medium">
                    {new Date(selectedTicket.purchase_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {selectedTicket.status === 'valid' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-500">
                    <p className="font-medium">Valid Ticket</p>
                    <p className="text-xs opacity-80">Show this QR code at the entrance</p>
                  </div>
                </div>
              )}

              <Button
                onClick={() => setSelectedTicket(null)}
                className="w-full"
                variant="outline"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Review Modal */}
      {selectedEventForReview && (
        <ReviewEventModal
          open={!!selectedEventForReview}
          onOpenChange={(open) => !open && setSelectedEventForReview(null)}
          event={selectedEventForReview}
          existingReview={reviews[selectedEventForReview.id]}
          onSuccess={() => {
            loadTickets();
            setSelectedEventForReview(null);
          }}
        />
      )}
    </div>
  );
};
