import type { TimeOffRequestDTO } from "@/api/modules/timeOff/timeOffRequests/dto";
import type { TimeOffRequest } from "@/models/timeOff";

export class TimeOffRequestMapper {
  public mapTimeOffRequestDTO(dto: TimeOffRequestDTO): TimeOffRequest {
    return {
      id: dto.id,
      userId: dto.userId,
      policyId: dto.policyId,
      assignmentId: dto.assignmentId,
      balanceId: dto.balanceId,
      status: dto.status,
      startDate: dto.startDate,
      endDate: dto.endDate,
      requestedAmount: dto.requestedAmount,
      reason: dto.reason,
      cancelledAt: dto.cancelledAt,
      cancelledBy: dto.cancelledBy,
      cancellationReason: dto.cancellationReason,
      approvedAt: dto.approvedAt,
      approvedBy: dto.approvedBy,
      rejectedAt: dto.rejectedAt,
      rejectedBy: dto.rejectedBy,
      rejectionReason: dto.rejectionReason,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }

  public mapTimeOffRequestDTOs(dtos: TimeOffRequestDTO[]): TimeOffRequest[] {
    return dtos.map((dto) => this.mapTimeOffRequestDTO(dto));
  }
}

export const timeOffRequestMapper = new TimeOffRequestMapper();