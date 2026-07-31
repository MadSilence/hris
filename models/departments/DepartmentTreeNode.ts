import type { Department } from "./Department";
import type { DepartmentLead } from "./DepartmentLead";

export interface DepartmentTreeNode extends Department {
  lead: DepartmentLead | null;
  children: DepartmentTreeNode[];
}
