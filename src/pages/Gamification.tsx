import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, Target, Sparkles, TrendingUp, Award, 
  Zap, Star, Gift, ArrowRight, Flame
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface UserStats {
  xp: number;
  level: string;
  trust_score: number;
  badges: string[];
  events_attended: number;
  afters_hosted: number;
  lucky100_wins: number;
  vip_status: boolean;
}

const Gamification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentXP, setRecentXP] = useState<Array<{ action: string; xp: number; time: string }>>([]);

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('xp, level, trust_score, badges, events_attended, afters_hosted, lucky100_wins, vip_status')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setStats(data as UserStats);
    }

    setLoading(false);
  };

  const getLevelProgress = () => {
    if (!stats) return 0;
    const levelThresholds = {
      'Newbie': 100,
      'Explorer': 500,
      'Rising Star': 1000,
      'Regular': 2000,
      'Pro': 5000,
      'VIP': 10000,
      'Legend': 99999,
    };
    
    const currentThreshold = levelThresholds[stats.level as keyof typeof levelThresholds] || 100;
    const previousLevel = Object.keys(levelThresholds)[Object.keys(levelThresholds).indexOf(stats.level) - 1];
    const previousThreshold = previousLevel ? levelThresholds[previousLevel as keyof typeof levelThresholds] : 0;
    
    const progress = ((stats.xp - previousThreshold) / (currentThreshold - previousThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getTrustScoreColor = () => {
    if (!stats) return 'text-muted-foreground';
    if (stats.trust_score >= 80) return 'text-emerald-400';
    if (stats.trust_score >= 60) return 'text-blue-400';
    if (stats.trust_score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading your stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-safe-bottom">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 via-purple-600/20 to-pink-600/20 p-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-amber-400" />
            Gamification
          </h1>
          <p className="text-muted-foreground">
            Track your progress and earn rewards
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 space-y-6 pb-24">
        {/* XP & Level Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card p-6 border-2 border-primary/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gradient-primary">
                  {stats?.level || 'Newbie'}
                </h3>
                <p className="text-sm text-muted-foreground">Level</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold flex items-center gap-1">
                  <Zap className="w-6 h-6 text-amber-400" />
                  {stats?.xp || 0}
                </div>
                <p className="text-sm text-muted-foreground">XP</p>
              </div>
            </div>
            
            <Progress value={getLevelProgress()} className="h-3 mb-2" />
            <p className="text-xs text-muted-foreground text-center">
              {stats?.xp || 0} / {stats?.level === 'Legend' ? '∞' : '10000'} XP to next level
            </p>
          </Card>
        </motion.div>

        {/* Trust Score & VIP Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <Card className="glass-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Star className={`w-5 h-5 ${getTrustScoreColor()}`} />
              </div>
              <div>
                <div className={`text-xl font-bold ${getTrustScoreColor()}`}>
                  {stats?.trust_score || 50}
                </div>
                <p className="text-xs text-muted-foreground">Trust Score</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Sparkles className={`w-5 h-5 ${stats?.vip_status ? 'text-amber-400' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <div className="text-xl font-bold">
                  {stats?.vip_status ? 'VIP' : 'Regular'}
                </div>
                <p className="text-xs text-muted-foreground">Status</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Your Badges
            </h3>
            
            {stats?.badges && (stats.badges as any).length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {(stats.badges as any).map((badge: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs px-3 py-1 whitespace-nowrap">
                    {badge}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Complete quests to earn badges! 🏆
              </p>
            )}
          </Card>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-3"
        >
          <Card className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {stats?.events_attended || 0}
            </div>
            <p className="text-xs text-muted-foreground">Events</p>
          </Card>

          <Card className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {stats?.afters_hosted || 0}
            </div>
            <p className="text-xs text-muted-foreground">Hosted</p>
          </Card>

          <Card className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-amber-400 mb-1">
              {stats?.lucky100_wins || 0}
            </div>
            <p className="text-xs text-muted-foreground">Lucky Wins</p>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-4"
        >
          <Button
            onClick={() => navigate('/quests')}
            className="gradient-primary h-20 flex-col gap-2"
          >
            <Target className="w-6 h-6" />
            <span>Quests</span>
          </Button>

          <Button
            onClick={() => navigate('/lucky100')}
            className="bg-gradient-to-r from-amber-600 to-orange-600 h-20 flex-col gap-2"
          >
            <Gift className="w-6 h-6" />
            <span>Lucky 100</span>
          </Button>

          <Button
            onClick={() => navigate('/leaderboard')}
            variant="outline"
            className="h-20 flex-col gap-2"
          >
            <Trophy className="w-6 h-6" />
            <span>Leaderboard</span>
          </Button>

          <Button
            onClick={() => navigate('/season')}
            className="bg-gradient-to-r from-amber-600 to-yellow-500 h-20 flex-col gap-2"
          >
            <Award className="w-6 h-6" />
            <span>Season Board</span>
          </Button>

          <Button
            onClick={() => navigate('/heat-leaderboard')}
            className="bg-gradient-to-r from-red-600 to-orange-500 h-20 flex-col gap-2"
          >
            <Flame className="w-6 h-6" />
            <span>Heat Ranks</span>
          </Button>

          <Button
            onClick={() => navigate('/profile')}
            variant="outline"
            className="h-20 flex-col gap-2 col-span-2"
          >
            <Star className="w-6 h-6" />
            <span>My Profile</span>
          </Button>
        </motion.div>

        {/* Recent XP Gains */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-card p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent XP Gains
            </h3>
            
            {recentXP.length > 0 ? (
              <div className="space-y-3">
                {recentXP.map((item, index) => (
                  <div key={index} className="flex items-center justify-between glass-card p-3 rounded-lg">
                    <span className="text-sm">{item.action}</span>
                    <Badge className="bg-primary/20 text-primary">
                      +{item.xp} XP
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  Start earning XP by completing quests and attending events!
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Gamification;