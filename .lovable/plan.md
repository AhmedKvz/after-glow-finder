

## RaverProfile Redesign

Full rewrite of `src/pages/Profile.tsx` with the user's new "RaverProfile" design. The JSX tags are stripped from the pasted code, so I'll reconstruct the complete component.

### Key Changes from Current Profile

1. **Visual redesign**: Cover/hero section with gradient background, grain texture overlay, avatar with level ring indicator, VIP crown badge
2. **New helper components**: `Patch` (badge display), `StatPill` (compact stat display), `getTrustTier()` / `getLevelProgress()` as standalone functions with config objects (`LEVEL_THRESHOLDS`, `LEVEL_COLORS`, `TRUST_TIERS`)
3. **Simplified tabs**: 4 tabs (Patches, Plan, Tickets, Settings) instead of 5 (Profile, Plan, Stats, Tickets, Reviews)
4. **Patches tab**: Shows completed quest patches in a grid + vibe badges + Raverboard CTA
5. **Settings tab**: Consolidated toggles (notifications, dark mode, demo mode) + edit profile + sign out
6. **Removed**: Separate stats tab, reviews tab, menu sections pattern, Card-based layout
7. **Added**: framer-motion animations, trust tier system, level color coding, "Missions" quick-nav button

### Technical Details

- Single file: `src/pages/Profile.tsx` — full rewrite
- Export name changes from `Profile` to `RaverProfile` but uses `export default` so App.tsx import stays the same
- No database changes — same queries to `profiles` and `quests` tables
- Removes `Card` import, adds `motion`/`AnimatePresence` from framer-motion
- Removes `ReviewsList` import (reviews tab gone), keeps `NightPlanList` and `MyTickets`
- Serbian text for patches section ("Završi misije da osvoji prve patches", "Vidi svoju poziciju u sceni")

