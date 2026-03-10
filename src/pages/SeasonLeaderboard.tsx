import { useState, useEffect } from 'react';
import {
  ArrowLeft, Crown, Trophy, Zap, Star,
  MapPin, Calendar, Globe, Check, Plane,
  Award, TrendingUp, Clock, Target, RefreshCw
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// ─── Constants ────────────────────────────────────────────────────────────────
const SEASON_NAME = 'Winter 2025';
const SEASON_END = new Date('2026-03-21T00:00:00');

const DESTINATIONS = [
  {
    id: 'south_america' as const,
    name: 'Južna Amerika',
    city: 'Buenos Aires',
    emoji: '🇦🇷',
    description: 'Underground techno u srcu Latinske Amerike. Boiler Room vibracija.',
    barColor: 'from-emerald-500 to-green-400',
    accentColor: 'text-emerald-400',
    accentBg: 'bg-emerald-400/12',
    accentBorder: 'border-emerald-400/25',
    highlights: ['Crobar', 'Club Niceto', 'La Tertulia'],
  },
  {
    id: 'tokyo' as const,
    name: 'Tokio',
    city: 'Tokyo',
    emoji: '🇯🇵',
    description: 'Womb, ageHa, Contact. Nočni život koji ne spava nikad.',
    barColor: 'from-pink-500 to-fuchsia-400',
    accentColor: 'text-pink-400',
    accentBg: 'bg-pink-400/12',
    accentBorder: 'border-pink-400/25',
    highlights: ['Womb', 'ageHa', 'Contact Tokyo'],
  },
  {
    id: 'georgia' as const,
    name: 'Gruzija',
    city: 'Tbilisi',
    emoji: '🇬🇪',
    description: 'Bassiani, Mtkvarze. Tbilisi je nova Meka underground scene.',
    barColor: 'from-amber-500 to-orange-400',
    accentColor: 'text-amber-400',
    accentBg: 'bg-amber-400/12',
    accentBorder: 'border-amber-400/25',
    highlights: ['Bassiani', 'Mtkvarze', 'Khidi'],
  },
];

const PERIOD_CONFIG = {
  weekly: {
    label: 'Weekly',
    sublabel: 'Ove nedelje',
    icon: RefreshCw,
    color: 'text-cyan-400',
    accentBg: 'bg-cyan-400/12',
    accentBorder: 'border-cyan-400/25',
    resetNote: 'Reset: svake subote u ponoć',
    metricLabel: 'Week XP',
  },
  monthly: {
    label: 'Monthly',
    sublabel: 'Ovog meseca',
    icon: Calendar,
    color: 'text-purple-400',
    accentBg: 'bg-purple-400/12',
    accentBorder: 'border-purple-400/25',
    resetNote: 'Reset: prvog u mesecu',
    metricLabel: 'Month XP',
  },
  seasonal: {
    label: 'Seasonal',
    sublabel: SEASON_NAME,
    icon: Trophy,
    color: 'text-amber-400',
    accentBg: 'bg-amber-400/12',
    accentBorder: 'border-amber-400/25',
    resetNote: 'Završava: 21. mart 2026.',
    metricLabel: 'Season XP',
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = 'weekly' | 'monthly' | 'seasonal';

interface RankEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  city: string | null;
  level: string;
  season_xp: number;
  season_events: number;
  season_quests: number;
  vip_status: boolean;
}

interface VoteCount {
  south_america: number;
  tokyo: number;
  georgia: number;
  total: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const LEVEL_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Newbie:        { text: 'text-slate-400',  bg: 'bg-slate-400/10',  border: 'border-slate-400/20' },
  Explorer:      { text: 'text-cyan-400',   bg: 'bg-cyan-400/10',   border: 'border-cyan-400/20' },
  'Rising Star': { text: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20' },
  Regular:       { text: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  Pro:           { text: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/20' },
  VIP:           { text: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/20' },
  Legend:        { text: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
};

const RANK_STYLES = [
  'bg-gradient-to-r from-amber-500/20 to-yellow-600/10 border-amber-500/35',
  'bg-gradient-to-r from-slate-400/15 to-slate-500/8 border-slate-400/25',
  'bg-gradient-to-r from-amber-700/20 to-orange-800/10 border-amber-700/30',
];

const getCountdown = () => {
  const diff = SEASON_END.getTime() - Date.now();
  if (diff <= 0) return 'Završena';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return `${d}d ${h}h`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
  if (rank === 2) return <Award className="w-5 h-5 text-slate-300" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
  return <span className="text-xs font-bold text-muted-foreground w-5 text-center">#{rank}</span>;
};

// ─── Board List ───────────────────────────────────────────────────────────────
const BoardList = ({
  leaders,
  period,
  loading,
  myUserId,
  winnerDest,
}: {
  leaders: RankEntry[];
  period: Period;
  loading: boolean;
  myUserId?: string;
  winnerDest?: typeof DESTINATIONS[0];
}) => {
  const navigate = useNavigate();
  const cfg = PERIOD_CONFIG[period];
  const PeriodIcon = cfg.icon;

  return (
    <div className="space-y-2">
      {/* Period info bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <PeriodIcon className={`w-4 h-4 ${cfg.color}`} />
          <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.sublabel}</span>
        </div>
        <span className="text-[11px] text-muted-foreground">{cfg.resetNote}</span>
      </div>

      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[72px] rounded-2xl bg-muted/30 animate-pulse" />
        ))
      ) : leaders.length > 0 ? (
        leaders.map((entry, i) => {
          const rank = i + 1;
          const isTop3 = rank <= 3;
          const isMe = myUserId === entry.user_id;
          const lc = LEVEL_COLORS[entry.level] || LEVEL_COLORS.Newbie;

          return (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => navigate(`/raver/${entry.user_id}`)}
              className={`
                relative cursor-pointer rounded-2xl border p-3.5 transition-all active:scale-[0.98] shadow-sm
                ${isMe ? 'border-primary/30 bg-primary/8' : isTop3 ? RANK_STYLES[rank - 1] : 'bg-white/4 border-white/8 hover:border-white/15'}
              `}
            >
              {isMe && (
                <div className="absolute top-2 right-2">
                  <span className="text-[10px] font-bold bg-primary/15 text-primary px-2 py-0.5 rounded-full">YOU</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-6 flex-shrink-0 flex items-center justify-center">
                  <RankIcon rank={rank} />
                </div>

                <Avatar className={`w-10 h-10 border ${lc.border}`}>
                  <AvatarImage src={entry.avatar_url || undefined} />
                  <AvatarFallback className={`${lc.bg} ${lc.text} text-xs`}>
                    {(entry.display_name || '?')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate">
                      {entry.display_name || 'Anonymous'}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${lc.bg} ${lc.text} ${lc.border} border`}>
                      {entry.level}
                    </span>
                    {/* Seasonal winner gets travel badge */}
                    {period === 'seasonal' && isTop3 && winnerDest && (
                      <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${winnerDest.accentColor} ${winnerDest.accentBg} px-1.5 py-0.5 rounded-full`}>
                        <Plane className="w-3 h-3" />
                        {winnerDest.city}
                        <span>{winnerDest.emoji}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-0.5">
                    {entry.city && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        {entry.city}
                      </span>
                    )}
                    {entry.season_quests > 0 && (
                      <span className="text-[11px] text-muted-foreground">
                        {entry.season_quests} missions
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-sm font-bold text-primary">
                    <Zap className="w-3.5 h-3.5" />
                    {entry.season_xp.toLocaleString()}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{cfg.metricLabel}</p>
                </div>
              </div>
            </motion.div>
          );
        })
      ) : (
        <div className="text-center py-16 space-y-3">
          <Target className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">Nema aktivnosti još.</p>
          <p className="text-xs text-muted-foreground/60">Završi misije da se pojaviš na listi.</p>
        </div>
      )}
    </div>
  );
};

// ─── Destination Voting Block ─────────────────────────────────────────────────
const DestinationVoting = ({
  voteCounts,
  myVote,
  onVote,
  voting,
  leaders,
}: {
  voteCounts: VoteCount;
  myVote: string | null;
  onVote: (id: string) => void;
  voting: boolean;
  leaders: RankEntry[];
}) => {
  const navigate = useNavigate();
  const leadingDest = DESTINATIONS.reduce((a, b) =>
    ((voteCounts as any)[b.id] > (voteCounts as any)[a.id] ? b : a)
  );
  const getVotePct = (id: string) =>
    voteCounts.total > 0 ? Math.round(((voteCounts as any)[id] / voteCounts.total) * 100) : 0;

  return (
    <div className="space-y-5 mb-6">
      {/* Winners podium preview */}
      {leaders.length >= 3 && (
        <div className="bg-gradient-to-b from-white/5 to-transparent rounded-2xl border border-white/8 p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold">Trenutni pobednici putuju u:</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {leadingDest.emoji} {leadingDest.name}
            </span>
          </div>

          <div className="flex items-end justify-center gap-4">
            {[leaders[1], leaders[0], leaders[2]].map((entry, pi) => {
              if (!entry) return null;
              const realRank = pi === 0 ? 2 : pi === 1 ? 1 : 3;
              const lc = LEVEL_COLORS[entry.level] || LEVEL_COLORS.Newbie;
              const isCenter = realRank === 1;
              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: pi * 0.15 }}
                  onClick={() => navigate(`/raver/${entry.user_id}`)}
                  className={`cursor-pointer flex flex-col items-center gap-2 ${isCenter ? 'flex-1' : 'flex-[0.8]'}`}
                >
                  <div className="relative">
                    <Avatar className={`${isCenter ? 'w-14 h-14' : 'w-10 h-10'} border-2 ${lc.border}`}>
                      <AvatarImage src={entry.avatar_url || undefined} />
                      <AvatarFallback className={`${lc.bg} ${lc.text}`}>
                        {(entry.display_name || '?')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${realRank === 1 ? 'bg-amber-500' : realRank === 2 ? 'bg-slate-400' : 'bg-amber-700'}`}>
                      <span className="text-[9px] font-bold text-background">{realRank}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-center truncate max-w-[80px]">
                    {entry.display_name || 'Anon'}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Voting cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold">Glasaj za destinaciju</h2>
          </div>
          {myVote && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <Check className="w-3.5 h-3.5" /> Glasao/la si
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Top 3 rejvera po Season XP osvajaju putovanje na destinaciju sa najviše glasova.
        </p>

        <div className="space-y-3">
          {DESTINATIONS.map((dest, i) => {
            const pct = getVotePct(dest.id);
            const isLeading = dest.id === leadingDest.id && voteCounts.total > 0;
            const isMyVote = myVote === dest.id;

            return (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => !myVote && !voting && onVote(dest.id)}
                className={`
                  relative rounded-2xl border p-4 overflow-hidden transition-all
                  ${myVote ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'}
                  ${isMyVote ? `${dest.accentBg} ${dest.accentBorder}` : 'bg-white/4 border-white/8 hover:border-white/15'}
                `}
              >
                {isLeading && (
                  <div className="absolute top-2 right-2">
                    <span className="text-[10px] font-bold bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                      VODI
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{dest.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm">{dest.name}</h3>
                      {isMyVote && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{dest.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {dest.highlights.map(h => (
                    <span key={h} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/5">{h}</span>
                  ))}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">{(voteCounts as any)[dest.id]} glasova</span>
                    <span className="font-semibold">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${dest.barColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                    />
                  </div>
                </div>

                {!myVote && (
                  <p className={`mt-3 text-center text-xs font-semibold ${dest.accentColor} opacity-80`}>Glasaj →</p>
                )}
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-2">
          {voteCounts.total} ukupnih glasova · Glasanje traje do kraja sezone
        </p>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const SeasonLeaderboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [boards, setBoards] = useState<Record<Period, RankEntry[]>>({ weekly: [], monthly: [], seasonal: [] });
  const [loading, setLoading] = useState<Record<Period, boolean>>({ weekly: true, monthly: true, seasonal: true });
  const [voteCounts, setVoteCounts] = useState<VoteCount>({ south_america: 0, tokyo: 0, georgia: 0, total: 0 });
  const [myVote, setMyVote] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [myRanks, setMyRanks] = useState<Record<Period, number | null>>({ weekly: null, monthly: null, seasonal: null });
  const [countdown] = useState(getCountdown());
  const [activeTab, setActiveTab] = useState<Period>('weekly');

  useEffect(() => {
    loadBoard('weekly');
    loadBoard('monthly');
    loadBoard('seasonal');
    loadVotes();
  }, [user]);

  const loadBoard = async (period: Period) => {
    setLoading(prev => ({ ...prev, [period]: true }));

    const { data: seasonData } = await supabase
      .from('season_leaderboard')
      .select('user_id, season_xp, season_events, season_quests')
      .eq('season_name', SEASON_NAME)
      .eq('period', period)
      .order('season_xp', { ascending: false })
      .limit(50);

    let entries: RankEntry[] = [];

    if (seasonData && seasonData.length > 0) {
      const userIds = seasonData.map(s => s.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, city, level, vip_status')
        .in('user_id', userIds);
      const pm = Object.fromEntries((profiles || []).map(p => [p.user_id, p]));
      entries = seasonData.map(s => ({
        ...s,
        display_name: pm[s.user_id]?.display_name || null,
        avatar_url: pm[s.user_id]?.avatar_url || null,
        city: pm[s.user_id]?.city || null,
        level: pm[s.user_id]?.level || 'Newbie',
        vip_status: pm[s.user_id]?.vip_status || false,
      }));
    } else {
      // Fallback for seasonal — use profiles.xp
      if (period === 'seasonal') {
        const { data } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url, city, level, xp, events_attended, vip_status')
          .order('xp', { ascending: false })
          .limit(50);
        if (data) {
          entries = data.map(p => ({
            user_id: p.user_id,
            display_name: p.display_name,
            avatar_url: p.avatar_url,
            city: p.city,
            level: p.level || 'Newbie',
            season_xp: p.xp || 0,
            season_events: p.events_attended || 0,
            season_quests: 0,
            vip_status: p.vip_status || false,
          }));
        }
      }
      // For weekly/monthly fallback — use quests completed in time window
      if (period === 'weekly' || period === 'monthly') {
        const since = period === 'weekly'
          ? new Date(Date.now() - 7 * 86400000).toISOString()
          : new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const { data: qdata } = await supabase
          .from('quests')
          .select('user_id, xp_reward')
          .eq('status', 'completed')
          .gte('completed_at', since);
        if (qdata) {
          const xpMap: Record<string, number> = {};
          const countMap: Record<string, number> = {};
          qdata.forEach(q => {
            xpMap[q.user_id] = (xpMap[q.user_id] || 0) + q.xp_reward;
            countMap[q.user_id] = (countMap[q.user_id] || 0) + 1;
          });
          const userIds = Object.keys(xpMap);
          if (userIds.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('user_id, display_name, avatar_url, city, level, vip_status')
              .in('user_id', userIds);
            const pm = Object.fromEntries((profiles || []).map(p => [p.user_id, p]));
            entries = Object.entries(xpMap)
              .sort(([, a], [, b]) => b - a)
              .map(([uid, xp]) => ({
                user_id: uid,
                display_name: pm[uid]?.display_name || null,
                avatar_url: pm[uid]?.avatar_url || null,
                city: pm[uid]?.city || null,
                level: pm[uid]?.level || 'Newbie',
                season_xp: xp,
                season_events: 0,
                season_quests: countMap[uid] || 0,
                vip_status: pm[uid]?.vip_status || false,
              }));
          }
        }
      }
    }

    setBoards(prev => ({ ...prev, [period]: entries }));
    if (user) {
      const idx = entries.findIndex(e => e.user_id === user.id);
      setMyRanks(prev => ({ ...prev, [period]: idx >= 0 ? idx + 1 : null }));
    }
    setLoading(prev => ({ ...prev, [period]: false }));
  };

  const loadVotes = async () => {
    const { data } = await supabase
      .from('season_destination_votes')
      .select('destination, user_id')
      .eq('season_name', SEASON_NAME);
    if (data) {
      const counts: VoteCount = { south_america: 0, tokyo: 0, georgia: 0, total: data.length };
      data.forEach(v => { if (v.destination in counts) (counts as any)[v.destination]++; });
      setVoteCounts(counts);
      if (user) {
        const mine = data.find(v => v.user_id === user.id);
        if (mine) setMyVote(mine.destination);
      }
    }
  };

  const castVote = async (destId: string) => {
    if (!user || myVote || voting) return;
    setVoting(true);
    const { error } = await supabase.from('season_destination_votes').insert({
      user_id: user.id, season_name: SEASON_NAME, destination: destId,
    });
    if (error) {
      toast({ variant: 'destructive', title: 'Greška', description: error.message });
    } else {
      setMyVote(destId);
      setVoteCounts(prev => ({ ...prev, [destId]: (prev as any)[destId] + 1, total: prev.total + 1 }));
      toast({ title: '🗳️ Glas zabeležen!', description: 'Top 3 sezone odlaze na izabranu destinaciju.' });
    }
    setVoting(false);
  };

  const leadingDest = DESTINATIONS.reduce((a, b) => ((voteCounts as any)[b.id] > (voteCounts as any)[a.id] ? b : a));

  return (
    <div className="min-h-screen bg-background text-foreground pb-28">

      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/15 via-primary/5 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

        <div className="relative px-4 pt-12 pb-8">
          <button onClick={() => navigate('/gamification')} className="flex items-center gap-1.5 text-muted-foreground text-sm mb-5">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold tracking-widest uppercase text-primary/80">AfterBefore</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground font-medium">Leaderboard</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Scene Ranks</h1>
              <p className="text-sm text-muted-foreground mt-1">Weekly · Monthly · Seasonal</p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1.5 text-primary font-bold text-lg">
                <Clock className="w-4 h-4" />
                {countdown}
              </div>
              <p className="text-[11px] text-muted-foreground">do kraja sezone</p>
            </div>
          </div>

          {/* My rank pills */}
          {(myRanks.weekly || myRanks.monthly || myRanks.seasonal) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {(['weekly', 'monthly', 'seasonal'] as Period[]).map(p => {
                const r = myRanks[p];
                if (!r) return null;
                const cfg = PERIOD_CONFIG[p];
                return (
                  <div key={p} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${cfg.accentBorder} ${cfg.accentBg}`}>
                    <Trophy className={`w-3.5 h-3.5 ${cfg.color}`} />
                    <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label} #{r}</span>
                    {r <= 3 && <span className="text-xs">🏆</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="px-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Period)} className="space-y-5">
          <TabsList className="w-full grid grid-cols-3 bg-muted/50">
            <TabsTrigger value="weekly" className="text-xs gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs gap-1">
              <Calendar className="w-3.5 h-3.5" /> Monthly
            </TabsTrigger>
            <TabsTrigger value="seasonal" className="text-xs gap-1">
              <Trophy className="w-3.5 h-3.5" /> Seasonal
            </TabsTrigger>
          </TabsList>

          {(['weekly', 'monthly', 'seasonal'] as Period[]).map(period => (
            <TabsContent key={period} value={period}>
              {/* Destination voting only on seasonal tab */}
              {period === 'seasonal' && (
                <DestinationVoting
                  voteCounts={voteCounts}
                  myVote={myVote}
                  onVote={castVote}
                  voting={voting}
                  leaders={boards.seasonal}
                />
              )}
              <BoardList
                leaders={boards[period]}
                period={period}
                loading={loading[period]}
                myUserId={user?.id}
                winnerDest={leadingDest}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default SeasonLeaderboard;
