import {
  AirVent,
  Bath,
  Beef,
  Car,
  Flame,
  Laptop,
  PawPrint,
  PlugZap,
  Umbrella,
  UtensilsCrossed,
  WashingMachine,
  Waves,
  Wifi,
  type LucideIcon,
} from "lucide-react-native";

import type { Amenity } from "./types";

// Labels are Title Case, as the search design shows them on chips and card pills.
export const amenityMeta: Record<Amenity, { label: string; icon: LucideIcon }> = {
  "hot-tub": { label: "Hot Tub", icon: Bath },
  pool: { label: "Pool", icon: Waves },
  wifi: { label: "Wifi", icon: Wifi },
  fireplace: { label: "Fireplace", icon: Flame },
  kitchen: { label: "Kitchen", icon: UtensilsCrossed },
  parking: { label: "Parking", icon: Car },
  "beach-access": { label: "Beach Access", icon: Umbrella },
  workspace: { label: "Workspace", icon: Laptop },
  "air-conditioning": { label: "Air Conditioning", icon: AirVent },
  washer: { label: "Washer", icon: WashingMachine },
  "ev-charger": { label: "EV Charger", icon: PlugZap },
  "bbq-grill": { label: "BBQ Grill", icon: Beef },
};

export const petsMeta = { label: "Pet Friendly", icon: PawPrint };
