import { useCallback, useEffect, useRef, useState } from "react";

import { searchAnalytics, type SearchSource } from "@/config/search-analytics";
import { sanityFetch } from "@/sanity/fetch";
import { CITIES_QUERY } from "@/sanity/queries";
import { buildSearchQuery, type SearchStay } from "@/search/build-query";
import { chipsFor, type FilterChip } from "@/search/chips";
import { parseQuery, type ParsedQuery } from "@/search/parse-query";

type State = {
  text: string;
  // What the query was parsed into; chips change it without touching the text.
  parsed: ParsedQuery | null;
  chips: FilterChip[];
  // True once a chip changed the parsed query.
  filtersChanged: boolean;
  stays: SearchStay[] | null;
  loading: boolean;
  error: Error | null;
};

const IDLE: State = { text: "", parsed: null, chips: [], filtersChanged: false, stays: null, loading: false, error: null };

// Loaded once per session. Without it a place is never read as a city, which
// only makes search less exact, so a failure falls back to no cities.
let citiesPromise: Promise<string[]> | null = null;
function loadCities() {
  citiesPromise ??= sanityFetch<string[]>(CITIES_QUERY).catch(() => {
    citiesPromise = null;
    return [];
  });
  return citiesPromise;
}

// Parses a sentence, runs it against Sanity and reports the outcome to PostHog.
// Each search aborts the one before it; previous results stay while a new one loads.
export function useStaySearch() {
  const [state, setState] = useState<State>(IDLE);
  const controller = useRef<AbortController | null>(null);
  const last = useRef<{ parsed: ParsedQuery; text: string; source: SearchSource } | null>(null);
  const searchId = useRef(0);
  // What the sentence was parsed into, before any chip changed it.
  const initial = useRef<ParsedQuery | null>(null);

  const run = useCallback(async (parsed: ParsedQuery, text: string, source: SearchSource) => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    last.current = { parsed, text, source };
    setState((s) => ({ ...s, parsed, loading: true, error: null }));

    try {
      const { query, params } = buildSearchQuery(parsed);
      const stays = await sanityFetch<SearchStay[]>(query, params, { signal: current.signal });
      if (current.signal.aborted) return;
      setState((s) => ({ ...s, stays, loading: false }));
      searchAnalytics.completed({ source, queryLength: text.length, parsed, resultCount: stays.length });
    } catch (error) {
      if (current.signal.aborted) return;
      setState((s) => ({ ...s, loading: false, error: error instanceof Error ? error : new Error(String(error)) }));
      searchAnalytics.failed({ source, errorType: error instanceof Error ? error.name : "unknown_error" });
    }
  }, []);

  const search = useCallback(
    async (input: string, source: Exclude<SearchSource, "chip">) => {
      const text = input.trim();
      if (!text) {
        searchId.current++;
        controller.current?.abort();
        last.current = null;
        setState(IDLE);
        return;
      }
      // A new sentence starts over: fresh chips, no earlier results.
      const id = ++searchId.current;
      setState({ ...IDLE, text, loading: true });
      const parsed = parseQuery(text, { cities: await loadCities() });
      // A newer search started while cities loaded; it owns the screen now.
      if (id !== searchId.current) return;
      initial.current = parsed;
      setState((s) => ({ ...s, parsed, chips: chipsFor(parsed) }));
      await run(parsed, text, source);
    },
    [run],
  );

  const applyFilters = useCallback(
    (parsed: ParsedQuery) => {
      setState((s) => ({ ...s, filtersChanged: true }));
      run(parsed, last.current?.text ?? "", "chip");
    },
    [run],
  );

  // Back to what the sentence itself asked for.
  const resetFilters = useCallback(() => {
    if (!initial.current || !last.current) return;
    setState((s) => ({ ...s, filtersChanged: false }));
    run(initial.current, last.current.text, "chip");
  }, [run]);

  const retry = useCallback(() => {
    if (last.current) run(last.current.parsed, last.current.text, last.current.source);
  }, [run]);

  useEffect(() => () => controller.current?.abort(), []);

  return { ...state, search, applyFilters, resetFilters, retry };
}
