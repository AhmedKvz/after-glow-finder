import { useState } from 'react';
import { 
  User, 
  Settings, 
  Star, 
  Calendar, 
  Users, 
  Bell, 
  Moon, 
  Shield, 
  HelpCircle,
  LogOut,
  Crown,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { mockUser } from '@/data/mockData';
import { useDemoMode } from '@/contexts/DemoModeContext';

const Profile = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', action: () => {} },
        { icon: Star, label: 'My Reviews', action: () => {} },
        { icon: Calendar, label: 'Event History', action: () => {} },
        { icon: Crown, label: 'Upgrade to Pro', action: () => {}, badge: 'Premium' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { 
          icon: Bell, 
          label: 'Notifications', 
          action: () => setNotifications(!notifications),
          toggle: { checked: notifications, onChange: setNotifications }
        },
        { 
          icon: Moon, 
          label: 'Dark Mode', 
          action: () => setDarkMode(!darkMode),
          toggle: { checked: darkMode, onChange: setDarkMode }
        },
        { 
          icon: Sparkles, 
          label: 'Demo Mode', 
          action: toggleDemoMode,
          toggle: { checked: isDemoMode, onChange: toggleDemoMode },
          badge: isDemoMode ? 'ON' : 'OFF'
        },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & FAQ', action: () => {} },
        { icon: Shield, label: 'Privacy Policy', action: () => {} },
        { icon: Settings, label: 'App Settings', action: () => {} },
      ]
    },
    {
      title: 'Account',
      items: [
        { icon: LogOut, label: 'Sign Out', action: () => {}, destructive: true },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gradient-primary mb-6">
          Profile
        </h1>

        {/* User info card */}
        <Card className="glass-card p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/avatars/user.jpg" />
              <AvatarFallback className="text-xl font-semibold gradient-primary text-white">
                {mockUser.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold">{mockUser.name}</h2>
              <p className="text-muted-foreground">{mockUser.handle}</p>
              <p className="text-sm text-muted-foreground">{mockUser.city}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockUser.joinedEvents}</div>
              <div className="text-xs text-muted-foreground">Events Joined</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockUser.hostedEvents}</div>
              <div className="text-xs text-muted-foreground">Events Hosted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                <Star className="w-5 h-5 fill-accent text-accent" />
                {mockUser.rating}
              </div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
          </div>

          {/* Interests */}
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Music Interests</div>
            <div className="flex gap-2 flex-wrap">
              {mockUser.interests.map((interest) => (
                <Badge key={interest} variant="secondary" className="glass-card">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          {/* Demo mode indicator */}
          {isDemoMode && (
            <Card className="bg-accent/10 border-accent/20 p-3">
              <div className="flex items-center gap-2 text-accent">
                <Sparkles size={16} />
                <span className="text-sm font-medium">Demo Mode Active</span>
              </div>
              <p className="text-xs text-accent/80 mt-1">
                All actions will show success responses for demonstration
              </p>
            </Card>
          )}
        </Card>

        {/* Menu sections */}
        <div className="space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-3">{section.title}</h3>
              <Card className="glass-card overflow-hidden">
                {section.items.map((item, index) => {
                  const Icon = item.icon;
                  
                  return (
                    <div 
                      key={item.label}
                      className={`flex items-center justify-between p-4 ${
                        index < section.items.length - 1 ? 'border-b border-border/20' : ''
                      } ${item.toggle ? '' : 'cursor-pointer hover:bg-surface-hover transition-colors'} ${
                        item.destructive ? 'text-destructive' : ''
                      }`}
                      onClick={!item.toggle ? item.action : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge 
                            variant={item.badge === 'Premium' ? 'default' : 'secondary'}
                            className={item.badge === 'Premium' ? 'gradient-accent text-accent-foreground' : ''}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      
                      {item.toggle ? (
                        <Switch
                          checked={item.toggle.checked}
                          onCheckedChange={item.toggle.onChange}
                        />
                      ) : (
                        <div className="text-muted-foreground">›</div>
                      )}
                    </div>
                  );
                })}
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;