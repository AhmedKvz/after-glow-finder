import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MapPin, Clock, Heart, ExternalLink, Navigation } from 'lucide-react';
import eventPoster1 from '@/assets/event-poster-1.jpg';
import eventPoster2 from '@/assets/event-poster-2.jpg';
import eventPoster3 from '@/assets/event-poster-3.jpg';

interface MapViewProps {
  events: any[];
  onEventClick: (event: any) => void;
}

const posterImages = [eventPoster1, eventPoster2, eventPoster3];

// Genre to color mapping
const genreColors: Record<string, string> = {
  techno: 'bg-purple-500',
  house: 'bg-blue-500',
  rnb: 'bg-orange-500',
  'drum & bass': 'bg-green-500',
  'hip hop': 'bg-pink-500',
  default: 'bg-primary',
};

const getGenreColor = (musicTags: string[] | null) => {
  if (!musicTags || musicTags.length === 0) return genreColors.default;
  const firstTag = musicTags[0].toLowerCase();
  return genreColors[firstTag] || genreColors.default;
};

export const MapView = ({ events, onEventClick }: MapViewProps) => {
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const handleOpenInMaps = (event: any) => {
    const address = encodeURIComponent(event.exact_address || event.location || 'Belgrade');
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Info Card */}
      <Card className="glass-card p-4 border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Map View</h3>
            <p className="text-sm text-muted-foreground">
              Tap an event to view details or open in Google Maps
            </p>
          </div>
        </div>
      </Card>

      {/* Events List as Map Markers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event, index) => {
          const posterImage = posterImages[index % posterImages.length];
          const genreColor = getGenreColor(event.music_tags);
          
          return (
            <Card 
              key={event.id}
              className={`glass-card overflow-hidden cursor-pointer transition-all hover:scale-[1.02] ${
                selectedEvent?.id === event.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
            >
              <div className="flex gap-3 p-3">
                {/* Event Thumbnail with Genre Indicator */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={posterImage}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Genre color indicator */}
                  <div className={`absolute top-1 left-1 w-3 h-3 rounded-full ${genreColor} border-2 border-white shadow-md`} />
                </div>
                
                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm truncate">{event.title}</h3>
                    {event.swipe_count > 0 && (
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        <Heart className="w-3 h-3 mr-1 fill-current" />
                        {event.swipe_count}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">
                      {event.is_location_hidden ? 'Hidden' : event.location}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(event.date).toLocaleDateString()} • {event.start_time}</span>
                  </div>
                  
                  {/* Music Tags */}
                  {event.music_tags && event.music_tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {event.music_tags.slice(0, 2).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              {selectedEvent?.id === event.id && (
                <div className="flex gap-2 p-3 pt-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInMaps(event);
                    }}
                    className="flex-1 glass-card"
                  >
                    <Navigation className="w-3 h-3 mr-1" />
                    Open in Maps
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className="flex-1 gradient-primary"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View Event
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      
      {events.length === 0 && (
        <Card className="glass-card p-8 text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No events to display</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters to see more events
          </p>
        </Card>
      )}
      
      {/* Legend */}
      <Card className="glass-card p-4">
        <h4 className="text-sm font-semibold mb-3">Genre Legend</h4>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-xs text-muted-foreground">Techno</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-muted-foreground">House</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-xs text-muted-foreground">RnB</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">D&B</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-pink-500" />
            <span className="text-xs text-muted-foreground">Hip Hop</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
