import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

interface ClubProfileSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const clubProfileSchema = z.object({
  name: z.string().min(2, 'Club name must be at least 2 characters').max(100),
  address: z.string().min(5, 'Address must be at least 5 characters').max(300),
  description: z.string().max(1000).optional(),
  logo_image_url: z.string().url().optional().or(z.literal('')),
  cover_image_url: z.string().url().optional().or(z.literal(''))
});

export const ClubProfileSetupModal = ({ open, onOpenChange, onSuccess }: ClubProfileSetupModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    logo_image_url: '',
    cover_image_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      clubProfileSchema.parse(formData);

      if (!user) {
        throw new Error('You must be logged in');
      }

      const { error } = await supabase
        .from('club_profiles')
        .insert({
          user_id: user.id,
          name: formData.name,
          address: formData.address,
          description: formData.description || null,
          logo_image_url: formData.logo_image_url || null,
          cover_image_url: formData.cover_image_url || null
        });

      if (error) throw error;

      toast({
        title: 'Profile Created',
        description: 'Your club profile has been set up successfully!'
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to create club profile'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Complete Your Club Profile</DialogTitle>
          <DialogDescription>
            Set up your club profile to start creating events
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Club Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Club Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter your club or venue name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-destructive' : ''}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              placeholder="123 Main St, City, Country"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={errors.address ? 'border-destructive' : ''}
              disabled={loading}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell people about your club..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`min-h-[100px] ${errors.description ? 'border-destructive' : ''}`}
              disabled={loading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Logo Image URL */}
          <div className="space-y-2">
            <Label htmlFor="logo_image_url">Logo Image URL</Label>
            <Input
              id="logo_image_url"
              type="url"
              placeholder="https://example.com/logo.jpg"
              value={formData.logo_image_url}
              onChange={(e) => setFormData({ ...formData, logo_image_url: e.target.value })}
              className={errors.logo_image_url ? 'border-destructive' : ''}
              disabled={loading}
            />
            {errors.logo_image_url && (
              <p className="text-sm text-destructive">{errors.logo_image_url}</p>
            )}
          </div>

          {/* Cover Image URL */}
          <div className="space-y-2">
            <Label htmlFor="cover_image_url">Cover Image URL</Label>
            <Input
              id="cover_image_url"
              type="url"
              placeholder="https://example.com/cover.jpg"
              value={formData.cover_image_url}
              onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
              className={errors.cover_image_url ? 'border-destructive' : ''}
              disabled={loading}
            />
            {errors.cover_image_url && (
              <p className="text-sm text-destructive">{errors.cover_image_url}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 gradient-primary"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Setup
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
