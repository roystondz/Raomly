import { amenityMeta, petsMeta } from "./amenities";
import type { ParsedQuery } from "./parse-query";
import { STATE_NAMES } from "./places";
import type { Amenity, StayType } from "./types";

export type FilterChip =
  | { key: string; label: string; kind: "type"; value: StayType }
  | { key: string; label: string; kind: "region" | "city" | "country"; value: string }
  | { key: string; label: string; kind: "price" | "guests"; value: number }
  | { key: string; label: string; kind: "pets" }
  | { key: string; label: string; kind: "amenity"; value: Amenity }
  | { key: string; label: string; kind: "soft"; value: string };

const TYPE_LABELS: Record<StayType, string> = { cabin: "Cabins", beach: "Beach", city: "City", villa: "Villas" };

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

// Shown unselected when the query didn't already ask for them; they reproduce the design.
const SUGGESTIONS: FilterChip[] = [
  { key: "price", label: "Under $300", kind: "price", value: 300 },
  { key: "pets", label: petsMeta.label, kind: "pets" },
  { key: "amenity:hot-tub", label: amenityMeta["hot-tub"].label, kind: "amenity", value: "hot-tub" },
  { key: "soft:quiet", label: "Quiet", kind: "soft", value: "quiet" },
];

// One chip per constraint the query was parsed into, then up to 4 suggestions.
// The set is fixed per submitted query, so a chip toggled off stays to toggle back on.
export function chipsFor(parsed: ParsedQuery): FilterChip[] {
  const chips: FilterChip[] = [];
  if (parsed.type) chips.push({ key: "type", label: TYPE_LABELS[parsed.type], kind: "type", value: parsed.type });
  if (parsed.city) chips.push({ key: "city", label: parsed.city, kind: "city", value: parsed.city });
  if (parsed.region) {
    chips.push({ key: "region", label: STATE_NAMES[parsed.region] ?? parsed.region, kind: "region", value: parsed.region });
  }
  if (parsed.country) {
    chips.push({ key: "country", label: parsed.place ?? parsed.country, kind: "country", value: parsed.country });
  }
  if (parsed.maxPrice !== undefined) {
    chips.push({ key: "price", label: `Under $${parsed.maxPrice}`, kind: "price", value: parsed.maxPrice });
  }
  if (parsed.guests !== undefined) {
    chips.push({ key: "guests", label: `${parsed.guests}+ Guests`, kind: "guests", value: parsed.guests });
  }
  if (parsed.pets) chips.push({ key: "pets", label: petsMeta.label, kind: "pets" });
  for (const amenity of parsed.amenities) {
    chips.push({ key: `amenity:${amenity}`, label: amenityMeta[amenity].label, kind: "amenity", value: amenity });
  }
  for (const term of parsed.softTerms) {
    chips.push({ key: `soft:${term}`, label: capitalize(term), kind: "soft", value: term });
  }
  const taken = new Set(chips.map((chip) => chip.key));
  return [...chips, ...SUGGESTIONS.filter((chip) => !taken.has(chip.key))];
}

export function isChipSelected(query: ParsedQuery, chip: FilterChip): boolean {
  switch (chip.kind) {
    case "type":
      return query.type === chip.value;
    case "city":
      return query.city === chip.value;
    case "region":
      return query.region === chip.value;
    case "country":
      return query.country === chip.value;
    case "price":
      return query.maxPrice === chip.value;
    case "guests":
      return query.guests === chip.value;
    case "pets":
      return query.pets;
    case "amenity":
      return query.amenities.includes(chip.value);
    case "soft":
      return query.softTerms.includes(chip.value);
  }
}

export function toggleChip(query: ParsedQuery, chip: FilterChip): ParsedQuery {
  const on = !isChipSelected(query, chip);
  switch (chip.kind) {
    case "type":
      return { ...query, type: on ? chip.value : undefined };
    case "city":
      return { ...query, city: on ? chip.value : undefined };
    case "region":
      return { ...query, region: on ? chip.value : undefined };
    case "country":
      return { ...query, country: on ? chip.value : undefined };
    case "price":
      return { ...query, maxPrice: on ? chip.value : undefined };
    case "guests":
      return { ...query, guests: on ? chip.value : undefined };
    case "pets":
      return { ...query, pets: on };
    case "amenity":
      return {
        ...query,
        amenities: on ? [...query.amenities, chip.value] : query.amenities.filter((a) => a !== chip.value),
      };
    case "soft":
      return {
        ...query,
        softTerms: on ? [...query.softTerms, chip.value] : query.softTerms.filter((t) => t !== chip.value),
      };
  }
}
