# Roamly

Expo React Native rental app. Guests describe a stay in one sentence ("quiet pet friendly cabin with a hot tub under $300 a night") and get ranked stays back. They can also ask booking and policy questions about a stay, answered with exact text from Roam's own content.

This file is the project's memory: it holds every decision that is still true. Plans in `prompts/` are history.

## Commands

~~~bash
npx expo install <package>  # ALWAYS use instead of npm install: resolves SDK-compatible versions
npx expo start              # dev server (press i for the iOS simulator)
npx expo lint               # lint
npx tsc --noEmit            # type check
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
npx eas-cli@latest <cmd>    # EAS builds, submits, and updates (use instead of bare `eas`)
cd studio && npm run seed   # idempotent seed (uses your Sanity CLI login, no token)
cd studio && npm run write-copy [-- --slug x --dry-run | --self-test]  # Agent Actions copy
cd studio && npx sanity schema deploy && npx sanity deploy  # after schema changes
~~~

## Expo

- Expo ships breaking changes every SDK release, so don't trust memory. Before touching an Expo, EAS, or React Native API, check the `expo` major version in `package.json` and read `https://docs.expo.dev/versions/v<major>.0.0/`. For anything else, start from https://docs.expo.dev/llms.txt and follow its links.
- Routes live in `src/app/`: every file is a screen and `_layout.tsx` files define navigators. API routes are `src/app/api/*+api.ts`. Keep components, hooks, and utils outside `src/app/`.
- Published content is read straight from the Sanity CDN query API through `src/sanity/fetch.ts`, with values as `$params` and no token. Queries live in `src/sanity/queries.ts` and images go through `sanityImage()`. Automatic loads use the CDN, which can lag up to about a minute behind Studio. Pull to refresh passes `fresh: true` to read the live API. Home reloads quietly on focus and when the app returns to the foreground, at most every 15 seconds. Home is not real-time; that would need the Live Content API and new packages. Work that needs secrets, Jev or semantic search goes through API routes instead. Home is live, while Search still uses `src/data/stays.ts` until its API route exists.
- Navigation: the root Stack hides headers and screens opt in. The root layout holds the splash until Clerk `isLoaded`, then guards with `Stack.Protected`: signed out → `index` (onboarding) + `(auth)`, signed in → `(app)`. Each guard needs `redirectTo` (`/home` and `/`), because onboarding owns `/` and a signed-in guest would otherwise land on an unmatched route. Screens never navigate after an auth change; the guard redirects.
- `ios/` and `android/` are generated. Never create or edit them by hand; configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, switch to a development build (`npx expo run:ios`).

## Who owns what

Each tool has one job. Ask before moving a responsibility to a different tool.

- **Auth:** Clerk is the source of truth. The app keeps its own custom auth screens. Set Clerk up through the Clerk CLI and use the Clerk MCP (or the installed Clerk skills) for current Expo patterns.
  - Custom flows use `@clerk/expo` method-based hooks: `signUp.password`, `signUp.verifications.*`, `signIn.password`, `signIn.mfa.*`, `finalize`. Never the legacy `setActive`/`prepareFirstFactor` flow; only `useSSO` (Google) uses `setActive`.
  - Sessions persist with `tokenCache` (`@clerk/expo/token-cache`).
  - Sign-up screens render `<View nativeID="clerk-captcha" />`.
  - Instance config changes go through `clerk config patch` with `--dry-run` first.
  - First/last name are enabled (optional); "Full name" is split in code (`src/auth/split-name.ts`).
- **Content:** Sanity, project `o5jn9krf`, dataset `production`, Studio at https://roamly.sanity.studio. Schema lives in `studio/schemaTypes/` and deploys from `studio/` with the local CLI. Never use the MCP's `deploy_schema`/`deploy_studio`, which are only for MCP-managed schemas. Content changes, dataset settings and checks go through the Sanity MCP.
  - `property` holds typed filter fields (`propertyType`, `pricePerNight`, `maxGuests`, `bedrooms`, `bathrooms`, `amenities`, `houseRules.petsAllowed`, `location.city`/`region`) and the ranking text (`summary`, `description`, `highlights`). House rules and rooms are embedded objects on it.
  - `host` and `policy` are shared documents. A stay references one cancellation policy. Every other policy category applies to all stays.
  - Fixed value lists (amenities, types, beds, policy categories) live in `studio/schemaTypes/constants.ts`. Amenity keys match the app's search code, so rename them only together.
  - Beds are counted from `rooms[].beds[].count` in GROQ, never stored. Policy `body` is plain text shown verbatim.
  - The seed (`studio/scripts/seed.ts`) finds documents by `slug.current` and photos by `source.id` (Unsplash). Running it restores seeded facts, prices and photos that were edited in Studio, but fills copy (`summary`, `description`, `highlights`) only when it's missing.
  - Property copy is written by `npm run write-copy` (Agent Actions `generate`, schema `_.schemas.default`, API `vX`) from the stay's typed fields only. Price, rating and host are excluded, and the title is a name, not a fact.
  - Copy is published only after it passes both `scripts/copy/checks.ts` (code) and an Agent Actions `prompt` fact-check. After 3 failed tries it stays a Studio draft. When a check misfires, fix the check, never loosen the facts rule.
- **Exact constraints** (price, guests, type, amenities, pets, place): GROQ filters, with values always passed as params.
- **Soft intent** (quiet, cozy, secluded): Dataset Embeddings via `text::semanticSimilarity()` inside `score()`. The embeddings projection covers `property` only: `{_type=="property"=>{title,propertyType,location{city,region},summary,description,highlights}}`. Update it (`datasets embeddings enable … --projection`) when those fields change.
- **Policy knowledge:** a Sanity Context endpoint in Knowledge Base mode. Context endpoints are created in the Dashboard's Context app and read with an organization token (Context Viewer), per https://www.sanity.io/docs/ai/context-migration-guide. One endpoint serves one mode. The Context skill still describes `sanity.agentContext` Studio documents with a project token; that route is deprecated, so don't use it.
- **Typed decisions** (which stay topics and policies answer a question): Jev, called from API routes through the AI SDK's `experimental_evaluate` with the `@ai-sdk/typesafe-ai` provider and `TYPESAFE_AI_API_KEY`. No Vercel AI Gateway. Keep `ai` and `@ai-sdk/typesafe-ai` pinned to exact versions, since the API is experimental.
- **Answer text:** none generated. Answers show the stay's own fields and policy text word for word, with their source. No LLM runs in the app.
- **Analytics:** PostHog, identified through Clerk.

## Rules

- Secret keys (Clerk secret key, TypeSafe key, Sanity organization token, Sanity write token) never reach the app bundle. Use them only in API routes and local scripts such as seeding. Never put them behind `EXPO_PUBLIC_`, which is bundled into the app. Never commit `.env`. Keep variable names, without values, in `.env.example` (`EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).
- Sanity Context needs a deployed Studio for the dataset. Redeploy Studio from `studio/` after schema changes.
- Jev is not an agent. It answers typed questions (Choice, Noul, Score) with probabilities. It never writes GROQ, calls tools, or generates text. Code builds queries from its answers.
- Prices, guest counts, and dates are parsed in code. Jev may choose between candidates code found, but never produces the value.
- Embeddings rank, they don't filter, and they only see the document itself (no references). Hard constraints are always GROQ filters, and text that should affect ranking lives on the property document.
- Policy answers show only text from the stay's data and Roam's policies, word for word. If nothing answers the question, say so and point to support.
- API routes verify the Clerk session before doing any work.
- PostHog failures never block the app. Never send what guests type, tokens, or personal data in events.
- Let Sanity generate document IDs. Model relationships as references.
- Ask before adding a dependency or service, changing the Sanity schema once content exists, or deleting data. Prefer Expo modules over third-party libraries.
- Whenever you need input from the user, ask through your tool's built-in question panel so they pick from options instead of typing. Give two to four clear options with the recommended one first. Fall back to plain text only if no such panel exists.

## How we build features

For a new feature or a change across several files. Small fixes and questions skip this.

1. **Understand.** Read the code involved. Open an earlier plan only if this feature builds directly on it (pick by file name). Read the current docs pages for the APIs you'll use, and load a matching skill if one exists (e.g. the Expo, Clerk, Sanity, Sanity Context, or TypeSafe skills). Don't write version-specific APIs from memory.
2. **Ask.** If a real decision is unclear (scope, visible behavior, data shape), ask in the question panel, batching questions into one round and following up only if the answers raise new ones. Pick defaults for the rest and list them. If a decision in this file looks wrong, raise it instead of changing it.
3. **Plan.** Copy `prompts/TEMPLATE.md` to `prompts/NN-feature-name.md` (next number) and fill it in. The plan must be self-contained, so a fresh session can build it from this file plus the plan alone.
4. **IMPORTANT: stop and wait.** Write no app code until the user approves the plan. Ask for approval in the question panel (approve, or request changes). If they request changes, update the plan and ask again. On approval, set `Status: approved`.
5. **Build** step by step, checking each one. If a step turns out wrong, stop and explain instead of redesigning.
6. **Close out.**
   - Run the plan's Verification and give the report described under Reporting.
   - Add a short `## Result` to the plan and set `Status: done`.
   - Update this file: put each lasting decision in the section it belongs to. Replace or remove rules that are no longer true instead of appending. Keep this file under 150 lines.

## Building from designs

Designs are attached in the chat. Screens must match them exactly: layout, spacing, sizes, colors, type, radii, icons, and copy.

- Icons, fonts, and brand images come from `assets/` or the chosen icon library, never recreated from a screenshot. Sample property photos may be remote placeholder images. If an asset is missing, use a marked placeholder and list it.
- Map every color, font, spacing value, and radius to a design-system token. List values with no token in the plan as proposed new tokens instead of hardcoding them. When creating the design system itself, derive the tokens from the designs.
- UI plans describe the design (elements, states, tokens, assets) well enough to build without the image. If building in a new session, ask for the design to be attached again.
- After building, open the screen in the iOS simulator (deep link with `xcrun simctl openurl booted <url>` when it isn't the first screen; the scheme is in `app.json`), take a screenshot (`xcrun simctl io booted screenshot <path>`), and compare it with the design. List every difference, fix, and repeat. Report which values were estimated from an image.

## Design system

- Tokens live only in `global.css` `@theme`. `src/theme/colors.ts` mirrors colors only for color props (icons, Switch, placeholders, GlassView); keep the two in sync. No hex values elsewhere.
- Tailwind's default palette and type/radius/shadow scales are removed. Spacing is `--spacing: 4px` because native rem is 14.
- `TextInput`s use `text-input` (font size, no line height). A line height makes iOS push typed text down and clip it while editing.
- Line heights are unitless ratios (`--text-x--line-height: 1.5`). NativeWind multiplies them by font size, so px values make text hundreds of points tall.
- Font is Plus Jakarta Sans, one family per weight (`font-sans`, `font-sans-medium`, `font-sans-bold`), embedded with the expo-font config plugin. It only shows in the dev build (`npx expo run:ios`), not Expo Go. Never use `font-bold`.
- Icons are Lucide through `src/components/ui/icon.tsx`. The wordmark is `src/components/ui/logo.tsx` (source `assets/images/logo.svg`).
- Shared components are in `src/components/ui/`. Screens use `Text` variants, never font or size classes. Don't pass two classes for the same property (e.g. a font class over a variant); add a variant instead.
- Text and icons over photos follow the photo's tone: `ink` on light tops, `on-ink` on dark. Glass over photos uses `useGlassAvailable` (`src/hooks/`) with `scrim`/`surface-glass` fallbacks.
- Light mode only for now.
- Home has no search button beside the heading (removed by request, a deliberate difference from the design). Search is reached through the prompt pill or the Search tab.
- `/design-system` is the dev-only gallery of every component, for comparing against designs.

## Reporting

End every piece of work that changes code (features and fixes, not answers to questions) with this report. Use these headings in this order, and leave out any section that would be empty.

- **Done:** one line on the outcome, then the files changed and what changed in each.
- **Verified:** each check with ✅ or ❌ and its evidence (command output, screenshot). List what wasn't checked as ❌ with the reason. Never mark something ✅ without running it.
- **You need to:** numbered actions only the user can take, such as keys, dashboard settings, manual steps in Sanity, or assets to provide.
- **Test it yourself:** numbered steps to reproduce the result from a fresh start, ending with `Expected:` and what the user should see.
- **Notes:** defaults picked, trade-offs, and anything left for later.

## Checks

- Lint and type check pass before any task is called done.
- Screens that load data handle loading, error, and empty states.
- AI features are tried against realistic inputs, and failures are explained by cause: missing data, the decision Jev made, the query, or the code.