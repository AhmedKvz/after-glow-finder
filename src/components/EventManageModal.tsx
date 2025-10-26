import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { X, Plus, Ticket, Users, Check, XCircle, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

interface EventManageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
  onSuccess?: () => void;
}

const MUSIC_GENRES = ['techno', 'house', 'rnb', 'minimal', 'psy', 'disco', 'trance', 'drum & bass'];

const eventSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().max(1000).optional(),
  location: z.string().min(3),
  date: z.string().min(1),
  start_time: z.string().min(1),
  end_time: z.string().min(1),
  capacity: z.number().min(1),
  dj_name: z.string().max(100).optional(),
  exact_address: z.string().max(500).optional(),
});

export const EventManageModal = ({ open, onOpenChange, event, onSuccess }: EventManageModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  const [formData, setFormData] = useState({
    title: event.title || '',
    description: event.description || '',
    location: event.location || '',
    date: event.date || '',
    start_time: event.start_time || '',
    end_time: event.end_time || '',
    capacity: event.capacity || 50,
    dj_name: event.dj_name || '',
    exact_address: event.exact_address || '',
    music_tags: event.music_tags || [],
    bring_own_drinks: event.bring_own_drinks || false,
    allow_plus_one: event.allow_plus_one || false,
    allow_plus_two: event.allow_plus_two || false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && event) {
      loadEventData();
    }
  }, [open, event]);

  const loadEventData = async () => {
    setLoadingData(true);
    
    // Load tickets
    const { data: ticketsData } = await supabase
      .from('tickets')
      .select('*, profiles(display_name)')
      .eq('event_id', event.id);
    
    if (ticketsData) setTickets(ticketsData);

    // Load orders
    const { data: ordersData } = await supabase
      .from('event_orders')
      .select('*, profiles(display_name)')
      .eq('event_id', event.id)
      .eq('status', 'pending');
    
    if (ordersData) setOrders(ordersData);
    
    setLoadingData(false);
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
          exact_address: formData.exact_address || null,
          music_tags: formData.music_tags,
          bring_own_drinks: formData.bring_own_drinks,
          allow_plus_one: formData.allow_plus_one,
          allow_plus_two: formData.allow_plus_two
        })
        .eq('id', event.id);

      if (error) throw error;

      toast({
        title: "Event updated!",
        description: "Changes have been saved."
      });

      onSuccess?.();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else if (err instanceof Error) {
        toast({
          variant: "destructive",
          title: "Failed to update event",
          description: err.message
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;

      toast({
        title: "Event deleted",
        description: "The event has been removed."
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to delete event",
        description: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  };

  const handleOrderAction = async (orderId: string, status: 'approved' | 'declined') => {
    try {
      const { error } = await supabase
        .from('event_orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: status === 'approved' ? 'Request approved' : 'Request declined',
      });

      loadEventData();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Action failed",
        description: err instanceof Error ? err.message : 'Unknown error'
      });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Event: {event?.title}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="tickets">
              <Ticket className="w-4 h-4 mr-2" />
              Tickets ({tickets.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              <Users className="w-4 h-4 mr-2" />
              Requests ({orders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4 mt-4">
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={errors.location ? 'border-destructive' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dj_name">DJ/Artist</Label>
                  <Input
                    id="dj_name"
                    value={formData.dj_name}
                    onChange={(e) => setFormData({ ...formData, dj_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_time">Start *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label>Music Genres</Label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {formData.music_tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeMusicTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {MUSIC_GENRES.filter(g => !formData.music_tags.includes(g)).map((genre) => (
                    <Button
                      key={genre}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addMusicTag(genre)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {genre}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="mr-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Event
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="gradient-primary"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="tickets" className="mt-4">
            {loadingData ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : tickets.length === 0 ? (
              <Card className="p-8 text-center">
                <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tickets sold yet</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {tickets.map((ticket) => (
                  <Card key={ticket.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {ticket.profiles?.display_name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(ticket.purchase_date).toLocaleDateString()} • 
                          Code: {ticket.ticket_code}
                        </p>
                      </div>
                      <Badge variant={ticket.status === 'valid' ? 'default' : 'secondary'}>
                        {ticket.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-4">
            {loadingData ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending requests</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {orders.map((order) => (
                  <Card key={order.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {order.profiles?.display_name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                          {order.plus_guests > 0 && ` • +${order.plus_guests} guests`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOrderAction(order.id, 'declined')}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="gradient-primary"
                          onClick={() => handleOrderAction(order.id, 'approved')}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
