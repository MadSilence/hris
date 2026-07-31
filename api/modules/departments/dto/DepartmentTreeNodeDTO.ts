import type { DepartmentDTO, DepartmentLeadDTO } from "./DepartmentDTO";

export interface DepartmentTreeNodeDTO extends DepartmentDTO {
  lead?: DepartmentLeadDTO | null;
  children?: DepartmentTreeNodeDTO[];
}
