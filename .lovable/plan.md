

## AfterMissions Quests Redesign

The user provided a redesigned Quests page ("AfterMissions") with significant UI and structural changes. The pasted code has JSX tags stripped, so I need to reconstruct the full component based on the visible logic and structure.

### What Changes

**Current state**: Basic quest list with 3 tabs (Daily/Weekly/Seasonal), simple cards, English text.

**New state**: Branded "AfterMissions" experience with:

1. **New imports**: `MapPin, Users, Mic2, Shield, Star, Clock, Gift` from lucide-react; `AnimatePresence` from framer-motion
2. **Mission categorization system**: Quests auto-categorized into SCENE/SOCIAL/CULTURE/EVENT based on title/description keywords, each with distinct color scheme and icon
3. **Category config**: `CATEGORY_CONFIG` object with label, icon, color, bg, glow per category
4. **Reset countdown**: `getResetCountdown()` — shows time until next Saturday midnight
5. **MissionPatch component**: Visual badge/patch per category with completion overlay
6. **Redesigned QuestCard**: Shows category label, Lucky 100 indicator for high-XP quests (>=150), expiry dates in Serbian locale, "Claim" button instead of "Complete"
7. **4 tabs instead of 3**: Daily, Weekly, Season, Legacy
8. **Legacy tab**: Shows completed quests as holographic achievement patches in a grid
9. **EmptyMissions component**: Serbian-language empty states per tab
10. **Header redesign**: "AfterBefore Missions" branding with progress bar showing completed/total ratio
11. **Category legend strip**: Shows SCENE/SOCIAL/CULTURE icons below header
12. **Serbian localization**: All UI text in Serbian

### Technical Details

- Single file change: `src/pages/Quests.tsx` — full rewrite
- No database changes needed — same `quests` table, same queries
- No new dependencies — all icons and motion APIs already available
- `getMissionCategory()` is a pure client-side classifier based on keyword matching
- Confetti reduced from 50 to 40 particles

### Implementation

Rewrite `src/pages/Quests.tsx` with the reconstructed JSX from the user's design, preserving all the logic (category system, countdown, mission patches, legacy tab, Serbian text) while ensuring proper JSX structure since the pasted code had tags stripped.

