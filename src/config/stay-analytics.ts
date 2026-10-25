import { posthog } from "@/config/posthog";
import type { StayDetails } from "@/sanity/queries";

export type StaySource = "home" | "search" | "link";

export const staySource = (from?: string): StaySource => (from === "home" || from === "search" ? from : "link");

// The only place stay-details events are sent from. No personal data.
export const stayAnalytics = {
  opened: (stay: StayDetails, source: StaySource) => {
    posthog.capture("stay_opened", {
      stay_id: stay.id,
      stay_type: stay.type,
      price_per_night: stay.pricePerNight,
      source,
    });
  },
  openFailed: (source: StaySource, errorType: string) => {
    posthog.capture("stay_open_failed", { source, error_type: errorType });
  },
  bookTapped: (stay: StayDetails) => {
    posthog.capture("stay_book_tapped", { stay_id: stay.id });
  },
  // Which topics answered a question, never the question itself.
  questionAsked: (stay: StayDetails, source: "chip" | "typed", topics: string[]) => {
    posthog.capture("stay_question_asked", {
      stay_id: stay.id,
      source,
      topics,
      topic_count: topics.length,
      answered: topics.length > 0,
    });
  },
};
