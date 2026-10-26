# 14 · Android polish

Status: done

## Goal
Every screen lays out and works correctly on Android (nothing under the status bar or gesture bar, nothing hidden by the keyboard, no clipped headings), and the system parts (tab bar, sheets, back gesture, press feedback) feel native to Android while keeping the editorial design.

## Decisions
- Scope: correctness plus native feel, same editorial design on both platforms (user's choice). No Material redesign.
- Verification runs on a local emulator: Android SDK at `~/Library/Android/sdk` (Homebrew `android-commandlinetools`), AVD `roamly_pixel` (Pixel 8, Android 36, 4 GB RAM, `-gpu host`). Without host GPU the app renders at ~5 s per frame and Maestro can't type.
- iOS behavior must not change. Every fix is either cross-platform-neutral or gated on `Platform.OS === "android"` / `@media android`.
- No new dependencies. If the built-in `KeyboardAvoidingView` can't keep inputs visible under edge-to-edge (step 2), stop and ask before adding `react-native-keyboard-controller`.
- Press feedback stays opacity-based (editorial), with an Android ripple added only to full-width rows (`ListRow`, `PolicyCard`), where Material users expect it.
- `app.json` gets `android.package: com.anonymous.roamly` (written by `expo prebuild`; mirrors the iOS bundle id).

### Findings (emulator, before)
1. **Status bar overlap:** Home, Search, Trips and Profile rely on `contentInsetAdjustmentBehavior="automatic"`, which is iOS-only. On Android content starts at y=0: the avatar and logo sit under the clock and battery icons.
2. **Keyboard covers inputs:** Ask's input is fully hidden when the keyboard opens (`KeyboardAvoidingView` has no Android behavior; edge-to-edge means the window no longer resizes). On sign up, "Create account" is half hidden and dragging dismisses the keyboard instead of scrolling (`automaticallyAdjustKeyboardInsets` and `keyboardDismissMode="interactive"` are iOS-only).
3. **Clipped serif headings:** Fraunces descenders are cut on the last line of `display`, `hero` and similar variants ("your stor**y**", "Find **y**our", "next sta**y**"). Android clips glyphs that fall outside the line box; the tight line heights (1 to 1.06) leave no room.
4. **Tab bar:** Material defaults: grey bar, lavender indicator, no icons drawn at all (`md` icons don't render), and only the selected tab's label shows (the default label mode with 4 tabs).
5. **Sheets:** detents work, but there's no grabber (`sheetGrabberVisible` and `sheetCornerRadius` are iOS-only), and `fitToContents` sheets (host, settings, personal info) put their last line on the gesture bar because Android doesn't reserve the bottom inset the way iOS does.
6. **Onboarding:** "Continue with Google" sits right on the gesture bar.
7. **Back:** `predictiveBackGestureEnabled: false`, so Android 14+ users get no back preview.
8. Already fine: stay details (draws its own insets), booking bar, sheet detents, the Sort action sheet fallback (`Alert`), Apple sign-in hidden on Android, glass fallbacks.

## Out of scope
- Dark mode, tablets/landscape, Android-specific layouts.
- Replacing `Alert`-based dialogs with Material dialogs.
- Play Store config (signing, a real package name, EAS profiles).
- Making the Maestro flows run on Android (Maestro waits ~10 s per typed character on the auth screens because something keeps animating; worth its own fix later).

## Steps

### 1. Top safe area on tab screens
Add `src/hooks/use-tab-top-inset.ts` returning `insets.top` on Android and `0` on iOS (where `contentInsetAdjustmentBehavior="automatic"` already does it). Apply it as `contentContainerStyle={{ paddingTop }}` (merged with existing padding) on the ScrollViews in `src/app/(app)/home.tsx`, `search/index.tsx`, `trips.tsx` and `profile.tsx`; keep `contentInsetAdjustmentBehavior` for iOS. Done when all four screens on Android start below the status bar and iOS screenshots are unchanged.

### 2. Keyboard
- `src/app/stay/[slug]/ask.tsx`: give `KeyboardAvoidingView` a behavior on Android too (try `"padding"`, then `"height"`); keep `"padding"` on iOS. Done when the input and chips sit right above the keyboard on Android.
- `src/components/auth/auth-screen.tsx`: wrap the ScrollView in a `KeyboardAvoidingView` that's active on Android only (iOS keeps `automaticallyAdjustKeyboardInsets`), and use `keyboardDismissMode="on-drag"` on Android only, so the form can scroll while typing. Done when, with the keyboard open on sign up, the guest can scroll to and tap "Create account".
- If neither behavior works with edge-to-edge, stop and ask about `react-native-keyboard-controller`.

### 3. Serif line heights on Android
In `global.css`, inside the existing `:root { @media android { … } }` block, raise the line-height ratios only for the serif variants that clip (`display`, `hero`, `title-lg`, `title-xs`, and any others seen clipping) to the smallest value that shows full descenders (start at ~1.15). If NativeWind doesn't apply `@theme` line-height overrides under `@media android`, use Android-only padding in the `Text` variants instead. Done when onboarding, sign up, verify, Home and stay details headings show full descenders on Android and iOS spacing is unchanged.

### 4. Tab bar
In `src/app/(app)/_layout.tsx`: set `backgroundColor` (`surface`), `indicatorColor` (`accent-50`), `rippleColor` (`accent-100`), icon colors (`iconColor` ink/muted) and `labelVisibilityMode="labeled"`. Find out why `md` icons don't render (`expo-router/build/native-tabs/utils/materialIconConverter.android.js` loads them via `expo-symbols` `unstable_getMaterialSymbolSourceAsync`); fix the cause, or fall back to `src`/`drawable` icons. Any new colors come from `src/theme/colors.ts`. Done when all four tabs show an icon and label in brand colors on Android, and iOS is unchanged.

### 5. Sheets
- Add `src/components/ui/sheet-grabber.tsx`: a small centered `line`-colored pill, rendered only on Android, at the top of every sheet (`StaySheet` and the root `settings`, `personal-info` and `policies` sheets).
- On Android, `fitToContents` sheets add `insets.bottom` below their content (`StaySheet` non-scroll branch, `settings.tsx`, `personal-info.tsx`).
- Leave `src/config/sheet-options.ts` as it is (its iOS-only props are ignored on Android); add a comment saying so.
Done when every sheet shows a grabber and its last line clears the gesture bar on Android.

### 6. Onboarding and native feel
- Onboarding (`src/app/index.tsx`): make sure the bottom actions clear the gesture bar on Android (bottom safe-area padding).
- `app.json`: `predictiveBackGestureEnabled: true`; check the back gesture on stay details, Ask, Search and the sheets. Native rebuild.
- Android ripple (`android_ripple` with `accent-50`) on `ListRow` and `PolicyCard` rows; keep their `active:` classes constant per the design-system rule.
Done when back gestures preview correctly and rows ripple on Android.

### 7. Regression check on iOS
Run the existing Maestro flows (01–06) on the iOS simulator and compare key screenshots with the current ones.

## Verification
- `npx tsc --noEmit` and `npx expo lint` pass.
- Android emulator (`npx expo run:android`), screenshots before and after for: onboarding, sign up (keyboard open), verify, Home, Search results, Trips, Profile, stay details, Ask (keyboard open), cancellation, host, policies, settings and personal info sheets, and the tab bar.
- Back gesture on stay details, Ask and a sheet; hardware back from each tab.
- iOS: Maestro flows 01–06 pass and the screenshots match the current build.

## AGENTS.md updates
- Commands: start the emulator (`~/Library/Android/sdk/emulator/emulator -avd roamly_pixel -gpu host`) and `npx expo run:android`.
- Expo section: tab screens get their Android top inset from `use-tab-top-inset`; `contentInsetAdjustmentBehavior`, `automaticallyAdjustKeyboardInsets`, `keyboardDismissMode="interactive"`, `sheetGrabberVisible` and `sheetCornerRadius` are iOS-only, so each screen using them needs its Android counterpart.
- Design system: serif line heights are raised on Android in `@media android` to stop descender clipping; Android sheets draw `SheetGrabber`; rows ripple on Android.
- Remove "Android visual check" as an open item from future plans: every UI plan's Verification includes the Android emulator.

## Result
Built as planned, checked on the Android emulator (Pixel 8, API 36) and the iOS simulator.
- Fixed: status bar overlap (Home, Search, Profile; Trips is centered and didn't need it), keyboard on Ask and the auth screens, clipped serif descenders, the tab bar (colors, labels, icons), sheet grabbers and bottom insets, onboarding's gesture-bar overlap, predictive back, row ripple.
- Found while building: the status bar kept the light icons a photo screen set after it closed (fixed with a dark default `StatusBar` in the root layout), and Android tab icons never loaded because react-native-css's `react-native` wrapper lacks `AssetRegistry`, which expo-asset needs (fixed in `metro.config.js` for expo-asset only, chosen by the user over Lucide PNG icons or patch-package).
- Auth screens on Android: the form shrinks and scrolls above the keyboard; the focused field stays visible. Scrolled content passes under the transparent status bar, as on iOS.
- Predictive back shows the system back arrow and returns correctly; the previous screen doesn't peek during the gesture (react-native-screens' stack animation).
- iOS: Maestro flows 01, 02, 03, 05 and 06 pass. 04 fails at "Book this stay": the first tap is swallowed while the dev warning toast (`Sending onAnimatedValueUpdate with no listeners registered`) is up; a second tap shows the alert. This change doesn't touch that screen.
- Left for later: Maestro on Android (typing waits ~10 s per character on the auth screens), the `onAnimatedValueUpdate` warning, and the iOS build error `framework 'React' not found` (the installed iOS dev build was reused).
