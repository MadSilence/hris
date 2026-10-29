import type { Notification } from "@/models/notifications";

/** The inbox's status filters, in the order they are shown. The URL carries one as `?filter=`. */
export const INBOX_FILTERS = ["all", "unread", "starred", "needs-action"] as const;
export type InboxFilter = (typeof INBOX_FILTERS)[number];

export const INBOX_FILTER_LABELS: Record<InboxFilter, string> = {
  all: "All",
  unread: "Unread",
  starred: "Starred",
  "needs-action": "Needs Action",
};

/** Where home's *Waiting on You* "See All" leads (sitting 2, H5). */
export const NEEDS_ACTION_INBOX_HREF = "/inbox?filter=needs-action";

/** A `?filter=` value the inbox knows, or `all` for anything else — a stale link must not blank the inbox. */
export const parseInboxFilter = (value: string | null | undefined): InboxFilter =>
  (INBOX_FILTERS as readonly string[]).includes(value ?? "") ? (value as InboxFilter) : "all";

/**
 * A question still waiting for this reader: an actionable notification whose source is still open.
 *
 * The answer is the backend's, read live per recipient (`ActionableProjectionResolver`): a request somebody
 * else already decided, or one this approver has signed while the rest of the chain has not, comes back
 * closed. Read or unread does not matter — opening a question is not answering it.
 */
export const needsAction = (notification: Notification): boolean => notification.source?.open === true;

export const matchesInboxFilter = (notification: Notification, filter: InboxFilter): boolean => {
  switch (filter) {
    case "unread":
      return !notification.read;
    case "starred":
      return notification.starred;
    case "needs-action":
      return needsAction(notification);
    default:
      return true;
  }
};
