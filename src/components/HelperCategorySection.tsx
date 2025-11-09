import { 
  Heart, Pill, Droplet, Wind, Car, Shield, Users, Package, 
  Zap, Lightbulb, Music, Sparkles, MapPin, Gift, Star, CheckCircle, Globe
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Helper } from '@/types';

interface HelperCategorySectionProps {
  helper: Helper;
}

export const HelperCategorySection: React.FC<HelperCategorySectionProps> = ({ helper }) => {
  const getCategoryConfig = (category: Helper['category']) => {
    const configs = {
      wellness: {
        color: 'text-teal-400',
        bgColor: 'bg-teal-500/10',
        borderColor: 'border-teal-500/20',
        label: 'Wellness & Recovery',
        icon: Heart,
      },
      transport: {
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        label: 'Transport & Safety',
        icon: Car,
      },
      logistics: {
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        label: 'Potrčko / Logistics',
        icon: Package,
      },
      rentals: {
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        label: 'Props & Rentals',
        icon: Music,
      },
      guide: {
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/20',
        label: 'Be My Guide',
        icon: MapPin,
      },
    };
    return configs[category];
  };

  const config = getCategoryConfig(helper.category);
  const IconComponent = config.icon;

  // Category-specific content renderers
  const renderWellnessSection = () => (
    <>
      {/* Certifications */}
      {helper.certifications && helper.certifications.length > 0 && (
        <Card className={`glass-card p-5 border ${config.borderColor}`}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Shield size={18} className={config.color} />
            Certifications & Licenses
          </h3>
          <div className="space-y-2">
            {helper.certifications.map((cert, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle size={16} className="text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{cert}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Medical Staff */}
      {helper.medicalStaff && helper.medicalStaff.length > 0 && (
        <Card className={`glass-card p-5 border ${config.borderColor}`}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users size={18} className={config.color} />
            Medical Team
          </h3>
          <div className="space-y-2">
            {helper.medicalStaff.map((staff, idx) => (
              <div key={idx} className="text-sm font-medium">{staff}</div>
            ))}
          </div>
        </Card>
      )}

      {/* Equipment List */}
      {helper.equipmentList && helper.equipmentList.length > 0 && (
        <Card className={`glass-card p-5 border ${config.borderColor}`}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Pill size={18} className={config.color} />
            Equipment & Supplies
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {helper.equipmentList.map((equipment, idx) => (
              <Badge key={idx} variant="outline" className="justify-start">
                <Droplet size={12} className="mr-1" />
                {equipment}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Combo Offers */}
      {helper.comboOffers && helper.comboOffers.length > 0 && (
        <Card className={`glass-card p-5 border ${config.borderColor}`}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles size={18} className={config.color} />
            Package Deals
          </h3>
          <div className="space-y-3">
            {helper.comboOffers.map((combo, idx) => (
              <div key={idx} className="p-3 glass-card rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{combo.name}</span>
                  <Badge className={config.bgColor}>{combo.price}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{combo.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );

  const renderTransportSection = () => (
    <>
      {/* Vehicle Info */}
      <Card className={`glass-card p-5 border ${config.borderColor}`}>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Car size={18} className={config.color} />
          Vehicle Information
        </h3>
        <div className="space-y-3">
          {helper.vehicleType && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Vehicle Type</div>
              <div className="font-medium">{helper.vehicleType}</div>
            </div>
          )}
          {helper.vehicleCapacity && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Passenger Capacity</div>
              <div className="font-medium flex items-center gap-2">
                <Users size={16} className={config.color} />
                Up to {helper.vehicleCapacity} passengers
              </div>
            </div>
          )}
          {helper.insuranceCovered && (
            <div className="flex items-center gap-2 text-success">
              <Shield size={16} />
              <span className="text-sm font-medium">Fully Insured & Licensed</span>
            </div>
          )}
        </div>
      </Card>

      {/* Safety Features */}
      <Card className={`glass-card p-5 border ${config.borderColor}`}>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Shield size={18} className={config.color} />
          Safety & Compliance
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-success" />
            <span className="text-sm">Background checked drivers</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-success" />
            <span className="text-sm">Real-time GPS tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-success" />
            <span className="text-sm">24/7 support line</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-success" />
            <span className="text-sm">Clean & sanitized vehicles</span>
          </div>
        </div>
      </Card>
    </>
  );

  const renderLogisticsSection = () => (
    <>
      {/* Delivery Info */}
      <Card className={`glass-card p-5 border ${config.borderColor}`}>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Package size={18} className={config.color} />
          Delivery Details
        </h3>
        <div className="space-y-3">
          {helper.deliveryFee && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Delivery Fee</div>
              <div className="font-medium flex items-center gap-2">
                <Zap size={16} className={config.color} />
                {helper.deliveryFee}
              </div>
            </div>
          )}
          <div>
            <div className="text-xs text-muted-foreground mb-1">Service Hours</div>
            <div className="font-medium">24/7 Available</div>
          </div>
          <div className="flex items-center gap-2 text-success">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">Track your order in real-time</span>
          </div>
        </div>
      </Card>

      {/* Popular Items */}
      {helper.inventoryItems && helper.inventoryItems.length > 0 && (
        <Card className={`glass-card p-5 border ${config.borderColor}`}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Star size={18} className={config.color} />
            Available Items
          </h3>
          <div className="space-y-2">
            {helper.inventoryItems.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 glass-card rounded">
                <span className="text-sm font-medium">{item.name}</span>
                <Badge variant="outline">{item.pricePerDay}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );

  const renderRentalsSection = () => (
    <>
      {/* Rental Terms */}
      <Card className={`glass-card p-5 border ${config.borderColor}`}>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Music size={18} className={config.color} />
          Rental Information
        </h3>
        <div className="space-y-3">
          {helper.minimumRental && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Minimum Order</div>
              <div className="font-medium">{helper.minimumRental}</div>
            </div>
          )}
          {helper.deliveryFee && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Delivery & Setup</div>
              <div className="font-medium">{helper.deliveryFee}</div>
            </div>
          )}
          <div className="flex items-center gap-2 text-success">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">Professional setup included</span>
          </div>
          <div className="flex items-center gap-2 text-success">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">24-hour pickup & return</span>
          </div>
        </div>
      </Card>

      {/* Inventory */}
      {helper.inventoryItems && helper.inventoryItems.length > 0 && (
        <Card className={`glass-card p-5 border ${config.borderColor}`}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Lightbulb size={18} className={config.color} />
            Equipment Catalog
          </h3>
          <div className="space-y-2">
            {helper.inventoryItems.map((item, idx) => (
              <div key={idx} className="p-3 glass-card rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{item.name}</span>
                  <Badge className={config.bgColor}>{item.pricePerDay}/day</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.quantity} available
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );

  const renderGuideSection = () => (
    <>
      {/* Nightlife Style Tags */}
      {helper.nightlifeStyle && helper.nightlifeStyle.length > 0 && (
        <Card className={`glass-card p-5 border ${config.borderColor}`}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Music size={18} className={config.color} />
            Nightlife Style
          </h3>
          <div className="flex flex-wrap gap-2">
            {helper.nightlifeStyle.map((style, idx) => (
              <Badge key={idx} className={`${config.bgColor} ${config.color} border-0`}>
                {style}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Preferred Zones */}
      {helper.preferredZones && helper.preferredZones.length > 0 && (
        <Card className={`glass-card p-5 border ${config.borderColor}`}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin size={18} className={config.color} />
            Coverage Areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {helper.preferredZones.map((zone, idx) => (
              <Badge key={idx} variant="secondary">
                {zone}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Tour Types & Services */}
      {helper.tourTypes && helper.tourTypes.length > 0 && (
        <Card className={`glass-card p-5 border ${config.borderColor}`}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Star size={18} className={config.color} />
            Experience Types
          </h3>
          <div className="space-y-2">
            {helper.tourTypes.map((type, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle size={16} className={`${config.color} mt-0.5 flex-shrink-0`} />
                <span className="text-sm">{type}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Guide Stats */}
      <Card className={`glass-card p-5 border ${config.borderColor} bg-gradient-to-br from-cyan-500/5 to-cyan-600/5`}>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Globe size={18} className={config.color} />
          Guide Experience
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {helper.maxGroupSize && (
            <div>
              <div className="text-2xl font-bold text-primary">{helper.maxGroupSize}</div>
              <div className="text-xs text-muted-foreground">Max Group Size</div>
            </div>
          )}
          {helper.totalTours && (
            <div>
              <div className="text-2xl font-bold text-primary">{helper.totalTours}</div>
              <div className="text-xs text-muted-foreground">Tours Completed</div>
            </div>
          )}
          {helper.canHostAfters && (
            <div className="col-span-2">
              <div className="flex items-center gap-2 p-3 rounded bg-success/10">
                <CheckCircle size={16} className="text-success" />
                <span className="text-sm font-medium">Can Host Private Afters</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </>
  );

  // Main render based on category
  const renderCategoryContent = () => {
    switch (helper.category) {
      case 'wellness':
        return renderWellnessSection();
      case 'transport':
        return renderTransportSection();
      case 'logistics':
        return renderLogisticsSection();
      case 'rentals':
        return renderRentalsSection();
      case 'guide':
        return renderGuideSection();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Header Badge */}
      <Card className={`glass-card p-4 border ${config.borderColor}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${config.bgColor}`}>
            <IconComponent size={20} className={config.color} />
          </div>
          <div>
            <div className="font-semibold">{config.label}</div>
            <div className="text-xs text-muted-foreground">{helper.service}</div>
          </div>
        </div>
      </Card>

      {/* Category-specific content */}
      {renderCategoryContent()}
    </div>
  );
};
