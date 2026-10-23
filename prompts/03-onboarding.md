# 03 · Onboarding

Status: done

## Goal
On launch, guests see a 3-slide swipeable onboarding (the attached design is slide 1). "Get started" leads into sign up, and "Skip" and "Continue with Google" lead into sign in. Both auth screens are marked placeholders until Clerk is set up.

## Decisions
- Source design: `onboarding.png` (attached in chat; **attach it again if building in a new session**). Phone frame is 631px for 393pt, so 1pt ≈ 1.6px. Values marked `≈` are estimated from the image.
- 3 slides with the same layout. Slide 1 copy follows the design; slides 2–3 copy is drafted here for review (see Slides).
- Buttons: "Get started" → `/sign-up` and "Skip" → `/sign-in`, both with `router.push`. "Continue with Google" → `/sign-in` for now (Google OAuth comes with Clerk). Slides change by swiping only.
- Auth: an `(auth)` route group with `sign-up.tsx` and `sign-in.tsx` placeholder screens built from design-system components and clearly marked placeholders. No Clerk yet; that's its own plan, and it needs keys and auth designs.
- Onboarding shows on every launch (no storage dependency). With Clerk, signed-in users will skip it.
- Onboarding becomes the first screen (`src/app/index.tsx`). The root Stack hides headers by default; `/design-system` and the auth screens turn theirs back on. The dev-only gallery link moves to the sign-in placeholder.
- Wordmark: the existing "roamly" `Logo` (the design shows "roam"). The design copy says "roam helps you…"; it becomes "roamly helps you…" to match the app name.
- Carousel: horizontal `FlatList` with `pagingEnabled` (no new dependency). The current index comes from `onMomentumScrollEnd`.
- Fixed overlay (doesn't swipe): the top bar (Logo + Skip) and the bottom buttons. Each slide contains the photo, location chip and curved sheet with indicator, title and body. Each slide's sheet leaves room at the bottom for the fixed buttons.
- Photos are the top-light/top-dark kind, so each slide has a `tone`. On `dark` slides the Logo turns `on-ink` and the status bar turns light so they stay readable.
- Glass: Skip (light) and the location chip (dark) use `GlassView` when available and fall back to token colors. The tab bar's `useGlassAvailable` moves to `src/hooks/use-glass-available.ts` so both can use it.
- Images: `expo-image` with remote Unsplash URLs (`?w=1200&q=80&fm=jpg&fit=crop`), all free under the Unsplash License (no attribution required). `bg-ink` shows behind them while loading.

### Slides
| # | Photo (Unsplash) | Chip | Tone | Title | Body |
|---|---|---|---|---|---|
| 1 | Oia sunset terrace, Gilley Aguilar, `photo-1750768685537-56e8bb8713aa` | Oia, Greece | light | Find a stay that fits your story | From mountain cabins to oceanfront villas, roamly helps you find unforgettable stays for every kind of trip. |
| 2 | Lakeside boathouse, Philip Jahn, `photo-1666942590959-bb49a90d3dcd` | Berchtesgaden, Germany | light | Just say what you're looking for | Describe your trip in one sentence, like "quiet cabin with a hot tub under $300", and get stays ranked for you. |
| 3 | Lodge at dusk, Andrew Svk, `photo-1636886519725-6a048800b5b4` | Emerald Lake, BC | dark | Answers from the source | Ask about cancellation, pets or check-in and get the stay's exact policy text, never a guess. |

### Layout (≈ pt)
- **Photo:** full-bleed behind everything, `contentFit="cover"`.
- **Top bar:** row at `top-safe`, height 44, `px-6`, items centered. Logo `height` ≈ 54 (x-height ≈ 31pt like the design's "roam"), color `ink` or `on-ink` by tone. Skip pill: h 44 (`h-11`), `px-5`, glass light (fallback `bg-surface-glass`), `label` text ink.
- **Location chip:** `ml-6`, about 24 above the sheet's left edge. h 40 (`h-10`), `px-4`, gap 8, capsule, dark glass (fallback new token `scrim`), 1px border with new token `on-image-line`. MapPin 18 `on-ink` (outline; the design's solid pin isn't in Lucide), `caption` text `on-ink`.
- **Curved sheet:** SVG top edge, then `bg-surface`. The top-left corner is rounded (≈ r 24), and the edge bows from its high point near the left down to ≈ 56pt lower at the right edge. Path in a `W×64` box: `M0 64 L0 28 Q0 4 24 2 C140 -4 300 14 W 60 L W 64 Z`, filled `surface`.
- **Inside the sheet** (`px-8` ≈ 31): page indicator, `mt-6` title, `mt-2` body, then bottom padding to clear the buttons.
  - Indicator: 3 bars, h 4 (`h-1`), w 32 (`w-8`), gap 8, capsule. Active `lavender-400`, inactive `line`. Labelled "Slide n of 3".
  - Title: new type token `hero` (Bold 36, lh ≈ 40 → 1.1, tracking ≈ -0.5), ink, `accessibilityRole="header"`.
  - Body: `body` (16/24), `muted`. The design looks like ≈ 16/20; keep the token and compare.
- **Fixed buttons** (`px-6`, `gap-3`, `pb-5`): Button primary "Get started" with trailing ArrowRight, then secondary "Continue with Google" with the existing Google "G" placeholder. Height stays the token 56 (the design shows ≈ 50).

### Proposed new tokens (`global.css` + `colors.ts`)
- `--text-hero: 36px; --text-hero--line-height: 1.1; --text-hero--letter-spacing: -0.5px;` → `Text` variant `hero` ≈
- `--color-scrim: rgba(11, 11, 26, 0.45)` ≈ (dark glass fallback, chip)
- `--color-on-image-line: rgba(255, 255, 255, 0.35)` ≈ (chip border)

## Out of scope
- Clerk, real sign-up/sign-in forms, Google OAuth, session-based redirects.
- Remembering that onboarding was seen.
- Slide auto-advance, parallax and animations between slides (the indicator just switches).
- The real Google "G" asset (still the marked placeholder from 02).

## Steps
### 1. Tokens and shared bits
Add the three tokens to `global.css` and `src/theme/colors.ts`, and the `hero` variant to `src/components/ui/text.tsx`. Move `useGlassAvailable` from `glass-tab-bar.tsx` to `src/hooks/use-glass-available.ts`, and update the tab bar import. Move `GoogleMarkPlaceholder` from `design-system.tsx` to `src/components/ui/google-mark.tsx` (still a marked placeholder) so onboarding can reuse it. Lint and tsc pass.

### 2. Routes
- `src/app/_layout.tsx`: `<Stack screenOptions={{ headerShown: false }} />`.
- `design-system.tsx`: its `Stack.Screen` sets `headerShown: true`.
- `src/app/(auth)/_layout.tsx`: Stack with `headerShown: true`, a transparent native header and a minimal back button.
- `(auth)/sign-up.tsx` and `(auth)/sign-in.tsx`: placeholder screens on `surface-muted`, `px-5` with Logo, `title` ("Create your account" / "Welcome back"), a `body` muted note "Sign up with Clerk is coming next." and a `Button` that switches between the two.
  - Sign-in also gets a dev-only "Open design system" secondary button.
  - Both carry a `// PLACEHOLDER: replaced by the Clerk auth plan` comment.

### 3. Onboarding components (`src/components/onboarding/`)
- `slides.ts`: the slide data from the table (id, image URL, location, tone, title, body).
- `curved-sheet.tsx`: the SVG top edge (react-native-svg, `colors.surface`) above a `bg-surface` View that renders children; it takes `onLayout` width.
- `page-indicator.tsx`: `count`, `index`.
- `location-chip.tsx`: dark glass pill.
- `skip-button.tsx`: light glass pill Pressable (`accessibilityRole="button"`, pressed opacity).
- `onboarding-slide.tsx`: photo + chip + curved sheet with indicator/title/body. It's screen width, full height, and its bottom spacer equals the fixed button block's height.

### 4. Onboarding screen
`src/app/index.tsx`: full-screen `View bg-ink` containing the FlatList of slides, the absolute top bar, and the absolute bottom buttons. Track `index` from `onMomentumScrollEnd`; Logo color and `StatusBar` style follow the slide's tone. Buttons navigate per Decisions.

### 5. Compare with the design
Run the dev build. Screenshot slide 1 and compare with `onboarding.png` (logo position and size, Skip, chip, curve, indicator, type, buttons, spacing). List every difference, fix it, and repeat. For slides 2–3, temporarily set `initialScrollIndex` to screenshot them, then remove it. Ask the user to tap through the navigation, since the agent can't tap in the Simulator.

## Verification
- `npx expo lint` and `npx tsc --noEmit` pass. No hex values outside `global.css` and `colors.ts`.
- Dev build on iPhone 17 Pro: slide 1 screenshot matches the design except for the listed estimates. Slides 2–3 render with readable logo and status bar.
- The user taps through: swiping changes slides and the indicator; Get started → Sign up; Skip → Sign in; Google → Sign in; back returns to onboarding; sign in ↔ sign up switch works; the sign-in dev link opens the gallery.
- `/design-system` still has its header and renders.

## AGENTS.md updates
- Design system: add the `hero` type token, the `scrim`/`on-image-line` colors, the shared `use-glass-available` hook, and the rule "text and icons over photos follow the slide/photo tone (ink on light, on-ink on dark)".
- Add a **Navigation** line under Expo: the root Stack hides headers by default and screens opt in; `index` is onboarding and `(auth)` holds sign-in/sign-up (placeholders until Clerk).

## Result
Built as planned. Onboarding is the first screen with 3 swipeable slides. Get started → sign up, and Skip and Google → sign in. The auth screens are marked placeholders. Lint and tsc pass. Slide 1 was compared with the design on iPhone 17 Pro, and the user tapped through all of the navigation.
- Changes during the build:
  - `hero` became Bold 40/40 with -1 tracking (36 was smaller than the design; at 40 the title breaks after "that" as designed).
  - Slide 2's photo became Lake Louise (Lukas Mann, `photo-1637253161360-8eacf6fb6437`, tone dark) because branches behind the logo made the Berchtesgaden photo unreadable.
  - The Skip glass is tinted `surface-glass` so it stays light over dark photos.
- Remaining differences from the design:
  - The wordmark reads "roamly" (wider than "roam").
  - Buttons are 56 tall (design ≈ 50).
  - Body line height is 24 (design ≈ 20).
  - The location pin is an outline.
  - The Google "G" is a placeholder.
  - The photos differ from the mock (warm cabin deck).
