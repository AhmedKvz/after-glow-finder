import { useState } from 'react';
import { Heart, X, Music } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface CircleSwipeCardProps {
  profile: any;
  onVote: (vote: 'yes' | 'no') => void;
}

export const CircleSwipeCard = ({ profile, onVote }: CircleSwipeCardProps) => {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      setExitX(info.offset.x > 0 ? 300 : -300);
      setTimeout(() => {
        onVote(info.offset.x > 0 ? 'yes' : 'no');
        setExitX(0);
      }, 300);
    }
  };

  const handleButtonVote = (vote: 'yes' | 'no') => {
    setExitX(vote === 'yes' ? 300 : -300);
    setTimeout(() => {
      onVote(vote);
      setExitX(0);
    }, 300);
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX * 2, opacity: 0 } : {}}
      transition={{ duration: 0.3 }}
      className="absolute w-full cursor-grab active:cursor-grabbing"
    >
      <Card className="glass-card overflow-hidden max-w-md mx-auto">
        {/* Profile Image/Avatar */}
        <div className="relative h-80 sm:h-96 bg-gradient-to-br from-primary/20 to-accent/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-primary/30 flex items-center justify-center">
              <span className="text-5xl sm:text-6xl font-bold text-white">
                {profile.display_name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
          </div>

          {/* Swipe indicators */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
              className="absolute top-6 left-4 sm:top-8 sm:left-8 bg-green-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold text-xl sm:text-2xl rotate-[-15deg] border-4 border-white shadow-lg"
            >
              LIKE
            </motion.div>
            <motion.div
              style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
              className="absolute top-6 right-4 sm:top-8 sm:right-8 bg-red-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold text-xl sm:text-2xl rotate-[15deg] border-4 border-white shadow-lg"
            >
              NOPE
            </motion.div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-5 sm:p-6 space-y-3 sm:space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{profile.display_name || 'Anonymous'}</h2>
            <p className="text-sm sm:text-base text-muted-foreground">{profile.city || 'Belgrade'}</p>
          </div>

          {profile.bio && (
            <p className="text-sm sm:text-base leading-relaxed">{profile.bio}</p>
          )}

          {profile.music_tags && profile.music_tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="text-sm sm:text-base font-medium">Music Taste</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {profile.music_tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs sm:text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Action Buttons - Outside card, always visible, above TabBar */}
      <div className="flex gap-4 sm:gap-6 justify-center mt-6 mb-8 relative z-10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            handleButtonVote('no');
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-xl border-4 border-white transition-colors"
        >
          <X className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={3} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            handleButtonVote('yes');
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-xl border-4 border-white transition-colors"
        >
          <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white" strokeWidth={3} />
        </motion.button>
      </div>
    </motion.div>
  );
};
