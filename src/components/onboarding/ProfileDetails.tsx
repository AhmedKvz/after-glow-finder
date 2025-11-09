import { Upload, MapPin, Clock, DollarSign, Phone, Mail, Instagram, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OnboardingData } from '@/pages/HelperOnboarding';
import { RoleSpecificFields } from './RoleSpecificFields';

interface ProfileDetailsProps {
  formData: OnboardingData;
  updateFormData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const ProfileDetails = ({ formData, updateFormData, onNext, onPrevious }: ProfileDetailsProps) => {
  const isFormValid = () => {
    return (
      formData.displayName.trim() !== '' &&
      formData.city.trim() !== '' &&
      formData.bio.trim() !== ''
    );
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = formData.categoryTags;
    if (currentTags.includes(tag)) {
      updateFormData({ categoryTags: currentTags.filter(t => t !== tag) });
    } else {
      updateFormData({ categoryTags: [...currentTags, tag] });
    }
  };

  const commonTags = [
    'Delivery', 'Transport', 'Recovery', 'Wellness', 'IV Therapy',
    'Massage', 'DJ', 'Security', 'Bartender', 'Photography',
    'Equipment Rental', 'Props', 'Lighting', 'Sound', 'Fashion',
    'Accessories', 'Party Essentials', '24/7 Available'
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Profile Details</h2>
        <p className="text-muted-foreground text-sm">
          Tell us about yourself and your services
        </p>
      </div>

      {/* Profile Image */}
      <Card className="glass-card p-5">
        <Label className="flex items-center gap-2 mb-3">
          <Upload size={18} />
          Profile Image / Logo
        </Label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {formData.profileImageUrl ? (
              <img src={formData.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Upload size={24} className="text-muted-foreground" />
            )}
          </div>
          <Input
            type="text"
            placeholder="Image URL (or upload coming soon)"
            value={formData.profileImageUrl}
            onChange={(e) => updateFormData({ profileImageUrl: e.target.value })}
            className="flex-1"
          />
        </div>
      </Card>

      {/* Basic Info */}
      <Card className="glass-card p-5 space-y-4">
        <div>
          <Label htmlFor="displayName">Display Name / Business Name *</Label>
          <Input
            id="displayName"
            placeholder="e.g., Marko - Express Helper"
            value={formData.displayName}
            onChange={(e) => updateFormData({ displayName: e.target.value })}
            className="mt-2"
            maxLength={100}
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio / Description *</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about your services, experience, and what makes you unique..."
            value={formData.bio}
            onChange={(e) => updateFormData({ bio: e.target.value })}
            className="mt-2 min-h-[120px]"
            maxLength={600}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.bio.length}/600 characters
          </p>
        </div>
      </Card>

      {/* Location */}
      <Card className="glass-card p-5 space-y-4">
        <div>
          <Label htmlFor="city" className="flex items-center gap-2">
            <MapPin size={16} />
            City *
          </Label>
          <Input
            id="city"
            placeholder="e.g., Belgrade"
            value={formData.city}
            onChange={(e) => updateFormData({ city: e.target.value })}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="coverageArea">Coverage Area</Label>
          <Input
            id="coverageArea"
            placeholder="e.g., Belgrade, Novi Sad, Niš"
            value={formData.coverageArea}
            onChange={(e) => updateFormData({ coverageArea: e.target.value })}
            className="mt-2"
          />
        </div>
      </Card>

      {/* Category Tags */}
      <Card className="glass-card p-5">
        <Label className="mb-3 block">Service Tags (select all that apply)</Label>
        <div className="flex flex-wrap gap-2">
          {commonTags.map((tag) => (
            <Badge
              key={tag}
              variant={formData.categoryTags.includes(tag) ? 'default' : 'outline'}
              className={`cursor-pointer transition-all ${
                formData.categoryTags.includes(tag)
                  ? 'gradient-primary text-white'
                  : 'hover:bg-surface-hover'
              }`}
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Availability */}
      <Card className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} />
            <Label htmlFor="availability247">Available 24/7</Label>
          </div>
          <Switch
            id="availability247"
            checked={formData.availability247}
            onCheckedChange={(checked) => updateFormData({ availability247: checked })}
          />
        </div>
        {!formData.availability247 && (
          <p className="text-xs text-muted-foreground">
            Custom schedule can be set later in your dashboard
          </p>
        )}
      </Card>

      {/* Pricing */}
      <Card className="glass-card p-5 space-y-4">
        <Label className="flex items-center gap-2">
          <DollarSign size={18} />
          Pricing
        </Label>

        <div>
          <Label htmlFor="priceRange">Price Range (optional)</Label>
          <Input
            id="priceRange"
            placeholder="e.g., €10-30"
            value={formData.priceRange}
            onChange={(e) => updateFormData({ priceRange: e.target.value })}
            className="mt-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hourlyRate">Hourly Rate (€)</Label>
            <Input
              id="hourlyRate"
              type="number"
              placeholder="25"
              value={formData.hourlyRate}
              onChange={(e) => updateFormData({ hourlyRate: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="sessionRate">Session Rate (€)</Label>
            <Input
              id="sessionRate"
              type="number"
              placeholder="50"
              value={formData.sessionRate}
              onChange={(e) => updateFormData({ sessionRate: e.target.value })}
              className="mt-2"
            />
          </div>
        </div>
      </Card>

      {/* Contact Info */}
      <Card className="glass-card p-5 space-y-4">
        <Label>Contact & Social Media</Label>

        <div>
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone size={16} />
            Phone
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+381 60 123 4567"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail size={16} />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="instagram" className="flex items-center gap-2">
            <Instagram size={16} />
            Instagram
          </Label>
          <Input
            id="instagram"
            placeholder="@yourhandle"
            value={formData.instagram}
            onChange={(e) => updateFormData({ instagram: e.target.value })}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="website" className="flex items-center gap-2">
            <Globe size={16} />
            Website
          </Label>
          <Input
            id="website"
            type="url"
            placeholder="https://yourwebsite.com"
            value={formData.website}
            onChange={(e) => updateFormData({ website: e.target.value })}
            className="mt-2"
          />
        </div>
      </Card>

      {/* Role-Specific Fields */}
      {formData.roleType && (
        <RoleSpecificFields
          roleType={formData.roleType}
          roleData={formData.roleData}
          updateRoleData={(data) => updateFormData({ roleData: data })}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex-1"
        >
          Previous
        </Button>
        <Button
          className="flex-1 gradient-primary text-white"
          onClick={onNext}
          disabled={!isFormValid()}
        >
          Continue to Review
        </Button>
      </div>
    </div>
  );
};
