# 08 · Agent Actions copy and live Home

Status: done

## Goal
Every stay's `summary`, `description` and `highlights` are written by Sanity Agent Actions from that stay's own typed fields. Each draft is fact-checked before it's published, so the copy claims nothing the data doesn't support. Dataset embeddings rank on that copy. Home shows live stays from Sanity instead of `src/data/stays.ts`.

## Decisions
- **Facts are the typed fields only:**
  - `title`, `propertyType`, `location.city`, `location.region`
  - `maxGuests`, `bedrooms`, `bathrooms`, `rooms` (names and beds), `amenities`
  - `houseRules`: pets, smoking, parties, quiet hours, check-in/out times and method, and `additionalRules`, which is host-written text on the stay
- **Not used as facts:** price, fees, rating, reviews and host (they change, or are shown elsewhere). There's no new schema field.
- **The title is a name, not a fact.** Copy may repeat it, but features implied only by the title ("Creekside", "Lakeview", "Oceanfront") must not be claimed.
- **Consequence:** the copy gets plainer and loses nearby places ("5 minutes to Snow Summit"). Soft words like "quiet" are only allowed when a fact backs them, e.g. quiet hours or no parties. Embedding ranking gets fewer signals, so Verification records it before and after.
- **Generate:** `client.agent.action.generate` with `noWrite: true`, targeting only `summary`, `description` and `highlights`. Facts are passed as a `groq` instruction param that reads the stay itself. The schema ID comes from `sanity schema list`, and requests use API version `vX`, as Agent Actions require.
- **Check, in two layers. Copy must pass both:**
  1. **Code checks:** lengths match the schema. Every number in the copy equals a fact (guests, bedrooms, bathrooms, bed counts, times). Every amenity word used (pool, hot tub/spa, fireplace/wood stove, wifi, kitchen, parking, beach, desk/workspace, air conditioning, washer/laundry, EV charger, grill/BBQ) is in `amenities`. Pet wording matches `petsAllowed`. There are no prices, ratings or "$". Every capitalized place-like word must appear in the title, city or region.
  2. **Agent Actions `prompt` (JSON, no writes):** it lists every factual claim in the draft, each with the fact that supports it, or `null`. Any unsupported claim fails.
- **Retry:** a failing draft is regenerated up to 2 more times, and the failed claims are fed back into the instruction.
- **Landing:** copy that passes is patched onto the published document. Copy that still fails after 3 tries is saved as a Studio draft (`drafts.<id>`) for review, and the report lists the failing claims. Published copy stays as it was.
- **Description length:** the schema minimum drops from 60 to 40 words (a validation-only change, no data change), so short fact lists don't force padding. The maximum stays at 200.
- **Seed:** the seed keeps owning facts, prices and photos, but copy fields are only filled when missing. Existing `summary`, `description` and `highlights` are kept on re-runs.
- **Embeddings:** already enabled (`ready`) with the projection `title, propertyType, location{city,region}, summary, description, highlights`. Nothing changes. Updated copy re-embeds on its own within minutes.
- **Home data:**
  - The app calls Sanity's public CDN query API (`https://o5jn9krf.apicdn.sanity.io/v2026-10-01/data/query/production`) with `fetch`, `perspective=published`, and GROQ values passed as `$params`. No new packages and no token (the dataset is public).
  - Project ID, dataset and API version are public constants in `src/sanity/config.ts`.
- **Images** are the Sanity CDN asset URL plus `w`, `h`, `fit=crop` and `auto=format`, sized to the card × pixel ratio. They're center-cropped, so the hotspot is ignored for now.
- **Home** loads all published stays in one query (30 docs), featured first, then by rating. The category chips keep filtering in memory, so the existing animations stay.
- **Search** still uses `src/data/stays.ts` until the search API plan, so Home and Search briefly show different sets.
- **States:** loading shows two card-sized `bg-surface-muted` placeholders. Error shows a muted message and a secondary "Try again" `Button`. Empty shows "No stays yet" (or "No {type} stays yet" under a chip). Pull to refresh is supported. These states aren't in the design, so they're built from existing tokens and components, with no new tokens.
- **Cost:** each generate or prompt call uses 1 AI credit, so expect about 60–180 credits for 30 stays (2 per stay, up to 6 with retries). `--slug <slug>` runs one stay, and `--dry-run` writes nothing.

## Out of scope
- The Search screen, the search API route and Jev.
- Stay details screens, hotspot-aware cropping, TypeGen, and offline caching.
- New fact fields such as nearby places or host notes.

## Steps

### 1. Seed keeps existing copy
- In `studio/scripts/seed.ts`, when a property already exists, reuse its stored `summary`, `description` and `highlights` instead of the seed values. New documents still get the seed copy.
- Lower the `description` minimum to 40 words in `property.ts`, then run `sanity schema validate` and `sanity schema deploy`, and redeploy Studio.
- **Done when** `npm run seed` reports 0 updated, and a copy field changed in Studio survives a re-seed.

### 2. Copy writer script
- Add `studio/scripts/write-copy.ts` and `studio/scripts/copy/{facts,checks,instructions}.ts`, plus `"write-copy": "sanity exec scripts/write-copy.ts --with-user-token --"` in `package.json`.
- Flags: `--slug`, `--dry-run`.
- For each published property:
  1. Generate with `noWrite`.
  2. Run the code checks.
  3. Run the prompt check.
  4. Retry up to 2 more times with feedback.
  5. Publish the patch, or write a draft.
- Logs one line per stay (`pass`, `pass after retry`, `draft: <reasons>`), then totals.
- Read the current Agent Actions docs for `generate`, `prompt` and `instructionParams` before writing.
- **Done when** `--dry-run --slug creekside-hideaway` prints copy that passes both checks, and a deliberately bad sample (a test fixture with a made-up pool) fails the code check and the prompt check.

### 3. Write copy for all stays
- Record the embedding baseline (Verification). Then run `npm run write-copy`, re-run it for any drafts, and review the drafts in Studio.
- **Done when** all 30 stays have published copy that passed, or each stay left as a draft is listed with its reason in the Result.

### 4. Live Home
- Add:
  - `src/sanity/config.ts`
  - `src/sanity/fetch.ts`: `sanityFetch<T>(query, params, signal)`, which throws on non-200 and on `error` in the response.
  - `src/sanity/image.ts`: `sanityImage(url, width, height)`.
  - `src/sanity/queries.ts`: `HOME_STAYS_QUERY`, projecting `_id`, title, type, `location.city`/`region`, rating, `featured`, and the cover URL and alt from `photos[0]`.
  - `src/hooks/use-home-stays.ts`: loading, error, data, `refresh` and `refreshing`. It aborts on unmount.
- `FeaturedStayCard` takes a narrow `HomeStay` type instead of the local `Stay`, and passes the alt text to the image.
- `home.tsx` uses the hook, the chips filter its results, and it gets the loading, error and empty states plus a `RefreshControl`.
- **Done when** lint and tsc pass and the simulator shows live stays (Verification).

## Verification
- **Checks:** in `studio/`, `sanity schema validate`, `tsc`, `eslint` and `prettier` pass. In the app, `npx expo lint` and `npx tsc --noEmit` pass.
- **Seed:** a second run reports 0 created and 0 updated. A summary edited through a draft-free patch survives a re-seed.
- **Copy checks:**
  - The bad fixture fails both layers.
  - Over all 30 stays, record pass on the first try, pass after a retry, and drafts.
  - Spot-check 5 stays by hand against their facts.
  - Run a MCP query for any published copy containing "$", a rating, or an amenity word not in `amenities`. Expected: none.
- **Embeddings:** before and after the rewrite, record the top 3 for:
  - "quiet secluded getaway", over the pet-friendly hot-tub cabins up to $300
  - "big group ski trip"
  - "romantic ocean view escape for a couple"
  
  Explain any change by cause (the copy lost a fact, or the query).
- **Home in the simulator:**
  - The first screen shows live stays (cards whose titles exist only in Sanity, e.g. Saguaro Sky Villa).
  - A temporary chip selection shows the Villas filter.
  - Temporary code forces the loading, error and empty states for screenshots, then is removed.
  - Compare with the design and list the differences.
- **End to end:** edit a stay's title in Studio and publish. Pull to refresh on Home, and the new title appears. Then revert the title.

## AGENTS.md updates
- **Who owns what → Content:**
  - Property copy (`summary`, `description`, `highlights`) is written by `npm run write-copy` (Agent Actions) from the stay's typed fields only. It's published only after the code checks and the Agent Actions prompt fact-check pass; failures stay as drafts.
  - The seed fills copy only when missing.
- **Rules:** copy may not claim anything a typed field doesn't support. The title is a name, not a fact.
- **Expo / data:**
  - The app reads published content straight from the Sanity CDN query API through `src/sanity/fetch.ts`, with `$params`, no token, and the public constants in `src/sanity/config.ts`.
  - Images go through `sanityImage()`.
  - This doesn't apply to work that needs secrets or Jev, which stays in API routes.

## Result
- **Copy:** the first full run passed 24 of 30 stays (13 on the first try, 8 after 1 retry, 3 after 2 retries) and left 6 as drafts.
  - All 6 failed on code-check false positives:
    - "host" in a real host-greets check-in or house rule
    - "desk" from a front-desk check-in
    - "Lake" or "Pine" from the city or name
    - title-cased "Bedrooms"
    - "pets aren't allowed" not recognised
  - The checker now removes fact phrases (name, city, check-in method) before scanning, treats words used in the facts as ordinary, and widens the no-pets wording. The self-test still fails the made-up pool in both layers.
  - Re-running the 6 passed them all. All 30 are published, with 0 drafts.
- **Scans and spot checks:**
  - MCP scans found no prices or ratings, no pool or hot tub without the amenity, and no views, decks or distances.
  - Every stay has 5 highlights.
  - Manual spot check: Key West, Montecito, Malibu, Lakeview and Germantown are all supported by their fields.
- **Deviation:** facts are passed to Generate as a constant JSON param, built from one GROQ fetch, rather than a `groq` param, so the generator and both checks see identical facts.
- **Embeddings, before → after:**
  - Quiet cabins: Creekside, Modern Cabin, Cedar Hollow → Pine Ridge, Creekside, Cedar Hollow. The "secluded" and "no neighbors" claims had no field behind them, so the copy dropped them.
  - Ski trip: Pine Ridge, Mount Hood, Aspen Grove → Pine Ridge, Aspen Grove, Mount Hood.
  - Romantic ocean: Sunset Cliffs, Montecito, Key West → Sunset Cliffs, Montecito, Surfside.
- **Home:**
  - The simulator shows live stays (Desert Modern Villa first, Montecito Pool Estate under Villas).
  - Loading, error and empty states were screenshotted via temporary code, which is now removed.
  - A published title edit appeared after a reload. Pull to refresh itself wasn't tapped, because the simulator can't be tapped.
- **Seed:** a re-run after the copy pass reported 0 created and 0 updated.
