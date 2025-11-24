import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Plus, Trash2, Users, Ticket, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EventManageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
  onSuccess?: () => void;
}

const MUSIC_GENRES = ['techno', 'house', 'rnb', 'minimal', 'psy', 'disco', 'trance', 'drum & bass', 'swing', 'electro swing', 'jazz', 'indie', 'rock', 'alternative'];
const USER_LEVELS = ['New Raver', 'Night Explorer', 'After Enthusiast', 'Secret Host', 'Elite Raver', 'After Legend'];
const VIBE_TAGS = ['Chill', 'Hardcore', 'International crowd', 'Locals only', 'Open minded'];

const eventSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().max(1000).optional(),
  location: z.string().min(3),
  date: z.string().min(1),
  start_time: z.string().min(1),
  end_time: z.string().min(1),
  capacity: z.number().min(1),
});

export const EventManageModal = ({ open, onOpenChange, event, onSuccess }: EventManageModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    location: event?.location || '',
    date: event?.date || '',
    start_time: event?.start_time || '',
    end_time: event?.end_time || '',
    capacity: event?.capacity || 50,
    dj_name: event?.dj_name || '',
    music_tags: event?.music_tags || [],
    bring_own_drinks: event?.bring_own_drinks || false,
    allow_plus_one: event?.allow_plus_one || false,
    allow_plus_two: event?.allow_plus_two || false,
    preferred_levels: event?.preferred_levels || [],
    min_trust_score: event?.min_trust_score || 0,
    vibe_tags: event?.vibe_tags || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event && open) {
      setFormData({
        title: event.title,
        description: event.description || '',
        location: event.location,
        date: event.date,
        start_time: event.start_time,
        end_time: event.end_time,
        capacity: event.capacity,
        dj_name: event.dj_name || '',
        music_tags: event.music_tags || [],
        bring_own_drinks: event.bring_own_drinks || false,
        allow_plus_one: event.allow_plus_one || false,
        allow_plus_two: event.allow_plus_two || false,
        preferred_levels: event.preferred_levels || [],
        min_trust_score: event.min_trust_score || 0,
        vibe_tags: event.vibe_tags || []
      });
      loadEventData();
    }
  }, [event, open]);

  const loadEventData = async () => {
    if (!event?.id) return;

    const { data: ticketData } = await supabase
      .from('tickets')
      .select('*')
      .eq('event_id', event.id);
    
    if (ticketData) setTickets(ticketData);

    const { data: orderData } = await supabase
      .from('event_orders')
      .select('*')
      .eq('event_id', event.id);
    
    if (orderData) setOrders(orderData);

    // Load access requests (primarily used for private events)
    const { data: requestData, error: requestError } = await supabase
      .from('event_access')
      .select('*')
      .eq('event_id', event.id)
      .order('created_at', { ascending: false });

    if (requestError) {
      console.error('[EventManageModal] Error loading access requests:', requestError);
      toast({
        variant: 'destructive',
        title: 'Failed to load join requests',
        description: requestError.message,
      });
    }

    if (requestData) setAccessRequests(requestData);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      eventSchema.parse({
        ...formData,
        capacity: Number(formData.capacity)
      });

      const { error } = await supabase
        .from('events')
        .update({
          title: formData.title,
          description: formData.description || null,
          location: formData.location,
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          capacity: Number(formData.capacity),
          dj_name: formData.dj_name || null,
          music_tags: formData.music_tags,
          bring_own_drinks: formData.bring_own_drinks,
          allow_plus_one: formData.allow_plus_one,
          allow_plus_two: formData.allow_plus_two,
          preferred_levels: formData.preferred_levels,
          min_trust_score: formData.min_trust_score,
          vibe_tags: formData.vibe_tags
        })
        .eq('id', event.id);

      if (error) throw error;

      toast({
        title: "Event updated!",
        description: "Your event has been successfully updated."
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to update event",
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;

      toast({
        title: "Event deleted",
        description: "Your event has been successfully deleted."
      });

      setShowDeleteDialog(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete event",
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const addMusicTag = (tag: string) => {
    if (!formData.music_tags.includes(tag)) {
      setFormData({ ...formData, music_tags: [...formData.music_tags, tag] });
    }
  };

  const removeMusicTag = (tag: string) => {
    setFormData({ 
      ...formData, 
      music_tags: formData.music_tags.filter(t => t !== tag) 
    });
  };

  const handleUpdateRequest = async (requestId: string, newStatus: 'approved' | 'rejected' | 'blocked') => {
    const { error } = await supabase
      .from('event_access')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Failed to update request",
        description: error.message
      });
      return;
    }

    toast({
      title: newStatus === 'approved' ? "Request approved!" : "Request rejected",
      description: newStatus === 'approved' 
        ? "User can now see the event location" 
        : "User has been notified"
    });

    loadEventData(); // Refresh
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Event</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="edit" className="w-full">
            <TabsList className={`grid w-full ${event?.event_type === 'private_host' ? 'grid-cols-4' : 'grid-cols-3'}`}>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="tickets">
                <Ticket className="w-4 h-4 mr-2" />
                Tickets ({tickets.length})
              </TabsTrigger>
              <TabsTrigger value="orders">
                <Users className="w-4 h-4 mr-2" />
                Orders ({orders.length})
              </TabsTrigger>
              {event?.event_type === 'private_host' && (
                <TabsTrigger value="requests">
                  <Users className="w-4 h-4 mr-2" />
                  Requests ({accessRequests.length})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="edit" className="space-y-4">
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    maxLength={140}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    maxLength={1000}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Capacity *</Label>
                    <Input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                      min="1"
                    />
                  </div>
                </div>

                {event?.event_type === 'private_host' && (
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <Label className="text-primary">🎯 Preferred Guests (Leaderboard Filter)</Label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Set preferences to help filter requests - users outside preferences can still request
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Preferred Levels</Label>
                      <div className="flex gap-2 flex-wrap mb-2">
                        {formData.preferred_levels.map((level) => (
                          <Badge key={level} variant="secondary" className="glass-card">
                            {level}
                            <button
                              type="button"
                              onClick={() => setFormData({ 
                                ...formData, 
                                preferred_levels: formData.preferred_levels.filter(l => l !== level) 
                              })}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {USER_LEVELS.filter(l => !formData.preferred_levels.includes(l)).map((level) => (
                          <Button
                            key={level}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData({ 
                              ...formData, 
                              preferred_levels: [...formData.preferred_levels, level] 
                            })}
                            className="text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            {level}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit_min_trust_score">Minimum Trust Score</Label>
                      <Input
                        id="edit_min_trust_score"
                        type="number"
                        value={formData.min_trust_score}
                        onChange={(e) => setFormData({ ...formData, min_trust_score: parseFloat(e.target.value) || 0 })}
                        min="0"
                        max="100"
                        placeholder="0"
                      />
                      <p className="text-xs text-muted-foreground">Set 0 for no minimum</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Vibe Tags</Label>
                      <div className="flex gap-2 flex-wrap mb-2">
                        {formData.vibe_tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="glass-card">
                            {tag}
                            <button
                              type="button"
                              onClick={() => setFormData({ 
                                ...formData, 
                                vibe_tags: formData.vibe_tags.filter(t => t !== tag) 
                              })}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {VIBE_TAGS.filter(t => !formData.vibe_tags.includes(t)).map((tag) => (
                          <Button
                            key={tag}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData({ 
                              ...formData, 
                              vibe_tags: [...formData.vibe_tags, tag] 
                            })}
                            className="text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <div className="flex-1" />
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="gradient-primary">
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="tickets">
              {tickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No tickets sold yet</div>
              ) : (
                <div className="space-y-2">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="glass-card p-3 rounded-lg flex justify-between">
                      <div>
                        <p className="font-mono text-sm">{ticket.ticket_code}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(ticket.purchase_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge>{ticket.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="orders">
              {orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No orders yet</div>
              ) : (
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div key={order.id} className="glass-card p-3 rounded-lg flex justify-between">
                      <div>
                        <p className="text-sm">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge>{order.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {event?.event_type === 'private_host' && (
              <TabsContent value="requests">
                {accessRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No requests yet</div>
                ) : (
                  <div className="space-y-3">
                    {accessRequests.map((request) => (
                      <Card key={request.id} className="glass-card p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>
                              {request.user_id?.slice(0, 2).toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium break-words">Guest {request.user_id?.slice(0, 6) || ''}</p>
                            {request.message && (
                              <p className="text-sm text-muted-foreground mt-1 break-words whitespace-normal">{request.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(request.created_at).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex gap-2 flex-shrink-0">
                            {request.status === 'requested' ? (
                              <>
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
                              </>
                            ) : (
                              <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                                {request.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this event. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};