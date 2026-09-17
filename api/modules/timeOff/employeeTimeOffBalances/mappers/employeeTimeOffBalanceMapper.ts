import type { EmployeeTimeOffBalanceDTO } from "@/api/modules/timeOff/employeeTimeOffBalances/dto";
import type { EmployeeTimeOffBalance } from "@/models/timeOff";

export class EmployeeTimeOffBalanceMapper {
  public mapEmployeeTimeOffBalanceDTO(
    dto: EmployeeTimeOffBalanceDTO
  ): EmployeeTimeOffBalance {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
      periodEnd: dto.periodEnd ?? null,
    };
  }

  public mapEmployeeTimeOffBalanceDTOs(
    dtos: EmployeeTimeOffBalanceDTO[]
  ): EmployeeTimeOffBalance[] {
    return dtos.map((dto) => this.mapEmployeeTimeOffBalanceDTO(dto));
  }
}

export const employeeTimeOffBalanceMapper = new EmployeeTimeOffBalanceMapper();
