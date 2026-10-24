import type { StayType } from "@/data/stays";

// Every published stay for Home, featured first. 30 stays today, so the
// category chips filter these in memory.
export const HOME_STAYS_QUERY = /* groq */ `*[_type == "property" && defined(slug.current) && defined(photos[0].asset)]
  | order(featured desc, rating desc, title asc){
    "id": _id,
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
  title: string;
  type: StayType;
  location: string;
  rating: number;
  featured: boolean;
  imageUrl: string;
  imageAlt: string;
};
