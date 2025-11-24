import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AttendeeProfilePreview } from './AttendeeProfilePreview';

interface AfterRequest {
  id: string;
  event_id: string;
  requester_user_id: string;
  status: string;
  created_at: string;
  events: {
    title: string;
  };
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface PrivateAfterRequestsProps {
  hostId: string;
}

export const PrivateAfterRequests = ({ hostId }: PrivateAfterRequestsProps) => {
  const [requests, setRequests] = useState<AfterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRequests();
  }, [hostId]);

  const loadRequests = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('after_access_requests')
      .select(`
        *,
        events!inner(title, host_id),
        profiles(display_name, avatar_url)
      `)
      .eq('events.host_id', hostId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading after requests:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load requests',
        description: error.message,
      });
    } else if (data) {
      setRequests(data as any);
    }

    setLoading(false);
  };

  const handleUpdateRequest = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('after_access_requests')
      .update({
        status: newStatus,
        decision_at: new Date().toISOString(),
        decision_by_user_id: hostId,
      })
      .eq('id', requestId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to update request',
        description: error.message,
      });
      return;
    }

    toast({
      title: newStatus === 'approved' ? 'Request approved!' : 'Request rejected',
      description: newStatus === 'approved'
        ? 'User can now see the full after details'
        : 'User has been notified',
    });

    loadRequests();
  };

  const handleViewProfile = (userId: string) => {
    setSelectedUserId(userId);
    setShowProfilePreview(true);
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading requests...
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No private after requests yet
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {requests.map((request) => (
          <Card key={request.id} className="glass-card p-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={request.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {request.profiles?.display_name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <button
                    onClick={() => handleViewProfile(request.requester_user_id)}
                    className="font-medium text-primary hover:underline text-left"
                  >
                    {request.profiles?.display_name || 'Anonymous'}
                  </button>
                  <Badge
                    variant={
                      request.status === 'approved'
                        ? 'default'
                        : request.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {request.status}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-1">
                  {request.events?.title}
                </p>

                <p className="text-xs text-muted-foreground">
                  {new Date(request.created_at).toLocaleString()}
                </p>
              </div>

              {request.status === 'pending' && (
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewProfile(request.requester_user_id)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-emerald-600/20 text-emerald-300 border-emerald-600/40 hover:bg-emerald-600/30"
                    onClick={() => handleUpdateRequest(request.id, 'approved')}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-red-600/20 text-red-300 border-red-600/40 hover:bg-red-600/30"
                    onClick={() => handleUpdateRequest(request.id, 'rejected')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {selectedUserId && (
        <AttendeeProfilePreview
          open={showProfilePreview}
          onOpenChange={setShowProfilePreview}
          userId={selectedUserId}
        />
      )}
    </>
  );
};