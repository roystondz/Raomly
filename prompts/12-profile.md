# 12 · Profile

Status: done

## Goal
The Profile tab matches the design and shows only real data:
- The guest's photo, name and email from Clerk.
- Trips and saved-stays counts.
- Account and Preferences rows.
- A "Roamly policies" card.

The settings gear holds Sign out. Rows lead to real places where they exist and say "Coming soon" where they don't.

## Decisions
- **Real data only** (the user chose this):
  - The name (`user.fullName`, falling back to the email) and photo (`user.imageUrl` on `bg-primary-50`) come from Clerk.
  - The email shows under the name in place of the design's city, since there's no home-city field. There's no "Roam Explorer" badge (no tiers exist).
  - **Stats:** two instead of three.
    - Trips is `0`, since there's no booking yet. It becomes real with booking.
    - Saved is `useSavedStays().size`, this session only.
    - Rating is left out, since guests have no reviews.
- **Rows** (the user chose "real where possible"):
  - **Personal info** opens a read-only `personal-info` sheet: full name, email, and "Member since {year}" from Clerk `createdAt`. No editing yet.
  - **Payment methods**, **Notifications** and **Help & support** show `Alert.alert("Coming soon", "{Row} isn't available yet.")`.
  - **Trips** goes to the Trips tab with `router.navigate("/trips")`.
- **Settings gear** (the user chose this): it opens a `settings` sheet with "Signed in as {email}", a secondary "Sign out" button (it keeps `user_signed_out`, and the guard handles the redirect), and "Open design system" in dev builds only. The current placeholder Profile is replaced.
- **Policy card** (the user chose this): it's `PolicyCard size="lg" tile={false}` with `FileText`, titled "Roamly policies", described as "Cancellation, payment, damage and more." It opens a `policies` sheet listing every Roamly policy (cancellation policies first, then the rest), `title` + `body` word for word. The data comes from a new `ALL_POLICIES_QUERY` (CDN) and a small `usePolicies()` hook with loading, error and retry.
- **Routes:**
  - The three sheets live at the root: `src/app/settings.tsx`, `src/app/personal-info.tsx` and `src/app/policies.tsx`.
  - They're registered in the signed-in `Stack.Protected` guard with `presentation: "formSheet"`, a grabber, `sheetCornerRadius: 24` and a solid `contentStyle`, matching the stay sheets.
  - Detents: settings and personal-info use `fitToContents`; policies uses `[0.6, 1]`.
  - These names don't collide with `/stay/[slug]/policies`.
- **Wordmark:** the existing `Logo` ("roamly"), not the design's "roam". This is an existing, deliberate difference, and the brand is Roamly.
- **Tab bar:** native tabs, as decided before. The design's yellow selected circle isn't drawn.
- **PostHog:** no new events (none requested). `user_signed_out` stays.
- **Motion:** no entrance animation (a tab that's seen often), `PressableScale` on the gear, and native sheet presentation.
- **States:** the Clerk user is always loaded behind the guard, so the screen has no loading state. The policies sheet has loading, error ("Couldn't load policies…" + "Try again") and empty states.

## Out of scope
- Editing profile fields.
- A real home city, tier badges, guest ratings and trip history.
- Payment methods, notification settings and a support flow.
- Persisting saved stays.
- Android visual check.

## Design (estimated from the image at about 1.98 px/pt; every value is marked ≈ in code comments)
- **Screen:** a `ScrollView` with `bg-surface` and `contentInsetAdjustmentBehavior="automatic"` (the native tabs inset the bottom), `px-4 pt-2 pb-8 gap-3`.
- **Header row:** `justify-between`, `items-center`, `mb-1`. On the left, `Logo` at height ≈ 28. On the right, `IconButton variant="filled-sm"` (52) with `Settings` at 24 and the accessibility label "Settings".
- **Profile card:** `flex-row items-center gap-3 rounded-2xl corner-squircle bg-surface-muted p-2.5`.
  - Avatar: `size-27` (108) `rounded-full overflow-hidden bg-primary-50`.
  - Text column (`flex-1 gap-1`): `Text variant="title"` with the name (2 lines max), then a row with `Mail` at 18 in `subtle` and `Text variant="body" tone="muted"` with the email (1 line).
- **Stats card:** `flex-row rounded-xl corner-squircle border border-line bg-surface py-3`. It has two equal columns (`flex-1 items-center gap-0.5`), each with `Text variant="title"` for the number and `Text variant="body" tone="muted"` for the label. A `w-px self-stretch my-1 bg-line` divider sits between them.
- **Section** (Account, Preferences): `rounded-2xl corner-squircle bg-surface-muted p-1 pt-4`.
  - Title: `Text variant="title-xs"` with `px-3.5 pb-2.5`.
  - A white `ListGroup`.
- **`ListRow`**, **new `variant="tile"`**: `min-h-15 px-3 py-2.5 gap-4`.
  - The icon sits in a `size-10 rounded-lg corner-squircle bg-surface-muted` tile, at 22 in ink.
  - The label is `Text variant="body"`, followed by `ChevronRight` at 20.
  - **`ListGroup`**, **new `inset` prop**: separators start at `ml-17` (68), under the label, as in the design.
- **Rows:**
  - **Account:**
    - Personal info `UserRound`
    - Payment methods `CreditCard`
    - Trips `BriefcaseBusiness`
  - **Preferences:**
    - Notifications `Bell`
    - Help & support `CircleHelp`
- **Policy card:** `PolicyCard size="lg" tile={false}`, as above.
- **Sheets:** `ScrollView`/`View` with `bg-surface px-5 pt-8 gap-5`.
  - **settings:** "Settings" (`title-sm`), "Signed in as …" (`body` muted), `Button variant="secondary"` "Sign out", and a dev-only `Button size="sm" variant="secondary"` "Open design system".
  - **personal-info:** "Personal info" (`title-sm`), then `Rule` rows (`label` muted, `value` ink) for Name, Email and Member since.
  - **policies:** "Roamly policies" (`title-sm`), then `PolicyText` for each policy, separated by `h-px bg-line`.
- **New variants** (no new color/size tokens):
  - `ListRow` `variant="tile"`
  - The `ListGroup` `inset` prop
  - Both get gallery entries.
- **Assets:** none. The photo comes from Clerk and the icons are Lucide.
- **Known differences:**
  - "roamly" wordmark.
  - Email instead of the city.
  - No badge.
  - Two stats.
  - The Roamly policies card copy.
  - Native tab bar.

## Steps

### 1. Data and sheets
- Add `ALL_POLICIES_QUERY`, `src/hooks/use-policies.ts`, and the `settings`, `personal-info` and `policies` sheets.
- Register the sheets in the root layout (signed-in guard).
- **Done when** `tsc` passes and the policies query returns all 7 policies with cancellation ones first.

### 2. Components
- Add the `ListRow` `variant="tile"` and the `ListGroup` `inset` prop, with gallery entries.
- **Done when** `/design-system` shows them.

### 3. Profile screen
- Rewrite `src/app/(app)/profile.tsx` to the Design section, with every row wired.
- **Done when** it renders with the signed-in user.

## Verification
- `npx expo lint` and `npx tsc --noEmit` pass.
- Simulator screenshots compared with the design, with every difference listed and fixed. The phone follows any temporary code, which the user allowed before.
  - The Profile tab (via temporary navigation).
  - The settings sheet.
  - The personal-info sheet.
  - The policies sheet.
- **Word-for-word check:** every policy paragraph in the sheet equals its Sanity `body` paragraph.
- Not tapped (the simulator can't be tapped): the rows, the Coming soon alerts, Sign out and the gear. These are checked by code and listed.

## AGENTS.md updates
- **Navigation:** the root `settings`, `personal-info` and `policies` sheets, opened from Profile. Sign out lives in the settings sheet.
- **Design system:** `ListRow` `variant="tile"` with `ListGroup inset`, for settings-style lists.

## Result
Built as planned. Profile shows real Clerk and saved-stay data. The gear holds Sign out, and the rows and the policies card are wired.

- **Policies query:** returns all 7 policies, cancellation first (Flexible, Moderate, Strict), then Booking and payment, Damage and security, Guest conduct and parties, Rebooking and refunds. The sheet uses the same `PolicyText` already checked word for word (7 policies, 0 mismatches).
- **Simulator screenshots:**
  - The Profile tab.
  - The settings, personal-info and policies sheets.
- **Fixes after comparing with the design:**
  - Tile rows went from ≈ 61 to ≈ 52pt (`min-h-13 py-2`, `size-9` tile), with the inset divider at `ml-16`.
  - The stats card went from ≈ 85 to ≈ 72pt (`py-1.5`).
  - Long emails no longer wrap mid-word: the settings sheet puts the email on its own line, and `Rule` gained `singleLine` for the personal-info email.
  - Sheets reuse a shared `sheetOptions` (`src/config/sheet-options.ts`), and the stay sheets moved to it too.
- **Not tapped** (the simulator can't be tapped): the rows, the Coming soon alerts, Sign out, the gear, and the Trips row going to the tab. These were checked by code only.
- **Type check:** a new `agent/skills/` folder (Sanity Context skill examples, not app code) appeared in the repo during this work and fails `npx tsc --noEmit`. The app was type-checked with that folder excluded and passes. The user should decide whether to exclude it in `tsconfig.json` or move it.
- **Remaining differences from the design:**
  - The "roamly" wordmark.
  - Email instead of the city.
  - No badge.
  - Two stats.
  - The "Roamly policies" copy.
  - The native tab bar.
