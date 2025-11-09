import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Car, HeartPulse, Music, Crown, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockHelpers } from '@/data/mockData';
import { Helper } from '@/types';

const categoryIcons = {
  wellness: HeartPulse,
  transport: Car,
  logistics: Package,
  rentals: Music,
  concierge: Crown,
};

const categoryLabels = {
  wellness: 'Wellness',
  transport: 'Transport',
  logistics: 'Logistics',
  rentals: 'Rentals',
  concierge: 'Concierge',
};

const Helpers = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Object.keys(categoryIcons)] as const;

  const filteredHelpers = selectedCategory === 'all' 
    ? mockHelpers 
    : mockHelpers.filter(helper => helper.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-border/20">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gradient-primary">
            Event Helpers
          </h1>
          <Button
            onClick={() => navigate('/helper-onboarding')}
            variant="outline"
            size="sm"
            className="gradient-primary text-white border-0"
          >
            Join as Helper
          </Button>
        </div>
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
              onClick={() => navigate(`/helpers/${helper.id}`)}
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
    </div>
  );
};

export default Helpers;