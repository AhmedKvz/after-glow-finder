import { Music, Users, Package, Shield, Briefcase, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { MarketplaceRole } from '@/pages/HelperOnboarding';

interface RoleSpecificFieldsProps {
  roleType: MarketplaceRole;
  roleData: Record<string, any>;
  updateRoleData: (data: Record<string, any>) => void;
}

export const RoleSpecificFields = ({ roleType, roleData, updateRoleData }: RoleSpecificFieldsProps) => {
  const updateField = (field: string, value: any) => {
    updateRoleData({ ...roleData, [field]: value });
  };

  // Wellness Support Fields
  if (roleType === 'wellness_support') {
    return (
      <Card className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-full bg-pink-500/10">
            <Users size={18} className="text-pink-400" />
          </div>
          <Label className="text-lg font-semibold">Wellness Support Details</Label>
        </div>

        <div>
          <Label htmlFor="sessionDuration">Session Duration</Label>
          <Input
            id="sessionDuration"
            placeholder="e.g., 60 min"
            value={roleData.sessionDuration || ''}
            onChange={(e) => updateField('sessionDuration', e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="specialties">Specialties / Focus Areas</Label>
          <Textarea
            id="specialties"
            placeholder="e.g., Post-after emotional support, calming presence, life talks..."
            value={roleData.specialties || ''}
            onChange={(e) => updateField('specialties', e.target.value)}
            className="mt-2"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="homeVisits">Home Visit Service</Label>
          <Switch
            id="homeVisits"
            checked={roleData.homeVisits || false}
            onCheckedChange={(checked) => updateField('homeVisits', checked)}
          />
        </div>

        <div className="p-3 bg-muted/50 rounded">
          <p className="text-xs text-muted-foreground italic">
            ℹ️ Note: This is experience-based guidance, not formal therapy. Make sure to communicate this clearly to clients.
          </p>
        </div>
      </Card>
    );
  }

  // DJ / Musician Fields
  if (roleType === 'dj_musician') {
    return (
      <Card className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-full bg-purple-500/10">
            <Music size={18} className="text-purple-400" />
          </div>
          <Label className="text-lg font-semibold">DJ / Musician Details</Label>
        </div>

        <div>
          <Label htmlFor="genres">Genres</Label>
          <Input
            id="genres"
            placeholder="e.g., Techno, House, Progressive"
            value={roleData.genres || ''}
            onChange={(e) => updateField('genres', e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="setDuration">Typical Set Duration</Label>
          <Input
            id="setDuration"
            placeholder="e.g., 2-4 hours"
            value={roleData.setDuration || ''}
            onChange={(e) => updateField('setDuration', e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="equipment">Equipment (what you bring)</Label>
          <Textarea
            id="equipment"
            placeholder="e.g., CDJ-3000, DJM-900, monitors..."
            value={roleData.equipment || ''}
            onChange={(e) => updateField('equipment', e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="mixLink">Sample Mix / SoundCloud Link</Label>
          <Input
            id="mixLink"
            type="url"
            placeholder="https://soundcloud.com/..."
            value={roleData.mixLink || ''}
            onChange={(e) => updateField('mixLink', e.target.value)}
            className="mt-2"
          />
        </div>
      </Card>
    );
  }

  // Event Staff Fields
  if (roleType === 'event_staff') {
    return (
      <Card className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-full bg-green-500/10">
            <Users size={18} className="text-green-400" />
          </div>
          <Label className="text-lg font-semibold">Event Staff Details</Label>
        </div>

        <div>
          <Label htmlFor="staffRole">Primary Role</Label>
          <Input
            id="staffRole"
            placeholder="e.g., Bartender, Security, Photographer"
            value={roleData.staffRole || ''}
            onChange={(e) => updateField('staffRole', e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="experience">Years of Experience</Label>
          <Input
            id="experience"
            type="number"
            placeholder="3"
            value={roleData.experience || ''}
            onChange={(e) => updateField('experience', e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="languages">Languages Spoken</Label>
          <Input
            id="languages"
            placeholder="e.g., Serbian, English, German"
            value={roleData.languages || ''}
            onChange={(e) => updateField('languages', e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="certifications">Certifications (if any)</Label>
          <Input
            id="certifications"
            placeholder="e.g., Security License, First Aid"
            value={roleData.certifications || ''}
            onChange={(e) => updateField('certifications', e.target.value)}
            className="mt-2"
          />
        </div>
      </Card>
    );
  }

  // Vendor Store Fields
  if (roleType === 'vendor_store') {
    return (
      <Card className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-full bg-amber-500/10">
            <Package size={18} className="text-amber-400" />
          </div>
          <Label className="text-lg font-semibold">Store Details</Label>
        </div>

        <div>
          <Label htmlFor="storeCategory">Store Category</Label>
          <Input
            id="storeCategory"
            placeholder="e.g., Fashion, Smoking Accessories, Party Essentials"
            value={roleData.storeCategory || ''}
            onChange={(e) => updateField('storeCategory', e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="productTypes">Product Types</Label>
          <Textarea
            id="productTypes"
            placeholder="List your main product categories..."
            value={roleData.productTypes || ''}
            onChange={(e) => updateField('productTypes', e.target.value)}
            className="mt-2"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="offersDelivery">Offer Delivery</Label>
          <Switch
            id="offersDelivery"
            checked={roleData.offersDelivery || false}
            onCheckedChange={(checked) => updateField('offersDelivery', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="offersPickup">In-Person Pickup</Label>
          <Switch
            id="offersPickup"
            checked={roleData.offersPickup || false}
            onCheckedChange={(checked) => updateField('offersPickup', checked)}
          />
        </div>

        <div>
          <Label htmlFor="brandStory">Brand Story</Label>
          <Textarea
            id="brandStory"
            placeholder="Tell us about your brand's mission and values..."
            value={roleData.brandStory || ''}
            onChange={(e) => updateField('brandStory', e.target.value)}
            className="mt-2"
          />
        </div>
      </Card>
    );
  }

  // Props Rental Fields
  if (roleType === 'props_rental') {
    return (
      <Card className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-full bg-orange-500/10">
            <Briefcase size={18} className="text-orange-400" />
          </div>
          <Label className="text-lg font-semibold">Equipment Rental Details</Label>
        </div>

        <div>
          <Label htmlFor="equipmentTypes">Equipment Types</Label>
          <Textarea
            id="equipmentTypes"
            placeholder="e.g., DJ controllers, lighting systems, smoke machines, decorations..."
            value={roleData.equipmentTypes || ''}
            onChange={(e) => updateField('equipmentTypes', e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="depositRequired">Deposit Amount (€)</Label>
          <Input
            id="depositRequired"
            type="number"
            placeholder="100"
            value={roleData.depositRequired || ''}
            onChange={(e) => updateField('depositRequired', e.target.value)}
            className="mt-2"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="deliveryAvailable">Delivery Available</Label>
          <Switch
            id="deliveryAvailable"
            checked={roleData.deliveryAvailable || false}
            onCheckedChange={(checked) => updateField('deliveryAvailable', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="setupSupport">Setup Support Included</Label>
          <Switch
            id="setupSupport"
            checked={roleData.setupSupport || false}
            onCheckedChange={(checked) => updateField('setupSupport', checked)}
          />
        </div>

        <div>
          <Label htmlFor="minimumRental">Minimum Rental Period</Label>
          <Input
            id="minimumRental"
            placeholder="e.g., 1 day, 24 hours"
            value={roleData.minimumRental || ''}
            onChange={(e) => updateField('minimumRental', e.target.value)}
            className="mt-2"
          />
        </div>
      </Card>
    );
  }

  // Nightlife Guide Fields
  if (roleType === 'nightlife_guide') {
    return (
      <Card className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-full bg-cyan-500/10">
            <MapPin size={18} className="text-cyan-400" />
          </div>
          <Label className="text-lg font-semibold">Nightlife Guide Details</Label>
        </div>

        <div>
          <Label htmlFor="nightlifeStyle">Nightlife Style / Music Preferences</Label>
          <Input
            id="nightlifeStyle"
            placeholder="e.g., Techno, House, Underground, Local Afters"
            value={roleData.nightlifeStyle || ''}
            onChange={(e) => updateField('nightlifeStyle', e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="preferredZones">Areas You Cover</Label>
          <Input
            id="preferredZones"
            placeholder="e.g., Savamala, Dorćol, Novi Sad"
            value={roleData.preferredZones || ''}
            onChange={(e) => updateField('preferredZones', e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="tourTypes">Tour Types / Services</Label>
          <Textarea
            id="tourTypes"
            placeholder="e.g., Club tours, After party hosting, Safety companion, Cultural guide..."
            value={roleData.tourTypes || ''}
            onChange={(e) => updateField('tourTypes', e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="maxGroupSize">Max Group Size</Label>
          <Input
            id="maxGroupSize"
            type="number"
            placeholder="4"
            value={roleData.maxGroupSize || ''}
            onChange={(e) => updateField('maxGroupSize', e.target.value)}
            className="mt-2"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="canHostAfters">Can Host Private Afters</Label>
          <Switch
            id="canHostAfters"
            checked={roleData.canHostAfters || false}
            onCheckedChange={(checked) => updateField('canHostAfters', checked)}
          />
        </div>

        <div>
          <Label htmlFor="totalTours">Total Tours Completed (if any)</Label>
          <Input
            id="totalTours"
            type="number"
            placeholder="0"
            value={roleData.totalTours || ''}
            onChange={(e) => updateField('totalTours', e.target.value)}
            className="mt-2"
          />
        </div>

        <div className="p-3 bg-muted/50 rounded">
          <p className="text-xs text-muted-foreground italic">
            🌍 As a guide, you'll help visitors discover authentic nightlife experiences and connect with the local scene.
          </p>
        </div>
      </Card>
    );
  }

  // General Helper - minimal extra fields
  return (
    <Card className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-full bg-blue-500/10">
          <Users size={18} className="text-blue-400" />
        </div>
        <Label className="text-lg font-semibold">Helper Details</Label>
      </div>

      <div>
        <Label htmlFor="servicesOffered">Services You Offer</Label>
        <Textarea
          id="servicesOffered"
          placeholder="Describe the specific services you provide..."
          value={roleData.servicesOffered || ''}
          onChange={(e) => updateField('servicesOffered', e.target.value)}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="responseTime">Average Response Time</Label>
        <Input
          id="responseTime"
          placeholder="e.g., 15 minutes"
          value={roleData.responseTime || ''}
          onChange={(e) => updateField('responseTime', e.target.value)}
          className="mt-2"
        />
      </div>
    </Card>
  );
};
