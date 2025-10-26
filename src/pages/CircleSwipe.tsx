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

    const { data, error } = await supabase
      .from('circle_swipe_sessions')
      .select('*, events(*)')
      .contains('participant_ids', [user.id])
      .gte('ends_at', new Date().toISOString())
      .order('starts_at', { ascending: false });

    if (data && data.length > 0) {
      setSessions(data);
      setSelectedSession(data[0]);
    }
    setLoading(false);
  };

  const loadSessionData = async () => {
    if (!selectedSession || !user) return;

    // Get current user's profile to filter by opposite gender
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('gender')
      .eq('user_id', user.id)
      .single();

    // Load other participants' profiles
    const otherParticipants = selectedSession.participant_ids.filter(
      (id: string) => id !== user.id
    );

    let query = supabase
      .from('profiles')
      .select('*')
      .in('user_id', otherParticipants);

    // Filter by opposite gender if user has gender set
    if (myProfile?.gender) {
      const oppositeGender = myProfile.gender === 'male' ? 'female' : 'male';
      query = query.eq('gender', oppositeGender);
    }

    const { data: profilesData } = await query;

    if (profilesData) {
      setProfiles(profilesData);
    }

    // Load my votes
    const { data: votesData } = await supabase
      .from('circle_swipe_votes')
      .select('*')
      .eq('session_id', selectedSession.id)
      .eq('swiper_id', user.id);

    if (votesData) {
      const votesMap = votesData.reduce((acc, vote) => {
        acc[vote.target_id] = vote.vote;
        return acc;
      }, {} as Record<string, string>);
      setMyVotes(votesMap);
    }

    // Load matches
    const { data: matchesData } = await supabase
      .from('circle_swipe_matches')
      .select('*')
      .eq('session_id', selectedSession.id)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (matchesData) {
      // Load profiles for matched users
      const matchedUserIds = matchesData.map(m => 
        m.user1_id === user.id ? m.user2_id : m.user1_id
      );
      
      const { data: matchedProfiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', matchedUserIds);

      if (matchedProfiles) {
        setMatches(matchedProfiles);
      }
    }
  };

  const handleVote = async (vote: 'yes' | 'no') => {
    if (!user || !selectedSession) return;

    const unvotedProfiles = profiles.filter(p => !myVotes[p.user_id]);
    const currentProfile = unvotedProfiles[0];
    
    if (!currentProfile) return;

    // Save vote
    const { error } = await supabase
      .from('circle_swipe_votes')
      .insert({
        session_id: selectedSession.id,
        swiper_id: user.id,
        target_id: currentProfile.user_id,
        vote: vote === 'yes' ? 'like' : 'pass'
      });

    if (error) {
      console.error('Vote error:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to save vote',
        description: error.message
      });
      return;
    }

    // Update local votes
    setMyVotes(prev => ({ ...prev, [currentProfile.user_id]: vote }));

    // Check for match if vote is yes
    if (vote === 'yes') {
      const { data: theirVote } = await supabase
        .from('circle_swipe_votes')
        .select('*')
        .eq('session_id', selectedSession.id)
        .eq('swiper_id', currentProfile.user_id)
        .eq('target_id', user.id)
        .eq('vote', 'like')
        .maybeSingle();

      if (theirVote) {
        // It's a match!
        // Create match record
        await supabase
          .from('circle_swipe_matches')
          .insert({
            session_id: selectedSession.id,
            user1_id: user.id,
            user2_id: currentProfile.user_id
          });

        // Show instant match notification
        setCurrentMatch(currentProfile);
        setShowMatchNotification(true);
        
        loadSessionData();
      }
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
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient-primary">Circle Swipe</h1>
          <p className="text-sm text-muted-foreground">
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
        <Badge variant="secondary" className="glass-card">
          <Clock className="w-4 h-4 mr-1" />
          {timeLeft()} hours left
        </Badge>
      </div>

      {/* Swipe Area */}
      <div className="px-4 py-6 relative">
        <div className="relative min-h-[600px]">
          {currentProfileToShow ? (
            <CircleSwipeCard
              key={currentProfileToShow.user_id}
              profile={currentProfileToShow}
              onVote={handleVote}
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
          <div className="mt-6 text-center text-sm text-muted-foreground">
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
