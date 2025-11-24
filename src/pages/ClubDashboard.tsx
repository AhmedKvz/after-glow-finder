import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Music, Calendar, Users, Settings, Lock } from 'lucide-react';
import { PrivateAfterRequests } from '@/components/PrivateAfterRequests';
import { useState } from 'react';

const ClubDashboard = () => {
  const { user } = useAuth();
  const [showAfterRequests, setShowAfterRequests] = useState(false);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Club Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Manage your venue and events.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Events</h3>
                <p className="text-sm text-muted-foreground">Manage your events</p>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              View Events
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Attendees</h3>
                <p className="text-sm text-muted-foreground">View your guests</p>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              View Attendees
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Music className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Venue</h3>
                <p className="text-sm text-muted-foreground">Edit venue details</p>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              Edit Venue
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-600/10 rounded-lg">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Private After Requests</h3>
                <p className="text-sm text-muted-foreground">Review access requests</p>
              </div>
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => setShowAfterRequests(!showAfterRequests)}
            >
              {showAfterRequests ? 'Hide Requests' : 'View Requests'}
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Settings</h3>
                <p className="text-sm text-muted-foreground">Configure your club</p>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              Open Settings
            </Button>
          </Card>
        </div>

        {/* Private After Requests Section */}
        {showAfterRequests && user && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-amber-400" />
              Private After Requests
            </h2>
            <PrivateAfterRequests hostId={user.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubDashboard;
