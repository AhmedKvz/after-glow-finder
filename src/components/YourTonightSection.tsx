import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Users, Calendar, MapPin, Music } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  date: string;
  start_time: string;
  location: string;
  music_tags: string[];
  event_type: string;
}

export const YourTonightSection = () => {
  const { user } = useAuth();
  const [likedEvents, setLikedEvents] = useState<Event[]>([]);
  const [matchEvents, setMatchEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPersonalizedEvents();
    }
  }, [user]);

  const loadPersonalizedEvents = async () => {
    if (!user) return;

    try {
      // Get events user liked (right swipes)
      const { data: swipes, error: swipesError } = await supabase
        .from('event_swipes')
        .select('event_id')
        .eq('user_id', user.id)
        .eq('swipe_direction', 'right')
        .order('created_at', { ascending: false })
        .limit(3);

      if (swipesError) throw swipesError;

      if (swipes && swipes.length > 0) {
        const eventIds = swipes.map(s => s.event_id);
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('id, title, date, start_time, location, music_tags, event_type')
          .in('id', eventIds)
          .gte('date', new Date().toISOString().split('T')[0]);

        if (eventsError) throw eventsError;
        setLikedEvents(events || []);
      }

      // Get Circle Swipe matches
      const { data: matches, error: matchesError } = await supabase
        .from('circle_swipe_matches')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (matchesError) throw matchesError;

      if (matches && matches.length > 0) {
        // Get match user IDs
        const matchUserIds = matches.map(m => 
          m.user1_id === user.id ? m.user2_id : m.user1_id
        );

        // Find events that matches also liked
        const { data: matchSwipes, error: matchSwipesError } = await supabase
          .from('event_swipes')
          .select('event_id')
          .in('user_id', matchUserIds)
          .eq('swipe_direction', 'right');

        if (matchSwipesError) throw matchSwipesError;

        if (matchSwipes && matchSwipes.length > 0) {
          // Count occurrences to find events multiple matches liked
          const eventCounts = matchSwipes.reduce((acc, curr) => {
            acc[curr.event_id] = (acc[curr.event_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          // Get events with 2+ matches
          const popularEventIds = Object.entries(eventCounts)
            .filter(([_, count]) => count >= 2)
            .map(([eventId]) => eventId)
            .slice(0, 2);

          if (popularEventIds.length > 0) {
            const { data: matchEventsData, error: matchEventsError } = await supabase
              .from('events')
              .select('id, title, date, start_time, location, music_tags, event_type')
              .in('id', popularEventIds)
              .gte('date', new Date().toISOString().split('T')[0]);

            if (matchEventsError) throw matchEventsError;
            setMatchEvents(matchEventsData || []);
          }
        }
      }
    } catch (error) {
      console.error('Error loading personalized events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) return null;
  if (likedEvents.length === 0 && matchEvents.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Events You Liked */}
      {likedEvents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary" />
            Events You Liked
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {likedEvents.map((event) => (
              <Card
                key={event.id}
                className="glass-card p-4 hover:scale-105 transition-transform cursor-pointer"
              >
                <Badge variant="secondary" className="mb-2">
                  {event.event_type === 'club' ? '🏛️ Club' : 
                   event.event_type === 'private_host' ? '🗝️ Private' : 
                   event.event_type === 'secret' ? '🔮 Secret' : '☕ Cafe'}
                </Badge>
                <h3 className="font-semibold mb-2 line-clamp-1">{event.title}</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(event.date), 'MMM d')} at {event.start_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  {event.music_tags && event.music_tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      <span className="truncate">{event.music_tags[0]}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Your Matches Going */}
      {matchEvents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            Your Matches Going
            <Badge variant="secondary" className="ml-2 text-xs">
              2+ matches interested
            </Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {matchEvents.map((event) => (
              <Card
                key={event.id}
                className="glass-card p-4 hover:scale-105 transition-transform cursor-pointer border-accent/20"
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary">
                    {event.event_type === 'club' ? '🏛️ Club' : 
                     event.event_type === 'private_host' ? '🗝️ Private' : 
                     event.event_type === 'secret' ? '🔮 Secret' : '☕ Cafe'}
                  </Badge>
                  <Badge className="bg-accent/20 text-accent border-accent/30">
                    <Users className="w-3 h-3 mr-1" />
                    Matches going
                  </Badge>
                </div>
                <h3 className="font-semibold mb-2 line-clamp-1">{event.title}</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(event.date), 'MMM d')} at {event.start_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};