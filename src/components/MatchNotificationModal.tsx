import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Sparkles, Music } from 'lucide-react';

interface MatchNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchedProfile: any;
}

export const MatchNotificationModal = ({ 
  open, 
  onOpenChange, 
  matchedProfile 
}: MatchNotificationModalProps) => {
  if (!matchedProfile) return null;

  const handleChat = () => {
    console.log('Start chat with:', matchedProfile.user_id);
    // TODO: Implement chat functionality
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-primary/20">
        {/* Match Header */}
        <div className="text-center py-6">
          <div className="relative inline-block">
            <Sparkles className="w-16 h-16 text-accent animate-pulse mb-4" />
            <div className="absolute -top-2 -right-2 w-8 h-8">
              <div className="w-full h-full rounded-full bg-accent/30 animate-ping" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gradient-primary mb-2">
            It's a Match!
          </h2>
          <p className="text-muted-foreground">
            You and {matchedProfile.display_name} liked each other
          </p>
        </div>

        {/* Profile Card */}
        <Card className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-bold text-white">
                {matchedProfile.display_name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold truncate">
                {matchedProfile.display_name}
              </h3>
              {matchedProfile.city && (
                <p className="text-sm text-muted-foreground">
                  {matchedProfile.city}
                </p>
              )}
            </div>
          </div>

          {matchedProfile.bio && (
            <p className="text-sm">{matchedProfile.bio}</p>
          )}

          {matchedProfile.music_tags && matchedProfile.music_tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Music Taste</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {matchedProfile.music_tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Keep Swiping
          </Button>
          <Button
            onClick={handleChat}
            className="flex-1 gradient-primary"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
