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
      setExitX(info.offset.x > 0 ? 200 : -200);
      onVote(info.offset.x > 0 ? 'yes' : 'no');
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX * 2 } : {}}
      transition={{ duration: 0.3 }}
      className="absolute w-full"
    >
      <Card className="glass-card overflow-hidden">
        {/* Profile Image/Avatar */}
        <div className="relative h-96 bg-gradient-to-br from-primary/20 to-accent/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-primary/30 flex items-center justify-center">
              <span className="text-6xl font-bold text-white">
                {profile.display_name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
          </div>

          {/* Swipe indicators */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: x.get() > 50 ? 1 : 0 }}
              className="absolute top-8 left-8 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xl rotate-[-15deg]"
            >
              LIKE
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: x.get() < -50 ? 1 : 0 }}
              className="absolute top-8 right-8 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xl rotate-[15deg]"
            >
              NOPE
            </motion.div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold">{profile.display_name || 'Anonymous'}</h2>
            <p className="text-muted-foreground">{profile.city || 'Belgrade'}</p>
          </div>

          {profile.bio && (
            <p className="text-sm">{profile.bio}</p>
          )}

          {profile.music_tags && profile.music_tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Music Taste</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {profile.music_tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
