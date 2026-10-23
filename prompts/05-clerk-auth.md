# 05 · Clerk auth

Status: done

## Goal
Replace the mock session with Clerk while keeping our custom screens:
- Email + password sign up with a 6-digit email verification code.
- Email + password sign in, with the same code screen when Clerk asks for one.
- Google through Clerk's browser SSO.
- Sessions that persist across restarts, guarded routes, and sign out.

## Decisions
- Builds on 04 (screens, `Stack.Protected` routing). Auth designs: `auth.png` (sign up only), unchanged.
- **Clerk MCP:** not connected in this session (no Clerk MCP tools available). Patterns come from the installed Clerk skills (`clerk-expo`) and the installed `@clerk/expo` **4.14** types, which win over the skill's 3.6 snippets.
- **API:** current method-based hooks only. `useSignUp()` → `{ signUp, errors, fetchStatus }`, `useSignIn()` → `{ signIn, errors, fetchStatus }`. Methods resolve to `{ error }`, and completed attempts use `finalize()`. No legacy `setActive`/`prepareFirstFactor`, except `useSSO`, which by design still returns `setActive`.
- **Instance** (checked via `/v1/environment`, development instance):
  - email address and password are required.
  - Email codes are used for verification and sign-in.
  - Google is enabled; Apple and first/last name are off. Sign-up captcha is off.
- **Full name:** you enable **First and last name** (optional) in the Dashboard. Code splits on the first space: first word → `firstName`, rest → `lastName` (empty if one word).
- **Sign up:**
  1. `signUp.password({ emailAddress, password, firstName, lastName })`.
  2. `signUp.verifications.sendEmailCode()`.
  3. `router.push('/verify-email?flow=sign-up')`.
  4. On the verify screen: `verifyEmailCode({ code })`, then `signUp.finalize()` once `status === 'complete'`.
  - The screen renders `<View nativeID="clerk-captcha" />` (required mount point, even with captcha currently off).
- **Sign in:** `signIn.password({ identifier: email, password })`, then by status:
  - `complete` → `finalize()`.
  - `needs_client_trust`, or `needs_second_factor` with an `email_code` factor → `signIn.mfa.sendEmailCode()` → `push('/verify-email?flow=sign-in')`. The verify screen uses `signIn.mfa.verifyEmailCode({ code })` → `finalize()`.
  - Any other second factor (TOTP/SMS, not enabled) → form error "This account needs a verification method this app doesn't support yet."
- **Verify screen:** one route for both flows, chosen by the `flow` param.
  - The email shown comes from `signUp.emailAddress` / `signIn.identifier`.
  - Resend calls the matching send method again, keeping the 30s cooldown.
  - If the resource isn't waiting for a code (e.g. the app was reopened), it replaces itself with `/sign-up` or `/sign-in`.
  - The back button returns to the form, which keeps its fields.
- **Errors:**
  - Field errors come from `errors.fields.{firstName,lastName,emailAddress,identifier,password,code}.message` and show under the matching field. `firstName`/`lastName` show under Full name; `identifier` under Email.
  - `errors.global[0].message` (or `error.message`) shows in the error `Alert` above the button.
  - Client validation (`src/auth/validation.ts`) still runs first.
  - `fetchStatus === 'fetching'` drives the button spinners and disables inputs.
- **Google:** `useSSO()` from `@clerk/expo`, `startSSOFlow({ strategy: 'oauth_google' })` → `setActive({ session: createdSessionId })`. Cancelling is silent. If `signUp.status === 'missing_requirements'`, show "Finish signing up with email instead." Uses the default `sso-callback` redirect on scheme `roamly`.
- **Apple:** stays visible on iOS. Tapping shows a native alert: "Sign in with Apple is coming soon."
  - Note: App Store review generally requires Sign in with Apple when Google is offered. Enable it before release.
- **Sessions:** `tokenCache` from `@clerk/expo/token-cache` on `ClerkProvider` (keychain via `expo-secure-store`).
- **Routing:**
  - The root layout reads `useAuth()` from `@clerk/expo` and keeps the splash screen up (`expo-splash-screen` `preventAutoHideAsync`/`hide`) until `isLoaded`, so there's no onboarding flash on cold start for signed-in users.
  - Guards stay as in 04 (`!isSignedIn` → `index` + `(auth)`, `isSignedIn` → `(app)`).
  - `finalize()` gets a `navigate` callback that does nothing, because the guard redirects. If `session.currentTask` is set, it shows "Finish setting up your account on the web" (no tasks are configured today).
- **Home placeholder:** `useUser()` → `user.fullName ?? primaryEmailAddress`. Sign out is `useClerk().signOut()`, and the guard returns to onboarding.
- **Removed:** `src/auth/mock-auth.tsx` and its provider. `src/auth/validation.ts` stays.
- **New dependencies** (Clerk-required): `expo-secure-store` (persistent sessions) and `expo-auth-session` (Google SSO), installed with `npx expo install`.
  - `app.json` plugins gain `"expo-secure-store"` and `"@clerk/expo"`.
  - This needs a new dev build (`npx expo run:ios`); the Clerk plugin sets the iOS deployment target to 17.
- **Env:**
  - Add `.env.example` with `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=` and `CLERK_SECRET_KEY=` (names only).
  - Add `.env` to `.gitignore`; `.env*.local` is already ignored.
  - `CLERK_SECRET_KEY` is never read by app code.
- The publishable-key check already in `_layout.tsx` stays.

## Out of scope
Forgot password, TOTP/SMS second factors, Apple sign-in, native Google button, email change on the verify screen, Clerk webhooks/backend, analytics identify (PostHog comes later).

## Steps
### 1. Dependencies and config
- `npx expo install expo-secure-store expo-auth-session`.
- Add the two plugins to `app.json`.
- Add `.env.example` and the `.gitignore` entry.
- Done when `npx expo-doctor` shows no new issues and `npx expo run:ios` builds.

### 2. Provider and guard
- `src/app/_layout.tsx`: `ClerkProvider` + `tokenCache` (keep the key check). Remove `AuthProvider`.
- `RootStack` uses `useAuth()` from `@clerk/expo`, returns `null` and holds the splash screen until `isLoaded`, then uses the guards.
- Delete `src/auth/mock-auth.tsx`.

### 3. Shared helpers
- `src/auth/clerk-errors.ts`: `fieldError(errors, name)` and `globalError(errors, error)` return messages.
- `src/auth/finalize.ts`: the `navigate` callback above.
- `src/auth/split-name.ts`: Full name → `{ firstName, lastName }`.

### 4. Screens
- **`sign-up.tsx`:** Clerk calls, captcha mount, field and global errors, `fetchStatus` loading.
- **`sign-in.tsx`:** password sign-in with the status handling.
- **`verify-email.tsx`:** `flow` param, verify, resend, guard.
- **`SocialButtons`:** Google SSO and the Apple alert.
- **`(app)/home.tsx`:** `useUser` and `signOut`.

### 5. Try it end to end
Rebuild, then do real flows on the iOS simulator with a real inbox (or Clerk test emails: `+clerk_test` addresses accept code `424242` in development):
1. Sign up → code → Home.
2. Kill and relaunch the app: still on Home.
3. Sign out → onboarding.
4. Sign in → Home (and code if asked).
5. Wrong password → error.
6. Duplicate email → error.
7. Google → Home.

The user taps; I take screenshots. Shut down the simulator and Metro afterwards.

## Verification
- `npx expo lint`, `npx tsc --noEmit`, and no secret or `EXPO_PUBLIC_` misuse (`git grep CLERK_SECRET` only hits `.env.example`).
- **Sign up:**
  - Bad email/short password → client errors.
  - Existing email → Clerk's message under Email.
  - Valid → code screen with the email.
  - Wrong code → Clerk's message under the boxes.
  - Resend works.
  - Right code → Home with the full name.
  - The user shows in Clerk with first/last name (`clerk` CLI: list users).
- **Persistence:** relaunch keeps the session without an onboarding flash.
- **Sign out:** back to onboarding; back gestures can't reach Home.
- **Sign in:**
  - Wrong password → error.
  - Unknown email → error.
  - Correct → Home, or the code screen first on a new device.
- **Google:** completes and lands on Home; cancelling does nothing.
- **Apple:** shows the coming-soon alert.

## AGENTS.md updates
- **Who owns what → Auth:**
  - Custom flows use `@clerk/expo` method-based hooks (`signUp.password`, `verifications.*`, `signIn.password`, `signIn.mfa.*`, `finalize`). Never the legacy `setActive` flow, except `useSSO`.
  - Sessions use `tokenCache`.
  - Sign-up screens render `nativeID="clerk-captcha"`.
  - Remove the mock-auth line.
- **Expo → Navigation:** the root layout waits for Clerk `isLoaded` (splash held) before applying the guards.
- **Rules:** `.env.example` lists the Clerk variable names.

## Result
Clerk custom flows replace the mock. Lint and tsc pass, and the dev build was rebuilt with `expo-secure-store`, `expo-auth-session` and the `@clerk/expo` plugin. The user confirmed every flow on the iOS simulator:
- Sign up with a code.
- The session persists after a relaunch.
- Sign out.
- Sign-in errors and success.
- Google SSO.
- Changes during the build:
  - First/last name was still off after the dashboard step (sign up failed with "first_name is not a valid parameter"). It was enabled with `clerk config patch --instance dev` (`user_model.first_name/last_name.enabled: true`, not required) after a dry run.
  - The verify screen counts `status === "complete"` as still waiting, so it doesn't redirect before `finalize()` hands over to the guard.
- Clerk lists one user (Google, first/last name set, email verified). No email-sign-up user was found in Clerk afterwards, so that path was confirmed only by the user's test.
- Fix after close-out: code → Home failed with "Unmatched Route" (`roamly:///`). The guard sent signed-in guests to `/`, which only onboarding owns. Both guards now set `redirectTo` (`/home` and `/`). Verified with a temporary self-running sign-up (test address, code 424242) → Home "Signed in as John Doe", and a signed-in cold start → Home. Temporary code removed.
