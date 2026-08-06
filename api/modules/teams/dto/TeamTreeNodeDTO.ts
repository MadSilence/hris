import type { TeamDTO, TeamLeadDTO } from "./TeamDTO";

export interface TeamTreeNodeDTO extends TeamDTO {
  directSubNodes: number;
  totalPeople: number;
  totalSubNodes: number;
  lead?: TeamLeadDTO | null;
  children?: TeamTreeNodeDTO[];
}
