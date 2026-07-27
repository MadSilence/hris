export type DepartmentChildrenStrategy = "PROMOTE" | "DELETE_CASCADE";
export type DepartmentMembersStrategy = "UNASSIGN" | "MOVE_TO";

export interface DeleteDepartmentPayload {
  childrenStrategy: DepartmentChildrenStrategy;
  membersStrategy: DepartmentMembersStrategy;
  targetDepartmentId?: string | null;
}
