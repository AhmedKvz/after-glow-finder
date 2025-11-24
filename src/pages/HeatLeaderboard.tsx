import { useState, useEffect } from "react";
import { ArrowLeft, Flame, TrendingUp, Users, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { HeatBadge } from "@/components/HeatBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface HeatEvent {
  id: string;
  title: string;
  heat_score: number;
  heat_badge: string;
  watchlist_count: number;
  ticket_sales_count: number;
  private_request_count: number;
  event_type: string;
}

interface HeatClub {
  id: string;
  name: string;
  logo_image_url: string;
  heat_average: number;
  club_heat_rank: number;
}

export default function HeatLeaderboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [topEvents, setTopEvents] = useState<HeatEvent[]>([]);
  const [topClubs, setTopClubs] = useState<HeatClub[]>([]);
  const [topPrivateEvents, setTopPrivateEvents] = useState<HeatEvent[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<HeatEvent[]>([]);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    setLoading(true);
    try {
      // Top Events by heat score
      const { data: events } = await supabase
        .from('events')
        .select('id, title, heat_score, heat_badge, watchlist_count, ticket_sales_count, private_request_count, event_type')
        .order('heat_score', { ascending: false })
        .limit(20);

      setTopEvents(events || []);
      setTrendingEvents(events || []); // For MVP, trending = top heat

      // Top Clubs by heat average
      const { data: clubs } = await supabase
        .from('club_profiles')
        .select('id, name, logo_image_url, heat_average, club_heat_rank')
        .order('heat_average', { ascending: false })
        .limit(20);

      setTopClubs(clubs || []);

      // Top Private Events by request count
      const { data: privateEvents } = await supabase
        .from('events')
        .select('id, title, heat_score, heat_badge, watchlist_count, ticket_sales_count, private_request_count, event_type')
        .eq('event_type', 'private_host')
        .order('private_request_count', { ascending: false })
        .limit(20);

      setTopPrivateEvents(privateEvents || []);
    } catch (error) {
      console.error('Error loading heat leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const EventCard = ({ event, showRequests = false }: { event: HeatEvent; showRequests?: boolean }) => (
    <Card 
      className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={() => navigate(`/event/${event.id}`)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {showRequests ? event.private_request_count : event.watchlist_count} {showRequests ? 'requests' : 'wishlist'}
            </span>
            <span>·</span>
            <span>{event.ticket_sales_count} tickets</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <HeatBadge heatScore={event.heat_score} heatBadge={event.heat_badge as any} size="md" />
        </div>
      </div>
    </Card>
  );

  const ClubCard = ({ club, rank }: { club: HeatClub; rank: number }) => (
    <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="text-2xl font-bold text-muted-foreground w-8">
          #{rank}
        </div>
        <Avatar className="w-12 h-12">
          <AvatarImage src={club.logo_image_url} alt={club.name} />
          <AvatarFallback>{club.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{club.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Avg Heat: {club.heat_average.toFixed(1)}</span>
          </div>
        </div>
        {rank <= 3 && (
          <div className="text-3xl">
            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
          </div>
        )}
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center gap-4 p-4">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              Heat Leaderboards
            </h1>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center gap-4 p-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            Heat Leaderboards
          </h1>
        </div>
      </div>

      <Tabs defaultValue="events" className="p-4">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="events">
            <Flame className="w-4 h-4 mr-1" />
            Top Events
          </TabsTrigger>
          <TabsTrigger value="clubs">
            <TrendingUp className="w-4 h-4 mr-1" />
            Clubs
          </TabsTrigger>
          <TabsTrigger value="private">
            <Lock className="w-4 h-4 mr-1" />
            Private
          </TabsTrigger>
          <TabsTrigger value="trending">
            <TrendingUp className="w-4 h-4 mr-1" />
            Trending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-3">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">🔥 Hottest Events Right Now</h2>
            <p className="text-sm text-muted-foreground">Ranked by heat score</p>
          </div>
          {topEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </TabsContent>

        <TabsContent value="clubs" className="space-y-3">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">🏆 Top Clubs by Heat</h2>
            <p className="text-sm text-muted-foreground">Clubs with highest average heat score</p>
          </div>
          {topClubs.map((club, idx) => (
            <ClubCard key={club.id} club={club} rank={idx + 1} />
          ))}
        </TabsContent>

        <TabsContent value="private" className="space-y-3">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">🔒 Most Wanted Private Events</h2>
            <p className="text-sm text-muted-foreground">Private events with most access requests</p>
          </div>
          {topPrivateEvents.map(event => (
            <EventCard key={event.id} event={event} showRequests />
          ))}
        </TabsContent>

        <TabsContent value="trending" className="space-y-3">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">📈 Weekly Trending</h2>
            <p className="text-sm text-muted-foreground">Events with rapidly growing heat</p>
          </div>
          {trendingEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}