import type { Team } from "./Team";
import type { TeamLead } from "./TeamLead";

export interface TeamTreeNode extends Team {
  directSubNodes: number;
  totalPeople: number;
  totalSubNodes: number;
  lead?: TeamLead | null;
  children: TeamTreeNode[];
}
