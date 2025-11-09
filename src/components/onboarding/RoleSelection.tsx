import { Package, Heart, Music, Users, Store, Lightbulb, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarketplaceRole } from '@/pages/HelperOnboarding';

interface RoleSelectionProps {
  selectedRole: MarketplaceRole | null;
  onRoleSelect: (role: MarketplaceRole) => void;
  onNext: () => void;
}

export const RoleSelection = ({ selectedRole, onRoleSelect, onNext }: RoleSelectionProps) => {
  const roles = [
    {
      id: 'general_helper' as MarketplaceRole,
      icon: Package,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      title: 'After Helper',
      subtitle: 'General Assistant',
      description: 'Offer real-life help for afters and recovery',
      examples: 'Potrčko, setup/cleanup, errands, drivers, IV therapy assistant',
      priceExample: '€10-30/hour',
    },
    {
      id: 'wellness_support' as MarketplaceRole,
      icon: Heart,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20',
      title: 'Wellness & Mental Support',
      subtitle: 'Unofficial Therapist',
      description: 'Provide calming presence and emotional guidance',
      examples: 'Post-after talks, home visits, emotional reset sessions',
      priceExample: '€35-60/session',
      note: 'Experience-based guidance, no formal license required',
    },
    {
      id: 'dj_musician' as MarketplaceRole,
      icon: Music,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      title: 'DJ / Musician / Performer',
      subtitle: 'Live Music & Sets',
      description: 'Offer live performances and DJ sets',
      examples: 'Techno DJ, house music, live instruments, B2B sets',
      priceExample: '€100-500/event',
    },
    {
      id: 'event_staff' as MarketplaceRole,
      icon: Users,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      title: 'Event Staff',
      subtitle: 'Service & Operations',
      description: 'Provide professional event support',
      examples: 'Bartender, hostess, security, door control, photographer',
      priceExample: '€15-40/hour',
    },
    {
      id: 'vendor_store' as MarketplaceRole,
      icon: Store,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      title: 'Concept Store / Brand Vendor',
      subtitle: 'Shop & Products',
      description: 'Sell products in the AfterBefore ecosystem',
      examples: 'Rizle shop, AfterWear fashion, party essentials, merchandise',
      priceExample: 'Commission-based',
    },
    {
      id: 'props_rental' as MarketplaceRole,
      icon: Lightbulb,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      title: 'Props & Equipment Rental',
      subtitle: 'Event Gear',
      description: 'Rent out event equipment and decorations',
      examples: 'DJ equipment, lighting, sound systems, decorations',
      priceExample: '€20-200/day',
    },
    {
      id: 'nightlife_guide' as MarketplaceRole,
      icon: MapPin,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      title: 'Be My Guide',
      subtitle: 'Nightlife & Local Experience',
      description: 'Show visitors the underground scene and local culture',
      examples: 'Club tours, after party host, safety companion, cultural guide',
      priceExample: '€50-200/night',
      note: 'Perfect for locals who know the scene and want to guide foreigners',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Choose Your Role</h2>
        <p className="text-muted-foreground text-sm">
          Select the category that best describes the service you want to offer
        </p>
      </div>

      <div className="grid gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;

          return (
            <Card
              key={role.id}
              className={`glass-card interactive p-5 cursor-pointer transition-all ${
                isSelected
                  ? `border-2 ${role.borderColor} ${role.bgColor}`
                  : 'border-border/20'
              }`}
              onClick={() => onRoleSelect(role.id)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${role.bgColor}`}>
                  <Icon size={24} className={role.color} />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold">{role.title}</h3>
                      <p className="text-xs text-muted-foreground">{role.subtitle}</p>
                    </div>
                    {isSelected && (
                      <Badge className="bg-success/20 text-success border-success/30">
                        Selected
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm mb-3">{role.description}</p>

                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Examples: </span>
                      <span className="text-xs">{role.examples}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Typical Rate: </span>
                        <span className="text-xs font-semibold text-primary">{role.priceExample}</span>
                      </div>
                    </div>
                  </div>

                  {role.note && (
                    <div className="mt-3 p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground italic">ℹ️ {role.note}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Button
        className="w-full gradient-primary text-white h-12 text-lg font-semibold mt-6"
        onClick={onNext}
        disabled={!selectedRole}
      >
        Continue to Profile Details
      </Button>
    </div>
  );
};
