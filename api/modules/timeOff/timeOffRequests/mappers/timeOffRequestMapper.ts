import type { TimeOffRequestDTO } from "@/api/modules/timeOff/timeOffRequests/dto";
import type { TimeOffRequest } from "@/models/timeOff";

export class TimeOffRequestMapper {
  public mapTimeOffRequestDTO(dto: TimeOffRequestDTO): TimeOffRequest {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
    };
  }

  public mapTimeOffRequestDTOs(dtos: TimeOffRequestDTO[]): TimeOffRequest[] {
    return dtos.map((dto) => this.mapTimeOffRequestDTO(dto));
  }
}

export const timeOffRequestMapper = new TimeOffRequestMapper();