export type DepartmentChildrenStrategy = "PROMOTE" | "DELETE_CASCADE";
export type DepartmentMembersStrategy = "UNASSIGN" | "MOVE_TO";

export interface DeleteDepartmentRequest {
  childrenStrategy: DepartmentChildrenStrategy;
  membersStrategy: DepartmentMembersStrategy;
  targetId?: string | null;
}
