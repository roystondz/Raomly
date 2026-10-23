# 06 · Home and search

Status: approved

## Goal
A signed-in guest lands on a Home tab that matches the design. It has a greeting, a "Find your next stay" heading, a lavender prompt field, category chips that filter the stays, and large photo cards built from realistic local data. Typing in the prompt and submitting opens the Search tab, which shows ranked results for that sentence. The app uses Expo native tabs (Home, Search, Trips, Profile) and subtle motion.

## Decisions
- **Tab bar:** `NativeTabs` from `expo-router/unstable-native-tabs`, the system bar (Liquid Glass on iOS 26). `tintColor` = `colors.ink`. It can't draw the design's yellow circle behind the selected tab, and we accept that difference.
- **Tab order** follows the design: Home, Search, Trips, Profile. Search does **not** use `role="search"`, because that role moves it to a separate bubble on the right in iOS 26.
- **Tab icons** are SF Symbols on iOS and Material Symbols on Android, so the Lucide rule does not apply to the tab bar. Home is `house` with `house.fill` when selected (`md="home"`), then `magnifyingglass` / `search`, `calendar` / `calendar_today`, and `person` with `person.fill` (`md="person"`).
- **Search input** is the native header search bar (`headerSearchBarOptions`) in a Stack inside the Search tab. It is prefilled from the `q` param.
- **Search logic** is local until Sanity and Jev are wired up. It keeps the same split as the future backend:
  - Exact constraints are parsed in code and filter: price ("under $300", "below 300", "$300 or less", "max 300"), guests ("for 4", "4 guests/people"), pets ("pet friendly", "dog", "pets"), type (cabin, beach, city, villa) and amenities (hot tub, pool, wifi, fireplace, kitchen, parking, beach access, workspace).
  - Soft words (quiet, cozy, secluded, modern, romantic, views…) only rank, by matching each stay's `vibes` tags and description.
  - Results with equal scores sort by rating.
- **Trips** is an empty state for now. **Profile** shows the name and email, Sign out, and the dev-only "Open design system" button, which moves off home.
- **Data:** about 10 realistic stays in `src/data/stays.ts`, with remote Unsplash placeholder photos. This is local sample data, so there is no Sanity content change.
- **Prompt field:** a `TextInput` whose placeholder is the design's example sentence, shown in `ink` as in the design. Submitting from the keyboard or tapping the arrow searches the typed text. If the field is empty, it searches the example sentence.
- **Search icon button** (the tall pill beside the heading) opens the Search tab with no query.
- **Category chips** filter the Home list locally: All Stays, Cabins, Beach, City, Villas. Only one can be selected, and All is the default.
- **Avatar** is Clerk `user.imageUrl` on a `primary-50` circle. Tapping it goes to Profile.
- **Greeting** is "Hey, {firstName} 👋", using `user.firstName` or the first word of `fullName`, and falls back to "Hey there 👋".
- **Wordmark:** the design shows "roam" but `assets/images/logo.svg` is "roamly". Per the asset rule we use the existing `Logo`, and this is listed as a difference.
- **Stay cards on Home** don't navigate (there is no detail screen yet). The round chevron button is not shown as pressable, so it gives no fake feedback. Search results use the existing `ListingCard`.
- **Motion** (from the expo-animation skill gate):
  - Tab switches: none, the native default.
  - Home: no entrance animation, since it's seen many times a day.
  - Press feedback: scale 0.97, 120ms, `cubicBezier(0.23, 1, 0.32, 1)` CSS transition on the prompt arrow, search pill, chips and avatar.
  - Chip selection: a 150ms color transition.
  - Filtering the Home list: cards leave with `FadeOut` 150ms, enter with `FadeIn` 200ms, and the rest reflow with `LinearTransition` 250ms ease-out. This explains the change.
  - Search results: `FadeInDown` 250ms with a 40ms stagger each time a new query runs, because the guest is waiting on that content.
  - Every layout animation uses `ReduceMotion.System`. Reduce Motion keeps the fades and drops the translation and reflow movement.
  - No new dependencies, so no haptics (`expo-haptics` isn't installed).

## Out of scope
- Stay detail screen, saving and favorites, and real Trips content.
- Sanity, Jev, the search API route and PostHog events.
- Dates and date parsing.
- Android visual check, since only the iOS simulator is used.

## Design (estimated from the image at about 1.74 px/pt; every value is marked ≈ in code comments)
- **Screen:** `bg-surface`, `ScrollView` as the first child (so native tabs insets work), horizontal padding `px-5` (20), bottom padding so the last card clears the tab bar.
- **Header row:** `Logo` (height ≈ 40) on the left and the avatar `size-21` (84) `rounded-full bg-primary-50` on the right, top-aligned. The top padding is the safe-area inset plus ≈ 8.
- **Greeting:** `Text variant="title-sm" tone="muted"`, "Hey, Joanna 👋", ≈ 16 below the header row.
- **Heading row:** `Text variant="hero"` "Find your next stay" (wraps to 2 lines, `flex-1`). On the right, a search pill `w-15 h-21` (60×84), `rounded-full bg-surface-muted`, with a Lucide `Search` icon at 28, vertically centred to the heading.
- **Prompt field:** ≈ 24 below. `h-15` (60) `rounded-full bg-lavender`, `pl-5 pr-2`, `gap-3`, Lucide `Sparkles` at 22 (ink), a `TextInput` (`text-input font-sans-medium`, flex-1, placeholder in ink, `returnKeyType="search"`), and a `size-12` (48) `rounded-full bg-surface` button with Lucide `ArrowUpRight` at 24.
- **Chips:** ≈ 16 below. A wrapping row with `gap-2.5`, existing `Chip` size `md` (h-12):
  - Selected chips use the `tone="primary"` fill.
  - Unselected chips use a **new `Chip` prop `appearance="muted"`**: `bg-surface-muted border-surface-muted` instead of the outline. The design system gallery gets this variant too.
  - Icons: `House`, `TreePine`, `Waves`, `Building2`, `TreePalm`.
- **Stay cards:** ≈ 24 below, `gap-5` between cards. A new `src/components/home/featured-stay-card.tsx`:
  - Full-width `h-67` (268) card, `rounded-2xl corner-squircle overflow-hidden bg-surface-muted`, with an `expo-image` photo filling it.
  - A bottom gradient from transparent to `scrim`, using `experimental_backgroundImage` with `colors.scrim`, so the light text reads on any photo.
  - Top right (`top-4 right-4`): a rating pill `h-11 px-4 rounded-full bg-surface` with a `Star` at 20 filled ink and `Text variant="headline"` "4.9".
  - Bottom left (`left-5 bottom-5`): a `MapPin` at 18 in `on-ink` and `Text variant="caption" tone="on-ink"` for the location, then `Text variant="title" tone="on-ink"` for the title (2 lines max, right padding so it clears the button).
  - Bottom right (`right-4 bottom-4`): a `size-15` (60) `rounded-full bg-surface` circle with `ChevronRight` at 26.
- **Search tab:** a native large title "Search" with a header search bar (placeholder "Describe your stay").
  - A row of applied-filter `Badge`s (for example "Under $300", "Pets", "Cabin", "Hot tub") when the query has any.
  - A count line ("6 stays"), then `ListingCard`s with `gap-3`.
  - States:
    - **No query:** a hint and 3 tappable example sentences as muted chips.
    - **No results:** says which constraints removed everything and offers "Clear search".
  - Loading and error don't apply, because the search is local and synchronous.
- **Trips:** a centred `CalendarDays` icon, a "No trips yet" title, and muted body text.
- **Profile:** the avatar, name, email and a secondary "Sign out" button, plus the dev design system button.
- **Proposed new tokens:** none. All values map to existing spacing, radius, color and text tokens. The only addition is the `Chip` `appearance` prop.

## Steps

### 1. Native tabs and route structure
- Replace `src/app/(app)/_layout.tsx` with `NativeTabs`, using the triggers `home`, `search`, `trips` and `profile` with the icons and tint above.
- Keep `/home` as the route, because the root guard redirects there.
- Files:
  - `src/app/(app)/home.tsx`: rewritten in step 3.
  - `src/app/(app)/search/_layout.tsx`: a Stack with `headerShown: true` for `index`, `headerLargeTitleEnabled`, and a transparent header that shows the screen's background.
  - `src/app/(app)/search/index.tsx`
  - `src/app/(app)/trips.tsx`
  - `src/app/(app)/profile.tsx`, which moves Sign out and the design system button here.
- Check the SDK 58 NativeTabs and Stack docs (`https://docs.expo.dev/versions/v58.0.0/sdk/router-native-tabs/`) before writing.
- **Done when** the app shows four native tabs in the simulator and Sign out still returns to onboarding.

### 2. Data and search logic
- `src/data/stays.ts`: the `Stay` type and about 10 stays across all 4 types. Prices run $140–$650, and the stays vary in pets, guest counts and amenities. At least 3 must match "quiet pet friendly cabin with a hot tub under $300". Each stay has a `featured` flag and a `vibes` string array. An `amenityMeta` map gives each amenity key a label and a Lucide icon, for `ListingCard`.
- `src/search/parse-query.ts`: a pure function from a query to `{ maxPrice?, guests?, pets?, type?, amenities[], softTerms[] }`.
- `src/search/search-stays.ts`: filters on exact constraints and scores soft terms, returning `{ stays, constraints }`.
- **Done when** `tsc` passes. Then run a node check of parse and search against 6 realistic sentences, including "beach house for 6 under $400", "city loft with workspace" and "something cozy", and record the outputs.

### 3. Home screen
- Build `src/app/(app)/home.tsx` and `src/components/home/featured-stay-card.tsx` to the Design section.
- Add the `Chip` `appearance` prop and its gallery entry.
- Add a shared `src/components/ui/pressable-scale.tsx`: a Reanimated CSS-transition press scale of 0.97 over 120ms with `pressRetentionOffset`. Use it for the arrow, search pill, avatar and chips. `Chip` adopts it internally, replacing `active:opacity-80`.
- Submitting the prompt calls `router.navigate({ pathname: "/search", params: { q } })`.
- Chip filtering wraps cards in `Animated.View` with the entering, exiting and layout animations defined at module scope.
- **Done when** the screenshot matches the design (see Verification).

### 4. Search screen
- Read `q` with `useLocalSearchParams`, keep the query in state, and set the header search bar text from `q` through its ref (`setText`). Run the search when the search button is pressed and when `q` changes.
- Results use `ListingCard`. A new query bumps a `runId` key so the stagger replays only for new results.
- Build the empty-query and no-result states.
- **Done when** typing on Home and submitting lands on Search with the text in the bar and ranked results.

### 5. Trips and Profile placeholders
These match the Design section.

## Verification
- `npx expo lint` and `npx tsc --noEmit` pass.
- Node check of the search logic on 6+ sentences. Expected: "quiet pet friendly cabin with a hot tub under $300" returns only pet-friendly cabins with hot tubs at ≤ $300, ranked by the "quiet" match.
- iOS simulator dev build. Deep-link `roamly://home`, take a screenshot and compare it with the design. List every difference, fix it, and repeat.
- Deep-link `roamly://search?q=quiet%20pet%20friendly%20cabin%20with%20hot%20tub%20under%20%24300` and take a screenshot of the results. Then do the same for a query with no results and for no query.
- Use temporary code to show a non-All chip selected and screenshot it, because the simulator can't be tapped. Remove the code afterwards.
- Profile → Sign out still returns to onboarding. This is checked by code review if it can't be tapped.
- The motion feel (press scale, reflow) can only be judged on a device. It is listed as not verified.

## AGENTS.md updates
- **Expo → Navigation:**
  - `(app)` is `NativeTabs` with Home, Search, Trips and Profile. The tab bar uses SF and Material symbols, not Lucide.
  - Search takes its query as the `q` param.
- **Who owns what:** until the API exists, `src/search/` does the local version of the same split. Code-parsed constraints filter and soft terms only rank. Replace it, don't extend it, when Sanity and Jev are wired up.
- **Design system:**
  - Pressables that aren't list rows use `PressableScale` (0.97, 120ms).
  - Tab switches and frequently seen screens get no entrance animation.
  - Layout animations use `ReduceMotion.System`.
