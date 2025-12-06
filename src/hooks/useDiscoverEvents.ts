import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useDiscoverEvents(userId?: string) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow'>('all');
  const [freeOnly, setFreeOnly] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [userId]);

  const loadEvents = async (skipSwipedFilter: boolean = false) => {
    setLoading(true);

    let swipedEventIds: string[] = [];
    if (userId && !skipSwipedFilter) {
      const { data: swipes } = await supabase
        .from('event_swipes')
        .select('event_id')
        .eq('user_id', userId);

      swipedEventIds = swipes?.map(s => s.event_id) || [];
    }

    const loadType = async (type: 'club' | 'cafe' | 'private_host') => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('event_type', type)
        .order('date', { ascending: true });
      return data || [];
    };

    const club = await loadType('club');
    const cafe = await loadType('cafe');
    const priv = await loadType('private_host');

    let all = [...club, ...cafe, ...priv];
    if (!skipSwipedFilter) all = all.filter(e => !swipedEventIds.includes(e.id));

    const hostIds = [...new Set(all.map(e => e.host_id))];

    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', hostIds);

    const eventIds = all.map(e => e.id);

    const { data: eventReviews } = await supabase
      .from('event_reviews')
      .select('event_id, rating')
      .in('event_id', eventIds);

    const { data: userReviews } = await supabase
      .from('user_reviews')
      .select('reviewed_user_id, rating')
      .in('reviewed_user_id', hostIds);

    const eventRatingMap = new Map();
    eventReviews?.forEach((r: any) => {
      const x = eventRatingMap.get(r.event_id) || { sum: 0, count: 0 };
      eventRatingMap.set(r.event_id, { sum: x.sum + r.rating, count: x.count + 1 });
    });

    const userRatingMap = new Map();
    userReviews?.forEach((r: any) => {
      const x = userRatingMap.get(r.reviewed_user_id) || { sum: 0, count: 0 };
      userRatingMap.set(r.reviewed_user_id, { sum: x.sum + r.rating, count: x.count + 1 });
    });

    const merged = all.map(event => {
      const p = profiles?.find(p => p.user_id === event.host_id);
      const rating = event.event_type === 'private_host'
        ? userRatingMap.get(event.host_id)
        : eventRatingMap.get(event.id);

      const avg = rating ? rating.sum / rating.count : null;

      return {
        ...event,
        host: p || { display_name: 'Unknown', avatar_url: null },
        average_rating: avg,
        review_count: rating?.count || 0,
      };
    });

    merged.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setEvents(merged);
    setLoading(false);
  };

  const filteredEvents = events.filter(e => {
    const searchMatch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase());

    const genreMatch =
      genreFilter === 'all' ||
      (e.music_tags &&
        e.music_tags.some((t: string) =>
          t.toLowerCase().includes(genreFilter.toLowerCase())
        ));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const eventDate = new Date(e.date);
    eventDate.setHours(0, 0, 0, 0);

    let dateMatch = true;
    if (dateFilter === 'today') dateMatch = eventDate.getTime() === today.getTime();
    if (dateFilter === 'tomorrow') dateMatch = eventDate.getTime() === tomorrow.getTime();

    const freeMatch = !freeOnly || e.event_type === 'cafe' || !e.ticket_link;

    return searchMatch && genreMatch && dateMatch && freeMatch;
  });

  const featuredEvents = filteredEvents.slice(0, 3);

  return {
    loading,
    events,
    filteredEvents,
    featuredEvents,
    searchQuery,
    setSearchQuery,
    genreFilter,
    setGenreFilter,
    dateFilter,
    setDateFilter,
    freeOnly,
    setFreeOnly,
    reload: loadEvents,
  };
}
