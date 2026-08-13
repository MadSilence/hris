export interface SourceProjectionDTO {
  type: string;
  id: string;
  status: string | null;
  open: boolean;
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
