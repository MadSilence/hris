import type {
  DepartmentDTO,
  DepartmentTreeNodeDTO,
  DepartmentMemberStubDTO,
  DepartmentMembersPageDTO,
} from "@/api/modules/departments/dto";
import type {
  Department,
  DepartmentTreeNode,
  DepartmentMember,
  DepartmentMembersPage,
} from "@/models/departments";

export class DepartmentMapper {
  public mapDTO(dto: DepartmentDTO): Department {
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

  public mapDTOs(dtos: DepartmentDTO[]): Department[] {
    return dtos.map((dto) => this.mapDTO(dto));
  }

  public mapTreeNodeDTO(dto: DepartmentTreeNodeDTO): DepartmentTreeNode {
    return {
      ...this.mapDTO(dto),
      children: (dto.children ?? []).map((c) => this.mapTreeNodeDTO(c)),
    };
  }

  public mapTreeNodeDTOs(dtos: DepartmentTreeNodeDTO[]): DepartmentTreeNode[] {
    return dtos.map((dto) => this.mapTreeNodeDTO(dto));
  }

  public mapMemberStubDTO(dto: DepartmentMemberStubDTO): DepartmentMember {
    return {
      userId: dto.userId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      avatarUrl: dto.avatarUrl,
      jobTitle: dto.jobTitle,
    };
  }

  public mapMembersPageDTO(dto: DepartmentMembersPageDTO): DepartmentMembersPage {
    return {
      items: (dto.items ?? []).map((m) => this.mapMemberStubDTO(m)),
      total: dto.total,
      page: dto.page,
      size: dto.size,
    };
  }
}

export const departmentMapper = new DepartmentMapper();
