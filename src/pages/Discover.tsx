import { useState, useEffect } from 'react';
import { MapPin, Users, Clock, Star, Eye, Map, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EventCard } from '@/components/EventCard';
import { EventDetails } from '@/components/EventDetails';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import eventPoster1 from '@/assets/event-poster-1.jpg';
import eventPoster2 from '@/assets/event-poster-2.jpg';
import eventPoster3 from '@/assets/event-poster-3.jpg';

interface DBEvent {
  id: string;
  title: string;
  description: string | null;
  location: string;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  dj_name: string | null;
  music_tags: string[];
  bring_own_drinks: boolean;
  allow_plus_one: boolean;
  allow_plus_two: boolean;
}

const Discover = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<DBEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (data) {
      setEvents(data);
    }
    setLoading(false);
  };

  const formatEventTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatEventDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  if (selectedEventId) {
    // Will implement EventDetails view later with real data
    return (
      <div className="min-h-screen bg-background safe-top p-4">
        <Button onClick={() => setSelectedEventId(null)} variant="outline" className="mb-4">
          ← Back
        </Button>
        <Card className="glass-card p-6">
          <p>Event details for {selectedEventId}</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background safe-top flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const featuredEvents = events.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="safe-top px-4 pt-6 pb-4">
        <div className="flex-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gradient-primary">
              Tonight Near You
            </h1>
            <p className="text-muted-foreground mt-1">
              Belgrade • {events.length} events happening
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            className="gap-2"
          >
            {viewMode === 'list' ? <Map size={16} /> : <Eye size={16} />}
            {viewMode === 'list' ? 'Map' : 'List'}
          </Button>
        </div>

        {/* Featured carousel */}
        {featuredEvents.length > 0 && (
          <div className="space-y-4 mb-6">
            <h2 className="text-lg font-semibold">Featured Tonight</h2>
            <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
              {featuredEvents.map((event, index) => (
                <Card 
                  key={event.id} 
                  className="relative min-w-[280px] h-[200px] overflow-hidden glass-card cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedEventId(event.id)}
                >
                  <img
                    src={[eventPoster1, eventPoster2, eventPoster3][index % 3]}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-1 line-clamp-2">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-4 text-white/80 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatEventTime(event.date, event.start_time)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            {event.capacity}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {event.music_tags && event.music_tags.length > 0 && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                          {event.music_tags[0]}
                        </Badge>
                      )}
                      <div className="text-white text-sm">
                        {formatEventDate(event.date)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Events list */}
      <div className="px-4 pb-24">
        <div className="flex-between mb-4">
          <h2 className="text-lg font-semibold">All Events</h2>
        </div>

        {events.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <p className="text-muted-foreground mb-4">No events found</p>
            <p className="text-sm text-muted-foreground">
              Be the first to host an after in your city!
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <Card 
                key={event.id}
                className="glass-card p-4 cursor-pointer hover:bg-surface-hover transition-colors"
                onClick={() => setSelectedEventId(event.id)}
              >
                <div className="flex gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{event.title}</h3>
                    {event.dj_name && (
                      <p className="text-sm text-muted-foreground mb-2">
                        DJ: {event.dj_name}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatEventTime(event.date, event.start_time)}
                      </div>
                    </div>
                    {event.music_tags && event.music_tags.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {event.music_tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Badge variant="outline">
                      {formatEventDate(event.date)}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users size={14} />
                      {event.capacity}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;