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
      id: dto.id,
      name: dto.name,
      description: dto.about,
      code: dto.code,
      parentId: dto.parentId,
      status: dto.status,
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
