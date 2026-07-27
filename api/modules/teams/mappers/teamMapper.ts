import type {
  TeamDTO,
  TeamTreeNodeDTO,
  TeamMemberStubDTO,
  TeamMembersPageDTO,
} from "@/api/modules/teams/dto";
import type {
  Team,
  TeamTreeNode,
  TeamMember,
  TeamMembersPage,
} from "@/models/teams";

export class TeamMapper {
  public mapDTO(dto: TeamDTO): Team {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      code: dto.code,
      parentId: dto.parentId,
      status: dto.status,
      leadId: dto.leadId,
      memberCount: dto.memberCount,
      archivedAt: dto.archivedAt,
    };
  }

  public mapDTOs(dtos: TeamDTO[]): Team[] {
    return dtos.map((dto) => this.mapDTO(dto));
  }

  public mapTreeNodeDTO(dto: TeamTreeNodeDTO): TeamTreeNode {
    return {
      ...this.mapDTO(dto),
      children: (dto.children ?? []).map((c) => this.mapTreeNodeDTO(c)),
    };
  }

  public mapTreeNodeDTOs(dtos: TeamTreeNodeDTO[]): TeamTreeNode[] {
    return dtos.map((dto) => this.mapTreeNodeDTO(dto));
  }

  public mapMemberStubDTO(dto: TeamMemberStubDTO): TeamMember {
    return {
      userId: dto.userId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      avatarUrl: dto.avatarUrl,
      jobTitle: dto.jobTitle,
    };
  }

  public mapMembersPageDTO(dto: TeamMembersPageDTO): TeamMembersPage {
    return {
      items: (dto.items ?? []).map((m) => this.mapMemberStubDTO(m)),
      total: dto.total,
      page: dto.page,
      size: dto.size,
    };
  }
}

export const teamMapper = new TeamMapper();
