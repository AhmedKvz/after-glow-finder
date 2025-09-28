import { useState } from 'react';
import { ArrowLeft, Camera, MapPin, Users, Clock, Lock, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useToast } from '@/hooks/use-toast';

interface EventForm {
  title: string;
  description: string;
  djName: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: string;
  price: string;
  genres: string[];
  isPrivate: boolean;
  ticketType: 'free' | 'external' | 'stripe';
  bringOwnDrinks: boolean;
  allowPlusOnes: boolean;
  maxPlusOnes: number;
}

const Host = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<EventForm>({
    title: '',
    description: '',
    djName: '',
    startTime: '',
    endTime: '',
    location: '',
    capacity: '',
    price: '0',
    genres: [],
    isPrivate: false,
    ticketType: 'free',
    bringOwnDrinks: false,
    allowPlusOnes: false,
    maxPlusOnes: 2,
  });
  
  const { isDemoMode, showDemoSuccess } = useDemoMode();
  const { toast } = useToast();

  const totalSteps = 4;
  const genreOptions = ['Techno', 'House', 'Deep House', 'Minimal', 'Trance', 'Hard Techno', 'Progressive'];

  const updateForm = (field: keyof EventForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleGenre = (genre: string) => {
    updateForm('genres', 
      form.genres.includes(genre)
        ? form.genres.filter(g => g !== genre)
        : [...form.genres, genre]
    );
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isDemoMode) {
      toast({
        title: "Event Created Successfully! 🎉",
        description: "Your afterparty is now live and ready for guests.",
      });
      showDemoSuccess("Event created and published");
    }
    // Reset form
    setForm({
      title: '',
      description: '',
      djName: '',
      startTime: '',
      endTime: '',
      location: '',
      capacity: '',
      price: '0',
      genres: [],
      isPrivate: false,
      ticketType: 'free',
      bringOwnDrinks: false,
      allowPlusOnes: false,
      maxPlusOnes: 2,
    });
    setStep(1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gradient-primary mb-2">
                Create Your Event
              </h2>
              <p className="text-muted-foreground">
                Let's start with the basics
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">Event Title</Label>
                <Input
                  id="title"
                  placeholder="AFTER @ Your Place - Genre Session"
                  className="glass-card border-border/20 mt-2"
                  value={form.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell people what makes your event special..."
                  className="glass-card border-border/20 mt-2 min-h-[100px]"
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="djName" className="text-sm font-medium">DJ Name (Optional)</Label>
                <Input
                  id="djName"
                  placeholder="Who's playing tonight?"
                  className="glass-card border-border/20 mt-2"
                  value={form.djName}
                  onChange={(e) => updateForm('djName', e.target.value)}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Music Genres</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {genreOptions.map((genre) => (
                    <Badge
                      key={genre}
                      variant={form.genres.includes(genre) ? 'default' : 'secondary'}
                      className={`cursor-pointer transition-all ${
                        form.genres.includes(genre)
                          ? 'gradient-primary text-white'
                          : 'glass-card hover:bg-surface-hover'
                      }`}
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gradient-primary mb-2">
                When & Where
              </h2>
              <p className="text-muted-foreground">
                Set the time and location
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime" className="text-sm font-medium">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    className="glass-card border-border/20 mt-2"
                    value={form.startTime}
                    onChange={(e) => updateForm('startTime', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime" className="text-sm font-medium">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    className="glass-card border-border/20 mt-2"
                    value={form.endTime}
                    onChange={(e) => updateForm('endTime', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                  <MapPin size={16} />
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="Enter address or venue name"
                  className="glass-card border-border/20 mt-2"
                  value={form.location}
                  onChange={(e) => updateForm('location', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="capacity" className="text-sm font-medium flex items-center gap-2">
                  <Users size={16} />
                  Capacity
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="Maximum number of guests"
                  className="glass-card border-border/20 mt-2"
                  value={form.capacity}
                  onChange={(e) => updateForm('capacity', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gradient-primary mb-2">
                Privacy & Access
              </h2>
              <p className="text-muted-foreground">
                Control who can join your event
              </p>
            </div>

            <div className="space-y-6">
              <Card className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Lock size={16} />
                      <Label className="text-sm font-medium">Private Event</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Guests need approval to join
                    </p>
                  </div>
                  <Switch
                    checked={form.isPrivate}
                    onCheckedChange={(checked) => updateForm('isPrivate', checked)}
                  />
                </div>
              </Card>

              <Card className="glass-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="text-sm font-medium">Allow +1/+2 Requests</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Let guests bring friends
                    </p>
                  </div>
                  <Switch
                    checked={form.allowPlusOnes}
                    onCheckedChange={(checked) => updateForm('allowPlusOnes', checked)}
                  />
                </div>
                
                {form.allowPlusOnes && (
                  <div>
                    <Label className="text-sm font-medium">Max +1s per person</Label>
                    <Select 
                      value={form.maxPlusOnes.toString()} 
                      onValueChange={(value) => updateForm('maxPlusOnes', parseInt(value))}
                    >
                      <SelectTrigger className="glass-card border-border/20 mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        <SelectItem value="1">+1 only</SelectItem>
                        <SelectItem value="2">Up to +2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </Card>

              <Card className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="text-sm font-medium">Bring Own Drinks</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      BYOB policy for your event
                    </p>
                  </div>
                  <Switch
                    checked={form.bringOwnDrinks}
                    onCheckedChange={(checked) => updateForm('bringOwnDrinks', checked)}
                  />
                </div>
              </Card>

              {form.isPrivate && (
                <Card className="glass-card p-4 border-accent/20">
                  <p className="text-sm text-accent-foreground">
                    💡 Private events get higher engagement and better crowd quality
                  </p>
                </Card>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gradient-primary mb-2">
                Pricing & Tickets
              </h2>
              <p className="text-muted-foreground">
                Set your ticket pricing
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Ticket Type</Label>
                <Select 
                  value={form.ticketType} 
                  onValueChange={(value: any) => updateForm('ticketType', value)}
                >
                  <SelectTrigger className="glass-card border-border/20 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="free">Free Entry</SelectItem>
                    <SelectItem value="external">External Link</SelectItem>
                    <SelectItem value="stripe">Sell Tickets (Stripe)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.ticketType !== 'free' && (
                <div>
                  <Label htmlFor="price" className="text-sm font-medium">
                    Ticket Price (€)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="15"
                    className="glass-card border-border/20 mt-2"
                    value={form.price}
                    onChange={(e) => updateForm('price', e.target.value)}
                  />
                </div>
              )}

              {/* Event Preview */}
              <Card className="glass-card p-4 mt-6">
                <h3 className="font-semibold mb-2">Event Preview</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Title:</strong> {form.title || 'Untitled Event'}</div>
                  <div><strong>DJ:</strong> {form.djName || 'TBA'}</div>
                  <div><strong>Location:</strong> {form.location || 'TBA'}</div>
                  <div><strong>Capacity:</strong> {form.capacity || '0'} guests</div>
                  <div><strong>Price:</strong> {form.price === '0' ? 'Free' : `€${form.price}`}</div>
                  <div><strong>Privacy:</strong> {form.isPrivate ? 'Private' : 'Public'}</div>
                  <div><strong>BYOB:</strong> {form.bringOwnDrinks ? 'Yes' : 'No'}</div>
                  <div><strong>+1s:</strong> {form.allowPlusOnes ? `Up to +${form.maxPlusOnes}` : 'No'}</div>
                  <div><strong>Genres:</strong> {form.genres.join(', ') || 'None selected'}</div>
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-border/20">
        <div className="flex items-center gap-3 mb-4">
          {step > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft size={16} />
            </Button>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold">Host Event</h1>
            <p className="text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="h-full rounded-full gradient-primary transition-all duration-500"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {renderStep()}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setStep(1)}
            disabled={step === 1}
          >
            Reset
          </Button>
          <Button
            className="flex-1 gradient-primary text-white shadow-primary"
            onClick={handleNext}
          >
            {step < totalSteps ? 'Continue' : 'Create Event'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Host;