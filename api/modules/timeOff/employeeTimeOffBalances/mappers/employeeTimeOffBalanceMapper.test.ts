import { employeeTimeOffBalanceMapper } from "@/api/modules/timeOff/employeeTimeOffBalances/mappers";
import type {
  EmployeeTimeOffBalanceDTO,
  EmployeeTimeOffBalanceAdjustmentDTO,
} from "@/api/modules/timeOff/employeeTimeOffBalances/dto";

describe("EmployeeTimeOffBalanceMapper", () => {
  const balanceDto: EmployeeTimeOffBalanceDTO = {
    id: "balance-id",
    assignmentId: "assignment-id",
    policyId: "policy-id",
    userId: "user-id",
    year: 2026,
    openingBalance: 20,
    accruedBalance: 0,
    usedBalance: 5,
    adjustedBalance: -2,
    carriedOverBalance: 3,
    currentBalance: 16,
    createdAt: "2026-01-01T10:00:00",
    updatedAt: "2026-06-01T10:00:00",
  };

  const adjustmentDto: EmployeeTimeOffBalanceAdjustmentDTO = {
    id: "adjustment-id",
    balanceId: "balance-id",
    adjustmentAmount: -2,
    reason: "Correction for unauthorized absence",
    createdAt: "2026-06-01T10:00:00",
    createdBy: "admin-id",
  };

  it("maps employee time off balance dto to model", () => {
    expect(
      employeeTimeOffBalanceMapper.mapEmployeeTimeOffBalanceDTO(balanceDto)
    ).toEqual(balanceDto);
  });

  it("maps employee time off balance dto array to models", () => {
    expect(
      employeeTimeOffBalanceMapper.mapEmployeeTimeOffBalanceDTOs([balanceDto])
    ).toEqual([balanceDto]);
  });

  it("maps employee time off balance adjustment dto to model", () => {
    expect(
      employeeTimeOffBalanceMapper.mapEmployeeTimeOffBalanceAdjustmentDTO(
        adjustmentDto
      )
    ).toEqual(adjustmentDto);
  });

  it("maps employee time off balance adjustment dto array to models", () => {
    expect(
      employeeTimeOffBalanceMapper.mapEmployeeTimeOffBalanceAdjustmentDTOs([
        adjustmentDto,
      ])
    ).toEqual([adjustmentDto]);
  });
});