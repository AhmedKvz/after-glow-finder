import { Ticket, Info, Plus, Map as MapIcon, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TicketActionBarProps {
  event: any;
  onGetTickets: () => void;
  onViewDetails: () => void;
  onAddToPlan: () => void;
  onOpenMap: () => void;
  onRequestAccess: () => void;
}

export function TicketActionBar({
  event,
  onGetTickets,
  onViewDetails,
  onAddToPlan,
  onOpenMap,
  onRequestAccess,
}: TicketActionBarProps) {
  if (!event) return null;

  const eventType = event.event_type;

  if (eventType === 'club') {
    return (
      <div className="flex gap-2 w-full max-w-md mx-auto">
        <Button
          onClick={onGetTickets}
          className="flex-1 gradient-primary h-11"
        >
          <Ticket className="w-4 h-4 mr-2" />
          Get Tickets
        </Button>
        <Button
          onClick={onViewDetails}
          variant="outline"
          className="glass-card h-11"
        >
          <Info className="w-4 h-4 mr-2" />
          Details
        </Button>
      </div>
    );
  }

  if (eventType === 'cafe') {
    return (
      <div className="flex gap-2 w-full max-w-md mx-auto">
        <Button
          onClick={onAddToPlan}
          className="flex-1 gradient-primary h-11"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add to plan
        </Button>
        <Button
          onClick={onOpenMap}
          variant="outline"
          className="glass-card h-11"
        >
          <MapIcon className="w-4 h-4 mr-2" />
          Open map
        </Button>
      </div>
    );
  }

  if (eventType === 'private_host') {
    return (
      <div className="flex gap-2 w-full max-w-md mx-auto">
        <Button
          onClick={onRequestAccess}
          className="flex-1 bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 hover:bg-yellow-600/30 h-11"
        >
          <Key className="w-4 h-4 mr-2" />
          Request access
        </Button>
        <Button
          onClick={onViewDetails}
          variant="outline"
          className="glass-card h-11"
        >
          <Info className="w-4 h-4 mr-2" />
          Details
        </Button>
      </div>
    );
  }

  // Fallback for other event types
  return (
    <div className="flex gap-2 w-full max-w-md mx-auto">
      <Button
        onClick={onViewDetails}
        className="flex-1 gradient-primary h-11"
      >
        <Info className="w-4 h-4 mr-2" />
        View Details
      </Button>
    </div>
  );
}
