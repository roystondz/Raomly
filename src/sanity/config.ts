// Public identifiers for reading published content from the Sanity CDN. None
// of these are secrets: the dataset is public and reads need no token.
export const sanityConfig = {
  projectId: "o5jn9krf",
  dataset: "production",
  apiVersion: "2026-10-01",
} as const;
