import { useState, useEffect } from 'react';
import {
  ArrowLeft, MapPin, Zap, Star, Shield, Trophy,
  Calendar, Music, Award, Users, Check, Crown,
  TrendingUp, MessageSquare, Gift
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ReviewsList } from '@/components/ReviewsList';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';

interface PublicProfile {
  user_id: string;
  display_name: string;
  bio?: string;
  city?: string;
  music_tags?: string[];
  avatar_url?: string;
  xp: number;
  level: string;
  trust_score: number;
  badges: string[];
  events_attended: number;
  afters_hosted: number;
  lucky100_wins: number;
  vip_status: boolean;
}

const LEVEL_META: Record<string, { text: string; bg: string; border: string; gradient: string }> = {
  Newbie:        { text: 'text-slate-400',  bg: 'bg-slate-400/10',  border: 'border-slate-400/25',  gradient: 'from-slate-800/80 to-background' },
  Explorer:      { text: 'text-cyan-400',   bg: 'bg-cyan-400/10',   border: 'border-cyan-400/25',   gradient: 'from-cyan-900/50 to-background' },
  'Rising Star': { text: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/25',   gradient: 'from-blue-900/50 to-background' },
  Regular:       { text: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/25', gradient: 'from-purple-900/60 to-background' },
  Pro:           { text: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/25',    gradient: 'from-primary/25 to-background' },
  VIP:           { text: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/25',  gradient: 'from-amber-900/55 to-background' },
  Legend:        { text: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/25', gradient: 'from-orange-900/50 via-red-900/30 to-background' },
};

const TRUST_TIERS = [
  { min: 80, label: 'Trusted',  color: 'text-emerald-400', bg: 'bg-emerald-400/12 border-emerald-400/25' },
  { min: 60, label: 'Verified', color: 'text-blue-400',    bg: 'bg-blue-400/12 border-blue-400/25' },
  { min: 40, label: 'Known',    color: 'text-yellow-400',  bg: 'bg-yellow-400/12 border-yellow-400/25' },
  { min: 0,  label: 'New',      color: 'text-slate-400',   bg: 'bg-slate-400/12 border-slate-400/25' },
];

const LEVEL_XP: Record<string, number> = {
  Newbie: 100, Explorer: 500, 'Rising Star': 1000,
  Regular: 2000, Pro: 5000, VIP: 10000, Legend: 99999,
};

const getTrustTier = (s: number) => TRUST_TIERS.find(t => s >= t.min) || TRUST_TIERS[3];

const getLevelProgress = (xp: number, level: string) => {
  const keys = Object.keys(LEVEL_XP);
  const idx = keys.indexOf(level);
  const prev = idx > 0 ? LEVEL_XP[keys[idx - 1]] : 0;
  const curr = LEVEL_XP[level] || 100;
  return Math.min(Math.max(((xp - prev) / (curr - prev)) * 100, 0), 100);
};

const Stat = ({ value, label, color }: { value: number | string; label: string; color: string }) => (
  <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl bg-muted/50 border border-border/50 min-w-[72px]">
    <span className={`text-lg font-bold ${color}`}>{value}</span>
    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
  </div>
);

const PublicRaverProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [completedQuests, setCompletedQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isOwn = me?.id === userId;

  useEffect(() => {
    if (userId) { loadProfile(); loadQuests(); }
  }, [userId]);

  const loadProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', userId!).single();
    if (data) setProfile(data as unknown as PublicProfile);
    setLoading(false);
  };

  const loadQuests = async () => {
    const { data } = await supabase.from('quests').select('*')
      .eq('user_id', userId!)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false }).limit(9);
    if (data) setCompletedQuests(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Users className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">Profil nije pronađen.</p>
        <button onClick={() => navigate(-1)} className="text-primary text-sm">← Nazad</button>
      </div>
    );
  }

  const level = profile.level || 'Newbie';
  const lm = LEVEL_META[level] || LEVEL_META.Newbie;
  const trust = profile.trust_score || 50;
  const tt = getTrustTier(trust);
  const initials = (profile.display_name || '?')[0].toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pb-24"
    >
      {/* Cover — color reflects level */}
      <div className={`relative h-44 bg-gradient-to-b ${lm.gradient} overflow-hidden`}>
        {/* Grain texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/5 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-primary/5 blur-2xl" />

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button onClick={() => navigate(-1)} className="w-9 h-9 glass-card rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          {isOwn && (
            <button onClick={() => navigate('/profile')} className="glass-card rounded-xl px-3 py-1.5 text-xs font-medium">
              Edit Profile
            </button>
          )}
        </div>

        {/* VIP badge */}
        {profile.vip_status && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1 text-amber-400 text-xs font-semibold">
            <Crown className="w-3.5 h-3.5" />
            VIP
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 -mt-16 relative z-10 space-y-5">
        {/* Avatar */}
        <div className="flex items-end gap-4">
          <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl font-bold bg-muted">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex gap-2 mb-1">
            <Badge variant="outline" className={`${lm.bg} ${lm.border} ${lm.text} border text-[11px] px-2 py-0.5`}>
              {level}
            </Badge>
            <Badge variant="outline" className={`${tt.bg} ${tt.color} border text-[11px] px-2 py-0.5`}>
              {tt.label}
            </Badge>
          </div>
        </div>

        {/* Name + city */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{profile.display_name}</h1>
          {profile.city && (
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <MapPin className="w-3.5 h-3.5" />
              {profile.city}
            </div>
          )}
        </div>

        {profile.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
        )}

        {/* Music tags */}
        {profile.music_tags && profile.music_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.music_tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 text-xs bg-muted/60 border border-border/50 rounded-full px-2.5 py-1 text-muted-foreground">
                <Music className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Stat value={profile.events_attended || 0} label="Events" color="text-primary" />
          <Stat value={profile.afters_hosted || 0} label="Hosted" color="text-purple-400" />
          <Stat value={Math.round(trust)} label="Trust" color={tt.color} />
          <Stat value={profile.lucky100_wins || 0} label="Lucky" color="text-amber-400" />
        </div>

        {/* XP bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-primary" />
              <span className={`font-semibold ${lm.text}`}>{level}</span>
            </div>
            <span className="text-muted-foreground text-xs">{profile.xp?.toLocaleString() || 0} XP</span>
          </div>
          <Progress value={getLevelProgress(profile.xp || 0, level)} className="h-2" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="patches" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-muted/50">
            <TabsTrigger value="patches" className="text-xs gap-1">
              <Award className="w-3.5 h-3.5" /> Patches
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Reviews
            </TabsTrigger>
            <TabsTrigger value="scene" className="text-xs gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Scene
            </TabsTrigger>
          </TabsList>

          {/* PATCHES */}
          <TabsContent value="patches" className="space-y-4 mt-4">
            {completedQuests.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {completedQuests.map((q, i) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/40 border border-border/50"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-[10px] text-center font-medium leading-tight line-clamp-2">{q.title}</p>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                      +{q.xp_reward}xp
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">Nema patches još.</p>
            )}

            {/* Vibe badges */}
            {profile.badges && (profile.badges as string[]).length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" /> Vibe Badges
                </p>
                <div className="flex flex-wrap gap-2">
                  {(profile.badges as string[]).map((b, i) => (
                    <Badge key={i} variant="outline" className="bg-primary/5 border-primary/20 text-xs">
                      {b}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* REVIEWS */}
          <TabsContent value="reviews" className="mt-4">
            {userId ? (
              <ReviewsList userId={userId} />
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">Nema review-ova.</p>
            )}
          </TabsContent>

          {/* SCENE STATS */}
          <TabsContent value="scene" className="space-y-3 mt-4">
            {[
              { label: 'Events Attended',   value: profile.events_attended || 0,  max: 100,  color: 'text-primary',    bg: 'bg-primary',    icon: Calendar },
              { label: 'Afters Hosted',      value: profile.afters_hosted || 0,    max: 50,   color: 'text-purple-400', bg: 'bg-purple-400', icon: Star },
              { label: 'Trust Score',        value: Math.round(trust),             max: 100,  color: tt.color,          bg: 'bg-emerald-400',icon: Shield },
              { label: 'Lucky 100 Wins',     value: profile.lucky100_wins || 0,    max: 20,   color: 'text-amber-400',  bg: 'bg-amber-400',  icon: Gift },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-xl bg-muted/40 border border-border/50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm">
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      {item.label}
                    </span>
                    <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${item.bg} transition-all`} style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default PublicRaverProfile;
