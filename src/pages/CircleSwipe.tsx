import { useState, useEffect } from 'react';
import { Heart, X, Sparkles, Users, Loader2, PartyPopper, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircleSwipeCard } from '@/components/CircleSwipeCard';
import { MatchesModal } from '@/components/MatchesModal';
import { MatchNotificationModal } from '@/components/MatchNotificationModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CircleSwipe = () => {
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

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  useEffect(() => {
    if (selectedSession) {
      loadSessionData();
    }
  }, [selectedSession]);

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

    // Get current user's profile to filter by opposite gender
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('gender')
      .eq('user_id', user.id)
      .maybeSingle();

    // Load profiles from all users (excluding current user)
    let query = supabase
      .from('profiles')
      .select('*')
      .neq('user_id', user.id)
      .not('gender', 'is', null)
      .limit(10);

    // Filter by opposite gender if user has gender set
    if (myProfile?.gender) {
      const oppositeGender = myProfile.gender === 'male' ? 'female' : 'male';
      query = query.eq('gender', oppositeGender);
    }

    const { data: profilesData } = await query;

    if (profilesData) {
      setProfiles(profilesData);

      // Load reviews for all profiles
      const userIds = profilesData.map(p => p.user_id);
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
    }

    // Reset votes for demo mode - start fresh each time
    setMyVotes({});

    // Auto-create 4 matches for demo mode
    if (profilesData && profilesData.length >= 4) {
      const demoMatches = profilesData.slice(0, 4);
      setMatches(demoMatches);
    } else if (profilesData) {
      setMatches(profilesData);
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

  const timeLeft = () => {
    if (!selectedSession) return 0;
    const now = new Date();
    const endTime = new Date(selectedSession.ends_at);
    const diff = endTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return Math.max(0, hours);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background safe-top flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4 flex items-center justify-between max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-gradient-primary">Circle Swipe</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {selectedSession.events?.title}
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

      <div className="text-center mb-4">
        <Badge variant="secondary" className="glass-card text-sm sm:text-base">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
          {timeLeft()} hours left
        </Badge>
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
    </div>
  );
};

export default CircleSwipe;
