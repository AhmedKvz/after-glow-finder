import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Flame, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface SpicyConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SpicyConfirmationModal = ({ open, onOpenChange }: SpicyConfirmationModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-primary/20 max-w-sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-6 py-4"
        >
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center relative"
            >
              <Flame className="w-12 h-12 text-red-500" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
              >
                <Check className="w-5 h-5 text-white" />
              </motion.div>
            </motion.div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">🔥 Spicy Mode Activated</h3>
              <p className="text-muted-foreground">
                Your visibility is boosted for tonight.
              </p>
              <p className="text-sm text-muted-foreground">
                Duration: <span className="text-foreground font-semibold">12 hours</span>
              </p>
            </div>
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            className="w-full gradient-primary"
          >
            Let's Go!
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
