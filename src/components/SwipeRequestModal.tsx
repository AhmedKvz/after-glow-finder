import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Send } from 'lucide-react';
import eventPoster1 from '@/assets/event-poster-1.jpg';
import eventPoster2 from '@/assets/event-poster-2.jpg';
import eventPoster3 from '@/assets/event-poster-3.jpg';

interface SwipeRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
  onConfirm: () => void;
}

const posterImages = [eventPoster1, eventPoster2, eventPoster3];

export const SwipeRequestModal = ({ open, onOpenChange, event, onConfirm }: SwipeRequestModalProps) => {
  if (!event) return null;

  const posterImage = posterImages[event.id.charCodeAt(0) % posterImages.length];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-yellow-400" />
            Request Access
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Cover */}
          <div className="relative w-full h-48 rounded-lg overflow-hidden">
            <img
              src={posterImage}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <Badge className="absolute top-3 left-3 bg-yellow-600/30 text-yellow-200 border-0 backdrop-blur-sm">
              🗝️ PRIVATE EVENT
            </Badge>
          </div>

          {/* Event Info */}
          <div>
            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>📅 {new Date(event.date).toLocaleDateString()}</p>
              <p>🕐 {event.start_time}</p>
              <p>📍 {event.is_location_hidden ? 'Location revealed after approval' : event.location}</p>
            </div>
          </div>

          {/* Message */}
          <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4">
            <p className="text-sm text-yellow-200">
              🔐 This is a private event. Your request will be reviewed by the host, who will check your profile and reviews before approval.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};