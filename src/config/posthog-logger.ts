import { posthog } from "@/config/posthog";

// This isolated facade is the only source of application logs exported to PostHog.
export const homeStaysLogger = {
  loaded: ({ refreshing, stayCount }: { refreshing: boolean; stayCount: number }) => {
    posthog?.logger.info("home_stays_loaded", {
      content_source: "sanity",
      refreshing,
      stay_count: stayCount,
    });
  },
  failed: ({ refreshing, errorType }: { refreshing: boolean; errorType: string }) => {
    posthog?.logger.error("home_stays_load_failed", {
      content_source: "sanity",
      refreshing,
      error_type: errorType,
    });
  },
};
