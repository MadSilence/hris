import type { TeamDTO } from "./TeamDTO";

export interface TeamTreeNodeDTO extends TeamDTO {
  children: TeamTreeNodeDTO[];
}
