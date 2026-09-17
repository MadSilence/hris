import type { TeamStatus } from "./TeamStatus";

export interface Team {
  id: string;
  name: string;
  description: string | null;
  code: string | null;
  parentId: string | null;
  status: TeamStatus;
  leadId: string | null;
  memberCount: number;
  archivedAt: string | null;
  /** The row version the edit dialog sends back, so a save over someone else's change is refused. */
  version?: number;
}
