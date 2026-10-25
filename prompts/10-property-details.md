# 10 · Property details

Status: done

## Goal
Tapping a stay on Home or in Search opens a details screen that matches the design, built from live Sanity data:
- Photos.
- Title, rating and location.
- Key amenities.
- Policy cards that open this stay's house rules and its cancellation policy, word for word.
- The host.
- A bottom bar with the price and "Book this stay".

Booking isn't built, so that button shows a short coming-soon message. PostHog records every stay that is opened.

## Decisions
- **Route:** `src/app/stay/[slug]/`.
  - It's a Stack (`_layout.tsx`, anchored with `unstable_settings.initialRouteName = "index"`) with:
    - `index`: the details screen, with no header.
    - Three form sheets: `policies`, `cancellation` and `host`.
  - It's registered in the root layout inside the signed-in `Stack.Protected` guard, so it pushes over the tabs and hides the tab bar, as in the design.
  - URLs are `/stay/<slug>?from=home|search`. Slugs are stable and readable, and every stay has one, because Home and Search already require `slug.current`.
- **Entry points:**
  - Home's `FeaturedStayCard` becomes pressable: the whole card plus the chevron, which is no longer decorative.
  - Search's `SearchResultCard` becomes pressable. Its heart stays a separate button.
  - Both pass `from`. `HOME_STAYS_QUERY` and the search projection gain `"slug": slug.current`.
- **Data:** one `STAY_QUERY` by `$slug` through `sanityFetch` (CDN, values as params). It returns:
  - The stay's fields, photos with `alt`, and house rules.
  - Rooms with a bed count, worked out in GROQ: `count` summed with `math::sum(rooms[].beds[].count)`.
  - The host via `host->`, with photo URL and alt.
  - The cancellation policy via `cancellationPolicy->`.
  - The other Roam policies: `*[_type == "policy" && category != "cancellation"] | order(title asc)`.
- **Loading and caching:** `src/hooks/use-stay.ts` loads it and keeps results in a per-session `Map` by slug. The sheets read the same entry instantly, and only fetch if it's missing, for example on a cold deep link.
- **Host line:** the facts we have (the user chose this). For example "Hosting since 2017 · Replies within an hour", from `hostingSince` (year) and `responseTime` (label). The `responseTime` part is left out when unset. "Hosted by {first name}". No schema change.
- **Total:** the minimum stay total (the user chose this): `pricePerNight × minNights + cleaningFee`, shown as "$625 total · 2 nights" ("1 night" when singular). Every number is a field.
- **"Ask about policies" card:** opens the `policies` sheet (the user chose this). The sheet contains:
  - **House rules:**
    - Check-in after {checkInTime}, check-out by {checkOutTime}, shown as 12-hour times (e.g. 4:00 PM).
    - Check-in method label.
    - Quiet hours when set.
    - Pets / Smoking / Parties: "Allowed" or "Not allowed".
    - `additionalRules` word for word.
  - The stay's cancellation policy, `title` + `body` word for word.
  - Every other Roam policy, `title` + `body` word for word.
  - Paragraphs split on blank lines.
  - The Q&A replaces this later.
- **Cancellation card:** title = the policy's `title` (e.g. "Moderate cancellation"), description = its `summary`. It opens the `cancellation` sheet with the full `body` word for word. The design's "Free cancellation" copy is placeholder text for whichever policy the stay references.
- **Host row:** opens the `host` sheet (the user chose this). It shows the photo, name, `bio` word for word, "Hosting since {year} ({n} years)", response time, and languages.
- **Amenity row:** up to 4 items. The stay's amenities come in data order, with "Pet Friendly" inserted second when pets are allowed. Labels and icons come from `src/search/amenities.ts`. The design's "Forest Views" isn't a field, so it never shows, and "Fast Wi-Fi" shows as "Wifi".
- **Photos:**
  - A horizontal paging `FlatList` of every photo, each `sanityImage(url, windowWidth, 336)` with its `alt`.
  - The counter shows "1 / 3" (stays have 3 photos; the design's 24 is sample data).
  - A top gradient (`scrim` to transparent) keeps the white buttons and status bar readable on any photo, and the status bar is `light` over the hero.
- **Saved state:**
  - A new tiny shared store, `src/hooks/use-saved-stays.ts` (module `Set` + `useSyncExternalStore`), so a heart toggled in Search shows as saved on the details screen and back.
  - It isn't persisted yet, the same as today.
  - Search moves to it. `stay_saved` and `stay_unsaved` gain `source` (`search` | `stay_details`).
- **Share:** the core `Share.share({ message: "{title} in {location}, on Roamly" })`. There's no web link yet, so there's no URL, and no new dependency.
- **Book this stay:** `Alert.alert("Coming soon", "Booking isn't available yet. Save this stay to come back to it.")`. It also sends `stay_book_tapped` (`stay_id`), so booking interest is measurable. This is a small addition beyond the request; drop it if unwanted.
- **PostHog `stay_opened`:**
  - Sent once per screen visit, after the stay loads.
  - Properties:
    - `stay_id` (the Sanity `_id`)
    - `stay_type`
    - `price_per_night`
    - `source`: `home`, `search` or `link`, where `link` means no `from`
  - No personal data.
  - A failed load sends `stay_open_failed` (`source`, `error_type`). Not found sends `stay_open_failed` with `error_type: "not_found"`.
- **States:**
  - **Loading:** a hero-sized `surface-muted` block and skeleton bars, with the back button active.
  - **Error:** an `Alert` + "Try again".
  - **Not found:** "This stay isn't available" + "Back to stays".
  - Sheets show the same loading and error states when opened cold.
- **Motion:** a standard Stack push, with no custom entrance on the details screen. Sheets use native presentation. `PressableScale` is used on the overlay buttons and policy cards. `ReduceMotion.System` applies as elsewhere.

## Out of scope
- Booking, dates, the real total and availability.
- The Q&A with Jev and Context.
- Reviews.
- A map.
- A full-screen photo viewer.
- Persisting saved stays.
- Web share links.
- Android visual check.

## Design (estimated from the image at about 1.70 px/pt; every value is marked ≈ in code comments)
- **Screen:** `bg-surface`. A `ScrollView` (no automatic top inset, since the hero runs under the status bar) with bottom padding clearing the bar, plus a fixed bottom bar.
- **Hero:** full width, `h-84` (336), with the photo pager.
  - **Back:** top-left at `left-5`, `top = safe-area top + 4`. An `IconButton`, **new variant `overlay-lg`**: `size-14` (56) `bg-surface`, `ChevronLeft` at 24 in ink.
  - **Share + Save:** top-right at `right-5`, `gap-3`. Both `overlay-lg`, using `Share` (iOS-style up arrow) and `Heart`. The heart is filled with ink when saved.
  - **Counter:** `absolute right-4 bottom-8` (above the sheet's overlap). A `h-8 px-3 rounded-full bg-scrim` pill holding `Text variant="caption" tone="on-ink"` "1 / 3".
- **Content panel:** `-mt-5 rounded-t-2xl bg-surface px-5 pt-6`. It overlaps the hero by about 20pt, as the design's rounded top corners do.
  - **Title row:** flex-row with `gap-3`.
    - `Text variant="title"` (28/34) with `flex-1`, up to 3 lines.
    - The rating badge: `w-20 py-3 items-center rounded-lg corner-squircle bg-surface-muted`. It holds `Star` at 20, filled `primary`, with `Text variant="title-sm"` "4.9" in a row, then `Text variant="body" tone="muted"` "(214)".
  - **Location:** `mt-2`, flex-row with `gap-2`. `MapPin` at 20, ink and filled ink (≈; the design's pin has a white dot), then `Text variant="body"` "Lake Arrowhead, CA".
  - **Amenities:** `mt-6`, flex-row, `justify-between`, 4 columns (`items-center gap-2`). Each has an icon at 26 in ink and `Text variant="caption-regular"` for the label.
  - **Divider:** `mt-5 h-px bg-line`.
  - **Policy cards:** `mt-2 gap-3`. `PolicyCard` gains a **new `size="lg"`**:
    - `rounded-xl corner-squircle bg-lavender-50 px-4 py-4.5`.
    - A tile `size-13 rounded-lg bg-lavender-100` with the icon at 28 in `lavender-600`.
    - The title is `title-xs`, the description `caption-regular tone="muted"` (2 lines), and `ChevronRight` is at 24 in `lavender-600`.
    - **Card 1:** `MessageSquareMore` / "Ask about policies" / "Cancellation, house rules, pets, check-in and more."
    - **Card 2** (`tile={false}`, the design draws no tile behind this icon): `FileText` / policy title / policy summary.
  - **Divider:** `mt-4 h-px bg-line`.
  - **Host row:** `mt-2 py-3`, flex-row, `items-center`, `gap-4`, pressable.
    - Avatar `size-16` (64) `rounded-full border-3 border-surface shadow-raised` (≈).
    - Text: `Text variant="title-xs"` "Hosted by Maya", then a row with `Award` at 18 in `subtle` and `Text variant="caption-regular" tone="muted"` holding the facts line.
    - `ChevronRight` at 22 in ink.
- **Bottom bar:** fixed, `bg-surface`, `px-5 pt-4`, bottom padding = safe-area bottom + 8, and a top hairline shadow (`shadow-raised`, ≈).
  - **Left:** a baseline row with `Text variant="title"` "$265" and `Text variant="body"` "/ night". Below it, `Text variant="body" tone="subtle"` "$625 total · 2 nights".
  - **Right:** `Button` with a **new `size="lg"`**: `h-16` (64) `px-8`, `title-sm` text, `flex-1 ml-4`, primary. Its label is "Book this stay".
- **Sheets:**
  - `formSheet` with `sheetGrabberVisible` and `sheetCornerRadius: 24`.
  - **policies:** detents `[0.6, 1]`. A `ScrollView`, `px-5 pt-6 gap-6`:
    - Section titles are `Text variant="title-sm"`.
    - Each rule row is `Text variant="body"` (label in `muted`).
    - Policy titles are `headline` and bodies `body`, one `Text` per paragraph.
  - **cancellation:** the same layout, with detents `[0.5, 1]`.
  - **host:** detents `fitToContents`. It shows the photo `size-20`, name `title-sm`, facts in `caption-regular muted`, bio in `body`, and languages in `body`.
- **Proposed new variants** (no new color/size tokens):
  - `IconButton` `overlay-lg` (`size-14 bg-surface`, icon 24).
  - `PolicyCard` `size="lg"` and `tile`.
  - `Button` `size="lg"` (`h-16 px-8`, `title-sm`).
  - All are added to `/design-system`. `border-3` is a Tailwind width, not a token.
- **Assets:** none needed. Photos and host photos come from Sanity, and icons are Lucide.
- **Known differences:**
  - 3 photos, not 24.
  - No "Forest Views".
  - Host facts line instead of "Superhost".
  - Total for the minimum stay.
  - The cancellation card shows the stay's real policy name.
  - The design's ghost-chat icon becomes Lucide `MessageSquareMore`.

## Steps

### 1. Data, store and route skeleton
- Add `STAY_QUERY` and its `StayDetails` type to `src/sanity/queries.ts`.
- Add `slug` to `HOME_STAYS_QUERY`, and add slug and `SearchStay.slug` to the search projection.
- Add `src/hooks/use-stay.ts` (cache, abort, retry) and `src/hooks/use-saved-stays.ts`, and move Search's saved state to the store.
- Add `src/app/stay/[slug]/_layout.tsx` with the 4 screens, and register `stay/[slug]` in the root guard.
- Check the SDK 58 Stack and formSheet docs before writing.
- **Done when** `tsc` passes, and running `STAY_QUERY` for `modern-cabin-with-hot-tub` through the Sanity MCP returns every field the screen uses: 3 beds, host Maya Chen, Moderate cancellation, and 4 other policies.

### 2. Components
- Add the `IconButton` `overlay-lg`, `PolicyCard` `size="lg"`/`tile` and `Button` `size="lg"` variants, with gallery entries.
- Add `src/components/stay/`:
  - `photo-pager.tsx`
  - `rating-badge.tsx`
  - `amenity-row.tsx`
  - `host-row.tsx`
  - `booking-bar.tsx`
  - `policy-text.tsx` (renders body paragraphs word for word)
  - `house-rules.tsx` (the rule list from typed fields)
- Add `src/stay/format.ts` with pure helpers: 12-hour time, years hosting, the total line, and the amenity row order.
- **Done when** `/design-system` shows the new variants, and a node check of `format.ts` gives "4:00 PM", "$625 total · 2 nights" and the expected amenity order for 3 stays.

### 3. Details screen and sheets
- Build `index.tsx` to the Design section with every state.
- Build the `policies`, `cancellation` and `host` sheets.
- Send `stay_opened` and `stay_open_failed` (`src/config/stay-analytics.ts`), plus `stay_book_tapped`.
- Wire the Book alert and Share.
- **Done when** the screen renders live data for 3 different stays.

### 4. Entry points
- Make Home's `FeaturedStayCard` and Search's `SearchResultCard` pressable, navigating to `/stay/{slug}?from=…`.
- **Done when** both open the right stay.

## Verification
- `npx expo lint` and `npx tsc --noEmit` pass.
- Run the GROQ check (step 1) and the format check (step 2).
- Simulator screenshots, compared with the design, with every difference listed and fixed:
  - The details screen for `modern-cabin-with-hot-tub`, top and scrolled to the bottom bar.
  - One stay with pets not allowed and no quiet hours.
  - The policies sheet, the cancellation sheet and the host sheet.
  - The loading, error and not-found states.
- **Before any temporary navigation code:** ask the user to disconnect their iPhone from Metro, or run a separate Metro, because temporary code hot-reloads onto their phone.
- **Word-for-word check:** the policy and house-rule text on screen equals the Sanity `body` and `additionalRules` strings, compared programmatically against the query result.
- **PostHog:** opening from Home, from Search and via a link sends `stay_opened` with the right `source`. A bad slug sends `stay_open_failed` `not_found`. Checked with `execute-sql`.
- The sheet gestures, Share, the Book alert and heart sync can't be tapped in the simulator, so they're checked by code and listed as not tapped.

## AGENTS.md updates
- **Expo → Navigation:** stay details live at `/stay/[slug]` in the root Stack (signed-in guard), with `policies`, `cancellation` and `host` form sheets. Entry points pass `from`.
- **Who owns what → Analytics:** `stay_opened` (`stay_id`, `stay_type`, `price_per_night`, `source`), `stay_open_failed`, `stay_book_tapped`. Saved events carry `source`.
- **Rules / Policy answers:** the policies sheet is the interim, word-for-word view of house rules and Roam policies until the Q&A exists.
- **Design system:** the new variants, and saved stays shared through `use-saved-stays` (not persisted).

## Result
Built as planned. Stays open from Home and Search into `/stay/[slug]`, with live Sanity data, three sheets, and PostHog tracking.

- **GROQ check** (step 1): `STAY_QUERY` for `modern-cabin-with-hot-tub` returned 3 beds (summed from rooms), host Maya Chen, Moderate cancellation and the 4 other Roam policies.
- **Format check** (step 2): "4:00 PM", "11:00 AM", "12:30 AM"; "$625 for 2 nights" and "$1,200 for 1 night"; 9 years hosting. The amenity row puts Pet Friendly second only when pets are allowed.
- **Word for word:** all 7 policy bodies are rebuilt exactly from the rendered paragraphs (0 mismatches), and the 46 additional house rules are rendered unchanged.
- **Simulator screenshots:**
  - Modern Cabin (top and bar).
  - Aspen Grove A-Frame (no pets, Strict cancellation).
  - The policies sheet and the host sheet, opened from the details screen.
  - Not found, loading and error.
- **Fixes after comparing with the design:**
  - Title moved to a new `title-lg` token (32/34), so it wraps like the design.
  - Counter pill is now `bg-ink/80`; the scrim disappeared on dark photos.
  - Pin gained a white center dot.
  - Hero height 352 (334pt visible).
  - Policy card padding `py-3.5`.
  - Total label shortened to "$625 for 2 nights", and `Button lg` uses `px-6`, so "Book this stay" fits on one line.
  - Sheets get a solid `contentStyle` background, and the host sheet lost its duplicate bottom padding.
  - The back button is grey on the error and not-found screens.
- **PostHog:** `stay_opened` arrived with `source` home, search and link, plus type and price. `stay_open_failed` arrived as `not_found` and `TypeError`. Repeats in dev came from temporary-code edits hot-reloading the app.
- **Not tapped** (the simulator can't be tapped): Book alert, Share, heart sync between Search and details, swiping photos, sheet detents and drag, and tapping the Home and Search cards. These were checked by code only.
- **Remaining differences from the design:**
  - 3 photos.
  - No "Forest Views".
  - Host facts line instead of "Superhost".
  - The real policy name instead of "Free cancellation".
  - Lucide icons in place of the design's ghost-chat and medal icons.
  - Policy cards ≈ 90pt tall against ≈ 82 in the design.
- **Cold links:** a sheet route pushed with no details screen behind it renders full screen (`router.push` without `withAnchor`). In-app it always opens from the details screen.
