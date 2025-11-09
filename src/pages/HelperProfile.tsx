import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Star, MapPin, Clock, CheckCircle, 
  Shield, Award, Zap, Calendar, CreditCard, Plus, Minus,
  Image as ImageIcon, Play, Flag, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { StarRating } from '@/components/StarRating';
import { HelperCategorySection } from '@/components/HelperCategorySection';
import { mockHelpers } from '@/data/mockData';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useToast } from '@/hooks/use-toast';

const HelperProfile = () => {
  const { helperId } = useParams();
  const navigate = useNavigate();
  const { isDemoMode, showDemoSuccess } = useDemoMode();
  const { toast } = useToast();

  // Find helper or use mock data
  const helper = mockHelpers.find(h => h.id === helperId) || mockHelpers[0];

  // State
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookingType, setBookingType] = useState<'now' | 'schedule'>('now');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [address, setAddress] = useState('');
  const [tipPercentage, setTipPercentage] = useState([10]);
  const [showBookingCard, setShowBookingCard] = useState(false);

  // Mock data for profile
  const helperProfile = {
    ...helper,
    tagline: getTaglineForCategory(helper.category),
    coverageArea: helper.coverageArea || 'Belgrade, Novi Sad, Niš',
    duration: helper.duration || '30-90 min',
    languages: helper.languages || ['Serbian', 'English'],
    certifications: helper.certifications,
    gallery: [
      '/placeholder.svg',
      '/placeholder.svg',
      '/placeholder.svg',
      '/placeholder.svg',
    ],
    badges: getBadgesForHelper(helper),
    about: getAboutTextForCategory(helper.category),
    reviews: mockReviews,
    relatedHelpers: mockHelpers.filter(h => h.id !== helper.id).slice(0, 3),
  };

  function getTaglineForCategory(category: string) {
    const taglines = {
      wellness: 'Detox your body after a wild night',
      transport: 'Safe rides when you need them most',
      logistics: 'Your party essentials, delivered fast',
      rentals: 'Everything you need for unforgettable events',
      concierge: 'Exclusive VIP experiences, curated for you',
    };
    return taglines[category as keyof typeof taglines] || 'Here to help';
  }

  function getBadgesForHelper(helper: any) {
    const badges = [];
    if (helper.rating >= 4.8) badges.push({ icon: Award, label: 'Top Rated Helper', color: 'text-yellow-500' });
    if (helper.availability === 'available') badges.push({ icon: Zap, label: 'Fast Responder', color: 'text-blue-500' });
    
    // Category-specific badges
    if (helper.category === 'wellness') badges.push({ icon: Shield, label: 'Recovery Expert', color: 'text-teal-500' });
    if (helper.category === 'transport' && helper.insuranceCovered) badges.push({ icon: Shield, label: 'Insured & Licensed', color: 'text-blue-500' });
    if (helper.category === 'logistics' && helper.reviewCount > 200) badges.push({ icon: Zap, label: 'Lightning Fast', color: 'text-orange-500' });
    if (helper.category === 'rentals') badges.push({ icon: CheckCircle, label: 'Pro Equipment', color: 'text-purple-500' });
    if (helper.category === 'concierge' && helper.vipAccess) badges.push({ icon: Award, label: 'VIP Elite', color: 'text-amber-500' });
    
    return badges;
  }

  function getAboutTextForCategory(category: string) {
    const about = {
      wellness: 'Medical-grade recovery services to help you bounce back after intense nights out. Our team includes licensed medical professionals specializing in IV therapy and wellness.\n\nWe use hospital-grade equipment and follow strict hygiene protocols. Each session is customized based on your needs and symptoms.\n\nWhether it\'s dehydration, fatigue, or general recovery, we provide safe and effective treatments in the comfort of your home or at our clinic.',
      transport: 'Professional transportation service dedicated to getting party-goers home safely. Our drivers are experienced, vetted, and committed to your safety.\n\nAll vehicles are regularly maintained, clean, and comfortable. We track rides in real-time and provide direct support throughout your journey.\n\nAvailable 24/7 across Belgrade and surrounding areas. Because getting home safely should never be a concern.',
      logistics: 'Fast and reliable delivery service specializing in party essentials. Whether you need snacks, drinks, or last-minute supplies, we\'ve got you covered 24/7.\n\nOur runners know Belgrade inside out and can reach most locations within 15-30 minutes. We work with local shops to ensure quality products at reasonable prices.\n\nWith years of experience serving the nightlife community, we understand the importance of timely delivery and discretion.',
      rentals: 'Professional event equipment and prop rental service. From DJ gear to lighting systems, we provide everything you need for unforgettable parties.\n\nAll equipment is professionally maintained, tested before delivery, and comes with setup support. We work with both private hosts and professional event organizers.\n\nFlexible rental periods, competitive pricing, and same-day delivery available. Make your event truly special with the right equipment.',
      concierge: 'Elite concierge service providing exclusive access to Belgrade\'s premium nightlife and personalized event experiences. Our team specializes in VIP arrangements and bespoke party planning.\n\nFrom securing impossible reservations to coordinating every detail of your night, we handle it all with discretion and professionalism.\n\nWith insider connections across the city\'s top venues and service providers, we turn your vision into reality. Experience the difference of true VIP treatment.',
    };
    return about[category as keyof typeof about] || 'Professional service provider.';
  }

  const handleBooking = () => {
    if (isDemoMode) {
      toast({
        title: "Booking Confirmed! 🎉",
        description: `${helper.name} will arrive at ${bookingType === 'now' ? 'your location soon' : `${selectedDate} ${selectedTime}`}`,
      });
      showDemoSuccess('Service booked successfully');
      setShowBookingCard(false);
    }
  };

  const basePrice = parseFloat(helper.priceRange.split('-')[1]?.replace('€', '') || '20');
  const tipAmount = (basePrice * tipPercentage[0]) / 100;
  const totalPrice = basePrice + tipAmount;

  return (
    <div className="min-h-screen bg-background safe-top pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-card border-b border-border/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/helpers')}
            className="gap-2"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Helpers Marketplace</span>
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="font-semibold">{helper.rating}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart 
                size={20} 
                className={isFavorite ? 'fill-error text-error' : ''} 
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={helperProfile.gallery[selectedImage]}
          alt={helper.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Image Navigation */}
        {helperProfile.gallery.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {helperProfile.gallery.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === selectedImage ? 'bg-white w-6' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex gap-2 mb-2">
            <Badge className="glass-card">
              {helper.category.charAt(0).toUpperCase() + helper.category.slice(1)}
            </Badge>
            {helper.availability === 'available' && (
              <Badge className="bg-success/20 text-success border-success/30">
                Available Now
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{helper.name}</h1>
          <p className="text-white/90 text-sm">{helperProfile.tagline}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="glass-card p-4 text-center">
            <Star className="w-5 h-5 fill-accent text-accent mx-auto mb-1" />
            <div className="font-bold text-lg">{helper.rating}</div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </Card>
          <Card className="glass-card p-4 text-center">
            <CheckCircle className="w-5 h-5 text-success mx-auto mb-1" />
            <div className="font-bold text-lg">{helper.reviewCount}</div>
            <div className="text-xs text-muted-foreground">Reviews</div>
          </Card>
          <Card className="glass-card p-4 text-center">
            <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="font-bold text-lg">{helper.estimatedTime?.split('-')[0] || '15'}</div>
            <div className="text-xs text-muted-foreground">Min ETA</div>
          </Card>
        </div>

        {/* About Section */}
        <Card className="glass-card p-5">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            About this Helper
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
            {helperProfile.about}
          </p>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/20">
            {helper.coverageArea && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Coverage Area</div>
                <div className="text-sm font-medium flex items-center gap-1">
                  <MapPin size={14} className="text-primary" />
                  {helper.coverageArea}
                </div>
              </div>
            )}
            {helper.duration && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Duration</div>
                <div className="text-sm font-medium flex items-center gap-1">
                  <Clock size={14} className="text-primary" />
                  {helper.duration}
                </div>
              </div>
            )}
            {helper.languages && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Languages</div>
                <div className="text-sm font-medium">
                  {helper.languages.join(', ')}
                </div>
              </div>
            )}
            {helper.serviceLocation && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Service Type</div>
                <div className="text-sm font-medium capitalize">
                  {helper.serviceLocation.replace('_', ' ')}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Category-Specific Sections */}
        <HelperCategorySection helper={helper} />

        {/* Gallery Section */}
        <Card className="glass-card p-5">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <ImageIcon size={20} />
            Gallery
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {helperProfile.gallery.map((img, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedImage(idx)}
              >
                <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </Card>

        {/* Gamification Badges */}
        {helperProfile.badges.length > 0 && (
          <Card className="glass-card p-5">
            <h2 className="text-lg font-bold mb-3">Achievements</h2>
            <div className="flex flex-wrap gap-3">
              {helperProfile.badges.map((badge, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 glass-card px-3 py-2 rounded-full"
                >
                  <badge.icon size={16} className={badge.color} />
                  <span className="text-xs font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Reviews Section */}
        <Card className="glass-card p-5">
          <h2 className="text-lg font-bold mb-4">User Reviews</h2>
          
          {/* Rating Breakdown */}
          <div className="grid grid-cols-5 gap-2 mb-4 pb-4 border-b border-border/20">
            {[5, 4, 3, 2, 1].map((stars) => {
              const percentage = Math.random() * 100;
              return (
                <div key={stars} className="text-center">
                  <div className="text-xs font-medium mb-1">{stars}★</div>
                  <div className="h-16 bg-muted/20 rounded relative">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-accent/30 rounded"
                      style={{ height: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round(percentage)}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Review List */}
          <div className="space-y-4">
            {helperProfile.reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="pb-4 border-b border-border/20 last:border-0">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={review.avatar} />
                    <AvatarFallback>{review.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{review.name}</span>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {review.comment}
                    </p>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Related Helpers */}
        <Card className="glass-card p-5">
          <h2 className="text-lg font-bold mb-4">You Might Also Like</h2>
          <div className="space-y-3">
            {helperProfile.relatedHelpers.map((related) => (
              <div
                key={related.id}
                className="flex items-center gap-3 p-3 glass-card rounded-lg cursor-pointer hover:bg-surface-hover transition-colors"
                onClick={() => navigate(`/helpers/${related.id}`)}
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={related.avatar} />
                  <AvatarFallback>{related.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{related.name}</div>
                  <div className="text-xs text-muted-foreground">{related.service}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-accent text-accent" />
                      <span className="text-xs">{related.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {related.priceRange}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Floating Booking Button */}
      <div className="fixed bottom-20 left-0 right-0 px-4 z-30">
        <Button
          className="w-full gradient-primary text-white shadow-2xl h-14 text-lg font-semibold"
          onClick={() => setShowBookingCard(true)}
          disabled={helper.availability !== 'available'}
        >
          {helper.availability === 'available' ? 'Book Now' : 'Currently Unavailable'}
        </Button>
      </div>

      {/* Booking Modal */}
      {showBookingCard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end">
          <Card className="w-full glass-card rounded-t-3xl max-h-[85vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Book Service</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBookingCard(false)}
                >
                  ×
                </Button>
              </div>

              {/* Booking Type */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={bookingType === 'now' ? 'default' : 'outline'}
                  className={bookingType === 'now' ? 'gradient-primary' : ''}
                  onClick={() => setBookingType('now')}
                >
                  <Zap size={16} className="mr-2" />
                  Now
                </Button>
                <Button
                  variant={bookingType === 'schedule' ? 'default' : 'outline'}
                  className={bookingType === 'schedule' ? 'gradient-primary' : ''}
                  onClick={() => setBookingType('schedule')}
                >
                  <Calendar size={16} className="mr-2" />
                  Schedule
                </Button>
              </div>

              {/* Schedule Inputs */}
              {bookingType === 'schedule' && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    placeholder="Date"
                  />
                  <Input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    placeholder="Time"
                  />
                </div>
              )}

              {/* Address */}
              <div>
                <label className="text-sm font-medium mb-2 block">Service Address</label>
                <Input
                  placeholder="Enter your address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {/* Tip Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Tip</label>
                  <span className="text-sm font-bold">{tipPercentage[0]}%</span>
                </div>
                <Slider
                  value={tipPercentage}
                  onValueChange={setTipPercentage}
                  max={25}
                  step={5}
                  className="mb-1"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>25%</span>
                </div>
              </div>

              {/* Price Summary */}
              <Card className="glass-card p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Price</span>
                    <span className="font-medium">€{basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tip ({tipPercentage[0]}%)</span>
                    <span className="font-medium">€{tipAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border/20 pt-2 flex justify-between text-base">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary">€{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </Card>

              <p className="text-xs text-muted-foreground text-center">
                Your payment is held in escrow until the service is confirmed.
              </p>

              <Button
                className="w-full gradient-primary text-white h-12 font-semibold"
                onClick={handleBooking}
              >
                Confirm Booking
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 glass-card border-t border-border/20 p-3 z-20">
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <button className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Flag size={14} />
            Report Helper
          </button>
        </div>
      </div>
    </div>
  );
};

// Mock reviews data
const mockReviews = [
  {
    id: '1',
    name: 'Marko P.',
    avatar: '/placeholder.svg',
    rating: 5,
    comment: 'Absolutely fantastic service! Quick, professional, and exactly what I needed after a long night out.',
    date: '2 days ago',
  },
  {
    id: '2',
    name: 'Ana S.',
    avatar: '/placeholder.svg',
    rating: 5,
    comment: 'Best helper in Belgrade! Always reliable and friendly. Highly recommended.',
    date: '1 week ago',
  },
  {
    id: '3',
    name: 'Stefan M.',
    avatar: '/placeholder.svg',
    rating: 4,
    comment: 'Great service overall. Arrived on time and was very professional.',
    date: '2 weeks ago',
  },
];

export default HelperProfile;
