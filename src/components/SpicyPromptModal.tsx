import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface SpicyPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResponse: (response: 'yes' | 'no') => void;
}

export const SpicyPromptModal = ({ open, onOpenChange, onResponse }: SpicyPromptModalProps) => {
  const handleYes = () => {
    onResponse('yes');
    onOpenChange(false);
  };

  const handleNo = () => {
    onResponse('no');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-primary/20 max-w-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 py-4"
        >
          <div className="text-center space-y-4">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="flex justify-center"
            >
              <Flame className="w-20 h-20 text-red-500" />
            </motion.div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Tonight's energy is rising</h3>
              <p className="text-xl font-semibold text-gradient-primary">
                Are you feeling spicy?
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleYes}
              className="w-full gradient-primary text-lg py-6"
            >
              <Flame className="w-5 h-5 mr-2" />
              Yes, I am 🔥
            </Button>
            <Button
              onClick={handleNo}
              variant="ghost"
              className="w-full text-base"
            >
              Not now
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
