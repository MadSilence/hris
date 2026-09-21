export interface NotificationSourceProjection {
  type: string;
  id: string;
  status: string | null;
  open: boolean;
  /**
   * Read live with the status, for a question that has to show more than a status — a holiday drift
   * lists what changed and whose leave it touches. Null for sources that need nothing more.
   */
  details: Record<string, unknown> | null;
}

export interface Notification {
  id: string;
  type: string;
  category: string;
  params: Record<string, unknown>;
  targetType: string | null;
  targetId: string | null;
  sourceType: string | null;
  sourceId: string | null;
  seen: boolean;
  read: boolean;
  starred: boolean;
  createdAt: string;
  source: NotificationSourceProjection | null;
}
