import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisEmployeeTimeOffBalancesService } from "@/api/modules/timeOff/employeeTimeOffBalances/services";
import { createEmployeeTimeOffBalanceAction } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/actions/createEmployeeTimeOffBalanceAction/createEmployeeTimeOffBalanceAction";

jest.mock("@/api/modules/timeOff/employeeTimeOffBalances/services", () => ({
  hrisEmployeeTimeOffBalancesService: { create: jest.fn() },
}));

describe("createEmployeeTimeOffBalanceAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => { jest.restoreAllMocks(); });

  const submission = { assignmentId: "assignment-id", year: 2026, openingBalance: 20, accruedBalance: 0, carriedOverBalance: 0, adjustedBalance: 0 };

  it("creates balance", async () => {
    const response = { id: "balance-id" };
    jest.mocked(hrisEmployeeTimeOffBalancesService.create).mockResolvedValue(response);

    const result = await createEmployeeTimeOffBalanceAction(submission);

    expect(hrisEmployeeTimeOffBalancesService.create).toHaveBeenCalledWith(submission);
    expect(result).toEqual({ status: ActionStatus.SUCCESS, data: response });
  });

  it("returns error status when create fails", async () => {
    jest.mocked(hrisEmployeeTimeOffBalancesService.create).mockRejectedValue(new Error("Failed"));

    const result = await createEmployeeTimeOffBalanceAction(submission);

    expect(result.status).toBe(ActionStatus.ERROR);
  });
});
