import { Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface SecretEventLockOverlayProps {
  requiredLevel: number;
  userLevel?: number;
  previewText?: string;
  className?: string;
}

export const SecretEventLockOverlay = ({ 
  requiredLevel, 
  userLevel = 1, 
  previewText, 
  className = '' 
}: SecretEventLockOverlayProps) => {
  const navigate = useNavigate();
  
  return (
    <div className={`absolute inset-0 bg-gradient-to-b from-purple-900/95 via-black/95 to-black/98 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center ${className}`}>
      <div className="w-32 h-32 rounded-full bg-purple-600/20 backdrop-blur-xl flex items-center justify-center mb-6 border-4 border-purple-400/40 animate-pulse">
        <Lock className="w-16 h-16 text-purple-300" />
      </div>
      
      <Badge className="bg-purple-600/30 text-purple-200 border-purple-400/40 backdrop-blur-sm mb-4 px-4 py-1 text-sm">
        🔮 SECRET EVENT
      </Badge>
      
      <h3 className="text-xl font-bold text-white mb-2">
        Level {requiredLevel} Required
      </h3>
      
      {previewText && (
        <p className="text-purple-200 text-sm mb-6 max-w-md italic">
          "{previewText}"
        </p>
      )}
      
      <p className="text-white/80 text-sm mb-6 max-w-sm">
        Unlock this secret event by reaching <span className="text-purple-300 font-bold">Level {requiredLevel}</span> to request access.
      </p>
      
      <div className="flex gap-2 mb-4">
        <div className="flex items-center gap-1 text-white/60 text-xs">
          <span>Your Level: {userLevel}</span>
        </div>
        <div className="flex items-center gap-1 text-purple-300 text-xs">
          <Zap className="w-3 h-3 fill-current" />
          <span>Need Level {requiredLevel}</span>
        </div>
      </div>
      
      <Button 
        onClick={() => navigate('/gamification')}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/50"
      >
        <Zap className="w-4 h-4 mr-2 fill-current" />
        How to Level Up
      </Button>
    </div>
  );
};