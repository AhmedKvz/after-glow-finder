import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';

interface SpicyModeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const SpicyModeModal = ({ open, onOpenChange, onConfirm, loading }: SpicyModeModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-primary/20 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Flame className="w-8 h-8 text-red-500" />
            Spicy Mode
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold">Boost your visibility for tonight</p>
            <p className="text-muted-foreground text-sm">
              Activate Spicy Mode and let others know you're feeling the energy
            </p>
          </div>

          <div className="glass-card p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Duration</span>
              <span className="font-semibold">12 hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="text-2xl font-bold text-gradient-primary">€8.88</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={onConfirm}
              disabled={loading}
              className="w-full gradient-primary text-lg py-6"
            >
              <Flame className="w-5 h-5 mr-2" />
              {loading ? 'Processing...' : 'Activate Spicy Mode'}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              className="w-full"
            >
              Not now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
