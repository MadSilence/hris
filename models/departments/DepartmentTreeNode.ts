import type { Department } from "./Department";

export interface DepartmentTreeNode extends Department {
  children: DepartmentTreeNode[];
}
