import { internalApiClient } from "@/components/clients/apiClient";
import { employeeTimeOffBalancesService } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/services/employeeTimeOffBalancesService";

jest.mock("@/components/clients/apiClient", () => ({
  internalApiClient: { get: jest.fn() },
}));

const mockGet = internalApiClient.get as jest.Mock;

describe("EmployeeTimeOffBalancesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("gets balance by id", async () => {
    const response = { id: "balance-id" };
    mockGet.mockResolvedValue(response);

    const result = await employeeTimeOffBalancesService.getById("balance-id");

    expect(mockGet).toHaveBeenCalledWith("/time-off/balances/balance-id");
    expect(result).toEqual(response);
  });

  it("lists balances by user id", async () => {
    const response = [{ id: "balance-id" }];
    mockGet.mockResolvedValue(response);

    const result = await employeeTimeOffBalancesService.listByUserId("user-id");

    expect(mockGet).toHaveBeenCalledWith("/users/user-id/time-off-balances");
    expect(result).toEqual(response);
  });

  it("lists adjustments by balance id", async () => {
    const response = [{ id: "adjustment-id" }];
    mockGet.mockResolvedValue(response);

    const result = await employeeTimeOffBalancesService.listAdjustments("balance-id");

    expect(mockGet).toHaveBeenCalledWith("/time-off/balances/balance-id/adjustments");
    expect(result).toEqual(response);
  });

  it("propagates errors from the api client", async () => {
    mockGet.mockRejectedValue(new Error("boom"));

    await expect(employeeTimeOffBalancesService.getById("balance-id")).rejects.toThrow("boom");
  });
});
