import { Ticket, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiscoverPurposeHeaderProps {
  eventCount: number;
  onBrowseTickets: () => void;
  onBuildNightPlan: () => void;
}

export function DiscoverPurposeHeader({
  eventCount,
  onBrowseTickets,
  onBuildNightPlan,
}: DiscoverPurposeHeaderProps) {
  return (
    <div className="space-y-3 mb-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Find tickets & the best spots tonight
        </h1>
        <p className="text-sm text-muted-foreground">
          Belgrade • {eventCount} picks for your vibe
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={onBrowseTickets}
          className="gradient-primary flex-1 h-10"
        >
          <Ticket className="w-4 h-4 mr-2" />
          Browse Tickets
        </Button>
        <Button
          onClick={onBuildNightPlan}
          variant="outline"
          className="glass-card flex-1 h-10"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Build My Night Plan
        </Button>
      </div>
    </div>
  );
}
