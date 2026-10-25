import type { QueryParams } from "@/sanity/fetch";

import type { ParsedQuery } from "./parse-query";
import type { Amenity, StayType } from "./types";

export type SearchStay = {
  id: string;
  slug: string;
  title: string;
  type: StayType;
  location: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  petsAllowed: boolean;
  amenities: Amenity[];
  imageUrl: string;
  imageAlt: string;
};

const PROJECTION = `{
  "id": _id,
  "slug": slug.current,
  title,
  "type": propertyType,
  "location": location.city + ", " + location.region,
  rating,
  "reviewCount": coalesce(reviewCount, 0),
  pricePerNight,
  "petsAllowed": coalesce(houseRules.petsAllowed, false),
  "amenities": coalesce(amenities, []),
  "imageUrl": photos[0].asset->url,
  "imageAlt": photos[0].alt
}`;

// Exact constraints become GROQ filters, values always as $params. Soft terms
// only rank, through the dataset embeddings; they never remove a stay.
export function buildSearchQuery(parsed: ParsedQuery): { query: string; params: QueryParams } {
  const filters = ['_type == "property"', "defined(slug.current)", "defined(photos[0].asset)"];
  const params: QueryParams = {};

  if (parsed.type) {
    filters.push("propertyType == $type");
    params.type = parsed.type;
  }
  if (parsed.maxPrice !== undefined) {
    filters.push("pricePerNight <= $maxPrice");
    params.maxPrice = parsed.maxPrice;
  }
  if (parsed.guests !== undefined) {
    filters.push("maxGuests >= $guests");
    params.guests = parsed.guests;
  }
  if (parsed.pets) filters.push("houseRules.petsAllowed == true");
  if (parsed.amenities.length > 0) {
    filters.push("count(amenities[@ in $amenities]) == count($amenities)");
    params.amenities = parsed.amenities;
  }
  if (parsed.region) {
    filters.push("location.region == $region");
    params.region = parsed.region;
  }
  if (parsed.country) {
    filters.push("location.country == $country");
    params.country = parsed.country;
  }
  if (parsed.city) {
    filters.push("lower(location.city) == $city");
    params.city = parsed.city.toLowerCase();
  }

  let order = "order(rating desc, title asc)";
  if (parsed.softTerms.length > 0) {
    order = "score(text::semanticSimilarity($soft)) | order(_score desc, rating desc)";
    params.soft = parsed.softTerms.join(" ");
  }

  return { query: `*[${filters.join(" && ")}] | ${order} ${PROJECTION}`, params };
}
