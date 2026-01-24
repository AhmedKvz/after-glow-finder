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
    <div className="w-full flex justify-center py-2 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2 sm:gap-3"
      >
        {/* Streak */}
        <Card className="glass-card px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1.5 sm:gap-2 border-orange-600/30">
          <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
          <div className="text-center">
            <div className="text-sm sm:text-lg font-bold text-orange-400">{streak}</div>
            <div className="text-[8px] sm:text-[10px] text-muted-foreground">STREAK</div>
          </div>
        </Card>

        {/* XP Today */}
        <Card className="glass-card px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1.5 sm:gap-2 border-primary/30">
          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary fill-primary" />
          <div className="text-center">
            <div className="text-sm sm:text-lg font-bold text-primary">+{xpToday}</div>
            <div className="text-[8px] sm:text-[10px] text-muted-foreground">XP TODAY</div>
          </div>
        </Card>

        {/* Total Swipes */}
        <Card className="glass-card px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1.5 sm:gap-2 border-blue-600/30">
          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
          <div className="text-center">
            <div className="text-sm sm:text-lg font-bold text-blue-400">{totalSwipes}</div>
            <div className="text-[8px] sm:text-[10px] text-muted-foreground">SWIPES</div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};