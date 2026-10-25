import type { Amenity, StayType } from "@/search/types";

// Cities in the data. Search only treats a place in the query as a city when it's one of these.
export const CITIES_QUERY = /* groq */ `array::unique(*[_type == "property" && defined(location.city)].location.city)`;

// Every published stay for Home, featured first. 30 stays today, so the
// category chips filter these in memory.
export const HOME_STAYS_QUERY = /* groq */ `*[_type == "property" && defined(slug.current) && defined(photos[0].asset)]
  | order(featured desc, rating desc, title asc){
    "id": _id,
    "slug": slug.current,
    title,
    "type": propertyType,
    "location": location.city + ", " + location.region,
    rating,
    featured,
    "imageUrl": photos[0].asset->url,
    "imageAlt": photos[0].alt
  }`;

export type HomeStay = {
  id: string;
  slug: string;
  title: string;
  type: StayType;
  location: string;
  rating: number;
  featured: boolean;
  imageUrl: string;
  imageAlt: string;
};

// One stay for the details screen, plus Roamly's policies that apply to every
// stay (the stay's own cancellation policy comes through its reference). Beds
// are counted from rooms, never stored. Policy bodies are shown word for word.
export const STAY_QUERY = /* groq */ `{
  "stay": *[_type == "property" && slug.current == $slug && defined(photos[0].asset)][0]{
    "id": _id,
    title,
    "slug": slug.current,
    "type": propertyType,
    "location": location.city + ", " + location.region,
    rating,
    "reviewCount": coalesce(reviewCount, 0),
    pricePerNight,
    "cleaningFee": coalesce(cleaningFee, 0),
    "minNights": coalesce(minNights, 1),
    maxGuests,
    bedrooms,
    bathrooms,
    "beds": math::sum(rooms[].beds[].count),
    "amenities": coalesce(amenities, []),
    "photos": photos[defined(asset)]{ "url": asset->url, alt },
    houseRules{
      petsAllowed,
      smokingAllowed,
      partiesAllowed,
      quietHours,
      checkInTime,
      checkOutTime,
      checkInMethod,
      "additionalRules": coalesce(additionalRules, [])
    },
    "host": host->{
      name,
      bio,
      hostingSince,
      responseTime,
      "languages": coalesce(languages, []),
      "photoUrl": photo.asset->url,
      "photoAlt": photo.alt
    },
    "cancellation": cancellationPolicy->{ "id": _id, title, summary, body }
  },
  "policies": *[_type == "policy" && category != "cancellation"] | order(title asc){ "id": _id, title, category, body }
}`;

// category is set on the shared policies (booking-payment, damage, guest-conduct, rebooking).
export type Policy = { id: string; title: string; body: string; category?: string };

export type StayDetails = {
  id: string;
  title: string;
  slug: string;
  type: StayType;
  location: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  cleaningFee: number;
  minNights: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  amenities: Amenity[];
  photos: { url: string; alt: string }[];
  houseRules: {
    petsAllowed: boolean;
    smokingAllowed: boolean;
    partiesAllowed: boolean;
    quietHours?: { start?: string; end?: string } | null;
    checkInTime: string;
    checkOutTime: string;
    checkInMethod: string;
    additionalRules: string[];
  };
  host: {
    name: string;
    bio?: string | null;
    hostingSince: string;
    responseTime?: string | null;
    languages: string[];
    photoUrl?: string | null;
    photoAlt?: string | null;
  };
  cancellation: Policy & { summary: string };
};

export type StayQueryResult = { stay: StayDetails | null; policies: Policy[] };

// Every Roamly policy for the Profile policies sheet: cancellation policies first,
// then the ones that apply to every stay. Bodies are shown word for word.
export const ALL_POLICIES_QUERY = /* groq */ `*[_type == "policy"]
  | order(category != "cancellation", title asc){ "id": _id, title, category, body }`;
