import { useCallback, useEffect, useRef, useState } from "react";

import { sanityFetch } from "@/sanity/fetch";
import { ALL_POLICIES_QUERY, type Policy } from "@/sanity/queries";

type State = { policies: Policy[] | null; error: Error | null };

// Every Roamly policy, loaded when the Profile policies sheet opens.
export function usePolicies() {
  const [state, setState] = useState<State>({ policies: null, error: null });
  const controller = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setState((s) => ({ ...s, error: null }));
    try {
      const policies = await sanityFetch<Policy[]>(ALL_POLICIES_QUERY, {}, { signal: current.signal });
      if (!current.signal.aborted) setState({ policies, error: null });
    } catch (error) {
      if (!current.signal.aborted) {
        setState((s) => ({ ...s, error: error instanceof Error ? error : new Error(String(error)) }));
      }
    }
  }, []);

  useEffect(() => {
    load();
    return () => controller.current?.abort();
  }, [load]);

  return { ...state, loading: state.policies === null && state.error === null, retry: load };
}
