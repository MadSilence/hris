import { useQuery } from "@tanstack/react-query";
import { notificationsService } from "@/components/modules/notifications/services/notificationsService";
import { getUnreadNotificationsCountQueryKey } from "@/components/modules/notifications/utils/notificationsQueryKeys";

const REFETCH_INTERVAL_MS = 45_000;

/**
 * Unread badge count. No WebSocket in the project — freshness comes from polling +
 * refetch-on-focus (per the notifications design). Cheap query, safe to poll.
 */
export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: getUnreadNotificationsCountQueryKey(),
    queryFn: () => notificationsService.unreadCount(),
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });
};
