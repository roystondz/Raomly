import type { Policy, StayDetails } from "@/sanity/queries";
import { amenityMeta } from "@/search/amenities";
import { checkInMethodLabel, formatTime, responseTimeLabel } from "@/stay/format";

import { amenitiesIn, type TopicKey } from "./match-topics";

export type Rule = { label: string; value: string };

// One answer card. Nothing here is generated: rules are the stay's typed fields
// as plain facts, paragraphs are policy bodies, house rules or the host bio
// word for word, and source names where they came from.
export type Answer = {
  topic: TopicKey | "none";
  title: string;
  rules?: Rule[];
  paragraphs?: string[];
  source: string;
};

const allowed = (value: boolean) => (value ? "Allowed" : "Not allowed");
const paragraphsOf = (body: string) => body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const policyBy = (policies: Policy[], category: string) => policies.find((p) => p.category === category);

function policyAnswer(topic: TopicKey, title: string, policy: Policy | undefined): Answer | null {
  if (!policy) return null;
  return { topic, title, paragraphs: paragraphsOf(policy.body), source: `${policy.title} · Roamly policy` };
}

export function answerFor(topic: TopicKey, stay: StayDetails, policies: Policy[], question: string): Answer | null {
  const rules = stay.houseRules;
  switch (topic) {
    case "cancellation":
      return policyAnswer(topic, "Cancellation", stay.cancellation);
    case "refunds":
      return policyAnswer(topic, "Rebooking and refunds", policyBy(policies, "rebooking"));
    case "payment":
      return policyAnswer(topic, "Payment", policyBy(policies, "booking-payment"));
    case "damage":
      return policyAnswer(topic, "Damage", policyBy(policies, "damage"));
    case "check-in":
      return {
        topic,
        title: "Check-in",
        rules: [
          { label: "Check-in", value: `After ${formatTime(rules.checkInTime)}` },
          { label: "Check-out", value: `By ${formatTime(rules.checkOutTime)}` },
          { label: "Check-in method", value: checkInMethodLabel(rules.checkInMethod) },
        ],
        source: "House rules",
      };
    case "pets": {
      const petRules = rules.additionalRules.filter((rule) => /\b(pets?|dogs?|cats?|animals?)\b/i.test(rule));
      return {
        topic,
        title: "Pets",
        rules: [{ label: "Pets", value: allowed(rules.petsAllowed) }],
        paragraphs: petRules.length ? petRules : undefined,
        source: "House rules",
      };
    }
    case "quiet-hours": {
      const quiet = rules.quietHours?.start && rules.quietHours?.end ? rules.quietHours : null;
      return {
        topic,
        title: "Quiet hours",
        rules: [
          {
            label: "Quiet hours",
            value: quiet ? `${formatTime(quiet.start!)} – ${formatTime(quiet.end!)}` : "Not listed",
          },
        ],
        source: "House rules",
      };
    }
    case "smoking-parties":
      return {
        topic,
        title: "Smoking & parties",
        rules: [
          { label: "Smoking", value: allowed(rules.smokingAllowed) },
          { label: "Parties and events", value: allowed(rules.partiesAllowed) },
        ],
        source: "House rules",
      };
    case "house-rules":
      return {
        topic,
        title: "House rules",
        paragraphs: rules.additionalRules.length ? rules.additionalRules : undefined,
        rules: rules.additionalRules.length ? undefined : [{ label: "Additional rules", value: "None listed" }],
        source: "House rules",
      };
    case "guests":
      return {
        topic,
        title: "Guests & beds",
        rules: [
          { label: "Sleeps", value: `${stay.maxGuests} guests` },
          { label: "Bedrooms", value: String(stay.bedrooms) },
          { label: "Beds", value: String(stay.beds) },
          { label: "Bathrooms", value: String(stay.bathrooms) },
        ],
        source: "Stay details",
      };
    case "price":
      return {
        topic,
        title: "Price & fees",
        rules: [
          { label: "Per night", value: `$${stay.pricePerNight}` },
          { label: "Cleaning fee", value: `$${stay.cleaningFee}` },
          { label: "Minimum stay", value: `${stay.minNights} ${stay.minNights === 1 ? "night" : "nights"}` },
        ],
        source: "Stay details",
      };
    case "amenities":
      return {
        topic,
        title: "Amenities",
        rules: amenitiesIn(question).map((key) => ({
          label: amenityMeta[key].label,
          value: stay.amenities.includes(key) ? "Yes" : "No",
        })),
        source: "Amenities",
      };
    case "host": {
      const response = responseTimeLabel(stay.host.responseTime);
      return {
        topic,
        title: "Host",
        rules: [
          { label: "Host", value: stay.host.name },
          { label: "Hosting since", value: stay.host.hostingSince.slice(0, 4) },
          ...(response ? [{ label: "Response time", value: response.replace(/^Replies /, "") }] : []),
        ],
        paragraphs: stay.host.bio ? [stay.host.bio] : undefined,
        source: "Host profile",
      };
    }
  }
}

export const NO_ANSWER: Answer = {
  topic: "none",
  title: "No answer found",
  paragraphs: ["We couldn't find this in the stay's details or Roamly's policies. Roamly support can help."],
  source: "Roamly support",
};
