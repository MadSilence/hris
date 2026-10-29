import { useQueries, useQuery } from "@tanstack/react-query";
import { searchService } from "@/components/modules/search/services";
import { getSearchKindQueryKey, getSearchQueryKey } from "@/components/modules/search/utils";
import type { SearchGroup, SearchKind } from "@/models/search";

/** The server's own threshold: one character matches half the company. */
export const MIN_SEARCH_LENGTH = 2;
/** The best of each kind in the window. */
export const QUICK_SEARCH_LIMIT = 5;
/** What "Show more" asks for — the server's cap per kind. */
export const EXPANDED_SEARCH_LIMIT = 50;

/**
 * Every kind's best five, and for each kind the reader expanded, a second read of that kind alone
 * with the larger limit. The expanded read replaces the kind's group once it arrives; until then the
 * five stay on screen, so nothing jumps.
 */
export const useGlobalSearch = (term: string, expanded: SearchKind[]) => {
  const q = term.trim();
  const enabled = q.length >= MIN_SEARCH_LENGTH;

  const main = useQuery({
    queryKey: getSearchQueryKey(q),
    queryFn: () => searchService.search({ q, limit: QUICK_SEARCH_LIMIT }),
    enabled,
    staleTime: 30_000,
  });

  const more = useQueries({
    queries: expanded.map((kind) => ({
      queryKey: getSearchKindQueryKey(q, kind, EXPANDED_SEARCH_LIMIT),
      queryFn: () => searchService.search({ q, kinds: [kind], limit: EXPANDED_SEARCH_LIMIT }),
      enabled,
      staleTime: 30_000,
    })),
  });

  const expandedGroups = new Map<SearchKind, SearchGroup>();
  more.forEach((result) => {
    result.data?.groups.forEach((group) => expandedGroups.set(group.kind, group));
  });

  const groups: SearchGroup[] = (main.data?.groups ?? []).map((group) => expandedGroups.get(group.kind) ?? group);

  return {
    enabled,
    groups,
    isLoading: enabled && main.isLoading,
    error: main.error,
    refetch: main.refetch,
    isExpanding: (kind: SearchKind) => more[expanded.indexOf(kind)]?.isFetching ?? false,
  };
};
