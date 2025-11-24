import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Target, Check, Zap, Calendar, TrendingUp, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Quest {
  id: string;
  title: string;
  description: string;
  quest_type: 'daily' | 'weekly' | 'seasonal';
  xp_reward: number;
  status: 'in_progress' | 'completed';
  completed_at: string | null;
  expires_at: string | null;
}

const Quests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (user) {
      loadQuests();
    }
  }, [user]);

  const loadQuests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading quests:', error);
    } else if (data) {
      setQuests(data as Quest[]);
    }

    setLoading(false);
  };

  const completeQuest = async (questId: string, xpReward: number) => {
    if (!user) return;

    // Update quest status
    const { error: questError } = await supabase
      .from('quests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', questId);

    if (questError) {
      toast({
        variant: 'destructive',
        title: 'Failed to complete quest',
        description: questError.message,
      });
      return;
    }

    // Update user XP
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp')
      .eq('user_id', user.id)
      .single();

    const newXP = (profile?.xp || 0) + xpReward;

    const { error: xpError } = await supabase
      .from('profiles')
      .update({ xp: newXP })
      .eq('user_id', user.id);

    if (xpError) {
      toast({
        variant: 'destructive',
        title: 'Failed to update XP',
        description: xpError.message,
      });
      return;
    }

    // Show success
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3000);

    toast({
      title: 'Quest completed! 🎉',
      description: `You earned ${xpReward} XP!`,
    });

    loadQuests();
  };

  const filterQuests = (type: string) => {
    return quests.filter(q => q.quest_type === type);
  };

  const QuestCard = ({ quest }: { quest: Quest }) => {
    const isCompleted = quest.status === 'completed';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className={`glass-card p-5 ${isCompleted ? 'opacity-60' : ''}`}>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{quest.title}</h3>
              <p className="text-sm text-muted-foreground">{quest.description}</p>
            </div>
            
            {isCompleted && (
              <div className="p-2 bg-emerald-600/20 rounded-lg">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Badge className="bg-primary/20 text-primary flex items-center gap-1">
              <Zap className="w-3 h-3" />
              +{quest.xp_reward} XP
            </Badge>

            {!isCompleted && (
              <Button
                size="sm"
                onClick={() => completeQuest(quest.id, quest.xp_reward)}
                className="gradient-primary"
              >
                Complete
              </Button>
            )}
            
            {isCompleted && quest.completed_at && (
              <span className="text-xs text-muted-foreground">
                ✓ {new Date(quest.completed_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {quest.expires_at && !isCompleted && (
            <div className="mt-3 text-xs text-amber-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Expires: {new Date(quest.expires_at).toLocaleDateString()}
            </div>
          )}
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
            <Target className="w-8 h-8 text-primary" />
            Quests
          </h1>
          <p className="text-muted-foreground">
            Complete quests to earn XP and level up
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 pb-24">
        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 glass-card">
            <TabsTrigger value="daily" className="data-[state=active]:bg-primary/20">
              <Calendar className="w-4 h-4 mr-2" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-primary/20">
              <TrendingUp className="w-4 h-4 mr-2" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="seasonal" className="data-[state=active]:bg-primary/20">
              <Award className="w-4 h-4 mr-2" />
              Seasonal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading quests...</p>
              </div>
            ) : filterQuests('daily').length > 0 ? (
              filterQuests('daily').map(quest => (
                <QuestCard key={quest.id} quest={quest} />
              ))
            ) : (
              <Card className="glass-card p-12 text-center">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">
                  No daily quests available. Check back tomorrow!
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading quests...</p>
              </div>
            ) : filterQuests('weekly').length > 0 ? (
              filterQuests('weekly').map(quest => (
                <QuestCard key={quest.id} quest={quest} />
              ))
            ) : (
              <Card className="glass-card p-12 text-center">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">
                  No weekly quests available. Check back next week!
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="seasonal" className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading quests...</p>
              </div>
            ) : filterQuests('seasonal').length > 0 ? (
              filterQuests('seasonal').map(quest => (
                <QuestCard key={quest.id} quest={quest} />
              ))
            ) : (
              <Card className="glass-card p-12 text-center">
                <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">
                  No seasonal quests available. Check back soon!
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Confetti Effect */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -20,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                y: window.innerHeight + 20,
                x: Math.random() * window.innerWidth,
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Quests;