import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  deleteNotificationAction,
  markAllNotificationsReadAction,
  markAllNotificationsSeenAction,
  markNotificationReadAction,
  setNotificationStarredAction,
} from "@/components/modules/notifications/actions/notificationActions";
import { useInvalidateNotifications } from "@/components/modules/notifications/hooks/useNotifications";

const throwOnError = (result: { status: ActionStatus; errorMessage?: string }) => {
  if (result.status === ActionStatus.ERROR) {
    throw new Error(result.errorMessage || "Notification action failed");
  }
  return result;
};

export const useMarkNotificationRead = () => {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: async (id: string) => throwOnError(await markNotificationReadAction(id)),
    onSuccess: invalidate,
  });
};

export const useMarkAllNotificationsRead = () => {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: async () => throwOnError(await markAllNotificationsReadAction()),
    onSuccess: invalidate,
  });
};

export const useMarkAllNotificationsSeen = () => {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: async () => throwOnError(await markAllNotificationsSeenAction()),
    onSuccess: invalidate,
  });
};

export const useSetNotificationStarred = () => {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: async (vars: { id: string; starred: boolean }) =>
      throwOnError(await setNotificationStarredAction(vars.id, vars.starred)),
    onSuccess: invalidate,
  });
};

export const useDeleteNotification = () => {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: async (id: string) => throwOnError(await deleteNotificationAction(id)),
    onSuccess: invalidate,
  });
};
