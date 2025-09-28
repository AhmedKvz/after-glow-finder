import { MapPin, Users, Clock, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Event } from '@/types';
import eventPoster1 from '@/assets/event-poster-1.jpg';
import eventPoster2 from '@/assets/event-poster-2.jpg';
import eventPoster3 from '@/assets/event-poster-3.jpg';

interface EventCardProps {
  event: Event;
  compact?: boolean;
}

const posterImages = [eventPoster1, eventPoster2, eventPoster3];

export const EventCard: React.FC<EventCardProps> = ({ event, compact = false }) => {
  const posterImage = posterImages[event.id.charCodeAt(0) % posterImages.length];
  
  return (
    <Card className="glass-card interactive overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]">
      <div className="flex gap-3 p-3">
        {/* Event poster */}
        <div className="relative">
          <img
            src={posterImage}
            alt={event.title}
            className="w-20 h-20 rounded-lg object-cover"
          />
          {event.isPrivate && (
            <Badge className="absolute -top-1 -right-1 text-xs bg-accent text-accent-foreground">
              Private
            </Badge>
          )}
          {event.isPromoted && (
            <Badge className="absolute -bottom-1 -right-1 text-xs gradient-accent">
              AD
            </Badge>
          )}
        </div>

        {/* Event info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-sm line-clamp-2 flex-1 mr-2">
              {event.title}
            </h3>
            <div className="text-right">
              <div className="font-semibold text-sm">
                {event.price === 0 ? 'Free' : `€${event.price}`}
              </div>
              {event.originalPrice && event.originalPrice > event.price && (
                <div className="text-xs text-muted-foreground line-through">
                  €{event.originalPrice}
                </div>
              )}
            </div>
          </div>

          {/* Host info */}
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-5 h-5">
              <AvatarImage src={event.host.avatar} />
              <AvatarFallback className="text-xs">
                {event.host.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              by {event.host.name}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-accent text-accent" />
              <span className="text-xs text-muted-foreground">
                {event.host.rating}
              </span>
            </div>
          </div>

          {/* Event details */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              {new Date(event.startTime).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div className="flex items-center gap-1">
              <Users size={12} />
              {event.attendees}/{event.capacity}
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              {event.distance}km
            </div>
          </div>

          {/* Additional event info */}
          <div className="flex items-center gap-2 text-xs mb-2">
            {event.djName && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                DJ: {event.djName}
              </Badge>
            )}
            <span className="text-lg">{event.bringOwnDrinks ? '🥤' : '🚫'}</span>
            <span className="text-xs text-muted-foreground">
              Ends {new Date(event.endTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          {/* Tags */}
          <div className="flex gap-1 flex-wrap">
            {event.genres.slice(0, 2).map((genre) => (
              <Badge 
                key={genre} 
                variant="secondary" 
                className="text-xs px-2 py-0.5"
              >
                {genre}
              </Badge>
            ))}
            {event.genres.length > 2 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                +{event.genres.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Capacity bar */}
      <div className="px-3 pb-3">
        <div className="w-full bg-muted rounded-full h-1">
          <div 
            className="h-full rounded-full gradient-primary transition-all duration-500"
            style={{ width: `${(event.attendees / event.capacity) * 100}%` }}
          />
        </div>
      </div>
    </Card>
  );
};