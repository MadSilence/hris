import type { LeaveTypeDTO } from "@/api/modules/timeOff/leaveTypes/dto";
import { LeaveType } from "@/models/timeOff";

export class LeaveTypeMapper {
  public mapLeaveTypeDTO(dto: LeaveTypeDTO): LeaveType {
    return {
      id: dto.id,
      companyId: dto.companyId,

      name: dto.name,
      description: dto.description,
      color: dto.color,
      category: dto.category,

      status: dto.status,

      archivedAt: dto.archivedAt,
      archivedBy: dto.archivedBy,

      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      createdBy: dto.createdBy,
      updatedBy: dto.updatedBy,

      version: dto.version,
    };
  }

  public mapLeaveTypeDTOs(dtos: LeaveTypeDTO[]): LeaveType[] {
    return dtos.map((dto) => this.mapLeaveTypeDTO(dto));
  }
}

export const leaveTypeMapper = new LeaveTypeMapper();
