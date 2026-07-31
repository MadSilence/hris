import type { Team } from "./Team";
import type { TeamLead } from "./TeamLead";

export interface TeamTreeNode extends Team {
  lead?: TeamLead | null;
  children: TeamTreeNode[];
}
