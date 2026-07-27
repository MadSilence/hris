import type { DepartmentMemberStubDTO } from "./DepartmentMemberStubDTO";

export interface DepartmentMembersPageDTO {
  items: DepartmentMemberStubDTO[];
  total: number;
  page: number;
  size: number;
}
