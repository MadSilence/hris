import type { TimeOffPolicyAssignmentDTO } from "@/api/modules/timeOff/timeOffPolicyAssignments/dto";
import type { TimeOffPolicyAssignment } from "@/models/timeOff";

export class TimeOffPolicyAssignmentMapper {
  public mapTimeOffPolicyAssignmentDTO(
    dto: TimeOffPolicyAssignmentDTO
  ): TimeOffPolicyAssignment {
    return {
      id: dto.id,
      policyId: dto.policyId,
      userId: dto.userId,
      status: dto.status,
      effectiveFrom: dto.effectiveFrom,
      effectiveTo: dto.effectiveTo,
      endedAt: dto.endedAt,
      endedBy: dto.endedBy,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }

  public mapTimeOffPolicyAssignmentDTOs(
    dtos: TimeOffPolicyAssignmentDTO[]
  ): TimeOffPolicyAssignment[] {
    return dtos.map((dto) => this.mapTimeOffPolicyAssignmentDTO(dto));
  }
}

export const timeOffPolicyAssignmentMapper =
  new TimeOffPolicyAssignmentMapper();