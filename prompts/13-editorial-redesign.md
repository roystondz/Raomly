# 13 · Editorial redesign

Status: done

## Goal
Give every signed-in screen an original "editorial travel journal" look, so the app no longer resembles the reference designs:
- Serif display headings.
- Photos with text below them, not overlaid.
- Squarer corners.
- Hairline dividers in place of filled grey boxes.

Data, navigation, behavior and analytics stay exactly as they are. Only presentation changes.

## Decisions
- **Direction:** the user chose me to propose it, in the "editorial travel journal" style. This replaces the rule "screens must match attached designs exactly" for the screens in scope. The new source of truth is this plan plus the `/design-system` gallery.
- **Scope:** all signed-in screens (the user chose this):
  - Home, Search, stay details and its sheets, the Ask chat, Trips, and Profile and its sheets.
  - Onboarding and auth follow in a later pass. They share the tokens, so they pick up the font, corners and colors automatically but keep their layouts.
- **Most of the change happens once, in the foundation:**
  1. **Serif display font:** Fraunces (SIL Open Font License, Google Fonts), in SemiBold, as a new `--font-serif`.
     - The `display`, `hero`, `title-lg`, `title`, `title-sm` and `title-xs` variants switch to it. `headline`, `body`, `label`, `caption`, `footnote` and `button` stay Plus Jakarta Sans.
     - It's a font file (asset) added to the `expo-font` plugin list in `app.json`, so **it needs a native rebuild** (`npx expo run:ios`). Until then the titles fall back to the system font. No npm package is added.
  2. **Squarer corners** through the radius tokens, which every rounded element already uses:
     - `sm` 8→4, `md` 12→6, `lg` 16→8, `xl` 20→10, `2xl` 24→12.
     - `full` stays, for avatars and round icon buttons only.
  3. **Shared component restyle:**
     - **Button:** rectangular `rounded-md` instead of a pill.
     - **Chip:** outlined `rounded-sm` tag. Selected is ink-filled with `on-ink` text, replacing the green fill.
     - **PolicyCard:** becomes an editorial link row: no tinted box, hairline top and bottom, an icon without a tile, a serif title, and an arrow in `accent-600`.
     - **ListGroup/ListRow:** no white card. Rows sit on the page with full-width hairlines. The tile icon background is removed.
     - **IconButton:** `filled*` and `muted` become outlined (`border-line bg-surface`). `overlay*` (over photos) stays white.
     - **Alert, Badge, TextField:** pick up the new radii automatically. No other change.
     - A new `SectionLabel` component: `footnote-medium`, uppercase, letter-spaced, `muted`, with a hairline under it. It replaces the grey section panels.
- **Screen changes** (layout only; same data):
  - **Home:**
    - The heading in serif.
    - The prompt becomes an underlined input row (`border-b border-ink`) with the arrow at the right, instead of a green pill.
    - Category chips as tags.
    - Featured stays become **photo on top (4:3, `rounded-lg`), text below**: the title in serif `title-sm`, then "Lake Arrowhead, CA · ★ 4.9". A hairline separates stays. The rating pill and round chevron on the photo are removed.
  - **Search:**
    - The header is an underlined search field (no grey pill), with back and clear as plain icons.
    - Filter chips as tags, and the count line in `SectionLabel` style.
    - Results become rows separated by hairlines: a square thumbnail (`size-24 rounded-md`), a serif title, a meta line, amenity text separated by "·" (not pills), and the price in bold. The heart is a plain icon with no circle.
  - **Stay details:**
    - The photo stays full-bleed, but the content no longer overlaps it with a rounded panel. Content starts below the photo on white.
    - The title is serif `title-lg`. The rating badge becomes an inline line: "★ 4.9 · 214 reviews · Lake Arrowhead, CA".
    - Amenities become a two-column text list with icons, under a `SectionLabel` "What's here".
    - The policy cards become editorial link rows.
    - The host row is plain, with no ring or shadow.
    - The booking bar has a hairline top border, no shadow, and a rectangular button.
  - **Ask chat:**
    - Guest questions become right-aligned serif lines with a thin `accent-600` left rule, instead of filled bubbles.
    - Answer cards lose the box. Each becomes a block with a 2px `accent-400` left rule, the topic title in serif `title-xs`, the facts and text, and "Source: …" as a muted `footnote`.
    - Chips as tags, and the input as an underlined row with the send arrow.
  - **Trips:** the empty state gets a serif title and a hairline-framed illustration area (icon only). Same copy.
  - **Profile:**
    - Name in serif `title-lg` beside a `size-20` avatar.
    - Email in muted text, and stats as one inline line: "0 trips · 0 saved".
    - Account and Preferences under `SectionLabel`s, with hairline rows.
    - "Roamly policies" as an editorial link row.
    - The gear becomes an outlined icon button.
  - **Sheets** (policies, cancellation, host, settings, personal-info): serif titles, and `SectionLabel` where a sheet has sections. Otherwise unchanged.
- **Unchanged:**
  - The colors ("Forest & sand"), the native tab bar, and all copy (except "What's here" and the stats line).
  - Data, events, routes, motion, and the loading, error and empty states (restyled only).
- **No new dependencies.** One font asset (Fraunces SemiBold TTF plus its OFL license) is added to `assets/fonts/`.

## Out of scope
- Onboarding and auth layouts (a later pass).
- Dark mode.
- New features.
- An Android visual check.

## Steps

### 1. Foundation
- Add the Fraunces font file and license, register it in `app.json`, and add `--font-serif` and the serif text variants.
- Change the radius tokens.
- Restyle Button, Chip, PolicyCard, ListGroup/ListRow and IconButton, and add `SectionLabel`, with gallery entries.
- Rebuild the dev client (`npx expo run:ios`).
- **Done when** `tsc` and lint pass, and **a screenshot of `/design-system` is shown to the user for a go/no-go before any screen is changed.** This is the checkpoint: if the direction isn't right, only the foundation needs adjusting.

### 2. Home and Search
- Rework the featured card and result row to the layouts above.
- **Done when** screenshots of both are compared against the Decisions.

### 3. Stay details, sheets and Ask
- The layouts above.
- **Done when** screenshots of details, a sheet and the chat with an answer are compared against the Decisions.

### 4. Trips and Profile
- The layouts above.
- **Done when** screenshots of both, plus the settings sheet.

## Verification
- `npx expo lint` passes, and `tsc` passes with `agent/` excluded (as before).
- A simulator screenshot of every in-scope screen after the rebuild, checked against the Decisions. Each difference is listed and fixed. The phone follows any temporary code, which the user has allowed before.
- Behavior is unchanged: search results, chips, the Ask answers and the PostHog events are spot-checked on one flow each. A PostHog query confirms the same events still arrive.
- Not tapped (the simulator can't be tapped) is listed as before.

## AGENTS.md updates
- **Building from designs:** in-scope screens follow the editorial direction in this plan and the `/design-system` gallery, not the old reference images. New screens use the same language.
- **Design system:**
  - Serif (`font-serif`, Fraunces) for display through `title-xs`, sans for everything else.
  - Square-ish radii.
  - Hairlines and `SectionLabel` instead of filled grey panels.
  - Photos with text below.
  - Chips are tags, selected ink-filled.

## Result
Built as planned. Every signed-in screen uses the editorial language, and data, routes, behavior and events are unchanged.

- **Foundation:**
  - Fraunces SemiBold, OFL, from Fontsource, internal PostScript name `Fraunces-SemiBold`. It's in `assets/fonts/` with `Fraunces-OFL.txt` and registered in `app.json`. NativeWind's platform `--font-serif` (Georgia) is overridden in `global.css`.
  - Radius tokens halved.
  - Button `rounded-md`.
  - Chip is an outlined tag, selected ink-filled. The `tone` and `appearance` props are removed from all call sites.
  - PolicyCard is a link row (the `tile` prop is removed).
  - ListGroup/ListRow are hairline rows (`inset` removed, `variant="tile"` became `lg`).
  - IconButton `filled*`/`muted` are outlined.
  - New `SectionLabel` and Text `eyebrow`.
  - Large button labels use the new sans `button-lg` (the user chose this at the checkpoint).
- **Checkpoint finding:** the first rebuild didn't embed the font, because `expo run:ios` reused the old `ios/` folder. Running `npx expo prebuild --platform ios` and then rebuilding fixed it (recorded in AGENTS.md).
- **Screens:**
  - Home: an underlined prompt with an ink arrow, tags, and stays shown as a 4:3 photo with the text below.
  - Search: an underlined field, an eyebrow count, and compact hairline rows with a square thumbnail. The plain heart overhangs so one-line titles don't leave a gap.
  - Stay details: no overlapping panel, a serif title, an inline rating line, a "What's here" two-column list, "Good to know" link rows, "Your host", and a hairline booking bar.
  - Ask: right-aligned serif questions with an `accent-600` rule (on the right edge, beside the right-aligned text, rather than the left as planned), answers as ruled passages with a muted source, and an underlined input.
  - Trips: a hairline-framed mark with a serif title.
  - Profile: a serif name, the email, an inline stats line, `SectionLabel` sections with hairline rows, and a Policies link row.
  - Sheets: serif titles.
- **Verified:**
  - Simulator screenshots of Home, Search, stay details, Ask (with answers), Trips, Profile and the settings sheet.
  - `tsc` passes with `agent/` excluded, and lint passes.
  - PostHog still receives `stay_opened`, `stay_search_completed`, `stay_question_asked` and `stay_search_submitted`.
- **Not tapped** (the simulator can't be tapped): tags, rows, sheets by hand, Book, Share and heart. These were checked by code only.
- **Later:** an onboarding and auth layout pass. They already use the new font, corners and colors.
