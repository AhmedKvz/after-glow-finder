import { useState, useEffect } from 'react';
import { MapPin, Clock, Users, Loader2, Music, Search, Ticket, Map as MapIcon, Star, MessageSquare, RotateCcw, List, Layers, Heart, ExternalLink, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ReviewsList } from '@/components/ReviewsList';
import { supabase } from '@/integrations/supabase/client';
import { BuyTicketModal } from '@/components/BuyTicketModal';
import { RequestToJoinModal } from '@/components/RequestToJoinModal';
import { SwipeEventCard } from '@/components/SwipeEventCard';
import { SwipeStats } from '@/components/SwipeStats';
import { SwipeXPToast } from '@/components/SwipeXPToast';
import { SwipeRequestModal } from '@/components/SwipeRequestModal';
import { EventDetails } from '@/components/EventDetails';
import { MapView } from '@/components/MapView';
import { BlogSection } from '@/components/BlogSection';
import { YourTonightSection } from '@/components/YourTonightSection';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import eventPoster1 from '@/assets/event-poster-1.jpg';
import eventPoster2 from '@/assets/event-poster-2.jpg';
import eventPoster3 from '@/assets/event-poster-3.jpg';

const Discover = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventForTicket, setSelectedEventForTicket] = useState<any | null>(null);
  const [selectedEventForRequest, setSelectedEventForRequest] = useState<any | null>(null);
  const [showReviewsForEvent, setShowReviewsForEvent] = useState<any | null>(null);
  
  // Filters
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow'>('all');
  const [freeOnly, setFreeOnly] = useState(false);
  
  // Swipe mode state
  const [viewMode, setViewMode] = useState<'list' | 'swipe' | 'map'>('swipe');
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [swipeStreak, setSwipeStreak] = useState(0);
  const [xpToday, setXpToday] = useState(0);
  const [totalSwipes, setTotalSwipes] = useState(0);
  const [showXPToast, setShowXPToast] = useState(false);
  const [xpToastData, setXpToastData] = useState<{ type: 'like' | 'skip' | 'request'; xp: number; message: string }>({
    type: 'like',
    xp: 0,
    message: ''
  });
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestModalEvent, setRequestModalEvent] = useState<any>(null);
  const [selectedEventForDetails, setSelectedEventForDetails] = useState<any | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async (skipSwipedFilter: boolean = false) => {
    setLoading(true);
    
    // Load user's previous swipes to filter them out (unless skipSwipedFilter is true)
    let swipedEventIds: string[] = [];
    if (user && !skipSwipedFilter) {
      const { data: swipes } = await supabase
        .from('event_swipes')
        .select('event_id')
        .eq('user_id', user.id);
      
      swipedEventIds = swipes?.map(s => s.event_id) || [];
    }
    
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

    // 4. Combine all events (clubs first, then cafes, then private) and optionally filter out swiped ones
    const allEvents = [...(clubEvents || []), ...(cafeEvents || []), ...(privateEvents || [])]
      .filter(event => skipSwipedFilter || !swipedEventIds.includes(event.id));

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

  // Get today and tomorrow dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const filteredEvents = events.filter(event => {
    // Search filter
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Genre filter
    const matchesGenre = genreFilter === 'all' || 
      (event.music_tags && event.music_tags.some((tag: string) => 
        tag.toLowerCase().includes(genreFilter.toLowerCase())
      ));
    
    // Date filter
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = eventDate.getTime() === today.getTime();
    } else if (dateFilter === 'tomorrow') {
      matchesDate = eventDate.getTime() === tomorrow.getTime();
    }
    
    // Free only filter (events without ticket link or cafe type)
    const matchesFree = !freeOnly || event.event_type === 'cafe' || !event.ticket_link;
    
    return matchesSearch && matchesGenre && matchesDate && matchesFree;
  });

  const featuredEvents = filteredEvents.slice(0, 3);
  
  // Swipe handlers
  const handleSwipeRight = async (event: any) => {
    if (!user) return;
    
    // Save swipe to database
    await supabase
      .from('event_swipes')
      .upsert({
        user_id: user.id,
        event_id: event.id,
        swipe_direction: 'right'
      }, {
        onConflict: 'user_id,event_id'
      });
    
    // Add to wishlist_user_ids
    const currentWishlist = event.wishlist_user_ids || [];
    if (!currentWishlist.includes(user.id)) {
      await supabase
        .from('events')
        .update({ 
          wishlist_user_ids: [...currentWishlist, user.id],
          swipe_count: (event.swipe_count || 0) + 1
        })
        .eq('id', event.id);
    }
    
    // Award XP
    const { data: profileData } = await supabase
      .from('profiles')
      .select('xp')
      .eq('user_id', user.id)
      .single();
    
    const currentXP = profileData?.xp || 0;
    
    await supabase
      .from('profiles')
      .update({ xp: currentXP + 3 })
      .eq('user_id', user.id);
    
    // Update stats
    setSwipeStreak(prev => prev + 1);
    setXpToday(prev => prev + 3);
    setTotalSwipes(prev => prev + 1);
    
    // Show toast
    setXpToastData({ type: 'like', xp: 3, message: 'Added to wishlist!' });
    setShowXPToast(true);
    setTimeout(() => setShowXPToast(false), 2000);
    
    // Move to next card
    setSwipeIndex(prev => prev + 1);
    
    toast({
      title: "Added to wishlist!",
      description: "+3 XP earned",
    });
  };
  
  const handleSwipeLeft = async (event: any) => {
    if (!user) return;
    
    // Save swipe to database
    await supabase
      .from('event_swipes')
      .upsert({
        user_id: user.id,
        event_id: event.id,
        swipe_direction: 'left'
      }, {
        onConflict: 'user_id,event_id'
      });
    
    // Update event swipe count
    await supabase
      .from('events')
      .update({ swipe_count: (event.swipe_count || 0) + 1 })
      .eq('id', event.id);
    
    // Award minimal XP for engagement
    const { data: profileData } = await supabase
      .from('profiles')
      .select('xp')
      .eq('user_id', user.id)
      .single();
    
    const currentXP = profileData?.xp || 0;
    
    await supabase
      .from('profiles')
      .update({ xp: currentXP + 1 })
      .eq('user_id', user.id);
    
    // Update stats
    setTotalSwipes(prev => prev + 1);
    setXpToday(prev => prev + 1);
    
    // Show toast
    setXpToastData({ type: 'skip', xp: 1, message: 'Skipped +1 XP' });
    setShowXPToast(true);
    setTimeout(() => setShowXPToast(false), 1500);
    
    // Move to next card
    setSwipeIndex(prev => prev + 1);
  };
  
  const handleSwipeUp = (event: any) => {
    const isPrivate = event.event_type === 'private_host' || event.is_private;
    
    if (!isPrivate) return;
    
    // Show request modal
    setRequestModalEvent(event);
    setShowRequestModal(true);
  };
  
  const handleConfirmRequest = async () => {
    if (!user || !requestModalEvent) return;
    
    // Check for user profile data
    const { data: profileData } = await supabase
      .from('profiles')
      .select('level, trust_score')
      .eq('user_id', user.id)
      .single();
    
    // Get event preferences
    const { data: eventData } = await supabase
      .from('events')
      .select('preferred_levels, min_trust_score')
      .eq('id', requestModalEvent.id)
      .single();
    
    // Calculate preference matching
    const userLevel = profileData?.level || '';
    const userTrust = profileData?.trust_score || 0;
    const preferredLevels = eventData?.preferred_levels || [];
    const minTrust = eventData?.min_trust_score || 0;
    
    let isWithinPreference = true;
    let reasonFlag = null;
    
    if (preferredLevels.length > 0 && !preferredLevels.includes(userLevel)) {
      isWithinPreference = false;
      reasonFlag = `Level mismatch: User is "${userLevel}"`;
    }
    
    if (userTrust < minTrust) {
      isWithinPreference = false;
      reasonFlag = reasonFlag 
        ? `${reasonFlag}. Trust too low (${userTrust})`
        : `Trust score too low: ${userTrust}`;
    }
    
    // Create request
    const { error } = await supabase
      .from('event_access')
      .insert({
        event_id: requestModalEvent.id,
        user_id: user.id,
        status: 'requested',
      });
    
    if (error && error.code !== '23505') {
      toast({
        variant: 'destructive',
        title: 'Failed to send request',
        description: error.message,
      });
      return;
    }
    
    // Update stats
    setTotalSwipes(prev => prev + 1);
    
    // Show toast
    setXpToastData({ type: 'request', xp: 0, message: 'Request sent!' });
    setShowXPToast(true);
    setTimeout(() => setShowXPToast(false), 2000);
    
    // Move to next card
    setSwipeIndex(prev => prev + 1);
    
    toast({
      title: "Request sent!",
      description: "The host will review your profile.",
    });
  };
  
  const handleTapCard = (event: any) => {
    setSelectedEventForDetails(event);
  };
  
  const handleReloadEvents = () => {
    setSwipeIndex(0);
    setSwipeStreak(0);
    loadEvents(true); // Skip swiped filter to show all events from scratch
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background safe-top flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show event details if selected
  if (selectedEventForDetails) {
    return (
      <EventDetails
        event={{
          id: selectedEventForDetails.id,
          title: selectedEventForDetails.title,
          description: selectedEventForDetails.description,
          host: {
            id: selectedEventForDetails.host_id,
            name: selectedEventForDetails.host?.display_name || 'Unknown Host',
            avatar: selectedEventForDetails.host?.avatar_url,
            rating: selectedEventForDetails.average_rating || 4.5,
            verifiedHost: true,
          },
          djName: selectedEventForDetails.dj_name,
          startTime: `${selectedEventForDetails.date}T${selectedEventForDetails.start_time}`,
          endTime: `${selectedEventForDetails.date}T${selectedEventForDetails.end_time}`,
          location: {
            name: selectedEventForDetails.location,
            address: selectedEventForDetails.exact_address || selectedEventForDetails.location,
          },
          capacity: selectedEventForDetails.capacity,
          attendees: 0,
          price: 0,
          genres: selectedEventForDetails.music_tags || [],
          tags: [],
          images: [],
          isPrivate: selectedEventForDetails.event_type === 'private_host',
          isPromoted: false,
          distance: 0,
          rating: selectedEventForDetails.average_rating,
          reviewCount: selectedEventForDetails.review_count,
          bringOwnDrinks: selectedEventForDetails.bring_own_drinks || false,
          allowPlusOnes: selectedEventForDetails.allow_plus_one || false,
          maxPlusOnes: selectedEventForDetails.allow_plus_two ? 2 : 1,
          eventType: selectedEventForDetails.event_type,
          isLocationHidden: selectedEventForDetails.is_location_hidden,
        }}
        onBack={() => setSelectedEventForDetails(null)}
      />
    );
  }

  // Swipe view
  if (viewMode === 'swipe') {
    const currentEvents = filteredEvents.slice(swipeIndex, swipeIndex + 5);
    
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Stats */}
        <SwipeStats 
          streak={swipeStreak}
          xpToday={xpToday}
          totalSwipes={totalSwipes}
        />
        
        {/* XP Toast */}
        <SwipeXPToast 
          visible={showXPToast}
          type={xpToastData.type}
          xp={xpToastData.xp}
          message={xpToastData.message}
        />
        
        {/* Swipe Cards */}
        <div className="absolute inset-0 safe-top safe-bottom flex items-center justify-center p-4">
          {currentEvents.length === 0 ? (
            <Card className="glass-card p-8 text-center max-w-md">
              <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-xl mb-2">No more events!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You've swiped through all available events
              </p>
              <Button onClick={handleReloadEvents} className="gradient-primary">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reload Events
              </Button>
            </Card>
          ) : (
            <div className="relative w-full max-w-md h-[600px]">
              {currentEvents.slice(0, 3).reverse().map((event, index) => (
                <div
                  key={event.id}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    zIndex: currentEvents.length - index,
                    transform: `scale(${1 - index * 0.05}) translateY(${index * 10}px)`,
                    opacity: index === 0 ? 1 : 0.5 - index * 0.2
                  }}
                >
                  {index === 0 && (
                    <SwipeEventCard
                      event={event}
                      onSwipeRight={handleSwipeRight}
                      onSwipeLeft={handleSwipeLeft}
                      onSwipeUp={handleSwipeUp}
                      onTap={handleTapCard}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 safe-bottom p-4 bg-gradient-to-t from-background via-background to-transparent">
          <div className="flex gap-3 max-w-md mx-auto">
            <Button
              variant="outline"
              onClick={handleReloadEvents}
              className="flex-1 glass-card"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reload
            </Button>
            <Button
              variant="outline"
              onClick={() => setViewMode('list')}
              className="flex-1 glass-card"
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant="outline"
              onClick={() => setViewMode('map')}
              className="flex-1 glass-card"
            >
              <MapIcon className="w-4 h-4 mr-2" />
              Map
            </Button>
          </div>
        </div>
        
        {/* Modals */}
        <SwipeRequestModal
          open={showRequestModal}
          onOpenChange={setShowRequestModal}
          event={requestModalEvent}
          onConfirm={handleConfirmRequest}
        />
      </div>
    );
  }

  // Map view
  if (viewMode === 'map') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="safe-top px-4 pt-6 pb-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gradient-primary">
                Events Map
              </h1>
              <p className="text-muted-foreground mt-1">
                Belgrade • {events.length} events shown
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('swipe')}
                className="glass-card"
              >
                <Layers className="w-4 h-4 mr-1" />
                Swipe
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('list')}
                className="glass-card"
              >
                <List className="w-4 h-4 mr-1" />
                List
              </Button>
            </div>
          </div>

          {/* Map */}
          <MapView 
            events={filteredEvents}
            onEventClick={(event) => setSelectedEventForDetails(event)}
          />

          {/* Mode toggle at bottom */}
          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setViewMode('swipe')}
              className="flex-1 glass-card"
            >
              <Layers className="w-4 h-4 mr-2" />
              Swipe Mode
            </Button>
            <Button
              variant="outline"
              onClick={() => setViewMode('list')}
              className="flex-1 glass-card"
            >
              <List className="w-4 h-4 mr-2" />
              List View
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // List view (existing code)

  // List view (existing code)
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="safe-top px-4 pt-6 pb-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient-primary">
              Discover Events
            </h1>
            <p className="text-muted-foreground mt-1">
              Belgrade • {events.length} events upcoming
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('swipe')}
              className="glass-card"
            >
              <Layers className="w-4 h-4 mr-1" />
              Swipe
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('map')}
              className="glass-card"
            >
              <MapIcon className="w-4 h-4 mr-1" />
              Map
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events, genres, venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-card"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-3">
          {/* Genre Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {['all', 'Techno', 'House', 'RnB', 'Drum & Bass', 'Hip Hop'].map((genre) => (
              <Button
                key={genre}
                variant={genreFilter === genre ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGenreFilter(genre)}
                className={`whitespace-nowrap ${genreFilter === genre ? 'gradient-primary' : 'glass-card'}`}
              >
                {genre === 'all' ? 'All Genres' : genre}
              </Button>
            ))}
          </div>
          
          {/* Date Filters & Free Only */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All Dates' },
                { value: 'today', label: 'Today' },
                { value: 'tomorrow', label: 'Tomorrow' },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={dateFilter === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateFilter(option.value as 'all' | 'today' | 'tomorrow')}
                  className={`${dateFilter === option.value ? 'gradient-primary' : 'glass-card'}`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={freeOnly}
                onCheckedChange={(checked) => setFreeOnly(checked === true)}
              />
              <span className="text-sm text-muted-foreground">Free events only</span>
            </label>
          </div>
        </div>

        {/* Your Tonight Personalization */}
        <div className="mb-8">
          <YourTonightSection />
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

        {/* Blog Section */}
        <div className="mt-12 mb-8">
          <BlogSection />
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
