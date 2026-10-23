import { amenityMeta, type Stay } from "@/data/stays";

import { parseQuery, type ParsedQuery } from "./parse-query";

export type SearchResult = {
  query: ParsedQuery;
  stays: Stay[];
  // Human labels for the exact constraints, in the order they were applied.
  constraints: string[];
};

const TYPE_LABELS = { cabin: "Cabin", beach: "Beach", city: "City", villa: "Villa" } as const;

// Exact constraints filter; soft terms only rank (vibes count double over description words).
export function searchStays(input: string, all: Stay[]): SearchResult {
  const query = parseQuery(input);

  const stays = all
    .filter(
      (stay) =>
        (query.maxPrice === undefined || stay.pricePerNight <= query.maxPrice) &&
        (query.guests === undefined || stay.maxGuests >= query.guests) &&
        (!query.pets || stay.petsAllowed) &&
        (query.type === undefined || stay.type === query.type) &&
        query.amenities.every((amenity) => stay.amenities.includes(amenity)),
    )
    .map((stay) => ({ stay, score: softScore(stay, query.softTerms) }))
    .sort((a, b) => b.score - a.score || b.stay.rating - a.stay.rating)
    .map(({ stay }) => stay);

  return { query, stays, constraints: constraintLabels(query) };
}

function softScore(stay: Stay, terms: string[]) {
  const text = `${stay.title} ${stay.description} ${stay.location}`.toLowerCase();
  return terms.reduce((score, term) => {
    if (stay.vibes.includes(term)) return score + 2;
    return text.includes(term) ? score + 1 : score;
  }, 0);
}

export function constraintLabels(query: ParsedQuery) {
  const labels: string[] = [];
  if (query.type) labels.push(TYPE_LABELS[query.type]);
  if (query.maxPrice !== undefined) labels.push(`Under $${query.maxPrice}`);
  if (query.guests !== undefined) labels.push(`${query.guests}+ guests`);
  if (query.pets) labels.push("Pets");
  for (const amenity of query.amenities) labels.push(amenityMeta[amenity].label);
  return labels;
}
