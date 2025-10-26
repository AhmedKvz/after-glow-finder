import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const StarRating = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange
}: StarRatingProps) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => handleClick(value)}
          disabled={!interactive}
          className={cn(
            interactive && 'cursor-pointer hover:scale-110 transition-transform',
            !interactive && 'cursor-default'
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              value <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-muted text-muted'
            )}
          />
        </button>
      ))}
    </div>
  );
};
