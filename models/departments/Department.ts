import type { DepartmentStatus } from "./DepartmentStatus";

export interface Department {
  id: string;
  name: string;
  description: string | null;
  code: string | null;
  parentId: string | null;
  status: DepartmentStatus;
  leadId: string | null;
  memberCount: number;
  archivedAt: string | null;
}
