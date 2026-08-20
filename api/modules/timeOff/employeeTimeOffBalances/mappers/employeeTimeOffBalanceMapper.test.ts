import { employeeTimeOffBalanceMapper } from "@/api/modules/timeOff/employeeTimeOffBalances/mappers";
import type { EmployeeTimeOffBalanceDTO } from "@/api/modules/timeOff/employeeTimeOffBalances/dto";

// Adjustments became one kind of balance *transaction* and stopped having a mapper of their own —
// transactions travel as raw DTOs. The two suites that covered the old adjustment mapper went with it.
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
});
