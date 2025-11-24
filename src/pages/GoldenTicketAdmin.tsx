import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Ticket, Filter, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GoldenTicketBadge } from "@/components/GoldenTicketBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserForTicket {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  xp: number;
  trust_score: number;
  level: string;
  has_golden_ticket: boolean;
  lucky100_wins: number;
}

export default function GoldenTicketAdmin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [topXPUsers, setTopXPUsers] = useState<UserForTicket[]>([]);
  const [topTrustUsers, setTopTrustUsers] = useState<UserForTicket[]>([]);
  const [lucky100Winners, setLucky100Winners] = useState<UserForTicket[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Top XP users
      const { data: xpData } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, xp, trust_score, level, has_golden_ticket, lucky100_wins')
        .order('xp', { ascending: false })
        .limit(20);

      // Top Trust Score users
      const { data: trustData } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, xp, trust_score, level, has_golden_ticket, lucky100_wins')
        .order('trust_score', { ascending: false })
        .limit(20);

      // Lucky100 winners
      const { data: luckyData } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, xp, trust_score, level, has_golden_ticket, lucky100_wins')
        .gt('lucky100_wins', 0)
        .order('lucky100_wins', { ascending: false })
        .limit(20);

      setTopXPUsers(xpData || []);
      setTopTrustUsers(trustData || []);
      setLucky100Winners(luckyData || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const issueGoldenTickets = async () => {
    if (selectedUsers.size === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setIssuing(true);
    try {
      const promises = Array.from(selectedUsers).map(userId =>
        supabase.rpc('issue_golden_ticket', {
          _user_id: userId,
          _source: 'ManualReward',
          _notes: 'Issued by admin'
        })
      );

      await Promise.all(promises);
      
      toast.success(`Issued ${selectedUsers.size} Golden Ticket${selectedUsers.size > 1 ? 's' : ''}!`);
      setSelectedUsers(new Set());
      loadUsers();
    } catch (error) {
      console.error('Error issuing tickets:', error);
      toast.error('Failed to issue Golden Tickets');
    } finally {
      setIssuing(false);
    }
  };

  const UserCard = ({ user }: { user: UserForTicket }) => {
    const isSelected = selectedUsers.has(user.user_id);
    
    return (
      <Card
        className={`p-4 cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
        }`}
        onClick={() => toggleUserSelection(user.user_id)}
      >
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.avatar_url || ''} />
            <AvatarFallback>{user.display_name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{user.display_name}</span>
              {user.has_golden_ticket && <GoldenTicketBadge size="sm" />}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Level: {user.level}</span>
              <span>XP: {user.xp}</span>
              <span>Trust: {user.trust_score?.toFixed(0)}</span>
              {user.lucky100_wins > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Award className="w-3 h-3" />
                  {user.lucky100_wins}x Lucky
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Ticket className="w-6 h-6 text-yellow-400" />
                Golden Ticket Admin
              </h1>
              <p className="text-sm text-muted-foreground">Select users to award Golden Tickets</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Selection Actions */}
        {selectedUsers.size > 0 && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                <span className="font-semibold">{selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedUsers(new Set())}>
                  Clear
                </Button>
                <Button onClick={issueGoldenTickets} disabled={issuing}>
                  {issuing ? 'Issuing...' : `Issue ${selectedUsers.size} Golden Ticket${selectedUsers.size > 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* User Lists */}
        <Tabs defaultValue="xp" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="xp">Top XP</TabsTrigger>
            <TabsTrigger value="trust">Top Trust</TabsTrigger>
            <TabsTrigger value="lucky">Lucky100 Winners</TabsTrigger>
          </TabsList>

          <TabsContent value="xp" className="space-y-3 mt-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : topXPUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No users found</div>
            ) : (
              topXPUsers.map(user => <UserCard key={user.user_id} user={user} />)
            )}
          </TabsContent>

          <TabsContent value="trust" className="space-y-3 mt-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : topTrustUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No users found</div>
            ) : (
              topTrustUsers.map(user => <UserCard key={user.user_id} user={user} />)
            )}
          </TabsContent>

          <TabsContent value="lucky" className="space-y-3 mt-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : lucky100Winners.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No Lucky100 winners yet</div>
            ) : (
              lucky100Winners.map(user => <UserCard key={user.user_id} user={user} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
