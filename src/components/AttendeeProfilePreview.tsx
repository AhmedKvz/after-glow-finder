import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Star, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AttendeeProfilePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

interface UserProfile {
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
}

interface UserReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  event_id: string;
}

export const AttendeeProfilePreview = ({ open, onOpenChange, userId }: AttendeeProfilePreviewProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && userId) {
      loadUserProfile();
    }
  }, [open, userId]);

  const loadUserProfile = async () => {
    setLoading(true);

    // Load profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, bio, city')
      .eq('user_id', userId)
      .single();

    if (profileData) setProfile(profileData);

    // Count reviews written by this user
    const { count } = await supabase
      .from('event_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    setReviewCount(count || 0);

    // Load last 5 reviews written by this user
    const { data: reviewsData } = await supabase
      .from('event_reviews')
      .select('id, rating, comment, created_at, event_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (reviewsData) setReviews(reviewsData);

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Attendee Profile</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-4">
            {/* Profile Header */}
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>
                  {profile?.display_name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {profile?.display_name || 'Anonymous'}
                </h3>
                {profile?.city && (
                  <p className="text-sm text-muted-foreground">{profile.city}</p>
                )}
                <Badge variant="secondary" className="mt-2">
                  {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'} Written
                </Badge>
              </div>
            </div>

            {/* Bio */}
            {profile?.bio && (
              <Card className="glass-card p-3">
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              </Card>
            )}

            {/* Reviews Section */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Recent Reviews
              </h4>

              {reviews.length === 0 ? (
                <Card className="glass-card p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    No reviews yet
                  </p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {reviews.map((review) => (
                    <Card key={review.id} className="glass-card p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating
                                  ? 'fill-accent text-accent'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {review.comment}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Review requirement info */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <p className="text-xs text-primary/80">
                This user has written {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}, 
                meeting the minimum requirement to request access to private afters.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};