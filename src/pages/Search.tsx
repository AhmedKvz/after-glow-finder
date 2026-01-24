import { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, MapPin, Clock, DollarSign, Loader2, Map as MapIcon, Star, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ReviewsList } from '@/components/ReviewsList';
import { supabase } from '@/integrations/supabase/client';
import { BuyTicketModal } from '@/components/BuyTicketModal';
import { RequestToJoinModal } from '@/components/RequestToJoinModal';
import eventPoster1 from '@/assets/event-poster-1.jpg';
import eventPoster2 from '@/assets/event-poster-2.jpg';
import eventPoster3 from '@/assets/event-poster-3.jpg';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('date');
  const [showFilters, setShowFilters] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      console.error('[Search] Error loading club events:', clubError);
    }

    // 2. Load cafe events (MVP: show all events regardless of date)
    const { data: cafeEvents, error: cafeError } = await supabase
      .from('events')
      .select('*')
      .eq('event_type', 'cafe')
      .order('date', { ascending: true });

    if (cafeError) {
      console.error('[Search] Error loading cafe events:', cafeError);
    }

    // 3. Load private events (MVP: show all events regardless of date)
    const { data: privateEvents, error: privateError } = await supabase
      .from('events')
      .select('*')
      .eq('event_type', 'private_host')
      .order('date', { ascending: true });

    if (privateError) {
      console.error('[Search] Error loading private events:', privateError);
    }

    // 4. Combine all events (clubs first, cafes second, private third)
    const allEvents = [...(clubEvents || []), ...(cafeEvents || []), ...(privateEvents || [])];

    if (allEvents.length === 0) {
      setEvents([]);
      setLoading(false);
      return;
    }

    // 4. Collect unique host_ids
    const hostIds = [...new Set(allEvents.map(e => e.host_id))];

    // 5. Load profiles for all hosts
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', hostIds);

    if (profilesError) {
      console.error('[Search] Error loading profiles:', profilesError);
    }

    // 6. Load reviews for all events (clubs & cafes)
    const eventIds = allEvents.map(e => e.id);
    const { data: eventReviews, error: eventReviewsError } = await supabase
      .from('event_reviews')
      .select('event_id, rating')
      .in('event_id', eventIds);

    if (eventReviewsError) {
      console.error('[Search] Error loading event reviews:', eventReviewsError);
    }

    // 7. Load host reviews for private events
    const { data: userReviews, error: userReviewsError } = await supabase
      .from('user_reviews')
      .select('reviewed_user_id, rating')
      .in('reviewed_user_id', hostIds);

    if (userReviewsError) {
      console.error('[Search] Error loading user reviews:', userReviewsError);
    }

    // 8. Build aggregate maps
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

    // 9. Merge data: add host object and rating info to each event
    const eventsWithHosts = allEvents.map(event => {
      const hostProfile = profilesData?.find(p => p.user_id === event.host_id) || {
        user_id: event.host_id,
        display_name: 'Unknown Host',
        avatar_url: null
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

  const filterChips = [
    { id: 'techno', label: 'Techno', type: 'genre' },
    { id: 'house', label: 'House', type: 'genre' },
    { id: 'free', label: 'Free Entry', type: 'price' },
    { id: 'private', label: 'Private', type: 'access' },
    { id: 'secret', label: '🔮 Secret', type: 'access' },
    { id: 'tonight', label: 'Tonight', type: 'time' },
    { id: 'weekend', label: 'This Weekend', type: 'time' },
    { id: 'nearby', label: 'Nearby (2km)', type: 'distance' },
  ];

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const filteredEvents = events.filter(event => {
    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = event.title?.toLowerCase().includes(query);
      const matchLocation = event.location?.toLowerCase().includes(query);
      const matchDj = event.dj_name?.toLowerCase().includes(query);
      if (!matchTitle && !matchLocation && !matchDj) return false;
    }
    
    // Genre filters
    if (selectedFilters.includes('techno') && !event.music_tags?.some((g: string) => g.toLowerCase().includes('techno'))) return false;
    if (selectedFilters.includes('house') && !event.music_tags?.some((g: string) => g.toLowerCase().includes('house'))) return false;
    
    // Secret mode filter
    if (selectedFilters.includes('secret') && !(event.is_secret || event.event_type === 'secret')) return false;
    
    return true;
  });

  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-border/20">
        <h1 className="text-2xl font-bold mb-4">Search Events</h1>
        
        {/* Search bar */}
        <div className="relative mb-2">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search events, venues, hosts..."
            className="pl-10 glass-card border-border/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Tip: try "techno", "cocktails", "after 03:00", or a venue name
        </p>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 mb-4">
          {filterChips.map((chip) => (
            <Badge
              key={chip.id}
              variant={selectedFilters.includes(chip.id) ? 'default' : 'secondary'}
              className={`whitespace-nowrap cursor-pointer transition-all ${
                selectedFilters.includes(chip.id) 
                  ? 'gradient-primary text-white' 
                  : 'glass-card hover:bg-surface-hover'
              }`}
              onClick={() => toggleFilter(chip.id)}
            >
              {chip.label}
            </Badge>
          ))}
        </div>

        {/* Sort and filter controls */}
        <div className="flex items-center justify-between">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 glass-card border-border/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card">
              <SelectItem value="closest">Closest</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="cheapest">Cheapest</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter size={16} />
            More Filters
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {filteredEvents.length} events found
              </h2>
              {selectedFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFilters([])}
                  className="text-primary"
                >
                  Clear filters
                </Button>
              )}
            </div>

            {filteredEvents.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <SearchIcon className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <h3 className="text-lg font-semibold mb-2">No events found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery('');
                    setSelectedFilters([]);
                  }}>
                    Reset Search
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((event, index) => (
                  <Card key={event.id} className="glass-card p-4 sm:p-5 min-h-fit">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-primary/10 flex-shrink-0">
                        <img
                          src={[eventPoster1, eventPoster2, eventPoster3][index % 3]}
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
                            Get Ticket
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
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
              eventType={showReviewsForEvent.event_type}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Search;