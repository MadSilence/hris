export const NOTIFICATIONS_QUERY_KEY = "notifications";

export const getNotificationsQueryKey = () => [NOTIFICATIONS_QUERY_KEY, "list"] as const;

/** One filter's pages of the inbox (B5) — under the list key, so invalidating the list refetches every filter. */
export const getNotificationPagesQueryKey = (status: string, category: string | null) =>
  [NOTIFICATIONS_QUERY_KEY, "list", status, category ?? "all"] as const;

export const getInboxSummaryQueryKey = () => [NOTIFICATIONS_QUERY_KEY, "summary"] as const;

export const getUnreadNotificationsCountQueryKey = () =>
  [NOTIFICATIONS_QUERY_KEY, "unread-count"] as const;

export const getNotificationPreferencesQueryKey = () =>
  [NOTIFICATIONS_QUERY_KEY, "preferences"] as const;

/** What waits on the reader (`/me/actions`, A1) — under the notifications prefix, so answering an inbox line refreshes it. */
export const getWaitingOnMeQueryKey = () => [NOTIFICATIONS_QUERY_KEY, "waiting"] as const;
