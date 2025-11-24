import { useState, useEffect } from 'react';
import { MapPin, Clock, Users, Loader2, Music, Search, Ticket, Map as MapIcon, Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ReviewsList } from '@/components/ReviewsList';
import { supabase } from '@/integrations/supabase/client';
import { BuyTicketModal } from '@/components/BuyTicketModal';
import { RequestToJoinModal } from '@/components/RequestToJoinModal';
import eventPoster1 from '@/assets/event-poster-1.jpg';
import eventPoster2 from '@/assets/event-poster-2.jpg';
import eventPoster3 from '@/assets/event-poster-3.jpg';

const Discover = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventForTicket, setSelectedEventForTicket] = useState<any | null>(null);
  const [selectedEventForRequest, setSelectedEventForRequest] = useState<any | null>(null);
  const [showReviewsForEvent, setShowReviewsForEvent] = useState<any | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    // 1. Load club events (MVP: show all events regardless of date)
    const { data: clubEvents, error: clubError } = await supabase
      .from('events')
      .select('*')
      .eq('event_type', 'club')
      .order('date', { ascending: true });

    if (clubError) {
      console.error('[Discover] Error loading club events:', clubError);
    }

    // 2. Load cafe events (MVP: show all events regardless of date)
    const { data: cafeEvents, error: cafeError } = await supabase
      .from('events')
      .select('*')
      .eq('event_type', 'cafe')
      .order('date', { ascending: true });

    if (cafeError) {
      console.error('[Discover] Error loading cafe events:', cafeError);
    }

    // 3. Load private events (MVP: show all events regardless of date)
    const { data: privateEvents, error: privateError } = await supabase
      .from('events')
      .select('*')
      .eq('event_type', 'private_host')
      .order('date', { ascending: true });

    if (privateError) {
      console.error('[Discover] Error loading private events:', privateError);
    }

    // 4. Combine all events (clubs first, then cafes, then private)
    const allEvents = [...(clubEvents || []), ...(cafeEvents || []), ...(privateEvents || [])];

    if (allEvents.length === 0) {
      setEvents([]);
      setLoading(false);
      return;
    }

    // 6. Collect unique host_ids
    const hostIds = [...new Set(allEvents.map(e => e.host_id))];

    // 7. Load profiles for all hosts
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', hostIds);

    if (profilesError) {
      console.error('[Discover] Error loading profiles:', profilesError);
    }

    // 8. Load reviews for all events (clubs & cafes)
    const eventIds = allEvents.map(e => e.id);
    const { data: eventReviews, error: eventReviewsError } = await supabase
      .from('event_reviews')
      .select('event_id, rating')
      .in('event_id', eventIds);

    if (eventReviewsError) {
      console.error('[Discover] Error loading event reviews:', eventReviewsError);
    }

    // 9. Load host reviews for private events
    const { data: userReviews, error: userReviewsError } = await supabase
      .from('user_reviews')
      .select('reviewed_user_id, rating')
      .in('reviewed_user_id', hostIds);

    if (userReviewsError) {
      console.error('[Discover] Error loading user reviews:', userReviewsError);
    }

    // 10. Build aggregate maps
    const eventRatingMap = new Map<string, { avgRating: number; count: number }>();
    if (eventReviews) {
      eventReviews.forEach((r: any) => {
        const existing = eventRatingMap.get(r.event_id) || { avgRating: 0, count: 0 };
        const total = existing.avgRating * existing.count + r.rating;
        const count = existing.count + 1;
        eventRatingMap.set(r.event_id, { avgRating: total / count, count });
      });
    }

    const hostRatingMap = new Map<string, { avgRating: number; count: number }>();
    if (userReviews) {
      userReviews.forEach((r: any) => {
        const existing = hostRatingMap.get(r.reviewed_user_id) || { avgRating: 0, count: 0 };
        const total = existing.avgRating * existing.count + r.rating;
        const count = existing.count + 1;
        hostRatingMap.set(r.reviewed_user_id, { avgRating: total / count, count });
      });
    }

    // 11. Merge data: add host object and rating info to each event
    const eventsWithHosts = allEvents.map(event => {
      const hostProfile = profilesData?.find(p => p.user_id === event.host_id) || {
        user_id: event.host_id,
        display_name: 'Unknown Host',
        avatar_url: null,
      };

      const ratingData = event.event_type === 'private_host'
        ? hostRatingMap.get(event.host_id)
        : eventRatingMap.get(event.id);

      return {
        ...event,
        host: hostProfile,
        average_rating: ratingData?.avgRating ?? null,
        review_count: ratingData?.count ?? 0,
      };
    });

    // Sort by date
    eventsWithHosts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setEvents(eventsWithHosts);
    setLoading(false);
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredEvents = filteredEvents.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-background safe-top flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="safe-top px-4 pt-6 pb-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gradient-primary">
            Discover Events
          </h1>
          <p className="text-muted-foreground mt-1">
            Belgrade • {events.length} events upcoming
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events, genres, venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-card"
          />
        </div>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold">Featured Tonight</h2>
            <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
              {featuredEvents.map((event, index) => (
                <Card 
                  key={event.id} 
                  className="relative min-w-[300px] sm:min-w-[320px] h-[220px] overflow-hidden glass-card cursor-pointer transition-transform hover:scale-105"
                >
                  <img
                    src={[eventPoster1, eventPoster2, eventPoster3][index % 3]}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Event info overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    {/* Event Type Badge */}
                    {event.event_type === 'club' && (
                      <Badge className="mb-2 text-[11px] bg-emerald-600/30 text-emerald-200 backdrop-blur-sm">
                        🏛️ CLUB
                      </Badge>
                    )}
                    {event.event_type === 'cafe' && (
                      <Badge className="mb-2 text-[11px] bg-blue-600/30 text-blue-200 backdrop-blur-sm">
                        ☕ CAFE
                      </Badge>
                    )}
                    {event.event_type === 'private_host' && (
                      <Badge className="mb-2 text-[11px] bg-yellow-600/30 text-yellow-200 backdrop-blur-sm">
                        🗝️ PRIVATE
                      </Badge>
                    )}
                    
                    <h3 className="text-white font-semibold text-base sm:text-lg md:text-xl mb-1 leading-snug break-words whitespace-normal">
                      {event.title}
                    </h3>

                    {/* Rating summary - clickable */}
                    {event.average_rating && event.review_count > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowReviewsForEvent(event)}
                        className="flex items-center gap-2 text-xs sm:text-[13px] text-white/90 mb-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/70 rounded-full px-2 py-1 bg-black/30 backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{event.average_rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-white/80">
                          <MessageSquare className="w-3 h-3" />
                          <span>{event.review_count}</span>
                        </div>
                      </button>
                    )}

                    <div className="flex items-center gap-4 text-white/80 text-[13px] sm:text-sm mb-2">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {event.start_time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        {event.capacity}
                      </div>
                    </div>
                    
                    {event.music_tags && event.music_tags.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {event.music_tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="bg-white/20 text-white border-0 text-[13px] sm:text-sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Events */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">All Events</h2>
          
          {filteredEvents.length === 0 ? (
            <Card className="glass-card p-8 text-center">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No events found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery 
                  ? `No events match "${searchQuery}"`
                  : "No upcoming events at the moment"
                }
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="glass-card p-4 sm:p-5 min-h-fit">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-primary/10 flex-shrink-0">
                      <img
                        src={[eventPoster1, eventPoster2, eventPoster3][Math.floor(Math.random() * 3)]}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      {/* Event Type Badge */}
                      <div className="flex gap-2 mb-1">
                        {event.event_type === 'club' && (
                          <Badge className="text-[11px] bg-emerald-600/20 text-emerald-400">
                            🏛️ CLUB
                          </Badge>
                        )}
                        {event.event_type === 'cafe' && (
                          <Badge className="text-[11px] bg-blue-600/20 text-blue-400">
                            ☕ CAFE • FREE ENTRY
                          </Badge>
                        )}
                        {event.event_type === 'private_host' && (
                          <Badge className="text-[11px] bg-yellow-600/20 text-yellow-400">
                            🗝️ PRIVATE
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-base sm:text-lg md:text-xl leading-snug break-words whitespace-normal mb-1">
                        {event.title}
                      </h3>

                      {/* Rating summary - clickable */}
                      {event.average_rating && event.review_count > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowReviewsForEvent(event)}
                          className="flex items-center gap-2 text-[12px] sm:text-[13px] text-muted-foreground mb-1 flex-wrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-full px-2 py-1 bg-background/60"
                        >
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{event.average_rating.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{event.review_count} reviews</span>
                          </div>
                        </button>
                      )}
                      
                      <div className="flex items-center gap-2 text-[13px] sm:text-sm text-muted-foreground mt-1">
                        <MapPin size={14} />
                        <span className="break-words whitespace-normal">
                          {event.is_location_hidden ? 'Hidden' : event.location}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-[13px] sm:text-sm text-muted-foreground mt-1">
                        <Clock size={14} />
                        <span>
                          {new Date(event.date).toLocaleDateString()} • {event.start_time}
                        </span>
                      </div>

                      {event.music_tags && event.music_tags.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {event.music_tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-[13px] sm:text-sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
                      <Badge variant="secondary" className="whitespace-nowrap text-[13px] sm:text-sm">
                        {event.capacity} cap
                      </Badge>
                      {event.event_type === 'cafe' ? (
                        <Button
                          size="sm"
                          className="bg-blue-600/20 text-blue-400 border border-blue-600/30 whitespace-nowrap text-[13px] sm:text-sm h-9"
                          onClick={() => {
                            const address = encodeURIComponent(event.exact_address || event.location);
                            window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                          }}
                        >
                          <MapIcon className="w-3 h-3 mr-1" />
                          See on Map
                        </Button>
                      ) : event.event_type === 'private_host' ? (
                        <Button
                          size="sm"
                          className="bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 whitespace-nowrap text-[13px] sm:text-sm h-9"
                          onClick={() => setSelectedEventForRequest(event)}
                        >
                          Request to Join
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="gradient-primary whitespace-nowrap text-[13px] sm:text-sm h-9"
                          onClick={() => setSelectedEventForTicket(event)}
                        >
                          <Ticket className="w-3 h-3 mr-1" />
                          Get Ticket
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedEventForTicket && (
        <BuyTicketModal
          open={!!selectedEventForTicket}
          onOpenChange={(open) => !open && setSelectedEventForTicket(null)}
          event={selectedEventForTicket}
          onSuccess={loadEvents}
        />
      )}

      {selectedEventForRequest && (
        <RequestToJoinModal
          open={!!selectedEventForRequest}
          onOpenChange={(open) => !open && setSelectedEventForRequest(null)}
          event={selectedEventForRequest}
        />
      )}

      {/* Reviews modal */}
      {showReviewsForEvent && (
        <Dialog
          open={!!showReviewsForEvent}
          onOpenChange={(open) => !open && setShowReviewsForEvent(null)}
        >
          <DialogContent className="glass-card max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                What clubbers say about {showReviewsForEvent.title}
              </DialogTitle>
            </DialogHeader>
            <ReviewsList
              eventId={showReviewsForEvent.event_type === 'private_host' ? undefined : showReviewsForEvent.id}
              userId={showReviewsForEvent.event_type === 'private_host' ? showReviewsForEvent.host_id : undefined}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Discover;
