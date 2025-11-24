import { NavLink, useLocation } from 'react-router-dom';
import { 
  Compass, 
  Search, 
  Plus, 
  HandHeart, 
  User,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const tabs = [
  { id: 'discover', label: 'Discover', icon: Compass, path: '/discover' },
  { id: 'search', label: 'Search', icon: Search, path: '/search' },
  { id: 'host', label: 'Host', icon: Plus, path: '/host' },
  { id: 'circle', label: 'Circle', icon: Heart, path: '/circle-swipe' },
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

  // Filter tabs based on user role
  const visibleTabs = tabs.filter(tab => {
    if (tab.id === 'host') {
      return isClub; // Only show Host tab for club users
    }
    return true;
  });

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
                  'flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300',
                  'min-w-[60px] relative interactive',
                  isActive && 'text-primary'
                )}
              >
                {/* Active background glow */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl gradient-primary opacity-10 scale-110" />
                )}
                
                {/* Icon with special styling for Host tab */}
                <div className={cn(
                  'relative p-2 rounded-lg transition-all duration-300',
                  tab.id === 'host' && 'gradient-primary text-white shadow-primary',
                  tab.id !== 'host' && isActive && 'text-primary',
                  tab.id !== 'host' && !isActive && 'text-muted-foreground'
                )}>
                  <Icon size={20} />
                </div>
                
                {/* Label */}
                <span className={cn(
                  'text-xs font-medium transition-colors duration-300',
                  isActive ? 'text-primary' : 'text-muted-foreground'
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