export type TeamStatus = "ACTIVE" | "ARCHIVED";

export interface TeamLeadDTO {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

export interface TeamDTO {
  id: string;
  companyId?: string;
  name: string;
  code: string | null;
  about: string | null;
  status: TeamStatus;
  sortOrder: number;
  parentId: string | null;
  leadUserId: string | null;
  membersCount: number;
  /** Sent back by the edit dialog; the backend refuses a save over a newer row (E00409). */
  version?: number;
}
