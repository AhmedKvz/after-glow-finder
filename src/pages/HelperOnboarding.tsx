import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RoleSelection } from '@/components/onboarding/RoleSelection';
import { ProfileDetails } from '@/components/onboarding/ProfileDetails';
import { VerificationReview } from '@/components/onboarding/VerificationReview';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type MarketplaceRole = 
  | 'general_helper'
  | 'wellness_support'
  | 'dj_musician'
  | 'event_staff'
  | 'vendor_store'
  | 'props_rental';

export interface OnboardingData {
  roleType: MarketplaceRole | null;
  displayName: string;
  bio: string;
  profileImageUrl: string;
  city: string;
  coverageArea: string;
  categoryTags: string[];
  availability247: boolean;
  availabilitySchedule: any;
  priceRange: string;
  hourlyRate: string;
  sessionRate: string;
  phone: string;
  email: string;
  instagram: string;
  website: string;
  roleData: Record<string, any>;
  galleryUrls: string[];
}

const HelperOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<OnboardingData>({
    roleType: null,
    displayName: '',
    bio: '',
    profileImageUrl: '',
    city: '',
    coverageArea: '',
    categoryTags: [],
    availability247: false,
    availabilitySchedule: {},
    priceRange: '',
    hourlyRate: '',
    sessionRate: '',
    phone: '',
    email: '',
    instagram: '',
    website: '',
    roleData: {},
    galleryUrls: [],
  });

  const steps = [
    { number: 1, title: 'Choose Role', description: 'Select your service type' },
    { number: 2, title: 'Profile Details', description: 'Tell us about yourself' },
    { number: 3, title: 'Review & Submit', description: 'Verify your information' },
  ];

  const progressPercentage = (currentStep / steps.length) * 100;

  const updateFormData = (updates: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit an application.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.roleType) {
      toast({
        title: 'Error',
        description: 'Please select a role type.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('helper_applications').insert({
        user_id: user.id,
        role_type: formData.roleType,
        status: 'pending',
        display_name: formData.displayName,
        bio: formData.bio,
        profile_image_url: formData.profileImageUrl || null,
        city: formData.city,
        coverage_area: formData.coverageArea,
        category_tags: formData.categoryTags,
        availability_24_7: formData.availability247,
        availability_schedule: formData.availabilitySchedule,
        price_range: formData.priceRange || null,
        hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        session_rate: formData.sessionRate ? parseFloat(formData.sessionRate) : null,
        phone: formData.phone || null,
        email: formData.email || null,
        instagram: formData.instagram || null,
        website: formData.website || null,
        role_data: formData.roleData,
        gallery_urls: formData.galleryUrls,
      });

      if (error) throw error;

      toast({
        title: 'Application Submitted! 🎉',
        description: 'Your application is under review. We\'ll notify you once it\'s approved.',
      });

      navigate('/helpers');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit your application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background safe-top pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-card border-b border-border/20 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => currentStep === 1 ? navigate('/helpers') : handlePrevious()}
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-lg">Join AfterBefore Marketplace</h1>
            <p className="text-xs text-muted-foreground">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex items-center gap-1 ${
                  currentStep >= step.number ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {currentStep > step.number ? (
                  <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                ) : (
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      currentStep === step.number
                        ? 'border-primary bg-primary text-white'
                        : 'border-muted-foreground'
                    }`}
                  >
                    <span className="text-xs font-semibold">{step.number}</span>
                  </div>
                )}
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {currentStep === 1 && (
          <RoleSelection
            selectedRole={formData.roleType}
            onRoleSelect={(role) => updateFormData({ roleType: role })}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <ProfileDetails
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}

        {currentStep === 3 && (
          <VerificationReview
            formData={formData}
            onPrevious={handlePrevious}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default HelperOnboarding;
