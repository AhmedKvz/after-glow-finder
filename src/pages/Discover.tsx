import { useState, useEffect } from 'react';
import { MapPin, Clock, Users, Loader2, Music, Search, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { BuyTicketModal } from '@/components/BuyTicketModal';
import eventPoster1 from '@/assets/event-poster-1.jpg';
import eventPoster2 from '@/assets/event-poster-2.jpg';
import eventPoster3 from '@/assets/event-poster-3.jpg';

const Discover = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventForTicket, setSelectedEventForTicket] = useState<any | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .limit(20);

    if (data) {
      setEvents(data);
    }
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
                  className="relative min-w-[280px] h-[200px] overflow-hidden glass-card cursor-pointer transition-transform hover:scale-105"
                >
                  <img
                    src={[eventPoster1, eventPoster2, eventPoster3][index % 3]}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Event info overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-4 text-white/80 text-sm mb-2">
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
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        {event.music_tags[0]}
                      </Badge>
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
                <Card key={event.id} className="glass-card p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-primary/10 flex-shrink-0">
                      <img
                        src={[eventPoster1, eventPoster2, eventPoster3][Math.floor(Math.random() * 3)]}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin size={14} />
                        <span className="truncate">{event.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock size={14} />
                        <span>
                          {new Date(event.date).toLocaleDateString()} • {event.start_time}
                        </span>
                      </div>

                      {event.music_tags && event.music_tags.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {event.music_tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end justify-between gap-2">
                      <Badge variant="secondary" className="whitespace-nowrap">
                        {event.capacity} cap
                      </Badge>
                      <Button
                        size="sm"
                        className="gradient-primary whitespace-nowrap"
                        onClick={() => setSelectedEventForTicket(event)}
                      >
                        <Ticket className="w-3 h-3 mr-1" />
                        Get Ticket
                      </Button>
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
    </div>
  );
};

export default Discover;
