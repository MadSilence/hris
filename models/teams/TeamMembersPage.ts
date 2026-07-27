import type { TeamMember } from "./TeamMember";

export interface TeamMembersPage {
  items: TeamMember[];
  total: number;
  page: number;
  size: number;
}
