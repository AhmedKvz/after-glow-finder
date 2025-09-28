import React, { useState } from 'react';
import { Truck, Car, Heart, Shield, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockHelpers } from '@/data/mockData';
import { Helper } from '@/types';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useToast } from '@/hooks/use-toast';

const categoryIcons = {
  delivery: Truck,
  transport: Car,
  recovery: Heart,
  security: Shield,
};

const categoryLabels = {
  delivery: 'Delivery',
  transport: 'Safe Drive',
  recovery: 'Recovery',
  security: 'Security',
};

const Helpers = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedHelper, setSelectedHelper] = useState<Helper | null>(null);
  const { isDemoMode, showDemoSuccess } = useDemoMode();
  const { toast } = useToast();

  const categories = ['all', ...Object.keys(categoryIcons)] as const;

  const filteredHelpers = selectedCategory === 'all' 
    ? mockHelpers 
    : mockHelpers.filter(helper => helper.category === selectedCategory);

  const handleRequestService = (helper: Helper) => {
    if (isDemoMode) {
      toast({
        title: "Service Requested! 🚀",
        description: `${helper.name} has been notified and will contact you shortly.`,
      });
      showDemoSuccess(`Requested ${helper.service}`);
    }
    setSelectedHelper(null);
  };

  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-border/20">
        <h1 className="text-2xl font-bold text-gradient-primary mb-2">
          Event Helpers
        </h1>
        <p className="text-muted-foreground">
          Services to make your night perfect
        </p>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pt-4 pb-2">
          {categories.map((category) => {
            const Icon = category === 'all' ? Star : categoryIcons[category as keyof typeof categoryIcons];
            const label = category === 'all' ? 'All Services' : categoryLabels[category as keyof typeof categoryLabels];
            
            return (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'secondary'}
                className={`whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 px-4 py-2 ${
                  selectedCategory === category
                    ? 'gradient-primary text-white'
                    : 'glass-card hover:bg-surface-hover'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                <Icon size={14} />
                {label}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Service cards */}
      <div className="px-4 py-4 space-y-3">
        {filteredHelpers.map((helper) => {
          const Icon = categoryIcons[helper.category];
          
          return (
            <Card 
              key={helper.id} 
              className="glass-card interactive overflow-hidden"
              onClick={() => setSelectedHelper(helper)}
            >
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={helper.avatar} />
                    <AvatarFallback>
                      <Icon size={20} />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{helper.name}</h3>
                      <Badge 
                        variant="secondary"
                        className={`text-xs ${
                          helper.availability === 'available' 
                            ? 'bg-success/20 text-success border-success/20' 
                            : helper.availability === 'busy'
                            ? 'bg-warning/20 text-warning border-warning/20'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {helper.availability}
                      </Badge>
                    </div>
                    
                    <p className="text-sm font-medium text-primary mb-1">
                      {helper.service}
                    </p>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {helper.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-accent text-accent" />
                          <span className="font-medium">{helper.rating}</span>
                          <span className="text-muted-foreground">
                            ({helper.reviewCount})
                          </span>
                        </div>
                        
                        {helper.estimatedTime && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock size={12} />
                            {helper.estimatedTime}
                          </div>
                        )}
                      </div>
                      
                      <div className="font-semibold text-primary">
                        {helper.priceRange}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Helper detail modal */}
      {selectedHelper && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end">
          <div className="w-full bg-background rounded-t-xl max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-border/20">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedHelper.avatar} />
                  <AvatarFallback>
                    {React.createElement(categoryIcons[selectedHelper.category], { size: 24 })}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{selectedHelper.name}</h2>
                  <p className="text-primary font-medium">{selectedHelper.service}</p>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span className="font-medium">{selectedHelper.rating}</span>
                      <span className="text-muted-foreground text-sm">
                        ({selectedHelper.reviewCount} reviews)
                      </span>
                    </div>
                    
                    <Badge 
                      variant="secondary"
                      className={`${
                        selectedHelper.availability === 'available' 
                          ? 'bg-success/20 text-success border-success/20' 
                          : 'bg-warning/20 text-warning border-warning/20'
                      }`}
                    >
                      {selectedHelper.availability}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-4">
                {selectedHelper.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="glass-card p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Price Range</div>
                  <div className="font-semibold">{selectedHelper.priceRange}</div>
                </div>
                
                {selectedHelper.estimatedTime && (
                  <div className="glass-card p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Estimated Time</div>
                    <div className="font-semibold">{selectedHelper.estimatedTime}</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedHelper(null)}
                >
                  Close
                </Button>
                <Button
                  className="flex-1 gradient-primary text-white shadow-primary"
                  onClick={() => handleRequestService(selectedHelper)}
                  disabled={selectedHelper.availability !== 'available'}
                >
                  {selectedHelper.availability === 'available' 
                    ? 'Request Now' 
                    : 'Currently Unavailable'
                  }
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Helpers;