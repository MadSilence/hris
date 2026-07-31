import type { TeamDTO, TeamLeadDTO } from "./TeamDTO";

export interface TeamTreeNodeDTO extends TeamDTO {
  lead?: TeamLeadDTO | null;
  children?: TeamTreeNodeDTO[];
}
