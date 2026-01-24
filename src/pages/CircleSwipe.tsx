import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, X, Sparkles, Users, Loader2, PartyPopper, Clock, Flame, Lock, Globe, Ticket, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircleSwipeCard } from '@/components/CircleSwipeCard';
import { MatchesModal } from '@/components/MatchesModal';
import { MatchNotificationModal } from '@/components/MatchNotificationModal';
import { SpicyModeModal } from '@/components/SpicyModeModal';
import { SpicyConfirmationModal } from '@/components/SpicyConfirmationModal';
import { SpicyPromptModal } from '@/components/SpicyPromptModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AccessStatus {
  has_access: boolean;
  access_type: 'ticket' | 'paid' | null;
  paid_valid_until: string | null;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
}

const CircleSwipe = () => {
  const { eventId } = useParams<{ eventId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMatches, setShowMatches] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [myVotes, setMyVotes] = useState<Record<string, string>>({});
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<any>(null);
  const [profileReviews, setProfileReviews] = useState<Record<string, { rating: number; count: number }>>({});
  const [showSpicyMode, setShowSpicyMode] = useState(false);
  const [showSpicyConfirmation, setShowSpicyConfirmation] = useState(false);
  const [showSpicyPrompt, setShowSpicyPrompt] = useState(false);
  const [purchasingSpicy, setPurchasingSpicy] = useState(false);
  const [showSpicyOnly, setShowSpicyOnly] = useState(false);
  const [hasActiveSpicyMode, setHasActiveSpicyMode] = useState(false);

  // Event mode state
  const [hasAccess, setHasAccess] = useState<boolean>(true);
  const [accessType, setAccessType] = useState<'ticket' | 'paid' | null>(null);
  const [paidValidUntil, setPaidValidUntil] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [eventTitle, setEventTitle] = useState<string | null>(null);
  const [isEventLive, setIsEventLive] = useState<boolean | null>(null);
  const [purchasingAccess, setPurchasingAccess] = useState(false);

  // Mode switcher state
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [availableEvents, setAvailableEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  const isEventMode = !!eventId;

  // Load available events for picker
  const loadAvailableEvents = async () => {
    setEventsLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date, start_time, end_time')
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(15);

      if (!error && data) {
        setAvailableEvents(data);
      }
    } catch (e) {
      console.error('Failed to load events:', e);
    } finally {
      setEventsLoading(false);
    }
  };

  // Handle mode switch
  const handleModeSwitch = (mode: 'global' | 'event') => {
    if (mode === 'global') {
      navigate('/circle-swipe');
      setShowEventPicker(false);
    } else {
      // Show event picker
      setShowEventPicker(true);
      if (availableEvents.length === 0) {
        loadAvailableEvents();
      }
    }
  };

  const handleEventSelect = (selectedEventId: string) => {
    navigate(`/circle-swipe/${selectedEventId}`);
    setShowEventPicker(false);
  };

  useEffect(() => {
    if (user) {
      if (isEventMode) {
        loadEventAndCheckAccess();
      } else {
        loadSessions();
      }
    }
  }, [user, eventId]);

  useEffect(() => {
    if (selectedSession && hasAccess) {
      loadSessionData();
    }
  }, [selectedSession, showSpicyOnly, hasAccess]);

  const loadEventAndCheckAccess = async () => {
    if (!user || !eventId) return;
    setLoading(true);

    try {
      // Fetch event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id, title, date, start_time, end_time')
        .eq('id', eventId)
        .single();

      if (eventError || !eventData) {
        toast({
          title: 'Event not found',
          description: 'The event you are looking for does not exist.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      setEventTitle(eventData.title);

      // Check if event is currently live
      const now = new Date();
      const eventDate = new Date(eventData.date);
      const [startH, startM] = eventData.start_time.split(':').map(Number);
      const [endH, endM] = eventData.end_time.split(':').map(Number);
      
      const eventStart = new Date(eventDate);
      eventStart.setHours(startH, startM, 0);
      
      const eventEnd = new Date(eventDate);
      eventEnd.setHours(endH, endM, 0);
      // Handle overnight events
      if (endH < startH) {
        eventEnd.setDate(eventEnd.getDate() + 1);
      }
      
      setIsEventLive(now >= eventStart && now <= eventEnd);

      // Check access via RPC
      const { data: accessData, error: accessError } = await supabase.rpc('circle_access_status', {
        _event_id: eventId
      }) as { data: AccessStatus | null; error: any };

      if (accessError) {
        console.error('Error checking access:', accessError);
        setHasAccess(false);
        setShowPaywall(true);
        setLoading(false);
        return;
      }

      if (accessData?.has_access) {
        setHasAccess(true);
        setAccessType(accessData.access_type);
        setPaidValidUntil(accessData.paid_valid_until);
        setShowPaywall(false);

        // Create event session
        const eventSession = {
          id: `event-${eventId}`,
          event_id: eventId,
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          participant_ids: [],
          events: {
            title: eventData.title
          }
        };
        setSessions([eventSession]);
        setSelectedSession(eventSession);
      } else {
        setHasAccess(false);
        setAccessType(null);
        setPaidValidUntil(null);
        setShowPaywall(true);
        // Clear profiles when showing paywall (prevent leftover from global mode)
        setProfiles([]);
        setMatches([]);
        setMyVotes({});
      }
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    if (!user) return;

    // Create a demo session for Circle Swipe functionality
    const demoSession = {
      id: 'demo-session',
      event_id: '599fc2ae-22d1-4123-98b8-fbc9f80dc544',
      starts_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      participant_ids: [],
      events: {
        title: 'Belgrade Underground Techno Night'
      }
    };

    setSessions([demoSession]);
    setSelectedSession(demoSession);
    setLoading(false);
  };

  const loadSessionData = async () => {
    if (!selectedSession || !user) return;

    // Get current user's profile to filter by opposite gender and check spicy mode
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('gender, spicy_state, spicy_state_expires_at')
      .eq('user_id', user.id)
      .maybeSingle();

    // Check if user has active spicy mode purchase
    const { data: spicyPurchase } = await supabase
      .from('spicy_mode_purchases')
      .select('expires_at')
      .eq('user_id', user.id)
      .eq('circle_session_id', selectedSession.id)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    setHasActiveSpicyMode(!!spicyPurchase);

    let profilesData: any[] = [];

    if (isEventMode && eventId && hasAccess) {
      // Event mode: use RPC to get participant profiles (bypasses RLS securely)
      const { data, error } = await supabase.rpc('event_circle_profiles', {
        _event_id: eventId,
        _limit: 20,
      });

      if (error) {
        console.error('event_circle_profiles error:', error);
        profilesData = [];
      } else {
        profilesData = (data as any[]) || [];
      }

      // Filter by opposite gender (RPC returns all participants)
      if (myProfile?.gender) {
        const oppositeGender = myProfile.gender === 'male' ? 'female' : 'male';
        profilesData = profilesData.filter(p => p.gender === oppositeGender);
      }
      profilesData = profilesData.filter(p => p.gender != null);
    } else {
      // Global mode: load all profiles
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id)
        .not('gender', 'is', null)
        .limit(20);

      // Filter by opposite gender if user has gender set
      if (myProfile?.gender) {
        const oppositeGender = myProfile.gender === 'male' ? 'female' : 'male';
        query = query.eq('gender', oppositeGender);
      }

      const { data } = await query;
      profilesData = data || [];
    }

    if (profilesData.length > 0) {
      // Sort profiles by spicy priority
      const sortedProfiles = [...profilesData].sort((a, b) => {
        // Priority 1: Active spicy mode users (check if they have recent purchase)
        const aSpicyMode = a.last_circle_activity && 
          (Date.now() - new Date(a.last_circle_activity).getTime()) < 12 * 60 * 60 * 1000;
        const bSpicyMode = b.last_circle_activity && 
          (Date.now() - new Date(b.last_circle_activity).getTime()) < 12 * 60 * 60 * 1000;
        
        if (aSpicyMode && !bSpicyMode) return -1;
        if (!aSpicyMode && bSpicyMode) return 1;

        // Priority 2: Spicy state users
        const aSpicy = a.spicy_state && a.spicy_state_expires_at && 
          new Date(a.spicy_state_expires_at) > new Date();
        const bSpicy = b.spicy_state && b.spicy_state_expires_at && 
          new Date(b.spicy_state_expires_at) > new Date();
        
        if (aSpicy && !bSpicy) return -1;
        if (!aSpicy && bSpicy) return 1;

        // Priority 3: Spicy likelihood score
        return (b.spicy_likelihood_score || 0) - (a.spicy_likelihood_score || 0);
      });

      // Filter to spicy users only if toggle is on
      const filteredProfiles = showSpicyOnly
        ? sortedProfiles.filter(p => {
            const hasSpicyMode = p.last_circle_activity && 
              (Date.now() - new Date(p.last_circle_activity).getTime()) < 12 * 60 * 60 * 1000;
            const hasSpicyState = p.spicy_state && p.spicy_state_expires_at && 
              new Date(p.spicy_state_expires_at) > new Date();
            return hasSpicyMode || hasSpicyState;
          })
        : sortedProfiles;

      setProfiles(filteredProfiles.slice(0, 10));

      // Load reviews for all profiles
      const userIds = filteredProfiles.map(p => p.user_id);
      const { data: reviewsData } = await supabase
        .from('user_reviews')
        .select('reviewed_user_id, rating')
        .in('reviewed_user_id', userIds);

      if (reviewsData) {
        const reviewsMap: Record<string, { rating: number; count: number }> = {};
        reviewsData.forEach(review => {
          if (!reviewsMap[review.reviewed_user_id]) {
            reviewsMap[review.reviewed_user_id] = { rating: 0, count: 0 };
          }
          reviewsMap[review.reviewed_user_id].rating += review.rating;
          reviewsMap[review.reviewed_user_id].count += 1;
        });

        // Calculate averages
        Object.keys(reviewsMap).forEach(userId => {
          reviewsMap[userId].rating = reviewsMap[userId].rating / reviewsMap[userId].count;
        });

        setProfileReviews(reviewsMap);
      }

      // Auto-create matches for demo mode
      if (filteredProfiles.length >= 4) {
        setMatches(filteredProfiles.slice(0, 4));
      } else {
        setMatches(filteredProfiles);
      }
    }

    // Reset votes for demo mode - start fresh each time
    setMyVotes({});
  };

  const handlePurchaseAccess = async () => {
    if (!user || !eventId) return;

    setPurchasingAccess(true);

    try {
      // Insert into event_circle_access - trigger enforces valid_until (5h), paid_amount_rsd (200), access_type
      const { error } = await supabase
        .from('event_circle_access')
        .insert({ 
          user_id: user.id, 
          event_id: eventId,
          valid_until: new Date().toISOString() // Placeholder - trigger overwrites to now() + 5h
        });

      if (error) {
        if (error.code === '23505') {
          // Duplicate entry - user already has access, refresh status
          await loadEventAndCheckAccess();
        } else {
          throw error;
        }
      } else {
        toast({
          title: '🎉 Access Unlocked!',
          description: 'You have 5 hours to swipe in this event circle.',
        });

        // Refresh access status
        await loadEventAndCheckAccess();
      }
    } catch (error) {
      console.error('Error purchasing access:', error);
      toast({
        title: 'Error',
        description: 'Failed to unlock access. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPurchasingAccess(false);
    }
  };

  const handleVote = async (vote: 'yes' | 'no') => {
    if (!user || !selectedSession) return;

    const unvotedProfiles = profiles.filter(p => !myVotes[p.user_id]);
    const currentProfile = unvotedProfiles[0];
    
    if (!currentProfile) return;

    // Update local votes (demo mode - no database save)
    setMyVotes(prev => ({ ...prev, [currentProfile.user_id]: vote }));

    // Show match notification for first 4 "yes" votes if not already in matches
    if (vote === 'yes' && !matches.find(m => m.user_id === currentProfile.user_id)) {
      setCurrentMatch(currentProfile);
      setShowMatchNotification(true);
    }
  };

  const calculateSpicyLikelihoodScore = (profile: any): number => {
    let score = 0;

    // Recent activity (last 10 minutes)
    if (profile.last_circle_activity) {
      const timeDiff = Date.now() - new Date(profile.last_circle_activity).getTime();
      if (timeDiff < 10 * 60 * 1000) score += 20;
    }

    // Swipe velocity
    if (profile.circle_swipe_velocity > 10) score += 15;
    else if (profile.circle_swipe_velocity > 5) score += 10;

    // Time of night boost (2:30 AM - 7:00 AM)
    const hour = new Date().getHours();
    if ((hour >= 2 && hour < 7) || hour === 2) score += 25;

    // Overall Circle energy (if they have matches)
    if (matches.length > 2) score += 15;

    // Base engagement score
    score += 25;

    return Math.min(100, score);
  };

  const handleSpicyModePurchase = async () => {
    if (!user || !selectedSession) return;

    setPurchasingSpicy(true);

    try {
      // Create spicy mode purchase record
      const { error: purchaseError } = await supabase
        .from('spicy_mode_purchases')
        .insert({
          user_id: user.id,
          circle_session_id: selectedSession.id,
          amount_paid: 8.88,
          expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
        });

      if (purchaseError) throw purchaseError;

      // Update user's last activity
      await supabase
        .from('profiles')
        .update({ last_circle_activity: new Date().toISOString() })
        .eq('user_id', user.id);

      setShowSpicyMode(false);
      setShowSpicyConfirmation(true);

      // Trigger spicy prompts for eligible users
      await triggerSpicyPrompts();

      toast({
        title: '🔥 Spicy Mode Activated',
        description: 'Your visibility is boosted for the next 12 hours!',
      });
    } catch (error) {
      console.error('Error purchasing spicy mode:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate Spicy Mode. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPurchasingSpicy(false);
    }
  };

  const triggerSpicyPrompts = async () => {
    if (!user || !selectedSession) return;

    try {
      // Get all profiles in session with their scores
      const eligibleProfiles = profiles
        .filter(p => {
          const score = calculateSpicyLikelihoodScore(p);
          return score >= 55;
        })
        .slice(0, 20); // Max 20 prompts

      // Create spicy prompt records
      const prompts = eligibleProfiles.map(profile => ({
        user_id: profile.user_id,
        circle_session_id: selectedSession.id,
        triggered_by_user_id: user.id,
        spicy_likelihood_score: calculateSpicyLikelihoodScore(profile),
        response: 'pending'
      }));

      if (prompts.length > 0) {
        await supabase
          .from('spicy_prompts')
          .insert(prompts);
      }
    } catch (error) {
      console.error('Error triggering spicy prompts:', error);
    }
  };

  const handleSpicyPromptResponse = async (response: 'yes' | 'no') => {
    if (!user || !selectedSession) return;

    try {
      // Update the prompt response
      await supabase
        .from('spicy_prompts')
        .update({
          response,
          responded_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('circle_session_id', selectedSession.id)
        .eq('response', 'pending');

      if (response === 'yes') {
        // Set spicy state for 4 hours
        await supabase
          .from('profiles')
          .update({
            spicy_state: true,
            spicy_state_expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
          })
          .eq('user_id', user.id);

        toast({
          title: '🔥 You\'re feeling spicy!',
          description: 'Your energy is visible to others for the next 4 hours.',
        });
      }
    } catch (error) {
      console.error('Error responding to spicy prompt:', error);
    }
  };

  // Check for pending spicy prompts
  useEffect(() => {
    const checkSpicyPrompts = async () => {
      if (!user || !selectedSession) return;

      const { data: pendingPrompts } = await supabase
        .from('spicy_prompts')
        .select('*')
        .eq('user_id', user.id)
        .eq('circle_session_id', selectedSession.id)
        .eq('response', 'pending')
        .limit(1);

      if (pendingPrompts && pendingPrompts.length > 0) {
        // Show prompt after a short delay
        setTimeout(() => setShowSpicyPrompt(true), 2000);
      }
    };

    checkSpicyPrompts();
  }, [user, selectedSession]);

  const timeLeft = () => {
    if (!selectedSession) return 0;
    const now = new Date();
    const endTime = new Date(selectedSession.ends_at);
    const diff = endTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return Math.max(0, hours);
  };

  const formatPaidValidUntil = () => {
    if (!paidValidUntil) return '';
    try {
      return format(new Date(paidValidUntil), 'HH:mm');
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background safe-top flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Paywall UI for event mode
  if (showPaywall && isEventMode) {
    return (
      <div className="min-h-screen bg-background safe-top pb-28">
        <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4 max-w-2xl mx-auto">
          {/* Event Header */}
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-gradient-primary">
              {eventTitle} Circle
            </h1>
            {isEventLive !== null && (
              <Badge variant={isEventLive ? "default" : "secondary"} className={isEventLive ? "bg-green-500 text-white animate-pulse" : ""}>
                {isEventLive ? "LIVE" : "AFTER"}
              </Badge>
            )}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            Swipe people who are at this event
          </p>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
          <Card className="glass-card p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Unlock Circle Swipe</h2>
            <p className="text-muted-foreground mb-6">
              Get access to swipe and match with people at this event
            </p>

            <div className="glass-card p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Price</span>
                <span className="text-2xl font-bold">200 RSD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-semibold">5 hours</span>
              </div>
            </div>

            <Button
              onClick={handlePurchaseAccess}
              disabled={purchasingAccess}
              className="w-full gradient-primary text-lg py-6"
            >
              {purchasingAccess ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Pay Now - 200 RSD
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              Or buy a ticket to get permanent access to this event's Circle
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (!selectedSession) {
    return (
      <div className="min-h-screen bg-background safe-top">
        <div className="px-4 pt-6">
          <h1 className="text-2xl font-bold text-gradient-primary mb-2">Circle Swipe</h1>
          <Card className="glass-card p-8 text-center mt-8">
            <PartyPopper className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Sessions</h3>
            <p className="text-muted-foreground">
              Circle Swipe sessions are created automatically after events end. Attend an event to unlock matching!
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Filter out already voted profiles
  const unvotedProfiles = profiles.filter(p => !myVotes[p.user_id]);
  const currentProfileToShow = unvotedProfiles[0];

  return (
    <div className="min-h-screen bg-background safe-top pb-28">
      {/* Mode Switcher */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 max-w-2xl mx-auto">
        <div className="flex gap-2 p-1 glass-card rounded-lg mb-4">
          <Button
            variant={!isEventMode ? "default" : "ghost"}
            size="sm"
            className={`flex-1 ${!isEventMode ? 'gradient-primary' : ''}`}
            onClick={() => handleModeSwitch('global')}
          >
            <Globe className="w-4 h-4 mr-2" />
            Global
          </Button>
          <Button
            variant={isEventMode ? "default" : "ghost"}
            size="sm"
            className={`flex-1 ${isEventMode ? 'gradient-primary' : ''}`}
            onClick={() => handleModeSwitch('event')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Event
          </Button>
        </div>

        {/* Event Picker */}
        {showEventPicker && !isEventMode && (
          <div className="mb-4 space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Select an event:</p>
            {eventsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : availableEvents.length === 0 ? (
              <Card className="glass-card p-4 text-center">
                <p className="text-muted-foreground text-sm">No upcoming events found</p>
              </Card>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="glass-card p-3 cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => handleEventSelect(event.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.date), 'MMM d')} • {event.start_time.slice(0, 5)}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Change Event Button (when in event mode) */}
        {isEventMode && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mb-4"
            onClick={() => {
              setShowEventPicker(!showEventPicker);
              if (availableEvents.length === 0) loadAvailableEvents();
            }}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {showEventPicker ? 'Hide Events' : 'Change Event'}
          </Button>
        )}

        {/* Event Picker for event mode */}
        {showEventPicker && isEventMode && (
          <div className="mb-4 space-y-2">
            {eventsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableEvents.map((event) => (
                  <Card
                    key={event.id}
                    className={`glass-card p-3 cursor-pointer hover:bg-primary/10 transition-colors ${event.id === eventId ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleEventSelect(event.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.date), 'MMM d')} • {event.start_time.slice(0, 5)}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 pb-3 sm:pb-4 flex items-center justify-between max-w-2xl mx-auto">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-gradient-primary">
              {isEventMode ? `${eventTitle} Circle` : 'Global Circle'}
            </h1>
            {isEventMode && isEventLive !== null && (
              <Badge variant={isEventLive ? "default" : "secondary"} className={isEventLive ? "bg-green-500 text-white animate-pulse" : ""}>
                {isEventLive ? "LIVE" : "AFTER"}
              </Badge>
            )}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isEventMode ? 'Swipe people at this event' : 'Swipe people outside events'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMatches(true)}
          className="relative"
        >
          <Users className="w-5 h-5" />
          {matches.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
              {matches.length}
            </span>
          )}
        </Button>
      </div>

      {/* Access Info Banner */}
      {isEventMode && hasAccess && (
        <div className="px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto mb-2">
          <div className="glass-card px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm">
            {accessType === 'ticket' ? (
              <>
                <Ticket className="w-4 h-4 text-primary" />
                <span className="font-medium">Access: Ticket</span>
              </>
            ) : accessType === 'paid' ? (
              <>
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">Access: Paid — expires at {formatPaidValidUntil()}</span>
              </>
            ) : null}
          </div>
        </div>
      )}

      {!isEventMode && (
        <div className="px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto mb-2">
          <div className="glass-card px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm">
            <Globe className="w-4 h-4 text-primary" />
            <span className="font-medium">Global Mode — No event required</span>
          </div>
        </div>
      )}

      <div className="text-center mb-4 space-y-2">
        <Badge variant="secondary" className="glass-card text-sm sm:text-base">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
          {timeLeft()} hours left
        </Badge>
        
        <div className="flex flex-col items-center gap-2">
          <Button
            onClick={() => setShowSpicyMode(true)}
            className="gradient-primary"
            size="sm"
          >
            <Flame className="w-4 h-4 mr-2" />
            Spicy Mode €8.88
          </Button>
          
          {hasActiveSpicyMode && (
            <Button
              onClick={() => setShowSpicyOnly(!showSpicyOnly)}
              variant={showSpicyOnly ? "default" : "outline"}
              size="sm"
              className={showSpicyOnly ? "gradient-primary" : ""}
            >
              <Flame className="w-4 h-4 mr-2" />
              {showSpicyOnly ? "Show All Users" : "🔥 Show Spicy Users Only"}
            </Button>
          )}
          
          {!hasActiveSpicyMode && (
            <Button
              onClick={() => {
                toast({
                  title: "Unlock Spicy Mode",
                  description: "Activate Spicy Mode to see tonight's hottest energy — €8.88",
                  variant: "default",
                });
                setShowSpicyMode(true);
              }}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Flame className="w-4 h-4 mr-2" />
              🔥 Show Spicy Users Only
            </Button>
          )}
        </div>
      </div>

      {/* Swipe Area */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative max-w-2xl mx-auto">
        <div className="relative min-h-[550px] sm:min-h-[600px] md:min-h-[650px]">
          {currentProfileToShow ? (
            <CircleSwipeCard
              key={currentProfileToShow.user_id}
              profile={currentProfileToShow}
              onVote={handleVote}
              eventName={selectedSession.events?.title}
              averageRating={profileReviews[currentProfileToShow.user_id]?.rating}
              reviewCount={profileReviews[currentProfileToShow.user_id]?.count}
              showSpicyIndicator={hasActiveSpicyMode}
            />
          ) : (
            <Card className="glass-card p-8 text-center h-full flex flex-col items-center justify-center">
              <Sparkles className="w-16 h-16 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">All Done!</h3>
              <p className="text-muted-foreground mb-4">
                You've voted on everyone in this session. Check your matches!
              </p>
              <Button onClick={() => setShowMatches(true)} className="gradient-primary">
                <Users className="w-4 h-4 mr-2" />
                View Matches ({matches.length})
              </Button>
            </Card>
          )}
        </div>

        {/* Progress */}
        {profiles.length > 0 && (
          <div className="mt-6 text-center text-sm sm:text-base text-muted-foreground font-medium">
            {Object.keys(myVotes).length} / {profiles.length} voted
          </div>
        )}
      </div>

      {/* Match Notification */}
      <MatchNotificationModal
        open={showMatchNotification}
        onOpenChange={setShowMatchNotification}
        matchedProfile={currentMatch}
      />

      {/* Matches Modal */}
      <MatchesModal
        open={showMatches}
        onOpenChange={setShowMatches}
        matches={matches}
      />

      {/* Spicy Mode Modals */}
      <SpicyModeModal
        open={showSpicyMode}
        onOpenChange={setShowSpicyMode}
        onConfirm={handleSpicyModePurchase}
        loading={purchasingSpicy}
      />

      <SpicyConfirmationModal
        open={showSpicyConfirmation}
        onOpenChange={setShowSpicyConfirmation}
      />

      <SpicyPromptModal
        open={showSpicyPrompt}
        onOpenChange={setShowSpicyPrompt}
        onResponse={handleSpicyPromptResponse}
      />
    </div>
  );
};

export default CircleSwipe;
