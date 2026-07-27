"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
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
  });

  const items: UsersSearchItemDTO[] =
    query.data?.pages.flatMap((page) => page.items) ?? [];

  return { ...query, items };
};
