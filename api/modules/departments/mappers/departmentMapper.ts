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
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
      description: dto.about ?? null,
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
      // The node's own extras pass through as they come; the department part is mapped the way a
      // flat department is.
      ...dto,
      ...this.mapDTO(dto),
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
