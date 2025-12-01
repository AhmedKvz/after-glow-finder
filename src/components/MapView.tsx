import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MapPin, Music, Star } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  location: string;
  music_tags?: string[];
  swipe_count?: number;
  venue?: {
    lat?: number;
    lng?: number;
  };
}

interface MapViewProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

export const MapView = ({ events, onEventClick }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  useEffect(() => {
    // Check if Mapbox token is configured
    const token = import.meta.env.VITE_MAPBOX_TOKEN || '';
    if (!token) {
      console.warn('Mapbox token not configured');
    }
    setMapboxToken(token);
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [20.4489, 44.7866], // Belgrade coordinates
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add markers for events with coordinates
    events.forEach((event) => {
      if (event.venue?.lat && event.venue?.lng) {
        const el = document.createElement('div');
        el.className = 'w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110';
        
        // Color by genre
        const genre = event.music_tags?.[0]?.toLowerCase();
        if (genre === 'techno') {
          el.style.background = 'linear-gradient(135deg, #9333ea, #a855f7)';
        } else if (genre === 'house') {
          el.style.background = 'linear-gradient(135deg, #3b82f6, #60a5fa)';
        } else if (genre === 'rnb') {
          el.style.background = 'linear-gradient(135deg, #f97316, #fb923c)';
        } else {
          el.style.background = 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))';
        }
        
        el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        el.innerHTML = '📍';
        
        new mapboxgl.Marker(el)
          .setLngLat([event.venue.lng, event.venue.lat])
          .addTo(map.current!)
          .getElement()
          .addEventListener('click', () => {
            setSelectedEvent(event);
          });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [events, mapboxToken]);

  if (!mapboxToken) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center glass-card rounded-lg">
        <div className="text-center p-8 max-w-md">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Map View Unavailable</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Mapbox API key is required to display the map. Please add your Mapbox token to enable this feature.
          </p>
          <a
            href="https://mapbox.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Get a free Mapbox token →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[60vh]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg overflow-hidden shadow-lg" />
      
      {selectedEvent && (
        <Card className="absolute bottom-4 left-4 right-4 glass-card p-4 max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{selectedEvent.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <MapPin className="w-4 h-4" />
                <span>{selectedEvent.location}</span>
              </div>
              {selectedEvent.music_tags && selectedEvent.music_tags.length > 0 && (
                <div className="flex gap-1 mb-2">
                  {selectedEvent.music_tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Music className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              {selectedEvent.swipe_count !== undefined && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 fill-accent text-accent" />
                  {selectedEvent.swipe_count} interested
                </div>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => {
                onEventClick(selectedEvent);
                setSelectedEvent(null);
              }}
            >
              Open Event
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};