import type {
  TeamDTO,
  TeamTreeNodeDTO,
} from "@/api/modules/teams/dto";
import type {
  Team,
  TeamLead,
  TeamTreeNode,
} from "@/models/teams";

export class TeamMapper {
  public mapDTO(dto: TeamDTO): Team {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
      description: dto.about,
      leadId: dto.leadUserId,
      memberCount: dto.membersCount,
      archivedAt: null,
    };
  }

  public mapDTOs(dtos: TeamDTO[]): Team[] {
    return dtos.map((dto) => this.mapDTO(dto));
  }

  public mapTreeNodeDTO(dto: TeamTreeNodeDTO): TeamTreeNode {
    const lead: TeamLead | null = dto.lead
      ? {
          id: dto.lead.id,
          firstName: dto.lead.firstName,
          lastName: dto.lead.lastName,
          avatarUrl: dto.lead.avatarUrl,
        }
      : null;

    return {
      // The node's own extras pass through as they come; the team part is mapped the way a flat
      // team is. Named one by one, a field added to the node later would silently never arrive.
      ...dto,
      ...this.mapDTO(dto),
      lead,
      children: (dto.children ?? []).map((c) => this.mapTreeNodeDTO(c)),
    };
  }

  public mapTreeNodeDTOs(dtos: TeamTreeNodeDTO[]): TeamTreeNode[] {
    return dtos.map((dto) => this.mapTreeNodeDTO(dto));
  }
}

export const teamMapper = new TeamMapper();
