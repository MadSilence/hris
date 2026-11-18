import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/components/modules/notifications/services/notificationsService";
import {
  NOTIFICATIONS_QUERY_KEY,
  getInboxSummaryQueryKey,
  getNotificationPagesQueryKey,
} from "@/components/modules/notifications/utils/notificationsQueryKeys";
import type { InboxStatus } from "@/models/notifications";

/**
 * The inbox, a page at a time (B5): newest first, one status filter and one category asked of the server; the next
 * page starts after the last line of the one before.
 */
export const useNotificationPages = (status: InboxStatus, category: string | null) =>
  useInfiniteQuery({
    queryKey: getNotificationPagesQueryKey(status, category),
    queryFn: ({ pageParam }) => notificationsService.list({ status, category, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    refetchOnWindowFocus: true,
  });

/** What the filters and chips count, over the whole inbox. */
export const useInboxSummary = () =>
  useQuery({
    queryKey: getInboxSummaryQueryKey(),
    queryFn: () => notificationsService.summary(),
    refetchOnWindowFocus: true,
  });

export const useInvalidateNotifications = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
  };
};
