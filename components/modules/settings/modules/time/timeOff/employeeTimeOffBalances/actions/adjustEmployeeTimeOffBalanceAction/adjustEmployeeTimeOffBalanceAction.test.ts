import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisEmployeeTimeOffBalancesService } from "@/api/modules/timeOff/employeeTimeOffBalances/services";
import { adjustEmployeeTimeOffBalanceAction } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/actions/adjustEmployeeTimeOffBalanceAction/adjustEmployeeTimeOffBalanceAction";

jest.mock("@/api/modules/timeOff/employeeTimeOffBalances/services", () => ({
  hrisEmployeeTimeOffBalancesService: { adjust: jest.fn() },
}));

describe("adjustEmployeeTimeOffBalanceAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => { jest.restoreAllMocks(); });

  const submission = { balanceId: "balance-id", userId: "user-id", adjustmentAmount: -2, reason: "Correction" };

  it("adjusts balance", async () => {
    const response = { id: "balance-id" };
    jest.mocked(hrisEmployeeTimeOffBalancesService.adjust).mockResolvedValue(response);

    const result = await adjustEmployeeTimeOffBalanceAction(submission);

    expect(hrisEmployeeTimeOffBalancesService.adjust).toHaveBeenCalledWith("balance-id", { adjustmentAmount: -2, reason: "Correction" });
    expect(result).toEqual({ status: ActionStatus.SUCCESS, data: response });
  });

  it("returns error status when adjust fails", async () => {
    jest.mocked(hrisEmployeeTimeOffBalancesService.adjust).mockRejectedValue(new Error("Failed"));

    const result = await adjustEmployeeTimeOffBalanceAction(submission);

    expect(result.status).toBe(ActionStatus.ERROR);
  });
});
