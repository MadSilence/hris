import type { TeamMemberStubDTO } from "./TeamMemberStubDTO";

export interface TeamMembersPageDTO {
  items: TeamMemberStubDTO[];
  total: number;
  page: number;
  size: number;
}
