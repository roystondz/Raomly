import { useCallback, useEffect, useRef, useState } from "react";

import { sanityFetch } from "@/sanity/fetch";
import { STAY_QUERY, type StayQueryResult } from "@/sanity/queries";

// Loaded stays for this session, by slug. The details screen fills it and its
// sheets (policies, cancellation, host) read the same entry instantly.
const cache = new Map<string, StayQueryResult>();

type State = { data: StayQueryResult | null; error: Error | null; loading: boolean };

export function useStay(slug: string | undefined) {
  const cached = slug ? cache.get(slug) : undefined;
  const [state, setState] = useState<State>({ data: cached ?? null, error: null, loading: !cached });
  const controller = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    if (!slug) return;
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setState((s) => ({ ...s, error: null, loading: true }));
    try {
      const data = await sanityFetch<StayQueryResult>(STAY_QUERY, { slug }, { signal: current.signal });
      if (current.signal.aborted) return;
      if (data.stay) cache.set(slug, data);
      setState({ data, error: null, loading: false });
    } catch (error) {
      if (current.signal.aborted) return;
      setState((s) => ({ ...s, loading: false, error: error instanceof Error ? error : new Error(String(error)) }));
    }
  }, [slug]);

  useEffect(() => {
    if (!cached) load();
    return () => controller.current?.abort();
    // Load once per slug; a cached stay needs no request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return {
    stay: state.data?.stay ?? null,
    policies: state.data?.policies ?? [],
    loading: state.loading,
    error: state.error,
    // Loaded, but no published stay has this slug.
    notFound: !state.loading && !state.error && state.data !== null && state.data.stay === null,
    retry: load,
  };
}
