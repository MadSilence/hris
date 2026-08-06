import type { DepartmentDTO, DepartmentLeadDTO } from "./DepartmentDTO";

export interface DepartmentTreeNodeDTO extends DepartmentDTO {
  directSubNodes: number;
  totalPeople: number;
  totalSubNodes: number;
  lead?: DepartmentLeadDTO | null;
  children?: DepartmentTreeNodeDTO[];
}
