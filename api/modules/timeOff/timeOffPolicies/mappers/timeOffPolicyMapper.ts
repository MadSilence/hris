import type { TimeOffPolicyDTO } from "@/api/modules/timeOff/timeOffPolicies/dto";
import { TimeOffPolicy } from "@/models/timeOff";

export class TimeOffPolicyMapper {
  public mapTimeOffPolicyDTO(dto: TimeOffPolicyDTO): TimeOffPolicy {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,















    };
  }

  public mapTimeOffPolicyDTOs(dtos: TimeOffPolicyDTO[]): TimeOffPolicy[] {
    return dtos.map((dto) => this.mapTimeOffPolicyDTO(dto));
  }
}

export const timeOffPolicyMapper = new TimeOffPolicyMapper();