export type TeamArchiveChildrenStrategy = "PROMOTE" | "ARCHIVE_CASCADE";
export type TeamArchiveMembersStrategy = "UNASSIGN" | "MOVE_TO";

export interface ArchiveTeamPayload {
  childrenStrategy: TeamArchiveChildrenStrategy;
  membersStrategy: TeamArchiveMembersStrategy;
  subMembersStrategy?: TeamArchiveMembersStrategy;
  targetId?: string | null;
}
