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
      <div className="flex gap-2 sm:gap-3 p-2 sm:p-3">
        {/* Event poster */}
        <div className="relative flex-shrink-0">
          <img
            src={posterImage}
            alt={event.title}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover"
          />
          {event.isPrivate && (
            <Badge className="absolute -top-1 -right-1 text-[10px] sm:text-xs bg-accent text-accent-foreground px-1 py-0">
              Private
            </Badge>
          )}
          {event.isPromoted && (
            <Badge className="absolute -bottom-1 -right-1 text-[10px] sm:text-xs gradient-accent px-1 py-0">
              AD
            </Badge>
          )}
        </div>

        {/* Event info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1 sm:mb-2">
            <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 flex-1 mr-2 leading-tight">
              {event.title}
            </h3>
            <div className="text-right flex-shrink-0">
              <div className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                {event.price === 0 ? 'Free' : `€${event.price}`}
              </div>
              {event.originalPrice && event.originalPrice > event.price && (
                <div className="text-[10px] sm:text-xs text-muted-foreground line-through">
                  €{event.originalPrice}
                </div>
              )}
            </div>
          </div>

          {/* Host info */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
            <Avatar className="w-4 h-4 sm:w-5 sm:h-5">
              <AvatarImage src={event.host.avatar} />
              <AvatarFallback className="text-[10px] sm:text-xs">
                {event.host.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
              by {event.host.name}
            </span>
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-accent text-accent" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {event.host.rating}
              </span>
            </div>
          </div>

          {/* Event details */}
          <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground mb-1 sm:mb-2">
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              <Clock size={10} className="sm:w-3 sm:h-3" />
              <span className="whitespace-nowrap">
                {new Date(event.startTime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              <Users size={10} className="sm:w-3 sm:h-3" />
              <span className="whitespace-nowrap">{event.attendees}/{event.capacity}</span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              <MapPin size={10} className="sm:w-3 sm:h-3" />
              <span className="whitespace-nowrap">{event.distance}km</span>
            </div>
          </div>

          {/* Additional event info */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs mb-1 sm:mb-2">
            {event.djName && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0 h-auto">
                DJ: {event.djName}
              </Badge>
            )}
            <span className="text-base sm:text-lg">{event.bringOwnDrinks ? '🥤' : '🚫'}</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
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
                className="text-[10px] sm:text-xs px-1.5 py-0 h-auto"
              >
                {genre}
              </Badge>
            ))}
            {event.genres.length > 2 && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0 h-auto">
                +{event.genres.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Capacity bar */}
      <div className="px-2 sm:px-3 pb-2 sm:pb-3">
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