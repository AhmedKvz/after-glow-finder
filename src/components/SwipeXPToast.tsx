import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Heart, X } from 'lucide-react';

interface SwipeXPToastProps {
  visible: boolean;
  type: 'like' | 'skip' | 'request';
  xp: number;
  message: string;
}

export const SwipeXPToast = ({ visible, type, xp, message }: SwipeXPToastProps) => {
  const getIcon = () => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-emerald-300 fill-emerald-300" />;
      case 'skip':
        return <X className="w-5 h-5 text-red-300" />;
      case 'request':
        return <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'like':
        return 'bg-emerald-600/20 border-emerald-600/40';
      case 'skip':
        return 'bg-red-600/20 border-red-600/40';
      case 'request':
        return 'bg-yellow-600/20 border-yellow-600/40';
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
        >
          <div className={`glass-card px-6 py-4 rounded-2xl border-2 ${getBgColor()} backdrop-blur-xl shadow-2xl`}>
            <div className="flex items-center gap-3">
              {getIcon()}
              <div>
                <div className="text-white font-bold text-lg">
                  {xp > 0 && (
                    <span className="text-primary">+{xp} XP</span>
                  )}
                  {xp > 0 && message && <span className="mx-2">•</span>}
                  {message && <span>{message}</span>}
                </div>
              </div>
            </div>
            
            {/* Confetti effect for likes */}
            {type === 'like' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 0.6 }}
                className="absolute -top-2 -right-2"
              >
                <Zap className="w-6 h-6 text-primary fill-primary" />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};