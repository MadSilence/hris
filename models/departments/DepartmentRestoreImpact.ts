/** An archived sub-unit that may come back with the department being restored. */
export interface ArchivedDepartmentUnit {
  id: string;
  name: string;
  parentId: string | null;
  /** 1 = a direct child of the department being restored. */
  depth: number;
  archivedAt: string | null;
  /** True when the archive of the parent took it along; false when it was archived on its own. */
  archivedWithParent: boolean;
}

/** In tree order — parents before their children. */
export interface DepartmentRestoreImpact {
  archivedUnits: ArchivedDepartmentUnit[];
}
