import { STATES, WORLD_PLACES } from "./places";
import type { Amenity, StayType } from "./types";

// Code parses the exact constraints (they become GROQ filters); the rest of the
// sentence is soft intent that only ranks.
export type ParsedQuery = {
  maxPrice?: number;
  guests?: number;
  pets: boolean;
  type?: StayType;
  amenities: Amenity[];
  // State code (location.region), e.g. "CA".
  region?: string;
  // A city from the data, as stored on location.city.
  city?: string;
  // A country (location.country), from a country or a major world city in the
  // query. `place` is what to call it on screen ("Japan", "Paris").
  country?: string;
  place?: string;
  softTerms: string[];
};

const PRICE_PATTERNS = [
  /(?:under|below|less than|max(?:imum)?|up to|no more than|<)\s*\$?\s*(\d[\d,]*)/,
  /\$\s*(\d[\d,]*)\s*(?:or less|max|and under|or under)/,
];

const GUEST_PATTERNS = [
  /(\d+)\s*(?:guests?|people|persons?|adults?|of us)/,
  /\bfor\s+(\d+)\b(?!\s*(?:nights?|days?|weeks?|\$))/,
  /\bsleeps\s+(\d+)/,
];

const PET_PATTERN = /\b(pet[\s-]?friendly|pets?|dogs?|puppy|cats?)\b/;

const TYPE_WORDS: [RegExp, StayType][] = [
  [/\b(cabins?|chalets?|lodges?|a-frame)\b/, "cabin"],
  [/\b(beach|oceanfront|seaside|coastal|surf)\b/, "beach"],
  [/\b(city|downtown|urban|lofts?|apartments?|studios?)\b/, "city"],
  [/\b(villas?|estates?|mansions?)\b/, "villa"],
];

export const AMENITY_WORDS: [RegExp, Amenity][] = [
  [/\b(hot[\s-]?tubs?|jacuzzi|spa)\b/, "hot-tub"],
  [/\bpools?\b/, "pool"],
  [/\b(wifi|wi-fi|internet)\b/, "wifi"],
  [/\b(fireplaces?|wood stove)\b/, "fireplace"],
  [/\bkitchen\b/, "kitchen"],
  [/\bparking\b/, "parking"],
  [/\b(beach access|on the beach|beachfront)\b/, "beach-access"],
  [/\b(workspace|desk|work from|remote work)\b/, "workspace"],
  [/\b(a\/c|ac|air[\s-]?con(?:ditioning)?)\b/, "air-conditioning"],
  [/\b(washer|laundry|washing machine)\b/, "washer"],
  [/\b(ev[\s-]?charg(?:er|ing)|charger)\b/, "ev-charger"],
  [/\b(bbq|barbecue|grill)\b/, "bbq-grill"],
];

const STOP_WORDS = new Set(
  "a an and the with for in on at to of or near by under below less than max up no more than night nights per stay stays place somewhere something that has have who is are i we me us my our want looking need some friendly".split(
    " ",
  ),
);

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// `cities` are the cities in the data: a city only filters when it's one of them,
// so a phrase like "in the woods" never becomes a place.
export function parseQuery(input: string, { cities = [] }: { cities?: string[] } = {}): ParsedQuery {
  let rest = ` ${input.toLowerCase()} `;
  const take = (pattern: RegExp) => {
    const match = rest.match(pattern);
    if (match) rest = rest.replace(match[0], " ");
    return match;
  };

  let maxPrice: number | undefined;
  for (const pattern of PRICE_PATTERNS) {
    const match = take(pattern);
    if (match) {
      maxPrice = Number(match[1].replace(/,/g, ""));
      break;
    }
  }

  let guests: number | undefined;
  for (const pattern of GUEST_PATTERNS) {
    const match = take(pattern);
    if (match) {
      guests = Number(match[1]);
      break;
    }
  }

  // Places before types and amenities, so "Cannon Beach" is a city, not a beach stay.
  // Longest names first, so "South Lake Tahoe" wins over any shorter overlap.
  let city: string | undefined;
  for (const name of [...cities].sort((a, b) => b.length - a.length)) {
    if (take(new RegExp(`\\b(?:in|near)?\\s*${escape(name.toLowerCase())}\\b`))) {
      city = name;
      break;
    }
  }

  let region: string | undefined;
  if (!city) {
    for (const name of Object.keys(STATES).sort((a, b) => b.length - a.length)) {
      if (take(new RegExp(`\\b(?:in|near)?\\s*${name}\\b`))) {
        region = STATES[name];
        break;
      }
    }
  }
  if (!city && !region) {
    // Two-letter codes are too ambiguous on their own ("ok", "me"), so only after in/near.
    const match = rest.match(/\b(?:in|near)\s+([a-z]{2})\b/);
    const code = match?.[1].toUpperCase();
    if (match && code && Object.values(STATES).includes(code)) {
      rest = rest.replace(match[0], " ");
      region = code;
    }
  }

  // Anywhere else in the world: always a filter, so a place with no stays
  // returns nothing instead of every stay ranked by how close it sounds.
  let country: string | undefined;
  let place: string | undefined;
  if (!city && !region) {
    for (const name of Object.keys(WORLD_PLACES).sort((a, b) => b.length - a.length)) {
      if (take(new RegExp(`(?:^|[^a-z.])(?:in\\s+|near\\s+)?${escape(name)}(?![a-z])`))) {
        ({ country, label: place } = WORLD_PLACES[name]);
        break;
      }
    }
  }

  const pets = !!take(PET_PATTERN);

  const amenities: Amenity[] = [];
  for (const [pattern, amenity] of AMENITY_WORDS) {
    if (take(pattern)) amenities.push(amenity);
  }

  let type: StayType | undefined;
  for (const [pattern, stayType] of TYPE_WORDS) {
    if (take(pattern)) {
      type = stayType;
      break;
    }
  }

  const softTerms = rest
    .split(/[^a-z-]+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  return { maxPrice, guests, pets, type, amenities, region, city, country, place, softTerms };
}

// False when only soft terms are left: results are then the closest matches,
// not stays that meet anything the guest asked for exactly.
export function hasExactFilters(query: ParsedQuery) {
  return Boolean(
    query.type ||
      query.maxPrice !== undefined ||
      query.guests !== undefined ||
      query.pets ||
      query.amenities.length > 0 ||
      query.region ||
      query.city ||
      query.country,
  );
}
