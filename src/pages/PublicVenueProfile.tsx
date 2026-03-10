import { useState, useEffect } from 'react';
import {
  ArrowLeft, MapPin, Calendar, Star, Users,
  Music, Clock, ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { ReviewsList } from '@/components/ReviewsList';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';

interface VenueData {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
}

interface VenueEvent {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  poster_url: string | null;
  music_tags: string[] | null;
  heat_score: number | null;
  event_type: string;
}

const PublicVenueProfile = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<VenueData | null>(null);
  const [events, setEvents] = useState<VenueEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (venueId) {
      loadVenue();
      loadEvents();
    } else {
      setLoading(false);
    }
  }, [venueId]);

  const loadVenue = async () => {
    const { data } = await supabase.from('venues').select('*').eq('id', venueId!).single();
    if (data) setVenue(data);
    setLoading(false);
  };

  const loadEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('id, title, date, start_time, end_time, poster_url, music_tags, heat_score, event_type')
      .eq('venue_id', venueId!)
      .order('date', { ascending: false })
      .limit(20);
    if (data) setEvents(data as VenueEvent[]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <MapPin className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">Venue nije pronađen.</p>
        <button onClick={() => navigate(-1)} className="text-primary text-sm">← Nazad</button>
      </div>
    );
  }

  const upcomingEvents = events.filter(e => e.date >= new Date().toISOString().slice(0, 10));
  const pastEvents = events.filter(e => e.date < new Date().toISOString().slice(0, 10));
  const initials = venue.name.slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pb-24"
    >
      {/* Cover */}
      <div className="relative h-40 bg-gradient-to-b from-primary/20 to-background overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/5 blur-2xl" />

        <div className="absolute top-4 left-4 z-10">
          <button onClick={() => navigate(-1)} className="w-9 h-9 glass-card rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-14 relative z-10 space-y-5">
        {/* Avatar + Name */}
        <div className="flex items-end gap-4">
          <Avatar className="w-20 h-20 border-4 border-background shadow-xl">
            <AvatarFallback className="text-xl font-bold bg-muted">{initials}</AvatarFallback>
          </Avatar>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{venue.name}</h1>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <MapPin className="w-3.5 h-3.5" />
            {venue.address}, {venue.city}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl bg-muted/50 border border-border/50">
            <span className="text-lg font-bold text-primary">{events.length}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Events</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl bg-muted/50 border border-border/50">
            <span className="text-lg font-bold text-amber-400">{upcomingEvents.length}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Upcoming</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-muted/50">
            <TabsTrigger value="upcoming" className="text-xs gap-1">
              <Calendar className="w-3.5 h-3.5" /> Upcoming
            </TabsTrigger>
            <TabsTrigger value="past" className="text-xs gap-1">
              <Clock className="w-3.5 h-3.5" /> Past
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4 space-y-3">
            {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
              <EventRow key={event.id} event={event} navigate={navigate} />
            )) : (
              <p className="text-center text-sm text-muted-foreground py-8">Nema nadolazećih eventova.</p>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4 space-y-3">
            {pastEvents.length > 0 ? pastEvents.map(event => (
              <EventRow key={event.id} event={event} navigate={navigate} />
            )) : (
              <p className="text-center text-sm text-muted-foreground py-8">Nema prošlih eventova.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

const EventRow = ({ event, navigate }: { event: any; navigate: any }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={() => navigate(`/event/${event.id}`)}
    className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50 cursor-pointer hover:bg-muted/60 transition-colors"
  >
    {event.poster_url ? (
      <img src={event.poster_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
    ) : (
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
        <Music className="w-5 h-5 text-primary" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm truncate">{event.title}</p>
      <p className="text-xs text-muted-foreground">
        {new Date(event.date).toLocaleDateString('sr-RS')} · {event.start_time?.slice(0, 5)}
      </p>
    </div>
    {event.heat_score > 0 && (
      <Badge variant="secondary" className="text-[10px]">🔥 {Math.round(event.heat_score)}</Badge>
    )}
  </motion.div>
);

export default PublicVenueProfile;
