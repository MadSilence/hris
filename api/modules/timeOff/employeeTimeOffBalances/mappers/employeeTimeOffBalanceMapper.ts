import type {
  EmployeeTimeOffBalanceDTO,
  EmployeeTimeOffBalanceAdjustmentDTO,
} from "@/api/modules/timeOff/employeeTimeOffBalances/dto";
import type {
  EmployeeTimeOffBalance,
  EmployeeTimeOffBalanceAdjustment,
} from "@/models/timeOff";

export class EmployeeTimeOffBalanceMapper {
  public mapEmployeeTimeOffBalanceDTO(
    dto: EmployeeTimeOffBalanceDTO
  ): EmployeeTimeOffBalance {
    return {
      id: dto.id,
      assignmentId: dto.assignmentId,
      policyId: dto.policyId,
      userId: dto.userId,
      year: dto.year,
      openingBalance: dto.openingBalance,
      accruedBalance: dto.accruedBalance,
      usedBalance: dto.usedBalance,
      adjustedBalance: dto.adjustedBalance,
      carriedOverBalance: dto.carriedOverBalance,
      currentBalance: dto.currentBalance,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }

  public mapEmployeeTimeOffBalanceDTOs(
    dtos: EmployeeTimeOffBalanceDTO[]
  ): EmployeeTimeOffBalance[] {
    return dtos.map((dto) => this.mapEmployeeTimeOffBalanceDTO(dto));
  }

  public mapEmployeeTimeOffBalanceAdjustmentDTO(
    dto: EmployeeTimeOffBalanceAdjustmentDTO
  ): EmployeeTimeOffBalanceAdjustment {
    return {
      id: dto.id,
      balanceId: dto.balanceId,
      adjustmentAmount: dto.adjustmentAmount,
      reason: dto.reason,
      createdAt: dto.createdAt,
      createdBy: dto.createdBy,
    };
  }

  public mapEmployeeTimeOffBalanceAdjustmentDTOs(
    dtos: EmployeeTimeOffBalanceAdjustmentDTO[]
  ): EmployeeTimeOffBalanceAdjustment[] {
    return dtos.map((dto) =>
      this.mapEmployeeTimeOffBalanceAdjustmentDTO(dto)
    );
  }
}

export const employeeTimeOffBalanceMapper = new EmployeeTimeOffBalanceMapper();