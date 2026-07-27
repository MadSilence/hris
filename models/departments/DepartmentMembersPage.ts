import type { DepartmentMember } from "./DepartmentMember";

export interface DepartmentMembersPage {
  items: DepartmentMember[];
  total: number;
  page: number;
  size: number;
}
