import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Trophy, Zap, Star, Crown,
  Award, TrendingUp, Flame, Users, Music,
  Shield, MapPin
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface RaverEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  city?: string | null;
  xp: number;
  level: string;
  trust_score: number;
  afters_hosted: number;
  events_attended: number;
  lucky100_wins: number;
  badges: string[];
  vip_status: boolean;
  music_tags?: string[];
}

const LEVEL_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Newbie:        { text: 'text-slate-400',  bg: 'bg-slate-400/10',  border: 'border-slate-400/25' },
  Explorer:      { text: 'text-cyan-400',   bg: 'bg-cyan-400/10',   border: 'border-cyan-400/25' },
  'Rising Star': { text: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/25' },
  Regular:       { text: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/25' },
  Pro:           { text: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/25' },
  VIP:           { text: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/25' },
  Legend:        { text: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/25' },
};

const RANK_ACCENTS = [
  'from-amber-500/20 to-yellow-600/10 border-amber-500/30',
  'from-slate-400/15 to-slate-500/8 border-slate-400/25',
  'from-amber-700/20 to-orange-800/10 border-amber-700/30',
];

const RANK_GLOW = ['shadow-amber-500/15', 'shadow-slate-400/10', 'shadow-amber-700/15'];

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Crown className="w-6 h-6 text-amber-400" />;
  if (rank === 2) return <Trophy className="w-5 h-5 text-slate-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-700" />;
  return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
};

const Raverboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [xpLeaders, setXpLeaders] = useState<RaverEntry[]>([]);
  const [hostLeaders, setHostLeaders] = useState<RaverEntry[]>([]);
  const [trustLeaders, setTrustLeaders] = useState<RaverEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadBoards(); }, []);

  const loadBoards = async () => {
    const fields = 'user_id, display_name, avatar_url, city, xp, level, trust_score, afters_hosted, events_attended, lucky100_wins, badges, vip_status, music_tags';

    const [xp, host, trust] = await Promise.all([
      supabase.from('profiles').select(fields).order('xp', { ascending: false }).limit(50),
      supabase.from('profiles').select(fields).order('afters_hosted', { ascending: false }).limit(50),
      supabase.from('profiles').select(fields).order('trust_score', { ascending: false }).limit(50),
    ]);

    if (xp.data) setXpLeaders(xp.data as RaverEntry[]);
    if (host.data) setHostLeaders((host.data as RaverEntry[]).filter(u => u.afters_hosted > 0));
    if (trust.data) setTrustLeaders(trust.data as RaverEntry[]);
    setLoading(false);
  };

  const RaverCard = ({ raver, rank, metric }: {
    raver: RaverEntry;
    rank: number;
    metric: 'xp' | 'host' | 'trust';
  }) => {
    const isTop3 = rank <= 3;
    const level = raver.level || 'Newbie';
    const lc = LEVEL_COLORS[level] || LEVEL_COLORS.Newbie;
    const isMe = user?.id === raver.user_id;
    const initials = (raver.display_name || '?')[0].toUpperCase();
    const musicTags = raver.music_tags?.slice(0, 2) || [];

    const metricDisplay = () => {
      if (metric === 'xp') return { value: raver.xp.toLocaleString(), label: 'XP', icon: Zap, color: 'text-amber-400' };
      if (metric === 'host') return { value: raver.afters_hosted, label: 'Hosted', icon: Star, color: 'text-purple-400' };
      return { value: Math.round(raver.trust_score || 50), label: 'Trust', icon: Shield, color: 'text-emerald-400' };
    };

    const m = metricDisplay();
    const MetricIcon = m.icon;

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: rank * 0.04 }}
        onClick={() => navigate(`/raver/${raver.user_id}`)}
        className={`
          relative cursor-pointer rounded-2xl border p-4 transition-all active:scale-[0.98]
          ${isTop3
            ? `bg-gradient-to-r ${RANK_ACCENTS[rank - 1]} shadow-lg ${RANK_GLOW[rank - 1]}`
            : isMe
              ? 'bg-primary/[0.08] border-primary/25'
              : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.15]'
          }
        `}
      >
        {/* "You" indicator */}
        {isMe && (
          <div className="absolute top-2 right-3">
            <span className="text-[10px] font-bold text-primary bg-primary/15 px-1.5 py-0.5 rounded-full">YOU</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Rank */}
          <div className="w-8 flex items-center justify-center shrink-0">
            <RankBadge rank={rank} />
          </div>

          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className={`${isTop3 ? 'w-13 h-13 border-2 border-primary/40' : 'w-11 h-11'}`}>
              <AvatarImage src={raver.avatar_url || undefined} />
              <AvatarFallback className="text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {raver.vip_status && (
              <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-0.5">
                <Crown className="w-2.5 h-2.5 text-black" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate text-sm">
                {raver.display_name || 'Anonymous'}
              </span>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${lc.text} ${lc.bg} ${lc.border}`}>
                {level}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              {raver.city && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" />
                  {raver.city}
                </span>
              )}
              {musicTags.map(tag => (
                <span key={tag} className="flex items-center gap-0.5">
                  <Music className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Mini stats row */}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <Users className="w-3 h-3" /> {raver.events_attended}
              </span>
              {(raver.badges as any)?.length > 0 && (
                <span className="flex items-center gap-0.5">
                  <Award className="w-3 h-3" /> {(raver.badges as any).length}
                </span>
              )}
              {raver.lucky100_wins > 0 && (
                <span className="flex items-center gap-0.5">
                  🎟 {raver.lucky100_wins}
                </span>
              )}
            </div>
          </div>

          {/* Primary metric */}
          <div className="text-right shrink-0">
            <div className={`font-bold text-base flex items-center gap-1 justify-end ${m.color}`}>
              <MetricIcon className="w-4 h-4" />
              {m.value}
            </div>
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  const TopThreePodium = ({ leaders, metric }: { leaders: RaverEntry[]; metric: 'xp' | 'host' | 'trust' }) => {
    if (leaders.length < 1) return null;
    const [first, second, third] = leaders;

    const PodiumCard = ({ raver, rank, size }: { raver?: RaverEntry; rank: number; size: 'lg' | 'md' }) => {
      if (!raver) return null;
      const lc = LEVEL_COLORS[raver.level || 'Newbie'] || LEVEL_COLORS.Newbie;
      return (
        <div
          onClick={() => navigate(`/raver/${raver.user_id}`)}
          className={`cursor-pointer flex flex-col items-center gap-2 ${size === 'lg' ? 'flex-1' : 'flex-[0.85]'}`}
        >
          <div className="relative">
            <Avatar className={`${size === 'lg' ? 'w-16 h-16' : 'w-12 h-12'} border-2 border-primary/30`}>
              <AvatarImage src={raver.avatar_url || undefined} />
              <AvatarFallback className="font-bold">
                {(raver.display_name || '?')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2">
              <RankBadge rank={rank} />
            </div>
            {raver.vip_status && (
              <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-0.5">
                <Crown className="w-2.5 h-2.5 text-black" />
              </div>
            )}
          </div>
          <span className="text-xs font-semibold truncate max-w-[80px] text-center">
            {raver.display_name || 'Anonymous'}
          </span>
          <Badge variant="outline" className={`text-[9px] px-1 py-0 ${lc.text} ${lc.bg} ${lc.border}`}>
            {raver.level}
          </Badge>
        </div>
      );
    };

    return (
      <div className="flex items-end justify-center gap-4 py-6 px-4">
        <PodiumCard raver={second} rank={2} size="md" />
        <PodiumCard raver={first} rank={1} size="lg" />
        <PodiumCard raver={third} rank={3} size="md" />
      </div>
    );
  };

  const BoardList = ({ leaders, metric }: { leaders: RaverEntry[]; metric: 'xp' | 'host' | 'trust' }) => (
    <div className="space-y-3">
      {loading ? (
        <p className="text-center py-12 text-muted-foreground">Učitavanje scene...</p>
      ) : leaders.length > 0 ? (
        <>
          <TopThreePodium leaders={leaders} metric={metric} />
          <div className="space-y-2 px-1">
            {leaders.map((raver, i) => (
              <RaverCard key={raver.user_id} raver={raver} rank={i + 1} metric={metric} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <Trophy className="w-14 h-14 mx-auto mb-4 text-muted-foreground/20" />
          <p className="text-muted-foreground">Scena je prazna. Budi prvi.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-safe-bottom">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-purple-600/10 to-amber-500/10" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

        <div className="relative max-w-4xl mx-auto px-4 pt-6 pb-8">
          <button
            onClick={() => navigate('/gamification')}
            className="flex items-center gap-1.5 text-muted-foreground text-sm mb-5"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                  AfterBefore
                </span>
                <Flame className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold tracking-wider uppercase text-primary">
                  Raverboard
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Raverboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Ko je deo scene. Ko gradi kulturu.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 items-end">
              {[
                { color: 'bg-amber-400', label: 'XP' },
                { color: 'bg-purple-400', label: 'Host' },
                { color: 'bg-emerald-400', label: 'Trust' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-2 pb-24">
        {/* Season Board CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate('/season')}
          className="mb-4 cursor-pointer rounded-2xl border border-amber-400/25 bg-gradient-to-r from-amber-500/10 to-orange-500/8 p-4 flex items-center justify-between active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🏆</span>
            <div>
              <h3 className="text-sm font-bold">Season Board — Winter 2025</h3>
              <p className="text-[11px] text-muted-foreground">Top 3 osvajaju putovanje · Glasaj za destinaciju</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-400" />
        </motion.div>

        <Tabs defaultValue="xp" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger value="xp" className="data-[state=active]:bg-background/80 text-xs gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              XP
            </TabsTrigger>
            <TabsTrigger value="hosts" className="data-[state=active]:bg-background/80 text-xs gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Hosts
            </TabsTrigger>
            <TabsTrigger value="trust" className="data-[state=active]:bg-background/80 text-xs gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Trust
            </TabsTrigger>
          </TabsList>

          <TabsContent value="xp"><BoardList leaders={xpLeaders} metric="xp" /></TabsContent>
          <TabsContent value="hosts"><BoardList leaders={hostLeaders} metric="host" /></TabsContent>
          <TabsContent value="trust"><BoardList leaders={trustLeaders} metric="trust" /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Raverboard;
