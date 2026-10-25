# 11 · Ask about this stay

Status: done

## Goal
From a stay's details page, "Ask about policies" opens a chat screen titled "Ask about this stay".
- The guest types a question or taps a topic chip, which sends that topic's question.
- Each reply is a stack of answer cards, one per topic, never a written paragraph.
- Each card shows this stay's own data or Roam's policy text word for word, with a source label.
- There's no backend: a local keyword match picks the topics, standing in for Jev.

## Decisions
- **No design attached:** the screen is built from the design system (the user chose this). There are no new tokens, and any new component variant is listed below.
- **Answers come from this stay's real data** (the user chose this), already loaded by `useStay` (cached, no new request).
  - Topic choice is a pure local function, `src/ask/match-topics.ts` (keyword patterns → topic keys). It's a stand-in for Jev's typed decision, the same split as search's local parser was. Replace it, don't extend it, when Jev is wired.
  - Card text is never generated:
    - Policy bodies, `additionalRules` and the host bio are shown word for word.
    - Typed fields are shown as plain facts ("After 4:00 PM", "Allowed").
- **Entry:** the details page's "Ask about policies" card opens `/stay/[slug]/ask` (a normal push in the stay Stack, not a sheet, because it needs the keyboard). The chat header has a "See all policies" link that opens the existing `policies` sheet (the user chose this).
- **Topics** (key → chip label → question sent → card → source label). Each line is one topic key, then the chip label, the question the chip sends, the card's contents, and its source label:
  - `cancellation` → "Cancellation" → "What's the cancellation policy?" → the policy `body` word for word → "{policy title} · Roam policy"
  - `check-in` → "Check-in" → "How do check-in and check-out work?" → check-in after / check-out by / method → "House rules"
  - `pets` → "Pets" → "Are pets allowed?" → Allowed / Not allowed, plus any `additionalRules` that mention pets, dogs or cats, word for word → "House rules"
  - `quiet-hours` → "Quiet hours" → "Are there quiet hours?" → the hours, or "No quiet hours listed" → "House rules"
  - `smoking-parties` → "Smoking & parties" → "Can we smoke or have a party?" → Smoking / Parties: Allowed / Not allowed → "House rules"
  - `house-rules` → "House rules" → "What are the house rules?" → every `additionalRules` line word for word → "House rules"
  - `guests` → "Guests & beds" → "How many people does it sleep?" → sleeps N · bedrooms · beds · baths → "Stay details"
  - `price` → "Price & fees" → "What does it cost?" → nightly price · cleaning fee · minimum nights → "Stay details"
  - `amenities` (not a chip; matched when a question names an amenity) → "Hot tub: Yes" / "Pool: No" for each amenity named → "Amenities"
  - `payment` → "Payment" → "When do I pay?" → the Booking and payment `body` word for word → "Booking and payment · Roam policy"
  - `damage` → (no chip) → the Damage and security `body` → "Damage and security · Roam policy"
  - `refunds` → (no chip) → the Rebooking and refunds `body` → "Rebooking and refunds · Roam policy"
  - `host` → "Host" → "Who is the host?" → name, hosting since, response time, bio word for word → "Host profile"
  - Chips shown: Cancellation, Check-in, Pets, House rules, Guests & beds, Price & fees, Quiet hours, Smoking & parties, Payment, Host.
- **One card per matched topic,** in the order the topics are listed above. Several topics in one question give several cards ("pets and check-in" → 2 cards).
- **No match:** one "No answer found" card, "We couldn't find this in the stay's details or Roam's policies. Roam support can help." with source label "Roam support". There's no support channel in the app yet, so there's no button. This follows the rule to say so and point to support.
- **Conversation:**
  - It starts with an intro row: a lavender message icon tile and "Ask about cancellation, pets, check-in and more. Answers come straight from this stay's details and Roam's policies." The topic chips sit above the input.
  - Messages live in screen state only, for this visit. There's no persistence and no sample history beyond the intro. The "sample messages" are these local replies.
  - A reply appears after a short fake "Checking…" row (≈ 400ms), so the exchange reads as a conversation. It's skipped when Reduce Motion is on.
- **Input:** a pill at the bottom, with:
  - the Lucide `MessageCircle` icon inside it on the left (as requested),
  - a `TextInput` (placeholder "Ask about this stay…", `returnKeyType="send"`),
  - a round send button (`ArrowUp` on `bg-primary`), disabled while empty.
  - `KeyboardAvoidingView` (React Native core, `behavior="padding"` on iOS) keeps it above the keyboard. No new dependency.
- **PostHog:** `stay_question_asked` with these properties. Never the question text.
  - `stay_id`
  - `source`: `chip` | `typed`
  - `topics`: array of topic keys
  - `topic_count`
  - `answered`: false when there was no match
- **Motion:** new messages and cards use `FadeInDown` 200ms with a 40ms stagger per card. The list scrolls to the end on each new message. `ReduceMotion.System`, so only fades remain.
- **States:**
  - The stay usually comes from the cache. A cold open shows the same loading and error frame as the sheets (back button + `Alert` + "Try again").
  - Empty conversation = the intro.

## Out of scope
- Jev, Sanity Context and any API route.
- Persisting conversations.
- Free-text answers.
- A support contact flow.
- Voice input.
- Android visual check.

## Design (from the design system; no new tokens)
- **Screen:** `bg-surface`, safe-area top.
- **Header row:** `px-5 pt-2 pb-3`, flex-row, `items-center`, `gap-3`.
  - `IconButton` `filled-sm` with `ChevronLeft` (Back).
  - A title column: `Text variant="title-xs"` "Ask about this stay", then `Text variant="caption-regular" tone="muted"` with the stay title (1 line).
  - Right: a pressable `Text variant="caption" tone="lavender"` "See all policies".
  - A hairline `h-px bg-line` below.
- **List:** a `ScrollView` with `px-5 py-4 gap-4`.
  - **Intro:** a row with a `size-10 rounded-md bg-lavender-100` tile (`MessageCircle` at 22, `lavender-600`) and `Text variant="body" tone="muted"`.
  - **Guest message:** right-aligned, `max-w-[80%] self-end rounded-2xl rounded-br-sm bg-lavender px-4 py-3`, with `Text variant="body"`.
  - **Reply:** a `gap-3` stack of **AnswerCard**s, left-aligned, full width.
  - **"Checking…":** `Text variant="caption-regular" tone="muted"` with a small `ActivityIndicator` (`colors.muted`).
- **AnswerCard** (new, `src/components/ask/answer-card.tsx`):
  - `rounded-xl corner-squircle border border-line bg-surface p-4 gap-3`.
  - Header: a `size-9 rounded-md bg-lavender-50` tile with the topic icon at 20 in `lavender-600`, and `Text variant="headline"` with the topic title.
  - Body: facts as `Rule` rows (label `muted`, value `ink`, `body`) or verbatim paragraphs (`body`, one `Text` per paragraph).
  - Footer: a source label pill `self-start h-7 rounded-full bg-surface-muted px-2.5 gap-1.5` with `BookOpen` at 14 in `muted` and `Text variant="footnote-medium" tone="muted"` reading "Source: House rules".
  - The no-answer card uses the same frame with a `SearchX` icon.
  - It reuses `PolicyText`'s paragraph split and `HouseRules`' `Rule` row: both move to shared exports in `src/components/stay/policy-text.tsx`.
- **Topic chips:** a horizontal `ScrollView` above the input, `px-5 gap-2`, using `Chip` `size="xs"` `appearance="muted"` (an existing variant).
- **Input bar:** `px-5 pt-2`, bottom padding = safe-area bottom + 8 (or 8 while the keyboard is open).
  - The pill is `h-13 flex-1 flex-row items-center gap-3 rounded-full bg-surface-muted pl-4 pr-1.5`.
  - `MessageCircle` at 22 in `muted`, then a `TextInput` (`text-input font-sans-medium text-ink flex-1`).
  - Send: `IconButton`, **new variant `primary-sm`**: `size-10 bg-primary`, icon 20, ink. It's disabled at `opacity-40` while the input is empty.
- **Topic icons:**
  - cancellation `FileText`
  - check-in `KeyRound`
  - pets `PawPrint`
  - quiet hours `Moon`
  - smoking & parties `PartyPopper`
  - house rules `ScrollText`
  - guests `BedDouble`
  - price `Receipt`
  - amenities `Sparkles`
  - payment `CreditCard`
  - damage `ShieldAlert`
  - refunds `RotateCcw`
  - host `UserRound`
  - no answer `SearchX`
- **New variant:** `IconButton` `primary-sm`, added to `/design-system` along with an AnswerCard sample.

## Steps

### 1. Topics and answers (pure)
- Write `src/ask/topics.ts`, which holds the topic list: key, chip label, question, icon and keyword patterns.
- Write `src/ask/match-topics.ts`:
  - `matchTopics(text)` returns topic keys.
  - `amenitiesIn(text)` returns the amenity keys a question names.
- Write `src/ask/answers.ts`: `answerFor(topic, stay, policies, text)` returns `{ title, icon, rules?, paragraphs?, source }`. Every string comes from a field or a policy body.
- **Done when** a node check of 12 realistic questions gives the expected topics, including:
  - "can I bring my dog?" → pets
  - "what time can we get in" → check-in
  - "is there a hot tub and parking" → amenities (hot tub, parking)
  - "refund if I cancel" → cancellation + refunds
  - "pets and check-in" → pets + check-in
  - "what's the weather like" → none
- Also run the word-for-word check: every paragraph on a policy card is a substring of its Sanity `body`.

### 2. Components
- Add `AnswerCard` and the `IconButton` `primary-sm` variant.
- Export `Paragraphs` and `Rule` from `policy-text.tsx`.
- Add gallery entries.
- **Done when** `/design-system` shows them.

### 3. Chat screen
- `src/app/stay/[slug]/ask.tsx`, registered in the stay `_layout.tsx` as a normal screen.
- Point the "Ask about policies" card to it.
- Wire chips, typed send, the keyboard, auto-scroll, the "Checking…" delay and `stay_question_asked` (`src/config/stay-analytics.ts`).
- **Done when** a chip and a typed question each produce the right cards for 2 stays.

## Verification
- `npx expo lint` and `npx tsc --noEmit` pass.
- The node topic check and word-for-word check from step 1.
- Simulator screenshots (with temporary code to open the screen and send 3 questions, since the simulator can't be tapped; the user said the phone may follow):
  - The intro state.
  - A chip answer (Cancellation).
  - A multi-topic answer ("pets and check-in").
  - A no-answer card.
  - The same pets question on Aspen Grove A-Frame (pets not allowed).
- PostHog: `stay_question_asked` arrives with `source`, `topics` and `answered` true and false, and no text.
- The keyboard, typing, chip taps and "See all policies" can't be tapped in the simulator, so they're checked by code and listed as not tapped.

## AGENTS.md updates
- **Expo → Navigation:** add `ask` to the stay Stack; "Ask about policies" opens it.
- **Who owns what → Policy knowledge / Typed decisions:** until Jev and Context are wired, `src/ask/match-topics.ts` picks topics locally and `src/ask/answers.ts` builds cards only from the stay's fields and policy bodies, word for word. Replace both when the backend lands.
- **Analytics:** `stay_question_asked` (`stay_id`, `source`, `topics`, `topic_count`, `answered`; never text).

## Result
Built as planned. "Ask about policies" on a stay opens `/stay/[slug]/ask`. Replies are answer cards built from the stay's real data, and PostHog records each question.

- **Topic check:** all 12 questions matched as expected.
  - "can I bring my dog?" → pets
  - "what time can we get in" → check-in
  - "is there a hot tub and parking" → amenities
  - "refund if I cancel" → cancellation + refunds
  - "pets and check-in" → check-in + pets
  - "what's the weather like" → none
  - The other 6 also matched.
  - Each of the 10 chip questions matches exactly its own topic.
- **Word for word:** 38 card paragraphs across 2 stays are all substrings of their Sanity text (0 mismatches).
- **Simulator screenshots:**
  - The intro.
  - The Cancellation chip.
  - "pets and check-in" (2 cards).
  - The no-answer card.
  - Aspen Grove: pets "Not allowed", and the amenities card (Hot Tub and Parking "Yes").
- **Fixed after the screenshots:** the status bar stayed light from the details screen, so the screen now sets `StatusBar style="dark"`.
- **PostHog:** one `stay_question_asked` per question, with `source` chip/typed, `topics`, `topic_count` and `answered` (true, and false for the weather question). No question text is sent.
- **Not tapped** (the simulator can't be tapped): the keyboard and typing, chip taps by hand, send, "See all policies", and back. These were checked by code only.
- **Cleanup during testing:** a temporary-code edit briefly put a syntax error on screen, and on the user's iPhone through the shared Metro. It was fixed within a minute, and all temporary code is removed.
