import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MUSIC_GENRES = ['techno', 'house', 'rnb', 'minimal', 'psy', 'disco', 'trance', 'drum & bass'];

export const EditProfileModal = ({ open, onOpenChange }: EditProfileModalProps) => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    city: '',
    gender: '',
    birthdate: '',
    music_tags: [] as string[]
  });

  useEffect(() => {
    if (open && user) {
      // Fetch current profile data
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setFormData({
              display_name: data.display_name || '',
              bio: data.bio || '',
              city: data.city || '',
              gender: data.gender || '',
              birthdate: data.birthdate || '',
              music_tags: data.music_tags || []
            });
          }
        });
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updateData: any = { ...formData };
    if (!updateData.gender) delete updateData.gender;
    if (!updateData.birthdate) delete updateData.birthdate;

    const { error } = await updateProfile(updateData);

    if (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated"
      });
      onOpenChange(false);
    }

    setLoading(false);
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
      <DialogContent className="glass-card max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              maxLength={280}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Belgrade"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="hidden">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthdate">Birthdate</Label>
            <Input
              id="birthdate"
              type="date"
              value={formData.birthdate}
              onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Music Interests</Label>
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
            <Select onValueChange={addMusicTag}>
              <SelectTrigger>
                <SelectValue placeholder="Add music genre" />
              </SelectTrigger>
              <SelectContent>
                {MUSIC_GENRES.filter(g => !formData.music_tags.includes(g)).map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              disabled={loading}
              className="flex-1 gradient-primary"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
