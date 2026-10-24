# 07 · Content model and seed

Status: done

## Goal
Sanity holds the real content for Roamly: properties, hosts and policies, modeled from the screens built so far plus the search results and stay details screens that come next. The schema is deployed, Studio is redeployed, embeddings are on for properties, and a seed script loads 30 realistic stays. Running the seed again updates the same documents instead of duplicating them.

## Decisions
- **Results card** shows a space summary ("3 bd · 4 beds · 2 ba") on top of today's fields. No host badge and no photo gallery on the card.
- **Stay details** has a description, highlights, the full amenity list, rooms & beds, check-in details, house rules, a host card, and policy cards. No map, so no coordinates are stored.
- **Pricing:** nightly price, cleaning fee, and minimum nights, in whole USD. No availability calendar, so dates aren't filtered yet.
- **Photos** are Sanity image assets with hotspot and required alt text, uploaded by the seed from Unsplash. The first photo is the cover.
- **Typed fields for everything guests filter on:** `propertyType`, `pricePerNight`, `maxGuests`, `bedrooms`, `bathrooms`, `amenities` (fixed list), `houseRules.petsAllowed`, and `location.city`/`location.region`. Search filters these with GROQ params.
- **Descriptive text stays on the property** so embeddings can see it: `summary`, `description`, `highlights`. This replaces the local `vibes` tags, since soft intent now comes from embeddings.
- **Embeddings projection** covers properties only: `{ _type == "property" => { title, propertyType, location { city, region }, summary, description, highlights } }`. Hosts and policies aren't embedded. Policies are for the Context knowledge base.
- **Shared documents:** `host` and `policy`, referenced from `property`. A property references one cancellation policy. Every other policy (booking & payment, guest conduct, damage, rebooking) applies to all stays and isn't referenced.
- **House rules are per stay**, so they're an embedded object on the property: pets, smoking, parties, quiet hours, check-in/out times, check-in method, extra rules. Booleans are used for the yes/no rules.
- **Policy body is plain `text`**, not Portable Text, so the app can show it word for word with no rich-text renderer (no new app dependency). Paragraphs are separated by blank lines.
- **IDs:** Sanity generates every `_id`. The seed finds existing documents by `slug.current` (and image assets by `source.id`), then updates or creates them. Array `_key`s are stable strings from the seed data, so re-runs don't churn diffs.
- **Beds** aren't a separate number. They're counted from `rooms[].beds[].count` in GROQ, so they can't drift from the room list. `bedrooms` stays typed, because guests filter on it ("3 bedroom cabin").
- **Rating and review count** are plain numbers on the property. There are no review documents yet.
- **Deploying (raised, not assumed):** the MCP's `deploy_schema` and `deploy_studio` only work for MCP-managed schemas, and refuse when a local Studio exists. Its CLI tool can't read local files. Since `studio/` is the source of truth (and Context needs the deployed Studio), the schema and Studio deploy from `studio/` with the local Sanity CLI. The MCP does everything else: enabling embeddings, checking the schema, querying, and validating the seed.
- **Seed runner:** `npx sanity exec scripts/seed.ts --with-user-token` from `studio/`. It uses your logged-in CLI session, so there's no write token to create or store, and no new package.
- **One new Studio dependency:** `@sanity/icons` (already installed as part of `sanity`, but used directly for document icons, so it gets declared).
- **Seed content is sample data:** fictional hosts and stays at real place names, photos from Unsplash, and sample Roam policies written for development. The policies need real review before launch.

## Out of scope
- The app reading from Sanity, the search API route, Jev, and the stay details screen UI. Those are separate plans, and `src/data/stays.ts` stays as it is until then.
- Creating the Context knowledge base endpoint (done in the Dashboard's Context app).
- Availability calendars, reviews as documents, maps/coordinates, and host profile screens.
- Agent Actions copy generation (seed copy is hand-written).
- TypeGen (no app queries yet).

## Content model

### `property` (document, icon `HomeIcon`)
| Field | Type | Notes |
|---|---|---|
| `title` | string | required, max 60 |
| `slug` | slug from title | required, unique. Also the seed's lookup key |
| `propertyType` | string list `cabin` \| `beach` \| `city` \| `villa` | required, radio. Matches the Home chips |
| `featured` | boolean | Home's featured row. Default false |
| `host` | reference → `host` | required |
| `location` | object `{ city, region, country }` | all strings, required. `country` defaults to "United States" |
| `photos` | array of image (hotspot, `alt` required) | min 3, max 12. First is the cover |
| `summary` | text (2 rows) | required, max 160. One-line pitch |
| `description` | text (8 rows) | required, 60–200 words. The main embedded text |
| `highlights` | array of string | 3–6 short lines, e.g. "Cedar hot tub on the deck" |
| `pricePerNight` | number | required, integer, 50–5000 |
| `cleaningFee` | number | integer, 0–1000, default 0 |
| `minNights` | number | integer, 1–30, default 1 |
| `maxGuests` | number | required, integer, 1–20 |
| `bedrooms` | number | required, integer, 0–12 (0 = studio) |
| `bathrooms` | number | required, 0.5 steps, 0.5–12 |
| `rooms` | array of `room` | sleeping arrangements |
| `amenities` | array of string from a fixed list | unique. List below |
| `houseRules` | object `houseRules` | below |
| `cancellationPolicy` | reference → `policy` | required, filtered to `category == "cancellation"` |
| `rating` | number | 0–5, one decimal |
| `reviewCount` | number | integer ≥ 0 |

Groups in Studio: Details, Photos & copy, Pricing & space, Rules & policy. Preview: title, `location.city`, and the cover photo.

**Amenity keys** (fixed list, title-cased in Studio): `hot-tub`, `pool`, `wifi`, `fireplace`, `kitchen`, `parking`, `beach-access`, `workspace`, `air-conditioning`, `washer`, `ev-charger`, `bbq-grill`. The first 8 are today's keys, so the local parser and `amenityMeta` still line up.

### `room` (object)
- `name` (string, required, e.g. "Bedroom 1", "Loft", "Living room")
- `beds` (array of `{ type, count }`): `type` is one of `king`, `queen`, `double`, `twin`, `bunk`, `sofa-bed`, and `count` is an integer from 1 to 6.

### `houseRules` (object)
- `petsAllowed`, `smokingAllowed`, `partiesAllowed` (boolean, required)
- `quietHours` (`{ start, end }`, strings "HH:mm", optional)
- `checkInTime`, `checkOutTime` (string "HH:mm", required, regex validated)
- `checkInMethod` (string list: `keypad`, `lockbox`, `smart-lock`, `host-greets`, `front-desk`)
- `additionalRules` (array of string, shown word for word)

### `host` (document, icon `UserIcon`)
- `name` (string, required), `slug` (from name, required, used as the seed key)
- `photo` (image, hotspot, `alt` required)
- `bio` (text, max 400)
- `hostingSince` (date, required). The app shows years hosting.
- `responseTime` (string list: `within-an-hour`, `within-a-few-hours`, `within-a-day`)
- `languages` (array of string)

### `policy` (document, icon `DocumentTextIcon`)
- `title` (string, required), `slug` (from title, required, used as the seed key)
- `category` (string list: `cancellation`, `booking-payment`, `guest-conduct`, `damage`, `rebooking`; required)
- `summary` (string, max 120, required). The `PolicyCard` description.
- `body` (text, required). Exact policy wording, shown verbatim.

## Seed data
- **8 hosts** with varied names, languages and response times. Each hosts 2–6 stays.
- **7 policies:** Flexible, Moderate and Strict cancellation, plus Booking & payment, Guest conduct & parties, Damage & security, and Rebooking & refunds.
- **30 stays:** the 11 in `src/data/stays.ts` (same titles, so the same slugs) plus 19 new ones. Mix: 9 cabins, 8 beach, 7 city, 6 villas. Places span CA, OR, WA, CO, AZ, UT, NY, TX, TN and FL. Prices run $95–$950. Guests 2–14, a mix of pets allowed and not, and every amenity used at least twice.
- **Fixtures that must hold:**
  - At least 3 stays match "quiet pet friendly cabin with a hot tub under $300".
  - At least 2 match "beach house for 6 under $400".
  - At least 2 city stays have a workspace.
  - At least 1 stay has no results for a deliberately narrow query, e.g. a villa under $150.
- **3 photos per stay** (Unsplash IDs). Before upload, each photo is checked with a HEAD request, and dead IDs are swapped.
- **Files:** `studio/scripts/seed.ts` (runner) and `studio/scripts/seed-data/{hosts,policies,properties}.ts` (plain typed arrays).

## Steps

### 1. Schema
- Add `studio/schemaTypes/documents/{property,host,policy}.ts`, `studio/schemaTypes/objects/{room,house-rules}.ts`, and `studio/schemaTypes/constants.ts` (the amenity, type, bed, check-in method and policy category lists), and register them in `schemaTypes/index.ts`.
- Use `defineType`, `defineField` and `defineArrayMember` throughout, with icons from `@sanity/icons/<Name>` subpaths, plus the validation, groups and previews above.
- Add the `@sanity/icons` dependency in `studio/`.
- **Done when** `npx sanity schema validate`, `npx tsc --noEmit` and `npx eslint .` pass in `studio/`, and `npx sanity dev` shows the three document types with working forms.

### 2. Deploy the schema and Studio
- From `studio/`, run `npx sanity schema deploy` and then `npx sanity deploy`. The deploy asks for a studio hostname; use `roamly` (or `roamly-content` if that's taken).
- Confirm with MCP `get_schema` that `property`, `host` and `policy` are deployed.
- **Done when** the hosted Studio opens and `get_schema` lists the types.

### 3. Turn on embeddings
- MCP `run_sanity_cli`: `datasets embeddings enable production --project-id o5jn9krf --projection='<projection above>'`, then `datasets embeddings status`.
- **Done when** the status is `ready` (it may show `updating` until the seed lands).

### 4. Seed script
- `seed.ts` uses `getCliClient({ apiVersion: '2026-10-01' })`.
- It works in this order:
  1. Policies, then hosts, then properties.
  2. For each document, look it up by `slug.current` and `_type`. If found, `createOrReplace` it with the found `_id`. If not, `create` it with no `_id`.
  3. Photos: look up `sanity.imageAsset` by `source.id`. Upload only if missing, with `source: { name: 'unsplash', id, url }`.
  4. References are resolved from the slugs → IDs map built in step 2.
- Uploads run with a concurrency of 4.
- The script logs `created / updated / unchanged` counts per type and exits non-zero on any failure.
- Writes go straight to published IDs (no drafts).
- Add `"seed": "sanity exec scripts/seed.ts --with-user-token"` to `studio/package.json`.
- **Done when** `npm run seed` completes twice in a row. The second run creates no documents or assets.

### 5. Validate the content with the MCP
- Counts: 30 `property`, 8 `host`, 7 `policy`, and no drafts.
- `documents_validate` on all seeded documents returns no errors.
- Every property has a resolvable host and a cancellation policy, and 3 photos with alt text.
- Run the fixture queries (Verification) and record the results.

## Verification
- `npx sanity schema validate`, `npx tsc --noEmit` and `npx eslint .` pass in `studio/`. The app's `npx expo lint` and `npx tsc --noEmit` still pass (no app files change).
- Idempotency: run `npm run seed` twice. Then `count(*[_type in ["property","host","policy"]])` == 45, `count(*[_type == "sanity.imageAsset"])` equals the number of unique photos, and the second run's log shows 0 created.
- Change one stay's price in Studio, re-run the seed, and the price is restored. Nothing is duplicated.
- GROQ fixtures (values passed as params):
  - `*[_type=="property" && propertyType==$type && pricePerNight <= $max && houseRules.petsAllowed && $amenity in amenities]` with `cabin`, `300`, `hot-tub` → ≥ 3.
  - `beach`, `maxGuests >= 6`, `<= 400` → ≥ 2.
  - `city` + `workspace` → ≥ 2.
  - `villa` `<= 150` → 0.
- Embeddings: once `ready`, the cabin filter above with `| score(text::semanticSimilarity("quiet secluded getaway"))` ranks a quiet, secluded stay first. Record the top 3 and why.
- Results card fields: `bedrooms`, `bathrooms` and `"beds": math::sum(rooms[].beds[].count)` come back for every stay.
- Details: one stay projected with `host->{name, hostingSince, responseTime, languages}`, `cancellationPolicy->{title, summary, body}`, `houseRules` and `rooms` comes back complete.

## AGENTS.md updates
- **Who owns what → Content:** the model is `property` (typed filter fields plus summary/description/highlights for embeddings), with shared `host` and `policy` documents. Stays reference one cancellation policy. Other policies apply to every stay. Schema lives in `studio/schemaTypes/`.
- **Who owns what → Content:** schema and Studio deploy from `studio/` with the local CLI (`npx sanity schema deploy`, `npx sanity deploy`). The MCP's `deploy_schema` is for MCP-managed schemas and must not be used here. This replaces "Schema deploys … go through the Sanity MCP". Content changes and dataset settings still go through the MCP.
- **Soft intent:** the embeddings projection covers `property` only (title, type, location, summary, description, highlights). Text that should rank goes in those fields. Update the projection when they change.
- **Commands:** `cd studio && npm run seed` re-seeds idempotently (it looks documents up by slug and assets by `source.id`).
- **Rules:** policy `body` is plain text shown verbatim, and beds are always counted from `rooms`, never stored.

## Result
- The schema deployed from `studio/` (`npx sanity schema deploy`) and Studio is live at https://roamly.sanity.studio (`appId` is recorded in `sanity.cli.ts`). Embeddings were enabled through the MCP with the projection above, and the status is `ready`.
- The seed loaded 7 policies, 8 hosts, 30 properties and 87 images. A second run reported 0 created, 0 uploaded, and everything unchanged. After a published price was edited to 999, a re-run restored it (1 updated, 45 documents still).
- MCP checks: 0 drafts, 0 broken references, every stay has 3 photos with alt text, and `documents_validate` marked all 45 valid (custom rules weren't run by the tool; a local pre-check covered word counts and bathrooms).
- Fixtures:
  - The pet-friendly hot-tub cabin query (≤ $300) returned 5 stays.
  - Beach for 6+ (≤ $400) returned 4.
  - City with a workspace returned 4.
  - Villa ≤ $150 returned 0.
- Embeddings: "quiet secluded getaway" over those 5 cabins ranked Creekside Hideaway, Modern Cabin with Hot Tub, then Cedar Hollow Cabin. "Big group ski trip" ranked Pine Ridge Lodge first. "Romantic ocean view escape for a couple" over all stays ranked Sunset Cliffs Hideaway first, but Montecito Pool Estate second (its summary mentions "ocean breezes").
- Changes from the plan:
  - Prices run $145–$950 rather than $95–$950.
  - Some interior photos are shared by two stays (none by more).
  - 4 stays from `src/data/stays.ts` got new covers that match their copy: Lakeview Chalet, Oceanfront Beach House, Coastal Family Retreat, and Vineyard Villa.
  - The seed retries Unsplash 5xx responses, after a 503 stopped the first run.
