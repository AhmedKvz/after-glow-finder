import { useState } from 'react';
import { MapPin, Users, Clock, Star, Eye, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EventCard } from '@/components/EventCard';
import { EventDetails } from '@/components/EventDetails';
import { mockEvents } from '@/data/mockData';
import { Event } from '@/types';
import eventPoster1 from '@/assets/event-poster-1.jpg';
import eventPoster2 from '@/assets/event-poster-2.jpg';
import eventPoster3 from '@/assets/event-poster-3.jpg';

const Discover = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  const featuredEvents = mockEvents.slice(0, 3);
  const todayEvents = mockEvents.filter(event => 
    new Date(event.startTime).toDateString() === new Date().toDateString()
  );

  if (selectedEvent) {
    return (
      <EventDetails 
        event={selectedEvent} 
        onBack={() => setSelectedEvent(null)} 
      />
    );
  }

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
              Belgrade • 12 events happening
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

        {/* Hero carousel */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Featured Tonight</h2>
          <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
            {featuredEvents.map((event, index) => (
              <Card 
                key={event.id} 
                className="relative min-w-[280px] h-[200px] overflow-hidden glass-card cursor-pointer transition-transform hover:scale-105"
                onClick={() => setSelectedEvent(event)}
              >
                <img
                  src={[eventPoster1, eventPoster2, eventPoster3][index]}
                  alt={event.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Event info overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1 line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-4 text-white/80 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(event.startTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          {event.attendees}
                        </div>
                      </div>
                    </div>
                    {event.isPromoted && (
                      <Badge className="gradient-accent text-xs">AD</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      {event.genres[0]}
                    </Badge>
                    <div className="text-white font-medium">
                      {event.price === 0 ? 'Free' : `€${event.price}`}
                    </div>
                  </div>
                </div>

                {/* Private ribbon */}
                {event.isPrivate && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-accent text-accent-foreground">Private</Badge>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Events section */}
      <div className="px-4 pb-4">
        <div className="flex-between mb-4">
          <h2 className="text-lg font-semibold">All Events</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            View all
          </Button>
        </div>

        <div className="space-y-3">
          {mockEvents.map((event) => (
            <div key={event.id} onClick={() => setSelectedEvent(event)}>
              <EventCard event={event} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Discover;