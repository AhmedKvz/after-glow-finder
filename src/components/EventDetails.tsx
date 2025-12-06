import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Users, Clock, Star, Check, X, Calendar, Music, MessageSquare, Ticket, MessageCircle, Lock, Key, Zap } from 'lucide-react';
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
import { AfterDetailsModal } from '@/components/AfterDetailsModal';
import { SecretEventLockOverlay } from '@/components/SecretEventLockOverlay';
import { HeatBadge } from '@/components/HeatBadge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  const [accessStatus, setAccessStatus] = useState<'none' | 'requested' | 'approved' | 'rejected' | 'blocked'>('none');
  const [selectedPlusOnes, setSelectedPlusOnes] = useState('0');
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [hasValidTicket, setHasValidTicket] = useState(false);
  const [afterRequestStatus, setAfterRequestStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [hasReviews, setHasReviews] = useState(false);
  const [showAfterDetailsModal, setShowAfterDetailsModal] = useState(false);
  const [isPrivateAfter, setIsPrivateAfter] = useState(false);
  const [afterEventData, setAfterEventData] = useState<any>(null);
  const [eventPreferences, setEventPreferences] = useState<{
    preferred_levels: string[];
    min_trust_score: number;
    vibe_tags: string[];
  } | null>(null);
  const [userMatchesPreference, setUserMatchesPreference] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const { user } = useAuth();
  const { isDemoMode, showDemoSuccess } = useDemoMode();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const posterImage = posterImages[event.id.charCodeAt(0) % posterImages.length];
  
  // Helper to convert level name to number (0-6)
  const getLevelNumber = (levelName: string): number => {
    const levels = ['Newbie', 'Explorer', 'Rising Star', 'Regular', 'Pro', 'VIP', 'Legend'];
    return levels.indexOf(levelName);
  };
  
  // Check if event is secret and locked
  const isSecret = event.isSecret || event.eventType === 'secret';
  const isLocked = isSecret && event.secretAccessLevel && (!userProfile?.level || getLevelNumber(userProfile?.level) < event.secretAccessLevel);
  
  // Check if user already has an order/access for this event
  useEffect(() => {
    if (!user) return;
    
    const checkExistingStatus = async () => {
      // Check if this is a private after event or secret event and get preferences
      const { data: eventData } = await supabase
        .from('events')
        .select('is_private_after, is_secret, secret_access_level, full_address, after_instructions, public_location_label, event_type, preferred_levels, min_trust_score, vibe_tags, golden_only')
        .eq('id', event.id)
        .single();
      
      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('level, trust_score, has_golden_ticket')
        .eq('user_id', user.id)
        .single();
      
      setUserProfile(profileData);
      
      if (eventData?.is_private_after || (eventData?.event_type === 'private_host' && (eventData?.preferred_levels?.length > 0 || eventData?.min_trust_score > 0))) {
        setEventPreferences({
          preferred_levels: eventData.preferred_levels || [],
          min_trust_score: eventData.min_trust_score || 0,
          vibe_tags: eventData.vibe_tags || []
        });
        
        // Check if user matches preferences
        const userLevel = profileData?.level || '';
        const userTrust = profileData?.trust_score || 0;
        const preferredLevels = eventData.preferred_levels || [];
        const minTrust = eventData.min_trust_score || 0;
        
        let matches = true;
        if (preferredLevels.length > 0 && !preferredLevels.includes(userLevel)) {
          matches = false;
        }
        if (userTrust < minTrust) {
          matches = false;
        }
        
        setUserMatchesPreference(matches);
      }
      
      if (eventData?.is_private_after) {
        setIsPrivateAfter(true);
        setAfterEventData(eventData);
        
        // Check if user has any reviews (requirement for private after)
        const { count } = await supabase
          .from('event_reviews')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        setHasReviews((count || 0) > 0);
        
        // Check if user has already requested access
        const { data: afterRequest } = await supabase
          .from('after_access_requests')
          .select('status')
          .eq('event_id', event.id)
          .eq('requester_user_id', user.id)
          .maybeSingle();
        
        if (afterRequest) {
          setAfterRequestStatus(afterRequest.status as 'pending' | 'approved' | 'rejected');
        }
        return; // Skip other checks for private after events
      }
      
      // Check if user has a valid ticket
      const { data: ticketData } = await supabase
        .from('tickets')
        .select('status')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .eq('status', 'valid')
        .maybeSingle();
      
      setHasValidTicket(!!ticketData);
      
      // For private host events, check event_access
      if (event.eventType === 'private_host') {
        const { data } = await supabase
          .from('event_access')
          .select('status')
          .eq('event_id', event.id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data) {
          setAccessStatus(data.status as 'requested' | 'approved' | 'rejected' | 'blocked');
        }
      } else {
        // For club events, check event_orders (legacy)
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
      }
    };
    
    checkExistingStatus();
  }, [user, event.id, event.eventType]);
  
  const handleJoinRequest = () => {
    if (event.eventType === 'club') {
      // Show ticket purchase for club events
      setShowTicketDialog(true);
    } else {
      // Show request dialog for private host events
      setShowRequestDialog(true);
    }
  };
  
  const handleRequestAfterAccess = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from('after_access_requests')
      .insert({
        event_id: event.id,
        requester_user_id: user.id,
        status: 'pending',
      });
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        toast({
          title: 'Request already exists',
          description: 'You have already requested access to this after.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to send request',
          description: error.message,
        });
      }
      return;
    }
    
    toast({
      title: 'Request sent!',
      description: 'The host will review your profile and respond soon.',
    });
    
    setAfterRequestStatus('pending');
  };
  
  const getStatusButton = () => {
    // Check if golden_only and user doesn't have golden ticket
    const isGoldenOnly = event.goldenOnly;
    if (isGoldenOnly && !userProfile?.has_golden_ticket) {
      return (
        <div className="space-y-2">
          <Button disabled className="w-full" variant="outline">
            <Ticket className="w-4 h-4 mr-2 text-yellow-400" />
            Golden Ticket Required
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            This event is exclusively for Golden Ticket holders. Earn a Golden Ticket through Lucky events & Secret Pop-Ups.
          </p>
        </div>
      );
    }
    
    // Handle private after events
    if (isPrivateAfter) {
      switch (afterRequestStatus) {
        case 'pending':
          return (
            <Button disabled className="w-full glass-card">
              <Clock className="w-4 h-4 mr-2" />
              Pending Host Review
            </Button>
          );
        case 'approved':
          return (
            <Button 
              onClick={() => setShowAfterDetailsModal(true)} 
              className="w-full gradient-primary text-white"
            >
              <Key className="w-4 h-4 mr-2" />
              Open After Details
            </Button>
          );
        case 'rejected':
          return (
            <Button disabled variant="destructive" className="w-full">
              <X className="w-4 h-4 mr-2" />
              Request Declined
            </Button>
          );
        default:
          if (!hasReviews) {
            return (
              <>
                <Button disabled className="w-full" variant="outline">
                  <Lock className="w-4 h-4 mr-2" />
                  Request Access
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  You need at least one review on your profile to request access to this after.
                </p>
              </>
            );
          }
          return (
            <Button 
              onClick={handleRequestAfterAccess} 
              className="w-full bg-[#8C52FF] hover:bg-[#7840DD] text-white"
            >
              <Lock className="w-4 h-4 mr-2" />
              Request Access
            </Button>
          );
      }
    }
    
    // Handle private host events
    if (event.eventType === 'private_host') {
      switch (accessStatus) {
        case 'requested':
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
        case 'rejected':
        case 'blocked':
          return (
            <Button disabled variant="destructive" className="w-full">
              <X className="w-4 h-4 mr-2" />
              Access Denied
            </Button>
          );
        default:
          return (
            <Button onClick={handleJoinRequest} className="w-full bg-[#8C52FF] hover:bg-[#7840DD] text-white">
              <Users className="w-4 h-4 mr-2" />
              Request to Join
            </Button>
          );
      }
    }
    
    // Handle club events
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
            <Ticket className="w-4 h-4 mr-2" />
            Buy Ticket
          </Button>
        );
    }
  };
  
  const isLocationVisible = (event.eventType === 'club' && !event.isLocationHidden) || 
                            (event.eventType === 'private_host' && accessStatus === 'approved');
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={posterImage}
          alt={event.title}
          className={`w-full h-full object-cover ${isLocked ? 'blur-lg' : ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        
        {/* Secret Lock Overlay (smaller version for header) */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-purple-900/50 backdrop-blur-sm">
            <div className="text-center">
              <Lock className="w-12 h-12 text-purple-300 mx-auto mb-2" />
              <Badge className="bg-purple-600/30 text-purple-200 border-purple-400/40 backdrop-blur-sm">
                🔮 LEVEL {event.secretAccessLevel} REQUIRED
              </Badge>
            </div>
          </div>
        )}
        
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="absolute top-4 left-4 safe-top bg-black/20 text-white hover:bg-black/40"
        >
          <ArrowLeft size={16} />
        </Button>
        
        {/* Event Type badges */}
        <div className="absolute top-4 right-4 safe-top flex flex-col gap-2 items-end">
          {event.eventType === 'club' && (
            <Badge className="bg-emerald-600/20 text-emerald-300 backdrop-blur-sm">
              🏛️ CLUB
            </Badge>
          )}
          {event.eventType === 'private_host' && !isSecret && (
            <Badge className="bg-yellow-600/20 text-yellow-300 backdrop-blur-sm">
              🗝️ PRIVATE
            </Badge>
          )}
          {isSecret && (
            <Badge className="bg-purple-600/20 text-purple-200 backdrop-blur-sm border-purple-400/40">
              🔮 SECRET
            </Badge>
          )}
          {/* Heat Badge */}
          {event.heatScore && event.heatScore > 0 && (
            <HeatBadge heatScore={event.heatScore} heatBadge={event.heatBadge} size="md" />
          )}
        </div>
        
        {/* Promoted badge */}
        {event.isPromoted && (
          <Badge className="absolute top-12 right-4 safe-top gradient-accent">
            AD
          </Badge>
        )}
      </div>
      
      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Secret Lock Message */}
        {isLocked && (
          <Card className="glass-card p-6 border-purple-500/30 bg-purple-950/20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-purple-600/20 backdrop-blur-xl flex items-center justify-center mx-auto border-2 border-purple-400/40">
                <Lock className="w-8 h-8 text-purple-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-200 mb-2">Secret Event Locked</h3>
                {event.secretPreviewText && (
                  <p className="text-sm text-purple-300 italic mb-4">
                    "{event.secretPreviewText}"
                  </p>
                )}
                <p className="text-muted-foreground text-sm">
                  Unlock this secret event by reaching <span className="text-purple-300 font-bold">Level {event.secretAccessLevel}</span> to view full details and request access.
                </p>
              </div>
              <Button 
                onClick={() => navigate('/gamification')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                How to Level Up
              </Button>
            </div>
          </Card>
        )}
        
        {/* Event Title & Basic Info */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
          {!isLocked && <p className="text-muted-foreground mb-4">{event.description}</p>}
          
          {/* Host Info (hidden if locked) */}
          {!isLocked && (
            <Card className="glass-card p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={event.host.avatar} />
                  <AvatarFallback>{event.host.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">Hosted by {isLocked ? 'Hidden' : event.host.name}</h3>
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
          )}
        </div>
        
        {/* Event Details Grid (hidden if locked) */}
        {!isLocked && (
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
        )}
        
        {/* Location (hidden if locked) */}
        {!isLocked && (
          <Card className="glass-card p-4">
          <div className="flex items-start gap-3">
            {isPrivateAfter && afterRequestStatus !== 'approved' ? (
              <>
                <Lock className="w-5 h-5 text-amber-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-amber-300">Private After Location</h3>
                  <div className="text-sm text-muted-foreground">
                    {afterEventData?.public_location_label || 'Location revealed after approval'}
                  </div>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    🔐 Address revealed after host approval
                  </Badge>
                </div>
              </>
            ) : isLocationVisible ? (
              <>
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium mb-1">Location</h3>
                  <div className="text-sm text-muted-foreground">
                    <div>{event.location.name}</div>
                    <div>{event.location.address}</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5 text-muted-foreground/40 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-muted-foreground">Location Hidden</h3>
                  <div className="text-sm text-muted-foreground/60">
                    You'll see the address after approval
                  </div>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Address revealed after approval
                  </Badge>
                </div>
              </>
            )}
          </div>
        </Card>
        )}
        
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
        
        {/* Host Preferences */}
        {eventPreferences && (eventPreferences.preferred_levels.length > 0 || eventPreferences.min_trust_score > 0) && (
          <Card className={`glass-card p-4 ${!userMatchesPreference ? 'border-amber-600/50' : ''}`}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <h3 className="font-semibold">Host Preferences</h3>
              </div>
              
              {eventPreferences.preferred_levels.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Preferred Levels:</p>
                  <div className="flex gap-2 flex-wrap">
                    {eventPreferences.preferred_levels.map((level) => (
                      <Badge key={level} variant="secondary" className="text-xs">
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {eventPreferences.min_trust_score > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Min Trust Score: <span className="font-semibold text-foreground">{eventPreferences.min_trust_score}+</span>
                  </p>
                </div>
              )}
              
              {eventPreferences.vibe_tags.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Vibe:</p>
                  <div className="flex gap-2 flex-wrap">
                    {eventPreferences.vibe_tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {!userMatchesPreference && user && (
                <div className="mt-3 pt-3 border-t border-amber-600/30">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400">⚠️</span>
                    <div className="flex-1">
                      <p className="text-xs text-amber-400 font-medium">
                        You're outside host preferences
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your level: {userProfile?.level || 'New Raver'} • Trust: {userProfile?.trust_score || 50}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        You can still request access, but approval may be less likely.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
        
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
        
        {/* XP Bonus Preview for Hot Events */}
        {!isLocked && event.heatScore && event.heatScore >= 70 && (
          <Card className="glass-card p-4 border-2 border-orange-500/30 bg-gradient-to-br from-orange-950/20 to-red-950/20">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white fill-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-orange-400 mb-1 flex items-center gap-2">
                  {event.heatScore >= 90 ? '🔥 INFERNO BONUS' : '⚡ HOT EVENT BONUS'}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  This event is on fire! Earn extra XP rewards:
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-orange-400 fill-orange-400" />
                    <span className="text-foreground">
                      Swipe right: <span className="font-bold text-orange-400">+10 XP</span> (instead of +3)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Ticket className="w-4 h-4 text-orange-400" />
                    <span className="text-foreground">
                      Attend event: <span className="font-bold text-orange-400">+20 XP bonus</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
        
        {/* Blog Link */}
        {event.blogLink && (
          <Card className="glass-card p-4">
            <a 
              href={event.blogLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-primary hover:underline"
            >
              <span className="text-lg">📰</span>
              <span className="text-sm font-medium">Read article about this event</span>
            </a>
          </Card>
        )}
        
        {/* Action Button */}
        <div className="pt-4">
          {getStatusButton()}
        </div>

        {/* Event Chat Section */}
        {event.eventType === 'club' && (
          <Card className="glass-card p-4">
            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium mb-1">Event Info Chat</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Connect with other ticket holders
                </p>
                {hasValidTicket ? (
                  <Button
                    onClick={() => navigate(`/event/${event.id}/chat`)}
                    className="w-full gradient-primary"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Open Event Chat
                  </Button>
                ) : (
                  <div>
                    <Button disabled className="w-full" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Open Event Chat
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Chat is available only for ticket holders
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Reviews Section */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {event.eventType === 'private_host' ? 'Host Reviews' : 'Event Reviews'}
          </h3>
          {event.eventType === 'private_host' ? (
            <ReviewsList userId={event.host.id} />
          ) : (
            <ReviewsList eventId={event.id} />
          )}
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
        onSuccess={() => {
          setHasValidTicket(true);
          // Optionally close the modal after successful purchase so user can see chat
          setShowTicketDialog(false);
        }}
      />
      
      {/* After Details Modal for Private After Events */}
      {afterEventData && (
        <AfterDetailsModal
          open={showAfterDetailsModal}
          onOpenChange={setShowAfterDetailsModal}
          event={{
            title: event.title,
            full_address: afterEventData.full_address,
            after_instructions: afterEventData.after_instructions,
          }}
        />
      )}
    </div>
  );
};