export type TeamChildrenStrategy = "PROMOTE" | "DELETE_CASCADE";
export type TeamMembersStrategy = "UNASSIGN" | "MOVE_TO";

export interface DeleteTeamPayload {
  childrenStrategy: TeamChildrenStrategy;
  membersStrategy: TeamMembersStrategy;
  subMembersStrategy?: TeamMembersStrategy;
  targetId?: string | null;
}
