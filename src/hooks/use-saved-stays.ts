claimport { useSyncExternalStore } from "react";

import { posthog } from "@/config/posthog";

// Saved stays shared by every screen in this session, so a heart toggled in
// Search shows on the stay's details and back. Not persisted yet.
let saved = new Set<string>();
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export type SaveSource = "search" | "stay_details";

export function toggleSavedStay(id: string, source: SaveSource) {
  const wasSaved = saved.has(id);
  saved = new Set(saved);
  if (wasSaved) saved.delete(id);
  else saved.add(id);
  listeners.forEach((listener) => listener());
  posthog.capture(wasSaved ? "stay_unsaved" : "stay_saved", { stay_id: id, source });
}

export function useSavedStays(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, () => saved);
}
