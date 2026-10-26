/** One archived sub-unit of the department about to be restored, as `GET /departments/{id}/restore-impact` lists it. */
export interface ArchivedDepartmentUnitDTO {
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
export interface DepartmentRestoreImpactDTO {
  archivedUnits: ArchivedDepartmentUnitDTO[];
}
