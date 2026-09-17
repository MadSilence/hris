import type { LeaveTypeDTO } from "@/api/modules/timeOff/leaveTypes/dto";
import { LeaveType } from "@/models/timeOff";

export class LeaveTypeMapper {
  public mapLeaveTypeDTO(dto: LeaveTypeDTO): LeaveType {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,





    };
  }

  public mapLeaveTypeDTOs(dtos: LeaveTypeDTO[]): LeaveType[] {
    return dtos.map((dto) => this.mapLeaveTypeDTO(dto));
  }
}

export const leaveTypeMapper = new LeaveTypeMapper();
