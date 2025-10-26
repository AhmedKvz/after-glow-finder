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
  matches: Array<{
    user_id: string;
    display_name?: string;
    avatar_url?: string;
    city?: string;
    bio?: string;
    music_tags?: string[];
  }>;
}

export const MatchesModal = ({ open, onOpenChange, matches }: MatchesModalProps) => {
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
          {matches.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No matches yet!</p>
              <p className="text-sm text-muted-foreground">
                Keep swiping to find connections
              </p>
            </div>
          ) : (
            matches.map((profile) => (
              <Card key={profile.user_id} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback className="gradient-primary text-white">
                        {profile.display_name?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{profile.display_name || 'Anonymous'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {profile.city || 'Belgrade'}
                      </p>
                      {profile.bio && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {profile.bio}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      className="gradient-primary"
                      onClick={() => {
                        // In real implementation, this would open chat
                        console.log('Start chat with', profile.display_name);
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