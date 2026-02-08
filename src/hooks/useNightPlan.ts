import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NightPlanEvent {
  id: string;
  event_id: string;
  created_at: string;
  event: {
    id: string;
    title: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    public_location_label: string | null;
    poster_url: string | null;
    event_type: string;
    heat_badge: string | null;
    heat_score: number | null;
  } | null;
}

export function useNightPlan() {
  const { user } = useAuth();
  const [nightPlan, setNightPlan] = useState<NightPlanEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());

  const loadNightPlan = useCallback(async () => {
    if (!user) {
      setNightPlan([]);
      setWishlistedIds(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);

    // Get user's wishlist with event details
    const { data, error } = await supabase
      .from('event_wishlists')
      .select(`
        id,
        event_id,
        created_at,
        event:events(
          id,
          title,
          date,
          start_time,
          end_time,
          location,
          public_location_label,
          poster_url,
          event_type,
          heat_badge,
          heat_score
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading night plan:', error);
      setLoading(false);
      return;
    }

    setNightPlan((data as any) || []);
    setWishlistedIds(new Set((data || []).map((item: any) => item.event_id)));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadNightPlan();
  }, [loadNightPlan]);

  const addToNightPlan = async (eventId: string): Promise<boolean> => {
    if (!user) return false;

    const { error } = await supabase
      .from('event_wishlists')
      .insert({
        user_id: user.id,
        event_id: eventId,
      });

    if (error) {
      // Unique constraint violation means already added
      if (error.code === '23505') {
        return true;
      }
      console.error('Error adding to night plan:', error);
      return false;
    }

    // Update local state
    setWishlistedIds(prev => new Set([...prev, eventId]));
    return true;
  };

  const removeFromNightPlan = async (eventId: string): Promise<boolean> => {
    if (!user) return false;

    const { error } = await supabase
      .from('event_wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('event_id', eventId);

    if (error) {
      console.error('Error removing from night plan:', error);
      return false;
    }

    // Update local state
    setWishlistedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(eventId);
      return newSet;
    });
    
    // Also update the full list
    setNightPlan(prev => prev.filter(item => item.event_id !== eventId));
    
    return true;
  };

  const isInNightPlan = (eventId: string): boolean => {
    return wishlistedIds.has(eventId);
  };

  const toggleNightPlan = async (eventId: string): Promise<boolean> => {
    if (isInNightPlan(eventId)) {
      return removeFromNightPlan(eventId);
    } else {
      return addToNightPlan(eventId);
    }
  };

  return {
    nightPlan,
    loading,
    wishlistedIds,
    addToNightPlan,
    removeFromNightPlan,
    isInNightPlan,
    toggleNightPlan,
    reload: loadNightPlan,
  };
}
