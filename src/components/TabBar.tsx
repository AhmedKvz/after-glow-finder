import { NavLink, useLocation } from 'react-router-dom';
import { 
  Compass, 
  Search, 
  Plus, 
  HandHeart, 
  User,
  Heart,
  Trophy,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const tabs = [
  { id: 'discover', label: 'Discover', icon: Compass, path: '/discover' },
  { id: 'search', label: 'Search', icon: Search, path: '/search' },
  { id: 'circle-swipe', label: 'Swipe', icon: Heart, path: '/circle-swipe' },
  { id: 'gamification', label: 'Game', icon: Trophy, path: '/gamification' },
  { id: 'host', label: 'Host', icon: Plus, path: '/host' },
  { id: 'helpers', label: 'Helpers', icon: HandHeart, path: '/helpers' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

export const TabBar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isClub, setIsClub] = useState(false);

  useEffect(() => {
    const checkClubStatus = async () => {
      if (!user) return;

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'club')
        .maybeSingle();

      setIsClub(!!roleData);
    };

    checkClubStatus();
  }, [user]);

  // All tabs visible to all users
  const visibleTabs = tabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      {/* Glass background with blur */}
      <div className="glass-card border-t border-border/20">
        <div className="flex items-center justify-around px-2 py-3">
          {visibleTabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            const Icon = tab.icon;
            
            return (
              <NavLink
                key={tab.id}
                to={tab.path}
                className={cn(
                  'flex flex-col items-center space-y-1 px-2 py-2 rounded-xl transition-all duration-300',
                  'min-w-[56px] relative group cursor-pointer',
                  'hover:scale-110 active:scale-95'
                )}
              >
                {/* Active background glow */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl gradient-primary opacity-10 scale-110 pointer-events-none" />
                )}
                
                {/* Icon with special styling for Host, Gamification, and Circle Swipe tabs */}
                <div className={cn(
                  'relative p-1.5 rounded-lg transition-all duration-300',
                  'group-hover:p-2.5 group-hover:scale-110',
                  (tab.id === 'host' || tab.id === 'gamification' || tab.id === 'circle-swipe') && 'gradient-primary text-white shadow-primary',
                  tab.id !== 'host' && tab.id !== 'gamification' && tab.id !== 'circle-swipe' && isActive && 'text-primary',
                  tab.id !== 'host' && tab.id !== 'gamification' && tab.id !== 'circle-swipe' && !isActive && 'text-muted-foreground group-hover:text-primary'
                )}>
                  <Icon size={18} className="group-hover:scale-110 transition-transform duration-300" />
                </div>
                
                {/* Label */}
                <span className={cn(
                  'text-[10px] font-medium transition-all duration-300',
                  'group-hover:text-xs',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                )}>
                  {tab.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};