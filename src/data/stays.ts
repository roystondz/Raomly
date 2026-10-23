import {
  Car,
  Flame,
  Laptop,
  PawPrint,
  Umbrella,
  UtensilsCrossed,
  Waves,
  Wifi,
  type LucideIcon,
} from "lucide-react-native";

// Local sample stays until properties come from Sanity. Photos are remote placeholders.

export type StayType = "cabin" | "beach" | "city" | "villa";

export type Amenity =
  | "hot-tub"
  | "pool"
  | "wifi"
  | "fireplace"
  | "kitchen"
  | "parking"
  | "beach-access"
  | "workspace";

export type Stay = {
  id: string;
  title: string;
  type: StayType;
  location: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  maxGuests: number;
  petsAllowed: boolean;
  amenities: Amenity[];
  // Soft words used for ranking only (never for filtering).
  vibes: string[];
  description: string;
  featured: boolean;
};

export const amenityMeta: Record<Amenity, { label: string; icon: LucideIcon }> = {
  "hot-tub": { label: "Hot tub", icon: Waves },
  pool: { label: "Pool", icon: Waves },
  wifi: { label: "Wifi", icon: Wifi },
  fireplace: { label: "Fireplace", icon: Flame },
  kitchen: { label: "Kitchen", icon: UtensilsCrossed },
  parking: { label: "Parking", icon: Car },
  "beach-access": { label: "Beach access", icon: Umbrella },
  workspace: { label: "Workspace", icon: Laptop },
};

export const petIcon = PawPrint;

const photo = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=70`;

export const stays: Stay[] = [
  {
    id: "lake-arrowhead-cabin",
    title: "Modern Cabin with Hot Tub",
    type: "cabin",
    location: "Lake Arrowhead, CA",
    imageUrl: photo("1449158743715-0a90ebb6d2d8"),
    rating: 4.9,
    reviewCount: 214,
    pricePerNight: 265,
    maxGuests: 6,
    petsAllowed: true,
    amenities: ["hot-tub", "fireplace", "wifi", "kitchen", "parking"],
    vibes: ["quiet", "cozy", "modern", "secluded", "forest", "views", "romantic"],
    description: "Glass-walled A-frame tucked into the pines, with a cedar hot tub and fire pit on the deck.",
    featured: true,
  },
  {
    id: "big-bear-lodge",
    title: "Pine Ridge Lodge",
    type: "cabin",
    location: "Big Bear Lake, CA",
    imageUrl: photo("1542718610-a1d656d1884c"),
    rating: 4.8,
    reviewCount: 168,
    pricePerNight: 289,
    maxGuests: 8,
    petsAllowed: true,
    amenities: ["hot-tub", "fireplace", "wifi", "kitchen", "parking"],
    vibes: ["cozy", "rustic", "family", "snow", "views"],
    description: "Roomy log lodge a short drive from the slopes, with a stone fireplace and a hot tub under the stars.",
    featured: true,
  },
  {
    id: "idyllwild-hideaway",
    title: "Creekside Hideaway",
    type: "cabin",
    location: "Idyllwild, CA",
    imageUrl: photo("1510798831971-661eb04b3739"),
    rating: 4.7,
    reviewCount: 92,
    pricePerNight: 195,
    maxGuests: 4,
    petsAllowed: true,
    amenities: ["hot-tub", "fireplace", "kitchen", "parking"],
    vibes: ["quiet", "secluded", "peaceful", "cozy", "creek", "nature"],
    description: "Off-grid feel on a quiet creek, with a wood stove, hammock, and a two-person hot tub.",
    featured: false,
  },
  {
    id: "tahoe-chalet",
    title: "Lakeview Chalet",
    type: "cabin",
    location: "South Lake Tahoe, CA",
    imageUrl: photo("1518780664697-55e3ad937233"),
    rating: 4.9,
    reviewCount: 301,
    pricePerNight: 420,
    maxGuests: 10,
    petsAllowed: false,
    amenities: ["hot-tub", "fireplace", "wifi", "kitchen", "parking", "workspace"],
    vibes: ["luxury", "views", "modern", "lake", "family"],
    description: "Three-level chalet with panoramic lake views, a game room, and a large hot tub.",
    featured: false,
  },
  {
    id: "malibu-beach-house",
    title: "Oceanfront Beach House",
    type: "beach",
    location: "Malibu, CA",
    imageUrl: photo("1499793983690-e29da59ef1c2"),
    rating: 4.8,
    reviewCount: 187,
    pricePerNight: 545,
    maxGuests: 6,
    petsAllowed: false,
    amenities: ["beach-access", "wifi", "kitchen", "parking"],
    vibes: ["views", "sunset", "bright", "modern", "romantic"],
    description: "Steps from the sand with a wraparound deck made for sunset dinners.",
    featured: true,
  },
  {
    id: "santa-cruz-bungalow",
    title: "Surfside Bungalow",
    type: "beach",
    location: "Santa Cruz, CA",
    imageUrl: photo("1520250497591-112f2f40a3f4"),
    rating: 4.6,
    reviewCount: 76,
    pricePerNight: 230,
    maxGuests: 4,
    petsAllowed: true,
    amenities: ["beach-access", "wifi", "kitchen", "hot-tub"],
    vibes: ["laid-back", "cozy", "surf", "bright"],
    description: "Breezy two-bedroom bungalow a block from the surf, with an outdoor shower and hot tub.",
    featured: false,
  },
  {
    id: "san-diego-retreat",
    title: "Coastal Family Retreat",
    type: "beach",
    location: "Carlsbad, CA",
    imageUrl: photo("1512917774080-9991f1c4c750"),
    rating: 4.7,
    reviewCount: 133,
    pricePerNight: 380,
    maxGuests: 8,
    petsAllowed: true,
    amenities: ["pool", "beach-access", "wifi", "kitchen", "parking"],
    vibes: ["family", "spacious", "sunny", "bright"],
    description: "Spacious home with a heated pool, a short walk to the beach and village shops.",
    featured: false,
  },
  {
    id: "sf-loft",
    title: "Sunlit Mission Loft",
    type: "city",
    location: "San Francisco, CA",
    imageUrl: photo("1502672260266-1c1ef2d93688"),
    rating: 4.8,
    reviewCount: 245,
    pricePerNight: 210,
    maxGuests: 2,
    petsAllowed: false,
    amenities: ["wifi", "workspace", "kitchen"],
    vibes: ["modern", "bright", "walkable", "stylish"],
    description: "Airy loft with tall windows and a proper desk, close to cafés and BART.",
    featured: true,
  },
  {
    id: "la-studio",
    title: "Silver Lake Studio",
    type: "city",
    location: "Los Angeles, CA",
    imageUrl: photo("1522708323590-d24dbb6b0267"),
    rating: 4.5,
    reviewCount: 88,
    pricePerNight: 145,
    maxGuests: 2,
    petsAllowed: true,
    amenities: ["wifi", "workspace", "kitchen", "parking"],
    vibes: ["quiet", "cozy", "stylish", "walkable"],
    description: "Quiet garden studio on a leafy street, with a workspace and off-street parking.",
    featured: false,
  },
  {
    id: "palm-springs-villa",
    title: "Desert Modern Villa",
    type: "villa",
    location: "Palm Springs, CA",
    imageUrl: photo("1613490493576-7fde63acd811"),
    rating: 4.9,
    reviewCount: 156,
    pricePerNight: 650,
    maxGuests: 10,
    petsAllowed: false,
    amenities: ["pool", "hot-tub", "wifi", "kitchen", "parking"],
    vibes: ["luxury", "modern", "sunny", "secluded", "views"],
    description: "Mid-century villa with a saltwater pool, spa, and mountain views.",
    featured: true,
  },
  {
    id: "napa-villa",
    title: "Vineyard Villa",
    type: "villa",
    location: "Napa, CA",
    imageUrl: photo("1564013799919-ab600027ffc6"),
    rating: 4.8,
    reviewCount: 97,
    pricePerNight: 495,
    maxGuests: 8,
    petsAllowed: true,
    amenities: ["pool", "fireplace", "wifi", "kitchen", "parking"],
    vibes: ["quiet", "romantic", "luxury", "views", "peaceful"],
    description: "Stone villa among the vines with a pool, outdoor fireplace, and long valley views.",
    featured: false,
  },
];
