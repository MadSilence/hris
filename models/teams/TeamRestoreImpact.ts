/** An archived sub-unit that may come back with the team being restored. */
export interface ArchivedTeamUnit {
  id: string;
  name: string;
  parentId: string | null;
  /** 1 = a direct child of the team being restored. */
  depth: number;
  archivedAt: string | null;
  /** True when the archive of the parent took it along; false when it was archived on its own. */
  archivedWithParent: boolean;
}

/** In tree order — parents before their children. */
export interface TeamRestoreImpact {
  archivedUnits: ArchivedTeamUnit[];
}
