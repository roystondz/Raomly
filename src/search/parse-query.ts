import type { Amenity, StayType } from "@/data/stays";

// Local stand-in for the search API: code parses the exact constraints, the
// rest of the sentence is soft intent that only ranks.
export type ParsedQuery = {
  maxPrice?: number;
  guests?: number;
  pets: boolean;
  type?: StayType;
  amenities: Amenity[];
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

const AMENITY_WORDS: [RegExp, Amenity][] = [
  [/\b(hot[\s-]?tubs?|jacuzzi|spa)\b/, "hot-tub"],
  [/\bpools?\b/, "pool"],
  [/\b(wifi|wi-fi|internet)\b/, "wifi"],
  [/\b(fireplaces?|wood stove)\b/, "fireplace"],
  [/\bkitchen\b/, "kitchen"],
  [/\bparking\b/, "parking"],
  [/\b(beach access|on the beach|beachfront)\b/, "beach-access"],
  [/\b(workspace|desk|work from|remote work)\b/, "workspace"],
];

const STOP_WORDS = new Set(
  "a an and the with for in on at to of or near by under below less than max up no more than night nights per stay place somewhere something that has have who is are i we me us my our want looking need some friendly".split(
    " ",
  ),
);

export function parseQuery(input: string): ParsedQuery {
  let rest = input.toLowerCase();
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

  return { maxPrice, guests, pets, type, amenities, softTerms };
}
