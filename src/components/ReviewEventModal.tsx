import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRating } from '@/components/StarRating';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
  existingReview?: any;
  onSuccess?: () => void;
}

export const ReviewEventModal = ({
  open,
  onOpenChange,
  event,
  existingReview,
  onSuccess
}: ReviewEventModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        variant: 'destructive',
        title: 'Rating required',
        description: 'Please select a rating before submitting.'
      });
      return;
    }

    setLoading(true);

    try {
      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('event_reviews')
          .update({
            rating,
            comment: comment.trim() || null
          })
          .eq('id', existingReview.id);

        if (error) throw error;

        toast({
          title: 'Review updated!',
          description: 'Your review has been updated successfully.'
        });
      } else {
        // Create new review
        const { error } = await supabase
          .from('event_reviews')
          .insert({
            event_id: event.id,
            user_id: user?.id,
            rating,
            comment: comment.trim() || null
          });

        if (error) throw error;

        toast({
          title: 'Review submitted!',
          description: 'Thank you for your feedback.'
        });
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to submit review',
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle>
            {existingReview ? 'Edit Review' : 'Review Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{event.title}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(event.date).toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Your Rating *</Label>
            <div className="flex items-center gap-3">
              <StarRating
                rating={rating}
                size="lg"
                interactive
                onRatingChange={setRating}
              />
              <span className="text-sm text-muted-foreground">
                {rating > 0 ? `${rating} / 5` : 'Select rating'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 gradient-primary"
            >
              {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
