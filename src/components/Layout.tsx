import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { TabBar } from '@/components/TabBar';
import { DemoModeProvider } from '@/contexts/DemoModeContext';

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showTabBar, setShowTabBar] = useState(true);

  // Hide tab bar on onboarding screens
  useEffect(() => {
    const hideTabBarRoutes = ['/onboarding', '/splash'];
    setShowTabBar(!hideTabBarRoutes.some(route => location.pathname.startsWith(route)));
  }, [location.pathname]);

  // Redirect to discover if on root
  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/discover', { replace: true });
    }
  }, [location.pathname, navigate]);

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