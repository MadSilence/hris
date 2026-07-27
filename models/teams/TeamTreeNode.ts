import type { Team } from "./Team";

export interface TeamTreeNode extends Team {
  children: TeamTreeNode[];
}
