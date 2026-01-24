import { useEffect, useState } from 'react';
import { MapPin, Users, Clock, Star, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Event } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { HeatBadge } from '@/components/HeatBadge';
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
  const [reviewData, setReviewData] = useState<{ avgRating: number; count: number } | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (event.eventType === 'private_host') {
        // Fetch host reviews from user_reviews
        const { data, error } = await supabase
          .from('user_reviews')
          .select('rating')
          .eq('reviewed_user_id', event.host.id);

        if (data && data.length > 0) {
          const avgRating = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
          setReviewData({ avgRating, count: data.length });
        }
      } else {
        // Fetch event reviews from event_reviews
        const { data, error } = await supabase
          .from('event_reviews')
          .select('rating')
          .eq('event_id', event.id);

        if (data && data.length > 0) {
          const avgRating = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
          setReviewData({ avgRating, count: data.length });
        }
      }
    };

    fetchReviews();
  }, [event.id, event.eventType, event.host.id]);
  
  return (
    <Card className="glass-card interactive overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] min-h-fit">
      <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">
        {/* Event poster */}
        <div className="relative flex-shrink-0">
          <img
            src={posterImage}
            alt={event.title}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover"
          />
          {event.eventType === 'club' && (
            <Badge className="absolute top-1 left-1 text-[10px] sm:text-[11px] bg-emerald-600/20 text-emerald-300 backdrop-blur-sm px-1.5 py-0.5">
              🏛️ CLUB
            </Badge>
          )}
          {event.eventType === 'private_host' && (
            <Badge className="absolute top-1 left-1 text-[10px] sm:text-[11px] bg-yellow-600/20 text-yellow-300 backdrop-blur-sm px-1.5 py-0.5">
              🗝️ PRIVATE
            </Badge>
          )}
          {event.isPromoted && (
            <Badge className="absolute -bottom-1 -right-1 text-[10px] sm:text-xs gradient-accent px-1 py-0">
              AD
            </Badge>
          )}
        </div>

        {/* Event info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <h3 className="font-semibold text-[15px] sm:text-base md:text-lg leading-snug break-words whitespace-normal flex-1 mr-2">
              {event.title}
            </h3>
            <div className="text-right flex-shrink-0">
              <div className="font-semibold text-[13px] sm:text-sm whitespace-nowrap">
                {event.price === 0 ? 'Free' : `€${event.price}`}
              </div>
              {event.originalPrice && event.originalPrice > event.price && (
                <div className="text-[11px] sm:text-xs text-muted-foreground line-through">
                  €{event.originalPrice}
                </div>
              )}
            </div>
          </div>

          {/* Host info */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Avatar className="w-5 h-5 sm:w-6 sm:h-6">
                <AvatarImage src={event.host.avatar} />
                <AvatarFallback className="text-[11px] sm:text-xs">
                  {event.host.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-[13px] sm:text-sm text-muted-foreground break-words whitespace-normal">
                by {event.host.name}
              </span>
            </div>
            
            {/* Review Rating Badge */}
            {reviewData && (
              <Badge variant="secondary" className="flex items-center gap-1 px-2 py-0.5 h-auto">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                <span className="text-[13px] font-semibold">{reviewData.avgRating.toFixed(1)}</span>
                <MessageSquare className="w-3 h-3 ml-0.5" />
                <span className="text-[13px]">{reviewData.count}</span>
              </Badge>
            )}
          </div>

          {/* Event details */}
          <div className="flex items-center gap-3 sm:gap-4 text-[13px] sm:text-sm text-muted-foreground mb-2 flex-wrap">
            <div className="flex items-center gap-1 flex-shrink-0">
              <Clock size={14} className="sm:w-4 sm:h-4" />
              <span className="whitespace-nowrap">
                {new Date(event.startTime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Users size={14} className="sm:w-4 sm:h-4" />
              <span className="whitespace-nowrap">{event.attendees}/{event.capacity}</span>
            </div>
            {/* Location - conditional display based on event type */}
            {event.eventType === 'private_host' ? (
              <div className="flex items-center gap-1 flex-shrink-0 text-muted-foreground/60">
                <MapPin size={14} className="sm:w-4 sm:h-4" />
                <span className="whitespace-nowrap italic text-xs">Private location</span>
              </div>
            ) : !event.isLocationHidden ? (
              <div className="flex items-center gap-1 flex-shrink-0">
                <MapPin size={14} className="sm:w-4 sm:h-4" />
                <span className="break-words whitespace-normal">{event.location.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 flex-shrink-0 text-muted-foreground/60">
                <MapPin size={14} className="sm:w-4 sm:h-4" />
                <span className="whitespace-nowrap">Hidden</span>
              </div>
            )}
          </div>

          {/* Additional event info */}
          <div className="flex items-center gap-2 text-[13px] sm:text-sm mb-2 flex-wrap">
            {event.djName && (
              <Badge variant="secondary" className="text-[13px] sm:text-sm px-2 py-0.5 h-auto break-words whitespace-normal">
                DJ: {event.djName}
              </Badge>
            )}
            <span className="text-base sm:text-lg">{event.bringOwnDrinks ? '🥤' : '🚫'}</span>
            <span className="text-[13px] sm:text-sm text-muted-foreground break-words whitespace-normal">
              Ends {new Date(event.endTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          {/* Tags - Show ALL tags */}
          <div className="flex gap-1.5 flex-wrap items-center">
            {/* Heat Badge */}
            {event.heatScore && event.heatScore > 0 && (
              <HeatBadge heatScore={event.heatScore} heatBadge={event.heatBadge} size="sm" />
            )}
            {event.genres.map((genre) => (
              <Badge 
                key={genre} 
                variant="secondary" 
                className="text-[13px] sm:text-sm px-2 py-0.5 h-auto"
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Capacity bar */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="w-full bg-muted rounded-full h-1.5">
          <div 
            className="h-full rounded-full gradient-primary transition-all duration-500"
            style={{ width: `${(event.attendees / event.capacity) * 100}%` }}
          />
        </div>
      </div>
    </Card>
  );
};