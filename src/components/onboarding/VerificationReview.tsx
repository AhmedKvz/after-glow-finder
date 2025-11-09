import { CheckCircle, MapPin, DollarSign, Tag, Clock, Phone, Mail, Instagram, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { OnboardingData } from '@/pages/HelperOnboarding';
import { Loader2 } from 'lucide-react';

interface VerificationReviewProps {
  formData: OnboardingData;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const VerificationReview = ({ formData, onPrevious, onSubmit, isSubmitting }: VerificationReviewProps) => {
  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      general_helper: 'After Helper',
      wellness_support: 'Wellness & Mental Support',
      dj_musician: 'DJ / Musician / Performer',
      event_staff: 'Event Staff',
      vendor_store: 'Concept Store / Vendor',
      props_rental: 'Props & Equipment Rental',
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Review & Submit</h2>
        <p className="text-muted-foreground text-sm">
          Please review your information before submitting
        </p>
      </div>

      {/* Profile Preview */}
      <Card className="glass-card p-6">
        <div className="flex items-start gap-4 mb-4">
          {formData.profileImageUrl ? (
            <img
              src={formData.profileImageUrl}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl">{formData.displayName[0]?.toUpperCase()}</span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-bold">{formData.displayName}</h3>
            <Badge className="mt-1">{getRoleLabel(formData.roleType || '')}</Badge>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {formData.bio}
        </p>
      </Card>

      {/* Location & Coverage */}
      <Card className="glass-card p-5">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <MapPin size={18} className="text-primary" />
          Location & Coverage
        </h4>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">City: </span>
            <span className="font-medium">{formData.city}</span>
          </div>
          {formData.coverageArea && (
            <div>
              <span className="text-muted-foreground">Coverage: </span>
              <span className="font-medium">{formData.coverageArea}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Availability & Pricing */}
      <Card className="glass-card p-5">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Clock size={18} className="text-primary" />
          Availability & Pricing
        </h4>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Availability: </span>
            <span className="font-medium">
              {formData.availability247 ? '24/7 Available' : 'Custom Schedule'}
            </span>
          </div>
          {formData.priceRange && (
            <div>
              <span className="text-muted-foreground">Price Range: </span>
              <span className="font-medium">{formData.priceRange}</span>
            </div>
          )}
          {formData.hourlyRate && (
            <div>
              <span className="text-muted-foreground">Hourly Rate: </span>
              <span className="font-medium">€{formData.hourlyRate}/hour</span>
            </div>
          )}
          {formData.sessionRate && (
            <div>
              <span className="text-muted-foreground">Session Rate: </span>
              <span className="font-medium">€{formData.sessionRate}/session</span>
            </div>
          )}
        </div>
      </Card>

      {/* Category Tags */}
      {formData.categoryTags.length > 0 && (
        <Card className="glass-card p-5">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Tag size={18} className="text-primary" />
            Service Tags
          </h4>
          <div className="flex flex-wrap gap-2">
            {formData.categoryTags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Contact Information */}
      <Card className="glass-card p-5">
        <h4 className="font-semibold mb-3">Contact Information</h4>
        <div className="space-y-3">
          {formData.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone size={16} className="text-muted-foreground" />
              <span>{formData.phone}</span>
            </div>
          )}
          {formData.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail size={16} className="text-muted-foreground" />
              <span>{formData.email}</span>
            </div>
          )}
          {formData.instagram && (
            <div className="flex items-center gap-2 text-sm">
              <Instagram size={16} className="text-muted-foreground" />
              <span>{formData.instagram}</span>
            </div>
          )}
          {formData.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe size={16} className="text-muted-foreground" />
              <span>{formData.website}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Important Notice */}
      <Card className="glass-card p-5 bg-blue-500/5 border-blue-500/20">
        <div className="flex gap-3">
          <CheckCircle className="text-blue-400 flex-shrink-0 mt-1" size={20} />
          <div>
            <h4 className="font-semibold mb-2 text-blue-400">Application Review Process</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your application will be reviewed by our team within 24-48 hours. We'll notify you via email once your profile is approved. You can track your application status in your dashboard.
            </p>
          </div>
        </div>
      </Card>

      <Separator />

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex-1"
          disabled={isSubmitting}
        >
          Previous
        </Button>
        <Button
          className="flex-1 gradient-primary text-white h-12 text-lg font-semibold"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </Button>
      </div>
    </div>
  );
};
