import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreateEventModal } from '@/components/CreateEventModal';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Host = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background safe-top">
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-bold text-gradient-primary mb-6">
          Host Event
        </h1>

        <Card className="glass-card p-8 text-center mb-6">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">Create Your After</h2>
          <p className="text-muted-foreground mb-6">
            Host a memorable night and connect with your community
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="gradient-primary shadow-primary"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Event
          </Button>
        </Card>

        <div className="space-y-4">
          <h3 className="font-semibold">Why Host with Us?</h3>
          <div className="grid gap-4">
            <Card className="glass-card p-4">
              <div className="font-medium mb-1">🎯 Reach Your Crowd</div>
              <p className="text-sm text-muted-foreground">
                Connect with people who love your music style
              </p>
            </Card>
            <Card className="glass-card p-4">
              <div className="font-medium mb-1">💳 Easy Check-ins</div>
              <p className="text-sm text-muted-foreground">
                QR code system for seamless guest management
              </p>
            </Card>
            <Card className="glass-card p-4">
              <div className="font-medium mb-1">💬 Direct Communication</div>
              <p className="text-sm text-muted-foreground">
                Chat with guests and manage requests
              </p>
            </Card>
          </div>
        </div>
      </div>

      <CreateEventModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          setShowCreateModal(false);
          navigate('/discover');
        }}
      />
    </div>
  );
};

export default Host;