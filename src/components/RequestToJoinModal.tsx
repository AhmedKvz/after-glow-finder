import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface RequestToJoinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
}

export const RequestToJoinModal = ({ open, onOpenChange, event }: RequestToJoinModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not logged in",
        description: "Please log in to request access"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('event_access')
        .insert({
          event_id: event.id,
          user_id: user.id,
          status: 'requested',
          message: message.trim() || null
        });

      if (error) {
        // If already exists (unique constraint), update instead
        if (error.code === '23505') {
          const { error: updateError } = await supabase
            .from('event_access')
            .update({ 
              status: 'requested',
              message: message.trim() || null,
              updated_at: new Date().toISOString()
            })
            .eq('event_id', event.id)
            .eq('user_id', user.id);

          if (updateError) throw updateError;
        } else {
          throw error;
        }
      }

      toast({
        title: 'Request sent!',
        description: 'The host will review your request soon.',
      });

      onOpenChange(false);
      setMessage('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to send request',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Request to Join
          </DialogTitle>
          <DialogDescription>
            Send a request to join this private event. The host will review and respond to your request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message to Host (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Tell the host why you'd like to join..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="glass-card"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 gradient-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
