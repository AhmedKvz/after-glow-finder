import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Users, Clock, Star, Check, X, Calendar, Music, MessageSquare, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Event, EventRequest } from '@/types';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useToast } from '@/hooks/use-toast';
import { ReviewsList } from '@/components/ReviewsList';
import { RequestToJoinModal } from '@/components/RequestToJoinModal';
import { BuyTicketModal } from '@/components/BuyTicketModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import eventPoster1 from '@/assets/event-poster-1.jpg';
import eventPoster2 from '@/assets/event-poster-2.jpg';
import eventPoster3 from '@/assets/event-poster-3.jpg';

interface EventDetailsProps {
  event: Event;
  onBack: () => void;
}

const posterImages = [eventPoster1, eventPoster2, eventPoster3];

export const EventDetails: React.FC<EventDetailsProps> = ({ event, onBack }) => {
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'approved' | 'declined'>('none');
  const [selectedPlusOnes, setSelectedPlusOnes] = useState('0');
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  
  const { user } = useAuth();
  const { isDemoMode, showDemoSuccess } = useDemoMode();
  const { toast } = useToast();
  
  const posterImage = posterImages[event.id.charCodeAt(0) % posterImages.length];
  
  // Check if user already has an order for this event
  useEffect(() => {
    if (!user) return;
    
    const checkExistingOrder = async () => {
      const { data } = await supabase
        .from('event_orders')
        .select('status')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data && data.status) {
        const status = data.status as 'pending' | 'approved' | 'declined';
        setRequestStatus(status);
      }
    };
    
    checkExistingOrder();
  }, [user, event.id]);
  
  const handleJoinRequest = () => {
    if (!event.isPrivate) {
      // Show ticket purchase for public events
      setShowTicketDialog(true);
    } else {
      // Show request dialog for private events
      setShowRequestDialog(true);
    }
  };
  
  const getStatusButton = () => {
    switch (requestStatus) {
      case 'pending':
        return (
          <Button disabled className="w-full glass-card">
            <Clock className="w-4 h-4 mr-2" />
            Pending Approval
          </Button>
        );
      case 'approved':
        return (
          <Button disabled className="w-full gradient-primary text-white">
            <Check className="w-4 h-4 mr-2" />
            You're In!
          </Button>
        );
      case 'declined':
        return (
          <Button disabled variant="destructive" className="w-full">
            <X className="w-4 h-4 mr-2" />
            Request Declined
          </Button>
        );
      default:
        return (
          <Button onClick={handleJoinRequest} className="w-full gradient-primary text-white shadow-primary">
            {event.isPrivate ? (
              <>
                <Users className="w-4 h-4 mr-2" />
                Request to Join
              </>
            ) : (
              <>
                <Ticket className="w-4 h-4 mr-2" />
                Get Ticket
              </>
            )}
          </Button>
        );
    }
  };
  
  const isLocationVisible = !event.isPrivate || requestStatus === 'approved';
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={posterImage}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="absolute top-4 left-4 safe-top bg-black/20 text-white hover:bg-black/40"
        >
          <ArrowLeft size={16} />
        </Button>
        
        {/* Private badge */}
        {event.isPrivate && (
          <Badge className="absolute top-4 right-4 safe-top bg-accent text-accent-foreground">
            Private
          </Badge>
        )}
        
        {/* Promoted badge */}
        {event.isPromoted && (
          <Badge className="absolute top-12 right-4 safe-top gradient-accent">
            AD
          </Badge>
        )}
      </div>
      
      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Event Title & Basic Info */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
          <p className="text-muted-foreground mb-4">{event.description}</p>
          
          {/* Host Info */}
          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={event.host.avatar} />
                <AvatarFallback>{event.host.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">Hosted by {event.host.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-accent text-accent" />
                    <span>{event.host.rating}</span>
                  </div>
                  {event.host.verifiedHost && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Event Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-card p-4 text-center">
            <Clock className="w-5 h-5 mx-auto mb-2 text-primary" />
            <div className="text-sm font-medium">Start Time</div>
            <div className="text-xs text-muted-foreground">
              {new Date(event.startTime).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </Card>
          
          <Card className="glass-card p-4 text-center">
            <Calendar className="w-5 h-5 mx-auto mb-2 text-primary" />
            <div className="text-sm font-medium">Ends</div>
            <div className="text-xs text-muted-foreground">
              {new Date(event.endTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </Card>
          
          <Card className="glass-card p-4 text-center">
            <Users className="w-5 h-5 mx-auto mb-2 text-primary" />
            <div className="text-sm font-medium">Capacity</div>
            <div className="text-xs text-muted-foreground">
              {event.attendees}/{event.capacity}
            </div>
          </Card>
          
          <Card className="glass-card p-4 text-center">
            <Music className="w-5 h-5 mx-auto mb-2 text-primary" />
            <div className="text-sm font-medium">DJ</div>
            <div className="text-xs text-muted-foreground">
              {event.djName || 'TBA'}
            </div>
          </Card>
        </div>
        
        {/* Location */}
        <Card className="glass-card p-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium mb-1">Location</h3>
              <div className="text-sm text-muted-foreground">
                {isLocationVisible ? (
                  <>
                    <div>{event.location.name}</div>
                    <div>{event.location.address}</div>
                  </>
                ) : (
                  <div className="blur-sm select-none">
                    Hidden until approved
                  </div>
                )}
              </div>
              {!isLocationVisible && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  Address revealed after approval
                </Badge>
              )}
            </div>
          </div>
        </Card>
        
        {/* Event Features */}
        <div>
          <h3 className="font-semibold mb-3">What to Expect</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{event.bringOwnDrinks ? '✅' : '❌'}</span>
              <span className="text-sm">Bring Your Own Drinks</span>
            </div>
            {event.allowPlusOnes && (
              <div className="flex items-center gap-2">
                <span className="text-lg">✅</span>
                <span className="text-sm">+{event.maxPlusOnes || 2} friends allowed</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Music Genres */}
        <div>
          <h3 className="font-semibold mb-3">Music</h3>
          <div className="flex gap-2 flex-wrap">
            {event.genres.map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Capacity Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Attendance</span>
            <span>{event.attendees}/{event.capacity}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="h-full rounded-full gradient-primary transition-all duration-500"
              style={{ width: `${(event.attendees / event.capacity) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Price */}
        <Card className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-gradient-primary mb-1">
            {event.price === 0 ? 'Free Entry' : `€${event.price}`}
          </div>
          {event.originalPrice && event.originalPrice > event.price && (
            <div className="text-sm text-muted-foreground line-through">
              €{event.originalPrice}
            </div>
          )}
        </Card>
        
        {/* Action Button */}
        <div className="pt-4">
          {getStatusButton()}
        </div>

        {/* Reviews Section */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Reviews
          </h3>
          <ReviewsList eventId={event.id} />
        </div>
      </div>
      
      {/* Request to Join Modal for Private Events */}
      <RequestToJoinModal
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        event={event}
      />
      
      {/* Ticket Purchase Modal for Public Events */}
      <BuyTicketModal
        open={showTicketDialog}
        onOpenChange={setShowTicketDialog}
        event={event}
      />
    </div>
  );
};