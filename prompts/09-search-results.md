# 09 · Search results from Sanity

Status: done

## Goal
The Search tab matches the search results design. A guest's sentence ("Cabins in California") is parsed in code into exact filters that run as GROQ against live Sanity stays, with any soft words ranking the results through embeddings. Filter chips under the bar toggle constraints and search again. PostHog records every search with whether it returned results, and a saved insight compares searches with and without results.

## Decisions
- **Search runs in the app, not in an API route** (the user chose this). `sanityFetch` reads the public CDN with values as `$params` and no token. Verified: the cabin filter with `pricePerNight <= $max` plus `score(text::semanticSimilarity($soft))` answered in 94 ms on `apicdn`. This replaces the AGENTS.md rule that semantic search goes through API routes. API routes stay for secrets and Jev.
- **Parsing stays in code.** The current `src/search/parse-query.ts` handles price, guests, pets, type, amenities and soft terms. It gains:
  - **Place.** State names map to region codes (all 50 states, so "California" becomes `CA`). Two-letter codes count only after "in" or "near" ("in CA").
  - **Cities.** A city matches only when it's one of the cities in the data, which come from one small cached query (`array::unique(*[_type=="property"].location.city)`). Nothing is guessed, so "cabin in the woods" never turns into a city filter.
  - **The 4 new amenities** (air conditioning, washer, EV charger, BBQ grill).
- **Exact constraints are GROQ filters**, applied only when parsed:
  - `propertyType == $type`
  - `pricePerNight <= $maxPrice`
  - `maxGuests >= $guests`
  - `houseRules.petsAllowed == true`
  - `count(amenities[@ in $amenities]) == count($amenities)`
  - `location.region == $region`
  - `lower(location.city) == $city`
  - Every query also requires a slug and a cover photo, the same as Home.
- **Soft terms only rank.** When there are any, the query adds `| score(text::semanticSimilarity($soft)) | order(_score desc, rating desc)`. Otherwise it uses `order(rating desc, title asc)`. Soft terms never filter.
- **Chips toggle filters** (the user chose this).
  - The chip set is fixed for each submitted query: one selected chip per parsed constraint, then up to 4 unselected suggestions that aren't already active. In order, the suggestions are "Under $300", "Pet Friendly", "Hot Tub" and "Quiet", which reproduces the design.
  - Tapping a chip adds or removes its constraint and searches again. The text in the bar doesn't change.
  - Submitting new text resets the chips.
- **Chip labels:**
  - Types: Cabins, Beach, City, Villas.
  - Place: the state name or city.
  - Price: "Under $N".
  - Guests: "N+ Guests".
  - Pets: "Pet Friendly".
  - Amenities: Title Case labels, such as "Hot Tub".
  - Soft terms: each word capitalized ("Quiet").
- **The filter (sliders) icon is left out** until a filter plan (the user chose this). This is a deliberate difference from the design.
- **Sort:** "Sort by Best match" opens a native action sheet (`ActionSheetIOS`, with `Alert` buttons on Android; no new dependency). The options are Best match (the query order), Lowest price, Highest price and Top rated. Sorting is done in the app on the returned list, which is at most 30 stays today, and sends no event.
- **Count:** "N stays" or "1 stay", counting the results. No pagination, since the dataset has 30 stays.
- **Header:**
  - The design's back button plus search pill replace the native large title and header search bar. The Search stack sets `headerShown: false`.
  - Back calls `router.navigate("/home")`, since Search is a tab root and has no history to go back to.
- **Result card:**
  - A new `src/components/search/search-result-card.tsx`. The design puts the heart beside the title, not over the photo, so this is a separate component from `ListingCard`. `ListingCard` stays in the gallery unchanged.
  - The card doesn't navigate (there's no detail screen). The heart keeps today's local saved state and the `stay_saved` and `stay_unsaved` events.
- **Card pills:** at most 2. Amenities the query asked for come first, then "Pet Friendly" when pets are allowed, then the stay's other amenities in data order.
  - The design shows "Ocean View", which isn't a data field, so it can never appear.
  - The design draws Pool with a wifi icon. The app uses `Waves` for Pool.
- **Amenity metadata:**
  - Moves to a new `src/search/amenities.ts`, covering all 12 keys from `studio/schemaTypes/constants.ts` with a label and a Lucide icon:
    - hot-tub: `Bath`
    - pool: `Waves`
    - wifi: `Wifi`
    - fireplace: `Flame`
    - kitchen: `UtensilsCrossed`
    - parking: `Car`
    - beach-access: `Umbrella`
    - workspace: `Laptop`
    - air-conditioning: `AirVent`
    - washer: `WashingMachine`
    - ev-charger: `PlugZap`
    - bbq-grill: `Beef`
  - `StayType` and `Amenity` move to `src/search/types.ts`.
  - `src/data/stays.ts` is deleted, since nothing uses it afterwards (Home already reads Sanity).
- **PostHog:**
  - `stay_search_completed` is sent once per finished request, with these properties:
    - `search_source`: `home`, `search_bar`, `suggested_query` or `chip`
    - `query_length`
    - `result_count`
    - `has_results`
    - `stay_type`: a fixed key, or null
    - `has_place`, `has_max_price`, `has_guests`, `pets`
    - `amenity_count`
    - `soft_term_count`
  - No typed text, city or region is sent.
  - `stay_search_failed` (`search_source`, `error_type`) is sent when the request fails, so failures are never counted as empty results.
  - `stay_search_submitted` stays as it is, marking intent. Aborted requests (superseded by a newer search) send nothing.
- **Insight** (created through the PostHog MCP): a Trends insight called "Searches with and without results". It counts `stay_search_completed` daily over the last 30 days, broken down by `has_results`. It is created after the event has arrived, so its schema can be checked first.
- **States:**
  - **No query:** the existing hint and the 3 example chips.
  - **Loading:** 3 skeleton rows, and the count row reads "Searching…".
  - **Error:** an `Alert tone="error"` reading "Couldn't load stays. Check your connection and try again.", plus a secondary "Try again" button.
  - **No results:** the existing "No stays match" block. Its button reads "Clear filters" when chips were changed, otherwise "Clear search".
  - Previous results stay visible while a chip search runs, dimmed to 60% opacity.
- **Motion:** results keep today's `FadeInDown` 250ms with a 40ms stagger for a newly submitted query only. Chip and sort changes reflow with no entrance animation. `ReduceMotion.System` is unchanged.

## Out of scope
- The filter sheet and sliders icon, dates, the stay detail screen, saving to a backend, and pagination.
- Jev and an API route.
- The design's yellow tab circle. Native tabs remain, an accepted difference from plan 06.
- Android visual check.

## Design (estimated from the image at about 1.81 px/pt; every value is marked ≈ in code comments)
- **Screen:** `bg-surface`. The first child is a `ScrollView` with `contentInsetAdjustmentBehavior="automatic"` so native tabs inset the bottom. The top padding is the safe-area inset plus ≈ 8.
- **Header row:** `px-4` (16), `gap-3` (12), items centered.
  - **Back:** `IconButton` with a **new variant `filled-sm`**: `size-13` (52), `bg-surface-muted`, `ChevronLeft` at 24, ink.
  - **Search pill:** `flex-1 h-13 rounded-full bg-surface-muted pl-4 pr-5 gap-3`, flex-row, centered. It holds a Lucide `Search` at 22 in ink and a `TextInput` (`text-input font-sans-medium text-ink flex-1`, placeholder "Describe your stay" using `colors.muted`, `returnKeyType="search"`, `autoCapitalize="none"`). There is no sliders icon.
- **Chips:** ≈ 12 below. A horizontal `ScrollView` with no indicator, `contentContainerClassName="px-4 gap-2.5"`, and `Chip` with a **new size `xs`**: `h-9` (36), `px-4`, `caption` text, icon 16.
  - Selected chips use the lavender tone, which is the default.
  - Unselected chips use `appearance="muted"`.
- **Count row:** ≈ 16 below. `px-4`, flex-row, space-between, baseline-aligned.
  - **Left:** `Text variant="body"` "124 stays".
  - **Right:** a pressable row with `gap-1`. It holds `Text variant="caption-regular" tone="muted"` "Sort by", `Text variant="headline"` "Best match", and `ChevronDown` at 18 in ink.
- **List:** ≈ 12 below. `px-4`, `gap-4` (16) between cards, and bottom padding that clears the tab bar.
- **Result card** (`search-result-card.tsx`): flex-row with `gap-3`.
  - **Photo:** `w-36 h-37` (144×148), `rounded-md corner-squircle overflow-hidden bg-surface-muted`, using `expo-image` with `sanityImage(url, 144, 148)`, `contentFit="cover"` and `transition={200}`. The accessibility label is the photo's `alt`.
  - **Right column:** `flex-1 gap-1.5 py-1`.
    - **Top row:** flex-row with `gap-2`. The title uses a **new `Text` variant `title-xs`** (`flex-1`, `numberOfLines={2}`). Beside it is the heart: an `IconButton` with a **new variant `muted`** (`size-11` (44), `bg-surface-muted`, `Heart` at 22). The heart is filled with ink when saved.
    - **Location:** `MapPin` at 16 in `subtle`, then `Text variant="caption-regular" tone="subtle"` "Lake Arrowhead, CA" on one line.
    - **Rating:** `Star` at 16 filled in `primary`, then `Text variant="caption-regular"` "4.9" and `Text variant="caption-regular" tone="subtle"` "(342)".
    - **Pills:** flex-row, wrapping, `gap-1.5`. Each pill is `h-7 px-2.5 gap-1 rounded-full bg-surface-muted` with an icon at 14 and `Text variant="footnote-medium"`.
    - **Price:** a baseline row with `gap-1`. It holds `Text variant="title-sm"` "$289" and `Text variant="caption-regular" tone="subtle"` "/ night".
- **Skeleton row:** the same layout, with a `bg-surface-muted` photo block and three `rounded-sm bg-surface-muted` bars (`h-5 w-4/5`, `h-4 w-1/2`, `h-4 w-1/3`).
- **Proposed new tokens:**
  - `--text-title-xs: 18px; --text-title-xs--line-height: 1.1111` (20), with `Text` variant `title-xs` = `font-sans-bold text-title-xs`.
  - **Component variants** (not tokens): `IconButton` `filled-sm` and `muted`, and `Chip` size `xs`. All of them are added to `/design-system`.
  - No new colors.
- **Assets:** none needed. Photos are Sanity images and all icons are Lucide.
- **Known differences:**
  - No sliders icon (the user chose this).
  - Native tab bar.
  - No "Ocean View" pill.
  - Pool uses `Waves`, not a wifi icon.
  - The design's faint card panel behind the text column is left out (photo and text sit on `bg-surface`). Revisit it if the screenshot comparison shows it matters.

## Steps

### 1. Types, amenities, place parsing
- Add `src/search/types.ts` (`StayType`, `Amenity`, with all 12 keys) and `src/search/amenities.ts` (`amenityMeta`: label and icon, with the Title Case labels above).
- Add `src/search/places.ts`, mapping the 50 state names to codes.
- Extend `parseQuery(input, { cities })` with `region?`, `city?` and the 4 new amenity patterns (air con/AC, washer/laundry, EV/charger, BBQ/grill).
- Repoint imports in `home.tsx`, `queries.ts` and `search-stays.ts`. Delete `src/data/stays.ts` and the local `searchStays` filtering, keeping only `constraintLabels` logic as the chip builder in step 2.
- **Done when** `tsc` passes. Then run a node check of `parseQuery` on 8 sentences, including "Cabins in California", "cabin in the woods", "beach house for 6 under $400 in FL", "quiet pet friendly cabin with a hot tub under $300" and "loft in Austin with AC". Record the outputs in Result.

### 2. Query builder and chips
- Add `src/search/build-query.ts`: a pure function from `ParsedQuery` to `{ query, params }` using the filters and ordering above, with the projection `id, title, type, location (city + ", " + region), rating, reviewCount, pricePerNight, petsAllowed, amenities, imageUrl, imageAlt`.
- Widen `QueryParams` in `src/sanity/fetch.ts` to allow `string[]`.
- Add `src/search/chips.ts`: `chipsFor(parsed)` returns `{ key, label, icon?, selected }[]`, and `toggleChip(state, key)` returns the new `ParsedQuery`.
- Add `CITIES_QUERY` to `queries.ts`.
- **Done when** running the built query for "Cabins in California" and the quiet pet-friendly hot tub query through the Sanity MCP `query_documents` (or curl on `apicdn`) returns only stays that satisfy every filter. Record the counts and the top 3.

### 3. Search hook and PostHog
- Add `src/hooks/use-stay-search.ts`. It loads cities once, runs a search with an `AbortController` (each new search aborts the last), and keeps the last good results while a chip search runs. It exposes `{ stays, loading, error, retry }` and sends `stay_search_completed` or `stay_search_failed` with the properties above.
- Add a `searchAnalytics` helper next to `posthog-logger.ts` (`src/config/search-analytics.ts`) so the event shape lives in one place.
- **Done when** `tsc` passes and the events are sent from a dev build (checked in step 6).

### 4. Components and tokens
- Add the `title-xs` token and `Text` variant, the `IconButton` variants `filled-sm` and `muted`, and the `Chip` size `xs`, each with a gallery entry.
- Build `src/components/search/search-result-card.tsx` and a `SearchResultSkeleton` in the same file.
- **Done when** `/design-system` shows them.

### 5. Search screen
- In `src/app/(app)/search/_layout.tsx`, set `headerShown: false`.
- Rewrite `src/app/(app)/search/index.tsx` to the Design section, covering the header, chips, count and sort row, list, and every state.
- `q` from Home runs once with source `home`. Submitting from the pill runs with `search_bar`, example chips with `suggested_query`, and filter chips with `chip`.
- **Done when** deep-linking `roamly://search?q=Cabins%20in%20California` shows live Sanity cabins in CA with "Cabins" and "California" selected and the 4 suggestions unselected.

### 6. PostHog insight
- After events arrive, confirm `stay_search_completed` and `has_results` with `read-data-schema`.
- Create the Trends insight "Searches with and without results" through the PostHog MCP and link it in Result.

## Verification
- `npx expo lint` and `npx tsc --noEmit` pass.
- The node parse check (step 1) and the GROQ check (step 2) give the recorded outputs. "cabin in the woods" must not produce a city.
- iOS simulator dev build, deep-linked, with a screenshot each, compared with the design and every difference listed and fixed:
  - `roamly://search?q=Cabins%20in%20California`, the main design state.
  - `roamly://search?q=quiet%20pet%20friendly%20cabin%20with%20a%20hot%20tub%20under%20%24300`, with chips selected and the semantic order recorded.
  - `roamly://search?q=villa%20under%20%24100`, the no results state.
  - `roamly://search`, the no query state.
- Loading, error (via a bad project id) and a toggled chip use temporary code, because the simulator can't be tapped. That code is removed afterwards.
- PostHog: the deep links above produce `stay_search_completed`, with `has_results` true for the first two and false for the third, and no query text in any property. The error case produces `stay_search_failed`. Checked with `execute-sql` on events.
- The insight exists and shows both `has_results` values.
- End to end: Home prompt "Cabins in California", then submit. The Search tab shows the same results as the deep link, and PostHog records `search_source: home`.
- The sort sheet and chip taps can't be tapped in the simulator, so they're checked with temporary code that sets the state, and listed as not tapped.

## AGENTS.md updates
- **Expo:** replace "Work that needs secrets, Jev or semantic search goes through API routes instead. Home is live, while Search still uses `src/data/stays.ts` until its API route exists." with "Work that needs secrets or Jev goes through API routes. Search runs in the app: code parses the sentence, and `src/search/build-query.ts` turns it into GROQ filters plus `text::semanticSimilarity()` ranking on the public CDN."
- **Who owns what → Content:** amenity labels and icons live in `src/search/amenities.ts`, keyed like `constants.ts`.
- **Who owns what → Analytics:** search outcomes are `stay_search_completed` (`has_results`, `result_count`, filter flags, never text or place) and `stay_search_failed`. The insight is "Searches with and without results".
- **Design system:** the Search header has no filter icon until a filter plan, a deliberate difference from the design.

## Result
Built as planned. Search reads live Sanity stays through the CDN, the screen follows the design (minus the agreed differences), and PostHog records every outcome.

- **Parse check** (step 1): "Cabins in California" → cabin + CA; "cabin in the woods" → cabin, soft "woods" (no city); "beach house for 6 under $400 in FL" → beach, ≤ $400, 6 guests, FL; "quiet pet friendly cabin with a hot tub under $300" → cabin, ≤ $300, pets, hot tub, soft "quiet"; "loft in Austin with AC" → city, Austin, air conditioning; "romantic getaway near Cannon Beach" → city filter Cannon Beach (not a beach type); "ski lodge in co with a grill" → cabin, CO, BBQ grill.
- **GROQ check** (step 2), every result checked against every filter, 0 violations:
  - Cabins in California: 5 (Lakeview Chalet, Little Red Hilltop Cabin, Modern Cabin with Hot Tub)
  - quiet pet friendly cabin with a hot tub under $300: 5 (Cedar Hollow Cabin, Creekside Hideaway, Modern Cabin with Hot Tub)
  - beach house for 6 under $400 in FL: 1 (Gulf Breeze Beach House)
  - loft in Austin with AC: 1 (South Congress Retreat)
  - villa under $100: 0
  - romantic ocean view escape: 30, ranked Montecito Pool Estate, Port Aransas Dune House, Sunset Cliffs Hideaway
- **Simulator:** results, ranked query, no results, no query, loading, error and a toggled chip ("Under $300" took 5 → 4) were all screenshotted. The first screenshot showed the text column taller than the photo (cards ≈ 37pt apart). Fixed by floating the heart and using `gap-1`, which brought cards to 16pt apart as in the design.
- **PostHog:** `stay_search_completed` arrives with `has_results` true and false, `stay_search_failed` with `error_type`, and no text or place in any property. One clean launch sent exactly one event. The insight is at https://us.posthog.com/project/684916/insights/C8ffcVOk.
- **Changes from the plan:**
  - The card's heart is absolutely positioned instead of sitting in a row with the title.
  - "0 stays" is hidden above the no-results state.
  - `sanityImage` now appends parameters correctly to URLs that already have a query string.
- **Not tapped** (the simulator can't be tapped): the sort sheet, the back button, typing in the pill, and "Try again". These were checked by code and with forced state only.
