import { useState, useEffect } from 'react';
import { Heart, X, Users, Clock, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { mockCircleSwipeSession, mockCircleSwipeParticipants } from '@/data/mockData';
import { SwipeCard } from '@/components/SwipeCard';
import { MatchesModal } from '@/components/MatchesModal';
import { useDemoMode } from '@/contexts/DemoModeContext';

const CircleSwipe = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<string[]>([]);
  const [showMatches, setShowMatches] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const { isDemoMode } = useDemoMode();
  
  const session = mockCircleSwipeSession;
  const participants = mockCircleSwipeParticipants;
  
  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      // Add to matches in demo mode
      const currentParticipant = participants[currentIndex];
      setMatches(prev => [...prev, currentParticipant.id]);
    }
    
    if (currentIndex < participants.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Finished swiping, show matches
      setShowMatches(true);
    }
  };

  const handleJoinSession = () => {
    setHasJoined(true);
  };

  const timeLeft = () => {
    const now = new Date();
    const endTime = new Date(session.endsAt);
    const diff = endTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return Math.max(0, hours);
  };

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-background safe-top">
        <div className="px-4 pt-6">
          <h1 className="text-2xl font-bold text-gradient-primary mb-6">
            Circle Swipe
          </h1>
          
          <Card className="glass-card p-6 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-xl font-bold mb-2">Join Circle Swipe</h2>
              <p className="text-muted-foreground mb-4">
                Connect with other attendees from recent events through our matching system
              </p>
              
              <div className="bg-accent/10 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center gap-2 text-accent mb-2">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">{session.participantCount} participants</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-accent">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">{timeLeft()} hours left</span>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mb-6">
                Entry fee: <span className="font-bold text-accent">€3.00</span>
                <br />
                <span className="text-xs">Payment disabled in MVP</span>
              </div>
              
              <Button 
                onClick={handleJoinSession}
                className="w-full gradient-primary"
                size="lg"
              >
                Join Session (Demo)
              </Button>
            </div>
          </Card>
          
          <Card className="glass-card p-4">
            <h3 className="font-semibold mb-3">How it works</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <p>Swipe through other participants from recent events</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <p>Like profiles you're interested in connecting with</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <p>Get matched when both parties like each other</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-top">
      <div className="px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gradient-primary">
            Circle Swipe
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMatches(true)}
            className="glass-card"
          >
            <Heart className="w-4 h-4 mr-2" />
            {matches.length} Matches
          </Button>
        </div>
        
        <div className="text-center mb-6">
          <Badge variant="secondary" className="glass-card">
            <Clock className="w-4 h-4 mr-1" />
            {timeLeft()} hours left
          </Badge>
        </div>

        {currentIndex < participants.length ? (
          <SwipeCard
            participant={participants[currentIndex]}
            onSwipe={handleSwipe}
            progress={((currentIndex + 1) / participants.length) * 100}
          />
        ) : (
          <Card className="glass-card p-8 text-center">
            <Sparkles className="w-16 h-16 text-accent mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">All done!</h2>
            <p className="text-muted-foreground mb-4">
              You've swiped through all participants. Check your matches!
            </p>
            <Button onClick={() => setShowMatches(true)} className="gradient-primary">
              View {matches.length} Matches
            </Button>
          </Card>
        )}
      </div>
      
      <MatchesModal
        open={showMatches}
        onOpenChange={setShowMatches}
        matches={matches}
        participants={participants}
      />
    </div>
  );
};

export default CircleSwipe;