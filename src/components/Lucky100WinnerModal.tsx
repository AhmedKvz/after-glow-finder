import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Ticket, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Lucky100WinnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Lucky100WinnerModal = ({ open, onOpenChange }: Lucky100WinnerModalProps) => {
  const handleShare = async () => {
    const shareText = "I just hit the 100th soul on vodimenaafter! 🎉 #GoldenTicket #Lucky100";
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'I hit the 100th soul! 🎉',
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        // User cancelled or error - fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        toast.success("Copied to clipboard!");
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Copied to clipboard!");
    }
  };

  const handleEnter = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/95 backdrop-blur-xl border-amber-500/30 max-w-md p-0 overflow-hidden">
        <div className="relative p-6 pt-8">
          {/* Animated sparkles background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-4 left-8"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ repeat: Infinity, duration: 2, delay: 0 }}
            >
              <Sparkles className="w-6 h-6 text-amber-400" />
            </motion.div>
            <motion.div
              className="absolute top-12 right-12"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </motion.div>
            <motion.div
              className="absolute bottom-24 left-12"
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.4, 0.9, 0.4]
              }}
              transition={{ repeat: Infinity, duration: 1.8, delay: 1 }}
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
            </motion.div>
          </div>

          {/* Main content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative z-10 text-center space-y-6"
          >
            {/* Title */}
            <div className="space-y-2">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="inline-block"
              >
                <span className="text-5xl">🎉</span>
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground">
                You just hit the 100th soul
              </h2>
              <p className="text-muted-foreground">
                Someone always hits it.<br />
                Tonight — it's you.
              </p>
            </div>

            {/* Golden Ticket Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-amber-600/20 via-yellow-500/15 to-orange-500/20 border border-amber-500/40 rounded-xl p-5 space-y-3"
            >
              <div className="flex items-center justify-center gap-2">
                <Ticket className="w-6 h-6 text-amber-400" />
                <span className="text-lg font-semibold text-amber-300">
                  Golden Ticket unlocked
                </span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1.5 text-left pl-4">
                <li className="flex items-center gap-2">
                  <span className="text-amber-400">•</span>
                  Free access to events
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-400">•</span>
                  Limited & rare
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-400">•</span>
                  Yours for 14 days
                </li>
              </ul>
            </motion.div>

            {/* Badge row */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2"
            >
              <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/40 px-3 py-1">
                <span className="mr-1.5">🟣</span>
                Hundredth Soul badge added
              </Badge>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-3 pt-2"
            >
              <Button 
                onClick={handleEnter}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold py-6"
              >
                Enter the night →
              </Button>
              <Button
                variant="ghost"
                onClick={handleShare}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share this moment ✨
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
