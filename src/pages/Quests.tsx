import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Check, Zap, Calendar, TrendingUp,
  Award, MapPin, Users, Mic2, Shield, Star, Clock, Gift
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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

const getMissionCategory = (quest: Quest): 'scene' | 'social' | 'culture' | 'event' => {
  const text = `${quest.title} ${quest.description}`.toLowerCase();
  if (text.includes('attend') || text.includes('check-in') || text.includes('club') || text.includes('event')) return 'scene';
  if (text.includes('match') || text.includes('invite') || text.includes('swipe') || text.includes('circle') || text.includes('social') || text.includes('butterfly')) return 'social';
  if (text.includes('review') || text.includes('legend') || text.includes('trusted') || text.includes('trust') || text.includes('culture') || text.includes('explore')) return 'culture';
  return 'scene';
};

const CATEGORY_CONFIG = {
  scene: {
    label: 'SCENE',
    icon: MapPin,
    color: 'text-amber-400',
    bg: 'bg-amber-400/15 border-amber-400/30',
    glow: 'shadow-amber-500/20',
  },
  social: {
    label: 'SOCIAL',
    icon: Users,
    color: 'text-purple-400',
    bg: 'bg-purple-400/15 border-purple-400/30',
    glow: 'shadow-purple-500/20',
  },
  culture: {
    label: 'CULTURE',
    icon: Mic2,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/15 border-cyan-400/30',
    glow: 'shadow-cyan-500/20',
  },
  event: {
    label: 'EVENT',
    icon: Star,
    color: 'text-orange-400',
    bg: 'bg-orange-400/15 border-orange-400/30',
    glow: 'shadow-orange-500/20',
  },
};

const getResetCountdown = () => {
  const now = new Date();
  const nextSat = new Date();
  nextSat.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7 || 7));
  nextSat.setHours(0, 0, 0, 0);
  const diff = nextSat.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 48) return `${Math.floor(h / 24)}d reset`;
  return `${h}h ${m}m reset`;
};

const MissionPatch = ({ category, completed }: { category: keyof typeof CATEGORY_CONFIG; completed: boolean }) => {
  const cfg = CATEGORY_CONFIG[category];
  const Icon = cfg.icon;
  return (
    <div className={`relative w-12 h-12 rounded-xl border ${cfg.bg} flex items-center justify-center shadow-lg ${cfg.glow}`}>
      <Icon className={`w-5 h-5 ${cfg.color}`} />
      {completed && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
};

const QuestCard = ({
  quest,
  onComplete,
  index,
}: {
  quest: Quest;
  onComplete: (id: string, xp: number) => void;
  index: number;
}) => {
  const isCompleted = quest.status === 'completed';
  const category = getMissionCategory(quest);
  const cfg = CATEGORY_CONFIG[category];
  const isLucky = quest.xp_reward >= 150;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card className={`glass-card p-4 ${isCompleted ? 'opacity-50' : ''} border ${cfg.bg.split(' ')[1] || 'border-border'}`}>
        {isLucky && !isCompleted && (
          <div className="flex items-center gap-1.5 mb-3 text-amber-400">
            <Gift className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold tracking-widest uppercase">LUCKY 100</span>
          </div>
        )}

        <div className="flex items-start gap-3">
          <MissionPatch category={category} completed={isCompleted} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold tracking-widest uppercase ${cfg.color}`}>
                {cfg.label} MISSION
              </span>
            </div>

            <h3 className="font-semibold text-sm text-foreground leading-tight mb-1">
              {quest.title}
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {quest.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/20 text-primary text-[10px] flex items-center gap-1">
              <Zap className="w-3 h-3" />
              +{quest.xp_reward} XP
            </Badge>

            {quest.expires_at && !isCompleted && (
              <span className="text-[10px] text-amber-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(quest.expires_at).toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>

          {isCompleted ? (
            <span className="text-[10px] text-emerald-400 font-bold tracking-wider">✓ COMPLETE</span>
          ) : (
            <Button
              size="sm"
              onClick={() => onComplete(quest.id, quest.xp_reward)}
              className="gradient-primary text-xs h-7 px-3"
            >
              Claim
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

const EmptyMissions = ({ type }: { type: string }) => {
  const messages: Record<string, string> = {
    daily: 'Nema dnevnih misija. Proveri sutra.',
    weekly: 'Vikend misije uskoro. Scena čeka.',
    seasonal: 'Sezonske misije dolaze. Ostani aktivan.',
    legacy: 'Završi misije da osvoji Legacy patch.',
  };
  return (
    <Card className="glass-card p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
        <Shield className="w-8 h-8 text-muted-foreground/30" />
      </div>
      <p className="text-muted-foreground text-sm">{messages[type] || 'Nema misija.'}</p>
    </Card>
  );
};

const Quests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [confetti, setConfetti] = useState(false);
  const [countdown] = useState(getResetCountdown());

  useEffect(() => {
    if (user) loadQuests();
  }, [user]);

  const loadQuests = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setQuests(data as Quest[]);
    setLoading(false);
  };

  const completeQuest = async (questId: string, xpReward: number) => {
    if (!user) return;

    const { error: questError } = await supabase
      .from('quests')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', questId);

    if (questError) {
      toast({ variant: 'destructive', title: 'Greška', description: questError.message });
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('xp')
      .eq('user_id', user.id)
      .single();

    const newXP = (profile?.xp || 0) + xpReward;
    await supabase.from('profiles').update({ xp: newXP }).eq('user_id', user.id);

    setConfetti(true);
    setTimeout(() => setConfetti(false), 3000);

    toast({ title: `Misija završena! 🎯`, description: `+${xpReward} XP zaradeno.` });
    loadQuests();
  };

  const filterQuests = (type: string) => quests.filter(q => q.quest_type === type);
  const completedQuests = quests.filter(q => q.status === 'completed');
  const completedCount = completedQuests.length;
  const totalCount = quests.length;

  return (
    <div className="min-h-screen bg-background pb-safe-bottom">
      {/* AfterMissions Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-600/20 to-amber-600/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <div className="relative p-6 pb-8 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/gamification')}
            className="mb-5 -ml-2 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-foreground tracking-tight">
                  <span className="text-primary">After</span>
                  <span className="text-foreground">Before</span>
                </h1>
                <Badge className="bg-primary/20 text-primary text-[10px]">
                  Missions
                </Badge>
              </div>

              <p className="text-lg font-bold text-foreground/90">
                AfterMissions
              </p>

              <p className="text-xs text-muted-foreground mt-1">
                Scena te čeka. Šta čekaš?
              </p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-primary">
                {completedCount}/{totalCount}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Patches</p>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-400">
                <Clock className="w-3 h-3" />
                {countdown}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Legend */}
      <div className="max-w-4xl mx-auto px-4 -mt-2 mb-4">
        <div className="flex items-center gap-4">
          {Object.entries(CATEGORY_CONFIG).slice(0, 3).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={key} className={`flex items-center gap-1.5 text-[10px] font-bold tracking-wider ${cfg.color}`}>
                <Icon className="w-3 h-3" />
                {cfg.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 pb-24">
        <Tabs defaultValue="daily" className="space-y-5">
          <TabsList className="grid w-full grid-cols-4 glass-card">
            <TabsTrigger value="daily" className="data-[state=active]:bg-primary/20 text-xs">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-primary/20 text-xs">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="seasonal" className="data-[state=active]:bg-primary/20 text-xs">
              <Award className="w-3.5 h-3.5 mr-1.5" />
              Season
            </TabsTrigger>
            <TabsTrigger value="legacy" className="data-[state=active]:bg-primary/20 text-xs">
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              Legacy
            </TabsTrigger>
          </TabsList>

          {(['daily', 'weekly', 'seasonal'] as const).map(type => (
            <TabsContent key={type} value={type} className="space-y-3">
              {loading ? (
                <p className="text-center text-muted-foreground py-12">Učitavanje misija...</p>
              ) : filterQuests(type).length > 0 ? (
                <AnimatePresence>
                  {filterQuests(type).map((quest, i) => (
                    <QuestCard key={quest.id} quest={quest} onComplete={completeQuest} index={i} />
                  ))}
                </AnimatePresence>
              ) : (
                <EmptyMissions type={type} />
              )}
            </TabsContent>
          ))}

          {/* Legacy Tab */}
          <TabsContent value="legacy" className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground py-12">Učitavanje...</p>
            ) : completedQuests.length > 0 ? (
              <>
                <Card className="glass-card p-4">
                  <p className="text-xs text-muted-foreground text-center">
                    {completedQuests.length} Legacy {completedQuests.length === 1 ? 'patch' : 'patches'} — zauvek na tvom profilu
                  </p>
                </Card>
                <div className="grid grid-cols-3 gap-3">
                  <AnimatePresence>
                    {completedQuests.map((quest, i) => {
                      const category = getMissionCategory(quest);
                      const cfg = CATEGORY_CONFIG[category];
                      const Icon = cfg.icon;
                      return (
                        <motion.div
                          key={quest.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.06 }}
                          className="text-center"
                        >
                          <div className={`w-16 h-16 mx-auto rounded-2xl border ${cfg.bg} flex items-center justify-center shadow-lg ${cfg.glow} mb-2`}>
                            <Icon className={`w-7 h-7 ${cfg.color}`} />
                            <div className="absolute w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                          </div>
                          <p className="text-[10px] font-semibold text-foreground truncate px-1">{quest.title}</p>
                          <span className={`text-[8px] font-bold tracking-widest ${cfg.color}`}>{cfg.label}</span>
                          <div className="mt-0.5">
                            <span className="text-[9px] text-primary font-semibold">
                              +{quest.xp_reward} XP
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <EmptyMissions type="legacy" />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Confetti */}
      <AnimatePresence>
        {confetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(40)].map((_, i) => (
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
      </AnimatePresence>
    </div>
  );
};

export default Quests;
