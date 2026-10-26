"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { UsersSearchRequest } from "@/models/user/fields";
import { PEOPLE_SEARCH_QK } from "./usePeopleSearch";

/**
 * How many rows the People table holds for its current search — the N of "Select all N matching".
 *
 * Counted by the backend the way an operation over the whole filter resolves it (`Mode.TABLE`), so
 * the number the reader confirms is the number written. Asked only once a whole page is selected:
 * nobody needs it before then. Under the search's key prefix, so whatever refreshes the table
 * refreshes the count with it.
 */
export const usePeopleSearchCount = (
  params: Pick<UsersSearchRequest, "q" | "filters" | "drafts">,
  enabled: boolean,
) => {
  const { internalApiClient } = useAppDataContext();
  const body = { q: params.q ?? null, filters: params.filters ?? null, drafts: params.drafts ?? null };

  return useQuery<{ count: number }>({
    queryKey: [PEOPLE_SEARCH_QK, "count", body],
    queryFn: () => internalApiClient.post<{ count: number }>("/users/search/count", body),
    enabled,
  });
};
