import type { EmployeeTimeOffBalanceDTO } from "@/api/modules/timeOff/employeeTimeOffBalances/dto";
import type { EmployeeTimeOffBalance } from "@/models/timeOff";

export class EmployeeTimeOffBalanceMapper {
  public mapEmployeeTimeOffBalanceDTO(
    dto: EmployeeTimeOffBalanceDTO
  ): EmployeeTimeOffBalance {
    return {
      id: dto.id,
      assignmentId: dto.assignmentId,
      policyId: dto.policyId,
      userId: dto.userId,
      periodStart: dto.periodStart,
      periodEnd: dto.periodEnd ?? null,
      year: dto.year,
      openingBalance: dto.openingBalance,
      accruedBalance: dto.accruedBalance,
      usedBalance: dto.usedBalance,
      adjustedBalance: dto.adjustedBalance,
      carriedOverBalance: dto.carriedOverBalance,
      currentBalance: dto.currentBalance,
      pendingBalance: dto.pendingBalance,
      remainingCarryover: dto.remainingCarryover,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }

  public mapEmployeeTimeOffBalanceDTOs(
    dtos: EmployeeTimeOffBalanceDTO[]
  ): EmployeeTimeOffBalance[] {
    return dtos.map((dto) => this.mapEmployeeTimeOffBalanceDTO(dto));
  }
}

export const employeeTimeOffBalanceMapper = new EmployeeTimeOffBalanceMapper();
