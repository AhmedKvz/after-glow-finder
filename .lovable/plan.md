

## Add Season Leaderboard Navigation Links

The user wants the Season Leaderboard (`/season`) to be discoverable from existing pages. Currently there's no link to it anywhere in the UI.

### Changes

**1. `src/pages/Raverboard.tsx`** — Add a "Season Board" button below the header, before the tabs section (around line 322). A styled banner/button linking to `/season`:
```
navigate('/season') → "🏆 Season Board — Winter 2025 · Top 3 osvajaju putovanje"
```

**2. `src/pages/Gamification.tsx`** — Add a "Season" button in the quick-nav grid (after the existing Leaderboard button, around line 267). Same style as the existing buttons:
```
navigate('/season') → Calendar icon + "Season Board"
```

**3. Database migration** — Apply the user's provided SQL to add `period_label` column and re-seed weekly/monthly data. This replaces the previous migration's schema with the complete version including:
- `period_label` column on `season_leaderboard`
- Weekly/monthly seed data from `quests` table
- Public SELECT policy on `season_destination_votes` (currently restricted to authenticated)

**4. `src/pages/SeasonLeaderboard.tsx`** — Update the `loadBoard` query to also select `period_label` from `season_leaderboard` (minor, since the column now exists).

No other files need changes.

