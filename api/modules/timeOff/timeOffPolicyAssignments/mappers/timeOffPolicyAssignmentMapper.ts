import type { TimeOffPolicyAssignmentDTO } from "@/api/modules/timeOff/timeOffPolicyAssignments/dto";
import type { TimeOffPolicyAssignment } from "@/models/timeOff";

export class TimeOffPolicyAssignmentMapper {
  public mapTimeOffPolicyAssignmentDTO(
    dto: TimeOffPolicyAssignmentDTO
  ): TimeOffPolicyAssignment {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
      person: dto.person ?? null,
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