import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface ProfileUpdate {
  display_name?: string;
  bio?: string;
  music_tags?: string[];
  city?: string;
  avatar_url?: string;
  gender?: 'male' | 'female' | 'other' | 'hidden';
  birthdate?: string;
  lat?: number;
  lng?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, role: 'user' | 'club') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const demoWarmedRef = useRef(false);

  // Warm demo crowd in background (investor MVP - never empty screens)
  const warmDemoCrowd = async () => {
    if (demoWarmedRef.current) return;
    demoWarmedRef.current = true;

    try {
      // Ensure global demo users exist
      await supabase.rpc('ensure_global_demo_users');
      
      // Bump demo activity to make them appear "online"
      await supabase.rpc('bump_demo_activity');

      // Ensure demo crowd for upcoming events
      const today = new Date().toISOString().slice(0, 10);
      const { data: events } = await supabase
        .from('events')
        .select('id, date')
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(10);

      for (const e of events ?? []) {
        await supabase.rpc('ensure_event_demo_crowd', { _event_id: e.id });
      }
    } catch (e) {
      console.warn('Demo crowd warmup failed', e);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Warm demo crowd when user logs in (background, non-blocking)
        if (session?.user) {
          warmDemoCrowd();
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Warm demo crowd for existing session
      if (session?.user) {
        warmDemoCrowd();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string, role: 'user' | 'club') => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName,
          role: role
        }
      }
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!error && data.user) {
      // Check user role from user_roles table
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      // Redirect based on role
      if (roleData?.role === 'club') {
        navigate('/club-dashboard');
      } else {
        navigate('/discover');
      }
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);

    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
