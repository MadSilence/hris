import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ActionStatus } from "@/components/models/ActionStatus";
import type { NotificationChannel } from "@/models/notifications";
import { notificationsService } from "@/components/modules/notifications/services/notificationsService";
import { setNotificationPreferenceAction } from "@/components/modules/notifications/actions/notificationActions";
import {
  NOTIFICATIONS_QUERY_KEY,
  getNotificationPreferencesQueryKey,
} from "@/components/modules/notifications/utils/notificationsQueryKeys";

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: getNotificationPreferencesQueryKey(),
    queryFn: () => notificationsService.listPreferences(),
  });
};

export const useSetNotificationPreference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { category: string; enabled: boolean; channel?: NotificationChannel }) => {
      const result = await setNotificationPreferenceAction(vars.category, vars.enabled, vars.channel ?? "IN_APP");
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to update notification preference");
      }
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
    },
  });
};
