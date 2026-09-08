"use client";

import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { UsersSearchItemDTO, UsersSearchRequest, UsersSearchResponseDTO } from "@/models/user/fields";
import { PEOPLE_SEARCH_QK } from "./usePeopleSearch";

// Cursor-paginated variant of usePeopleSearch. Shares the PEOPLE_SEARCH_QK prefix so
// role mutations keep invalidating both.
export const usePeopleSearchInfinite = (params: Omit<UsersSearchRequest, "cursor">) => {
  const { internalApiClient } = useAppDataContext();

  const query = useInfiniteQuery<UsersSearchResponseDTO>({
    queryKey: [PEOPLE_SEARCH_QK, "infinite", params],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      internalApiClient.post<UsersSearchResponseDTO>("/users/search", {
        ...params,
        cursor: pageParam ?? null,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    /**
     * Keep the rows on screen while the next answer is fetched.
     *
     * Every parameter of this query is a control the reader is holding: the search box, the sort,
     * the filters, the chosen columns. Without this each keystroke and each toggle changed the key,
     * `isLoading` went true, and the table — all of it, header included — collapsed into a skeleton
     * and came back. **`placeholderData` was already set, on `usePeopleSearch`**, the non-paginated
     * twin this container does not use; the People table has always run on the infinite one.
     */
    placeholderData: keepPreviousData,
  });

  const items: UsersSearchItemDTO[] =
    query.data?.pages.flatMap((page) => page.items) ?? [];

  return { ...query, items };
};
