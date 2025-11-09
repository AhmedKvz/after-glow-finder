import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Discover from "./pages/Discover";
import Search from "./pages/Search";
import Host from "./pages/Host";
import CircleSwipe from "./pages/CircleSwipe";
import Helpers from "./pages/Helpers";
import HelperProfile from "./pages/HelperProfile";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import HelperOnboarding from "./pages/HelperOnboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DemoModeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="discover" element={<Discover />} />
                <Route path="search" element={<Search />} />
                <Route path="host" element={<Host />} />
                <Route path="circle-swipe" element={<CircleSwipe />} />
                <Route path="helpers" element={<Helpers />} />
                <Route path="helpers/:helperId" element={<HelperProfile />} />
                <Route path="helper-onboarding" element={<HelperOnboarding />} />
                <Route path="profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </DemoModeProvider>
  </QueryClientProvider>
);

export default App;
