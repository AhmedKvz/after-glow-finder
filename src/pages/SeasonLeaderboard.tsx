import { useState, useEffect } from 'react';
import {
  ArrowLeft, Crown, Trophy, Zap, Star,
  MapPin, Users, Calendar, Globe, Check,
  Plane, ChevronRight, Award, TrendingUp, Clock
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
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
    gradient: 'from-green-900/70 via-emerald-950/50 to-background',
    coverGradient: 'from-green-800 via-emerald-900 to-slate-950',
    accentColor: 'text-emerald-400',
    accentBg: 'bg-emerald-400/12',
    accentBorder: 'border-emerald-400/25',
    glowColor: 'shadow-emerald-500/20',
    highlights: ['Crobar', 'Club Niceto', 'La Tertulia'],
  },
  {
    id: 'tokyo' as const,
    name: 'Tokio',
    city: 'Tokyo',
    emoji: '🇯🇵',
    description: 'Womb, ageHa, Contact. Nočni život koji ne spava nikad.',
    gradient: 'from-pink-900/70 via-fuchsia-950/50 to-background',
    coverGradient: 'from-pink-900 via-fuchsia-950 to-slate-950',
    accentColor: 'text-pink-400',
    accentBg: 'bg-pink-400/12',
    accentBorder: 'border-pink-400/25',
    glowColor: 'shadow-pink-500/20',
    highlights: ['Womb', 'ageHa', 'Contact Tokyo'],
  },
  {
    id: 'georgia' as const,
    name: 'Gruzija',
    city: 'Tbilisi',
    emoji: '🇬🇪',
    description: 'Bassiani, Mtkvarze. Tbilisi je nova Meka underground scene.',
    gradient: 'from-amber-900/70 via-orange-950/50 to-background',
    coverGradient: 'from-amber-900 via-orange-950 to-slate-950',
    accentColor: 'text-amber-400',
    accentBg: 'bg-amber-400/12',
    accentBorder: 'border-amber-400/25',
    glowColor: 'shadow-amber-500/20',
    highlights: ['Bassiani', 'Mtkvarze', 'Khidi'],
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface SeasonEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  city: string | null;
  level: string;
  season_xp: number;
  season_events: number;
  season_quests: number;
  vip_status: boolean;
  music_tags: string[];
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

const getCountdown = () => {
  const now = new Date();
  const diff = SEASON_END.getTime() - now.getTime();
  if (diff <= 0) return 'Sezona završena';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return `${days}d ${hours}h`;
};

const getRankAccent = (rank: number) => {
  if (rank === 1) return 'bg-gradient-to-r from-amber-500/20 to-yellow-600/10 border-amber-500/35 shadow-amber-500/15';
  if (rank === 2) return 'bg-gradient-to-r from-slate-400/15 to-slate-500/8 border-slate-400/25 shadow-slate-400/10';
  if (rank === 3) return 'bg-gradient-to-r from-amber-700/20 to-orange-800/10 border-amber-700/30 shadow-amber-700/10';
  return 'bg-white/4 border-white/8';
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
  if (rank === 2) return <Award className="w-5 h-5 text-slate-300" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
  return <span className="text-xs font-bold text-muted-foreground w-5 text-center">#{rank}</span>;
};

const WinnerBadge = ({ rank, destination }: { rank: number; destination?: typeof DESTINATIONS[0] }) => {
  if (!destination || rank > 3) return null;
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${destination.accentBg} ${destination.accentColor}`}
    >
      <Plane className="w-3 h-3" />
      {destination.city}
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const SeasonLeaderboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [leaders, setLeaders] = useState<SeasonEntry[]>([]);
  const [voteCounts, setVoteCounts] = useState<VoteCount>({ south_america: 0, tokyo: 0, georgia: 0, total: 0 });
  const [myVote, setMyVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [countdown] = useState(getCountdown());
  const [myRank, setMyRank] = useState<number | null>(null);

  useEffect(() => {
    loadAll();
  }, [user]);

  const loadAll = async () => {
    await Promise.all([loadLeaders(), loadVotes()]);
    setLoading(false);
  };

  const loadLeaders = async () => {
    const { data: seasonData } = await supabase
      .from('season_leaderboard')
      .select('user_id, season_xp, season_events, season_quests')
      .eq('season_name', SEASON_NAME)
      .order('season_xp', { ascending: false })
      .limit(50);

    if (!seasonData || seasonData.length === 0) {
      // Fallback: use profiles directly
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, city, level, xp, events_attended, vip_status, music_tags')
        .order('xp', { ascending: false })
        .limit(50);

      if (profileData) {
        const mapped = profileData.map(p => ({
          user_id: p.user_id,
          display_name: p.display_name,
          avatar_url: p.avatar_url,
          city: p.city,
          level: p.level || 'Newbie',
          season_xp: p.xp || 0,
          season_events: p.events_attended || 0,
          season_quests: 0,
          vip_status: p.vip_status || false,
          music_tags: p.music_tags || [],
        }));
        setLeaders(mapped);
        if (user) {
          const idx = mapped.findIndex(e => e.user_id === user.id);
          if (idx >= 0) setMyRank(idx + 1);
        }
      }
      return;
    }

    const userIds = seasonData.map(s => s.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url, city, level, vip_status, music_tags')
      .in('user_id', userIds);

    const profileMap = Object.fromEntries((profiles || []).map(p => [p.user_id, p]));

    const merged = seasonData.map(s => ({
      ...s,
      display_name: profileMap[s.user_id]?.display_name || null,
      avatar_url: profileMap[s.user_id]?.avatar_url || null,
      city: profileMap[s.user_id]?.city || null,
      level: profileMap[s.user_id]?.level || 'Newbie',
      vip_status: profileMap[s.user_id]?.vip_status || false,
      music_tags: profileMap[s.user_id]?.music_tags || [],
    }));

    setLeaders(merged);
    if (user) {
      const idx = merged.findIndex(e => e.user_id === user.id);
      if (idx >= 0) setMyRank(idx + 1);
    }
  };

  const loadVotes = async () => {
    const { data } = await supabase
      .from('season_destination_votes')
      .select('destination, user_id')
      .eq('season_name', SEASON_NAME);

    if (data) {
      const counts: VoteCount = { south_america: 0, tokyo: 0, georgia: 0, total: data.length };
      data.forEach(v => {
        if (v.destination in counts) (counts as any)[v.destination]++;
      });
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
      user_id: user.id,
      season_name: SEASON_NAME,
      destination: destId,
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Greška pri glasanju', description: error.message });
    } else {
      setMyVote(destId);
      setVoteCounts(prev => ({
        ...prev,
        [destId]: (prev as any)[destId] + 1,
        total: prev.total + 1,
      }));
      toast({ title: '🗳️ Glas zabeležen!', description: 'Top 3 rejvera odlaze na izabranu destinaciju.' });
    }
    setVoting(false);
  };

  const leadingDest = DESTINATIONS.reduce((a, b) =>
    ((voteCounts as any)[b.id] > (voteCounts as any)[a.id] ? b : a)
  );

  const getVotePct = (destId: string) =>
    voteCounts.total > 0 ? Math.round(((voteCounts as any)[destId] / voteCounts.total) * 100) : 0;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground pb-28">

      {/* Hero Header */}
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
                <span className="text-xs text-muted-foreground font-medium">Season Board</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Season Leaderboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{SEASON_NAME} · Top 3 osvajaju putovanje</p>
            </div>

            {/* Countdown */}
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-primary font-bold text-lg">
                <Clock className="w-4 h-4" />
                {countdown}
              </div>
              <p className="text-[11px] text-muted-foreground">do kraja sezone</p>
            </div>
          </div>

          {/* My rank pill */}
          {myRank && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Tvoja pozicija: #{myRank}</span>
              {myRank <= 3 && (
                <span className="ml-auto text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                  🏆 Pobednik!
                </span>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <div className="px-4 space-y-6">

        {/* ── DESTINATION VOTING ──────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-2">
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

          <p className="text-xs text-muted-foreground mb-4">
            Top 3 rejvera po XP-u na kraju sezone odlaze na destinaciju sa najviše glasova.
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
                  onClick={() => !myVote && castVote(dest.id)}
                  className={`
                    relative rounded-2xl border p-4 transition-all overflow-hidden
                    ${myVote ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'}
                    ${isMyVote
                      ? `${dest.accentBg} ${dest.accentBorder} shadow-lg ${dest.glowColor}`
                      : isLeading
                        ? 'bg-white/5 border-white/15'
                        : 'bg-white/4 border-white/8 hover:border-white/15'
                    }
                  `}
                >
                  {/* Leading indicator */}
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

                  {/* Club highlights */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {dest.highlights.map(h => (
                      <span key={h} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/5">
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* Vote bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">
                        {(voteCounts as any)[dest.id]} glasova
                      </span>
                      <span className="font-semibold">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${dest.coverGradient}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                      />
                    </div>
                  </div>

                  {/* CTA if not voted */}
                  {!myVote && (
                    <div className={`mt-3 text-center text-xs font-semibold ${dest.accentColor} opacity-80`}>
                      Glasaj →
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Total votes */}
          <p className="text-center text-[11px] text-muted-foreground mt-3">
            {voteCounts.total} ukupnih glasova · Glasanje traje do kraja sezone
          </p>
        </section>

        {/* ── WINNERS PREVIEW ────────────────────────────────────────────────── */}
        {leaders.length >= 3 && (
          <section className="bg-gradient-to-b from-white/5 to-transparent rounded-2xl border border-white/8 p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold">Trenutni pobednici</h2>
              </div>
              <span className="text-xs text-muted-foreground">
                {leadingDest.emoji} {leadingDest.name}
              </span>
            </div>

            <div className="flex items-end justify-center gap-3">
              {[leaders[1], leaders[0], leaders[2]].map((entry, podiumIdx) => {
                if (!entry) return null;
                const realRank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
                const lc = LEVEL_COLORS[entry.level] || LEVEL_COLORS.Newbie;
                const isCenter = realRank === 1;
                return (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: podiumIdx * 0.15 }}
                    onClick={() => navigate(`/raver/${entry.user_id}`)}
                    className={`cursor-pointer flex flex-col items-center gap-2 ${isCenter ? 'flex-1' : 'flex-[0.8]'}`}
                  >
                    <div className="relative">
                      <Avatar className={`${isCenter ? 'w-16 h-16' : 'w-12 h-12'} border-2 ${lc.border}`}>
                        <AvatarImage src={entry.avatar_url || undefined} />
                        <AvatarFallback className={`${lc.bg} ${lc.text}`}>
                          {(entry.display_name || '?')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${realRank === 1 ? 'bg-amber-500' : realRank === 2 ? 'bg-slate-400' : 'bg-amber-700'}`}>
                        <span className="text-[10px] font-bold text-background">{realRank}</span>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-center truncate max-w-[80px]">
                      {entry.display_name || 'Anon'}
                    </span>

                    <div className="flex items-center gap-1 text-[11px] text-primary font-bold">
                      <Zap className="w-3 h-3" />
                      {entry.season_xp.toLocaleString()}
                    </div>

                    <WinnerBadge rank={realRank} destination={leadingDest} />
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── FULL LEADERBOARD ────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="text-base font-bold">Rang lista</h2>
            </div>
            <span className="text-xs text-muted-foreground">{leaders.length} rejvera</span>
          </div>

          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-muted/30 animate-pulse" />
              ))
            ) : leaders.length > 0 ? (
              leaders.map((entry, i) => {
                const rank = i + 1;
                const isMe = user?.id === entry.user_id;
                const isWinner = rank <= 3;
                const lc = LEVEL_COLORS[entry.level] || LEVEL_COLORS.Newbie;

                return (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => navigate(`/raver/${entry.user_id}`)}
                    className={`
                      relative cursor-pointer rounded-2xl border p-4 transition-all active:scale-[0.98] shadow-lg
                      ${isMe ? 'border-primary/30 bg-primary/8' : getRankAccent(rank)}
                      ${isWinner ? 'shadow-md' : ''}
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
                          {isWinner && <WinnerBadge rank={rank} destination={leadingDest} />}
                        </div>

                        <div className="flex items-center gap-3 mt-0.5">
                          {entry.city && (
                            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" />
                              {entry.city}
                            </span>
                          )}
                          <span className="text-[11px] text-muted-foreground">
                            {entry.season_events} events
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-sm font-bold text-primary">
                          <Zap className="w-3.5 h-3.5" />
                          {entry.season_xp.toLocaleString()}
                        </div>
                        <p className="text-[10px] text-muted-foreground">Season XP</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-16 space-y-2">
                <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground">Sezona još nije počela. Budi prvi.</p>
              </div>
            )}
          </div>
        </section>

        {/* Footer info */}
        <div className="text-center space-y-1 pt-4 pb-8">
          <p className="text-xs text-muted-foreground">Sezona se završava 21. marta 2026.</p>
          <p className="text-xs text-muted-foreground">Top 3 osvajaju put za {leadingDest.name} {leadingDest.emoji}</p>
          <p className="text-[11px] text-muted-foreground/60">Destinacija se bira glasovima zajednice · AfterBefore {SEASON_NAME}</p>
        </div>
      </div>
    </div>
  );
};

export default SeasonLeaderboard;
