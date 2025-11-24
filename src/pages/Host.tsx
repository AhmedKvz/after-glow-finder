import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreateEventModal } from '@/components/CreateEventModal';
import { EventManageModal } from '@/components/EventManageModal';
import { ClubProfileSetupModal } from '@/components/ClubProfileSetupModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Host = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasClubProfile, setHasClubProfile] = useState(false);
  const [isClub, setIsClub] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[Host] User changed:', user?.id, 'Auth loading:', authLoading);
    if (!authLoading && user) {
      console.log('[Host] Auth ready, checking club status');
      checkClubStatus();
    }
  }, [user, authLoading]);

  const checkClubStatus = async () => {
    if (!user) return;

    // Check if user has club role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'club')
      .maybeSingle();

    if (!roleData) {
      // Not a club, redirect to discover
      navigate('/discover');
      return;
    }

    setIsClub(true);

    // Check if club has a profile
    const { data: profileData } = await supabase
      .from('club_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profileData) {
      // No profile, show setup modal
      setHasClubProfile(false);
      setShowProfileSetup(true);
    } else {
      setHasClubProfile(true);
      loadMyEvents();
    }
  };

  useEffect(() => {
    console.log('[Host] myEvents updated:', myEvents.length, myEvents);
  }, [myEvents]);

  const loadMyEvents = async () => {
    if (!user) {
      console.log('[Host] No user, skipping load');
      return;
    }
    
    console.log('[Host] Loading events for user:', user.id);
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('host_id', user.id)
      .order('date', { ascending: true });

    console.log('[Host] Query result:', { 
      dataCount: data?.length, 
      error,
      rawData: data 
    });

    if (error) {
      console.error('[Host] Error loading events:', error);
    }

    // Debug: Try loading all events without filter
    const { data: allEvents, error: allError } = await supabase
      .from('events')
      .select('*')
      .limit(5);
    
    console.log('[Host] All events (no filter):', allEvents?.length, allEvents);

    if (data) {
      setMyEvents(data);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gradient-primary">
              Host Events
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your events
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="gradient-primary"
            size="sm"
            disabled={!hasClubProfile}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>

        {/* My Events */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">My Events</h2>
          
          {(loading || authLoading) ? (
            <Card className="glass-card p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            </Card>
          ) : myEvents.length === 0 ? (
            <Card className="glass-card p-8 text-center">
              <div className="max-w-sm mx-auto">
                <div className="w-16 h-16 rounded-full gradient-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">No events yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first event to start hosting!
                </p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="gradient-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Event
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {myEvents.map((event) => (
                <Card key={event.id} className="glass-card p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()} • {event.location}
                      </p>
                      {event.music_tags && event.music_tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {event.music_tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Capacity: {event.capacity} • {event.start_time} - {event.end_time}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedEvent(event)}
                    >
                      Manage
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass-card p-4">
              <p className="text-2xl font-bold text-primary">{myEvents.length}</p>
              <p className="text-sm text-muted-foreground">Total Events</p>
            </Card>
            <Card className="glass-card p-4">
              <p className="text-2xl font-bold text-primary">
                {myEvents.filter(e => new Date(e.date) > new Date()).length}
              </p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </Card>
          </div>
        </div>
      </div>

      <ClubProfileSetupModal
        open={showProfileSetup}
        onOpenChange={setShowProfileSetup}
        onSuccess={() => {
          setHasClubProfile(true);
          loadMyEvents();
        }}
      />

      <CreateEventModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={loadMyEvents}
      />

      {selectedEvent && (
        <EventManageModal
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
          event={selectedEvent}
          onSuccess={loadMyEvents}
        />
      )}
    </div>
  );
};

export default Host;
