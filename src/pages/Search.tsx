import { useState } from 'react';
import { Search as SearchIcon, Filter, MapPin, Clock, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EventCard } from '@/components/EventCard';
import { mockEvents } from '@/data/mockData';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('closest');
  const [showFilters, setShowFilters] = useState(false);

  const filterChips = [
    { id: 'techno', label: 'Techno', type: 'genre' },
    { id: 'house', label: 'House', type: 'genre' },
    { id: 'free', label: 'Free Entry', type: 'price' },
    { id: 'private', label: 'Private', type: 'access' },
    { id: 'tonight', label: 'Tonight', type: 'time' },
    { id: 'weekend', label: 'This Weekend', type: 'time' },
    { id: 'nearby', label: 'Nearby (2km)', type: 'distance' },
  ];

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const filteredEvents = mockEvents.filter(event => {
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (selectedFilters.includes('free') && event.price > 0) return false;
    if (selectedFilters.includes('private') && !event.isPrivate) return false;
    if (selectedFilters.includes('techno') && !event.genres.some(g => g.toLowerCase().includes('techno'))) return false;
    if (selectedFilters.includes('house') && !event.genres.some(g => g.toLowerCase().includes('house'))) return false;
    if (selectedFilters.includes('nearby') && event.distance > 2) return false;
    
    return true;
  });

  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-border/20">
        <h1 className="text-2xl font-bold mb-4">Search Events</h1>
        
        {/* Search bar */}
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search events, venues, hosts..."
            className="pl-10 glass-card border-border/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 mb-4">
          {filterChips.map((chip) => (
            <Badge
              key={chip.id}
              variant={selectedFilters.includes(chip.id) ? 'default' : 'secondary'}
              className={`whitespace-nowrap cursor-pointer transition-all ${
                selectedFilters.includes(chip.id) 
                  ? 'gradient-primary text-white' 
                  : 'glass-card hover:bg-surface-hover'
              }`}
              onClick={() => toggleFilter(chip.id)}
            >
              {chip.label}
            </Badge>
          ))}
        </div>

        {/* Sort and filter controls */}
        <div className="flex items-center justify-between">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 glass-card border-border/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card">
              <SelectItem value="closest">Closest</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="cheapest">Cheapest</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter size={16} />
            More Filters
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 py-4">
        <div className="flex-between mb-4">
          <h2 className="text-lg font-semibold">
            {filteredEvents.length} events found
          </h2>
          {selectedFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFilters([])}
              className="text-primary"
            >
              Clear filters
            </Button>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="flex-center py-12">
            <div className="text-center">
              <SearchIcon className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setSelectedFilters([]);
              }}>
                Reset Search
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;