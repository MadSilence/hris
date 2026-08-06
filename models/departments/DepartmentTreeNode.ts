import type { Department } from "./Department";
import type { DepartmentLead } from "./DepartmentLead";

export interface DepartmentTreeNode extends Department {
  directSubNodes: number;
  totalPeople: number;
  totalSubNodes: number;
  lead: DepartmentLead | null;
  children: DepartmentTreeNode[];
}
