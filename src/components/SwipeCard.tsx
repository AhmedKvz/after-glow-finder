import { useState } from 'react';
import { Heart, X, MapPin, Calendar, Music } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SwipeCardProps {
  participant: {
    id: string;
    name: string;
    avatar?: string;
    age: number;
    city: string;
    bio: string;
    interests: string[];
    mutualEvents: string[];
  };
  onSwipe: (direction: 'left' | 'right') => void;
  progress: number;
}

export const SwipeCard = ({ participant, onSwipe, progress }: SwipeCardProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleSwipe = (direction: 'left' | 'right') => {
    setIsAnimating(true);
    setTimeout(() => {
      onSwipe(direction);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="space-y-4">
      <Progress value={progress} className="w-full" />
      
      <Card className={`glass-card overflow-hidden transition-all duration-300 ${
        isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
      }`}>
        <div className="relative h-80 bg-gradient-to-br from-primary/20 to-accent/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <Avatar className="w-32 h-32 border-4 border-white/20">
              <AvatarImage src={participant.avatar} />
              <AvatarFallback className="text-2xl font-bold gradient-primary text-white">
                {participant.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold">{participant.name}</h2>
            <p className="text-muted-foreground">{participant.age} • {participant.city}</p>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4 text-center">
            {participant.bio}
          </p>
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Music Interests</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {participant.interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="glass-card text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Mutual Events</span>
              </div>
              <div className="space-y-1">
                {participant.mutualEvents.map((event) => (
                  <div key={event} className="text-xs text-muted-foreground">
                    • {event}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-4 justify-center">
        <Button
          size="lg"
          variant="outline"
          className="w-16 h-16 rounded-full glass-card border-destructive/50 hover:bg-destructive/10"
          onClick={() => handleSwipe('left')}
          disabled={isAnimating}
        >
          <X className="w-6 h-6 text-destructive" />
        </Button>
        
        <Button
          size="lg"
          className="w-16 h-16 rounded-full gradient-primary shadow-primary"
          onClick={() => handleSwipe('right')}
          disabled={isAnimating}
        >
          <Heart className="w-6 h-6 text-white" />
        </Button>
      </div>
    </div>
  );
};