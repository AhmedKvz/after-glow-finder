

## Raverboard Redesign

Full rewrite of `src/pages/Leaderboard.tsx` — the user provided a redesigned "Raverboard" component with stripped JSX tags.

### Key Changes

1. **Renamed**: `Leaderboard` → `Raverboard` (default export, so routing unaffected)
2. **Extended data model**: `LeaderboardUser` → `RaverEntry` with additional fields: `city`, `trust_score`, `events_attended`, `lucky100_wins`, `vip_status`, `music_tags`
3. **3 boards instead of 2**: XP, Hosts, **Trust** (new tab sorted by `trust_score`)
4. **New `LEVEL_COLORS` config**: Each level maps to `{ text, bg, border }` object (richer than single color string)
5. **Rank styling**: Top 3 get gradient backgrounds via `RANK_ACCENTS` + `RANK_GLOW` shadow arrays
6. **`RaverCard` component**: Shows rank badge, avatar with VIP crown, level pill, city, music tags (max 2), mini stats row (events, badges count, lucky wins), and primary metric display
7. **`TopThreePodium` component**: Visual podium layout with avatars for top 3 in each board
8. **`RankBadge` component**: Crown for #1, Trophy for #2, Award for #3, `#N` for rest
9. **"YOU" indicator**: Highlights current user's card
10. **Header redesign**: "AfterBefore Raverboard" branding with category legend dots (XP/Host/Trust)
11. **Serbian text**: "Ko je deo scene. Ko gradi kulturu.", "Učitavanje scene...", "Scena je prazna. Budi prvi."
12. **New icons**: `Flame, Users, Music, Shield, MapPin` added; `GoldenTicketBadge` import removed

### Technical Details

- Single file: `src/pages/Leaderboard.tsx` — full rewrite
- No database changes — queries same `profiles` table with expanded `select` fields
- Uses `useAuth` hook (new import) to identify current user for "YOU" badge
- Removes `Card`, `Button`, `GoldenTicketBadge` imports
- Navigation to `/raver/${user_id}` on card click (route may not exist yet — cosmetic for now)

