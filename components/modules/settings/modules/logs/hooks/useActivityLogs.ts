import { useInfiniteQuery } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { ActivityLogFilters, ActivityLogPage } from "@/models/activityLog";
import { logsQueryKeys } from "@/components/modules/settings/modules/logs/utils/logsQueryKeys";

/** The backend caps this at 200; 50 is what one screen plus a little scroll needs. */
const PAGE_SIZE = 50;

/**
 * The journal, a page at a time.
 *
 * <p>Cursor-based rather than offset: the table has no retention and rows arrive while somebody is
 * scrolling, so an offset would repeat or skip them. The cursor is opaque here on purpose — it is the
 * backend's `(created_at, id)` keyset, and the page's job is only to hand it back.
 */
export const useActivityLogs = (filters: ActivityLogFilters) => {
  const { internalApiClient } = useAppDataContext();

  const query = useInfiniteQuery<ActivityLogPage>({
    queryKey: logsQueryKeys.list(filters),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      if (pageParam) params.set("cursor", String(pageParam));

      return internalApiClient.get<ActivityLogPage>(`/activity-logs?${params.toString()}`);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const items = query.data?.pages.flatMap((page) => page.items) ?? [];

  return { ...query, items };
};
