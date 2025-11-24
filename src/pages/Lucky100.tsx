import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Gift, Trophy, Sparkles, TrendingUp, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface LuckyWinner {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  };
  events: {
    title: string;
  };
}

const Lucky100 = () => {
  const navigate = useNavigate();
  const [globalTicketCount, setGlobalTicketCount] = useState(3847);
  const [nextLuckyTicket, setNextLuckyTicket] = useState(4000);
  const [lastWinner, setLastWinner] = useState<LuckyWinner | null>(null);
  const [winners, setWinners] = useState<LuckyWinner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLuckyData();
  }, []);

  const loadLuckyData = async () => {
    // Load last 10 lucky winners
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        id,
        user_id,
        event_id,
        created_at,
        profiles:user_id(display_name, avatar_url),
        events:event_id(title)
      `)
      .eq('is_lucky100_winner', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading lucky winners:', error);
    } else if (data && data.length > 0) {
      setLastWinner(data[0] as any);
      setWinners(data as any);
    }

    setLoading(false);
  };

  const ticketsUntilNext = nextLuckyTicket - globalTicketCount;
  const progressToNext = (globalTicketCount / nextLuckyTicket) * 100;

  return (
    <div className="min-h-screen bg-background pb-safe-bottom">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-600/20 via-orange-600/20 to-pink-600/20 p-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/gamification')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Gift className="w-8 h-8 text-amber-400" />
                Lucky 100
              </h1>
              <p className="text-muted-foreground">
                Every 100th ticket wins big!
              </p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Info className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card">
                <DialogHeader>
                  <DialogTitle>How Lucky 100 Works</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    Every 100th ticket purchased across all events wins the Lucky 100 prize! 🎉
                  </p>
                  <p>
                    When you purchase a ticket, you automatically enter the Lucky 100 draw. 
                    If your ticket is the 100th, 200th, 300th (and so on), you become a Lucky Winner!
                  </p>
                  <p className="font-semibold text-primary">
                    Lucky Winners receive:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>+500 XP bonus</li>
                    <li>Exclusive "Lucky 100" badge</li>
                    <li>Special profile highlight</li>
                    <li>Bragging rights! 😎</li>
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 space-y-6 pb-24">
        {/* Global Ticket Counter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="glass-card p-6 border-2 border-amber-400/30">
            <div className="text-center mb-4">
              <div className="text-6xl font-bold text-gradient-primary mb-2">
                {globalTicketCount.toLocaleString()}
              </div>
              <p className="text-muted-foreground">Global Tickets Sold</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next Lucky Ticket</span>
                <span className="font-semibold text-amber-400">
                  #{nextLuckyTicket}
                </span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-600 to-orange-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {ticketsUntilNext} tickets until next Lucky Winner! 🎰
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Last Winner Card */}
        {lastWinner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card p-6 border-2 border-amber-400/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2">
                <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
              </div>

              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Latest Lucky Winner
              </h3>

              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-amber-400">
                  <AvatarImage src={lastWinner.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="bg-amber-600/20">
                    {lastWinner.profiles?.display_name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="font-semibold text-lg">
                    {lastWinner.profiles?.display_name || 'Lucky User'}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Won on: {lastWinner.events?.title || 'Event'}
                  </p>
                  <p className="text-xs text-amber-400 mt-1">
                    {new Date(lastWinner.created_at).toLocaleDateString()}
                  </p>
                </div>

                <Badge className="bg-amber-600/20 text-amber-300 border-amber-600/40">
                  Lucky 100
                </Badge>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Winner History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Lucky Winners
            </h3>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading winners...
              </div>
            ) : winners.length > 0 ? (
              <div className="space-y-3">
                {winners.map((winner, index) => (
                  <div
                    key={winner.id}
                    className="flex items-center gap-3 glass-card p-3 rounded-lg"
                  >
                    <div className="text-lg font-bold text-muted-foreground w-8">
                      #{index + 1}
                    </div>

                    <Avatar className="w-10 h-10">
                      <AvatarImage src={winner.profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {winner.profiles?.display_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {winner.profiles?.display_name || 'Lucky User'}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {winner.events?.title || 'Event'}
                      </p>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {new Date(winner.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">
                  No winners yet. Be the first! 🎉
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Lucky100;