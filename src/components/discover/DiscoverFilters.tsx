import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface DiscoverFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  genreFilter: string;
  onGenreChange: (value: string) => void;
  dateFilter: 'all' | 'today' | 'tomorrow';
  onDateChange: (value: 'all' | 'today' | 'tomorrow') => void;
  freeOnly: boolean;
  onFreeOnlyChange: (value: boolean) => void;
}

export function DiscoverFilters({
  searchQuery,
  onSearchChange,
  genreFilter,
  onGenreChange,
  dateFilter,
  onDateChange,
  freeOnly,
  onFreeOnlyChange,
}: DiscoverFiltersProps) {
  return (
    <>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search events, genres, venues..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 glass-card"
        />
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        {/* Genre Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {['all', 'Techno', 'House', 'RnB', 'Drum & Bass', 'Hip Hop'].map((genre) => (
            <Button
              key={genre}
              variant={genreFilter === genre ? 'default' : 'outline'}
              size="sm"
              onClick={() => onGenreChange(genre)}
              className={`whitespace-nowrap ${genreFilter === genre ? 'gradient-primary' : 'glass-card'}`}
            >
              {genre === 'all' ? 'All Genres' : genre}
            </Button>
          ))}
        </div>
        
        {/* Date Filters & Free Only */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All Dates' },
              { value: 'today', label: 'Today' },
              { value: 'tomorrow', label: 'Tomorrow' },
            ].map((option) => (
              <Button
                key={option.value}
                variant={dateFilter === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onDateChange(option.value as 'all' | 'today' | 'tomorrow')}
                className={`${dateFilter === option.value ? 'gradient-primary' : 'glass-card'}`}
              >
                {option.label}
              </Button>
            ))}
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={freeOnly}
              onCheckedChange={(checked) => onFreeOnlyChange(checked === true)}
            />
            <span className="text-sm text-muted-foreground">Free events only</span>
          </label>
        </div>
      </div>
    </>
  );
}
