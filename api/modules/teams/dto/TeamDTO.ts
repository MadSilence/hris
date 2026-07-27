export type TeamStatus = "ACTIVE" | "ARCHIVED";

export interface TeamDTO {
  id: string;
  name: string;
  description: string | null;
  code: string | null;
  parentId: string | null;
  status: TeamStatus;
  leadId: string | null;
  memberCount: number;
  archivedAt: string | null;
}
