import type { StayDetails } from "@/sanity/queries";
import { amenityMeta, petsMeta } from "@/search/amenities";

// Labels match studio/schemaTypes/constants.ts.
const CHECK_IN_METHODS: Record<string, string> = {
  keypad: "Keypad",
  lockbox: "Lockbox",
  "smart-lock": "Smart lock",
  "host-greets": "Host greets you",
  "front-desk": "Front desk",
};

const RESPONSE_TIMES: Record<string, string> = {
  "within-an-hour": "Replies within an hour",
  "within-a-few-hours": "Replies within a few hours",
  "within-a-day": "Replies within a day",
};

// "16:00" → "4:00 PM". Stored times are always 24-hour "HH:mm".
export function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export const checkInMethodLabel = (method: string) => CHECK_IN_METHODS[method] ?? method;
export const responseTimeLabel = (value?: string | null) => (value ? RESPONSE_TIMES[value] : undefined);

// No dates yet, so the total is for the stay's minimum nights, from its own fields.
export function minimumStayTotal(stay: Pick<StayDetails, "pricePerNight" | "minNights" | "cleaningFee">) {
  const total = stay.pricePerNight * stay.minNights + stay.cleaningFee;
  // Short enough that "Book this stay" stays on one line beside it.
  return `$${total.toLocaleString("en-US")} for ${stay.minNights} ${stay.minNights === 1 ? "night" : "nights"}`;
}

export function yearsHosting(hostingSince: string, now = new Date()) {
  const since = new Date(hostingSince);
  let years = now.getFullYear() - since.getFullYear();
  if (now < new Date(now.getFullYear(), since.getMonth(), since.getDate())) years -= 1;
  return Math.max(years, 0);
}

// "Hosting since 2017 · Replies within an hour" (response time only when set).
export function hostFacts(host: Pick<StayDetails["host"], "hostingSince" | "responseTime">) {
  return [`Hosting since ${host.hostingSince.slice(0, 4)}`, responseTimeLabel(host.responseTime)]
    .filter(Boolean)
    .join(" · ");
}

// Up to 4 highlights under the title: amenities in data order, with
// "Pet Friendly" second when pets are allowed.
export function amenityRow(stay: Pick<StayDetails, "amenities" | "houseRules">, max = 4) {
  const items = stay.amenities.map((key) => amenityMeta[key]).filter(Boolean);
  if (stay.houseRules.petsAllowed) items.splice(Math.min(1, items.length), 0, petsMeta);
  return items.slice(0, max);
}

export const firstName = (name: string) => name.split(" ")[0];
