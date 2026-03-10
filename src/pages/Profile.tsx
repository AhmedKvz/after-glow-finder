import { useState, useEffect } from 'react';
import {
  Edit, MapPin, Zap, Star, Shield, Trophy,
  Calendar, Gift, Target, ChevronRight,
  LogOut, Settings, Bell, Sparkles, Moon,
  Check, Award, Users, Music, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { EditProfileModal } from '@/components/EditProfileModal';
import { MyTickets } from '@/components/MyTickets';
import { NightPlanList } from '@/components/NightPlanList';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface ProfileData {
  display_name: string;
  bio?: string;
  city?: string;
  music_tags?: string[];
  avatar_url?: string;
  xp?: number;
  level?: string;
  trust_score?: number;
  badges?: any;
  events_attended?: number;
  afters_hosted?: number;
  lucky100_wins?: number;
  vip_status?: boolean;
}

const LEVEL_THRESHOLDS: Record<string, number> = {
  Newbie: 100, Explorer: 500, 'Rising Star': 1000,
  Regular: 2000, Pro: 5000, VIP: 10000, Legend: 99999,
};

const LEVEL_COLORS: Record<string, string> = {
  Newbie: 'text-slate-400',
  Explorer: 'text-cyan-400',
  'Rising Star': 'text-blue-400',
  Regular: 'text-purple-400',
  Pro: 'text-primary',
  VIP: 'text-amber-400',
  Legend: 'text-orange-400',
};

const TRUST_TIERS = [
  { min: 80, label: 'Trusted', color: 'text-emerald-400', bg: 'bg-emerald-400/15 border-emerald-400/30' },
  { min: 60, label: 'Verified', color: 'text-blue-400', bg: 'bg-blue-400/15 border-blue-400/30' },
  { min: 40, label: 'Known', color: 'text-yellow-400', bg: 'bg-yellow-400/15 border-yellow-400/30' },
  { min: 0, label: 'New', color: 'text-slate-400', bg: 'bg-slate-400/15 border-slate-400/30' },
];

const getTrustTier = (score: number) =>
  TRUST_TIERS.find(t => score >= t.min) || TRUST_TIERS[TRUST_TIERS.length - 1];

const getLevelProgress = (xp: number, level: string) => {
  const keys = Object.keys(LEVEL_THRESHOLDS);
  const idx = keys.indexOf(level);
  const prev = idx > 0 ? LEVEL_THRESHOLDS[keys[idx - 1]] : 0;
  const curr = LEVEL_THRESHOLDS[level] || 100;
  return Math.min(Math.max(((xp - prev) / (curr - prev)) * 100, 0), 100);
};

const Patch = ({ label, color }: { label: string; color?: string }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${color || 'bg-primary/15 border-primary/30 text-primary'}`}>
    <Check size={12} />
    {label}
  </span>
);

const StatPill = ({ value, label, color }: { value: number; label: string; color: string }) => (
  <div className="flex flex-col items-center gap-0.5">
    <span className={`text-xl font-bold ${color}`}>{value}</span>
    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
  </div>
);

const RaverProfile = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) { loadProfile(); loadQuests(); }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user!.id).single();
    if (data) setProfileData(data);
    setLoading(false);
  };

  const loadQuests = async () => {
    const { data } = await supabase.from('quests').select('*').eq('user_id', user!.id)
      .eq('status', 'completed').order('completed_at', { ascending: false }).limit(6);
    if (data) setQuests(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const xp = profileData?.xp || 0;
  const level = profileData?.level || 'Newbie';
  const trust = profileData?.trust_score || 50;
  const trustTier = getTrustTier(trust);
  const levelColor = LEVEL_COLORS[level] || 'text-primary';
  const handle = user?.email?.split('@')[0] || 'raver';
  const initials = profileData?.display_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'R';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Cover / Hero */}
      <div className="relative h-44 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-purple-600/30 to-background" />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.3),transparent_70%)]" />
        {/* Grain texture */}
        <div className="absolute inset-0 opacity-[0.04] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

        {/* Edit + Settings row */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button variant="ghost" size="icon" className="bg-background/20 backdrop-blur-sm" onClick={() => setShowEditModal(true)}>
            <Edit size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="bg-background/20 backdrop-blur-sm">
            <Settings size={18} />
          </Button>
        </div>

        {/* VIP crown */}
        {profileData?.vip_status && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-4 left-4 z-10"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 backdrop-blur-sm">
              <Trophy size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-amber-400">VIP</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Avatar + Identity */}
      <div className="px-5 -mt-14 relative z-10">
        <div className="flex items-end justify-between mb-4">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
              <AvatarImage src={profileData?.avatar_url} />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-purple-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Level ring indicator */}
            <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-background ${levelColor}`}>
              {level === 'Legend' ? '★' : level.substring(0, 3).toUpperCase()}
            </div>
          </div>

          <div className="pb-1">
            <Button variant="outline" size="sm" className="rounded-full text-xs gap-1.5" onClick={() => navigate('/quests')}>
              <Target size={14} />
              Missions
            </Button>
          </div>
        </div>

        {/* Name + handle + city */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold">{profileData?.display_name || 'Raver'}</h1>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${trustTier.bg} ${trustTier.color}`}>
              {trustTier.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">@{handle}</p>
          {profileData?.city && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin size={12} />
              {profileData.city}
            </p>
          )}
        </div>

        {/* Bio */}
        {profileData?.bio && (
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{profileData.bio}</p>
        )}

        {/* Music tags */}
        {profileData?.music_tags && profileData.music_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {profileData.music_tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-secondary border border-border">
                <Music size={10} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between py-4 px-2 rounded-2xl bg-secondary/50 border border-border/50 mb-5">
          <StatPill value={profileData?.events_attended || 0} label="Events" color="text-primary" />
          <div className="w-px h-8 bg-border/50" />
          <StatPill value={profileData?.afters_hosted || 0} label="Hosted" color="text-purple-400" />
          <div className="w-px h-8 bg-border/50" />
          <StatPill value={profileData?.lucky100_wins || 0} label="Lucky" color="text-amber-400" />
          <div className="w-px h-8 bg-border/50" />
          <StatPill value={trust} label="Trust" color={trustTier.color} />
        </div>

        {/* XP Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" />
              <span className={`text-sm font-semibold ${levelColor}`}>{level}</span>
            </div>
            <span className="text-xs text-muted-foreground">{xp} XP</span>
          </div>
          <Progress value={getLevelProgress(xp, level)} className="h-2" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="patches" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-5 text-xs">
            <TabsTrigger value="patches">Patches</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* PATCHES tab */}
          <TabsContent value="patches" className="space-y-5">
            {/* AfterMissions patches */}
            <div className="rounded-2xl border border-border/50 bg-secondary/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <Target size={14} className="text-primary" />
                  AfterMissions Patches
                </h3>
                <button onClick={() => navigate('/quests')} className="text-xs text-primary flex items-center gap-0.5">
                  Ver sve <ChevronRight size={12} />
                </button>
              </div>
              {quests.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {quests.map((q, i) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-background/60 border border-border/30"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                        <Check size={16} className="text-primary" />
                      </div>
                      <p className="text-[10px] font-medium text-center leading-tight line-clamp-2">{q.title}</p>
                      <span className="text-[9px] text-amber-400 font-semibold">
                        +{q.xp_reward}xp
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">
                  Završi misije da osvoji prve patches.
                </p>
              )}
            </div>

            {/* Vibe badges */}
            {profileData?.badges && (profileData.badges as string[]).length > 0 && (
              <div className="rounded-2xl border border-border/50 bg-secondary/30 p-4">
                <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
                  <Award size={14} className="text-amber-400" />
                  Vibe Badges
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(profileData.badges as string[]).map((b, i) => (
                    <Patch key={i} label={b} />
                  ))}
                </div>
              </div>
            )}

            {/* Raverboard CTA */}
            <button
              onClick={() => navigate('/leaderboard')}
              className="w-full rounded-2xl border border-amber-400/20 bg-amber-400/[0.08] p-4 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Trophy size={20} className="text-amber-400" />
                <div className="text-left">
                  <p className="text-sm font-semibold">Raverboard</p>
                  <p className="text-xs text-muted-foreground">Vidi svoju poziciju u sceni</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </TabsContent>

          <TabsContent value="plan" className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-primary" />
              <span className="text-sm font-semibold">My Night Plan</span>
            </div>
            <NightPlanList />
          </TabsContent>

          <TabsContent value="tickets">
            <MyTickets />
          </TabsContent>

          {/* Settings tab */}
          <TabsContent value="settings" className="space-y-1">
            {[
              {
                label: 'Notifications', icon: Bell,
                toggle: { checked: notifications, onChange: setNotifications },
              },
              {
                label: 'Dark Mode', icon: Moon,
                toggle: { checked: darkMode, onChange: setDarkMode },
              },
              {
                label: 'Demo Mode', icon: Sparkles,
                toggle: { checked: isDemoMode, onChange: toggleDemoMode },
                badge: isDemoMode ? 'ON' : 'OFF',
              },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Icon size={18} className="text-muted-foreground" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-[10px]">{item.badge}</Badge>
                    )}
                  </div>
                  <Switch checked={item.toggle.checked} onCheckedChange={item.toggle.onChange} />
                </div>
              );
            })}

            <button className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-secondary/50 transition-colors mt-2" onClick={() => setShowEditModal(true)}>
              <div className="flex items-center gap-3">
                <Edit size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium">Edit Profile</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>

            <button className="flex items-center w-full p-3 rounded-xl hover:bg-destructive/10 transition-colors mt-1" onClick={signOut}>
              <div className="flex items-center gap-3">
                <LogOut size={18} className="text-destructive" />
                <span className="text-sm font-medium text-destructive">Sign Out</span>
              </div>
            </button>
          </TabsContent>
        </Tabs>
      </div>

      <EditProfileModal
        open={showEditModal}
        onOpenChange={(open) => { setShowEditModal(open); if (!open) loadProfile(); }}
      />
    </div>
  );
};

export default RaverProfile;
