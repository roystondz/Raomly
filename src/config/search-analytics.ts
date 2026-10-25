import { posthog } from "@/config/posthog";
import { hasExactFilters, type ParsedQuery } from "@/search/parse-query";

export type SearchSource = "home" | "search_bar" | "suggested_query" | "chip";

// The only place search outcomes are sent from. Properties describe the shape
// of the search, never what the guest typed or where they want to go.
export const searchAnalytics = {
  completed: ({
    source,
    queryLength,
    parsed,
    resultCount,
  }: {
    source: SearchSource;
    queryLength: number;
    parsed: ParsedQuery;
    resultCount: number;
  }) => {
    // Soft-only searches show the no-match screen, so they count as no results;
    // closest_only marks that nearest stays were available behind the opt-in.
    const exact = hasExactFilters(parsed);
    posthog.capture("stay_search_completed", {
      search_source: source,
      query_length: queryLength,
      result_count: exact ? resultCount : 0,
      has_results: exact && resultCount > 0,
      stay_type: parsed.type ?? null,
      has_place: Boolean(parsed.city || parsed.region || parsed.country),
      closest_only: !exact && resultCount > 0,
      has_max_price: parsed.maxPrice !== undefined,
      has_guests: parsed.guests !== undefined,
      pets: parsed.pets,
      amenity_count: parsed.amenities.length,
      soft_term_count: parsed.softTerms.length,
    });
  },
  // The guest chose to see the nearest stays after a no-exact-match search.
  closestShown: ({ shownCount }: { shownCount: number }) => {
    posthog.capture("stay_search_closest_shown", { shown_count: shownCount });
  },
  failed: ({ source, errorType }: { source: SearchSource; errorType: string }) => {
    posthog.capture("stay_search_failed", { search_source: source, error_type: errorType });
  },
};
