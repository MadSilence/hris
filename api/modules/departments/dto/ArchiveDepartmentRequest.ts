export type DepartmentArchiveChildrenStrategy = "PROMOTE" | "ARCHIVE_CASCADE";
export type DepartmentArchiveMembersStrategy = "UNASSIGN" | "MOVE_TO";

export interface ArchiveDepartmentRequest {
  childrenStrategy: DepartmentArchiveChildrenStrategy;
  membersStrategy: DepartmentArchiveMembersStrategy;
  subMembersStrategy?: DepartmentArchiveMembersStrategy;
  targetId?: string | null;
}
