export type DepartmentStatus = "ACTIVE" | "ARCHIVED";

export interface DepartmentLeadDTO {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

export interface DepartmentDTO {
  id: string;
  companyId?: string;
  name: string;
  code: string | null;
  about: string | null;
  status: DepartmentStatus;
  sortOrder: number;
  parentId: string | null;
  leadUserId: string | null;
  membersCount: number;
  /** Sent back by the edit dialog; the backend refuses a save over a newer row (E00409). */
  version?: number;
}
