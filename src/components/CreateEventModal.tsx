import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const MUSIC_GENRES = ['techno', 'house', 'rnb', 'minimal', 'psy', 'disco', 'trance', 'drum & bass'];
const USER_LEVELS = ['New Raver', 'Night Explorer', 'After Enthusiast', 'Secret Host', 'Elite Raver', 'After Legend'];
const VIBE_TAGS = ['Chill', 'Hardcore', 'International crowd', 'Locals only', 'Open minded'];

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(140),
  description: z.string().max(1000).optional(),
  location: z.string().min(3, 'Location is required'),
  date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  dj_name: z.string().max(100).optional(),
  exact_address: z.string().max(500).optional(),
});

export const CreateEventModal = ({ open, onOpenChange, onSuccess }: CreateEventModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clubProfileId, setClubProfileId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    start_time: '',
    end_time: '',
    capacity: 50,
    dj_name: '',
    exact_address: '',
    music_tags: [] as string[],
    bring_own_drinks: false,
    allow_plus_one: false,
    allow_plus_two: false,
    event_type: 'private_host' as 'club' | 'private_host' | 'secret',
    preferred_levels: [] as string[],
    min_trust_score: 0,
    vibe_tags: [] as string[],
    is_secret: false,
    secret_access_level: 0,
    secret_preview_text: '',
    secret_cover_blurred: '',
    golden_only: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if user is admin/club and get club profile
  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;
      
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'club'])
        .maybeSingle();
      
      const isAdminOrClub = !!roleData;
      setIsAdmin(roleData?.role === 'admin');
      
      // Get club profile ID if user has club role
      if (roleData?.role === 'club') {
        const { data: profileData } = await supabase
          .from('club_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (profileData) {
          setClubProfileId(profileData.id);
        }
      }
      
      // If user is admin or club, default to club event
      if (isAdminOrClub) {
        setFormData(prev => ({ ...prev, event_type: 'club' }));
      }
    };
    
    checkStatus();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Validate form
      eventSchema.parse({
        ...formData,
        capacity: Number(formData.capacity)
      });

      if (!user) {
        throw new Error('You must be logged in to create an event');
      }

      // Create event
      const { error } = await supabase
        .from('events')
        .insert({
          host_id: user.id,
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
          allow_plus_two: formData.allow_plus_two,
          event_type: formData.event_type,
          owner_club_id: clubProfileId,
          preferred_levels: formData.preferred_levels,
          min_trust_score: formData.min_trust_score,
          vibe_tags: formData.vibe_tags,
          is_secret: formData.is_secret,
          secret_access_level: formData.is_secret ? formData.secret_access_level : null,
          secret_preview_text: formData.is_secret ? formData.secret_preview_text : null,
          secret_cover_blurred: formData.is_secret ? formData.secret_cover_blurred : null
        });

      if (error) throw error;

      toast({
        title: "Event created!",
        description: "Your event has been successfully created."
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        start_time: '',
        end_time: '',
        capacity: 50,
        dj_name: '',
        exact_address: '',
        music_tags: [],
        bring_own_drinks: false,
        allow_plus_one: false,
        allow_plus_two: false,
        event_type: clubProfileId ? 'club' : 'private_host',
        preferred_levels: [],
        min_trust_score: 0,
        vibe_tags: [],
        is_secret: false,
        secret_access_level: 0,
        secret_preview_text: '',
        secret_cover_blurred: ''
      });

      onOpenChange(false);
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
          title: "Failed to create event",
          description: err.message
        });
      }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Summer Techno Night"
              maxLength={140}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_type">Event Type *</Label>
            <Select
              value={formData.event_type}
              onValueChange={(value) => setFormData({ ...formData, event_type: value as 'club' | 'private_host' })}
              disabled={!isAdmin}
            >
              <SelectTrigger id="event_type" className="glass-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card">
                {isAdmin && (
                  <SelectItem value="club">
                    <div className="flex items-center gap-2 py-1">
                      <span>🏛️</span>
                      <div>
                        <p className="font-medium">Club Event</p>
                        <p className="text-xs text-muted-foreground">Public location, ticket sales (Admin only)</p>
                      </div>
                    </div>
                  </SelectItem>
                )}
                  <SelectItem value="private_host">
                    <div className="flex items-center gap-2 py-1">
                      <span>🗝️</span>
                      <div>
                        <p className="font-medium">Private Host</p>
                        <p className="text-xs text-muted-foreground">Hidden location, request to join</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="secret">
                    <div className="flex items-center gap-2 py-1">
                      <span>🔮</span>
                      <div>
                        <p className="font-medium">Secret Event</p>
                        <p className="text-xs text-muted-foreground">Level-locked, exclusive access</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
            </Select>
            {!isAdmin && (
              <p className="text-xs text-muted-foreground">
                ℹ️ Only admins can create Club events. Users can create Private events.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell attendees about your event..."
              maxLength={1000}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location/Venue *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Club XYZ"
                className={errors.location ? 'border-destructive' : ''}
              />
              {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dj_name">DJ/Artist</Label>
              <Input
                id="dj_name"
                value={formData.dj_name}
                onChange={(e) => setFormData({ ...formData, dj_name: e.target.value })}
                placeholder="DJ Name"
                maxLength={100}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exact_address">Full Address (Optional)</Label>
            <Input
              id="exact_address"
              value={formData.exact_address}
              onChange={(e) => setFormData({ ...formData, exact_address: e.target.value })}
              placeholder="Street, City, Postal Code"
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={errors.date ? 'border-destructive' : ''}
              />
              {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className={errors.start_time ? 'border-destructive' : ''}
              />
              {errors.start_time && <p className="text-sm text-destructive">{errors.start_time}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className={errors.end_time ? 'border-destructive' : ''}
              />
              {errors.end_time && <p className="text-sm text-destructive">{errors.end_time}</p>}
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
              className={errors.capacity ? 'border-destructive' : ''}
            />
            {errors.capacity && <p className="text-sm text-destructive">{errors.capacity}</p>}
          </div>

          <div className="space-y-2">
            <Label>Music Genres</Label>
            <div className="flex gap-2 flex-wrap mb-2">
              {formData.music_tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="glass-card">
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
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {genre}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <Label>Event Options</Label>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="bring_own_drinks"
                checked={formData.bring_own_drinks}
                onChange={(e) => setFormData({ ...formData, bring_own_drinks: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="bring_own_drinks" className="cursor-pointer">
                BYOB (Bring Your Own Beverages)
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allow_plus_one"
                checked={formData.allow_plus_one}
                onChange={(e) => setFormData({ ...formData, allow_plus_one: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="allow_plus_one" className="cursor-pointer">
                Allow +1 Guest
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allow_plus_two"
                checked={formData.allow_plus_two}
                onChange={(e) => setFormData({ ...formData, allow_plus_two: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="allow_plus_two" className="cursor-pointer">
                Allow +2 Guests
              </Label>
            </div>
          </div>

          {(formData.event_type === 'private_host' || formData.event_type === 'secret') && (
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
                <Label htmlFor="min_trust_score">Minimum Trust Score</Label>
                <Input
                  id="min_trust_score"
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
          
          {/* Secret Event Fields */}
          {formData.event_type === 'secret' && (
            <div className="space-y-4 border-t pt-4 bg-purple-950/20 p-4 rounded-lg border-purple-500/30">
              <div>
                <Label className="text-purple-200">🔮 Secret Event Settings</Label>
                <p className="text-xs text-purple-300/70 mb-4">
                  Secret events are locked until users reach your required level
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secret_access_level">Required Level (1-7) *</Label>
                <Input
                  id="secret_access_level"
                  type="number"
                  min="1"
                  max="7"
                  value={formData.secret_access_level}
                  onChange={(e) => setFormData({ ...formData, secret_access_level: parseInt(e.target.value) || 0 })}
                  placeholder="Enter level (1=Newbie, 7=Legend)"
                  className="glass-card"
                />
                <p className="text-xs text-muted-foreground">
                  1=Newbie, 2=Explorer, 3=Rising Star, 4=Regular, 5=Pro, 6=VIP, 7=Legend
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secret_preview_text">Preview Text (Teaser) *</Label>
                <Textarea
                  id="secret_preview_text"
                  value={formData.secret_preview_text}
                  onChange={(e) => setFormData({ ...formData, secret_preview_text: e.target.value })}
                  placeholder="A mysterious hint about what awaits..."
                  maxLength={200}
                  rows={2}
                  className="glass-card"
                />
                <p className="text-xs text-muted-foreground">
                  This teaser will be shown to locked users
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secret_cover_blurred">Blurred Cover Image URL (Optional)</Label>
                <Input
                  id="secret_cover_blurred"
                  value={formData.secret_cover_blurred}
                  onChange={(e) => setFormData({ ...formData, secret_cover_blurred: e.target.value })}
                  placeholder="https://example.com/blurred-image.jpg"
                  className="glass-card"
                />
                <p className="text-xs text-muted-foreground">
                  If not provided, we'll blur the default event image
                </p>
              </div>
              
              <div className="bg-purple-900/30 p-3 rounded border border-purple-500/20">
                <p className="text-xs text-purple-200">
                  ⚠️ Secret events are visible only to users who meet your access level. They'll see a locked preview until they level up.
                </p>
              </div>
            </div>
          )}

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
              disabled={loading}
              className="flex-1 gradient-primary"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};