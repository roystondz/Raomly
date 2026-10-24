import { sanityConfig } from "./config";

const { projectId, dataset, apiVersion } = sanityConfig;
const path = `/v${apiVersion}/data/query/${dataset}`;
// The CDN is fast but can serve results up to about a minute old. The API host
// is always current; use it only when the guest explicitly asks for fresh data.
const CDN_URL = `https://${projectId}.apicdn.sanity.io${path}`;
const API_URL = `https://${projectId}.api.sanity.io${path}`;

export type QueryParams = Record<string, string | number | boolean | null>;

type FetchOptions = { signal?: AbortSignal; fresh?: boolean };

// Runs a GROQ query against published content. Values always go in as $params
// (JSON encoded, as the query API expects), never into the query string itself.
export async function sanityFetch<T>(query: string, params: QueryParams = {}, options: FetchOptions = {}): Promise<T> {
  const search = new URLSearchParams({ query, perspective: "published" });
  for (const [key, value] of Object.entries(params)) search.set(`$${key}`, JSON.stringify(value));

  const response = await fetch(`${options.fresh ? API_URL : CDN_URL}?${search}`, { signal: options.signal });
  const body = (await response.json().catch(() => null)) as { result?: T; error?: { description?: string } } | null;
  if (!response.ok || !body || body.error) {
    throw new Error(body?.error?.description ?? `Sanity query failed (${response.status})`);
  }
  return body.result as T;
}
