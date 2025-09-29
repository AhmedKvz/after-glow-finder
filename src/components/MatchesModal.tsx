import { MessageCircle, Heart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

interface MatchesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matches: string[];
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    age: number;
    city: string;
    bio: string;
    interests: string[];
    mutualEvents: string[];
  }>;
}

export const MatchesModal = ({ open, onOpenChange, matches, participants }: MatchesModalProps) => {
  const matchedParticipants = participants.filter(p => matches.includes(p.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Your Matches ({matches.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {matchedParticipants.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No matches yet!</p>
              <p className="text-sm text-muted-foreground">
                Keep swiping to find connections
              </p>
            </div>
          ) : (
            matchedParticipants.map((participant) => (
              <Card key={participant.id} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback className="gradient-primary text-white">
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{participant.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {participant.age} • {participant.city}
                      </p>
                    </div>
                    
                    <Button
                      size="sm"
                      className="gradient-primary"
                      onClick={() => {
                        // In real implementation, this would open chat
                        console.log('Start chat with', participant.name);
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};