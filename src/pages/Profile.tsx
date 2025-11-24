import { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Star, 
  Calendar, 
  Bell, 
  Moon, 
  Shield, 
  HelpCircle,
  LogOut,
  Crown,
  Sparkles,
  Edit,
  Ticket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { EditProfileModal } from '@/components/EditProfileModal';
import { MyTickets } from '@/components/MyTickets';
import { ReviewsList } from '@/components/ReviewsList';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MessageSquare } from 'lucide-react';

interface ProfileData {
  display_name: string;
  bio?: string;
  city?: string;
  music_tags?: string[];
  avatar_url?: string;
}

const Profile = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProfileData(data);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', action: () => setShowEditModal(true) },
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
        { icon: LogOut, label: 'Sign Out', action: handleSignOut, destructive: true },
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background safe-top flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-top pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gradient-primary mb-6">
          Profile
        </h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* User info card */}
        <Card className="glass-card p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profileData?.avatar_url} />
              <AvatarFallback className="text-xl font-semibold gradient-primary text-white">
                {profileData?.display_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profileData?.display_name || 'User'}</h2>
              <p className="text-muted-foreground">@{user?.email?.split('@')[0]}</p>
              {profileData?.city && (
                <p className="text-sm text-muted-foreground">{profileData.city}</p>
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowEditModal(true)}
              className="glass-card"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>

          {/* Bio */}
          {profileData?.bio && (
            <p className="text-sm text-muted-foreground mb-4">{profileData.bio}</p>
          )}

          {/* Interests */}
          {profileData?.music_tags && profileData.music_tags.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Music Interests</div>
              <div className="flex gap-2 flex-wrap">
                {profileData.music_tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="glass-card">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

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
          </TabsContent>

          <TabsContent value="tickets">
            <MyTickets />
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-4">
              <Card className="glass-card p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  My Reviews
                </h3>
                <p className="text-sm text-muted-foreground">
                  Reviews from other users about your hosting and participation
                </p>
              </Card>
              {user && <ReviewsList userId={user.id} />}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <EditProfileModal 
        open={showEditModal} 
        onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) loadProfile(); // Reload profile after edit
        }} 
      />
    </div>
  );
};

export default Profile;