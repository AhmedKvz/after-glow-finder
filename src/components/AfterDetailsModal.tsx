import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, Lock, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface AfterDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    title: string;
    full_address: string | null;
    after_instructions: string | null;
  };
}

export const AfterDetailsModal = ({ open, onOpenChange, event }: AfterDetailsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Private After Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Title */}
          <div>
            <h3 className="text-lg font-semibold mb-1">{event.title}</h3>
            <Badge variant="secondary" className="text-xs">
              ✅ Access Approved
            </Badge>
          </div>

          {/* Full Address */}
          {event.full_address && (
            <Card className="glass-card p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Full Address</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {event.full_address}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* After Instructions */}
          {event.after_instructions && (
            <Card className="glass-card p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Instructions</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {event.after_instructions}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Privacy Warning */}
          <div className="bg-amber-600/10 border border-amber-600/20 rounded-lg p-3">
            <p className="text-xs text-amber-200 flex items-start gap-2">
              <Lock className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>
                Please keep this address private. Do not share it publicly or with unauthorized people.
              </span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};