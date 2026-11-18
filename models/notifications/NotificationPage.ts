import type { Notification } from "./Notification";

/** The inbox's status filters as the backend names them (B5). */
export type InboxStatus = "all" | "unread" | "starred" | "needs-action";

/** One page of the inbox, newest first; `nextCursor` is the last line's id, null on the last page. */
export type NotificationPage = { items: Notification[]; nextCursor: string | null };

/** What the inbox's filters and chips count — over the whole inbox, not the loaded pages. */
export type InboxSummary = { all: number; unread: number; starred: number; needsAction: number; categories: string[] };

export type NotificationPageQuery = { status?: InboxStatus; category?: string | null; cursor?: string | null; limit?: number };

/** The query string a page is asked with — shared by the browser's client and the BFF, so the two cannot disagree. */
export const notificationPageQueryString = (q: NotificationPageQuery): string => {
  const params = new URLSearchParams();
  if (q.status && q.status !== "all") params.set("status", q.status);
  if (q.category) params.set("category", q.category);
  if (q.cursor) params.set("cursor", q.cursor);
  if (q.limit) params.set("limit", String(q.limit));
  const s = params.toString();
  return s ? `?${s}` : "";
};
