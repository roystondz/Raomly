# 02 · Design system

Status: done

## Goal
Every screen draws from one visual source: Roam's design tokens (colors, type, spacing, radii, shadows) in `global.css`, the Plus Jakarta Sans font, Lucide icons, and a shared component set covering all 15 sections of the design sheet. A dev-only gallery screen shows every component so it can be compared with the design.

## Decisions
- Source design: the "roam" design sheet (sections 01–15) attached in chat. **Attach it again if building in a new session.** Pixel values are estimated from the sheet, which appears to be at ~1:1 scale. Values marked `≈` are estimates; the rest are written on the sheet.
- Styling: NativeWind 5 (already installed). Tokens are Tailwind v4 `@theme` variables in `global.css`, the single source of truth. No second theme system.
- `src/theme/colors.ts` mirrors the color hex values **only** for APIs that take a color prop and can't take a className (Lucide `color`, `Switch`, `ActivityIndicator`, `placeholderTextColor`, `GlassView tintColor`). It carries a "keep in sync with global.css" comment.
- NativeWind's native `rem` is 14, so Tailwind's default scale is off the 4pt grid. Fix: `--spacing: 4px` (so `p-4` = 16), and px values for every type size and radius.
- Remove Tailwind's default palette, type scale and radius scale (`--color-*: initial` etc.) so only Roam tokens exist.
- Font: Plus Jakarta Sans (OFL), Regular 400, Medium 500 and Bold 700. Take the static TTFs from the `@expo-google-fonts/plus-jakarta-sans@0.4.2` tarball (via `npm pack` in the scratchpad, **not** added as a dependency). Save them in `assets/fonts/` named after their PostScript names (`PlusJakartaSans-Regular.ttf`, `-Medium`, `-Bold`) so iOS and Android resolve the same family names, then embed them with the `expo-font` config plugin. Add `OFL.txt` alongside.
- Each weight is its own family: `font-sans` (Regular), `font-sans-medium`, `font-sans-bold`. Never use `font-bold` with this font.
- Icons: Lucide (`lucide-react-native` + `react-native-svg`, installed with `npx expo install`). Default size 24, stroke 2, color `ink`.
- Light mode only: set `userInterfaceStyle: "light"` in `app.json`. Colors are CSS variables, so a dark set can be added later without touching components.
- Components live in `src/components/ui/`, one kebab-case file each. Each component takes `variant`/`size`/state props plus `className`/`style` merged last, shows feedback when pressed, and sets accessibility role, state and label.
- Wordmark: the user chose "roamly" (the sheet shows "roam") and asked for it to be generated: Plus Jakarta Sans ExtraBold outlines, -4% tracking, saved as `assets/images/logo.svg` and rendered as a react-native-svg path in `logo.tsx`. The Google "G" still uses a marked placeholder until provided.
- Toggle: native `Switch` tinted with `primary` (track) and white (thumb). It keeps the platform's size (iOS 51×31) instead of the sheet's ≈64×36, following the skill rule not to restyle native controls.
- Glass tab bar: `GlassView` from `expo-glass-effect` (already installed) on iOS 26+. If `isGlassEffectAPIAvailable()` is false, or Reduce Transparency is on, it falls back to `surface-glass` with a hairline border. It's built as a presentational component taking `items`/`activeKey`/`onSelect`; wiring it into a `Tabs` navigator happens with the first tab screens.
- Gallery route: `src/app/design-system.tsx`, deep link `roamly://design-system`. Redirects to `/` when `!__DEV__`.

### Tokens (`global.css` `@theme`)

**Colors**
| Token | Value | Use |
|---|---|---|
| `primary` | #FFC629 | Primary actions, active states, star, toggle on |
| `primary-50` ≈ | #FFF6DA | Guest favorite badge bg |
| `lavender` | #C9B4FF | Secondary actions, selected chip |
| `lavender-50` ≈ | #F4EFFF | Focused field bg, policy card bg |
| `lavender-100` ≈ | #E7DDFF | Policy icon tile |
| `lavender-400` ≈ | #B49BF7 | Focused field border |
| `lavender-600` ≈ | #7B5BE4 | Policy icons, policy chevrons |
| `ink` | #0B0B1A | Headings, primary text, selected segment |
| `muted` | #6B7280 | Body, secondary text |
| `subtle` ≈ | #9CA3AF | Placeholders, "/ night" |
| `surface` | #FFFFFF | Cards, sheets, modals |
| `surface-muted` | #F4F5F7 | App background, input fields, icon buttons |
| `line` | #E5E7EB | Dividers, borders |
| `surface-glass` | rgba(255,255,255,0.7) | Tab bar, glass surfaces |
| `success` ≈ | #1E9E5A | Success icon |
| `success-50` ≈ | #E7F5EC | Success alert, "New" badge bg |
| `success-700` ≈ | #1B7A45 | Success text |
| `danger` ≈ | #E5484D | Error icon |
| `danger-50` ≈ | #FDECEE | Error alert, discount badge bg |
| `danger-700` ≈ | #C53340 | Error text |
| `info-50` ≈ | #E8EEFF | Superhost badge bg |
| `info-700` ≈ | #3451C7 | Superhost text |
| `on-ink` | #FFFFFF | Text/icons on `ink` |

**Type** (`--text-<name>` + `--line-height`, font family per variant)
| Variant | Font | Size / line height | Source |
|---|---|---|---|
| `display` | Bold | 56 / 56, tracking ≈ -1 | sheet: 56–64, lh 1.0 |
| `title` | Bold | 28 / 34 | sheet: 28–32, lh 1.2 |
| `title-sm` ≈ | Bold | 20 / 24 | listing card title, price |
| `headline` ≈ | Bold | 15 / 20 | policy card title, stepper value |
| `body` | Regular | 16 / 24 | sheet |
| `label` ≈ | Medium | 16 / 20 | chips, input text, segmented, row labels |
| `caption` | Medium | 14 / 20 | sheet |
| `footnote` ≈ | Regular | 12 / 16 | policy description, tab labels (Medium) |
| `button` | Medium | 17 / 22 | sheet: 17–18 |

**Spacing**: `--spacing: 4px`, used as multiples of 4 (`1 2 3 4 5 6 8 10 12 16`). Screen gutter ≈ 20 (`px-5`), card padding ≈ 16, gap between related items 8, between sections 24.

**Radius**: `sm` 8, `md` 12, `lg` 16, `xl` 20, `2xl` 24, `full` 9999. Every non-capsule radius also gets `corner-squircle`.

**Shadows** ≈: `shadow-card` `0 2px 12px rgba(11,11,26,0.06)`; `shadow-raised` `0 8px 24px rgba(11,11,26,0.10)` (tab bar, floating heart).

### Components (sizes ≈ unless stated)
1. **Logo**: generated "roamly" wordmark (`height` default 56, `color` token, default `ink`).
2. **Text**: `variant` (type table) + `tone` (`ink` default, `muted`, `subtle`, `on-ink`, `success`, `danger`, `info`). Screens never set font size.
3. **Icon**: `<Icon icon={Heart} size={24} color="ink" />` (color is a token name). Also accepts `fill` for the filled star.
4. **Button**: `primary` (bg primary, text ink) and `secondary` (bg surface, 1px `line` border). Sizes `md` (h 56, px 24, `button` type) and `sm` (h 36, px 20, `caption`). Optional `leading`/`trailing` nodes (Google "G" placeholder, `ArrowRight`). Title centered, trailing icon pinned right. Capsule. States: pressed (opacity 0.85), disabled (0.4), loading (spinner, keeps the label for accessibility).
5. **IconButton**: 56 circle, bg `surface-muted`, icon 24 ink. `accessibilityLabel` required. Variant `overlay` (32 white circle, `shadow-raised`, icon 18) for the card heart.
6. **TextField**: h 56, radius `lg`, bg `surface-muted`, leading icon 24, `label` text, placeholder `subtle`. Focused: bg `lavender-50`, 1.5px `lavender-400` border. Variants: `default`, `search` (bg surface, 1px `line` border, trailing `SlidersHorizontal` filter button), `password` (Lock leading, Eye/EyeOff toggle trailing, `secureTextEntry`).
7. **Chip**: selectable, `accessibilityState.selected`. `md` (h 48, px 24, `label`); `sm` with leading icon (h 44, px 16, `caption`, icon 18). Unselected: bg surface, 1px `line`. Selected tone `lavender` (bg lavender) or `primary` (bg primary).
8. **ListingCard**: bg surface, radius `xl`, p 8, `shadow-card`, horizontal. Image 160×156, radius `lg` (expo-image, remote placeholder URL in the gallery) with an overlay heart IconButton top-right. Then `title-sm` 2-line title, MapPin + location `caption` muted, filled Star + rating `caption` bold-ish ink + "(342)" muted, amenity tags (h 32, radius full, bg `surface-muted`, icon 16 + `footnote` medium), price `title-sm` + "/ night" `body` subtle. Props: `stay` data object, `saved`, `onToggleSave`, `onPress`.
9. **PolicyCard**: bg `lavender-50`, radius `lg`, p 16, gap 12. Icon tile 40 radius `md` bg `lavender-100`, icon `lavender-600`. Title `headline`, description `footnote` muted 2 lines, ChevronRight `lavender-600`. Pressable.
10. **ListGroup / ListRow**: group bg surface, radius `xl`, hairline `line` separators inset. Row h 52, px 16, leading icon 24, `caption` label, ChevronRight 18. Pressable rows.
11. **GlassTabBar**: capsule h 72, `shadow-raised`, glass or fallback (see Decisions). Items: icon 24 + `footnote` medium label. Active: 64 `primary` circle behind icon+label. Gallery shows Home/Search/Trips/Profile.
12. **Icon set** (section 11): House, Search, Heart, Calendar, User, Settings, MapPin, SlidersHorizontal. These are Lucide names, not new components.
13. **SegmentedControl**: track bg `surface-muted`, radius full, p 4, h 52. Options icon 20 + `label`. Selected bg `ink`, text/icon `on-ink`. `accessibilityRole="tab"` + selected.
14. **Toggle**: native `Switch`, `trackColor.true = primary`, thumb white.
15. **Stepper**: h 52, radius full, 1px `line`, Minus/Plus IconButtons (no bg, 20 icon), value `headline`. `min`/`max` disable the ends. Labels "Decrease"/"Increase".
16. **Alert**: `success` / `error`. h 48, radius `md`, px 16, bg `*-50`. Leading 24 filled circle (`success`/`danger`) with white Check/`!`, message `caption` in `*-700`, X dismiss (labelled "Dismiss") optional.
17. **Badge**: h 40, px 20, radius full, `caption`. Tones `favorite` (bg primary-50, filled Star), `success`, `danger`, `info`.

## Out of scope
- Dark mode, motion/animation tokens, and haptics.
- Real navigation (Tabs layout), real screens, auth and data. Components only render props.
- Splash screen and app icon colors in `app.json`.
- Updating the three outdated Expo packages flagged by `expo install --check` (router, splash-screen, status-bar). That's a separate fix.

## Steps
### 1. Fonts, dependencies and app config
Run `npx expo install lucide-react-native react-native-svg`. In the scratchpad, `npm pack @expo-google-fonts/plus-jakarta-sans@0.4.2`, extract it, and copy `PlusJakartaSans_400Regular.ttf`, `_500Medium.ttf`, `_700Bold.ttf` to `assets/fonts/` as `PlusJakartaSans-Regular.ttf`, `-Medium.ttf`, `-Bold.ttf`, plus the OFL license as `assets/fonts/OFL.txt`. In `app.json`, add the `expo-font` plugin with `fonts: [the three paths]` and set `userInterfaceStyle: "light"`. Done when `npx expo run:ios` builds and the dev menu or `getLoadedFonts()` lists the three family names. If the iOS names differ from the file names, rename the files to match.

### 2. Tokens
Rewrite `global.css`: keep the existing imports, then add an `@theme` block with `--color-*: initial`, `--text-*: initial`, `--radius-*: initial`, and every token from the tables above (`--font-sans`, `--font-sans-medium`, `--font-sans-bold`, `--spacing: 4px`, colors, `--text-<name>` with `--text-<name>--line-height` and, for display, `--letter-spacing`, radii, `--shadow-card`, `--shadow-raised`). `nativewind/theme` sets `--font-sans` per platform in `:root`, so check `font-sans` resolves to Plus Jakarta and, if not, override in a `:root { @media ios/android }` block after the import. Create `src/theme/colors.ts` (hex mirror, typed `ColorToken` union) and `src/theme/index.ts`. Done when a test `<Text className="font-sans-bold text-title text-ink p-4">` renders in Plus Jakarta Bold 28 with 16 padding, and lint and tsc pass.

### 3. Base components
`src/components/ui/`: `text.tsx`, `icon.tsx`, `logo.tsx`, `button.tsx`, `icon-button.tsx`. Use the component contract in Decisions. Merge `className` with a plain template join, with no new class-merging dependency.

### 4. Inputs and controls
`text-field.tsx`, `chip.tsx`, `segmented-control.tsx`, `toggle.tsx`, `stepper.tsx`. TextField tracks focus itself with `onFocus`/`onBlur` (still calling the caller's handlers), and the password eye toggles visibility.

### 5. Feedback
`alert.tsx`, `badge.tsx`.

### 6. Composites
`listing-card.tsx`, `policy-card.tsx`, `list-group.tsx` (exports `ListGroup`, `ListRow`), `glass-tab-bar.tsx`.

### 7. Gallery and cleanup
`src/app/design-system.tsx`: a ScrollView on `surface-muted` with one titled section per sheet section (01–15), showing every variant and state (including focused field, disabled and loading button, both alerts). Redirect to `/` when `!__DEV__`. Update `src/app/index.tsx` to use `Text` (it currently uses `text-blue-500`, which no longer exists) and add a dev-only link to the gallery.

### 8. Compare with the design
Open `roamly://design-system` with `xcrun simctl openurl booted roamly://design-system`, screenshot with `xcrun simctl io booted screenshot`, and compare with the sheet section by section. List every difference, fix it, and repeat until only estimated-value differences remain.

## Verification
- `npx expo lint` and `npx tsc --noEmit` pass.
- `npx expo-doctor` shows no new issues from the added packages.
- iOS simulator dev build: fonts load (three families), and the gallery renders every section with no red box or warnings.
- Interaction checks in the gallery: buttons dim when pressed; the loading button shows a spinner and ignores taps; the focused field shows the lavender state; the password eye toggles; chips and segmented options toggle selection; the stepper stops at min and max; alert dismiss hides the alert; the heart toggles.
- Grep for drift: there should be no hex colors outside `global.css` and `src/theme/colors.ts`, and no `fontSize`/`text-[`/`p-[` literals in `src/components` or `src/app`.
- Final screenshot side by side with the sheet; report differences and the values that were estimated.

## AGENTS.md updates
Add a **Design system** section:
- Tokens live only in `global.css` `@theme`. `src/theme/colors.ts` mirrors colors only for color props. Keep them in sync.
- Tailwind's default palette and type/radius scales are removed. Spacing is `--spacing: 4px` (native rem is 14).
- Font is Plus Jakarta Sans, one family per weight (`font-sans`, `font-sans-medium`, `font-sans-bold`), embedded with the expo-font config plugin. Never use `font-bold`.
- Icons are Lucide via `src/components/ui/icon.tsx`.
- Shared components are in `src/components/ui/`. Screens use `Text` variants instead of font classes.
- Light mode only for now.
- `/design-system` is the dev-only gallery for comparing against designs.

## Result
Built as planned. Tokens, fonts, Lucide, the 17 components and the `/design-system` gallery all render in the iOS dev build (iPhone 17 Pro). Lint and tsc pass.
- Changes during the build: line heights became unitless ratios because px values were multiplied by font size. The listing card photo is `w-36` and stretches to the card's height so the title fits two lines. The tag pills are smaller (h 28). `footnote-medium` was added as a Text variant. The home link uses `router.push` and a Button.
- Wordmark: generated "roamly" (the user's choice), not the sheet's "roam".
- Remaining differences from the sheet: the toggle is native size (51×31); filled-style icons (the "All Stays" house) are Lucide outlines; listing tags wrap inside the gallery's padded section; the Google "G" is still a placeholder.
