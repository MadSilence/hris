import type {
  DepartmentDTO,
  DepartmentTreeNodeDTO,
} from "@/api/modules/departments/dto";
import type {
  Department,
  DepartmentTreeNode,
} from "@/models/departments";

export class DepartmentMapper {
  public mapDTO(dto: DepartmentDTO): Department {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.about ?? null,
      code: dto.code,
      parentId: dto.parentId,
      status: dto.status,
      leadId: dto.leadUserId,
      memberCount: dto.membersCount,
      archivedAt: dto.status === "ARCHIVED" ? "" : null,
    };
  }

  public mapDTOs(dtos: DepartmentDTO[]): Department[] {
    return dtos.map((dto) => this.mapDTO(dto));
  }

  public mapTreeNodeDTO(dto: DepartmentTreeNodeDTO): DepartmentTreeNode {
    return {
      ...this.mapDTO(dto),
      directSubNodes: dto.directSubNodes,
      totalPeople: dto.totalPeople,
      totalSubNodes: dto.totalSubNodes,
      lead: dto.lead
        ? {
            id: dto.lead.id,
            firstName: dto.lead.firstName,
            lastName: dto.lead.lastName,
            avatarUrl: dto.lead.avatarUrl,
          }
        : null,
      children: (dto.children ?? []).map((c) => this.mapTreeNodeDTO(c)),
    };
  }

  public mapTreeNodeDTOs(dtos: DepartmentTreeNodeDTO[]): DepartmentTreeNode[] {
    return dtos.map((dto) => this.mapTreeNodeDTO(dto));
  }
}

export const departmentMapper = new DepartmentMapper();
