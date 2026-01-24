import { useState, useEffect } from 'react';
import { X, Heart, ChevronUp, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'discover_swipe_hint_seen';

export function SwipeHintBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(STORAGE_KEY);
    if (!hasSeen) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="glass-card rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <span>Swipe to sort your night:</span>
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-emerald-400" /> save
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <X className="w-3.5 h-3.5 text-destructive" /> skip
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ChevronUp className="w-3.5 h-3.5 text-primary" /> request (private)
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
          onClick={handleDismiss}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
        <Ticket className="w-3 h-3" />
        <span>Tickets are available in card actions.</span>
      </div>
    </div>
  );
}
