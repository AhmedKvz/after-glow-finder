import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { TabBar } from '@/components/TabBar';
import { DemoModeProvider } from '@/contexts/DemoModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Lucky100WinnerModal } from './Lucky100WinnerModal';
import { useCheckLucky100Winner } from '@/hooks/useCheckLucky100Winner';

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showTabBar, setShowTabBar] = useState(true);

  // Hide tab bar on onboarding screens
  useEffect(() => {
    const hideTabBarRoutes = ['/onboarding', '/splash'];
    setShowTabBar(!hideTabBarRoutes.some(route => location.pathname.startsWith(route)));
  }, [location.pathname]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [loading, user, navigate]);

  // Redirect to discover or club-dashboard based on role if on root
  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      if (location.pathname === '/' && user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleData?.role === 'club') {
          navigate('/club-dashboard', { replace: true });
        } else {
          navigate('/discover', { replace: true });
        }
      }
    };

    checkRoleAndRedirect();
  }, [location.pathname, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Lucky100 winner modal
  const { showModal: showLucky100Modal, dismissModal: dismissLucky100Modal } = useCheckLucky100Winner(user?.id);

  if (!user) {
    return null;
  }

  return (
    <DemoModeProvider>
      <div className="min-h-screen bg-background text-foreground overflow-hidden">
        {/* Main content area with responsive container */}
        <main className={`flex-1 ${showTabBar ? 'pb-28 safe-bottom' : ''}`}>
          <div className="max-w-screen-xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Tab bar */}
        {showTabBar && <TabBar />}

        {/* Lucky100 Winner Celebration Modal */}
        <Lucky100WinnerModal 
          open={showLucky100Modal} 
          onOpenChange={(open) => !open && dismissLucky100Modal()}
        />
      </div>
    </DemoModeProvider>
  );
};