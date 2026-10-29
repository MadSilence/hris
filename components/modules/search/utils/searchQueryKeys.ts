import type { SearchKind } from "@/models/search";

export const SEARCH_QUERY_KEY = "search";

export const getSearchQueryKey = (q: string) => [SEARCH_QUERY_KEY, "all", q] as const;

export const getSearchKindQueryKey = (q: string, kind: SearchKind, limit: number) =>
  [SEARCH_QUERY_KEY, "kind", kind, q, limit] as const;
