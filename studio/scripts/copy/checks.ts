import {toFacts, type StayRow} from './facts'

export type Copy = {summary: string; description: string; highlights: string[]}

// Words that name an amenity. Mentioning one the stay doesn't have is an invention.
const AMENITY_WORDS: Record<string, RegExp> = {
  'hot-tub': /\b(hot ?tubs?|spa|jacuzzi)\b/i,
  pool: /\bpools?\b/i,
  wifi: /\b(wi-?fi|internet)\b/i,
  fireplace: /\b(fireplaces?|wood ?stoves?|fire)\b/i,
  kitchen: /\bkitchens?\b/i,
  parking: /\b(parking|garage|driveway)\b/i,
  'beach-access': /\b(beach access|beachfront|on the beach|to the beach|the sand)\b/i,
  workspace: /\b(workspace|desk|office|remote work)\b/i,
  'air-conditioning': /\b(air[- ]?condition\w*|a\/?c)\b/i,
  washer: /\b(washers?|laundry|dryer)\b/i,
  'ev-charger': /\b(ev|electric vehicles?|charger|charging)\b/i,
  'bbq-grill': /\b(bbq|barbecue|grill)\b/i,
}

// Features no typed field records, so copy can never claim them.
const UNRECORDED =
  /\b(views?|vistas?|decks?|patios?|porch(es)?|balcon(y|ies)|terraces?|gardens?|yards?|lawns?|hammocks?|fire ?pit|rooftop|gym|sauna|lake|ocean|sea|river|creek|mountains?|forest|woods|pines?|trees|meadow|cove|bluff|canyon|desert|vineyards?|trails?|walk(ing)? distance|minutes? (from|to|away)|nearby|steps from|close to|downtown|secluded|private road|no neighbou?rs)\b/i

const MONEY_OR_RATING =
  /\$|\b(price|per night|nightly|rated|rating|reviews?|stars?|superhost|host)\b/i

const NUMBER_WORDS: Record<string, number> = {
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  twenty: 20,
}

const STATE_NAMES: Record<string, string> = {
  CA: 'California',
  OR: 'Oregon',
  WA: 'Washington',
  CO: 'Colorado',
  AZ: 'Arizona',
  UT: 'Utah',
  NY: 'New York',
  TX: 'Texas',
  TN: 'Tennessee',
  FL: 'Florida',
}

// Capitalized words that are fine anywhere in copy.
const COMMON_CAPS = new Set([
  'I',
  'Wi-Fi',
  'Wifi',
  'EV',
  'BBQ',
  'AC',
  'King',
  'Queen',
  'Bedroom',
  'Loft',
])

function allowedNumbers(stay: StayRow) {
  const numbers = new Set<number>([
    stay.maxGuests,
    stay.bedrooms,
    stay.bathrooms,
    stay.rooms.length,
  ])
  numbers.add(
    stay.rooms.reduce((sum, room) => sum + room.beds.reduce((n, bed) => n + bed.count, 0), 0),
  )
  for (const room of stay.rooms) {
    for (const bed of room.beds) numbers.add(bed.count)
    for (const n of room.name.match(/\d+/g) ?? []) numbers.add(Number(n))
  }
  const rules = stay.houseRules
  for (const time of [
    rules.checkInTime,
    rules.checkOutTime,
    rules.quietHours?.start,
    rules.quietHours?.end,
  ]) {
    if (!time) continue
    const [hours, minutes] = time.split(':').map(Number)
    numbers
      .add(hours)
      .add(hours % 12 || 12)
      .add(minutes)
  }
  for (const rule of rules.additionalRules ?? []) {
    for (const n of rule.match(/\d+(\.\d+)?/g) ?? []) numbers.add(Number(n))
  }
  return numbers
}

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const textOf = (copy: Copy) => [copy.summary, copy.description, ...copy.highlights].join('\n')

// Deterministic checks. Returns the reasons the copy fails; empty means it passes.
export function codeCheck(stay: StayRow, copy: Copy): string[] {
  const problems: string[] = []
  const text = textOf(copy)
  // House rules are the host's own words, so anything they mention is allowed.
  const rulesText = (stay.houseRules.additionalRules ?? []).join(' ')

  if (!copy.summary || copy.summary.length > 160)
    problems.push(`summary is ${copy.summary?.length ?? 0} chars (max 160)`)
  const words = copy.description?.trim().split(/\s+/).length ?? 0
  if (words < 40 || words > 200) problems.push(`description is ${words} words (40–200)`)
  if (!Array.isArray(copy.highlights) || copy.highlights.length < 3 || copy.highlights.length > 6) {
    problems.push(`${copy.highlights?.length ?? 0} highlights (3–6)`)
  }

  // Fact phrases may contain feature words: the name and city ("Lakeview
  // Chalet", "Big Bear Lake") and the check-in method ("Front desk", "Host
  // greets you"). Remove them before scanning; the same words anywhere else
  // are still claims.
  const facts = toFacts(stay)
  const factPhrases = [stay.title, stay.city, facts.houseRules.checkInMethod]
  const features = factPhrases.reduce(
    (rest, phrase) => rest.replace(new RegExp(escape(phrase), 'gi'), ' '),
    text,
  )

  const money = features.match(MONEY_OR_RATING)
  if (money && !new RegExp(`\\b${money[0]}\\b`, 'i').test(rulesText)) {
    problems.push(`mentions "${money[0]}" (price, rating or host are not copy facts)`)
  }

  for (const [amenity, pattern] of Object.entries(AMENITY_WORDS)) {
    const hit = features.match(pattern)
    if (hit && !stay.amenities.includes(amenity) && !pattern.test(rulesText)) {
      problems.push(`mentions "${hit[0]}" but the stay has no ${amenity}`)
    }
  }

  for (const match of features.matchAll(new RegExp(UNRECORDED, 'gi'))) {
    if (!new RegExp(`\\b${match[0]}\\b`, 'i').test(rulesText)) {
      problems.push(`claims "${match[0]}", which no field records`)
    }
  }

  const allowed = allowedNumbers(stay)
  for (const match of text.matchAll(/\b\d+(\.\d+)?\b/g)) {
    if (!allowed.has(Number(match[0]))) problems.push(`number ${match[0]} isn't a fact`)
  }
  for (const match of text.matchAll(
    /\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|twenty)\b/gi,
  )) {
    if (!allowed.has(NUMBER_WORDS[match[0].toLowerCase()]))
      problems.push(`"${match[0]}" isn't a fact`)
  }

  const mentionsPets = /\b(pets?|dogs?|cats?)\b/i.test(text)
  const saysNoPets =
    /\b(no pets|pet-free|not pet[- ]friendly|pets? (are |is )?(not|aren't|isn't) (allowed|permitted|welcome))\b/i.test(
      text,
    )
  if (mentionsPets && (saysNoPets ? stay.houseRules.petsAllowed : !stay.houseRules.petsAllowed)) {
    problems.push('pet wording contradicts the house rules')
  }

  // Proper nouns must come from the stay's name or location. Title-cased
  // ordinary words ("4 Bedrooms") are fine when the facts use them.
  const factWords = new Set(
    JSON.stringify(facts)
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .split(/[^a-z'-]+/)
      .filter(Boolean),
  )
  const known = new Set(
    [
      stay.title,
      stay.city,
      stay.region,
      STATE_NAMES[stay.region] ?? '',
      rulesText,
      ...stay.rooms.map((r) => r.name),
    ]
      .join(' ')
      .split(/[^A-Za-z'-]+/)
      .filter(Boolean),
  )
  for (const sentence of text.split(/(?<=[.!?:;\n])\s*/)) {
    const words = sentence.split(/\s+/).slice(1) // the first word of a sentence is capitalized anyway
    for (const word of words) {
      const clean = word.replace(/[^A-Za-z'-]/g, '')
      const ordinary =
        factWords.has(clean.toLowerCase()) || factWords.has(clean.toLowerCase().replace(/s$/, ''))
      if (/^[A-Z]/.test(clean) && !known.has(clean) && !COMMON_CAPS.has(clean) && !ordinary) {
        problems.push(`unknown name "${clean}"`)
      }
    }
  }

  return [...new Set(problems)]
}
