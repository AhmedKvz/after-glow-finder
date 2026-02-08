import { Calendar, Clock, MapPin, Flame, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeatBadge } from '@/components/HeatBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNightPlan } from '@/hooks/useNightPlan';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function NightPlanList() {
  const { nightPlan, loading, removeFromNightPlan } = useNightPlan();
  const navigate = useNavigate();

  const handleRemove = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await removeFromNightPlan(eventId);
    if (success) {
      toast.success('Uklonjeno iz Night Plan-a');
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (nightPlan.length === 0) {
    return (
      <Card className="glass-card p-8 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <h3 className="font-semibold mb-2">Tvoj Night Plan je prazan</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Swipe-uj desno na evente da ih dodaš u plan
        </p>
        <Button onClick={() => navigate('/discover')} variant="outline">
          Otkrij evente
        </Button>
      </Card>
    );
  }

  // Group by date
  const groupedByDate = nightPlan.reduce((acc, item) => {
    if (!item.event) return acc;
    const date = item.event.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, typeof nightPlan>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedByDate).map(([date, items]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {format(new Date(date), 'EEEE, d. MMMM')}
          </h3>
          
          <div className="space-y-3">
            {items.map(item => {
              if (!item.event) return null;
              const event = item.event;
              
              return (
                <Card 
                  key={item.id}
                  className="glass-card p-4 cursor-pointer hover:bg-accent/10 transition-colors"
                  onClick={() => navigate(`/event/${event.id}`)}
                >
                  <div className="flex gap-3">
                    {/* Poster thumbnail */}
                    {event.poster_url && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={event.poster_url} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Event details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold truncate">{event.title}</h4>
                        {event.heat_badge && (
                          <HeatBadge 
                            heatScore={event.heat_score || 0} 
                            heatBadge={event.heat_badge as any} 
                            size="sm" 
                          />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.start_time?.slice(0, 5)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.public_location_label || event.location}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {event.event_type === 'club' ? 'Club' : 
                           event.event_type === 'cafe' ? 'Café' : 'Private'}
                        </Badge>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                          onClick={(e) => handleRemove(event.id, e)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
