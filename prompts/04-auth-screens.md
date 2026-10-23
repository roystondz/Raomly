# 04 · Auth screens (mocked)

Status: done

## Goal
Guests can sign up (name, email, password), verify their email with a 6-digit code, or sign in (email, password, Google, Apple). Every field validates and shows loading and error states. A mock session (no Clerk yet) sends them to a placeholder Home, where they can sign out back to onboarding.

## Decisions
- Source design: `auth.png`, the sign-up screen only (attached in chat; **attach it again if building in a new session**). The phone screen is 680px for 393pt, so 1pt ≈ 1.73px. `≈` marks estimates. Verification and sign-in are derived from sign up, with the layouts described below.
- **Mock session:**
  - `src/auth/mock-auth.tsx` exposes `AuthProvider` and `useAuth()` with `isSignedIn`, `user`, `pendingSignUp`, `signUp`, `verifyEmail`, `resendCode`, `signIn`, `signInWithProvider`, `signOut`. The shape mirrors what Clerk will provide.
  - State is in memory only, so a reload signs out.
  - Every call waits ≈ 1s.
  - Marked `// MOCK: replaced by Clerk`.
- **Mock rules** (so every error state can be tried):
  - Sign up with `taken@example.com` → field error "That email is already in use."
  - Verification code `000000` → "That code is incorrect. Try again."; any other 6 digits verifies.
  - Sign in with password `wrong-password` → form error "Incorrect email or password."
  - Sign in with `nobody@example.com` → form error "No account found with this email."
  - Anything else valid succeeds. The sign-in name is taken from the part of the email before the @.
  - Google/Apple sign in the demo user "Joanna Smith", `joanna@example.com`.
- **Client validation** (`src/auth/validation.ts`, parsed in code):
  - Name: required, trimmed.
  - Email: required, `x@y.z` shape, trimmed and lowercased.
  - Password: 8+ characters.
  - Errors show after the first submit, then update as the guest types.
- **Routing** with `Stack.Protected` in `src/app/_layout.tsx`:
  - `guard={!isSignedIn}`: `index` (onboarding) and `(auth)`.
  - `guard={isSignedIn}`: `(app)`.
  - `design-system` is always available.
  - When a guard flips, Expo Router redirects automatically, so a successful sign in lands on `/home` and signing out returns to onboarding. No manual redirects.
- **Navigation:**
  - Onboarding: Get started → `/sign-up`; Skip and Google → `/sign-in` (unchanged).
  - Sign up → (success) `push('/verify-email')` → (verified) Home.
  - The footer links swap sign-in ↔ sign-up with `router.replace`.
  - The back button calls `router.back()`, or `replace('/')` when there's no history.
  - Opening `/verify-email` with no pending sign-up replaces it with `/sign-up`.
- `(auth)/_layout.tsx` hides the native header (the screens draw the design's back button). The swipe-back gesture stays on.
- Home placeholder `src/app/(app)/home.tsx`: Logo, "Signed in as {name}", the email, a Sign out button, and a dev-only "Open design system" button (moved from sign in). Marked PLACEHOLDER.
- **Apple:** `SymbolView` from `expo-symbols` (already installed), SF Symbol `apple.logo`. The Apple button only renders on iOS.
- **Google:** the existing marked `GoogleMark` placeholder.
- Copy follows the design, except "roam" becomes "roamly" (same as onboarding). The design's name placeholder "e.g. Adrian Hajdin" is kept as is.
- **Keyboard:**
  - Each screen scrolls (`keyboardShouldPersistTaps="handled"`, `automaticallyAdjustKeyboardInsets`, `keyboardDismissMode="interactive"`).
  - Return moves to the next field and submits on the last one.
  - Correct `autoComplete`/`textContentType` everywhere (name, email, new or current password, one-time code).
- Loading: the submit button shows its spinner, and the fields and other buttons are disabled while a request runs.
- No new dependencies.

### Shared layout (`src/components/auth/auth-screen.tsx`, ≈ pt)
- Background `surface`, `px-6` (design inset ≈ 22).
- Header at `pt-safe`: back button left (IconButton new variant `outline`: 44 circle, `bg-surface`, 1px `line` border, ChevronLeft 24), Logo right (height ≈ 30).
- Title: `hero`, `mt-8`. Line breaks are part of the copy ("Create\nyour account").
- Body: `body` `muted`, `mt-3`.
- Content: `mt-6`.
- Footer: pushed to the bottom (`mt-auto pt-8 pb-safe-offset-2`), centered. `caption` muted text plus an underlined `caption` ink link ("Already have an account? **Sign in**").

### Sign up (design)
- Title "Create\nyour account".
- Body "Join roamly to save your stays, get personalized recommendations and access them across all your devices."
- Fields (gap 12):
  - Full name: User icon, placeholder "e.g. Adrian Hajdin".
  - Email address: Mail icon, placeholder "you@example.com".
  - Password: Lock icon, placeholder "At least 8 characters", eye toggle.
- `mt-6` primary Button "Create account" with ArrowRight.
- "or" divider (`my-5`): two `h-px bg-line` lines around `caption` muted "or".
- Secondary "Continue with Google", then `gap-3` "Continue with Apple".
- Footer: "Already have an account? Sign in".

### Verify email (derived)
- Title "Check\nyour email".
- Body "We sent a 6-digit code to **{email}**. Enter it below to verify your account."
- `CodeInput`, then `mt-6` primary "Verify" (disabled until 6 digits; it also auto-submits on the 6th digit).
- A success `Alert` "We sent a new code." after resending.
- Footer: "Didn't get a code? **Resend**", or "Resend in 0:30" while counting down (30s cooldown, starting on arrival).

### Sign in (derived)
- Title "Welcome\nback".
- Body "Sign in to see your saved stays and plan your next trip."
- Fields: Email address, Password (placeholder "Your password").
- Primary "Sign in" with ArrowRight, divider, Google, Apple.
- Footer: "New to roamly? **Sign up**".
- No "Forgot password" (out of scope).

### Component changes
- `TextField`:
  - New optional `label`. With a label the field is 60 tall (`h-15`) and shows the label (`label` variant, ink) above the input (`body` variant, ink, placeholder `subtle`), matching the design.
  - New optional `error`. The border becomes 2px `danger` and a `footnote-medium` danger message appears below (`mt-1.5 px-1`), with `accessibilityHint` set to the error.
  - Accepts `ref` (React 19 ref prop) for focusing the next field.
- `IconButton`: new `outline` variant (above).
- New `src/components/auth/code-input.tsx`:
  - A hidden `TextInput` (`number-pad`, `oneTimeCode`, `maxLength` 6) drawn as 6 boxes (h 56, `flex-1`, gap 8, `rounded-lg`, `bg-surface-muted`).
  - The current box gets the focused style (2px `lavender-400`, `bg-lavender-50`); `error` turns the borders `danger`.
  - Tapping the boxes focuses the input.
- New `src/components/ui/apple-mark.tsx` (SymbolView `apple.logo`, 20, ink).
- New `src/components/auth/or-divider.tsx` and `src/components/auth/social-buttons.tsx` (Google + Apple, shared by sign up and sign in).
- Delete `src/components/auth/auth-placeholder.tsx`.

### Differences from the design kept on purpose
- Button heights stay at the 56 token (design ≈ 51 primary, ≈ 46 social).
- The wordmark reads "roamly".
- The Google "G" is a placeholder.

## Out of scope
- Clerk, real OAuth, persisting the session, forgot password, editing the email on the verification screen (back returns to sign up with the fields kept), analytics.

## Steps
### 1. Mock auth and validation
`src/auth/mock-auth.tsx` and `src/auth/validation.ts` per Decisions. `AuthError` has `field?: "name" | "email" | "password" | "code"` and `message`. Wrap the root layout in `AuthProvider`. Lint and tsc pass.

### 2. Component changes
TextField `label`/`error`/`ref`, IconButton `outline`, `AppleMark`, `CodeInput`, `OrDivider`, `SocialButtons`, `AuthScreen`. Add the labelled field, the error field and the outline back button to the `/design-system` gallery.

### 3. Routes
- Root `_layout.tsx` with `Stack.Protected` groups.
- `(auth)/_layout.tsx` with no header.
- `(auth)/sign-up.tsx`, `(auth)/verify-email.tsx`, `(auth)/sign-in.tsx`, `(app)/_layout.tsx`, `(app)/home.tsx`.

### 4. Form behavior
Per screen:
- Local field state.
- `submitted` flag for showing errors.
- Return-key focus chain.
- Submit → validate → call the mock → show field/form errors with `Alert tone="error"` above the button → success navigates (or the guard redirects).
- Disable inputs while loading.
- Verification has auto-submit, a resend countdown (`setInterval` cleared on unmount) and a resend success alert.

### 5. Compare and try
- Run the dev build. Screenshot sign up with `xcrun simctl launch` plus a temporary dev redirect to `/sign-up` (removed after), and compare with `auth.png`. List differences, fix, repeat.
- Screenshot verify-email and sign in for review.
- Ask the user to tap through the flows below. Shut down the simulator and Metro when finished.

## Verification
- `npx expo lint`, `npx tsc --noEmit`, and no hex values outside the token files.
- Sign up:
  - Empty submit → three field errors.
  - Bad email / 7-char password → their errors.
  - `taken@example.com` → email error.
  - Valid → spinner → verify screen showing the email.
- Verify:
  - `000000` → error.
  - Resend counts down, then shows the success alert.
  - Any other 6 digits → Home "Signed in as {name}".
- Sign out → onboarding. Back gestures can't reach Home or auth screens behind the guard.
- Sign in:
  - `wrong-password` → form error.
  - `nobody@example.com` → form error.
  - Valid → Home.
  - Google/Apple → Home as Joanna Smith.
- Footer links swap screens. The back button returns to onboarding. The password eye toggles. Return-key flow works and the keyboard never covers the focused field.

## AGENTS.md updates
- Who owns what → Auth: "Until Clerk is set up, `src/auth/mock-auth.tsx` mocks the session with the same hook shape; replace it rather than adding a second auth path."
- Expo → Navigation: "Routes are guarded with `Stack.Protected` in the root layout: signed out → `index` + `(auth)`, signed in → `(app)`. Don't redirect manually after auth changes."
- Design system: TextField `label`/`error`, IconButton `outline`, and the auth components in `src/components/auth/`.

## Result
Built as planned: sign up (matches `auth.png`), verify email and sign in (derived), and placeholder Home behind `Stack.Protected`. Lint and tsc pass. The user tapped through every flow.
- Changes during the build:
  - `text-input` token: inputs set a size without a line height, which fixes iOS clipping typed text.
  - `caption-regular` Text variant.
  - TextField `label`/`error`/`ref`.
- The mock session was later replaced by Clerk in plan 05.
