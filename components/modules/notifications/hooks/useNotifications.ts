import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/components/modules/notifications/services/notificationsService";
import {
  NOTIFICATIONS_QUERY_KEY,
  getNotificationsQueryKey,
} from "@/components/modules/notifications/utils/notificationsQueryKeys";

export const useNotifications = () => {
  return useQuery({
    queryKey: getNotificationsQueryKey(),
    queryFn: () => notificationsService.list(),
    refetchOnWindowFocus: true,
  });
};

export const useInvalidateNotifications = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
  };
};
