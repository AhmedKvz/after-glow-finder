import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HeatBadgeProps {
  heatScore?: number;
  heatBadge?: 'Inferno' | 'Hot' | 'Warm' | 'Starting' | 'New Drop';
  size?: 'sm' | 'md' | 'lg';
}

export const HeatBadge = ({ heatScore = 0, heatBadge, size = 'md' }: HeatBadgeProps) => {
  const badge = heatBadge || getHeatBadge(heatScore);
  const colors = getHeatColors(badge);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <Badge 
      className={`${colors.bg} ${colors.text} ${colors.border} font-bold ${sizeClasses[size]} flex items-center gap-1.5 animate-pulse-subtle`}
      style={{
        boxShadow: colors.glow,
        animation: badge === 'Inferno' ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
      }}
    >
      <Flame className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`} />
      {badge}
      {heatScore > 0 && <span className="ml-1 opacity-90">·{heatScore}</span>}
    </Badge>
  );
};

function getHeatBadge(score: number): 'Inferno' | 'Hot' | 'Warm' | 'Starting' | 'New Drop' {
  if (score >= 90) return 'Inferno';
  if (score >= 70) return 'Hot';
  if (score >= 40) return 'Warm';
  if (score >= 20) return 'Starting';
  return 'New Drop';
}

function getHeatColors(badge: string) {
  switch (badge) {
    case 'Inferno':
      return {
        bg: 'bg-gradient-to-r from-red-600 to-orange-500',
        text: 'text-white',
        border: 'border border-red-400',
        glow: '0 0 20px rgba(239, 68, 68, 0.6)'
      };
    case 'Hot':
      return {
        bg: 'bg-gradient-to-r from-orange-500 to-yellow-500',
        text: 'text-black',
        border: 'border border-yellow-400',
        glow: '0 0 15px rgba(251, 191, 36, 0.5)'
      };
    case 'Warm':
      return {
        bg: 'bg-gradient-to-r from-yellow-400 to-green-400',
        text: 'text-black',
        border: 'border border-green-400',
        glow: '0 0 10px rgba(134, 239, 172, 0.4)'
      };
    case 'Starting':
      return {
        bg: 'bg-gradient-to-r from-blue-500 to-purple-500',
        text: 'text-white',
        border: 'border border-purple-400',
        glow: '0 0 8px rgba(168, 85, 247, 0.3)'
      };
    default: // New Drop
      return {
        bg: 'bg-gradient-to-r from-purple-600 to-pink-500',
        text: 'text-white',
        border: 'border border-pink-400',
        glow: '0 0 8px rgba(236, 72, 153, 0.3)'
      };
  }
}