import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Star, MapPin, Clock, Users, 
  Ticket, Music, Calendar, ExternalLink, Instagram,
  Bookmark, Flame, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useToast } from '@/hooks/use-toast';
import eventPoster1 from '@/assets/event-poster-1.jpg';
import eventPoster2 from '@/assets/event-poster-2.jpg';
import eventPoster3 from '@/assets/event-poster-3.jpg';

const posterImages = [eventPoster1, eventPoster2, eventPoster3];

interface EventData {
  id: string;
  title: string;
  description: string | null;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  exact_address: string | null;
  full_address: string | null;
  poster_url: string | null;
  ticket_link: string | null;
  dj_name: string | null;
  event_type: string;
  is_private: boolean | null;
  is_secret: boolean | null;
  capacity: number;
  music_tags: string[] | null;
  vibe_tags: string[] | null;
  heat_score: number | null;
  heat_badge: string | null;
  host_id: string;
  bring_own_drinks: boolean | null;
  allow_plus_one: boolean | null;
  ticketing_enabled: boolean;
}

interface DemoUser {
  id: string;
  display_name: string;
  avatar_url: string | null;
  level: string;
}

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { toast } = useToast();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);
  const [seriesEvents, setSeriesEvents] = useState<EventData[]>([]);

  // Demo activity numbers (MVP)
  const demoActivityLevel = Math.floor(Math.random() * 30) + 15; // 15-45 active
  const totalInCircle = Math.floor(Math.random() * 50) + 30; // 30-80 total

  useEffect(() => {
    loadEventData();
    loadDemoUsers();
  }, [eventId]);

  const loadEventData = async () => {
    if (!eventId) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Error loading event:', error);
      toast({
        variant: 'destructive',
        title: 'Event not found',
        description: 'This event may no longer exist.',
      });
      navigate('/discover');
      return;
    }

    setEvent(data);
    setLoading(false);
  };

  const loadDemoUsers = async () => {
    // Load demo profiles for crowd preview
    const { data } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url, level')
      .eq('is_demo', true)
      .limit(12);

    if (data) {
      setDemoUsers(data.map(p => ({
        id: p.user_id,
        display_name: p.display_name || 'User',
        avatar_url: p.avatar_url,
        level: p.level || 'L1'
      })));
    }
  };

  const handleSaveToNightPlan = async () => {
    if (!user || !event) return;

    // Add to wishlist_user_ids
    const { data: currentEvent } = await supabase
      .from('events')
      .select('wishlist_user_ids')
      .eq('id', event.id)
      .single();

    const currentWishlist = (currentEvent?.wishlist_user_ids as string[]) || [];
    
    if (currentWishlist.includes(user.id)) {
      toast({
        title: 'Already saved!',
        description: 'This event is in your Night Plan.',
      });
      return;
    }

    await supabase
      .from('events')
      .update({ wishlist_user_ids: [...currentWishlist, user.id] })
      .eq('id', event.id);

    setIsFavorite(true);
    toast({
      title: 'Saved to Night Plan! 🌙',
      description: 'Find it in your Tonight section.',
    });
  };

  const handleEnterCircle = () => {
    if (!event) return;
    navigate(`/circle-swipe/${event.id}`);
  };

  const handleBuyTickets = () => {
    if (!event?.ticket_link) {
      toast({
        title: 'Door entry only',
        description: 'No online tickets available for this event.',
      });
      return;
    }
    window.open(event.ticket_link, '_blank');
  };

  const handleOpenInstagram = () => {
    // MVP: Open a search for the venue/event
    const searchQuery = encodeURIComponent(event?.title || '');
    window.open(`https://www.instagram.com/explore/tags/${searchQuery}`, '_blank');
  };

  if (loading || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading event...</div>
      </div>
    );
  }

  // Build gallery from poster or fallback
  const gallery = event.poster_url 
    ? [event.poster_url, ...posterImages.slice(0, 2)]
    : posterImages;

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const getVisibilityBadge = () => {
    if (event.is_secret) return { label: 'Secret', color: 'bg-purple-500/20 text-purple-300' };
    if (event.is_private) return { label: 'Private', color: 'bg-amber-500/20 text-amber-300' };
    return { label: 'Public', color: 'bg-emerald-500/20 text-emerald-300' };
  };

  const getStatusBadge = () => {
    const now = new Date();
    const eventStart = new Date(`${event.date}T${event.start_time}`);
    const eventEnd = new Date(`${event.date}T${event.end_time}`);

    if (now >= eventStart && now <= eventEnd) {
      return { label: 'Live', color: 'bg-red-500/20 text-red-300' };
    }
    if (now < eventStart) {
      return { label: 'Scheduled', color: 'bg-blue-500/20 text-blue-300' };
    }
    return { label: 'Ended', color: 'bg-gray-500/20 text-gray-300' };
  };

  const visibilityBadge = getVisibilityBadge();
  const statusBadge = getStatusBadge();

  // Generate vibe summary (MVP: computed text)
  const vibeSummary = event.vibe_tags?.length 
    ? `${event.vibe_tags.slice(0, 3).join(' • ')} vibes await you tonight.`
    : 'Get ready for an unforgettable night experience.';

  return (
    <div className="min-h-screen bg-background safe-top pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-card border-b border-border/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/discover')}
            className="gap-2"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Discover</span>
          </Button>

          <div className="flex items-center gap-3">
            {event.heat_score && event.heat_score > 0 && (
              <div className="flex items-center gap-1 text-orange-400">
                <Flame className="w-4 h-4 fill-orange-400" />
                <span className="font-semibold text-sm">{event.heat_score}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsFavorite(!isFavorite);
                if (!isFavorite) handleSaveToNightPlan();
              }}
            >
              <Heart 
                size={20} 
                className={isFavorite ? 'fill-red-500 text-red-500' : ''} 
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-64 sm:h-72 overflow-hidden">
        <img
          src={gallery[selectedImage]}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Image Navigation */}
        {gallery.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {gallery.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === selectedImage ? 'bg-white w-6' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}

        {/* Overlay Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex flex-wrap gap-2">
            <Badge className={visibilityBadge.color}>
              {visibilityBadge.label}
            </Badge>
            <Badge className={statusBadge.color}>
              {statusBadge.label}
            </Badge>
          </div>
          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 animate-pulse">
            🔥 Active now
          </Badge>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{event.title}</h1>
          <div className="flex items-center gap-2 text-white/90">
            <MapPin size={14} />
            <span className="text-sm">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-white/80 mt-1">
            <Calendar size={14} />
            <span className="text-sm">{formattedDate} • {event.start_time} - {event.end_time}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="glass-card p-4 text-center">
            <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <div className="font-bold text-lg">{demoActivityLevel}</div>
            <div className="text-xs text-muted-foreground">Active now</div>
          </Card>
          <Card className="glass-card p-4 text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="font-bold text-lg">{totalInCircle}</div>
            <div className="text-xs text-muted-foreground">In circle</div>
          </Card>
          <Card className="glass-card p-4 text-center">
            <Users className="w-5 h-5 text-success mx-auto mb-1" />
            <div className="font-bold text-lg">{event.capacity}</div>
            <div className="text-xs text-muted-foreground">Capacity</div>
          </Card>
        </div>

        {/* About / Vibe Section */}
        <Card className="glass-card p-5">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Music size={20} />
            About this Event
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            {event.description || vibeSummary}
          </p>

          {/* Vibe Tags */}
          {event.vibe_tags && event.vibe_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {event.vibe_tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Music Tags */}
          {event.music_tags && event.music_tags.length > 0 && (
            <div className="pt-4 border-t border-border/20">
              <div className="text-xs text-muted-foreground mb-2">Music</div>
              <div className="flex flex-wrap gap-2">
                {event.music_tags.map((tag, idx) => (
                  <Badge key={idx} className="bg-primary/20 text-primary border-primary/30 text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Lineup Section */}
        {event.dj_name && (
          <Card className="glass-card p-5">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Music size={20} />
              Lineup
            </h2>
            <div className="space-y-2">
              {event.dj_name.split(',').map((artist, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 glass-card rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">{artist.trim()}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Venue Section */}
        <Card className="glass-card p-5">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <MapPin size={20} />
            Venue
          </h2>
          <div className="space-y-2">
            <div className="font-semibold">{event.location}</div>
            {event.exact_address && !event.is_private && (
              <div className="text-sm text-muted-foreground">{event.exact_address}</div>
            )}
            {event.is_private && (
              <div className="text-sm text-muted-foreground italic">
                Address revealed after approval
              </div>
            )}
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/20">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Date</div>
              <div className="text-sm font-medium flex items-center gap-1">
                <Calendar size={14} className="text-primary" />
                {formattedDate}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Time</div>
              <div className="text-sm font-medium flex items-center gap-1">
                <Clock size={14} className="text-primary" />
                {event.start_time} - {event.end_time}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Event Type</div>
              <div className="text-sm font-medium capitalize">
                {event.event_type?.replace('_', ' ') || 'Party'}
              </div>
            </div>
            {event.bring_own_drinks !== null && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">BYOB</div>
                <div className="text-sm font-medium">
                  {event.bring_own_drinks ? '🥤 Allowed' : '🚫 Not allowed'}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Crowd Preview Section */}
        <Card className="glass-card p-5">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Users size={20} />
            People active now
          </h2>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="flex -space-x-3">
              {demoUsers.slice(0, 8).map((u, idx) => (
                <Avatar key={u.id} className="w-10 h-10 border-2 border-background">
                  <AvatarImage src={u.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-white">
                    {u.display_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {totalInCircle > 8 && (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border-2 border-background">
                  <span className="text-xs font-medium">+{totalInCircle - 8}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <span>{demoActivityLevel} active now</span>
            <span>{totalInCircle} in circle</span>
          </div>

          <Button
            onClick={handleEnterCircle}
            variant="outline"
            className="w-full"
          >
            <Users className="w-4 h-4 mr-2" />
            See the crowd
          </Button>
        </Card>

        {/* Quests Section (MVP Stub) */}
        <Card className="glass-card p-5">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Zap size={20} className="text-accent" />
            Quests live
          </h2>
          
          <div className="space-y-3">
            {[
              { title: 'First Match', desc: 'Make your first match tonight', xp: 50, progress: 0 },
              { title: 'Social Butterfly', desc: 'Send 5 likes in Circle', xp: 100, progress: 40 },
              { title: 'VIP Entry', desc: 'Get approved to 3 private events', xp: 200, progress: 66 },
            ].map((quest, idx) => (
              <div key={idx} className="p-3 glass-card rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-sm">{quest.title}</div>
                    <div className="text-xs text-muted-foreground">{quest.desc}</div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    +{quest.xp} XP
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${quest.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-20 left-0 right-0 px-4 z-30">
        <div className="max-w-lg mx-auto glass-card p-3 rounded-xl border border-border/20">
          <div className="flex gap-2">
            <Button
              onClick={handleEnterCircle}
              className="flex-1 gradient-primary h-12 font-semibold"
            >
              <Users className="w-4 h-4 mr-2" />
              Enter Circle
            </Button>
            
            <Button
              onClick={handleBuyTickets}
              variant="outline"
              className="h-12"
            >
              <Ticket className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={handleOpenInstagram}
              variant="outline"
              className="h-12"
            >
              <Instagram className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={handleSaveToNightPlan}
              variant="outline"
              className={`h-12 ${isFavorite ? 'bg-primary/20 border-primary' : ''}`}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-primary text-primary' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
