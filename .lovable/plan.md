

## Season Leaderboard Page

### What We're Building

A new `/season` page — a seasonal competitive leaderboard where the top 3 XP earners win a community-voted travel destination. Features destination voting, a countdown timer, winners podium, and full ranked list.

### Database Changes (2 new tables)

**1. `season_leaderboard`** — tracks per-season XP/stats
```sql
CREATE TABLE public.season_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  season_name text NOT NULL DEFAULT 'Winter 2025',
  season_xp integer NOT NULL DEFAULT 0,
  season_events integer NOT NULL DEFAULT 0,
  season_quests integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, season_name)
);
-- RLS: SELECT for all authenticated, INSERT/UPDATE own rows
```

**2. `season_destination_votes`** — one vote per user per season
```sql
CREATE TABLE public.season_destination_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  season_name text NOT NULL DEFAULT 'Winter 2025',
  destination text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, season_name)
);
-- RLS: SELECT for all authenticated, INSERT own row (one per season enforced by unique constraint)
```

### Code Changes

**1. New file: `src/pages/SeasonLeaderboard.tsx`**
- Reconstruct the full JSX from the user's stripped code
- 3 destination cards with vote bars, countdown timer, winners podium, full ranked list
- Queries `season_leaderboard` joined with `profiles`, falls back to `profiles` if season table is empty
- Voting via insert into `season_destination_votes`

**2. Update `src/App.tsx`**
- Import `SeasonLeaderboard`
- Add route: `<Route path="season" element={<SeasonLeaderboard />} />`

### Technical Notes
- No foreign keys to `auth.users` — uses `user_id` uuid columns
- Season data is MVP/manual — no automatic XP accumulation triggers yet
- Fallback: if `season_leaderboard` is empty, uses `profiles.xp` directly so the page is never blank
- Voting is one-per-user enforced by unique constraint on `(user_id, season_name)`

