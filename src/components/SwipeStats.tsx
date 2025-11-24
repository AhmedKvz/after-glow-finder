import { motion } from 'framer-motion';
import { Zap, Flame, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SwipeStatsProps {
  streak: number;
  xpToday: number;
  totalSwipes: number;
}

export const SwipeStats = ({ streak, xpToday, totalSwipes }: SwipeStatsProps) => {
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3"
      >
        {/* Streak */}
        <Card className="glass-card px-4 py-2 flex items-center gap-2 border-orange-600/30">
          <Flame className="w-4 h-4 text-orange-400" />
          <div className="text-center">
            <div className="text-lg font-bold text-orange-400">{streak}</div>
            <div className="text-[10px] text-muted-foreground">STREAK</div>
          </div>
        </Card>

        {/* XP Today */}
        <Card className="glass-card px-4 py-2 flex items-center gap-2 border-primary/30">
          <Zap className="w-4 h-4 text-primary fill-primary" />
          <div className="text-center">
            <div className="text-lg font-bold text-primary">+{xpToday}</div>
            <div className="text-[10px] text-muted-foreground">XP TODAY</div>
          </div>
        </Card>

        {/* Total Swipes */}
        <Card className="glass-card px-4 py-2 flex items-center gap-2 border-blue-600/30">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">{totalSwipes}</div>
            <div className="text-[10px] text-muted-foreground">SWIPES</div>
          </div>
        </Card>
      </motion.div>

      {/* Hint Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-3 text-center"
      >
        <Badge variant="secondary" className="glass-card text-xs">
          Swipe to discover events & earn XP! 🎉
        </Badge>
      </motion.div>
    </div>
  );
};