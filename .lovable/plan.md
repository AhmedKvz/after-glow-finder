

## Public Raver Profile Page

### What We're Building

A new `/raver/:userId` public profile page that completes the navigation from Raverboard card clicks. Shows any user's profile with level-colored cover, stats, patches, reviews, and scene progress.

### Changes

**1. New file: `src/pages/PublicRaverProfile.tsx`**

Reconstruct the full component from the user's stripped JSX. Key elements:

- **`LEVEL_META`** config: maps each level (Newbie→Legend) to `{ text, bg, border, gradient }` for the cover section
- **`TRUST_TIERS`** + `getLevelProgress` helpers (same pattern used in Profile/Leaderboard)
- **`Stat` component**: compact stat pill (value + label)
- **Cover section**: gradient background from `LEVEL_META[level].gradient`, grain texture overlay, back button, VIP crown badge, "Edit Profile" button (only when `isOwn`)
- **Identity section**: Avatar with level/trust badges, display name, city, bio, music tags
- **Stats row**: 4 `Stat` pills (Events, Hosted, Trust, Lucky)
- **XP progress bar**: Level label + XP count + Progress component
- **3 tabs**:
  - **Patches**: Grid of completed quests (icon + title + xp badge) + vibe badges section
  - **Reviews**: `<ReviewsList userId={userId} />`
  - **Scene**: Progress bars for events_attended, afters_hosted, trust_score, lucky100_wins with icons and max values
- Loads data from `profiles` table (single row by `user_id`) and `quests` table (completed, limit 9)
- Uses `useParams<{ userId: string }>()`, `useAuth` for `isOwn` check, `useNavigate` for back/edit

**2. Update `src/App.tsx`**

- Import `PublicRaverProfile` from `./pages/PublicRaverProfile`
- Add route: `<Route path="raver/:userId" element={<PublicRaverProfile />} />` inside the Layout routes

### Technical Notes

- No database changes needed — `profiles` has public SELECT RLS, `quests` RLS restricts to own user (acceptable for MVP)
- `user_reviews` table used by `ReviewsList` may not exist yet — component handles empty state gracefully
- framer-motion used for entry animations (already installed)

