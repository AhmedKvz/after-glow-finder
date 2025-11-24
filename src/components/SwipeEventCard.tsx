import { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { useDrag } from '@use-gesture/react';
import { Heart, Lock, Key, X, Check, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SecretEventLockOverlay } from '@/components/SecretEventLockOverlay';
import eventPoster1 from '@/assets/event-poster-1.jpg';
import eventPoster2 from '@/assets/event-poster-2.jpg';
import eventPoster3 from '@/assets/event-poster-3.jpg';

interface SwipeEventCardProps {
  event: any;
  onSwipeRight: (event: any) => void;
  onSwipeLeft: (event: any) => void;
  onSwipeUp: (event: any) => void;
  onTap: (event: any) => void;
}

const posterImages = [eventPoster1, eventPoster2, eventPoster3];

export const SwipeEventCard = ({
  event,
  onSwipeRight,
  onSwipeLeft,
  onSwipeUp,
  onTap
}: SwipeEventCardProps) => {
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [gone, setGone] = useState(false);
  
  const posterImage = posterImages[event.id.charCodeAt(0) % posterImages.length];
  const isPrivate = event.event_type === 'private_host' || event.is_private;
  const isSecret = event.is_secret || event.event_type === 'secret';
  const isLocked = isSecret && event.secret_access_level && (!event.userLevel || event.userLevel < event.secret_access_level);

  const [{ x, y, rotate, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
  }));

  const bind = useDrag(
    ({ active, movement: [mx, my], velocity: [vx, vy], direction: [xDir, yDir], tap }) => {
      if (tap) {
        onTap(event);
        return;
      }

      const trigger = velocity => velocity > 0.2;
      const triggerX = Math.abs(mx) > 150;
      const triggerY = my < -120;

      if (!active && (triggerX || triggerY)) {
        let dir: 'left' | 'right' | 'up' | null = null;
        
        if (triggerY && isPrivate) {
          // Swipe up for private events
          dir = 'up';
          setDirection('up');
          setGone(true);
          onSwipeUp(event);
        } else if (triggerX) {
          // Swipe left or right
          dir = xDir < 0 ? 'left' : 'right';
          setDirection(dir);
          setGone(true);
          
          if (dir === 'right') {
            onSwipeRight(event);
          } else {
            onSwipeLeft(event);
          }
        }

        if (dir) {
          api.start({
            x: dir === 'up' ? 0 : (dir === 'right' ? 200 : -200) * window.innerWidth,
            y: dir === 'up' ? -1000 : my,
            rotate: dir === 'up' ? 0 : mx / 10,
            scale: 0.8,
            config: { friction: 50, tension: 200 }
          });
        }
      } else if (active) {
        // Active dragging
        api.start({
          x: mx,
          y: my,
          rotate: mx / 10,
          scale: 1,
          immediate: true
        });
      } else {
        // Released but not triggered - return to center
        api.start({
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1
        });
      }
    },
    {
      filterTaps: true,
      pointer: { touch: true }
    }
  );

  if (gone) return null;

  const xRotateIndicator = x.to(val => val / 10);
  const swipeRightOpacity = x.to([0, 150], [0, 1]);
  const swipeLeftOpacity = x.to([0, -150], [0, 1]);
  const swipeUpOpacity = y.to([0, -120], [0, 1]);

  return (
    <animated.div
      {...bind()}
      style={{
        x,
        y,
        rotate,
        scale,
        touchAction: 'none'
      }}
      className="absolute w-full h-full cursor-grab active:cursor-grabbing"
    >
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
        {/* Event Cover Photo */}
        <img
          src={event.secret_cover_blurred && isLocked ? event.secret_cover_blurred : posterImage}
          alt={event.title}
          className={`absolute inset-0 w-full h-full object-cover ${isLocked ? 'blur-md' : ''}`}
          draggable={false}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        {/* Secret Event Lock Overlay */}
        {isLocked && (
          <SecretEventLockOverlay 
            requiredLevel={event.secret_access_level}
            userLevel={event.userLevel}
            previewText={event.secret_preview_text}
          />
        )}
        
        {/* Private Lock Overlay */}
        {isPrivate && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="w-20 h-20 rounded-full bg-yellow-600/20 backdrop-blur-md flex items-center justify-center mb-3 border-2 border-yellow-400/40">
              <Lock className="w-10 h-10 text-yellow-300" />
            </div>
            <p className="text-white font-semibold text-sm px-4">
              Swipe Up to Request Access
            </p>
          </div>
        )}

        {/* Swipe Indicators */}
        <animated.div
          style={{ opacity: swipeRightOpacity }}
          className="absolute top-1/4 right-8 transform -translate-y-1/2 pointer-events-none"
        >
          <div className="w-24 h-24 rounded-full bg-emerald-600/30 backdrop-blur-md flex items-center justify-center border-4 border-emerald-400">
            <Heart className="w-12 h-12 text-emerald-300 fill-emerald-300" />
          </div>
          <p className="text-emerald-300 font-bold text-center mt-2">LIKE</p>
        </animated.div>

        <animated.div
          style={{ opacity: swipeLeftOpacity }}
          className="absolute top-1/4 left-8 transform -translate-y-1/2 pointer-events-none"
        >
          <div className="w-24 h-24 rounded-full bg-red-600/30 backdrop-blur-md flex items-center justify-center border-4 border-red-400">
            <X className="w-12 h-12 text-red-300" />
          </div>
          <p className="text-red-300 font-bold text-center mt-2">SKIP</p>
        </animated.div>

        {isPrivate && (
          <animated.div
            style={{ opacity: swipeUpOpacity }}
            className="absolute top-12 left-1/2 transform -translate-x-1/2 pointer-events-none"
          >
            <div className="w-24 h-24 rounded-full bg-yellow-600/30 backdrop-blur-md flex items-center justify-center border-4 border-yellow-400">
              <Key className="w-12 h-12 text-yellow-300" />
            </div>
            <p className="text-yellow-300 font-bold text-center mt-2">REQUEST</p>
          </animated.div>
        )}

        {/* Event Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
          {/* Event Type Badge */}
          <div className="flex gap-2 items-center">
            {event.event_type === 'club' && (
              <Badge className="bg-emerald-600/30 text-emerald-200 border-0 backdrop-blur-sm">
                🏛️ PUBLIC
              </Badge>
            )}
            {event.event_type === 'cafe' && (
              <Badge className="bg-blue-600/30 text-blue-200 border-0 backdrop-blur-sm">
                ☕ CAFE
              </Badge>
            )}
            {event.event_type === 'private_host' && (
              <Badge className="bg-yellow-600/30 text-yellow-200 border-0 backdrop-blur-sm">
                🗝️ PRIVATE
              </Badge>
            )}
            {(event.is_private_after || isSecret) && (
              <Badge className="bg-purple-600/30 text-purple-200 border-0 backdrop-blur-sm">
                {isSecret ? '🔮 SECRET' : '🌙 AFTER'}
              </Badge>
            )}
            
            {/* XP Indicator */}
            <Badge className="bg-primary/30 text-primary-foreground border-0 backdrop-blur-sm ml-auto">
              <Zap className="w-3 h-3 mr-1 fill-current" />
              +3 XP
            </Badge>
          </div>

          {/* Event Title */}
          <h2 className="text-2xl font-bold text-white leading-tight">
            {event.title}
          </h2>

          {/* Event Details */}
          <div className="flex items-center gap-4 text-white/80 text-sm">
            <span>📅 {new Date(event.date).toLocaleDateString()}</span>
            <span>🕐 {event.start_time}</span>
          </div>

          <div className="flex items-center gap-4 text-white/80 text-sm">
            <span>📍 {event.is_location_hidden ? 'Hidden' : event.location}</span>
          </div>

          {/* Music Tags */}
          {event.music_tags && event.music_tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {event.music_tags.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="bg-white/20 text-white border-0">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </animated.div>
  );
};