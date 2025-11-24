import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface EntranceNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  emoji: string;
}

export const EntranceNotificationModal = ({
  isOpen,
  onClose,
  message,
  emoji,
}: EntranceNotificationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-primary/20 bg-background/95 backdrop-blur-lg">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col items-center gap-6 p-6"
        >
          {/* Big Emoji */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-7xl"
          >
            {emoji}
          </motion.div>

          {/* Message */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg font-semibold text-center text-foreground"
          >
            {message}
          </motion.p>

          {/* Close Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full"
          >
            <Button
              onClick={onClose}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              Ok, I got you
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
