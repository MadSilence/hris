export const NOTIFICATIONS_QUERY_KEY = "notifications";

export const getNotificationsQueryKey = () => [NOTIFICATIONS_QUERY_KEY, "list"] as const;

export const getUnreadNotificationsCountQueryKey = () =>
  [NOTIFICATIONS_QUERY_KEY, "unread-count"] as const;

export const getNotificationPreferencesQueryKey = () =>
  [NOTIFICATIONS_QUERY_KEY, "preferences"] as const;
