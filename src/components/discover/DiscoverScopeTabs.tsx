import { Button } from '@/components/ui/button';

interface DiscoverScopeTabsProps {
  eventScope: 'all' | 'public' | 'private';
  onScopeChange: (scope: 'all' | 'public' | 'private') => void;
}

const SCOPE_OPTIONS = [
  { value: 'all' as const, label: 'All' },
  { value: 'public' as const, label: 'Tickets' },
  { value: 'private' as const, label: 'Private Afters' },
];

export function DiscoverScopeTabs({
  eventScope,
  onScopeChange,
}: DiscoverScopeTabsProps) {
  return (
    <div className="flex gap-2 mb-4">
      {SCOPE_OPTIONS.map((option) => (
        <Button
          key={option.value}
          variant={eventScope === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onScopeChange(option.value)}
          className={eventScope === option.value ? 'gradient-primary' : 'glass-card'}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
