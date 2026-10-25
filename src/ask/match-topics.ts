import { AMENITY_WORDS } from "@/search/parse-query";
import type { Amenity } from "@/search/types";

// Local stand-in for Jev's typed decision of which topics answer a question.
// Replace it, don't extend it, when Jev is wired up. Order is the order cards show.
export const TOPIC_KEYS = [
  "cancellation",
  "refunds",
  "check-in",
  "pets",
  "quiet-hours",
  "smoking-parties",
  "house-rules",
  "guests",
  "price",
  "amenities",
  "payment",
  "damage",
  "host",
] as const;

export type TopicKey = (typeof TOPIC_KEYS)[number];

const PATTERNS: Record<Exclude<TopicKey, "amenities">, RegExp> = {
  cancellation: /\b(cancel\w*)\b/,
  refunds: /\b(refund\w*|rebook\w*|money back|not as (described|advertised))\b/,
  "check-in": /\b(check[\s-]?(in|out)|arriv\w*|get in|keys?|lock\w*|leave|depart\w*|what time)\b/,
  pets: /\b(pets?|dogs?|cats?|pupp(y|ies)|animals?)\b/,
  "quiet-hours": /\b(quiet|noise|noisy|loud|music)\b/,
  "smoking-parties": /\b(smok\w*|vap\w*|part(y|ies)|events?|celebrat\w*)\b/,
  "house-rules": /\b(house rules?|rules?)\b/,
  guests: /\b(sleeps?|guests?|people|beds?|bedrooms?|baths?|bathrooms?|how many)\b/,
  price: /\b(price|prices|cost|costs|fees?|cleaning|how much|minimum)\b/,
  payment: /\b(pay|payment|paid|deposit|charged?|card|currency)\b/,
  damage: /\b(damage\w*|broke|broken|break|accident\w*)\b/,
  host: /\b(host|owner)\b/,
};

// Amenities a question names ("is there a hot tub and parking").
export function amenitiesIn(text: string): Amenity[] {
  const lower = text.toLowerCase();
  return AMENITY_WORDS.filter(([pattern]) => pattern.test(lower)).map(([, amenity]) => amenity);
}

export function matchTopics(text: string): TopicKey[] {
  const lower = text.toLowerCase();
  const hasAmenity = amenitiesIn(lower).length > 0;
  return TOPIC_KEYS.filter((key) => (key === "amenities" ? hasAmenity : PATTERNS[key].test(lower)));
}
