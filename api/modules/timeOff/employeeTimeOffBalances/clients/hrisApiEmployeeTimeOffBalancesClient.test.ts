import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { hrisApiEmployeeTimeOffBalancesClient } from "@/api/modules/timeOff/employeeTimeOffBalances/clients";

jest.mock("@/api/clients/hrisApiClient/hrisApiClient", () => ({
  hrisApiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe("HrisApiEmployeeTimeOffBalancesClient", () => {
  const dto = {
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

  const adjustmentDto = {
    id: "adjustment-id",
    balanceId: "balance-id",
    adjustmentAmount: -2,
    reason: "Correction for unauthorized absence",
    createdAt: "2026-06-01T10:00:00",
    createdBy: "admin-id",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates balance", async () => {
    const response = { id: "balance-id" };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const request = {
      assignmentId: "assignment-id",
      year: 2026,
      openingBalance: 20,
      accruedBalance: 0,
      carriedOverBalance: 3,
      adjustedBalance: 0,
    };

    const result = await hrisApiEmployeeTimeOffBalancesClient.create(request);

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/api/time-off/balances",
      request
    );
    expect(result).toEqual(response);
  });

  it("gets balance by id", async () => {
    jest.mocked(hrisApiClient.get).mockResolvedValue(dto);

    const result =
      await hrisApiEmployeeTimeOffBalancesClient.getById("balance-id");

    expect(hrisApiClient.get).toHaveBeenCalledWith(
      "/api/time-off/balances/balance-id"
    );
    expect(result).toEqual(dto);
  });

  it("lists balances by user id", async () => {
    jest.mocked(hrisApiClient.get).mockResolvedValue([dto]);

    const result =
      await hrisApiEmployeeTimeOffBalancesClient.listByUserId("user-id");

    expect(hrisApiClient.get).toHaveBeenCalledWith(
      "/api/users/user-id/time-off-balances"
    );
    expect(result).toEqual([dto]);
  });

  it("adjusts balance", async () => {
    const response = { id: "balance-id" };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const request = {
      adjustmentAmount: -2,
      reason: "Correction for unauthorized absence",
    };

    const result = await hrisApiEmployeeTimeOffBalancesClient.adjust(
      "balance-id",
      request
    );

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/api/time-off/balances/balance-id/adjust",
      request
    );
    expect(result).toEqual(response);
  });

  it("lists adjustments", async () => {
    jest.mocked(hrisApiClient.get).mockResolvedValue([adjustmentDto]);

    const result =
      await hrisApiEmployeeTimeOffBalancesClient.listAdjustments("balance-id");

    expect(hrisApiClient.get).toHaveBeenCalledWith(
      "/api/time-off/balances/balance-id/adjustments"
    );
    expect(result).toEqual([adjustmentDto]);
  });
});