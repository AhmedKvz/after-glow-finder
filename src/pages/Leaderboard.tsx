import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Trophy, Zap, Star, Crown, Award, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface LeaderboardUser {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  level: string;
  afters_hosted: number;
  badges: string[];
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [xpLeaders, setXpLeaders] = useState<LeaderboardUser[]>([]);
  const [hostLeaders, setHostLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    // Load top XP users
    const { data: xpData } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url, xp, level, afters_hosted, badges')
      .order('xp', { ascending: false })
      .limit(50);

    if (xpData) {
      setXpLeaders(xpData as LeaderboardUser[]);
    }

    // Load top hosts
    const { data: hostData } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url, xp, level, afters_hosted, badges')
      .order('afters_hosted', { ascending: false })
      .limit(50);

    if (hostData) {
      setHostLeaders(hostData as LeaderboardUser[]);
    }

    setLoading(false);
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-amber-400" />;
      case 2:
        return <Trophy className="w-5 h-5 text-slate-400" />;
      case 3:
        return <Trophy className="w-5 h-5 text-amber-700" />;
      default:
        return <span className="text-muted-foreground font-bold">#{rank}</span>;
    }
  };

  const LeaderCard = ({ user, rank, type }: { user: LeaderboardUser; rank: number; type: 'xp' | 'host' }) => {
    const isTopThree = rank <= 3;

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: rank * 0.05 }}
      >
        <Card className={`glass-card p-4 ${isTopThree ? 'border-2 border-primary/50' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="w-8 flex items-center justify-center">
              {getMedalIcon(rank)}
            </div>

            <Avatar className={`${isTopThree ? 'w-14 h-14 border-2 border-primary' : 'w-12 h-12'}`}>
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>
                {user.display_name?.[0] || '?'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">
                {user.display_name || 'Anonymous'}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {user.level}
                </Badge>
                {(user.badges as any)?.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {(user.badges as any).length}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              {type === 'xp' ? (
                <>
                  <div className="font-bold text-lg flex items-center gap-1 justify-end">
                    <Zap className="w-4 h-4 text-amber-400" />
                    {user.xp.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">XP</p>
                </>
              ) : (
                <>
                  <div className="font-bold text-lg flex items-center gap-1 justify-end">
                    <Star className="w-4 h-4 text-purple-400" />
                    {user.afters_hosted}
                  </div>
                  <p className="text-xs text-muted-foreground">Hosted</p>
                </>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-safe-bottom">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 via-purple-600/20 to-pink-600/20 p-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/gamification')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-amber-400" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            See who's leading the charts
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 pb-24">
        <Tabs defaultValue="xp" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 glass-card">
            <TabsTrigger value="xp" className="data-[state=active]:bg-primary/20">
              <Zap className="w-4 h-4 mr-2" />
              Top XP
            </TabsTrigger>
            <TabsTrigger value="hosts" className="data-[state=active]:bg-primary/20">
              <TrendingUp className="w-4 h-4 mr-2" />
              Top Hosts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="xp" className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading leaderboard...
              </div>
            ) : xpLeaders.length > 0 ? (
              xpLeaders.map((user, index) => (
                <LeaderCard
                  key={user.user_id}
                  user={user}
                  rank={index + 1}
                  type="xp"
                />
              ))
            ) : (
              <Card className="glass-card p-12 text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">
                  No users on the leaderboard yet. Be the first!
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="hosts" className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading leaderboard...
              </div>
            ) : hostLeaders.filter(u => u.afters_hosted > 0).length > 0 ? (
              hostLeaders
                .filter(u => u.afters_hosted > 0)
                .map((user, index) => (
                  <LeaderCard
                    key={user.user_id}
                    user={user}
                    rank={index + 1}
                    type="host"
                  />
                ))
            ) : (
              <Card className="glass-card p-12 text-center">
                <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">
                  No hosts on the leaderboard yet. Start hosting events!
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Leaderboard;