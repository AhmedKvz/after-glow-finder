import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { StarRating } from '@/components/StarRating';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MessageSquare } from 'lucide-react';

interface ReviewsListProps {
  eventId?: string;
  userId?: string;
}

export const ReviewsList = ({ eventId, userId }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [eventId, userId]);

  const loadReviews = async () => {
    setLoading(true);

    if (eventId) {
      // Load event reviews
      const { data, error } = await supabase
        .from('event_reviews')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (data) {
        setReviews(data);
        
        // Load profiles for reviewers
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', userIds);

        if (profileData) {
          const profileMap = profileData.reduce((acc, profile) => {
            acc[profile.user_id] = profile;
            return acc;
          }, {} as Record<string, any>);
          setProfiles(profileMap);
        }
      }
    } else if (userId) {
      // Load user reviews
      const { data, error } = await supabase
        .from('user_reviews')
        .select('*')
        .eq('reviewed_user_id', userId)
        .order('created_at', { ascending: false });

      if (data) {
        setReviews(data);
        
        // Load profiles for reviewers
        const reviewerIds = [...new Set(data.map(r => r.reviewer_id))];
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', reviewerIds);

        if (profileData) {
          const profileMap = profileData.reduce((acc, profile) => {
            acc[profile.user_id] = profile;
            return acc;
          }, {} as Record<string, any>);
          setProfiles(profileMap);
        }
      }
    }

    setLoading(false);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="glass-card p-8 text-center">
        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No reviews yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Average rating */}
      <Card className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Average Rating</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold">{calculateAverageRating().toFixed(1)}</span>
              <StarRating rating={calculateAverageRating()} size="md" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Reviews</p>
            <p className="text-2xl font-bold">{reviews.length}</p>
          </div>
        </div>
      </Card>

      {/* Individual reviews */}
      <div className="space-y-3">
        {reviews.map((review) => {
          const profile = profiles[eventId ? review.user_id : review.reviewer_id];
          
          return (
            <Card key={review.id} className="glass-card p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {profile?.display_name?.[0]?.toUpperCase() || '?'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">{profile?.display_name || 'Anonymous'}</p>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
