export interface SourceProjectionDTO {
  type: string;
  id: string;
  status: string | null;
  open: boolean;
  /** What the question needs on screen beyond its status; omitted by sources that have nothing to add. */
  details?: Record<string, unknown> | null;
}

export interface NotificationDTO {
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
  source: SourceProjectionDTO | null;
}
