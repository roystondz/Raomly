import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { homeStaysLogger } from "@/config/posthog-logger";
import { sanityFetch } from "@/sanity/fetch";
import { HOME_STAYS_QUERY, type HomeStay } from "@/sanity/queries";

type State = { stays: HomeStay[] | null; error: Error | null; refreshing: boolean };

// Coming back to Home (or to the app) reloads quietly, but not more often than this.
const STALE_AFTER_MS = 15_000;

// Loads Home's stays, with pull-to-refresh and retry. Reloads quietly when Home
// regains focus or the app returns to the foreground. Keeps showing the last
// good list while any reload runs.
export function useHomeStays() {
  const [state, setState] = useState<State>({ stays: null, error: null, refreshing: false });
  const controller = useRef<AbortController | null>(null);
  const loadedAt = useRef(0);

  const load = useCallback(async (refreshing: boolean) => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setState((s) => ({ ...s, error: null, refreshing }));
    try {
      // A pull is an explicit ask for the latest content, so it skips the CDN cache.
      const stays = await sanityFetch<HomeStay[]>(HOME_STAYS_QUERY, {}, { signal: current.signal, fresh: refreshing });
      if (!current.signal.aborted) {
        loadedAt.current = Date.now();
        setState({ stays, error: null, refreshing: false });
        homeStaysLogger.loaded({ refreshing, stayCount: stays.length });
      }
    } catch (error) {
      if (!current.signal.aborted) {
        setState((s) => ({ ...s, error: error instanceof Error ? error : new Error(String(error)), refreshing: false }));
        homeStaysLogger.failed({
          refreshing,
          errorType: error instanceof Error ? error.name : "unknown_error",
        });
      }
    }
  }, []);

  const loadIfStale = useCallback(() => {
    if (Date.now() - loadedAt.current > STALE_AFTER_MS) load(false);
  }, [load]);

  // Also covers the first load, since Home is focused when it mounts.
  useFocusEffect(loadIfStale);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "active") loadIfStale();
    });
    return () => {
      subscription.remove();
      controller.current?.abort();
    };
  }, [loadIfStale]);

  return {
    ...state,
    loading: state.stays === null && state.error === null,
    refresh: () => load(true),
    retry: () => load(false),
  };
}
