import type { DepartmentDTO } from "./DepartmentDTO";

export interface DepartmentTreeNodeDTO extends DepartmentDTO {
  children: DepartmentTreeNodeDTO[];
}
