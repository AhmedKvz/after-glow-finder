import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { TabBar } from '@/components/TabBar';
import { DemoModeProvider } from '@/contexts/DemoModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

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

  // Redirect to discover if on root
  useEffect(() => {
    if (location.pathname === '/' && user) {
      navigate('/discover', { replace: true });
    }
  }, [location.pathname, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DemoModeProvider>
      <div className="min-h-screen bg-background text-foreground overflow-hidden">
        {/* Main content area */}
        <main className={`flex-1 ${showTabBar ? 'pb-20 safe-bottom' : ''}`}>
          <Outlet />
        </main>

        {/* Tab bar */}
        {showTabBar && <TabBar />}
      </div>
    </DemoModeProvider>
  );
};